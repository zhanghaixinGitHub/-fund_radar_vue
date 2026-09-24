import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { URL } from 'node:url'
import { Buffer } from 'node:buffer'
import test from 'node:test'

const code = stripTypeScriptTypes(readFileSync(new URL('../src/utils/direction1d.ts', import.meta.url), 'utf8'))
const { assertDirection1dForecast, direction1dDirection, direction1dSummary, direction1dConclusion } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
const example = () => ({ schemaVersion: 'DIRECTION_1D_EXPERIMENT_V1', horizonTradingDays: 1, targetDefinition: 'UNIT_NAV_DIRECTION_V1', modelReleased: false, upProbability: null,
  branches: ['FIXED', 'WEEKLY'].map(branchId => ({ branchId, status: 'AVAILABLE', score: .5, predictedDirection: 'NON_UP' })) })

const ternary = direction => ({ ...example(), schemaVersion: 'DIRECTION_1D_EXPERIMENT_V2', targetDefinition: 'UNIT_NAV_DIRECTION_THREE_STATE_V2', directionPolicy: 'EXACT_UNIT_NAV_CHANGE_V1',
  branches: ['FIXED', 'WEEKLY'].map(branchId => ({ branchId, status: 'AVAILABLE', score: .6, predictedDirection: direction,
    classScores: Object.fromEntries(['DOWN', 'FLAT', 'UP'].map(key => [key, key === direction ? .6 : .2])) })) })

test('新一日分别展示上涨持平下跌，按三个方向精确核对，旧档仍保留二分类', () => {
  for (const [direction, label] of [['UP', '上涨'], ['FLAT', '持平'], ['DOWN', '下跌']]) {
    const forecast = ternary(direction)
    assertDirection1dForecast(forecast)
    assert.equal(direction1dSummary(forecast).direction, label)
    for (const actualDirection of ['UP', 'FLAT', 'DOWN']) {
      const record = { forecast, receiptStatus: 'VERIFIED', outcomes: [{ actualDirection, y: actualDirection === 'UP' ? 1 : 0 }] }
      assert.equal(direction1dConclusion(record, 'FIXED'), direction === actualDirection ? '正确' : '错误')
    }
  }
  assert.equal(direction1dConclusion({ forecast: example(), receiptStatus: 'VERIFIED', outcomes: [{ actualDirection: 'FLAT', y: 0 }] }, 'FIXED'), '正确')
})

test('新一日拒绝旧分数改名、缺类和错误并列结论', () => {
  const p = ternary('FLAT')
  delete p.branches[0].classScores
  assert.throws(() => assertDirection1dForecast(p))
  const tied = ternary('FLAT')
  for (const b of tied.branches) { b.score = .45; b.classScores = { DOWN: .1, FLAT: .45, UP: .45 } }
  assertDirection1dForecast(tied)
  tied.branches[0].predictedDirection = 'UP'
  assert.throws(() => assertDirection1dForecast(tied))
})

test('持平与0.5边界归为非上涨，允许未校准实验', () => {
  assertDirection1dForecast(example())
  assert.equal(direction1dDirection('FLAT'), '持平')
  assert.equal(direction1dDirection(null), '暂无方向')
})
test('拒绝20日、正式概率和错误分支身份', () => {
  for (const patch of [{ horizonTradingDays: 20 }, { upProbability: .8 }, { modelReleased: true }, { branches: [example().branches[0], example().branches[0]] }]) {
    assert.throws(() => assertDirection1dForecast({ ...example(), ...patch }))
  }
})
test('不可用分支不显示分数；任一分支不可用仍保留另一分支', () => {
  const value = example()
  value.branches[1] = { branchId: 'WEEKLY', status: 'MODEL_UNAVAILABLE', score: null, predictedDirection: null }
  assertDirection1dForecast(value)
  value.branches[1].score = .9
  assert.throws(() => assertDirection1dForecast(value))
  value.branches[1] = { branchId: 'WEEKLY', status: 'AVAILABLE', score: Number.NaN, predictedDirection: 'UP' }
  assert.throws(() => assertDirection1dForecast(value))
})

test('统一展示方向时保留持平含义，模型分歧不能被合并为上涨或下跌', () => {
  const value = example()
  assert.equal(direction1dSummary(value).direction, '下跌或持平')
  value.branches[0] = { branchId: 'FIXED', status: 'AVAILABLE', score: .8, predictedDirection: 'UP' }
  assert.equal(direction1dSummary(value).direction, '方向不明确')
  assert.equal(direction1dSummary(value).tone, 'neutral')
  value.branches[1] = { ...value.branches[0], branchId: 'WEEKLY' }
  assert.equal(direction1dSummary(value).direction, '上涨')
})

test('仅一个分支可用时如实说明，两个都不可用时不展示方向或历史依据', () => {
  const value = example()
  value.branches[1] = { branchId: 'WEEKLY', status: 'MODEL_UNAVAILABLE', predictedDirection: null, score: null }
  assert.equal(direction1dSummary(value).direction, '下跌或持平')
  assert.match(direction1dSummary(value).evidence, /仅一个模型可用/)
  value.branches[0] = { ...value.branches[1], branchId: 'FIXED' }
  assert.equal(direction1dSummary(value).direction, '暂无预测')
  assert.equal(direction1dSummary(value).history, '')
})

// 固定一份输入快照核对5/20交易日窗口，避免把条数和间隔搞混，或用当日数据解释旧预测。
const withInput = () => ({ ...example(), baseNavDate: '2026-09-11', input: { values: Array.from({ length: 61 }, (_, i) => ({
  navDate: new Date(Date.UTC(2026, 8, 11 - (60 - i))).toISOString().slice(0, 10),
  unitNav: String(i === 55 ? 100 : i === 40 ? 120 : 110),
})) } })

test('依据使用预测快照的期初和期末单位净值，保留真实截止日期', () => {
  const value = withInput()
  assert.equal(direction1dSummary(value).history, '净值截至 2026-09-11：近5个交易日上涨10.00%，近20个交易日下跌8.33%。')
  value.input.values[55].unitNav = '110'
  assert.match(direction1dSummary(value).history, /近5个交易日持平/)
  value.input.values[55].unitNav = '110.00001'
  assert.match(direction1dSummary(value).history, /下跌不足0.01%/)
})

test('输入缺失、零净值、乱序或截止日期错位时不编造涨跌依据', () => {
  const changes = [
    value => { delete value.input },
    value => { value.input.values.pop() },
    value => { value.input.values[60].unitNav = '0' },
    value => { value.input.values[20].unitNav = 'NaN' },
    value => { value.input.values.reverse() },
    value => { value.baseNavDate = '2026-09-14' },
  ]
  for (const change of changes) {
    const value = withInput(); change(value)
    assert.equal(direction1dSummary(value).history, '本次预测的净值明细暂不可用。')
  }
})
