import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { Buffer } from 'node:buffer'
import { URL } from 'node:url'
import { compileScript, parse } from '@vue/compiler-sfc'
import ts from 'typescript'
import { createRenderer, h, nextTick } from 'vue'

const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8')
const transpile = source => ts.transpileModule(source, { compilerOptions: {
  target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext,
} }).outputText
const dependencies = {
  vue: import.meta.resolve('vue'),
  '@/components/ListPagination.vue': moduleUrl('export default {}'),
  '@/components/PredictionHistoryDrawer.vue': moduleUrl(`import { h } from '${import.meta.resolve('vue')}'
    export default { props: ['title'], emits: ['close'], setup(props, { slots, emit }) {
      return () => h('aside', { class: 'history-drawer' }, [
        h('h2', {}, props.title), slots.default?.(),
        h('button', { type: 'button', onClick: () => emit('close') }, '关闭'),
      ])
    } }`),
  '@/utils/pagination': moduleUrl(transpile(read('../src/utils/pagination.ts'))),
  '@/api/http': moduleUrl(`export class ApiRequestError extends Error {}
    export const get = (...args) => globalThis.fundingHarness.get(...args)
    export const post = (...args) => globalThis.fundingHarness.post(...args)`),
  '@/stores/auth': moduleUrl('export const useAuthStore = () => ({ hasPermission: () => true })'),
  '@/utils/uuid': moduleUrl('export const createUUID = () => "00000000-0000-4000-8000-000000000000"'),
  '@/utils/direction1d': moduleUrl('export const direction1dTime = value => value'),
}
const { descriptor } = parse(read('../src/components/AccountFundingPanel.vue'))
const compile = inlineTemplate => transpile(compileScript(descriptor, { id: 'account-funding-test', inlineTemplate }).content)
  .replace(/from ['"]([^'"]+)['"]/g, (_, name) => {
    assert.ok(dependencies[name], `未替换的组件依赖：${name}`)
    return `from '${dependencies[name]}'`
  })
const { default: Panel } = await import(moduleUrl(compile(false)))
const { default: RenderedPanel } = await import(moduleUrl(compile(true)))
const settle = async () => { for (let i = 0; i < 8; i++) { await Promise.resolve(); await nextTick() } }
const textOf = node => `${node.text ?? ''}${(node.children ?? []).map(textOf).join('')}`
const descendants = node => [node, ...(node.children ?? []).flatMap(descendants)]
class TestDocument { activeElement = null }
globalThis.Document = TestDocument
const documentRoot = new TestDocument()
const renderer = createRenderer({
  createElement: type => ({ type, children: [], props: {}, text: '', value: '', addEventListener() {}, removeEventListener() {}, getRootNode: () => documentRoot }),
  createText: text => ({ text }), createComment: () => ({ text: '' }),
  setText: (node, text) => { node.text = text },
  setElementText: (node, text) => { node.text = text; node.children = [] },
  patchProp: (node, key, _old, value) => { node.props[key] = value },
  insert(node, parent, anchor) {
    if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1)
    node.parent = parent
    const index = anchor ? parent.children.indexOf(anchor) : -1
    parent.children.splice(index < 0 ? parent.children.length : index, 0, node)
  },
  remove(node) { if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1); node.parent = null },
  parentNode: node => node.parent,
  nextSibling: node => node.parent?.children[node.parent.children.indexOf(node) + 1] ?? null,
})

function mount(t, rendered = false, input = null) {
  const view = input => ({
    preferenceId: 'saved', scope: 'SIMULATED', revision: 1, status: 'ACTIVE', input,
    confirmedAt: '2026-11-20T06:39:56Z',
  })
  const requests = []
  const current = input === null ? null : view(input)
  globalThis.fundingHarness = {
    value: { scope: 'SIMULATED', current, history: current ? [current] : [], hasMore: false },
    async get() { return this.value },
    async post(url, body) {
      requests.push({ url, body })
      this.value = { scope: 'SIMULATED', current: view(body.input), history: [view(body.input)], hasMore: false }
      return this.value.current
    },
  }
  let state
  const root = { children: [] }
  const app = rendered
    ? renderer.createApp({ render: () => h(RenderedPanel) })
    : renderer.createApp({ setup(_props, context) {
      state = Panel.setup({}, context)
      return () => null
    } })
  app.mount(root)
  t.after(() => { app.unmount(); delete globalThis.fundingHarness })
  return { state, requests, nodes: () => descendants(root), text: () => textOf(root) }
}

test('数字输入框中的零会明确保存并在重新读取后显示', async t => {
  const { state, requests } = mount(t)
  await settle()
  state.form.value = {
    purpose: '', useDate: '', requiredAmount: 0, willingLossPct: 0,
    affordableLossAmount: 0, reviewIntervalDays: '',
  }
  await state.submit()
  assert.equal(requests.length, 1)
  assert.deepEqual(requests[0].body.input, {
    purpose: null, useDate: null, requiredAmount: '0', willingLossPct: '0',
    affordableLossAmount: '0', reviewIntervalDays: null,
  })
  assert.equal(state.form.value.requiredAmount, '0')
  assert.equal(state.form.value.willingLossPct, '0')
  assert.equal(state.form.value.affordableLossAmount, '0')
})

test('确认历史在右侧栏打开和关闭，不再原地展开', async t => {
  const view = mount(t, true)
  await settle()
  assert.equal(view.nodes().some(node => node.type === 'aside'), false)
  const trigger = view.nodes().find(node => node.type === 'button' && textOf(node).trim() === '查看确认历史')
  const save = view.nodes().find(node => node.type === 'button' && textOf(node).trim() === '确认保存')
  assert.ok(trigger)
  assert.ok(save)
  assert.equal(trigger.parent, save.parent)
  trigger.props.onClick()
  await settle()
  assert.equal(view.nodes().some(node => node.type === 'aside' && node.props.class?.split(' ').includes('history-drawer')), true)
  assert.match(view.text(), /资金安排确认历史\s*尚无确认记录/)
  const close = view.nodes().find(node => node.type === 'button' && textOf(node).trim() === '关闭')
  assert.ok(close)
  close.props.onClick()
  await settle()
  assert.equal(view.nodes().some(node => node.type === 'aside'), false)
})

test('六个输入框都能单独清空，零值也显示清空按钮', async t => {
  const view = mount(t, true, {
    purpose: '备用', useDate: '2027-01-01', requiredAmount: '0', willingLossPct: '0',
    affordableLossAmount: '5000', reviewIntervalDays: 365,
  })
  await settle()
  const labels = ['清空资金用途', '清空预计用款日期', '清空预计需要金额',
    '清空愿意接受的损失比例', '清空可承担的损失金额', '清空定期复查间隔']
  for (const label of labels) {
    const button = view.nodes().find(node => node.type === 'button' && node.props['aria-label'] === label)
    assert.ok(button, label)
    button.props.onClick()
    await settle()
  }
  assert.deepEqual(view.nodes().filter(node => node.type === 'input').map(node => node.value), ['', '', '', '', '', ''])
  assert.equal(view.nodes().some(node => node.props?.class === 'input-clear'), false)
})
