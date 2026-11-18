import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { Buffer } from 'node:buffer'
import { createRequire, stripTypeScriptTypes } from 'node:module'
import { pathToFileURL, URL } from 'node:url'
import { compileScript, parse } from '@vue/compiler-sfc'
import { createRenderer, h, nextTick, ref } from 'vue'
import ts from 'typescript'

const url = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8')
const vue = pathToFileURL(createRequire(import.meta.url).resolve('vue')).href
const settle = async () => { for (let i = 0; i < 8; i++) { await Promise.resolve(); await nextTick() } }
const renderer = createRenderer({
  createElement: type => ({ type, tagName: type.toUpperCase(), children: [], props: {}, text: '',
    addEventListener() {}, removeEventListener() {},
    get options() { return this.children.filter(n => n.type === 'option') },
    get value() { return this.props.value },
  }),
  createText: text => ({ text }), createComment: () => ({ text: '' }),
  setText: (node, text) => { node.text = text },
  setElementText: (node, text) => { node.text = text; node.children = [] },
  patchProp: (node, key, _old, value) => { node.props[key] = value },
  insert(node, parent, anchor) {
    if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1)
    node.parent = parent
    const i = anchor ? parent.children.indexOf(anchor) : -1
    parent.children.splice(i < 0 ? parent.children.length : i, 0, node)
  },
  remove(node) { if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1); node.parent = null },
  parentNode: node => node.parent,
  nextSibling: node => node.parent?.children[node.parent.children.indexOf(node) + 1] ?? null,
})
const textOf = node => `${node.text ?? ''}${(node.children ?? []).map(textOf).join('')}`
const descendants = node => [node, ...(node.children ?? []).flatMap(descendants)]
function compile(path, replacements = {}) {
  const { descriptor } = parse(read(path))
  const script = compileScript(descriptor, { id: path, inlineTemplate: true })
  let code = ts.transpileModule(script.content, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  for (const [from, to] of Object.entries({ vue, ...replacements })) code = code.replaceAll(`from '${from}'`, `from '${to}'`).replaceAll(`from "${from}"`, `from '${to}'`)
  return url(code)
}
const report = code => ({
  reportId: 'saved', fundCode: code, strategyVersion: 'HOLDING_ADVICE_V4_EVIDENCE', generationStatus: 'SUCCEEDED',
  adviceState: 'READY', applicability: 'CURRENT', decision: 'HOLD', summary: `${code}继续持有，暂缓加仓。`,
  generatedAt: '2026-11-16T08:00:00Z', validUntil: '2099-01-01T00:00:00Z', dataAsOf: '2026-10-30',
  qualityAssessment: '完整评分仅用于质量参考。', timingAssessment: '短期与中期分歧。', personalAssessment: '已有待买订单。',
  supportingEvidence: [], opposingEvidence: [], neutralEvidence: [], facts: ['评分考察日2026-10-30'],
  missingOptionalFactors: [], executionConstraints: ['已有待确认买入，不重复追加。'], reassessmentConditions: ['订单变化后复核。'],
  periodAssessments: [{ horizonId: 'M6_V1', kind: 'CONDITIONAL_OUTLOOK', decision: 'UP', summary: '长期有条件支持。',
    startDate: '2026-11-16', endDate: null, sourceCutoff: '2026-11-16T08:00:00Z', conditions: [], limitations: [], counterReason: '汇率风险。' }],
  modelRefs: [], preference: 'BALANCED', defaultPreference: true,
})
async function mount(t, readResult, options = {}) {
  const calls = { read: [], generate: [], history: [] }
  const key = `__holdingAdvice${Math.random().toString(16).slice(2)}`
  globalThis[key] = {
    readDecision: async code => { calls.read.push(code); return readResult(code) },
    generateDecision: async code => { calls.generate.push(code); return options.generate?.(code) ?? report(code) },
    readDecisionHistory: async (code, page, version) => { calls.history.push({ code, page, version }); return options.history ?? [] },
    readDecisionOutcomes: async () => ({}), readStrategyPreference: async () => ({ preference: 'BALANCED', defaultPreference: true }),
    saveStrategyPreference: async () => ({}),
  }
  const details = compile('../src/components/HoldingAdviceDetails.vue', {
    '@/utils/holdingAdvicePresentation': url(stripTypeScriptTypes(read('../src/utils/holdingAdvicePresentation.ts'))),
  })
  const component = (await import(compile('../src/components/DecisionPanelV2.vue', {
    'vue-router': url("export const useRoute = () => ({fullPath:'/portfolio?section=holdings&holding=008888'})"),
    '@/components/HoldingAdviceDetails.vue': details,
    '@/components/PredictionHistoryDrawer.vue': url(`import {h} from '${vue}';export default {props:['title'],emits:['close'],setup:(props,{slots,emit})=>()=>h('dialog',{open:true},[h('h2',{},props.title),slots.default?.(),h('button',{onClick:()=>emit('close')},'关闭')])}`),
    '@/components/ListPagination.vue': url('export default { render: () => null }'),
    '@/api/multiPrediction': url(`export const {readDecision,generateDecision,readDecisionHistory,readDecisionOutcomes,readStrategyPreference,saveStrategyPreference} = globalThis[${JSON.stringify(key)}]`),
    '@/stores/auth': url('export const useAuthStore = () => ({ hasPermission: () => true })'),
    '@/utils/predictionHorizon': url(stripTypeScriptTypes(read('../src/utils/predictionHorizon.ts'))),
    '@/utils/pagination': url(stripTypeScriptTypes(read('../src/utils/pagination.ts'))),
  }))).default
  const fund = ref('008888')
  const root = { children: [] }
  const app = renderer.createApp({ setup: () => () => h(component, { fundCode: fund.value, compact: options.compact, historyOnly: options.historyOnly }) })
  app.component('RouterLink', { setup: (_, { slots }) => () => h('a', {}, slots.default?.()) })
  t.after(() => { app.unmount(); delete globalThis[key] })
  app.mount(root)
  await settle()
  return { calls, fund, text: () => textOf(root), nodes: () => descendants(root), buttons: () => descendants(root).filter(n => n.type === 'button') }
}
test('完整报告按业务问题展示，不显示后台字段', async t => {
  const view = await mount(t, code => report(code))
  assert.match(view.text(), /为什么这样建议.*不同周期的依据与分歧.*有条件展望.*实际结束日期待核/)
  assert.match(view.text(), /操作前需要留意.*待确认买入.*什么变化后需要再看/)
  assert.doesNotMatch(view.text(), /HOLDING_ADVICE|CONDITIONAL_OUTLOOK|modelHash/)
  assert.deepEqual(view.calls.generate, [])
})
test('资料不足与生成失败分别显示', async t => {
  const view = await mount(t, code => ({ ...report(code), adviceState: 'INSUFFICIENT', decision: null, summary: '五日资料不足，暂不判断。' }))
  assert.match(view.text(), /暂不形成综合建议/)
  assert.doesNotMatch(view.text(), /本次建议生成失败/)
  const failed = await mount(t, code => ({ ...report(code), generationStatus: 'FAILED', adviceState: 'FAILED', decision: null }))
  assert.match(failed.text(), /本次建议生成失败/)
})
test('过期和个人状态变化提示重新评估，原文保留', async t => {
  const view = await mount(t, code => ({ ...report(code), applicability: 'CHANGED', applicabilityMessage: '订单已变化，请重新评估。' }))
  assert.match(view.text(), /已有建议需重新评估.*订单已变化.*继续持有，暂缓加仓/)
  const expired = await mount(t, code => ({ ...report(code), validUntil: '2000-01-01T00:00:00Z' }))
  assert.match(expired.text(), /已有建议需重新评估/)
})
test('抽屉只读核对最新报告，不自动生成', async t => {
  const view = await mount(t, code => report(code), { compact: true })
  assert.deepEqual(view.calls.read, ['008888'])
  assert.deepEqual(view.calls.generate, [])
  assert.match(view.text(), /短期与中期分歧.*待确认买入/)
  assert.doesNotMatch(view.text(), /评分、诊断与其他已知事实/)
})
test('建议页面不再显示生成按钮，仍可切换基金查看已有建议', async t => {
  const view = await mount(t, code => report(code))
  assert.equal(view.buttons().some(n => /生成当前综合建议/.test(textOf(n))), false)
  view.fund.value = '021740'
  await settle()
  assert.match(view.text(), /021740继续持有/)
  assert.deepEqual(view.calls.generate, [])
})
test('历史只列建议，依据与核对点击后进入右侧抽屉', async t => {
  const view = await mount(t, () => null, { historyOnly: true, history: [report('008888')] })
  assert.equal(view.calls.history[0].version, undefined)
  assert.deepEqual(view.calls.generate, [])
  assert.equal(view.nodes().some(node => node.type === 'select' || node.type === 'dialog'), false)
  assert.match(view.text(), /008888继续持有.*查看当时依据与核对/)
  assert.doesNotMatch(view.text(), /建议记录|按时间保留|当前持仓综合建议|此前持仓综合建议|此前综合建议|早期综合建议/)
  const trigger = view.buttons().find(node => /查看当时依据与核对/.test(textOf(node)))
  assert.ok(trigger)
  trigger.props.onClick()
  await settle()
  assert.equal(view.nodes().some(node => node.type === 'dialog'), true)
  assert.match(view.text(), /当时依据与核对.*为什么这样建议/)
  const close = view.buttons().find(node => textOf(node) === '关闭')
  assert.ok(close)
  close.props.onClick()
  await settle()
  assert.equal(view.nodes().some(node => node.type === 'dialog'), false)
})
test('旧报告仍显示原建议与依据，后台身份不进入日常页面', async t => {
  const old = { ...report('008888'), strategyVersion: 'HOLDING_ADVICE_V3_THREE_STATE',
    summary: '此前保存的持有判断。', supportingEvidence: ['二十日原始支持依据。'],
    modelRefs: [{ predictionId: 'old-prediction', horizonId: 'T20_V1', modelId: 'private-model', modelHash: 'private-hash', activationRevision: 3 }] }
  const view = await mount(t, () => null, { historyOnly: true, history: [old] })
  const trigger = view.buttons().find(node => /查看当时依据与核对/.test(textOf(node)))
  assert.ok(trigger)
  trigger.props.onClick()
  await settle()
  assert.match(view.text(), /此前保存的持有判断.*二十日原始支持依据/)
  assert.doesNotMatch(view.text(), /private-model|private-hash|采用版本/)
  assert.deepEqual(view.calls.generate, [])
})

test('抽屉显示周期分歧的关键摘录，详细原文只在完整页保留', async t => {
  const value = report('008888')
  value.periodAssessments = ['T5_V1', 'T20_V1'].map((horizonId, index) => ({ ...value.periodAssessments[0],
    horizonId, kind: 'DATED_ANALYSIS', decision: index ? 'UP' : 'DOWN', endDate: '2026-11-25',
    summary: `${index ? '中期经营有支持' : '短期承接偏弱'}。详细原文标记及后续完整分析。`, counterReason: '当前仍有相反因素，不能视为确定收益。' }))
  value.qualityAssessment = '收益能力：考察期收益为负。；风险控制：回撤不能代表未来上限。；费用：持有有成本。'
  value.facts = ['费用：持有有成本。', '费用：年管理费率0.50%、年托管费率0.10%；已反映在净值。']
  const compact = await mount(t, () => value, { compact: true })
  assert.match(compact.text(), /关键依据.*五日依据.*短期承接偏弱.*二十日依据.*中期经营有支持/)
  assert.doesNotMatch(compact.text(), /详细原文标记|评分分项|持有有成本/)
  const full = await mount(t, () => value)
  assert.match(full.text(), /基金质量与评分分项.*收益能力.*风险控制.*费用/)
  assert.match(full.text(), /详细原文标记及后续完整分析/)
  assert.match(full.text(), /年管理费率0.50%.*年托管费率0.10%/)
  assert.equal(full.text().match(/持有有成本。/g).length, 1)
  assert.equal(full.nodes().some(node => node.type === 'p' && node.text === value.qualityAssessment), false)
})
test('抽屉不因缩短内容而隐藏关键缺项、冻结或本人规则', async t => {
  const value = { ...report('008888'), adviceState: 'INSUFFICIENT', decision: null,
    missingOptionalFactors: ['完整评分不足。', '二十日缺少明确方向。'],
    executionConstraints: ['一般说明。', '已有待确认卖出，不重复卖出。', '存在冻结份额。'],
    opposingEvidence: ['已达到本人确认的止盈线，应复核持仓。'] }
  const view = await mount(t, () => value, { compact: true })
  assert.match(view.text(), /尚缺依据.*完整评分不足.*二十日缺少明确方向/)
  assert.match(view.text(), /操作前留意.*待确认卖出.*冻结份额.*本人确认的止盈线/)
})

test('读取完成前不闪现尚无建议或默认偏好，切换基金也不显示旧结论', async t => {
  let resolve
  const view = await mount(t, () => new Promise(done => { resolve = done }))
  assert.match(view.text(), /正在读取综合建议/)
  assert.doesNotMatch(view.text(), /尚无综合建议|尚未设置个人偏好/)
  resolve(report('008888')); await settle()
  assert.match(view.text(), /继续持有/)
  view.fund.value = '021740'; await settle()
  assert.match(view.text(), /正在读取综合建议/)
  assert.doesNotMatch(view.text(), /尚无综合建议|008888继续持有/)
  resolve(report('021740')); await settle()
  assert.match(view.text(), /021740继续持有/)
})
test('读取成功为空才显示尚无建议，读取失败只显示错误与重试', async t => {
  const empty = await mount(t, () => null)
  assert.match(empty.text(), /尚无综合建议/)
  const failed = await mount(t, () => { throw new Error('暂时无法读取') })
  assert.match(failed.text(), /综合建议暂时无法读取.*重新读取/)
  assert.doesNotMatch(failed.text(), /尚无综合建议|尚未设置个人偏好/)
})
