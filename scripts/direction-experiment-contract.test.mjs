import assert from 'node:assert/strict'
import test from 'node:test'
import { assertDirectionExperiment } from '../src/utils/directionExperiment.ts'

const sample = {
  fundCode: '008888', version: 'DIRECTION_PAGE_TRIAL_V1', status: 'EXPERIMENTAL', modelReleased: false,
  horizonTradingDays: 20, researchRunId: '0c0e06a9-725e-4b68-b813-de6ff5124b29',
  cutoffDate: '2026-09-09', latestNavDate: '2026-09-08', targetBaseDate: '2026-09-09', targetEndDate: '2026-10-15',
  readAt: '2026-09-10T08:00:00Z', inputHash: 'a'.repeat(64), sourceRevisionId: '0c0e06a9-725e-4b68-b813-de6ff5124b29',
  models: [
    { branch: 'DROP_60D_GROUP_L2', score: .6, direction: 'UP', fitEnd: '2024-03-31', modelHash: 'b08efdc7bc8fc04833d0c3d6ed1edcbd7c3caff080e4787db837cef04f17660f' },
    { branch: 'REFERENCE', score: .4, direction: 'NON_UP', fitEnd: '2024-03-31', modelHash: '0146d0ff0ac0504d23a428c0f607d16636e457110ac67c6e60d1b7b7dea19789' },
  ], reasonCodes: [], message: '人工契约样本',
}

test('实验方向允许分歧但没有正式概率', () => assert.doesNotThrow(() => assertDirectionExperiment(sample, '008888')))
for (const update of [
  { fundCode: '001632' }, { modelReleased: true }, { status: 'AVAILABLE' }, { version: 'CASH_FORECAST_STORAGE_V1' },
  { cutoffDate: '2026-02-30' }, { targetEndDate: '2026-09-09' }, { latestNavDate: '2026-09-09' },
  { inputHash: null }, { sourceRevisionId: null }, { models: [] }, { readAt: 'bad' },
  ...[null, '0.6', NaN, Infinity, 1.01, -0.1].map(score => ({ models: [{ ...sample.models[0], score }, sample.models[1]] })),
  { models: [{ ...sample.models[0], direction: 'NON_UP' }, sample.models[1]] },
  { models: [...sample.models].reverse() },
]) {
  test(`拒绝错误实验数据 ${JSON.stringify(update)}`, () => assert.throws(() => assertDirectionExperiment({ ...sample, ...update }, '008888')))
}
for (const status of ['DATA_INSUFFICIENT', 'NOT_APPLICABLE', 'UNAVAILABLE']) {
  test(`${status}禁止携带实验分数`, () => {
    assert.throws(() => assertDirectionExperiment({ ...sample, status }, '008888'))
    assert.doesNotThrow(() => assertDirectionExperiment({ ...sample, status, models: [], reasonCodes: ['BLOCKED'] }, '008888'))
  })
}
