import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { Buffer } from 'node:buffer'
import { createRequire, stripTypeScriptTypes } from 'node:module'
import { pathToFileURL, URL } from 'node:url'
import { compileScript, parse } from '@vue/compiler-sfc'
import { createRenderer, h, nextTick } from 'vue'
import ts from 'typescript'

const url = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8')
const vueUrl = pathToFileURL(createRequire(import.meta.url).resolve('vue')).href
const renderer = createRenderer({
  createElement: type => ({
    type, children: [], props: {}, text: '', open: false,
    showModal() { this.open = true },
    close() { this.open = false },
    getBoundingClientRect() { return { left: 1000, right: 1500, top: 0, bottom: 900 } },
  }),
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
const descendants = node => [node, ...(node.children ?? []).flatMap(descendants)]
const textOf = node => `${node.text ?? ''}${(node.children ?? []).map(textOf).join('')}`
const recorded = {
  kind: 'recorded', fundCode: '008888', fundName: '测试基金', shares: '10', frozenShares: '0', availableShares: '8',
  cost: '100', marketValue: '120', holdingGain: '20', holdingGainRate: 0.2, realizedGain: '0', dividendGain: '0',
  receivableDividend: '0', paidDividend: '0', cumulativeGain: '20', dailyGain: null, totalBuy: '100', totalSell: '0',
  unitNav: '1.2', navDate: '2026-11-13', issue: null, yesterdayGain: null, yesterdayDate: '2026-11-15',
}

async function mount(t, position, { canWrite = true, canPlan = true } = {}) {
  const key = `__holdingDrawer${Math.random().toString(16).slice(2)}`
  const { descriptor } = parse(read('../src/components/HoldingManagementDrawer.vue'))
  const script = compileScript(descriptor, { id: key, inlineTemplate: true })
  let code = ts.transpileModule(script.content, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  for (const [from, to] of Object.entries({
    vue: vueUrl,
    '@/utils/workspaceScroll': url(stripTypeScriptTypes(read('../src/utils/workspaceScroll.ts'))),
    '@/utils/simulation': url(stripTypeScriptTypes(read('../src/utils/simulation.ts'))),
    'vue-router': url("export const useRoute = () => ({ path: '/portfolio', fullPath: '/portfolio?section=holdings' })"),
    '@/components/DecisionPanelV2.vue': url(`import { h } from '${vueUrl}'; export default { props: ['fundCode'], setup: props => () => h('div', { class: 'decision-stub' }, '综合建议 ' + props.fundCode) }`),
  })) code = code.replaceAll(`from '${from}'`, `from '${to}'`).replaceAll(`from "${from}"`, `from '${to}'`)
  code = code.replace('dialog.value?.showModal();', `globalThis[${JSON.stringify(key)}] = dialog.value; dialog.value?.showModal();`)
  const component = (await import(url(code))).default
  const trades = []
  let closes = 0
  const root = { children: [] }
  const app = renderer.createApp({ setup: () => () => h(component, {
    position, plan: null, initialReport: null, canWrite, canPlan,
    onTrade: mode => trades.push(mode), onClose: () => { closes++ },
  }) })
  app.component('RouterLink', { setup: (_props, { slots }) => () => h('a', slots.default?.()) })
  app.mount(root)
  t.after(() => { app.unmount(); delete globalThis[key] })
  await nextTick()
  return {
    root, trades, closes: () => closes, text: () => textOf(root),
    buttons: () => descendants(root).filter(node => node.type === 'button'),
    links: () => descendants(root).filter(node => node.type === 'a'),
    dialog: () => descendants(root).find(node => node.type === 'dialog'),
    dialogElement: () => globalThis[key],
  }
}

test('已有持仓的交易、收益和综合建议集中在抽屉，操作只发出原模式', async t => {
  const view = await mount(t, recorded)
  assert.match(view.text(), /持仓操作.*收益与分析.*综合建议 008888/)
  assert.equal(view.dialog().open, true)
  for (const label of ['加仓', '卖出', '设置定投']) {
    const button = view.buttons().find(node => textOf(node).trim() === label)
    await button.props.onClick()
  }
  assert.deepEqual(view.trades, ['BUY', 'SELL', 'PLAN'])
  assert.equal(view.links().length, 2)
})

test('异常净值和权限限制继续禁止对应操作', async t => {
  const limited = await mount(t, { ...recorded, issue: '净值待核验' }, { canWrite: false, canPlan: false })
  assert.deepEqual(limited.buttons().map(node => textOf(node).trim()), ['关闭'])
  assert.match(limited.text(), /净值待核验.*查看收益明细/)
  const disabled = await mount(t, { ...recorded, issue: '净值待核验' })
  assert.equal(disabled.buttons().find(node => textOf(node).trim() === '加仓').props.disabled, true)
  assert.equal(disabled.buttons().find(node => textOf(node).trim() === '卖出').props.disabled, true)
  assert.equal(disabled.trades.length, 0)
})

test('未建档基金只保留完整资料入口，不显示交易或建议', async t => {
  const view = await mount(t, { kind: 'unrecorded', fundCode: '000001', fundName: '仅确认持有', marketValue: null, holdingGain: null, cumulativeGain: null }, { canWrite: true, canPlan: true })
  assert.deepEqual(view.buttons().map(node => textOf(node).trim()), ['关闭'])
  assert.match(view.text(), /暂无模拟持仓数据.*基金资料.*查看完整基金资料/)
  assert.doesNotMatch(view.text(), /持仓操作|综合建议 000001|查看收益明细/)
  assert.equal(view.links().length, 1)
})

test('关闭按钮、Esc和框外点击关闭，框内点击不误关', async t => {
  const view = await mount(t, recorded)
  const dialog = view.dialog()
  dialog.props.onClick({ target: view.dialogElement(), clientX: 1200, clientY: 100 })
  assert.equal(view.closes(), 0)
  dialog.props.onClick({ target: view.dialogElement(), clientX: 900, clientY: 100 })
  assert.equal(view.closes(), 1)
  dialog.props.onCancel({ preventDefault() {} })
  assert.equal(view.closes(), 2)
  await view.buttons()[0].props.onClick()
  assert.equal(view.closes(), 3)
})

test('收益和交易跳转携带原列表，导航点击不抢先清除抽屉状态', async t => {
  const view = await mount(t, recorded)
  for (const link of view.links()) {
    assert.equal(link.props.to.query.from, '/portfolio?section=holdings')
    assert.equal(link.props.onClick, undefined)
  }
  assert.equal(view.closes(), 0)
})
