import test from 'node:test'
import assert from 'node:assert/strict'
import { readNarrative } from '../src/utils/predictionNarrative.ts'

const clone = value => JSON.parse(JSON.stringify(value))

// 使用完整的当前记录结构，验证后台已核对的长说明不会在展示入口再次被过滤。
function response() {
  const source = { title: '公告标题'.repeat(80), url: 'https://example.com/notice', publishedDate: '2026-10-09' }
  const driver = {
    category: '公告', assessment: '支持下跌', title: '事项标题'.repeat(40),
    observation: '保留原文及条件。'.repeat(400), meaning: '事项含义。'.repeat(100),
    implication: '可能的影响。'.repeat(100), relation: '公司关联。'.repeat(600),
    sources: Array.from({ length: 7 }, (_, i) => ({ ...source, url: `${source.url}/${i}` })),
  }
  return {
    fundCode: '002112', kind: 'daily', recordId: 'record-1', state: 'READY',
    narrative: {
      styleVersion: 'PREDICTION_INFORMATION_ZH_V4', summary: '综合说明。'.repeat(350),
      context: '分析条件。'.repeat(350), supporting: '', opposing: '',
      drivers: Array.from({ length: 8 }, () => clone(driver)),
      counterpoints: Array.from({ length: 5 }, () => ({ ...clone(driver), assessment: '支持上涨' })),
      conditions: Array.from({ length: 4 }, (_, i) => `条件${i}：${'仍需观察。'.repeat(80)}`),
      limitations: Array.from({ length: 6 }, (_, i) => `风险${i}：${'尚未确认。'.repeat(80)}`),
      inventory: Array.from({ length: 16 }, (_, i) => ({
        id: `D${String(i + 1).padStart(2, '0')}`, name: '资料名称'.repeat(20), detail: '资料说明。'.repeat(100),
      })),
    },
  }
}

test('当前002112说明超出旧字数及数量目标仍完整展示，原响应不改写', () => {
  const value = response()
  const before = clone(value)
  assert.strictEqual(readNarrative(value, '002112', 'daily', 'record-1'), value.narrative)
  assert.deepEqual(value, before)
  assert.equal(value.narrative.drivers.length, 8)
  assert.equal(value.narrative.limitations.length, 6)
})

test('整理限制放宽后仍核对当前基金、记录及每一个安全来源', () => {
  assert.throws(() => readNarrative(response(), '002112', 'daily', 'other-record'), /当前预测不一致/)
  for (const url of ['javascript:alert(1)', 'https://user:secret@example.com/notice']) {
    const value = response()
    value.narrative.drivers[7].sources[6].url = url
    assert.throws(() => readNarrative(value, '002112', 'daily', 'record-1'), /未通过核对/)
  }
  const other = response()
  other.fundCode = 'other-fund'
  assert.equal(readNarrative(other, 'other-fund', 'daily', 'record-1'), null)
})

test('历史说明沿用原有格式，不把本次整理规则套到旧版本', () => {
  const value = response()
  value.narrative.styleVersion = 'PREDICTION_INFORMATION_ZH_V3'
  assert.throws(() => readNarrative(value, '002112', 'daily', 'record-1'), /正文暂不可用/)
})
