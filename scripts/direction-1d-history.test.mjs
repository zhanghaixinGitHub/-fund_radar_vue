import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { Buffer } from 'node:buffer'
import { URL } from 'node:url'
import { effectScope, ref } from 'vue'
import { useDirection1dFundHistory } from '../src/composables/useDirection1dFundHistory.ts'

const code = stripTypeScriptTypes(readFileSync(new URL('../src/utils/direction1d.ts', import.meta.url), 'utf8'))
const { assertDirection1dFundHistory, direction1dConclusion } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
const settle = async () => { for (let i = 0; i < 8; i++) await Promise.resolve() }
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no }); return { promise, resolve, reject } }
const response = (items = [], extra = {}) => ({ items, totalCount: items.length, page: 1, pageSize: 20, ...extra })
const record = (fundCode = '005284') => ({ forecastId: 'forecast', receiptStatus: 'VERIFIED', outcomes: [], forecast: {
  fundCode, schemaVersion: 'DIRECTION_1D_EXPERIMENT_V1', horizonTradingDays: 1, targetDefinition: 'UNIT_NAV_DIRECTION_V1', modelReleased: false, upProbability: null,
  branches: ['FIXED', 'WEEKLY'].map(branchId => ({ branchId, status: 'AVAILABLE', score: .5, predictedDirection: 'NON_UP' })),
} })
function setup(t, read) {
  const fund = ref('005284'), scope = effectScope()
  const model = scope.run(() => useDirection1dFundHistory(() => fund.value, read))
  t.after(() => scope.stop())
  return { fund, model, scope }
}

test('翻页始终携带当前基金和对应游标，刷新从第一页重新读取', async (t) => {
  const calls = [], cursor = { beforeDate: '2026-09-14', beforeId: 'last' }
  const { model } = setup(t, async (...args) => {
    calls.push(args)
    return response([record()], { totalCount: 21, page: args[1], nextCursor: cursor })
  })
  await settle(); await model.next(); await model.previous(); await model.refresh()
  assert.deepEqual(calls, [['005284', 1, undefined], ['005284', 2, cursor], ['005284', 1, undefined], ['005284', 1, undefined]])
})

test('切换基金立即清空旧历史和游标，旧基金晚返回不覆盖新基金', async (t) => {
  const pending = deferred(), calls = []
  const { model, fund } = setup(t, async (...args) => { calls.push(args); return args[0] === '005284' ? pending.promise : response([record('001632')]) })
  fund.value = '001632'
  assert.equal(model.history.value, null)
  await settle()
  pending.resolve(response([record()]))
  await settle()
  assert.equal(model.history.value.items[0].forecast.fundCode, '001632')
  assert.equal(model.page.value, 1)
  assert.deepEqual(calls[1], ['001632', 1, undefined])
})

test('空基金代码不发请求，也不退回全部基金；空结果保持空态', async (t) => {
  const calls = []
  const { model, fund } = setup(t, async code => { calls.push(code); return response() })
  await settle()
  assert.deepEqual(model.history.value.items, [])
  assert.equal(model.canNext.value, false)
  fund.value = ''
  await settle()
  assert.deepEqual(calls, ['005284'])
  assert.match(model.error.value, /基金代码无效/)
  assert.equal(model.history.value, null)
})

test('读取失败后只重试本基金；离开页面后忽略晚返回的请求', async (t) => {
  const pending = deferred(); let reads = 0
  const { model, scope } = setup(t, async code => {
    assert.equal(code, '005284')
    if (++reads === 1) throw new Error('服务离线')
    return pending.promise
  })
  await settle()
  assert.equal(model.error.value, '服务离线')
  const retry = model.retry()
  scope.stop(); pending.resolve(response([record()]))
  await retry
  assert.equal(reads, 2)
  assert.equal(model.history.value, null)
})

test('拒绝混入其他基金和错误预测版本，原文损坏仅保留错误状态', () => {
  assertDirection1dFundHistory('005284', [record()])
  assert.throws(() => assertDirection1dFundHistory('', []), /基金代码无效/)
  assert.throws(() => assertDirection1dFundHistory('005284', [record('001632')]), /当前基金不一致/)
  const invalid = record(); invalid.forecast.horizonTradingDays = 20
  assert.throws(() => assertDirection1dFundHistory('005284', [invalid]), /契约/)
  assertDirection1dFundHistory('005284', [{ forecastId: 'broken', status: 'EVIDENCE_CORRUPTED' }])
})

test('未公布不计对错；下跌和持平归非上涨；不可用分支与未确认预测不计成绩', () => {
  const item = record()
  assert.equal(direction1dConclusion(item, 'FIXED'), '等待结果')
  item.outcomes = [{ actualDirection: 'FLAT', y: 0 }]
  assert.equal(direction1dConclusion(item, 'FIXED'), '正确')
  item.outcomes = [{ actualDirection: 'DOWN', y: 0 }]
  assert.equal(direction1dConclusion(item, 'FIXED'), '正确')
  item.outcomes = [{ actualDirection: 'UP', y: 1 }]
  assert.equal(direction1dConclusion(item, 'FIXED'), '错误')
  item.forecast.branches[1] = { branchId: 'WEEKLY', status: 'MODEL_UNAVAILABLE', predictedDirection: null, score: null }
  assert.equal(direction1dConclusion(item, 'WEEKLY'), '暂无有效预测')
  item.receiptStatus = 'LATE_ARCHIVE'
  assert.equal(direction1dConclusion(item, 'FIXED'), '未满足提前预测条件')
  item.receiptStatus = 'VERIFIED'; item.outcomes = [{ actualDirection: 'UP', y: 0 }]
  assert.equal(direction1dConclusion(item, 'FIXED'), '实际结果待核验')
})
