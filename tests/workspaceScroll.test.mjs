import test from 'node:test'
import assert from 'node:assert/strict'
import { isWorkspaceLocalTabTransition, isWorkspaceReturn, restoreWorkspaceScroll, workspaceScrollKey } from '../src/utils/workspaceScroll.ts'

test('返回目录时等待异步列表撑开高度，不能在加载状态提前完成', () => {
  const area = { scrollTop: 0, scrollHeight: 400, clientHeight: 400 }
  let retry
  let disconnected = false
  restoreWorkspaceScroll(area, 780, notify => {
    retry = notify
    return () => { disconnected = true }
  })
  assert.equal(area.scrollTop, 0)
  assert.equal(disconnected, false)
  area.scrollHeight = 800
  retry()
  assert.equal(area.scrollTop, 400)
  assert.equal(disconnected, false)
  area.scrollHeight = 1400
  retry()
  assert.equal(area.scrollTop, 780)
  assert.equal(disconnected, true)
})

test('用户开始滚动或离开页面后，迟到的数据不能重新拉回原位置', () => {
  const area = { scrollTop: 0, scrollHeight: 400, clientHeight: 400 }
  let retry
  const cancel = restoreWorkspaceScroll(area, 780, notify => { retry = notify; return () => {} })
  cancel()
  area.scrollHeight = 1400
  area.scrollTop = 150
  retry()
  assert.equal(area.scrollTop, 150)
})

test('返回链接参数顺序或目录快照变化仍定位同一页，不混淆筛选和页码', () => {
  assert.equal(
    workspaceScrollKey('/fund-managers?page=3&size=10&keyword=崔&snapshotId=old'),
    workspaceScrollKey('/fund-managers?keyword=崔&size=10&page=3&snapshotId=new'),
  )
  assert.notEqual(workspaceScrollKey('/fund-managers?page=3'), workspaceScrollKey('/fund-managers?page=2'))
  assert.notEqual(workspaceScrollKey('/funds?heldOnly=false'), workspaceScrollKey('/funds'))
})

test('首次进入页面立即回到顶部，不等待观察也不影响后续滚动', () => {
  const area = { scrollTop: 300, scrollHeight: 1400, clientHeight: 400 }
  restoreWorkspaceScroll(area, 0, () => { throw new Error('不应注册观察器') })
  assert.equal(area.scrollTop, 0)
})

test('详情返回原列表才恢复，模块与栏目切换不恢复', () => {
  assert.equal(isWorkspaceReturn('/fund-managers?page=3&size=10', '/fund-managers?size=10&page=3'), true)
  assert.equal(isWorkspaceReturn(undefined, '/fund-managers?page=3'), false)
  assert.equal(isWorkspaceReturn('/fund-managers?page=3', '/watchlist'), false)
  assert.equal(isWorkspaceReturn('/fund-managers?page=3', '/fund-managers?page=2'), false)
  assert.equal(isWorkspaceReturn('/funds', '/funds/001021?section=nav'), false)
})

test('从详情点击左侧同模块菜单也置顶，不能误当成返回按钮', () => {
  assert.equal(isWorkspaceReturn('/funds', '/funds', true), false)
  assert.equal(isWorkspaceReturn('/funds', '/funds', false), true)
  assert.equal(isWorkspaceReturn('//other.example/funds', '/funds'), false)
})

test('同页仅持仓构成页签变化时保留滚动，其他路由变化仍按原规则', () => {
  assert.equal(isWorkspaceLocalTabTransition(
    '/portfolio?section=overview&composition=assets',
    '/portfolio?composition=industries&section=overview',
  ), true)
  assert.equal(isWorkspaceLocalTabTransition(
    '/portfolio?section=overview&composition=industries',
    '/portfolio?section=overview&composition=themes',
  ), true)
  assert.equal(isWorkspaceLocalTabTransition(
    '/portfolio?section=overview&composition=industries',
    '/portfolio?section=holdings&composition=themes',
  ), false)
  assert.equal(isWorkspaceLocalTabTransition(
    '/portfolio?section=overview&composition=industries',
    '/portfolio?section=overview&composition=industries',
  ), false)
  assert.equal(isWorkspaceLocalTabTransition(
    '/portfolio?section=overview&composition=industries',
    '/watchlist?section=overview&composition=themes',
  ), false)
})
