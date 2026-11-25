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
const utility = url(stripTypeScriptTypes(read('../src/utils/predictionReview.ts')))
const settle = async () => { for (let i = 0; i < 4; i++) { await Promise.resolve(); await nextTick() } }
const renderer = createRenderer({
  createElement: type => ({ type, children: [], props: {}, text: '' }),
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
const snapshot = code => ({ fundCode: code, marketAsOf: '2026-11-11', adoptedAt: '', reviewedAt: '', periods: [
  { horizonId: 'T1', decision: 'DOWN', kind: 'DATED_ANALYSIS', confidence: 'LOW', startDate: '2026-11-12', endDate: '2026-11-12',
    nominalEndDate: null, baseNavDate: '2026-11-11', analysisAt: '2026-11-12T16:00:00+08:00', summary: `${code}一日旧判断`,
    primaryReason: '回吐压力略占优势。', counterReason: '阶段修复仍保留。', conditions: ['承接转强时重判。'], limitations: ['把握较低。'], awaitingReason: null },
  { horizonId: 'M6_V1', decision: 'UP', kind: 'CONDITIONAL_OUTLOOK', confidence: 'LOW', startDate: '2026-11-12', endDate: null,
    nominalEndDate: '2027-05-11', baseNavDate: '2026-11-11', analysisAt: '2026-11-12T16:00:00+08:00', summary: '经营支撑。',
    primaryReason: '盈利改善。', counterReason: '订单较弱。', conditions: [], limitations: [], awaitingReason: null },
] })

async function mount(t, readResult, target = '2026-11-12') {
  const calls = []
  const key = `__reviewPanel${Math.random().toString(16).slice(2)}`
  globalThis[key] = {
    async readCurrentForecast(code) {
      calls.push(code)
      return { fundCode: code, review: await readResult(code), window: {
        baseNavDate: target && '2026-11-11', targetNavDate: target, nextWindowOpenAt: '2099-01-01T00:00:00+08:00',
        periods: [{ horizonId: 'T5_V1', endDate: '2026-11-23' }],
      } }
    },
  }
  const { descriptor } = parse(read('../src/components/MultiPredictionPanel.vue'))
  const script = compileScript(descriptor, { id: key, inlineTemplate: true })
  let code = ts.transpileModule(script.content, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  code = code.replace(/import ['"]@\/styles\/prediction\.css['"];?/, '')
  for (const [from, to] of Object.entries({
    vue: pathToFileURL(createRequire(import.meta.url).resolve('vue')).href,
    '@/components/PredictionHistoryDrawer.vue': url(`import { h } from '${pathToFileURL(createRequire(import.meta.url).resolve('vue')).href}'; export default { props: ['title'], emits: ['close'], setup(props, { slots, emit }) { return () => h('dialog', { open: true }, [h('h2', props.title), h('button', { onClick: () => emit('close') }, '关闭'), slots.default?.()]) } }`),
    '@/api/predictionReview': url(`export const { readCurrentForecast } = globalThis[${JSON.stringify(key)}]`),
    '@/utils/predictionReview': utility,
  })) code = code.replaceAll(`from '${from}'`, `from '${to}'`).replaceAll(`from "${from}"`, `from '${to}'`)
  const component = (await import(url(code))).default
  const fund = ref('006730')
  const root = { children: [] }
  const app = renderer.createApp({ setup: () => () => h(component, { fundCode: fund.value }) })
  app.mount(root)
  t.after(() => { app.unmount(); delete globalThis[key] })
  await settle()
  return { calls, fund, text: () => textOf(root), buttons: () => descendants(root).filter(n => n.type === 'button') }
}

test('真实四卡显示本期预测和半年待核日期，点击周期仅切换依据', async t => {
  const view = await mount(t, code => snapshot(code))
  assert.equal(view.buttons().length, 4)
  assert.match(view.text(), /一日预测.*偏下跌.*目标日 2026-11-12/)
  assert.match(view.text(), /偏上涨.*到期估值日待确认.*名义到期 2027-05-11/)
  await view.buttons()[3].props.onClick()
  await settle()
  assert.match(view.text(), /主要依据.*盈利改善.*相反因素如何取舍.*订单较弱/)
  assert.deepEqual(view.calls, ['006730'])
})

test('null与读取失败分开，均不调用旧预测补卡', async t => {
  const empty = await mount(t, () => null)
  assert.match(empty.text(), /待发布/)
  assert.doesNotMatch(empty.text(), /暂时无法读取/)
  const failed = await mount(t, () => { throw new Error('backend failure') })
  assert.match(failed.text(), /分析暂时无法读取/)
  assert.doesNotMatch(failed.text(), /backend failure|当时弱偏/)
  assert.deepEqual(failed.calls, ['006730'])
})

test('暂不判断在卡片保留原因，并在依据区解释取舍', async t => {
  const view = await mount(t, code => {
    const value = snapshot(code)
    value.periods.push({ ...value.periods[0], horizonId: 'T5_V1', kind: 'DATED_ANALYSIS', decision: 'ABSTAIN',
      endDate: '2026-11-18', awaitingReason: '主要经营支撑和订单压力仍难分主次。' })
    return value
  })
  assert.match(view.text(), /五日预测.*暂不判断.*主要经营支撑和订单压力仍难分主次/)
  assert.match(view.text(), /已审阅 · 暂无方向/)
  assert.match(view.text(), /分析于/)
  await view.buttons()[1].props.onClick()
  await settle()
  assert.match(view.text(), /暂不判断：主要经营支撑和订单压力仍难分主次/)
  assert.match(view.text(), /已完成这次审阅.*重新评估/)
  assert.match(view.text(), /出现哪些变化后重新判断/)
})

test('没有本期结果时显示已确认的日期，抽屉也只说明本期状态', async t => {
  const view = await mount(t, () => null, '2026-11-17')
  await view.buttons()[0].props.onClick()
  await settle()
  assert.deepEqual(view.calls, ['006730'])
  assert.match(view.text(), /五日预测.*起始日 2026-11-17 · 到期日 2026-11-23/)
  assert.match(view.text(), /从 2026-11-17 起算的预测待发布/)
  assert.doesNotMatch(view.text(), /等待.*净值|偏下跌|偏上涨/)
})

test('半年暂不判断显示已审阅，不声称已有条件方向', async t => {
  const view = await mount(t, code => {
    const value = snapshot(code)
    value.periods[1] = { ...value.periods[1], decision: 'ABSTAIN', summary: '主要路径仍有分歧。', awaitingReason: '转换权益与现金路径相互抵消。' }
    return value
  })
  await view.buttons()[3].props.onClick()
  await settle()
  assert.match(view.text(), /半年分析 · 终点待核/)
  assert.match(view.text(), /已审阅 · 暂无方向/)
  assert.match(view.text(), /本次尚未给出方向/)
  assert.doesNotMatch(view.text(), /以下方向需要所列条件成立/)
})

test('真实组件切换基金时，晚到的旧响应不会盖掉新基金', async t => {
  let finishOld
  const old = new Promise(resolve => { finishOld = resolve })
  const view = await mount(t, code => code === '006730' ? old : snapshot(code))
  view.fund.value = '007832'
  await settle()
  finishOld(snapshot('006730'))
  await settle()
  await view.buttons()[0].props.onClick()
  await settle()
  assert.match(view.text(), /007832一日旧判断/)
  assert.doesNotMatch(view.text(), /006730一日旧判断/)
})


test('零点切到17日，旧一期四周期及依据不作为当前结果展示', async t => {
  const view = await mount(t, code => {
    const value = snapshot(code)
    value.periods.push({ ...value.periods[0], horizonId: 'T5_V1', kind: 'DATED_ANALYSIS', endDate: '2026-11-20', summary: '旧五日依据' })
    return value
  }, '2026-11-17')
  assert.match(view.text(), /一日预测.*待发布.*目标日 2026-11-17/)
  assert.match(view.text(), /五日预测.*待发布.*起始日 2026-11-17/)
  assert.doesNotMatch(view.text(), /偏下跌|偏上涨|一日旧判断|2026-11-12/)
  await view.buttons()[0].props.onClick()
  await settle()
  assert.match(view.text(), /从 2026-11-17 起算的预测待发布/)
})


test('依据默认收起，点击打开抽屉，关闭后撤销选中状态', async t => {
  const view = await mount(t, code => snapshot(code))
  assert.doesNotMatch(view.text(), /主要依据|回吐压力略占优势/)
  assert.equal(view.buttons()[0].props['aria-expanded'], false)
  await view.buttons()[0].props.onClick()
  await settle()
  assert.equal(view.buttons()[0].props['aria-expanded'], true)
  assert.match(view.text(), /一日预测 · 判断依据.*主要依据.*回吐压力略占优势/)
  await view.buttons().find(button => textOf(button) === '关闭').props.onClick()
  await settle()
  assert.doesNotMatch(view.text(), /主要依据|回吐压力略占优势/)
  assert.equal(view.buttons()[0].props['aria-expanded'], false)
})
