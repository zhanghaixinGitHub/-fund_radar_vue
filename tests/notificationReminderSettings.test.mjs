import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { Buffer } from 'node:buffer'
import { createRequire, stripTypeScriptTypes } from 'node:module'
import { pathToFileURL, URL } from 'node:url'
import { compileScript, parse } from '@vue/compiler-sfc'
import { createRenderer, h, nextTick, reactive } from 'vue'
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
const positions = [
  { fundCode: '000099', fundName: '已清仓基金', shares: '0' },
  { fundCode: '000002', fundName: '乙基金', shares: '20' },
  { fundCode: '000001', fundName: '甲基金', shares: '10' },
]

async function mount(t, options = {}) {
  const route = reactive({ query: { section: 'rules', ...options.query } })
  const calls = { replace: [], overview: 0 }
  const router = { replace: async target => { calls.replace.push(target); route.query = { ...target.query } } }
  const key = `__notificationReminder${Math.random().toString(16).slice(2)}`
  globalThis[key] = {
    route, router,
    getSimOverview: async () => {
      calls.overview++
      if (options.failFirst && calls.overview === 1) throw new Error('unavailable')
      return { positions }
    },
  }
  const { descriptor } = parse(read('../src/components/HoldingReminderSettings.vue'))
  const script = compileScript(descriptor, { id: key, inlineTemplate: true })
  let code = ts.transpileModule(script.content, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  for (const [from, to] of Object.entries({
    vue,
    'vue-router': url(`export const useRoute=()=>globalThis[${JSON.stringify(key)}].route;export const useRouter=()=>globalThis[${JSON.stringify(key)}].router`),
    '@/api/simulation': url(`export const {getSimOverview}=globalThis[${JSON.stringify(key)}]`),
    '@/stores/auth': url('export const useAuthStore=()=>({hasPermission:permission=>permission==="SIM_PORTFOLIO_SELF_WRITE"})'),
    '@/components/HoldingReminderPanel.vue': url(`import {h} from '${vue}';export default {props:['fundCode','canWrite'],setup:props=>()=>h('p',{},'提醒表单 '+props.fundCode+' 可写 '+props.canWrite)}`),
  })) code = code.replaceAll(`from '${from}'`, `from '${to}'`).replaceAll(`from "${from}"`, `from '${to}'`)
  const component = (await import(url(code))).default
  const root = { children: [] }
  const app = renderer.createApp({ setup: () => () => h(component) })
  t.after(() => { app.unmount(); delete globalThis[key] })
  app.mount(root)
  await settle()
  return { route, calls, root, text: () => textOf(root), nodes: () => nodes(root) }
}

test('按代码列出正份额持仓，带入基金并保留写权限', async t => {
  const view = await mount(t, { query: { fund: '000002', from: 'holding' } })
  assert.match(view.text(), /提醒表单 000002 可写 true/)
  const options = view.nodes().filter(node => node.type === 'option').map(node => textOf(node).trim())
  assert.deepEqual(options, ['请选择基金', '甲基金（000001）', '乙基金（000002）'])
  const select = view.nodes().find(node => node.props?.id === 'holding-reminder-fund')
  await select.props.onChange({ target: { value: '000001' } })
  await settle()
  assert.equal(view.route.query.fund, '000001')
  assert.equal(view.route.query.section, 'rules')
  assert.equal(view.route.query.from, 'holding')
  assert.match(view.text(), /提醒表单 000001/)
})

test('直接打开设置不自动选基金，旧的已清仓基金地址仍可查看', async t => {
  const empty = await mount(t)
  assert.match(empty.text(), /请选择要设置提醒的基金/)
  assert.doesNotMatch(empty.text(), /提醒表单/)
  const previous = await mount(t, { query: { fund: '000099' } })
  assert.match(previous.text(), /已清仓基金（000099）/)
  assert.match(previous.text(), /提醒表单 000099/)
})

test('持仓读取失败可重试，不显示空持仓或提醒表单', async t => {
  const view = await mount(t, { failFirst: true })
  assert.match(view.text(), /持仓基金暂时无法读取/)
  assert.doesNotMatch(view.text(), /当前没有正份额持仓|提醒表单/)
  const retry = view.nodes().find(node => node.type === 'button' && textOf(node).includes('重新读取'))
  await retry.props.onClick()
  await settle()
  assert.equal(view.calls.overview, 2)
  assert.match(view.text(), /请选择要设置提醒的基金/)
})

test('旧持仓提醒地址转到站内提醒并保留基金', async () => {
  const routerStub = url(`export const createWebHistory=()=>({});export const createRouter=()=>({beforeEach:guard=>{globalThis.__reminderNavigationGuard=guard},afterEach:()=>{}})`)
  const authStub = url('export const useAuthStore=()=>({isAuthenticated:true,restoreSession:async()=>{},hasPermission:()=>true})')
  let code = stripTypeScriptTypes(read('../src/router/index.ts'))
  code = code.replaceAll("from 'vue-router'", `from '${routerStub}'`).replaceAll("from '@/stores/auth'", `from '${authStub}'`)
  await import(url(code))
  const target = await globalThis.__reminderNavigationGuard({
    name: 'portfolio-advice', fullPath: '/portfolio/advice?section=rules&fund=002112',
    query: { section: 'rules', fund: '002112' }, meta: {},
  })
  assert.deepEqual(target, { name: 'notifications', query: { section: 'rules', fund: '002112' } })
  const latest = await globalThis.__reminderNavigationGuard({
    name: 'portfolio-advice', fullPath: '/portfolio/advice?fund=002112',
    query: { fund: '002112' }, meta: {},
  })
  assert.equal(latest, true)
  delete globalThis.__reminderNavigationGuard
})
