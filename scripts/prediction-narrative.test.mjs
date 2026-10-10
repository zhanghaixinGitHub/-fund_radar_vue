import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { Buffer } from 'node:buffer'
import { URL } from 'node:url'
const source = stripTypeScriptTypes(readFileSync(new URL('../src/utils/predictionNarrative.ts', import.meta.url), 'utf8'))
const { narrativeGroups, readNarrative, safeEvidence } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
const ready = () => ({ fundCode: '002112', recordId: 'original', kind: 'daily', state: 'READY', narrative: {
  styleVersion: 'PREDICTION_NARRATIVE_ZH_V4', summary: '本次偏向上涨。', context: '近 5 日累计下跌 10.39%。',
  supporting: '', opposing: '', limitations: ['仅解释原预测。'],
} })

test('行业依据不重复持仓行情，保留不同日期、相反含义和完整公告引用，不改原文', () => {
  const holding = '2026-10-08，东山精密涨跌-10.00%，披露仓位9.50%。'
  const industry = '2026-06-30披露行业分布：制造业占净资产92.60%。'
  const driver = { category: '持仓行情', title: '持仓走弱', observation: holding,
    meaning: '持仓走弱', implication: '若弱势延续可能拖累', sources: [] }
  const value = { ...ready().narrative, styleVersion: 'PREDICTION_INFORMATION_ZH_V4', drivers: [driver,
    { ...driver, title: '行业集中度', observation: `${industry}\n${holding}` },
    { ...driver, title: '另一行情日', observation: holding.replace('10-08', '10-09') },
    { ...driver, category: '公告', title: '公告原文', observation: `${industry}\n${holding}` },
  ], counterpoints: [{ ...driver, title: '相反作用', implication: '其他条件可能改变方向' }] }
  const original = JSON.stringify(value)
  const [main, opposing] = narrativeGroups(value)
  assert.equal(main.drivers[0].observation, holding)
  assert.equal(main.drivers[1].observation, industry)
  assert.equal(main.drivers[2].observation, holding.replace('10-08', '10-09'))
  assert.equal(main.drivers[3].observation, `${industry}\n${holding}`)
  assert.equal(opposing.drivers[0].observation, '相关数据见上文“持仓走弱”。')
  assert.equal(opposing.drivers[0].implication, '其他条件可能改变方向')
  assert.equal(JSON.stringify(value), original)
  value.styleVersion = 'PREDICTION_INFORMATION_ZH_V3'
  assert.equal(narrativeGroups(value)[0].drivers[1].observation, `${industry}\n${holding}`)
})

test('新综合依据保留事实含义和相反因素，缺失关系结构或危险来源时拒绝', () => {
  const response = ready()
  Object.assign(response.narrative, { styleVersion: 'PREDICTION_INFORMATION_ZH_V4',
    drivers: [{ category: '持仓行情', title: '持仓偏弱', assessment: '支持下跌', observation: '原行情事实',
      meaning: '当时走势偏弱', implication: '若延续仍有压力', relation: '', sources: [] }],
    counterpoints: [], conditions: ['行情转强'], inventory: Array.from({ length: 16 }, (_, i) => ({
      id: `D${String(i + 1).padStart(2, '0')}`, name: '资料', detail: '已检查', status: 'AVAILABLE',
    })),
  })
  assert.equal(readNarrative(response, '002112', 'daily', 'original'), response.narrative)
  const bad = JSON.parse(JSON.stringify(response))
  bad.narrative.drivers[0].sources.push({ title: '来源', url: 'javascript:alert(1)', publishedDate: '2026-10-09' })
  assert.throws(() => readNarrative(bad, '002112', 'daily', 'original'))
  delete response.narrative.drivers[0].meaning
  assert.throws(() => readNarrative(response, '002112', 'daily', 'original'))
})
test('原预测匹配时保留后台保存的正文和专业术语', () => {
  const response = ready()
  assert.deepEqual(readNarrative(response, '002112', 'daily', 'original'), response.narrative)
})

test('经理变更和任期表现沿用原预测身份与来源校验，不影响旧记录', () => {
  const response = ready()
  Object.assign(response.narrative, { styleVersion: 'PREDICTION_INFORMATION_ZH_V4',
    drivers: [{ category: '基金经理', title: '经理变更与任期表现', assessment: '背景观察',
      observation: '公开原因为个人原因；陆阳任期包含共同管理，独立管理阶段单列。',
      meaning: '任期表现需要结合收益和回撤。', implication: '基准比较尚缺，不能确认超额能力。',
      relation: '本基金的管理连续性与任期表现。', sources: [{ title: '基金经理变更公告',
        url: 'https://example.com/change.pdf', publishedDate: '2026-05-30' }] }],
    counterpoints: [], conditions: [], inventory: Array.from({ length: 16 }, (_, i) => ({
      id: `D${String(i + 1).padStart(2, '0')}`, name: '资料', detail: '已检查范围', status: 'PARTIAL',
    })),
  })
  const original = JSON.stringify(response)
  assert.equal(readNarrative(response, '002112', 'daily', 'original'), response.narrative)
  assert.equal(narrativeGroups(response.narrative)[0].drivers[0].category, '基金经理')
  assert.equal(JSON.stringify(response), original)
  assert.throws(() => readNarrative(response, '002112', 'daily', 'another'))
  response.narrative.drivers[0].sources[0].url = 'javascript:alert(1)'
  assert.throws(() => readNarrative(response, '002112', 'daily', 'original'))
})

test('002112一日综合说明可显示，且不放宽其他基金和周期的正文版本边界', () => {
  const response = ready()
  response.narrative.styleVersion = 'PREDICTION_INFORMATION_ZH_V1'
  response.narrative.context = '行情截至2026-10-08；此次未找到可用的相关政策、新闻。'
  assert.deepEqual(readNarrative(response, '002112', 'daily', 'original'), response.narrative)
  for (const [fundCode, kind] of [['000001', 'daily'], ['002112', 'multi']]) {
    assert.equal(readNarrative({ ...response, fundCode, kind }, fundCode, kind, 'original'), null)
  }
  const invalid = { ...response, narrative: { ...response.narrative, supporting: '因为参数为正，所以会涨' } }
  assert.throws(() => readNarrative(invalid, '002112', 'daily', 'original'), /正文暂不可用/)
})
test('切换基金、周期或历史版本不能套用另一条解释', () => {
  for (const args of [['000001','daily','original'], ['002112','multi','original'], ['002112','daily','new']]) {
    assert.throws(() => readNarrative(ready(), ...args), /不一致/)
  }
})

test('具体事实说明保留来源和可能影响，拒绝危险链接及不完整条目', () => {
  const response = ready()
  response.narrative.styleVersion = 'PREDICTION_INFORMATION_ZH_V2'
  response.narrative.drivers = [
    { category: '净值', title: '净值在近期什么位置', assessment: '近期偏弱', observation: '区间位置34.7%。', implication: '低位不等于估值便宜。' },
    { category: '公告', title: '融资公告', assessment: '双向影响', observation: '公司拟发行新股。', implication: '可能补充资金，也存在摊薄风险。',
      source: { title: '融资公告', url: 'https://static.cninfo.com.cn/example.pdf', publishedDate: '2026-10-08' } },
  ]
  assert.deepEqual(readNarrative(response, '002112', 'daily', 'original'), response.narrative)
  for (const url of ['javascript:alert(1)', 'data:text/html,hello', 'https://user:password@example.com/']) {
    const changed = globalThis.structuredClone(response)
    changed.narrative.drivers[1].source.url = url
    assert.throws(() => readNarrative(changed, '002112', 'daily', 'original'), /具体依据暂不可用/)
  }
  const missing = globalThis.structuredClone(response)
  delete missing.narrative.drivers[1].implication
  assert.throws(() => readNarrative(missing, '002112', 'daily', 'original'), /具体依据暂不可用/)
})
test('生成中和不可用时继续使用原预测依据，不假装已完成', () => {
  for (const state of ['PENDING', 'FALLBACK']) assert.equal(readNarrative({ ...ready(), state, narrative: undefined }, '002112', 'daily', 'original'), null)
})
test('正文缺字段或超长时拒绝替换可用的旧依据', () => {
  const missing = ready(); delete missing.narrative.context
  const oversized = ready(); oversized.narrative.supporting = '文'.repeat(1401)
  for (const response of [missing, oversized]) assert.throws(() => readNarrative(response, '002112', 'daily', 'original'))
})

test('新版安全观察可用于等待及失败展示，不伪装成已保存成功', () => {
  for (const state of ['PENDING', 'FALLBACK']) {
    const response = { ...ready(), state }
    assert.deepEqual(readNarrative(response, '002112', 'daily', 'original'), response.narrative)
  }
})

test('任何状态均拒绝旧版或未知版因果话术', () => {
  for (const state of ['PENDING', 'FALLBACK', 'READY']) {
    for (const version of ['V1', 'V2', 'V3', 'V9']) {
      const response = { ...ready(), state }
      response.narrative.styleVersion = `PREDICTION_NARRATIVE_ZH_${version}`
      assert.equal(readNarrative(response, '002112', 'daily', 'original'), null)
    }
  }
})

test('缺证据回退不展示系数原因或混合样本均值，保留原始观察与口径', () => {
  const original = {
    summary: '因为回撤深，所以容易上涨。',
    facts: [{ label: '近 20 个交易日的日波动', value: '3.21%' },
      { label: '历史参考均值', value: '0.18%' }, { label: '当时近 5 个交易日的净值涨跌', value: '-10.39%' }],
    supporting: ['跌得越深越容易上涨'], opposing: ['系数有相反作用'],
    limitations: ['以下列出影响较大的因素', '相等算持平'],
  }
  const safe = safeEvidence(original)
  assert.match(safe.summary, /依据暂不充分/)
  assert.deepEqual(safe.supporting, [])
  assert.deepEqual(safe.opposing, [])
  assert.equal(safe.facts.length, 2)
  assert.match(safe.facts[0].label, /标准差（未年化）/)
  assert.ok(safe.limitations.some(item => item.includes('并非平均每天涨跌幅')))
  assert.ok(safe.limitations.includes('相等算持平'))
  assert.doesNotMatch(JSON.stringify(safe), /0\.18|跌得越深|系数|影响较大/)
  assert.equal(original.supporting.length, 1)
})


test('缺少全部证据时明确说明无法解释，不承诺不存在的观察列表', () => {
  const safe = safeEvidence({ summary: '旧总结', facts: [], supporting: [], opposing: [], limitations: [] })
  assert.match(safe.summary, /缺少可核对的解释资料/)
  assert.doesNotMatch(safe.summary, /以下|列出/)
})
