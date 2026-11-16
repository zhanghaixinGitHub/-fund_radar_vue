import test from 'node:test'
import assert from 'node:assert/strict'
import { createRenderer, h } from 'vue'
import { useConfirmation } from '../src/composables/useConfirmation.ts'

function mount() {
  let confirmation
  const renderer = createRenderer({
    createElement: () => ({ children: [] }),
    insert: (child, parent) => parent.children.push(child),
    remove: () => {}, patchProp: () => {}, setElementText: () => {},
    createText: () => ({}), createComment: () => ({}), setText: () => {},
    parentNode: () => null, nextSibling: () => null,
  })
  const app = renderer.createApp({ setup() {
    confirmation = useConfirmation()
    return () => h('div')
  } })
  app.mount({ children: [] })
  return { ...confirmation, unmount: () => app.unmount() }
}

test('管理操作必须明确确认；关闭或取消不会授权写入', async () => {
  const ui = mount()
  const cancelled = ui.confirmAction('停用指定账户')
  ui.resolveConfirmation(false)
  assert.equal(await cancelled, false)
  const accepted = ui.confirmAction('调整指定角色')
  ui.resolveConfirmation(true)
  assert.equal(await accepted, true)
  assert.equal(ui.confirmation.value, '')
  ui.unmount()
})

test('重复点击不能覆盖正在等待的确认对象', async () => {
  const ui = mount()
  const first = ui.confirmAction('账户甲')
  assert.equal(await ui.confirmAction('账户乙'), false)
  assert.equal(ui.confirmation.value, '账户甲')
  ui.resolveConfirmation(false)
  assert.equal(await first, false)
  ui.unmount()
})

test('离开页面取消待确认操作，迟到确认不能重新授权', async () => {
  const ui = mount()
  const result = ui.confirmAction('发放积分')
  ui.unmount()
  assert.equal(await result, false)
  ui.resolveConfirmation(true)
  assert.equal(ui.confirmation.value, '')
})
