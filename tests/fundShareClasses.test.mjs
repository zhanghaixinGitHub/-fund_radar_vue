import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createSSRApp, effectScope, ref, nextTick } from 'vue'
import { renderToString } from '@vue/server-renderer'

let server, component, useRelations
before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
  component = (await server.ssrLoadModule('/src/components/FundShareClassLinks.vue')).default
  useRelations = (await server.ssrLoadModule('/src/composables/useFundShareClasses.ts')).useFundShareClasses
})
after(async () => { await server?.close() })

// 隔离份额夹具只检验展示和请求隔离，不作为真实基金归属依据。
const packet = code => ({ fundCode: code, status: 'VERIFIED', asOfDate: '2026-09-30',
  shares: [
    { fundCode: code, fundName: '当前份额', shareClass: 'C', currency: '人民币' },
    { fundCode: '900001', fundName: '其他A份额', shareClass: 'A', currency: '美元现汇' },
    { fundCode: '900002', fundName: '其他E份额', shareClass: 'E', currency: null },
  ] })
const render = props => renderToString(createSSRApp(component, {
  fundCode: '900000', relations: packet('900000'), loading: false, failed: false, ...props,
}))

test('任何服务端核实的代码都可展示，排除当前份额并保留类别和币种', async () => {
  const html = await render()
  assert.match(html, /A类份额（美元现汇）/)
  assert.match(html, /E类份额/)
  assert.match(html, /900001/)
  assert.doesNotMatch(html, /900000|当前份额|DISCLOSED|share-classes/)
})

test('未知、读取失败、单份额和资料过期保持不同业务状态', async () => {
  assert.match(await render({ relations: { ...packet('900000'), status: 'UNVERIFIED', shares: [] } }), /暂未核实/)
  assert.match(await render({ relations: null, failed: true }), /暂时无法获取/)
  assert.match(await render({ relations: { ...packet('900000'), shares: packet('900000').shares.slice(0, 1) } }),
    /截至 2026-09-30 未列出其他份额/)
  const stale = await render({ relations: { ...packet('900000'), status: 'STALE' } })
  assert.match(stale, /900001/)
  assert.match(stale, /截至 2026-09-30，待更新/)
})

test('切换基金后丢弃旧响应，并清空旧关系；失败不会伪造单份额', async () => {
  const pending = new Map()
  const code = ref('900000')
  const scope = effectScope()
  const state = scope.run(() => useRelations(code, value => new Promise((resolve, reject) => {
    pending.set(value, { resolve, reject })
  })))
  try {
    code.value = '900003'
    await nextTick()
    pending.get('900003').resolve(packet('900003'))
    await nextTick()
    pending.get('900000').resolve(packet('900000'))
    await nextTick()
    assert.equal(state.relations.value.fundCode, '900003')
    code.value = '900004'
    await nextTick()
    assert.equal(state.relations.value, null)
    pending.get('900004').reject(new Error('test outage'))
    await nextTick()
    assert.equal(state.failed.value, true)
    assert.equal(state.relations.value, null)
  } finally { scope.stop() }
})
