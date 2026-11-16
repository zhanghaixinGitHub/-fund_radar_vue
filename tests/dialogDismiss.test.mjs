import test from 'node:test'
import assert from 'node:assert/strict'
import { dismissDialogOnOutsideClick } from '../src/utils/dialogDismiss.ts'

function dialogEnvironment(t) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'HTMLDialogElement')
  class FakeDialog {
    open = true
    requests = 0
    closes = 0
    cancels = 0
    allowClose = true
    getBoundingClientRect() { return { left: 400, right: 1000, top: 100, bottom: 700 } }
    requestClose() { this.requests++ }
    close() { this.closes++ }
    dispatchEvent() { this.cancels++; return this.allowClose }
  }
  Object.defineProperty(globalThis, 'HTMLDialogElement', { configurable: true, writable: true, value: FakeDialog })
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'HTMLDialogElement', previous)
    else delete globalThis.HTMLDialogElement
  })
  return FakeDialog
}

function click(target, clientX, clientY) {
  return {
    target, clientX, clientY, prevented: 0, stopped: 0,
    preventDefault() { this.prevented++ },
    stopImmediatePropagation() { this.stopped++ },
  }
}

test('框内点击不关闭，也不阻止原操作', t => {
  const FakeDialog = dialogEnvironment(t)
  const dialog = new FakeDialog()
  const event = click(dialog, 500, 200)
  assert.equal(dismissDialogOnOutsideClick(event), false)
  assert.equal(dialog.requests, 0)
  assert.equal(event.stopped, 0)
})

test('框外点击复用Esc关闭流程，并阻止底层点击', t => {
  const FakeDialog = dialogEnvironment(t)
  const dialog = new FakeDialog()
  const event = click(dialog, 100, 200)
  assert.equal(dismissDialogOnOutsideClick(event), true)
  assert.equal(dialog.requests, 1)
  assert.equal(event.prevented, 1)
  assert.equal(event.stopped, 1)
})

test('原有取消逻辑拒绝关闭时不强制关闭', t => {
  const FakeDialog = dialogEnvironment(t)
  const dialog = new FakeDialog()
  dialog.requestClose = undefined
  dialog.allowClose = false
  assert.equal(dismissDialogOnOutsideClick(click(dialog, 100, 200)), true)
  assert.equal(dialog.cancels, 1)
  assert.equal(dialog.closes, 0)
})

test('旧浏览器没有requestClose时允许正常关闭', t => {
  const FakeDialog = dialogEnvironment(t)
  const dialog = new FakeDialog()
  dialog.requestClose = undefined
  assert.equal(dismissDialogOnOutsideClick(click(dialog, 1100, 200)), true)
  assert.equal(dialog.cancels, 1)
  assert.equal(dialog.closes, 1)
})

test('普通页面元素不触发布局外的弹窗关闭', t => {
  dialogEnvironment(t)
  const event = click({}, 100, 200)
  assert.equal(dismissDialogOnOutsideClick(event), false)
  assert.equal(event.stopped, 0)
})
