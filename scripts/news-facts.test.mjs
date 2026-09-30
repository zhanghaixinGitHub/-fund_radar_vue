import assert from 'node:assert/strict'
import test from 'node:test'
import { holdingContext, newsHeading, readingPoints } from '../src/utils/newsFacts.ts'

test('旧套话、待复核事项不冒充正文要点，正文按行展示并去重', () => {
  assert.deepEqual(readingPoints({ stage: '已披露文件', summary: '公司已披露该文件，需结合原文进一步核实。' }), [])
  assert.deepEqual(readingPoints({ stage: '此前已披露，本次待复核', summary: '金额100万元' }), [])
  assert.deepEqual(readingPoints({ stage: '已披露文件', summary: '不超过100万元\n尚待批准\n不超过100万元' }), ['不超过100万元', '尚待批准'])
})

test('持仓说明保留两种日期、分母和非当前仓位边界', () => {
  assert.equal(holdingContext('沪电股份（002463）见基金截至 2026-06-30 的披露持仓，报告于 2026-08-31 公开，占基金净资产 4.64%；不代表当前实际仓位'),
    '持仓截至 2026-06-30 · 占基金净资产 4.64% · 2026-08-31 披露，不代表当前仓位')
  assert.equal(holdingContext('本基金无可用持仓资料'), '本基金无可用持仓资料')
})

test('只去除重复公司前缀，年份、草案和修订保留', () => {
  assert.deepEqual(newsHeading('生益电子：生益电子关于增资的公告'), { company: '生益电子', subject: '关于增资的公告' })
  assert.deepEqual(newsHeading('2026年激励计划（草案）（修订稿）'), { company: '', subject: '2026年激励计划（草案）（修订稿）' })
})
