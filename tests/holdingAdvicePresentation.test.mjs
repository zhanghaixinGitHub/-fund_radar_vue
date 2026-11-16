import test from 'node:test'
import assert from 'node:assert/strict'
import { holdingKeyEvidence, holdingQualityRows, holdingImportantLimits } from '../src/utils/holdingAdvicePresentation.ts'

test('同向周期提取主要依据和反证，不用已结束一日或半年展望充当当前理由', () => {
  const report = { timingAssessment: '五日与二十日都有下行依据。', periodAssessments: [
    { horizonId: 'T1', kind: 'RETROSPECTIVE', decision: 'DOWN', summary: '已结束一日不可用' },
    { horizonId: 'M6_V1', kind: 'CONDITIONAL_OUTLOOK', decision: 'UP', summary: '条件展望不可投票' },
    { horizonId: 'T20_V1', kind: 'DATED_ANALYSIS', decision: 'DOWN', summary: '中期价格承压。后续完整正文。', counterReason: '仍有防御需求。不能视为确定下跌。' },
  ] }
  const original = JSON.stringify(report)
  assert.deepEqual(holdingKeyEvidence(report), [
    { title: '综合取舍', text: '五日与二十日都有下行依据。' },
    { title: '二十日依据', text: '中期价格承压。' },
    { title: '反对因素与取舍', text: '仍有防御需求。' },
  ])
  assert.equal(JSON.stringify(report), original)
})
test('长摘录明确省略，分项内的分号与原文信息保留', () => {
  const report = { timingAssessment: '这是已保存的分析说明'.repeat(30), periodAssessments: [] }
  const value = holdingKeyEvidence(report)[0].text
  assert.ok(value.length <= 91)
  assert.ok(value.endsWith('…'))
  assert.deepEqual(holdingQualityRows('收益能力：收益为负；但相对基准仍有优势。；风险控制：有回撤风险。'), [
    { title: '收益能力', text: '收益为负；但相对基准仍有优势。' },
    { title: '风险控制', text: '有回撤风险。' },
  ])
})
test('重要限制不截断，费用短句只在已保存的对应缺项存在时出现', () => {
  const base = { executionConstraints: ['其他情况。', '存在冻结份额，已计入限制。'], opposingEvidence: [] }
  assert.deepEqual(holdingImportantLimits(base), ['存在冻结份额，已计入限制。'])
  base.executionConstraints.push('未核齐本次申赎开放状态及逐笔费用。')
  assert.match(holdingImportantLimits(base).at(-1), /尚未核齐.*不提供精确买卖数量/)
})
