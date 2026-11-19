import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { Buffer } from 'node:buffer'
import { URL } from 'node:url'
import { compileScript, parse } from '@vue/compiler-sfc'
import ts from 'typescript'
import { computed, createRenderer, nextTick, reactive } from 'vue'

const url = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8')
const transpile = source => ts.transpileModule(source, { compilerOptions: {
  target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext,
} }).outputText
const loader = url(transpile(read('../src/composables/usePortfolioRequest.ts')).replace("from 'vue'", `from '${import.meta.resolve('vue')}'`))
const apiNames = ['cancelSimOrder', 'changeSimPlan', 'getSimComposition', 'getSimLedger', 'getSimOrders', 'getSimOverview', 'getSimPeriods', 'getSimPlans']
const dependencies = {
  vue: import.meta.resolve('vue'),
  'vue-router': url('export const useRoute=()=>globalThis.portfolioHarness.route; export const useRouter=()=>globalThis.portfolioHarness.router; export const onBeforeRouteLeave=()=>{}'),
  '@/composables/usePortfolioRequest': loader,
  '@/composables/usePageNavigation': url('export const usePageNavigation=()=>globalThis.portfolioHarness.navigation'),
  '@/composables/useListLocation': url('export const useListLocation=()=>globalThis.portfolioHarness.location'),
  '@/stores/auth': url('export const useAuthStore=()=>({hasPermission:()=>true})'),
  '@/api/simulation': url(apiNames.map(name => `export const ${name}=(...args)=>globalThis.portfolioHarness.request('${name}',args)`).join('\n')),
  '@/api/multiPrediction': url("export const readLatestDecisions=(...args)=>globalThis.portfolioHarness.request('advice',args)"),
  '@/utils/advice': url('export const portfolioReturnPath=value=>value; export const rememberPortfolioScroll=()=>{}; export const takePortfolioScroll=()=>null'),
  '@/utils/simulationEarnings': url('export const earningsMoney=()=>""; export const rememberEarningsScroll=()=>{}; export const takeEarningsScroll=()=>null'),
  '@/utils/fundPresentation': url('export const formatChangeRate=()=>""'),
  '@/utils/portfolioList': url('export const buildPortfolioList=o=>o.positions; export const sortPortfolioList=p=>p'),
  '@/utils/simulation': url('export const planFrequency=()=>""; export const simMoney=()=>""; export const simPercent=()=>""; export const simShares=()=>""; export const simTime=()=>""; export const simTone=()=>""'),
}
const { descriptor } = parse(read('../src/views/SimulatedPortfolioPage.vue'))
const source = transpile(compileScript(descriptor, { id: 'portfolio-loading-test' }).content)
  .replace(/from ['"]([^'"]+)['"]/g, (_, name) => {
    const target = dependencies[name] ?? (name.startsWith('@/components/') ? url('export default {}') : null)
    assert.ok(target, name)
    return `from '${target}'`
  })
const Page = (await import(url(source))).default
const tick = async () => { for (let i = 0; i < 12; i++) { await Promise.resolve(); await nextTick() } }
function mount(t, section = 'holdings', fundCode) {
  const route = reactive({ query: { section }, path: '/portfolio', fullPath: '/portfolio' })
  const requests = {}
  const harness = {
    route, requests, router: { replace() {}, push() {} },
    navigation: { section: computed(() => fundCode ? route.query.tab ?? 'position' : route.query.section), sectionLabel: computed(() => ''), sectionTarget: () => '' },
    location: { location: computed(() => ({ page: 1, size: 10, keyword: '' })), isCurrent: computed(() => true), navigate() {} },
    request(name, args) { return new Promise((resolve, reject) => (requests[name] ??= []).push({ args, resolve, reject })) },
  }
  globalThis.portfolioHarness = harness
  let state
  const app = createRenderer({ createComment: () => ({}), insert() {}, remove() {}, parentNode: () => null, nextSibling: () => null })
    .createApp({ setup(_props, context) { state = Page.setup({ fundCode }, context); return () => null } })
  app.mount({})
  t.after(() => { app.unmount(); delete globalThis.portfolioHarness })
  return { ...harness, state, unmount: () => app.unmount() }
}
const overview = () => ({ positions: [], marketValue: '123', job: null })

test('详情的交易和定投固定读取当前基金，外层与查询参数不会改写范围', async t => {
  const { requests, state, route } = mount(t, 'overview', '008888')
  route.query.tab = 'orders'
  route.query.fundCode = '000999'
  await tick()
  requests.getSimOverview[0].resolve({ ...overview(), positions: [{ fundCode: '008888' }] })
  await tick()
  assert.equal(requests.getSimOrders.at(-1).args[1], '008888')
  route.query.tab = 'plans'
  await tick()
  requests.getSimPlans[0].resolve([{ fundCode: '000999' }, { fundCode: '008888' }])
  await tick()
  assert.deepEqual(state.filteredPlans.value.map(plan => plan.fundCode), ['008888'])
})

test('持仓先显示：计划和建议一直等待也不阻塞，持仓页不请求构成', async t => {
  const { requests, state } = mount(t)
  await tick()
  assert.equal(requests.getSimComposition, undefined)
  assert.equal(requests.getSimPlans.length, 1)
  assert.equal(requests.advice.length, 1)
  requests.getSimOverview[0].resolve(overview()); await tick()
  assert.equal(state.overview.value.marketValue, '123')
  assert.equal(state.loading.value, false)
  assert.equal(state.plansLoading.value, true)
  assert.equal(state.error.value, '')
})

test('总览先显示金额：构成失败只影响构成，可单独重试', async t => {
  const { requests, state } = mount(t, 'overview')
  await tick()
  assert.equal(requests.getSimPlans, undefined)
  assert.equal(requests.advice, undefined)
  requests.getSimOverview[0].resolve(overview()); await tick()
  assert.equal(state.loading.value, false)
  assert.equal(state.compositionLoading.value, true)
  requests.getSimComposition[0].reject(new Error('slow')); await tick()
  assert.match(state.compositionError.value, /可重试/)
  assert.equal(state.error.value, '')
  void state.compositionRequest.load(); await tick()
  assert.equal(requests.getSimOverview.length, 1)
  requests.getSimComposition[1].resolve({ assets: {} }); await tick()
  assert.equal(state.compositionError.value, '')
  assert.ok(state.composition.value)
})

test('总览切持仓复用金额；重复刷新不叠加，刷新失败保留原数据', async t => {
  const { requests, state, route } = mount(t, 'overview')
  await tick()
  requests.getSimOverview[0].resolve(overview()); await tick()
  route.query.section = 'holdings'; await tick()
  assert.equal(requests.getSimOverview.length, 1)
  assert.equal(state.overview.value.marketValue, '123')
  void state.load(); void state.load(); await tick()
  assert.equal(requests.getSimOverview.length, 2)
  assert.equal(requests.getSimPlans.length, 1)
  requests.getSimOverview[1].reject(new Error('unavailable')); await tick()
  assert.equal(state.overview.value.marketValue, '123')
  assert.equal(state.loading.value, false)
  assert.match(state.error.value, /刷新重试/)
})

test('计划未知时先核对，失败不打开新的定投，成功采用已有计划', async t => {
  const { requests, state } = mount(t)
  await tick()
  void state.openPlan('001021')
  requests.getSimPlans[0].reject(new Error('failed')); await tick()
  assert.equal(state.trade.value, null)
  void state.openPlan('001021'); await tick()
  const plan = { fundCode: '001021', status: 'ACTIVE', planId: 'existing' }
  requests.getSimPlans[1].resolve([plan]); await tick()
  assert.equal(state.trade.value.plan.planId, 'existing')
})

test('卸载取消各区域请求，迟到的响应不能回填', async t => {
  const { requests, state, unmount } = mount(t)
  await tick()
  unmount()
  assert.equal(requests.getSimOverview[0].args[0].aborted, true)
  requests.getSimOverview[0].resolve(overview()); await tick()
  assert.equal(state.overview.value, null)
})

test('独立请求超时结束等待，保留原值，可重试且拒绝迟到结果', async t => {
  const { usePortfolioRequest } = await import(loader)
  const calls = []
  let state
  const app = createRenderer({ createComment: () => ({}), insert() {}, remove() {}, parentNode: () => null, nextSibling: () => null })
    .createApp({ setup() {
      state = usePortfolioRequest(signal => new Promise(resolve => calls.push({ signal, resolve })), '已有内容', '暂时无法读取', 15)
      return () => null
    } })
  app.mount({}); t.after(() => app.unmount())
  assert.equal(await state.load(), false)
  assert.equal(state.loading.value, false)
  assert.equal(calls[0].signal.aborted, true)
  assert.equal(state.data.value, '已有内容')
  const retry = state.load(); await tick()
  calls[1].resolve('新内容'); assert.equal(await retry, true)
  calls[0].resolve('过期内容'); await tick()
  assert.equal(state.data.value, '新内容')
  assert.equal(state.error.value, '')
})
