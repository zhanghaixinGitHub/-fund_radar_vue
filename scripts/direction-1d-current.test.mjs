import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { readFileSync } from 'node:fs'
import { createRequire, stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import { pathToFileURL, URL } from 'node:url'
import { compileScript, parse } from '@vue/compiler-sfc'
import { createRenderer, nextTick } from 'vue'
import ts from 'typescript'

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8')
const moduleUrl = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
const directionUrl = moduleUrl(stripTypeScriptTypes(read('../src/utils/direction1d.ts')))
const evidenceUrl = moduleUrl(stripTypeScriptTypes(read('../src/utils/predictionEvidence.ts')))
const { direction1dDisplayRecord } = await import(directionUrl)

const record = (date = '2026-10-15') => ({
  forecastId: `forecast-${date}`, storedAt: '2026-10-14T16:00:00+08:00', receiptVerifiedAt: null, receiptStatus: null, outcomes: [],
  forecast: {
    schemaVersion: 'DIRECTION_1D_ANALYSIS_V1', fundCode: '002112', targetNavDate: date, baseNavDate: '2026-10-14',
    horizonTradingDays: 1, targetDefinition: 'UNIT_NAV_DIRECTION_THREE_STATE_V2', directionPolicy: 'EXACT_UNIT_NAV_CHANGE_V1',
    modelReleased: false, upProbability: null, input: { values: [] },
    latestNavDate: '2026-10-14', validationStatus: 'UNVALIDATED',
    analysis: { direction: 'UP', confidence: 'LOW', summary: '样例综合上涨依据', synthesis: '样例综合说明' },
    narrative: { styleVersion: 'PREDICTION_INFORMATION_ZH_V4', summary: '样例综合上涨依据', context: '样例综合说明', limitations: [] },
    branches: ['FIXED', 'WEEKLY'].map(branchId => ({ branchId, status: 'AVAILABLE', score: .6,
      predictedDirection: 'UP', classScores: { DOWN: .2, FLAT: .2, UP: .6 } })),
  },
})
const current = (records = [], target = '2026-10-15') => ({
  coverage: { fundCode: '002112', status: 'READY_EXPERIMENTAL' },
  window: { status: 'OPEN', targetNavDate: target, nextWindowOpenAt: `${target}T15:00:00+08:00` }, history: { items: records },
})
const analysisRecord = (date = '2026-10-15') => ({ ...record(date), forecast: {
  ...record(date).forecast, schemaVersion: 'DIRECTION_1D_ANALYSIS_V1', latestNavDate: '2026-10-14', validationStatus: 'UNVALIDATED',
  analysis: { direction: 'DOWN', confidence: 'LOW', summary: '样例下跌依据', synthesis: '样例综合说明' },
  narrative: { styleVersion: 'PREDICTION_INFORMATION_ZH_V4', summary: '样例下跌依据', context: '样例综合说明', limitations: [] },
} })

test('只选择本基金预测窗口目标日的有效记录，不能回退其他日期或旧协议', () => {
  const valid = record()
  assert.equal(direction1dDisplayRecord(current([record('2026-10-12'), valid]), '002112'), valid)
  for (const item of [record('2026-10-12'), record('2026-10-14'), record('2026-10-16'),
    { ...valid, status: 'EVIDENCE_CORRUPTED' },
    { ...valid, forecast: { ...valid.forecast, fundCode: '008888' } },
    { ...valid, forecast: { ...valid.forecast, schemaVersion: 'DIRECTION_1D_EXPERIMENT_V1' } },
    { ...valid, forecast: { ...valid.forecast, schemaVersion: 'DIRECTION_1D_EXPERIMENT_V2' } }]) {
    assert.equal(direction1dDisplayRecord(current([item]), '002112'), null)
  }
  assert.equal(direction1dDisplayRecord(current([valid], ''), '002112'), null)
})

// 编译并运行真实 Vue 组件，API 使用内存替身；不接触服务、同步任务或数据库。
const renderer = createRenderer({
  createElement: type => ({ type, children: [], props: {}, text: '' }),
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
  remove(node) {
    if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1)
    node.parent = null
  },
  parentNode: node => node.parent,
  nextSibling: node => node.parent?.children[node.parent.children.indexOf(node) + 1] ?? null,
})
const textOf = node => `${node.text ?? ''}${(node.children ?? []).map(textOf).join('')}`
const settle = async () => { await Promise.resolve(); await nextTick(); await Promise.resolve(); await nextTick() }

async function mount(t, response, time = '2026-10-14T16:00:00+08:00') {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: new Date(time) })
  let value = response
  const calls = { read: 0, evidence: [], generate: [] }
  const key = `__dailyPanelTest${Math.random().toString(16).slice(2)}`
  globalThis[key] = {
    async getDirection1dCurrent() { calls.read++; if (value instanceof Error) throw value; return value },
    async getDirection1dEvidence(_fund, id) { calls.evidence.push(id); throw new Error('没有样例依据') },
    async generateDirection1d(_fund, target) { calls.generate.push(target); return { status: 'FAILED', reason: 'ANALYSIS_RESULT_LIMIT' } },
  }
  const apiUrl = moduleUrl(`const api = globalThis[${JSON.stringify(key)}];
    export const { getDirection1dCurrent, getDirection1dEvidence, generateDirection1d } = api;`)
  const { descriptor } = parse(read('../src/components/Direction1dPanel.vue'))
  const script = compileScript(descriptor, { id: 'daily-current-test', inlineTemplate: true })
  const imports = {
    vue: pathToFileURL(createRequire(import.meta.url).resolve('vue')).href,
    '@/api/direction1d': apiUrl, '@/utils/direction1d': directionUrl,
    '@/utils/predictionEvidence': evidenceUrl,
    '@/utils/uuid': moduleUrl('export const createUUID = () => "sample-request"'),
  }
  let code = ts.transpileModule(script.content, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  for (const [from, to] of Object.entries(imports)) {
    code = code.replaceAll(`from '${from}'`, `from '${to}'`).replaceAll(`from "${from}"`, `from '${to}'`)
  }
  const component = (await import(moduleUrl(code))).default
  const root = { children: [] }
  const app = renderer.createApp(component, { fundCode: '002112', selected: true })
  const panel = app.mount(root)
  t.after(() => { app.unmount(); delete globalThis[key]; t.mock.timers.reset() })
  await settle()
  return { panel, calls, text: () => textOf(root), setResponse: response => { value = response } }
}

test('页面只剩10月12日旧档时显示10月15日暂无预测，不读取旧依据', async t => {
  const view = await mount(t, current([analysisRecord('2026-10-12')]))
  assert.match(view.text(), /暂无预测.*2026-10-15/)
  assert.doesNotMatch(view.text(), /2026-10-12|预计上涨|上次结果|净值截至/)
  assert.equal(view.panel.forecast, null)
  assert.equal(view.panel.forecastId, undefined)
  assert.equal(view.panel.evidence.facts.length, 0)
  assert.match(view.panel.evidence.summary, /暂无预测/)
  assert.deepEqual(view.calls.evidence, [])
  assert.deepEqual(view.calls.generate, [])
})

test('15点后按接口的下一交易日同时展示方向、日期和对应依据编号', async t => {
  const view = await mount(t, current([record()]))
  assert.match(view.text(), /预计偏上涨.*2026-10-15.*净值截至 2026-10-14/)
  assert.equal(view.panel.forecastId, 'forecast-2026-10-15')
  assert.deepEqual(view.calls.evidence, ['forecast-2026-10-15'])
  assert.deepEqual(view.calls.generate, [])
})

test('002112综合分析同样只在窗口目标日匹配时展示方向和本条依据', async t => {
  const view = await mount(t, current([analysisRecord()]))
  assert.match(view.text(), /预计偏下跌.*2026-10-15.*净值截至 2026-10-14/)
  assert.equal(view.panel.evidence.summary, '样例下跌依据')
  assert.equal(view.panel.forecastId, 'forecast-2026-10-15')
})

test('15点前显示当天的有效预测，点击更新仍使用当天目标日', async t => {
  const view = await mount(t, current([record('2026-10-14')], '2026-10-14'), '2026-10-14T09:30:00+08:00')
  assert.match(view.text(), /预计偏上涨.*2026-10-14/)
  assert.deepEqual(view.calls.evidence, ['forecast-2026-10-14'])
  await view.panel.refresh(true)
  assert.match(view.text(), /预计偏上涨.*2026-10-14/)
  assert.deepEqual(view.calls.generate, ['2026-10-14'])
})

test('15点前缺少当天结果时显示当天暂无预测，不借用更早或明天的结果', async t => {
  const view = await mount(t, current([record('2026-10-12'), record('2026-10-15')], '2026-10-14'), '2026-10-14T14:59:59+08:00')
  assert.match(view.text(), /暂无预测.*2026-10-14/)
  assert.equal(view.panel.forecastId, undefined)
  assert.deepEqual(view.calls.evidence, [])
  assert.deepEqual(view.calls.generate, [])
})

test('下午更新失败仍显示暂无预测，成功读取新结果后才展示其方向', async t => {
  const view = await mount(t, current([record('2026-10-12')]))
  view.setResponse(current([record('2026-10-12')]))
  await view.panel.refresh(true)
  assert.deepEqual(view.calls.generate, ['2026-10-15'])
  assert.match(view.text(), /暂无预测.*2026-10-15/)
  assert.equal(view.panel.forecastId, undefined)
  assert.doesNotMatch(view.panel.evidenceStatus, /原判断仍保留/)
  view.setResponse(current([record()]))
  await view.panel.refresh()
  assert.match(view.text(), /预计偏上涨.*2026-10-15/)
})

test('15点整只读刷新预测窗口并清空当天旧方向和旧依据', async t => {
  const view = await mount(t, current([record('2026-10-14')], '2026-10-14'), '2026-10-14T14:59:59+08:00')
  assert.match(view.text(), /预计偏上涨.*2026-10-14/)
  view.setResponse(current([record('2026-10-14')]))
  t.mock.timers.tick(1000)
  await settle()
  assert.match(view.text(), /暂无预测.*2026-10-15/)
  assert.equal(view.panel.forecastId, undefined)
  assert.equal(view.panel.evidence.facts.length, 0)
  assert.deepEqual(view.calls.generate, [])
  assert.equal(view.calls.read, 2)
})

test('15点切换时接口失败也不能继续展示已经过期的当天结果', async t => {
  const view = await mount(t, current([record('2026-10-14')], '2026-10-14'), '2026-10-14T14:59:59+08:00')
  view.setResponse(new Error('读取失败'))
  t.mock.timers.tick(1000)
  await settle()
  assert.doesNotMatch(view.text(), /预计偏上涨|2026-10-14|净值截至/)
  assert.equal(view.panel.forecastId, undefined)
  assert.equal(view.panel.evidence.facts.length, 0)
  assert.deepEqual(view.calls.generate, [])
})

test('午夜不自定下一交易日，继续使用尚未到期的预测窗口', async t => {
  const view = await mount(t, current([record()]), '2026-10-14T23:59:30+08:00')
  assert.match(view.text(), /预计偏上涨/)
  t.mock.timers.tick(60_000)
  await settle()
  assert.match(view.text(), /预计偏上涨.*2026-10-15/)
  assert.equal(view.panel.forecastId, 'forecast-2026-10-15')
  assert.deepEqual(view.calls.generate, [])
  assert.equal(view.calls.read, 1)
})

test('非交易日直接采用预测接口目标日，不按普通工作日猜测', async t => {
  const view = await mount(t, current([record('2026-10-12')], '2026-10-12'), '2026-10-10T09:30:00+08:00')
  assert.match(view.text(), /预计偏上涨.*2026-10-12/)
  assert.equal(view.panel.forecastId, 'forecast-2026-10-12')
  assert.deepEqual(view.calls.generate, [])
})
