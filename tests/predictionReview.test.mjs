import test from 'node:test'
import assert from 'node:assert/strict'
import { assertPredictionReview, createReviewRequestGuard, isSupplementaryReview, reviewDateRange, reviewDirection, reviewHorizons, reviewTitle } from '../src/utils/predictionReview.ts'

const period = (overrides = {}) => ({
  horizonId: 'T1', decision: 'UP', kind: 'RETROSPECTIVE', confidence: 'LOW',
  baseNavDate: '2026-11-11', startDate: '2026-11-12', endDate: '2026-11-12', nominalEndDate: null,
  analysisAt: '2026-11-12T16:08:00+08:00', summary: '经营支撑略占优势。',
  primaryReason: '经营改善。', counterReason: '仍有回吐压力。', conditions: ['经营转弱时重新判断。'],
  limitations: ['把握较低。'], awaitingReason: null, ...overrides,
})

test('开始日收盘后形成的补充判断不冒充事前预测，也不混淆半年和一日复盘', () => {
  assert.equal(isSupplementaryReview(period({ kind: 'DATED_ANALYSIS', analysisAt: '2026-11-12T14:59:00+08:00' })), false)
  assert.equal(isSupplementaryReview(period({ kind: 'DATED_ANALYSIS', analysisAt: '2026-11-12T15:00:00+08:00' })), true)
  assert.equal(isSupplementaryReview(period({ kind: 'DATED_ANALYSIS' })), true)
  assert.equal(isSupplementaryReview(period()), false)
  assert.equal(isSupplementaryReview(period({ kind: 'CONDITIONAL_OUTLOOK' })), false)
})

test('已结束的一日保留原日期，标题和方向明确为复盘，不改成新的明日窗口', () => {
  const old = period()
  assert.equal(reviewTitle('T1', old), '一日复盘')
  assert.equal(reviewDirection(old), '当时弱偏上')
  assert.equal(reviewDateRange(old), '2026-11-12 至 2026-11-12')
  assert.deepEqual([old.startDate, old.endDate], ['2026-11-12', '2026-11-12'])
})

test('半年名义到期日不会成为已确认终点，仍保留条件弱方向', () => {
  const half = period({ horizonId: 'M6_V1', kind: 'CONDITIONAL_OUTLOOK', endDate: null, nominalEndDate: '2027-05-11' })
  assert.equal(reviewDirection(half), '条件弱偏上')
  assert.match(reviewDateRange(half), /终点待核/)
  assert.match(reviewDateRange(half), /名义到期 2027-05-11/)
  assert.doesNotMatch(reviewDateRange(half), /至 2027-05-11/)
})

test('暂不判断不能兜底为看跌，没有结果也不冒充已有预测', () => {
  assert.equal(reviewDirection(period({ decision: 'ABSTAIN' })), '暂不判断')
  assert.equal(reviewDirection(undefined), '分析待更新')
  assert.equal(reviewDateRange(undefined), '尚无可用分析')
  assert.equal(reviewHorizons.length, 4)
  assert.doesNotThrow(() => assertPredictionReview(null, '006730'))
})

test('串基金、重复周期、旧方向和无低把握标记的响应不能进入正式卡片', () => {
  const snapshot = { fundCode: '006730', periods: [period()] }
  assert.doesNotThrow(() => assertPredictionReview(snapshot, '006730'))
  assert.throws(() => assertPredictionReview(snapshot, '007832'))
  assert.throws(() => assertPredictionReview({ ...snapshot, periods: [period(), period()] }, '006730'))
  for (const overrides of [{ decision: 'NON_UP' }, { horizonId: 'DAY' }, { confidence: 'HIGH' }, { kind: 'OLD_RESULT' }]) {
    assert.throws(() => assertPredictionReview({ ...snapshot, periods: [period(overrides)] }, '006730'))
  }
})

test('先发请求后返回时，旧基金和同基金旧请求都不能盖掉最新内容', async () => {
  const guard = createReviewRequestGuard()
  let finishOld
  const oldResponse = new Promise(resolve => { finishOld = resolve })
  const first = guard.begin('006730')
  let displayed = null
  const pending = oldResponse.then(value => { if (guard.current(first, '007832')) displayed = value })
  const second = guard.begin('007832')
  if (guard.current(second, '007832')) displayed = '新基金结果'
  finishOld('旧基金结果')
  await pending
  assert.equal(displayed, '新基金结果')
  const latest = guard.begin('007832')
  assert.equal(guard.current(second, '007832'), false)
  assert.equal(guard.current(latest, '007832'), true)
  guard.invalidate()
  assert.equal(guard.current(latest, '007832'), false)
})
