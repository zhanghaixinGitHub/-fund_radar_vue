import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { Buffer } from 'node:buffer'
import { URL } from 'node:url'
import { effectScope, ref } from 'vue'
import { usePredictionHistory } from '../src/composables/usePredictionHistory.ts'

const source = file => stripTypeScriptTypes(readFileSync(new URL(file, import.meta.url), 'utf8'))
const moduleUrl = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
const historySource = source('../src/utils/predictionHistory.ts')
  .replace("'./direction1d'", JSON.stringify(moduleUrl(source('../src/utils/direction1d.ts'))))
  .replace("'./predictionDirection'", JSON.stringify(moduleUrl(source('../src/utils/predictionDirection.ts'))))
const { groupPredictionHistory, historyItemView, historyReturnText, historyPeriods } = await import(moduleUrl(historySource))

const multiRow = (id, date, generatedAt, horizonId = 'T5_V1', direction = 'UP') => ({ payload: {
  predictionId: id, fundCode: '008888', startDate: date, generatedAt, horizonId, direction,
  endDate: '2026-10-08', dataAsOf: '2026-09-23', flatThreshold: '.003',
  targetDefinitionId: 'NAV_ANCHORED_CASH_REINVESTED_THREE_STATE_V3',
}, outcomes: [] })
const dailyRow = (id, date, generatedAt, directions = ['UP', 'UP']) => ({ forecastId: id, receiptStatus: 'VERIFIED', outcomes: [], forecast: {
  fundCode: '008888', targetNavDate: date, baseNavDate: '2026-09-23', generatedAt,
  schemaVersion: 'DIRECTION_1D_EXPERIMENT_V2',
  branches: ['FIXED', 'WEEKLY'].map((branchId, i) => ({ branchId, status: 'AVAILABLE', predictedDirection: directions[i] })),
} })

test('三次规则生成的同日起始预测只留最新，每日保留四个周期固定位置', () => {
  const rows = ['T5_V1', 'T20_V1', 'M6_V1'].flatMap(period => [
    multiRow(`${period}-v1`, '2026-09-24', '2026-09-23T15:24:00+08:00', period),
    multiRow(`${period}-v3`, '2026-09-24', '2026-09-24T14:02:00+08:00', period),
    multiRow(`${period}-v2`, '2026-09-24', '2026-09-23T17:19:00+08:00', period),
  ])
  const before = JSON.stringify(rows)
  const daily = dailyRow('one', '2026-09-24', '2026-09-24T14:03:00+08:00')
  const [day] = groupPredictionHistory('008888', rows, [daily])
  assert.equal(day.date, '2026-09-24')
  assert.equal(Object.keys(day.items).length, 4)
  assert.deepEqual(historyPeriods.map(period => day.items[period.id].id), ['one', 'T5_V1-v3', 'T20_V1-v3', 'M6_V1-v3'])
  assert.equal(JSON.stringify(rows), before)
})

test('按起始日及一日目标日归组，不能混用生成日期，也不拿别天预测补空位', () => {
  const days = groupPredictionHistory('008888', [multiRow('old', '2026-09-23', '2026-09-22T10:00:00Z')],
    [dailyRow('new', '2026-09-24', '2026-09-23T10:00:00Z')])
  assert.deepEqual(days.map(day => day.date), ['2026-09-24', '2026-09-23'])
  assert.equal(days[0].items.T5_V1, undefined)
  assert.equal(days[1].items.T1_V1, undefined)
})

test('跨时区按真实时刻选最新，跨页同日一日记录也去重', () => {
  const days = groupPredictionHistory('008888', [], [
    dailyRow('later', '2026-09-24', '2026-09-24T07:00:00Z'),
    dailyRow('earlier', '2026-09-24', '2026-09-24T14:02:00+08:00'),
  ])
  assert.equal(days[0].items.T1_V1.id, 'later')
})

test('不展示其他基金或失效的一日原文，不把后台错误伪装成预测', () => {
  const other = dailyRow('other', '2026-09-24', '2026-09-24T07:00:00Z')
  other.forecast.fundCode = '000001'
  assert.deepEqual(groupPredictionHistory('008888', [], [other, { forecastId: 'bad', status: 'EVIDENCE_CORRUPTED' }]), [])
})

const dailyView = row => historyItemView(groupPredictionHistory('008888', [], [row])[0].items.T1_V1)
test('一日上涨持平下跌分别展示；存在分歧或未确认提前保存时不计对错', () => {
  for (const [direction, label] of [['UP', '上涨'], ['FLAT', '持平'], ['DOWN', '下跌']]) {
    const row = dailyRow('one', '2026-09-24', '2026-09-24T07:00:00Z', [direction, direction])
    row.outcomes = [{ actualDirection: direction, y: direction === 'UP' ? 1 : 0, navReturn: '.001' }]
    assert.equal(dailyView(row).direction, label)
    assert.equal(dailyView(row).result, '方向相符')
    row.receiptStatus = null
    assert.equal(dailyView(row).result, '暂不计对错')
  }
  const disagreement = dailyRow('one', '2026-09-24', '2026-09-24T07:00:00Z', ['UP', 'DOWN'])
  disagreement.outcomes = [{ actualDirection: 'UP', y: 1, navReturn: '.01' }]
  assert.equal(dailyView(disagreement).direction, '方向不明确')
  assert.equal(dailyView(disagreement).result, '暂不计对错')
})

test('较长周期取最新核对结果，零、缺失、极小涨跌不混淆', () => {
  const row = multiRow('one', '2026-09-24', '2026-09-24T07:00:00Z')
  row.outcomes = [{ correct: false, totalReturn: '-.02', actualDirection: 'DOWN' }, { correct: true, totalReturn: '.01', actualDirection: 'UP' }]
  const view = historyItemView(groupPredictionHistory('008888', [row], [])[0].items.T5_V1)
  assert.equal(view.result, '方向相符')
  assert.equal(view.actual, '+1.00%')
  assert.equal(historyReturnText(null), '暂缺')
  assert.equal(historyReturnText(''), '暂缺')
  assert.equal(historyReturnText('0'), '0.00%')
  assert.equal(historyReturnText('-.00001'), '下跌不足 0.01%')
})

const settle = async () => { for (let i = 0; i < 12; i++) await Promise.resolve() }
const page = (items = [], extra = {}) => ({ items, totalCount: items.length, page: 1, pageSize: 20, ...extra })
const deferred = () => { let resolve; const promise = new Promise(yes => { resolve = yes }); return { promise, resolve } }
function setup(t, readers) {
  const fund = ref('008888'), scope = effectScope()
  const model = scope.run(() => usePredictionHistory(() => fund.value, readers))
  t.after(() => scope.stop())
  return { fund, model, scope }
}

test('多周期翻页用原响应最后一条游标，去重和重新分组不影响游标', async t => {
  const rows = Array.from({ length: 30 }, (_, i) => multiRow(`id-${i}`, '2026-09-24', `2026-09-${String(24 - Math.floor(i / 3)).padStart(2, '0')}T07:00:00Z`))
  const calls = []
  const { model } = setup(t, { daily: async () => page(), multi: async (...args) => {
    calls.push(args); return { items: calls.length === 1 ? rows : [] }
  } })
  await settle(); await model.load()
  assert.deepEqual(calls[1], ['008888', { generatedAt: rows[29].payload.generatedAt, predictionId: 'id-29' }])
  assert.equal(model.hasMore.value, false)
})

test('一日末尾日期跨页时先标明尚未完整，读齐后按生成时刻选最新', async t => {
  const cursor = { beforeDate: '2026-09-24', beforeId: 'boundary' }, calls = []
  const old = Array.from({ length: 20 }, (_, i) => dailyRow(`old-${i}`, '2026-09-24', '2026-09-23T10:00:00Z'))
  const newest = dailyRow('latest', '2026-09-24', '2026-09-24T06:00:00Z')
  const { model } = setup(t, { multi: async () => ({ items: [] }), daily: async (...args) => {
    calls.push(args)
    return page(args[1] === 1 ? old : [newest], { totalCount: 21, nextCursor: cursor })
  } })
  await settle()
  assert.equal(model.dailyDateComplete('2026-09-24'), false)
  await model.load()
  assert.deepEqual(calls[1], ['008888', 2, cursor])
  assert.equal(model.dailyDateComplete('2026-09-24'), true)
  assert.equal(groupPredictionHistory('008888', [], model.daily.value)[0].items.T1_V1.id, 'latest')
})

test('一路失败只重试该路，另一类历史保留且不重复翻页', async t => {
  let multiReads = 0, dailyReads = 0
  const { model } = setup(t, {
    multi: async () => { multiReads++; return { items: [multiRow('one', '2026-09-24', '2026-09-24T06:00:00Z')] } },
    daily: async () => { if (++dailyReads === 1) throw new Error('offline'); return page() },
  })
  await settle()
  assert.ok(model.errors.value.daily)
  assert.equal(model.multi.value.length, 1)
  await model.load('daily')
  assert.equal(multiReads, 1)
  assert.equal(dailyReads, 2)
  assert.equal(model.errors.value.daily, '')
})

test('换基金或卸载后，旧请求不能回填记录、错误或加载状态', async t => {
  const pending = deferred()
  const { model, fund, scope } = setup(t, {
    multi: async code => code === '008888' ? pending.promise : { items: [] }, daily: async () => page(),
  })
  fund.value = '000001'
  await settle()
  pending.resolve({ items: [multiRow('old', '2026-09-24', '2026-09-24T06:00:00Z')] })
  await settle()
  assert.deepEqual(model.multi.value, [])
  assert.equal(model.busy.value, false)
  fund.value = '008888'
  scope.stop()
  await settle()
  assert.deepEqual(model.multi.value, [])
})
