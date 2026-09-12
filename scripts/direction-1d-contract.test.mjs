import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { URL } from 'node:url'
import { Buffer } from 'node:buffer'
import test from 'node:test'

const code = stripTypeScriptTypes(readFileSync(new URL('../src/utils/direction1d.ts', import.meta.url), 'utf8'))
const { assertDirection1dForecast, direction1dDirection } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
const example = () => ({ schemaVersion: 'DIRECTION_1D_EXPERIMENT_V1', horizonTradingDays: 1, targetDefinition: 'UNIT_NAV_DIRECTION_V1', modelReleased: false, upProbability: null,
  branches: ['FIXED', 'WEEKLY'].map(branchId => ({ branchId, status: 'AVAILABLE', score: .5, predictedDirection: 'NON_UP' })) })

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
