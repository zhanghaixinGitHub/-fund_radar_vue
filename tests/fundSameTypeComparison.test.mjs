import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'

// 隔离夹具只验证界面行为，不作为真实基金分类或历史收益资料。
let server
let component
before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
  component = (await server.ssrLoadModule('/src/components/FundSameTypeComparison.vue')).default
})
after(async () => { await server?.close() })

const group = { name: '测试灵活配置混合基金', description: '股票0%-95%，同C类份额。', basis: 'VERIFIED_DISCLOSURE' }
const comparison = {
  fundType: 'MIXED', scope: 'VERIFIED_CURRENT_MARKET_PEER_GROUP', status: 'SYNCED',
  asOfDate: '2026-10-23', comparisonStartDate: '2026-09-23', comparisonGroup: group,
  comparableCount: 2, comparableProductCount: 2, sampleUnit: 'PRODUCT',
  items: [
    { fundCode: '000001', fundName: '测试基金甲', asOfDate: '2026-10-23', monthChangeRate: '-0.2' },
    { fundCode: '000002', fundName: '测试基金乙', asOfDate: '2026-10-23', monthChangeRate: '0.1' },
  ],
}
const render = (value = comparison, extra = {}) => renderToString(createSSRApp(component, {
  comparison: value, currentFundCode: '000001', loading: false, errorMessage: '', ...extra,
}))

test('细类、约束、共同区间和名称括号代码来自响应，按数值降序展示', async () => {
  const html = await render()
  assert.match(html, /本次同类：测试灵活配置混合基金/)
  assert.match(html, /股票0%-95%，同C类份额/)
  assert.match(html, /2026-09-23 至 2026-10-23/)
  assert.ok(html.indexOf('测试基金乙 (000002)') < html.indexOf('测试基金甲 (000001)'))
  assert.equal((html.match(/2026-10-23/g) || []).length, 1)
  assert.doesNotMatch(html, /<details|查看其余|VERIFIED_DISCLOSURE|PRODUCT/)
})

test('只有目标产品时保留其数据并说明没有其他可比基金，不冒充有竞争名次', async () => {
  const html = await render({ ...comparison, status: 'NO_PEERS', reason: '暂无其他可比基金。',
    comparableCount: 1, comparableProductCount: 1, targetRank: null, items: [comparison.items[0]] })
  assert.match(html, /暂无其他可比基金/)
  assert.match(html, /测试基金甲 \(000001\)/)
  assert.doesNotMatch(html, /第1名|排名第一/)
})

test('缺分类不能借用大类描述为已核实同类，净值不足独立提示', async () => {
  const missing = await render({ ...comparison, status: 'CLASSIFICATION_INSUFFICIENT', comparisonGroup: null,
    reason: '分类资料不足。', items: [], comparableCount: 0 })
  assert.match(missing, /本次同类：暂未确定/)
  assert.match(missing, /分类资料不足/)
  assert.doesNotMatch(missing, /测试基金甲|按基金大类划分|近一月单位净值变化 ·/)
  const insufficient = await render({ ...comparison, status: 'DATA_INSUFFICIENT', reason: '共同区间净值不足。' })
  assert.match(insufficient, /共同区间净值不足/)
  assert.doesNotMatch(insufficient, /测试基金甲/)
})

test('加载和故障不残留上一只基金的分类或结果，旧接口准确标注宽分类', async () => {
  assert.doesNotMatch(await render(comparison, { loading: true }), /测试基金|本次同类/)
  assert.doesNotMatch(await render(comparison, { errorMessage: '同类比较暂时不可用。' }), /测试基金|本次同类/)
  const legacy = await render({ ...comparison, scope: 'CURRENT_MARKET_ACTIVE_TUSHARE_PRO_FUND', comparisonGroup: null })
  assert.match(legacy, /本次同类：混合型（按基金大类划分）/)
})
