import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { Buffer } from 'node:buffer'
import { URL } from 'node:url'

const source = stripTypeScriptTypes(readFileSync(new URL('../src/utils/predictionEvidence.ts', import.meta.url), 'utf8'))
const { multiPredictionEvidence, dailyPredictionEvidence } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
const baseline = (momentum = .0253, direction = 'UP') => ({
  fundCode: '008888', dataAsOf: '2026-09-23', direction,
  featureSnapshot: { fundCode: '008888', dataAsOf: '2026-09-23', features: { momentum, actualLookbackReturns: 20 } },
  modelManifest: { adapter: 'NAV_MOMENTUM_THREE_STATE_V2', parameters: { momentumThreshold: '.01' } },
})

test('依据使用保存的回看涨跌和判断门槛，不把到期持平带当作模型门槛', () => {
  const p = { ...baseline(), flatThreshold: '.003' }
  const evidence = multiPredictionEvidence(p)
  assert.match(evidence.summary, /20 个交易日累计上涨 2.53%/)
  assert.match(evidence.summary, /上涨趋势可能延续/)
  assert.doesNotMatch(evidence.summary, /0.30%/)
  assert.match(evidence.limitations[0], /只参考这段历史涨跌/)
  assert.equal(multiPredictionEvidence({ ...p, direction: 'FLAT', flatThreshold: '.03' }).facts.length, 0)
})

test('半年下跌使用本条的60日窗口；正负边界均解释为持平', () => {
  const p = baseline(-.281195589, 'DOWN')
  p.featureSnapshot.features.actualLookbackReturns = 60
  p.modelManifest.parameters.momentumThreshold = '.02'
  assert.match(multiPredictionEvidence(p).summary, /60 个交易日累计下跌 28.12%/)
  for (const momentum of [-.01, 0, .01]) assert.match(multiPredictionEvidence(baseline(momentum, 'FLAT')).summary, /基本持平/)
})

test('缺输入、错基金、错日期、非有限数字和原结论不一致都不能编造归因', () => {
  const cases = [baseline(.01, 'UP'), baseline(Number.NaN), baseline()]
  cases[2].featureSnapshot.fundCode = '000001'
  const stale = baseline(); stale.featureSnapshot.dataAsOf = '2026-09-22'; cases.push(stale)
  const missing = baseline(); delete missing.featureSnapshot; cases.push(missing)
  for (const p of cases) {
    const result = multiPredictionEvidence(p)
    assert.equal(result.facts.length, 0)
    assert.equal(result.supporting.length, 0)
    assert.match(result.summary, /无法|不一致/)
  }
})

const keys = ['return_5d', 'return_20d', 'return_60d', 'volatility_20d', 'max_drawdown_60d', 'relative_position_60d', 'consecutive_decline_days']
const learned = () => ({ ...baseline(),
  featureSnapshot: { fundCode: '008888', dataAsOf: '2026-09-23', features: Object.fromEntries(keys.map((key, i) => [key, i < 2 ? 1 : 0])) },
  modelManifest: { adapter: 'LOGISTIC_MULTICLASS_V2', features: keys, directionPolicySnapshot: { tieBreakOrder: ['FLAT', 'UP', 'DOWN'] },
    parameters: { classes: ['DOWN', 'FLAT', 'UP'], mean: Array(7).fill(0), scale: Array(7).fill(1), intercepts: [0, 0, 0],
      coefficients: [Array(7).fill(0), Array(7).fill(0), [2, -1, 0, 0, 0, 0, 0]] } },
})

test('学习模型按实际参数核对获胜类别，并同时保留支持与反对作用', () => {
  const p = learned(), e = multiPredictionEvidence(p)
  assert.match(e.summary, /上涨.*强于.*基本持平/)
  assert.match(e.supporting[0], /近 5 个交易日.*支持/)
  assert.match(e.opposing[0], /近 20 个交易日.*削弱/)
  p.direction = 'DOWN'
  assert.equal(multiPredictionEvidence(p).supporting.length, 0)
  assert.match(multiPredictionEvidence(p).summary, /不一致/)
})

test('并列遵守保存的规则，缺规则和非法标准差不输出指标影响', () => {
  const p = learned(); p.modelManifest.parameters.coefficients[2] = Array(7).fill(0); p.direction = 'FLAT'
  assert.match(multiPredictionEvidence(p).summary, /基本持平/)
  p.modelManifest.parameters.scale[0] = 0
  assert.equal(multiPredictionEvidence(p).facts.length, 0)
  delete p.modelManifest.directionPolicySnapshot
  assert.equal(multiPredictionEvidence(p).supporting.length, 0)
})

test('旧一日仍保留分歧和原二分类，不把历史涨跌冒充指标贡献', () => {
  const p = { baseNavDate: '2026-09-23', branches: [
    { status: 'AVAILABLE', score: .7, predictedDirection: 'UP' },
    { status: 'AVAILABLE', score: .4, predictedDirection: 'NON_UP' },
  ], input: { values: [] } }
  const e = dailyPredictionEvidence(p)
  assert.match(e.summary, /不一致/)
  assert.ok(e.limitations.some(text => text.includes('具体影响暂不可用')))
  assert.ok(e.limitations.some(text => text.includes('下跌与持平合并')))
  assert.equal(e.facts.length, 0)
})

test('一日解释核对原文身份，两个分支引用同一模型时不重复计算依据', () => {
  const p = { fundCode: '008888', inputHash: 'input', baseNavDate: '2026-09-23', targetNavDate: '2026-09-24',
    branches: ['FIXED','WEEKLY'].map(branchId => ({ branchId, modelId: 'same', modelHash: 'same', status: 'AVAILABLE', score: .7, predictedDirection: 'UP' })), input: { values: [] } }
  const restored = { fundCode: p.fundCode, inputHash: p.inputHash, baseNavDate: p.baseNavDate, targetNavDate: p.targetNavDate,
    branches: p.branches.map(b => ({ ...b, direction: 'UP', intercept: -.2, factors: keys.map((feature, i) => ({ feature, value: .1, contribution: i === 0 ? 2 : i === 1 ? -1 : 0 })) })) }
  const result = dailyPredictionEvidence(p, restored)
  assert.equal(result.supporting.length, 1)
  assert.equal(result.opposing.length, 1)
  assert.doesNotMatch(JSON.stringify(result), /同一个模型|历史训练/)
  restored.inputHash = 'another'
  assert.match(dailyPredictionEvidence(p, restored).summary, /不一致/)
})

test('三分类一日下跌依据以另一类别作比较，不沿用二分类的负号翻转', () => {
  const forecast = { schemaVersion: 'DIRECTION_1D_EXPERIMENT_V2', fundCode: '008888', inputHash: 'input', baseNavDate: '2026-09-23', targetNavDate: '2026-09-24',
    branches: ['FIXED','WEEKLY'].map(branchId => ({ branchId, modelId: 'id', modelHash: 'hash', status: 'AVAILABLE', score: .6, predictedDirection: 'DOWN' })) }
  const restored = { fundCode: forecast.fundCode, inputHash: forecast.inputHash, baseNavDate: forecast.baseNavDate, targetNavDate: forecast.targetNavDate,
    branches: forecast.branches.map(b => ({ ...b, direction: 'DOWN', referenceDirection: 'FLAT', intercept: 0,
      factors: keys.map((feature, i) => ({ feature, value: -.1, contribution: i === 0 ? 2 : i === 1 ? -1 : 0 })) })) }
  const result = dailyPredictionEvidence(forecast, restored)
  assert.match(result.supporting[0], /支持“下跌”相对于“持平”/)
  assert.match(result.opposing[0], /削弱“下跌”/)
  assert.ok(result.limitations.some(text => text.includes('相等算持平')))
  assert.ok(result.limitations.every(text => !text.includes('未分别预测')))
  delete restored.branches[0].referenceDirection
  assert.match(dailyPredictionEvidence(forecast, restored).summary, /不一致/)
})
