import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { Buffer } from 'node:buffer'
import { URL, URLSearchParams } from 'node:url'
import { compileScript, parse } from '@vue/compiler-sfc'
import ts from 'typescript'
import { createRenderer, nextTick, reactive } from 'vue'

// 执行页面真实的 setup 与 Vue 路由监听，只替换只读接口和浏览器渲染。
// 不连接业务服务，不创建用户或交易；不把这些检查当作浏览器视觉验收。
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const transpile = source => ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext },
}).outputText
const emptyComponent = moduleUrl('export default {}')
const dependencies = {
  vue: import.meta.resolve('vue'),
  'vue-router': moduleUrl('export const useRoute = () => globalThis.earningsPageHarness.route; export const useRouter = () => globalThis.earningsPageHarness.router'),
  '@/api/simulation': moduleUrl(['getSimEarnings', 'getSimEarningsFunds', 'getSimEarningsDetails'].map(name =>
    `export const ${name} = (...args) => globalThis.earningsPageHarness.api.${name}(...args)`).join('\n')),
  '@/api/http': moduleUrl('export class ApiRequestError extends Error {}'),
}
for (const name of ['pagination', 'simulation', 'simulationEarnings']) {
  dependencies[`@/utils/${name}`] = moduleUrl(transpile(readFileSync(new URL(`../src/utils/${name}.ts`, import.meta.url), 'utf8')))
}
const { descriptor } = parse(readFileSync(new URL('../src/views/SimulationEarningsPage.vue', import.meta.url), 'utf8'))
const compiled = transpile(compileScript(descriptor, { id: 'earnings-page-test' }).content)
  .replace(/from ['"]([^'"]+)['"]/g, (_, name) => {
    const dependency = dependencies[name] ?? (name.startsWith('@/components/') ? emptyComponent : undefined)
    assert.ok(dependency, `未替换的页面依赖：${name}`)
    return `from '${dependency}'`
  }).replaceAll('import.meta.env.DEV', 'false')
const { default: Page } = await import(moduleUrl(compiled))

function mount(query = {}) {
  const route = reactive({ query, fullPath: '/portfolio/earnings' })
  const pushes = []
  const requests = { summary: [], funds: [], details: [] }
  const request = kind => (...args) => new Promise((resolve, reject) => requests[kind].push({ args, resolve, reject }))
  const router = { async push(location) {
    pushes.push(location)
    route.query = Object.fromEntries(Object.entries(location.query).filter(([, value]) => value !== undefined))
    route.fullPath = `/portfolio/earnings?${new URLSearchParams(route.query)}`
    await nextTick()
  } }
  globalThis.earningsPageHarness = { route, router, api: {
    getSimEarnings: request('summary'), getSimEarningsFunds: request('funds'), getSimEarningsDetails: request('details'),
  } }
  let state
  const renderer = createRenderer({
    createComment: () => ({}), insert() {}, remove() {}, parentNode: () => null, nextSibling: () => null,
  })
  const app = renderer.createApp({ setup(props, context) {
    state = Page.setup(props, context)
    return () => null
  } })
  app.mount({})
  return { state, requests, pushes, route, unmount: () => app.unmount() }
}
const summary = () => ({
  fund: null, startDate: '2026-11-01', endDate: '2026-11-10', complete: false,
  periodGain: null, knownGain: '0', incompleteDays: 1,
  days: { page: 1, pageSize: 10, totalCount: 2, items: [
    { date: '2026-11-10', dailyGain: null, knownGain: '0', status: 'PARTIAL', updatedFunds: 1, expectedFunds: 2 },
    { date: '2026-11-09', dailyGain: '0', knownGain: '0', status: 'COMPLETE', updatedFunds: 2, expectedFunds: 2 },
  ] }, curve: [],
})
const tick = async () => { await Promise.resolve(); await nextTick() }

test('自选日期先编辑再查询，错误留在日期栏，保留基金和返回条件', async t => {
  const harness = mount({ fundCode: '001021', page: '3', size: '20', from: '/portfolio?section=holdings' })
  t.after(harness.unmount)
  const { state, requests, pushes } = harness
  const data = summary()
  data.days.totalCount = 80
  requests.summary[0].resolve(data); await tick()
  state.changeRange('CUSTOM')
  assert.equal(state.customDatesOpen.value, true)
  assert.equal(pushes.length, 0)
  state.start.value = '2026-11-10'; state.end.value = '2026-11-01'
  state.applyDates()
  assert.match(state.dateError.value, /开始不晚于结束/)
  assert.equal(state.error.value, '')
  assert.ok(state.result.value)
  assert.equal(pushes.length, 0)
  state.start.value = '2026-11-01'; state.end.value = '2026-11-10'
  state.applyDates(); await tick()
  assert.equal(harness.route.query.range, 'CUSTOM')
  assert.equal(harness.route.query.fundCode, '001021')
  assert.equal(harness.route.query.size, '20')
  assert.equal(harness.route.query.from, '/portfolio?section=holdings')
  assert.equal(harness.route.query.page, undefined)
  assert.equal(requests.summary.at(-1).args[0].get('startDate'), '2026-11-01')
})

test('当天面板保持主表，关闭后丢弃迟到响应，再打开不会串日期', async t => {
  const { state, requests, unmount } = mount()
  t.after(unmount)
  requests.summary[0].resolve(summary()); await tick()
  const mainResult = state.result.value
  const first = state.openDetails('2026-11-10')
  assert.equal(state.selectedDay.value.dailyGain, null)
  assert.equal(state.result.value, mainResult)
  state.closeDetails()
  requests.details[0].resolve({ page: 1, totalCount: 2, items: [{ fundCode: 'old' }] })
  await first
  assert.equal(state.selectedDate.value, '')
  assert.equal(state.details.value, null)
  const older = state.openDetails('2026-11-10')
  state.detailPageSize.value = 20
  const newer = state.openDetails('2026-11-09', 2)
  requests.details[2].resolve({ page: 2, totalCount: 30, items: [{ fundCode: 'new', dailyGain: '0' }] })
  await newer
  requests.details[1].reject(new Error('迟到的请求错误')); await older
  assert.equal(state.selectedDate.value, '2026-11-09')
  assert.equal(state.selectedDay.value.dailyGain, '0')
  assert.equal(state.details.value.items[0].fundCode, 'new')
  assert.equal(state.detailError.value, '')
  assert.deepEqual(requests.details[2].args, ['2026-11-09', 2, 20])
})

test('基金查询关闭后不回填，选择基金保留日期条件并回到第一页', async t => {
  const { state, requests, route, unmount } = mount({ range: 'CUSTOM', startDate: '2026-11-01', endDate: '2026-11-10', page: '2' })
  t.after(unmount)
  state.openFundPicker()
  assert.equal(state.showFundPicker.value, true)
  assert.deepEqual(requests.funds[0].args, ['', 1, 10])
  state.keyword.value = ' 华夏 '
  const search = state.search()
  assert.deepEqual(requests.funds[1].args, ['华夏', 1, 10])
  requests.funds[1].resolve({ page: 1, totalCount: 1, items: [{ fundCode: '001021', closed: true }] })
  await search
  state.chooseFund('001021'); await tick()
  assert.equal(state.showFundPicker.value, false)
  assert.equal(state.matches.value, null)
  assert.equal(route.query.fundCode, '001021')
  assert.equal(route.query.startDate, '2026-11-01')
  assert.equal(route.query.endDate, '2026-11-10')
  assert.equal(route.query.page, undefined)
  requests.funds[0].resolve({ page: 1, totalCount: 1, items: [{ fundCode: 'late' }] }); await tick()
  assert.equal(state.matches.value, null)
})
