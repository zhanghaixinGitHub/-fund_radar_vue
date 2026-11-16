import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { Buffer } from 'node:buffer'
import { pathToFileURL, URL } from 'node:url'
import { createRequire } from 'node:module'
import { compileScript, parse } from '@vue/compiler-sfc'
import { createRenderer, h, nextTick, reactive } from 'vue'
import ts from 'typescript'

const url = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8')
const vueUrl = pathToFileURL(createRequire(import.meta.url).resolve('vue')).href
const renderer = createRenderer({
  createElement: type => ({ type, children: [], props: {}, text: '' }), createText: text => ({ text }), createComment: () => ({ text: '' }),
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
const descendants = node => [node, ...(node.children ?? []).flatMap(descendants)]
const textOf = node => `${node.text ?? ''}${(node.children ?? []).map(textOf).join('')}`
const source = (fundCode = '000001') => ({ fundCode, fundName: '基金' + fundCode, title: '报告', endDate: '2026-09-30', publishedDate: '2026-10-30', sourceUrl: null, fullDisclosure: false })
const item = (key, name, weight, pending = false) => ({ key, name, description: '', amount: String(weight), weightPct: String(weight), pending,
  contributions: [{ fundCode: '000001', fundName: '测试基金', amount: String(weight), weightPct: String(weight), sources: [source()] }], evidence: [] })
const view = (items, denominator = 'ACCOUNT') => ({ denominator, totalAmount: '100', coveragePct: '80', mappedCoveragePct: denominator.includes('SECURITY') ? '50' : null,
  reportStart: '2026-06-30', reportEnd: '2026-09-30', items, excludedHoldings: [] })
const data = {
  accountAmount: '100', assets: view([item('STOCK', '股票', 60), item('UNKNOWN', '待补充', 40, true)]),
  industries: view(Array.from({ length: 7 }, (_, index) => item(`I${index}`, `行业${index}`, 10)).concat(item('INDUSTRY_UNKNOWN', '行业待补充', 30, true)), 'DISCLOSED_STOCK'),
  themes: view([item('CHIP', '芯片', 50), item('COMMUNICATION', '通信', 50), item('GAME', '游戏', 50)], 'DISCLOSED_STOCKS_WITH_SECURITY_DETAIL'),
}

async function mount(t, query = {}) {
  const route = reactive({ path: '/portfolio', query: { section: 'overview', ...query } })
  const replacements = []
  const router = { replace(location) { replacements.push(location); route.query = location.query } }
  const key = `__composition${Math.random().toString(16).slice(2)}`
  const { descriptor } = parse(read('../src/components/PortfolioComposition.vue'))
  let code = ts.transpileModule(compileScript(descriptor, { id: key, inlineTemplate: true }).content,
    { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  const simulation = ts.transpileModule(read('../src/utils/simulation.ts'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  for (const [from, to] of Object.entries({
    vue: vueUrl,
    'vue-router': url(`export const useRoute = () => globalThis[${JSON.stringify(key + 'Route')}]; export const useRouter = () => globalThis[${JSON.stringify(key + 'Router')}]`),
    '@/utils/simulation': url(simulation),
    '@/components/CompositionSourceDrawer.vue': url(`import { h } from '${vueUrl}'; export default { props: ['item', 'viewLabel'], setup: props => () => h('div', { class: 'drawer-stub' }, props.viewLabel + '来源：' + props.item.name) }`),
  })) code = code.replaceAll(`from '${from}'`, `from '${to}'`).replaceAll(`from "${from}"`, `from '${to}'`)
  globalThis[key + 'Route'] = route; globalThis[key + 'Router'] = router
  const component = (await import(url(code))).default
  const root = { children: [] }
  const app = renderer.createApp({ setup: () => () => h(component, { data, loading: false, error: '' }) })
  app.mount(root)
  t.after(() => { app.unmount(); delete globalThis[key + 'Route']; delete globalThis[key + 'Router'] })
  await nextTick()
  return { root, route, replacements, text: () => textOf(root), buttons: () => descendants(root).filter(node => node.type === 'button'),
    bars: () => descendants(root).filter(node => node.type === 'ul' && node.props.class === 'composition-bars') }
}

test('实际资产保留待补充，分类可打开来源，切换页签保留总览条件', async t => {
  const page = await mount(t)
  assert.match(page.text(), /实际资产/)
  assert.match(page.text(), /股票60.00% · 60.00 元/)
  assert.match(page.text(), /待补充40.00% · 40.00 元/)
  assert.match(page.text(), /待补充不当作现金/)
  assert.equal(page.bars().length, 1)
  const stock = page.buttons().find(node => textOf(node).includes('股票') && textOf(node).includes('60.00%'))
  await stock.props.onClick({ currentTarget: { focus() {} } })
  assert.match(page.text(), /实际资产来源：股票/)
  const industry = page.buttons().find(node => textOf(node).trim() === '股票行业')
  await industry.props.onClick()
  assert.equal(page.replacements[0].query.section, 'overview')
  assert.equal(page.replacements[0].query.composition, 'industries')
  assert.equal(page.text().includes('实际资产来源：股票'), false)
})

test('行业前五之外合并展示，待补充不并入其他行业，展开后恢复全部', async t => {
  const page = await mount(t, { composition: 'industries' })
  assert.match(page.text(), /其他行业.*行业待补充/)
  assert.doesNotMatch(page.text(), /行业6/)
  const expand = page.buttons().find(node => textOf(node).trim() === '展开全部行业')
  await expand.props.onClick(); await nextTick()
  assert.match(page.text(), /行业6/)
  assert.match(page.text(), /仅统计可确定股票金额的部分.*行业资料覆盖账户持有金额 80.00%/)
})

test('主题重叠不归一化，并明确披露和映射覆盖边界', async t => {
  const page = await mount(t, { composition: 'themes' })
  assert.match(page.text(), /主题可重叠，比例合计不要求100%.*主题对应覆盖 50.00%/)
  assert.match(page.text(), /芯片50.00%.*通信50.00%.*游戏50.00%/)
  assert.match(page.text(), /不能据此认定未披露持仓没有这些主题/)
})
