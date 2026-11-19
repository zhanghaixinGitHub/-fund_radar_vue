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
    addEventListener() {}, removeEventListener() {}, focus() {}, getRootNode() { return { activeElement: null } },
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

function componentUrl(path, imports = {}) {
  const { descriptor } = parse(read(path))
  const script = compileScript(descriptor, { id: path, inlineTemplate: true })
  let code = ts.transpileModule(script.content, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  for (const [from, to] of Object.entries({ vue, ...imports })) {
    code = code.replaceAll(`from '${from}'`, `from '${to}'`).replaceAll(`from "${from}"`, `from '${to}'`)
  }
  return url(code)
}

const drawer = url(`import {h} from '${vue}';
export default {props:['title'],emits:['close'],setup:(props,{emit,slots})=>()=>h('dialog',{},[
  h('h2',props.title),h('button',{onClick:()=>emit('close')},'关闭抽屉'),...slots.default()
])}`)
const pagination = url(`import {h} from '${vue}';
export default {props:['page','pageSize','total'],emits:['change'],setup:(props,{emit})=>
  ()=>h('button',{disabled:props.page*props.pageSize>=props.total,onClick:()=>emit('change',props.page+1,props.pageSize)},'第 '+props.page+' 页')
}`)
const reminderTable = componentUrl('../src/components/ReminderSettingsTable.vue', {
  '@/components/ReminderFundSearch.vue': componentUrl('../src/components/ReminderFundSearch.vue'),
  '@/components/ListPagination.vue': pagination,
})
const shared = {
  '@/components/ReminderSettingsTable.vue': reminderTable,
  '@/components/PredictionHistoryDrawer.vue': drawer,
  '@/stores/auth': url('export const useAuthStore=()=>({hasPermission:()=>true})'),
}
function render(t, component) {
  const root = { children: [] }
  const app = renderer.createApp({ setup: () => () => h(component) })
  t.after(() => app.unmount())
  app.mount(root)
  return {
    text: () => textOf(root),
    rows: () => nodes(root).filter(node => node.type === 'tr').slice(1),
    find: selector => nodes(root).find(selector),
    click: label => nodes(root).find(node => node.type === 'button' && textOf(node) === label).props.onClick(),
  }
}

async function holding(t, query = {}, failFirst = false) {
  const route = reactive({ query: { section: 'holding-rules', ...query } })
  const key = '__reminderTest' + Math.random()
  let calls = 0
  globalThis[key] = {
    route,
    router: { replace: async target => { route.query = target.query } },
    getSimOverview: async () => {
      if (++calls === 1 && failFirst) throw new Error('unavailable')
      return { positions }
    },
  }
  t.after(() => { delete globalThis[key] })
  const component = (await import(componentUrl('../src/components/HoldingReminderSettings.vue', {
    ...shared,
    'vue-router': url(`export const useRoute=()=>globalThis[${JSON.stringify(key)}].route;export const useRouter=()=>globalThis[${JSON.stringify(key)}].router`),
    '@/api/simulation': url(`export const {getSimOverview}=globalThis[${JSON.stringify(key)}]`),
    '@/api/advice': url(`export const fetchHoldingRules=async code=>({active:code==='000001'?{takeProfitPct:'0.10',reduceDrawdownPct:'-0.05',ruleParams:{downsideBasis:'HOLDING_LOSS'}}:null})`),
    '@/utils/advice': url('export const rulePctText=value=>Number(value)*100+"%"'),
    '@/components/HoldingReminderPanel.vue': url(`import {h} from '${vue}';
      export default {props:['fundCode','canWrite'],emits:['rules-change'],setup:(props,{emit})=>()=>h('div',{},[
        h('p','提醒表单 '+props.fundCode+' 可写 '+props.canWrite),
        h('button',{onClick:()=>emit('rules-change',{fundCode:props.fundCode,active:{takeProfitPct:'0.20'}})},'保存提醒')
      ])}`),
  }))).default
  const view = render(t, component)
  await settle()
  return { ...view, route }
}

test('默认显示全部正份额持仓，更新已筛选基金的提醒且保留搜索', async t => {
  const view = await holding(t)
  assert.deepEqual(view.rows().map(textOf), ['甲基金00000110%-5%未设置设置', '乙基金000002未设置未设置未设置设置'])
  const search = view.find(node => node.props?.id === 'holding-reminder-title-fund')
  search.props.onFocus()
  search.props['onUpdate:modelValue']('乙')
  await settle()
  view.click('乙基金（000002）')
  await settle()
  view.click('设置')
  await settle()
  view.click('保存提醒')
  view.click('关闭抽屉')
  await settle()
  assert.equal(search.value, '乙基金（000002）')
  assert.deepEqual(view.rows().map(textOf), ['乙基金00000220%未设置未设置设置'])
})

test('旧的已清仓基金地址仍打开抽屉，关闭后回到持仓列表', async t => {
  const view = await holding(t, { fund: '000099', from: 'holding' })
  assert.match(view.text(), /已清仓基金（000099）/)
  assert.match(view.text(), /提醒表单 000099/)
  assert.equal(view.rows().length, 2)
  view.click('关闭抽屉')
  await settle()
  assert.equal(view.route.query.fund, undefined)
  assert.equal(view.route.query.from, 'holding')
  assert.doesNotMatch(view.text(), /提醒表单/)
})

test('持仓读取失败时可重试', async t => {
  const view = await holding(t, {}, true)
  assert.match(view.text(), /持仓基金暂时无法读取/)
  view.click('重试')
  await settle()
  assert.equal(view.rows().length, 2)
})

test('关注列表包含没有规则的基金，可开启提醒并保留页码', async t => {
  const alertsApi = url(`const rules=[{fundCode:'000001',ruleType:'EVENT',enabled:true}];
    export const getAlertRules=async()=>rules.slice();
    export const getAlertAvailability=async()=>null;
    export const upsertAlertRule=async rule=>{rules.push(rule);return rule}`)
  const alertPanel = componentUrl('../src/components/FundAlertRules.vue', {
    'vue-router': url(`export const RouterLink={render:()=>null}`),
    '@/api/alerts': alertsApi,
    '@/utils/alertPresentation': url(`export const alertDescriptions={EVENT:{title:'事项'},SIGNAL_CHANGE:{title:'走势'}};
      export const alertAvailabilityNote=()=>''`),
  })
  const component = (await import(componentUrl('../src/components/FollowedReminderSettings.vue', {
    ...shared,
    '@/components/FundAlertRules.vue': alertPanel,
    '@/api/alerts': alertsApi,
    '@/api/watchlist': url(`export const getWatchlist=async ({page})=>({page,totalPages:2,items:
      page===1 ? Array.from({length:10},(_,i)=>({fundCode:String(i+1).padStart(6,'0'),fundName:'基金'+(i+1)})) :
      [{fundCode:'000011',fundName:'末页基金'}]})`),
  }))).default
  const view = render(t, component)
  await settle()
  assert.match(textOf(view.rows()[0]), /已开启已关闭/)
  view.click('第 1 页')
  await settle()
  assert.deepEqual(view.rows().map(textOf), ['末页基金000011已关闭已关闭设置'])
  view.click('设置')
  await settle()
  view.click('开启提醒')
  await settle()
  view.click('关闭抽屉')
  await settle()
  assert.deepEqual(view.rows().map(textOf), ['末页基金000011已开启已关闭设置'])
  assert.match(view.text(), /第 2 页/)
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
  assert.deepEqual(target, { name: 'notifications', query: { section: 'holding-rules', fund: '002112' } })
  const latest = await globalThis.__reminderNavigationGuard({
    name: 'portfolio-advice', fullPath: '/portfolio/advice?fund=002112',
    query: { fund: '002112' }, meta: {},
  })
  assert.equal(latest, true)
  delete globalThis.__reminderNavigationGuard
})

test('同一基金的不同提醒合成一行，点单元格查看详情', async t => {
  const section = reactive({ value: 'messages' })
  const route = reactive({ name: 'notifications', query: { section: 'messages' } })
  const key = '__notificationFeedTest'
  const samples = {
    thresholds: { title: '持仓收益达到止盈条件', kind: 'TAKE_PROFIT', path: '/portfolio/006730?section=reminders' },
    events: { title: '基金公告', kind: 'FUND_PUBLICATION', path: '/funds/006730?section=documents' },
    signals: { title: '走势判断变化', kind: 'SIGNAL_CHANGE', path: '/funds/006730' },
  }
  const readCategories = new Set()
  const mockItem = category => ({
    id: category, category, kind: samples[category].kind, fundCode: '006730',
    revision: 1, lifecycle: 'ACTIVE', read: readCategories.has(category), occurredAt: '2026-11-19T06:00:00Z',
    payload: { title: samples[category].title, explanation: '达到测试条件' },
  })
  globalThis[key] = {
    section,
    route,
    markReviewNoticeRead: async (id, revision) => { readCategories.add(id); return { revision, read: true } },
    getNotificationMatrix: async category => ({
      totalCount: 1, page: 1,
      cells: (category === 'messages' ? Object.keys(samples) : [category])
        .map(key => ({ latest: mockItem(key), unreadCount: readCategories.has(key) ? 0 : 1, messageCount: 1 })),
    }),
    getNotificationFeed: async category => ({ totalCount: 1, page: 1, items: [mockItem(category)] }),
  }
  t.after(() => { delete globalThis[key] })
  const router = url(`import { h } from '${vue}';
    export const useRoute=()=>globalThis.${key}.route;export const useRouter=()=>({push:async()=>{}});
    export const RouterLink={props:['to'],setup:(props,{slots})=>()=>h('a',{href:props.to},slots.default())}`)
  const panel = componentUrl('../src/components/ReviewNoticePanel.vue', {
    'vue-router': router,
    '@/api/http': url(`export const get=async()=>({items:[]});export const post=globalThis.${key}.markReviewRead`),
    '@/components/ListPagination.vue': pagination,
    '@/utils/direction1d': url('export const direction1dTime=value=>value'),
    '@/utils/pagination': url('export const readFixedPage=async(fetch,page)=>fetch(page)'),
  })
  const component = (await import(componentUrl('../src/views/NotificationsPage.vue', {
    ...shared,
    'vue-router': router,
    '@/components/ListPagination.vue': pagination,
    '@/components/ReviewNoticePanel.vue': panel,
    '@/components/PredictionHistoryDrawer.vue': drawer,
    '@/components/HoldingReminderSettings.vue': url('export default {}'),
    '@/components/FollowedReminderSettings.vue': url('export default {}'),
    '@/api/http': url('export class ApiRequestError extends Error {}'),
    '@/api/funds': url("export const getFundDetail=async code=>({fundCode:code,fundName:'测试基金'});export const getFunds=async()=>({items:[]})"),
    '@/api/notifications': url(`export const {getNotificationFeed,getNotificationMatrix,markReviewNoticeRead}=globalThis.${key};export const markNotificationRead=async()=>{}`),
    '@/composables/usePageNavigation': url(`export const usePageNavigation=()=>({section:globalThis.${key}.section,sectionLabel:'站内提醒'})`),
    '@/utils/fundPresentation': url('export const riskLevelLabel=value=>value;export const signalDirectionLabel=value=>value'),
  }))).default
  const rendered = render(t, component)
  await settle()
  assert.equal(rendered.rows().length, 1)
  assert.ok(rendered.text().includes('测试基金006730'))
  assert.equal(rendered.rows()[0] && nodes(rendered.rows()[0]).filter(node => node.props?.['aria-label'] === '有未读提醒').length, 1)
  assert.equal(rendered.text().includes('条未读'), false)
  rendered.click('查看详情')
  await settle()
  assert.ok(rendered.text().includes('达到测试条件'))
  assert.equal(rendered.find(node => node.props?.id === 'inbox-detail-category'), undefined)
  assert.ok(rendered.find(node => node.props?.title === '测试基金' && textOf(node) === '测试基金'))
  rendered.click('关闭抽屉')
  await settle()
  for (const sample of Object.values(samples)) {
    assert.equal(rendered.text().includes('达到测试条件'), false)
    const trigger = rendered.find(node => node.type === 'button' && node.props['aria-label']?.includes(sample.title))
    assert.ok(trigger)
    trigger.props.onClick()
    await settle()
    assert.ok(rendered.text().includes('达到测试条件'))
    assert.ok(rendered.find(node => node.type === 'a' && node.props.href === sample.path))
    rendered.click('关闭抽屉')
    await settle()
  }
  assert.equal(readCategories.size, 3)
  assert.equal(rendered.text().includes('标记已读'), false)
  assert.equal(nodes(rendered.rows()[0]).filter(node => node.props?.['aria-label'] === '有未读提醒').length, 0)
  route.query.section = 'events'
  await settle()
  assert.ok(rendered.text().includes(samples.events.title))
  assert.equal(rendered.text().includes(samples.signals.title), false)
})
