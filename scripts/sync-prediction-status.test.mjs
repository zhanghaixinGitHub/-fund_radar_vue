import assert from 'node:assert/strict'
import test from 'node:test'
import { hasPendingPrediction, syncResultLabel } from '../src/utils/syncResult.ts'

const job = (state, reason, pending = false) => ({ status: 'PARTIAL_SUCCESS', resultSummary: {
  counts: { COMPLETED: 3, WAITING: Number(state === 'WAITING'), UNSUPPORTED: 0, ERROR: Number(state === 'ERROR') },
  items: [{ fundCode: '002112', horizonId: 'T1', state, reason, pending }],
} })

test('异步等待继续查原任务，失败显示重试并停止轮询', () => {
  const running = job('WAITING', '一日预测仍在计算，尚未确认留档', true)
  assert.equal(hasPendingPrediction(running), true)
  assert.equal(syncResultLabel(running), '部分预测仍在生成')
  const failed = job('ERROR', '本次分析未通过内容核验')
  assert.equal(hasPendingPrediction(failed), false)
  assert.equal(syncResultLabel(failed), '部分项目需重试')
})

test('普通资料不足不轮询，旧异步摘要仍可继续查状态', () => {
  const missing = job('WAITING', '所需历史净值存在缺日')
  assert.equal(hasPendingPrediction(missing), false)
  assert.equal(syncResultLabel(missing), '等待资料')
  assert.equal(hasPendingPrediction(job('WAITING', '一日预测仍在计算，尚未确认留档')), true)
})
