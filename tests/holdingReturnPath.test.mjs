import test from 'node:test'
import assert from 'node:assert/strict'
import { portfolioReturnPath } from '../src/utils/advice.ts'
import { earningsReturnPath } from '../src/utils/simulationEarnings.ts'
import { workspaceScrollKey } from '../src/utils/workspaceScroll.ts'

test('收益和依据的返回路径保留基金抽屉、筛选、排序和分页', () => {
  const path = '/portfolio?section=holdings&page=2&size=20&sort=cumulativeGain&keyword=C&showHistory=1&holding=007832'
  for (const read of [portfolioReturnPath, earningsReturnPath]) {
    assert.equal(workspaceScrollKey(read(path)), workspaceScrollKey(path))
  }
})
test('返回地址拒绝站外跳转、不合法基金和未知参数', () => {
  for (const read of [portfolioReturnPath, earningsReturnPath]) {
    assert.equal(read('https://example.com/portfolio'), '/portfolio?section=holdings')
    assert.equal(read('//example.com/portfolio'), '/portfolio?section=holdings')
    const result = read('/portfolio?section=holdings&holding=bad&sort=bad&token=secret')
    assert.equal(result, '/portfolio?section=holdings')
  }
})
