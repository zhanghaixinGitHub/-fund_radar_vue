import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { Buffer } from 'node:buffer'
import { createRequire, stripTypeScriptTypes } from 'node:module'
import { pathToFileURL, URL } from 'node:url'
import { compileScript, parse } from '@vue/compiler-sfc'
import { createRenderer, h, nextTick } from 'vue'
import ts from 'typescript'

globalThis.Document ??= class {}
globalThis.ShadowRoot ??= class {}
const url = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8')
const vue = pathToFileURL(createRequire(import.meta.url).resolve('vue')).href
const settle = async () => { for (let i = 0; i < 12; i++) { await Promise.resolve(); await nextTick() } }
const renderer = createRenderer({
  createElement: type => ({ type, children: [], props: {}, text: '',
    addEventListener() {}, removeEventListener() {}, getRootNode() { return { activeElement: null } },
    get options() { return this.children.filter(node => node.type === 'option') },
    get value() { return this.props.value }, set value(value) { this.props.value = value } }),
  createText: text => ({ text }), createComment: () => ({ text: '' }),
  setText: (node, text) => { node.text = text }, setElementText: (node, text) => { node.text = text; node.children = [] },
  patchProp: (node, key, _old, value) => { node.props[key] = value },
  insert(node, parent, anchor) {
    if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1)
    node.parent = parent
    const index = anchor ? parent.children.indexOf(anchor) : -1
    parent.children.splice(index < 0 ? parent.children.length : index, 0, node)
  },
  remove(node) { if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1); node.parent = null },
  parentNode: node => node.parent, nextSibling: node => node.parent?.children[node.parent.children.indexOf(node) + 1] ?? null,
})
const nodes = node => [node, ...(node.children ?? []).flatMap(nodes)]
const textOf = node => `${node.text ?? ''}${(node.children ?? []).map(textOf).join('')}`
const tier = {
  tier: 'BALANCED', takeProfitPct: '0.0980', reduceDrawdownPct: '-0.1040',
  reduceTrigger: { triggerCount: 12, medianFurtherDecline: '-0.0210', medianRecoveryDays: '15', censoredCount: 0 },
  takeProfitTrigger: { triggerCount: 8, medianFurtherDecline: null, medianRecoveryDays: null, censoredCount: 1 },
}

async function mount(t, options = {}) {
  const calls = { confirm: [], revoke: [], generate: [] }
  const key = `__holdingReminder${Math.random().toString(16).slice(2)}`
  globalThis[key] = {
    fetchRuleDraft: async () => options.draft ?? { status: 'AVAILABLE', tiers: [tier], historyDays: 500, windowCount: 400, statsCutoffDate: '2026-11-17' },
    fetchHoldingRules: async () => ({ active: options.active ?? null, history: [] }),
    getSimOverview: async () => ({ positions: [{ fundCode: '008888', shares: '10', issue: null }] }),
    confirmHoldingRule: async (fund, request) => {
      calls.confirm.push({ fund, request })
      return { active: { ruleId: 'r1', tier: 'CUSTOM', ...request, ruleParams: { downsideBasis: request.downsideBasis }, confirmedAt: '2026-11-18T01:00:00Z' }, history: [] }
    },
    revokeHoldingRule: async () => { calls.revoke.push(); return { active: null, history: [] } },
    generateRuleDraft: async () => { calls.generate.push(); return { status: 'AVAILABLE', tiers: [tier] } },
  }
  const { descriptor } = parse(read('../src/components/HoldingReminderPanel.vue'))
  const script = compileScript(descriptor, { id: key, inlineTemplate: true })
  let code = ts.transpileModule(script.content, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  for (const [from, to] of Object.entries({
    vue,
    '@/api/advice': url(`export const {fetchRuleDraft,fetchHoldingRules,confirmHoldingRule,revokeHoldingRule,generateRuleDraft}=globalThis[${JSON.stringify(key)}]`),
    '@/api/simulation': url(`export const {getSimOverview}=globalThis[${JSON.stringify(key)}]`),
    '@/components/PredictionHistoryDrawer.vue': url(`import {h} from '${vue}';export default {props:['title'],setup:(props,{slots,emit})=>()=>h('dialog',{open:true},[h('h2',{},props.title),slots.default?.(),slots.footer?.(),h('button',{onClick:()=>emit('close')},'关闭')])}`),
    '@/utils/advice': url(stripTypeScriptTypes(read('../src/utils/advice.ts'))),
    '@/utils/simulation': url(stripTypeScriptTypes(read('../src/utils/simulation.ts'))),
  })) code = code.replaceAll(`from '${from}'`, `from '${to}'`).replaceAll(`from "${from}"`, `from '${to}'`)
  const component = (await import(url(code))).default
  const root = { children: [] }
  const app = renderer.createApp({ setup: () => () => h(component, { fundCode: '008888', canWrite: true }) })
  t.after(() => { app.unmount(); delete globalThis[key] })
  app.mount(root); await settle()
  return {
    calls, root, text: () => textOf(root), nodes: () => nodes(root),
    set: async (id, value) => { nodes(root).find(node => node.props?.id === id).props['onUpdate:modelValue'](value); await settle() },
    click: async label => { nodes(root).find(node => node.type === 'button' && (textOf(node).includes(label) || node.props?.['aria-label'] === label)).props.onClick(); await settle() },
    submit: async () => { nodes(root).find(node => node.type === 'form').props.onSubmit({ preventDefault() {} }); await settle() },
  }
}

test('系统参考只填入表单，用户核对后才保存自定义提醒', async t => {
  const view = await mount(t)
  assert.match(view.text(), /止盈提醒.*持仓亏损提醒.*高点回撤提醒/)
  assert.equal(view.nodes().some(node => node.type === 'input'), false)
  await view.click('设置止盈提醒')
  await view.click('填入参考值')
  assert.equal(view.calls.confirm.length, 0)
  assert.equal(view.nodes().find(node => node.props?.id === 'holding-profit-reminder').props.value, '9.8')
  assert.match(view.text(), /尚未保存/)
  await view.set('holding-profit-reminder', '15')
  assert.equal(view.nodes().some(node => node.props?.id === 'holding-downside-reminder'), false)
  assert.equal(view.nodes().some(node => node.props?.id === 'holding-downside-basis'), false)
  await view.submit()
  assert.deepEqual(view.calls.confirm, [{ fund: '008888', request: {
    tier: 'CUSTOM', takeProfitPct: '0.1500',
  } }])
  assert.match(view.text(), /提醒已保存.*不会自动交易/)
})

test('没有系统参考也能保存自己的设置，非法数值不提交', async t => {
  const view = await mount(t, { draft: { status: 'DATA_INSUFFICIENT', reason: '历史不足', tiers: [] } })
  await view.click('设置持仓亏损提醒')
  assert.match(view.text(), /历史不足|持仓亏损请根据自己的持仓成本设定/)
  assert.equal(view.nodes().some(node => node.props?.id === 'holding-profit-reminder'), false)
  await view.set('holding-downside-reminder', '0')
  await view.submit()
  assert.equal(view.calls.confirm.length, 0)
  assert.match(view.text(), /持仓亏损提醒需为/)
  await view.set('holding-downside-reminder', '8')
  await view.submit()
  assert.equal(view.calls.confirm.length, 1)
  assert.deepEqual(view.calls.confirm[0].request, {
    tier: 'CUSTOM', reduceDrawdownPct: '-0.0800', downsideBasis: 'HOLDING_LOSS',
  })
})


test('切换下跌口径时清空旧数值，填入参考只改变高点回撤', async t => {
  const view = await mount(t, { active: { ruleId: 'r1', takeProfitPct: '0.1500',
    reduceDrawdownPct: '-0.0800', ruleParams: { downsideBasis: 'HOLDING_LOSS' } } })
  assert.equal(view.nodes().some(node => node.type === 'dialog'), false)
  await view.click('设置高点回撤提醒')
  assert.match(view.text(), /保存后，下跌提醒将改为按高点回撤计算/)
  assert.match(view.text(), /历史触发 12 次/)
  assert.equal(view.nodes().find(node => node.props?.id === 'holding-downside-reminder').props.value, '')
  assert.equal(view.nodes().some(node => node.props?.id === 'holding-profit-reminder'), false)
  await view.click('填入参考值')
  assert.equal(view.calls.confirm.length, 0)
  await view.submit()
  assert.deepEqual(view.calls.confirm, [{ fund: '008888', request: {
    tier: 'CUSTOM', reduceDrawdownPct: '-0.1040', downsideBasis: 'DRAWDOWN',
  } }])
  assert.equal(view.nodes().some(node => node.type === 'dialog'), false)
})

test('取消抽屉会丢弃尚未保存的输入', async t => {
  const view = await mount(t)
  await view.click('设置止盈提醒')
  await view.set('holding-profit-reminder', '12')
  await view.click('取消')
  assert.equal(view.calls.confirm.length, 0)
  await view.click('设置止盈提醒')
  assert.equal(view.nodes().find(node => node.props?.id === 'holding-profit-reminder').props.value, '')
})
