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
  { horizonId: 'T1', decision: 'DOWN', kind: 'RETROSPECTIVE', confidence: 'LOW', startDate: '2026-11-12', endDate: '2026-11-12',
    nominalEndDate: null, baseNavDate: '2026-11-11', analysisAt: '2026-11-12T16:00:00+08:00', summary: `${code}一日旧判断`,
    primaryReason: '回吐压力略占优势。', counterReason: '阶段修复仍保留。', conditions: ['承接转强时重判。'], limitations: ['把握较低。'], awaitingReason: null },
  { horizonId: 'M6_V1', decision: 'UP', kind: 'CONDITIONAL_OUTLOOK', confidence: 'LOW', startDate: '2026-11-12', endDate: null,
    nominalEndDate: '2027-05-11', baseNavDate: '2026-11-11', analysisAt: '2026-11-12T16:00:00+08:00', summary: '经营支撑。',
    primaryReason: '盈利改善。', counterReason: '订单较弱。', conditions: [], limitations: [], awaitingReason: null },
] })

async function mount(t, readResult, updateResult) {
  const calls = { read: [], update: [] }
  const key = `__reviewPanel${Math.random().toString(16).slice(2)}`
  globalThis[key] = {
    async readPredictionReview(code) { calls.read.push(code); return readResult(code) },
    async requestPredictionReview(code) { calls.update.push(code); return updateResult?.(code) },
  }
  const { descriptor } = parse(read('../src/components/MultiPredictionPanel.vue'))
  const script = compileScript(descriptor, { id: key, inlineTemplate: true })
  let code = ts.transpileModule(script.content, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  code = code.replace(/import ['"]@\/styles\/prediction\.css['"];?/, '')
  for (const [from, to] of Object.entries({
    vue: pathToFileURL(createRequire(import.meta.url).resolve('vue')).href,
    '@/api/predictionReview': url(`export const { readPredictionReview, requestPredictionReview } = globalThis[${JSON.stringify(key)}]`),
    '@/utils/predictionReview': utility,
    '@/stores/auth': url('export const useAuthStore = () => ({ hasPermission: () => true })'),
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

test('真实四卡明确显示一日复盘和半年待核日期，点击周期仅切换依据', async t => {
  const view = await mount(t, code => snapshot(code))
  assert.equal(view.buttons().length, 5)
  assert.match(view.text(), /一日复盘.*当时弱偏下.*2026-11-12 至 2026-11-12.*区间已结束/)
  assert.match(view.text(), /条件弱偏上.*终点待核.*名义到期 2027-05-11/)
  await view.buttons()[4].props.onClick()
  await settle()
  assert.match(view.text(), /主要依据.*盈利改善.*相反因素如何取舍.*订单较弱/)
  assert.deepEqual(view.calls.read, ['006730'])
  assert.deepEqual(view.calls.update, [])
})

test('null与读取失败分开，均不调用旧预测补卡', async t => {
  const empty = await mount(t, () => null)
  assert.match(empty.text(), /分析待更新/)
  assert.doesNotMatch(empty.text(), /暂时无法读取/)
  const failed = await mount(t, () => { throw new Error('backend failure') })
  assert.match(failed.text(), /分析暂时无法读取/)
  assert.doesNotMatch(failed.text(), /backend failure|当时弱偏/)
  assert.deepEqual(failed.calls.update, [])
})

test('暂不判断在卡片保留原因，并在依据区解释取舍', async t => {
  const view = await mount(t, code => {
    const value = snapshot(code)
    value.periods.push({ ...value.periods[0], horizonId: 'T5_V1', kind: 'DATED_ANALYSIS', decision: 'ABSTAIN',
      endDate: '2026-11-18', awaitingReason: '主要经营支撑和订单压力仍难分主次。' })
    return value
  })
  assert.match(view.text(), /五日预测.*暂不判断.*主要经营支撑和订单压力仍难分主次/)
  await view.buttons()[2].props.onClick()
  await settle()
  assert.match(view.text(), /暂不判断：主要经营支撑和订单压力仍难分主次/)
})

test('更新等待新净值时保留原日期和等待说明，不宣称新分析完成', async t => {
  const view = await mount(t, code => snapshot(code), () => ({ status: 'WAITING_FOR_NAV', summary: '正在等待新的真实净值。', requestedAt: '' }))
  await view.buttons()[0].props.onClick()
  await settle()
  assert.deepEqual(view.calls.update, ['006730'])
  assert.deepEqual(view.calls.read, ['006730', '006730'])
  assert.match(view.text(), /正在等待新的真实净值.*当前新分析尚未完成/)
  assert.match(view.text(), /2026-11-12 至 2026-11-12/)
  assert.doesNotMatch(view.text(), /2026-11-13|更新完成/)
})

test('真实组件切换基金时，晚到的旧响应不会盖掉新基金', async t => {
  let finishOld
  const old = new Promise(resolve => { finishOld = resolve })
  const view = await mount(t, code => code === '006730' ? old : snapshot(code))
  view.fund.value = '007832'
  await settle()
  finishOld(snapshot('006730'))
  await settle()
  assert.match(view.text(), /007832一日旧判断/)
  assert.doesNotMatch(view.text(), /006730一日旧判断/)
})
