/** 人工协议样本，只验证页面防错与显示格式，不表示真实模型已发布。无需新增测试依赖。 */
import assert from 'node:assert/strict'
import test from 'node:test'
import { assertWatchlistPrediction, displayUpProbability } from '../src/utils/prediction.ts'

const sample = {
  fundCode: '008888', status: 'AVAILABLE', horizonTradingDays: 20,
  upProbability: 0.68, direction: 'UP', latestNavDate: '2026-09-07',
  researchRunId: 'f70feb1a-129d-4482-b66d-f4e2e3a5425c', researchEvaluatedAt: null,
  modelVersion: 'CASH_FORECAST_STORAGE_V1',
  forecastId: 'ff8f2cbd-696b-42f8-91db-4937bf571574', modelHash: 'a'.repeat(64),
  cutoffDate: '2026-09-08', targetBaseDate: '2026-09-08', targetEndDate: '2026-10-14',
  generatedAt: '2026-09-09T02:00:00Z', reasonCodes: [], reasons: [],
  message: '人工协议样本', disclaimer: '不是实际模型发布证明',
}

test('完整已保存结果可显示，格式化不修改原概率', () => {
  assert.doesNotThrow(() => assertWatchlistPrediction(sample, '008888'))
  assert.equal(displayUpProbability(sample.upProbability), '68.0%')
  assert.equal(sample.upProbability, 0.68)
})

for (const update of [
  { fundCode: '001632' }, { status: 'UNKNOWN' }, { horizonTradingDays: 21 },
  { modelVersion: 'CASH_RESEARCH_PROTOCOL_V1' }, { forecastId: null }, { modelHash: 'fake' },
  { upProbability: null }, { upProbability: '0.68' }, { upProbability: NaN },
  { upProbability: 1.01 }, { upProbability: -0.1 }, { direction: 'NON_UP' },
  { cutoffDate: null }, { targetEndDate: '2026-09-08' }, { targetBaseDate: '2026-09-09' },
  { targetEndDate: '2026-02-30' }, { generatedAt: 'bad-date' },
  { reasonCodes: ['BLOCKED'], reasons: ['不能使用'] },
]) {
  test(`非法字段拒绝展示：${JSON.stringify(update)}`, () => {
    assert.throws(() => assertWatchlistPrediction({ ...sample, ...update }, '008888'))
  })
}

for (const status of ['STALE', 'MODEL_NOT_RELEASED', 'DATA_INSUFFICIENT', 'NOT_APPLICABLE', 'UNAVAILABLE']) {
  test(`${status}只接受空概率，保留原日期`, () => {
    const value = { ...sample, status, reasonCodes: ['BLOCKED'], reasons: ['暂不可用'] }
    assert.throws(() => assertWatchlistPrediction(value, '008888'))
    const hidden = { ...value, upProbability: null, direction: null }
    assert.doesNotThrow(() => assertWatchlistPrediction(hidden, '008888'))
    assert.equal(hidden.targetEndDate, sample.targetEndDate)
  })
}

for (const probability of [0, 0.5, 1]) {
  test(`概率边界${probability}与方向一致`, () => {
    assert.doesNotThrow(() => assertWatchlistPrediction({
      ...sample, upProbability: probability, direction: probability > 0.5 ? 'UP' : 'NON_UP',
    }, '008888'))
  })
}
