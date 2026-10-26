import test from 'node:test'
import assert from 'node:assert/strict'
import { managerReturnPath, managerFundTarget, managerRate } from '../src/utils/fundManagerNavigation.ts'

test('返回路径拒绝站外、伪造前缀和过长参数，保留本站必要筛选', () => {
  for (const value of ['https://evil.example', '//evil.example', '/fund-managers-evil', '/admin', '/funds/../../admin']) {
    assert.equal(managerReturnPath(value), '/fund-managers')
  }
  assert.equal(managerReturnPath('/funds/002112?section=manager&keyword=abc&unsafe=bad'), '/funds/002112?keyword=abc&section=manager')
  assert.equal(managerReturnPath('x'.repeat(4000)), '/fund-managers')
})
test('关联份额未纳入原市场时仍有合法基础详情，原市场基金保持原入口', () => {
  assert.equal(managerFundTarget('id', { relatedFundId: 'fund', mappedFundCode: null }, '/fund-managers').name, 'manager-related-fund')
  const target = managerFundTarget('id', { relatedFundId: 'fund', mappedFundCode: '002112' }, '/fund-managers')
  assert.equal(target.name, 'fund-detail')
  assert.equal(target.params.fundCode, '002112')
})
test('缺项不显示零，比例只转成百分比一次', () => {
  for (const value of [null, undefined, '', 'NaN', Infinity]) assert.equal(managerRate(value), '暂缺')
  assert.equal(managerRate('0.1234'), '12.34%')
  assert.equal(managerRate(0), '0.00%')
  assert.equal(managerRate('-0.05'), '-5.00%')
})
