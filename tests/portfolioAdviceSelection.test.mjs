import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { Buffer } from 'node:buffer'
import { createRequire, stripTypeScriptTypes } from 'node:module'
import { pathToFileURL, URL } from 'node:url'
import { compileScript, parse } from '@vue/compiler-sfc'
import { createRenderer, h, nextTick, reactive, computed } from 'vue'
import ts from 'typescript'

// Vue文本输入指令会检查根节点类型；自定义渲染器不连接浏览器。
globalThis.Document ??= class {}
globalThis.ShadowRoot ??= class {}

const url = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8')
const vue = pathToFileURL(createRequire(import.meta.url).resolve('vue')).href
const settle = async () => { for (let i = 0; i < 15; i++) { await Promise.resolve(); await nextTick() } }
const renderer = createRenderer({
  createElement: type => ({ type, tagName:type.toUpperCase(), children:[], props:{}, text:'',
    addEventListener() {}, removeEventListener() {}, getRootNode() { return {activeElement:null} },
    get options() { return this.children.filter(n=>n.type==='option') },
    get value() { return this.props.value }, set value(value) { this.props.value=value } }),
  createText: text => ({text}), createComment:()=>({text:''}),
  setText:(node,text)=>{node.text=text}, setElementText:(node,text)=>{node.text=text;node.children=[]},
  patchProp:(node,key,_old,value)=>{node.props[key]=value},
  insert(node,parent,anchor) { if(node.parent) node.parent.children.splice(node.parent.children.indexOf(node),1); node.parent=parent;const index=anchor?parent.children.indexOf(anchor):-1;parent.children.splice(index<0?parent.children.length:index,0,node) },
  remove(node) {if(node.parent) node.parent.children.splice(node.parent.children.indexOf(node),1);node.parent=null},
  parentNode:node=>node.parent,nextSibling:node=>node.parent?.children[node.parent.children.indexOf(node)+1]??null,
})
const nodes = node => [node,...(node.children??[]).flatMap(nodes)]
const textOf = node => `${node.text??''}${(node.children??[]).map(textOf).join('')}`
const positions = [{fundCode:'000002',fundName:'乙基金',shares:'20'}, {fundCode:'000001',fundName:'甲基金',shares:'10'}, {fundCode:'000099',fundName:'已清仓基金',shares:'0'}]
async function mount(t, options={}) {
  const route=reactive({query:{...options.query}})
  const calls={replace:[],overview:0,watchlist:[],draft:[],rules:[],history:[],generate:[]}
  const router={replace:async target=>{calls.replace.push(target);route.query={...target.query}}}
  const key=`__adviceSelection${Math.random().toString(16).slice(2)}`
  const emptyHistory={fundName:'已选基金',reports:{items:[],totalCount:0},job:null}
  const api={}
  for(const name of ['confirmHoldingRule','generateAdvice','generateRuleDraft','getAdviceReport','revokeHoldingRule']) api[name]=async code=>{calls.generate.push({name,code});return {}}
  api.getAdviceReport=async()=>null
  api.fetchRuleDraft=async code=>{calls.draft.push(code);return {status:'DATA_INSUFFICIENT',reason:'资料不足',tiers:[]}}
  api.fetchHoldingRules=async code=>{calls.rules.push(code);return {active:null,history:[]}}
  api.getAdviceHistory=async code=>{calls.history.push(code);return emptyHistory}
  globalThis[key]={route,router,api,
    getSimOverview:async()=>{calls.overview++;return options.overview?options.overview(calls.overview):{positions}},
    section:computed(()=>['diagnosis','review'].includes(route.query.section)?'latest':route.query.section??'latest'),
    getWatchlist:async query=>{calls.watchlist.push(query);return options.watchlist?options.watchlist(query):{items:[]}}}
  const {descriptor}=parse(read('../src/views/PortfolioAdvicePage.vue'))
  const script=compileScript(descriptor,{id:key,inlineTemplate:true})
  let code=ts.transpileModule(script.content,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText
  const stub=url(`import {h} from '${vue}';export default {props:['fundCode','historyOnly'],setup:p=>()=>h('p',{},'建议组件 '+p.fundCode+(p.historyOnly?' 历史':''))}`)
  for(const [from,to] of Object.entries({
    vue,'vue-router':url(`import {h} from '${vue}';export const useRoute=()=>globalThis[${JSON.stringify(key)}].route;export const useRouter=()=>globalThis[${JSON.stringify(key)}].router;export const RouterLink={props:['to'],setup:(props,{slots})=>()=>h('a',{'data-section':props.to.query?.section,'data-fund':props.to.query?.fund},slots.default?.())}`),
    '@/api/advice':url(`export const {${Object.keys(api).join(',')}}=globalThis[${JSON.stringify(key)}].api`),
    '@/api/simulation':url(`export const {getSimOverview}=globalThis[${JSON.stringify(key)}]`),
    '@/api/watchlist':url(`export const {getWatchlist}=globalThis[${JSON.stringify(key)}]`),
    '@/composables/usePageNavigation':url(`export const usePageNavigation=()=>({section:globalThis[${JSON.stringify(key)}].section})`),
    '@/stores/auth':url('export const useAuthStore=()=>({hasPermission:()=>true})'),
    '@/components/ListPagination.vue':url('export default {render:()=>null}'),
    '@/components/DecisionPanelV2.vue':stub,'@/components/HoldingReminderPanel.vue':stub,
    '@/utils/pagination':url(stripTypeScriptTypes(read('../src/utils/pagination.ts'))),
    '@/utils/advice':url(stripTypeScriptTypes(read('../src/utils/advice.ts'))),
    '@/utils/simulation':url(stripTypeScriptTypes(read('../src/utils/simulation.ts'))),
  })) code=code.replaceAll(`from '${from}'`,`from '${to}'`).replaceAll(`from "${from}"`,`from '${to}'`)
  const component=(await import(url(code))).default
  const root={children:[]}
  const app=renderer.createApp({setup:()=>()=>h(component)})
  t.after(()=>{app.unmount();delete globalThis[key]})
  app.mount(root);await settle()
  return {route,calls,text:()=>textOf(root),nodes:()=>nodes(root),select:async value=>{const input=nodes(root).find(n=>n.props?.id==='advice-fund-keyword'); input.props['onUpdate:modelValue'](value); input.props.onInput(); await settle(); await nodes(root).find(n=>n.type==='form').props.onSubmit({preventDefault(){}}); await settle()}}
}

test('直接进入留空，普通搜索框不弹下拉且输入不查询',async t=>{
  const view=await mount(t)
  const input=view.nodes().find(n=>n.props?.id==='advice-fund-keyword')
  assert.equal(input.props.value,''); assert.equal(input.props.role,undefined)
  input.props.onFocus(); await settle(); assert.equal(input.props.value,'')
  input.props['onUpdate:modelValue']('000001');input.props.onInput();await settle()
  assert.equal(view.route.query.fund,undefined);assert.deepEqual(view.calls.watchlist,[])
  assert.deepEqual(view.calls.history,[]);assert.deepEqual(view.calls.generate,[])
  assert.equal(view.nodes().some(n=>n.props?.role==='listbox'),false)
  assert.match(view.text(),/查询/)
})
test('切换基金保留栏目和原持仓来源，清除上一份报告定位',async t=>{
  const from='/portfolio?section=holdings&page=2&holding=000002'
  const view=await mount(t,{query:{fund:'000001',section:'history',from,report:'old',page:'2',start:'2026-10-01'}})
  assert.deepEqual(view.calls.history,['000001'])
  await view.select('000002')
  assert.equal(view.route.query.section,'history');assert.equal(view.route.query.from,from)
  assert.equal(view.route.query.report,undefined);assert.equal(view.route.query.page,undefined)
  assert.equal(view.route.query.start,undefined)
  assert.deepEqual(view.calls.history,['000001'])
  assert.doesNotMatch(view.text(),/早期二十日建议|按日期查看/)
})
test('带基金的旧链接不被默认选择覆盖，已清仓记录仍可查看',async t=>{
  const view=await mount(t,{query:{fund:'000099'}})
  assert.equal(view.route.query.fund,'000099')
  assert.equal(view.nodes().find(n=>n.props?.id==='advice-fund-keyword').props.value,'已清仓基金（000099）')
  assert.match(view.text(),/建议组件 000099/)
  assert.equal(view.calls.replace.length,0)
})
test('空持仓不拿关注代替，错误有重试且不伪装为空持仓',async t=>{
  const empty=await mount(t,{overview:async()=>({positions:[]})})
  assert.match(empty.text(),/请选择要分析的基金/);assert.equal(empty.route.query.fund,undefined)
  assert.equal(empty.calls.watchlist.length,0)
  const failed=await mount(t,{overview:async count=>{if(count===1)throw new Error('fail');return {positions}}})
  assert.match(failed.text(),/持仓列表暂时无法读取/)
  const retry=failed.nodes().find(n=>n.type==='button'&&textOf(n).trim()==='重新读取持仓')
  await retry.props.onClick();await settle()
  assert.equal(failed.route.query.fund,undefined)
})
test('旧持仓检查和效果回看链接回到最新建议，当前基金提供站内提醒设置入口',async t=>{
  const view=await mount(t,{query:{fund:'000123'},watchlist:async()=>{throw new Error('unavailable')}})
  assert.match(view.text(),/关注信息暂时无法核对/)
  await view.select('000002')
  view.route.query={...view.route.query,section:'diagnosis'};await settle()
  assert.match(view.text(),/建议组件 000002/);assert.doesNotMatch(view.text(),/建议组件 000002 历史/)
  view.route.query={...view.route.query,section:'review'};await settle()
  assert.match(view.text(),/建议组件 000002/);assert.doesNotMatch(view.text(),/建议组件 000002 历史/)
  const reminder=view.nodes().find(n=>n.type==='a'&&textOf(n).includes('设置该基金提醒'))
  assert.equal(reminder.props['data-section'],'rules');assert.equal(reminder.props['data-fund'],'000002')
  assert.deepEqual(view.calls.draft,[]);assert.deepEqual(view.calls.rules,[])
  assert.deepEqual(view.calls.generate,[])
})
test('读取持仓期间出现明确基金地址，不被默认基金覆盖',async t=>{
  let resolve
  const view=await mount(t,{overview:()=>new Promise(done=>{resolve=done})})
  assert.match(view.text(),/正在读取本人持仓基金/)
  view.route.query={fund:'000002',section:'latest'}
  resolve({positions});await settle()
  assert.equal(view.route.query.fund,'000002')
  assert.equal(view.nodes().find(n=>n.props?.id==='advice-fund-keyword').props.value,'乙基金（000002）'); assert.match(view.text(),/建议组件 000002/)
})
test('点击查询后查找关注基金并打开唯一结果',async t=>{
  const view=await mount(t,{watchlist:async()=>({items:[{fundCode:'000123',fundName:'关注基金'}]})})
  await view.select('000123')
  assert.equal(view.route.query.fund,'000123')
  assert.equal(view.nodes().find(n=>n.props?.id==='advice-fund-keyword').props.value,'关注基金（000123）')
  assert.doesNotMatch(view.text(),/刷新记录|查找其他基金/)
  assert.deepEqual(view.calls.generate,[])
})
test('多只匹配在正文显示结果，点击查看，空查询清除并保留来源',async t=>{
  const from='/portfolio?section=holdings&holding=000002'
  const view=await mount(t,{query:{fund:'000002',from}})
  await view.select('基金')
  assert.match(view.text(),/找到 3 只基金/)
  assert.equal(view.route.query.fund,'000002')
  const button=view.nodes().find(n=>n.type==='button'&&textOf(n).trim()==='甲基金（000001）')
  button.props.onClick();await settle()
  assert.equal(view.route.query.fund,'000001')
  const input=view.nodes().find(n=>n.props?.id==='advice-fund-keyword')
  input.props['onUpdate:modelValue']('');input.props.onInput();await settle()
  assert.equal(view.route.query.fund,'000001')
  await view.nodes().find(n=>n.type==='form').props.onSubmit({preventDefault(){}});await settle()
  assert.equal(view.route.query.fund,undefined);assert.equal(view.route.query.from,from)
})
test('查询期间改输入，旧结果不能替换当前基金',async t=>{
  let resolve
  const view=await mount(t,{watchlist:()=>new Promise(done=>{resolve=done})})
  const input=view.nodes().find(n=>n.props?.id==='advice-fund-keyword')
  input.props['onUpdate:modelValue']('000123');input.props.onInput();await settle()
  const pending=view.nodes().find(n=>n.type==='form').props.onSubmit({preventDefault(){}})
  await settle();input.props['onUpdate:modelValue']('乙');input.props.onInput();await settle()
  resolve({items:[{fundCode:'000123',fundName:'关注基金'}]});await pending;await settle()
  assert.equal(view.route.query.fund,undefined);assert.equal(input.props.value,'乙')
})

test('再次聚焦已查询基金显示灰色提示，直接输入不拼接且不改当前分析',async t=>{
  const view=await mount(t,{query:{fund:'000002'}})
  const input=view.nodes().find(n=>n.props?.id==='advice-fund-keyword')
  input.props.onFocus();await settle()
  assert.equal(input.props.value,'');assert.equal(input.props.placeholder,'乙基金（000002）')
  assert.equal(view.route.query.fund,'000002')
  input.props['onUpdate:modelValue']('甲');input.props.onInput();await settle()
  input.props.onFocus();await settle();assert.equal(input.props.value,'甲')
  await view.nodes().find(n=>n.type==='form').props.onSubmit({preventDefault(){}});await settle()
  assert.equal(view.route.query.fund,'000001')
})
