import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { Buffer } from 'node:buffer'
import { URL } from 'node:url'
const source = stripTypeScriptTypes(readFileSync(new URL('../src/utils/predictionNarrative.ts', import.meta.url), 'utf8'))
const { readNarrative, safeEvidence } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
const ready = () => ({ fundCode: '002112', recordId: 'original', kind: 'daily', state: 'READY', narrative: {
  styleVersion: 'PREDICTION_NARRATIVE_ZH_V4', summary: '本次偏向上涨。', context: '近 5 日累计下跌 10.39%。',
  supporting: '', opposing: '', limitations: ['仅解释原预测。'],
} })
test('原预测匹配时保留后台保存的正文和专业术语', () => {
  const response = ready()
  assert.deepEqual(readNarrative(response, '002112', 'daily', 'original'), response.narrative)
})
test('切换基金、周期或历史版本不能套用另一条解释', () => {
  for (const args of [['000001','daily','original'], ['002112','multi','original'], ['002112','daily','new']]) {
    assert.throws(() => readNarrative(ready(), ...args), /不一致/)
  }
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
