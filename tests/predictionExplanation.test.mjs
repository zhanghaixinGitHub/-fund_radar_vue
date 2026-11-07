import test from 'node:test'
import assert from 'node:assert/strict'
import { explainPredictionDriver, explanationPercent, predictionExplanationView, readablePredictionText } from '../src/utils/predictionExplanation.ts'

const holding = (name, change, weight, extra = {}) => ({
  name, security: '300394.SZ', base_quote: { date: '2026-10-28', change_pct: change },
  partial_report_end: '2026-09-30', partial_weight_pct: weight, ...extra,
})
const observation = () => ({
  fund: '002112', base: '2026-10-28',
  market: { '000300.SH': { date: '2026-10-28', change_pct: 0.8475 }, '000905.SH': { date: '2026-10-28', change_pct: 1.9884 } },
  latest_partial_top3: [holding('天孚通信', 6.7914, 9.83), holding('中际旭创', 10.2773, 9.34), holding('新易盛', 8.0811, 9.26)],
  unknown_current_rebalancing: true,
})
const driver = (text = JSON.stringify(observation())) => ({
  title: '本周期主要依据', category: '市场行情', assessment: '支持上涨', observation: text,
  meaning: '持仓集中在光通信行业，历史增长不保证未来上涨。', relation: '',
  implication: '仅为已核实资料支持的条件性方向，需后续经营和市场验证。', sources: [],
})

test('截图中的行情按原单位显示中文名称和独立日期，不泄漏原始字段或修改原记录', () => {
  const input = driver()
  const before = structuredClone(input)
  const result = explainPredictionDriver(input, '002112')
  assert.equal(result.title, '重仓股的涨跌')
  assert.equal(explanationPercent(result.holdings[0].change), '+6.79%')
  assert.equal(result.holdings[0].weight, 9.83)
  assert.equal(result.holdings[0].date, '2026-10-28')
  assert.equal(result.holdings[0].reportDate, '2026-09-30')
  assert.match(result.relationship, /3 只股票在 2026-09-30.*28.43%/)
  assert.match(result.markets[0], /沪深300上涨 0.85%/)
  assert.match(result.markets[1], /中证500上涨 1.99%/)
  assert.match(result.notices.join(''), /不代表当前仓位/)
  assert.doesNotMatch(JSON.stringify(result), /change_pct|market_value_cny|unknown_current_rebalancing|300394.SZ/)
  assert.deepEqual(input, before)
})

test('财报排版摘录不直接显示，也不猜测多列或换行财务数字的单位和口径', () => {
  const excerpt = '\n变更情况\n□适用 □不适用\n中际旭创股份有限公司2026年半年度报告全文\n营业收入（元）41,777,861,795.03 14,789,074,837.80 182.49%'
  const input = driver(`${JSON.stringify(observation(), null, 2)}${excerpt}`)
  const result = explainPredictionDriver(input, '002112')
  assert.equal(result.holdings.length, 3)
  assert.deepEqual(result.observations, [])
  assert.match(result.notices.join(''), /财务数据的解释尚不完整/)
  assert.doesNotMatch(JSON.stringify(result), /41,777,861|□适用/)
  assert.equal(result.meaning, input.meaning)
})

test('未知结构、坏JSON和基金身份错配均给出说明不足，不照搬内部数据', () => {
  for (const raw of ['{"private_field": "SECRET_REF"}', '{"fund": "002112", "market":', JSON.stringify({ ...observation(), fund: '000001' })]) {
    const result = explainPredictionDriver(driver(raw), '002112')
    assert.equal(result.holdings.length, 0)
    assert.equal(result.markets.length, 0)
    assert.match(result.notices.join(''), /无法整理/)
    assert.doesNotMatch(JSON.stringify(result), /SECRET_REF|private_field/)
  }
})

test('缺失字段保持未知，真实零值保留；不借基准日填充缺失行情日', () => {
  const data = observation()
  data.latest_partial_top3 = [holding('股票甲', null, null, { base_quote: { change_pct: null } }), holding('股票乙', 0, 0)]
  const result = explainPredictionDriver(driver(JSON.stringify(data)), '002112')
  assert.deepEqual([result.holdings[0].change, result.holdings[0].weight, result.holdings[0].date], [null, null, null])
  assert.equal(explanationPercent(result.holdings[0].change), '暂缺')
  assert.equal(explanationPercent(result.holdings[1].change), '0.00%')
  assert.equal(result.holdings[1].weight, 0)
  assert.equal(result.relationship, '')
})

test('不同报告、重复股票及未知仓位不合成持仓总占比', () => {
  for (const rows of [
    [holding('股票甲', -2, 9), holding('股票乙', 1, 8, { partial_report_end: '2026-06-30' })],
    [holding('股票甲', -2, 9), holding('股票甲', 1, 8, { base_quote: { date: '2026-10-27', change_pct: 1 } })],
    [holding('股票甲', -2, 90), holding('股票乙', 1, 80)],
  ]) {
    const result = explainPredictionDriver(driver(JSON.stringify({ fund_code: '002112', partial_holdings: rows })), '002112')
    assert.equal(result.holdings.length, 2)
    assert.equal(result.relationship, '')
    assert.equal(explanationPercent(result.holdings[0].change), '-2.00%')
  }
})

test('报告查阅仅保留安全的直接文档链接，不展示行情接口或带访问参数的地址', () => {
  const input = driver()
  const source = { title: '公司半年度报告', publishedDate: '2026-08-22', url: 'https://example.com/report.PDF' }
  input.sources = [source, source, ...[
    'https://api.tushare.pro', 'javascript:alert(1)', 'https://user:password@example.com/report.pdf',
    'https://example.com/report.pdf?token=secret', 'https://example.com/report.pdf#token=secret',
  ].map(url => ({ ...source, url }))]
  assert.deepEqual(explainPredictionDriver(input, '002112').documents, [source])
})

test('正常业务观察及反向条件完整保留，不因篇幅长而变成说明不足', () => {
  const prose = '公司利润增长，但回款下降；如果后续订单减少，应重新判断。'.repeat(30)
  const input = { ...driver(prose), assessment: '支持下跌', implication: '若需求回落，则可能承压；不能因为过去增长就看涨。' }
  const result = explainPredictionDriver(input, '002112')
  assert.deepEqual(result.observations, [prose])
  assert.equal(result.implication, input.implication)
  assert.equal(result.assessment, '支持下跌')
  assert.deepEqual(result.notices, [])
})

test('多个行情块逐条保留各自日期，不把同日不同数据去重', () => {
  const first = { fund: '002112', latest_partial_top3: [holding('公司{甲}', 1, 9)] }
  const second = { fund: '002112', partial_holdings: [holding('公司{甲}', -1, 9, { base_quote: { date: '2026-10-27', change_pct: -1 } })] }
  const result = explainPredictionDriver(driver(`${JSON.stringify(first)}\n${JSON.stringify(second)}`), '002112')
  assert.equal(result.holdings.length, 2)
  assert.deepEqual(result.holdings.map(row => row.date), ['2026-10-28', '2026-10-27'])
  assert.equal(result.relationship, '')
})

// 第二次截图的回归：原文不含“公告编号”，旧识别仍会把整份公告直接输出。
const announcement = '【关联公司待确认】\n德邦基金管理有限公司\n高级管理人员变更公告\n公告送出日期：2026 年 9 月 25 日\n1. 公告基本信息\n基金管理人名称 德邦基金管理有限公司\n公告依据 《证券基金经营机构》\n其他需要说明的事项\n上述事项已经董事会审议通过，并按有关规定履行备案手续。\n特此公告。'
const boundary = () => ({
  ...driver(announcement), title: '披露与适用边界', category: '公告', assessment: '双向影响',
  meaning: '经理在季报中的产业与宏观叙述按其观点理解，未当作当前独立事实。完整组合与最新部分披露分别保留真实报告期，当前调仓未知。经理变更和有限任期业绩是管理背景，样本较短、回撤明显且缺少可比基准归因，不能证明持续超额能力；董事和审计机构调整不能误当基金经理变更。',
})
const narrative = () => ({
  styleVersion: 'PREDICTION_INFORMATION_ZH_V4', summary: '下一估值日偏强，把握较低。',
  context: '订单增长。同时，回款下降。如果后续订单减少，原判断可能失效。', supporting: '', opposing: '',
  drivers: [{ ...driver(), meaning: '订单增长。' }, boundary()],
  counterpoints: [{ ...driver(), meaning: '回款下降。', assessment: '支持下跌' }],
  conditions: ['如果后续订单减少，需要重新判断。'], limitations: ['持仓属于各自原报告期，当前调仓未知，历史经营增长可能已经计价。'],
})

test('第二张截图中的公告原文即使没有编号也不直接显示', () => {
  const result = explainPredictionDriver({ ...driver(announcement), category: '公告' }, '002112')
  assert.deepEqual(result.observations, [])
  assert.doesNotMatch(JSON.stringify(result), /高级管理人员变更公告|备案手续|特此公告/)
})

test('完整依据把资料核对转为业务局限，保留所有方向理由和反证，不改历史原文', () => {
  const value = narrative()
  const before = structuredClone(value)
  const view = predictionExplanationView(value, '002112')
  assert.equal(view.groups.length, 2)
  assert.deepEqual(view.groups.map(group => group.drivers.length), [1, 1])
  assert.match(view.notes.join(''), /基金经理的市场展望属于个人观点/)
  assert.match(view.notes.join(''), /任职记录较短，期间回撤较大/)
  assert.match(view.notes.join(''), /部分公告与本基金的关系尚未确认/)
  assert.equal(view.notes.filter(note => note.includes('当前是否调仓')).length, 1)
  assert.doesNotMatch(JSON.stringify(view), /披露与适用边界|高级管理人员变更公告|备案手续|特此公告|\{\\"fund\\"/)
  assert.equal(view.groups[1].drivers[0].assessment, '支持下跌')
  assert.deepEqual(value, before)
})

test('完整依据去掉重复表格与重复综合句，保留未重复的转向条件和相反判断', () => {
  const view = predictionExplanationView(narrative(), '002112')
  assert.deepEqual(view.groups.map(group => group.drivers[0].holdings.length), [3, 0])
  assert.equal(view.groups[0].drivers[0].quoteDate, '2026-10-28')
  assert.equal(view.groups[0].drivers[0].reportDate, '2026-09-30')
  assert.deepEqual(view.groups[0].drivers[0].points, ['订单增长。'])
  assert.deepEqual(view.groups[1].drivers[0].points, ['回款下降。'])
  assert.deepEqual(view.context, ['如果后续订单减少，原判断可能失效。'])
  assert.deepEqual(view.conditions, ['如果后续订单减少，需要重新判断。'])
})

test('有明确方向作用的资料变化仍作为理由，日期变化或否定不同的句子不会当成重复', () => {
  const value = narrative()
  value.drivers = [{ ...boundary(), assessment: '支持下跌', meaning: '截至2026-10-28，未发现订单下降。' }]
  value.counterpoints = []
  value.context = '截至2026-10-29，发现订单下降。'
  value.conditions = []
  const view = predictionExplanationView(value, '002112')
  assert.equal(view.groups[0].drivers.length, 1)
  assert.match(view.groups[0].drivers[0].points.join(''), /未发现订单下降/)
  assert.deepEqual(view.context, ['截至2026-10-29，发现订单下降。'])
})

test('已知完整句式结合原行情改成直白短句；出现反向条件时保留原意，不套看涨模板', () => {
  const value = narrative()
  value.drivers = [{ ...driver(), meaning: '下一估值日关注通信配置的风险偏好传导，天孚、中际及新易盛同步走强，已有经营扩张提供背景，条件性偏强。' }]
  let view = predictionExplanationView(value, '002112')
  assert.match(view.groups[0].drivers[0].points[0], /2026-10-28.*3 只.*都在上涨/)
  assert.equal(view.groups[0].drivers[0].points.length, 2)
  value.drivers[0].meaning = '如果订单下降，即使股价同步走强，也不能据此看涨。'
  view = predictionExplanationView(value, '002112')
  assert.deepEqual(view.groups[0].drivers[0].points, [value.drivers[0].meaning])
})

test('多周期已保存说明改为可读句子，保留周期、低把握和经营不及预期的条件', () => {
  const text = readablePredictionText('未来五个估值日侧重新财务信息的消化，天孚较新季报利润和现金增长，配合通信企业经营扩张，低把握偏强。')
  assert.match(text, /未来5个净值日倾向上涨，但把握较低/)
  assert.match(text, /利润和经营现金流都有增长/)
  assert.doesNotMatch(text, /新财务信息的消化|较新季报/)
  const risk = readablePredictionText('中际现金同比下降，部分新增器件业务仍有回款压力，若资金转向或经营不及预期，短期可转弱。')
  assert.match(risk, /如果.*低于预期.*可能转弱/)
  assert.doesNotMatch(risk, /一定|必跌/)
})
