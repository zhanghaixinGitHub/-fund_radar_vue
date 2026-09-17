import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../src/utils/advice.ts', import.meta.url), 'utf8')
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
const {
  rulePctText, ruleTierLabel, ruleStatusLabel, ruleTriggerText, ruleStatsUpdated, ruleAdjustMaxSteps, ruleAdjustedValue,
} = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`)

test('rulePctText renders negative drawdown as decline and profit as rise, never fakes missing values', () => {
  assert.equal(rulePctText('-0.0710'), '跌 7.10%')
  assert.equal(rulePctText('0.153'), '涨 15.30%')
  assert.equal(rulePctText(0.05), '涨 5.00%')
  assert.equal(rulePctText('0'), '0.00%')
  assert.equal(rulePctText(null), '—')
  assert.equal(rulePctText(undefined), '—')
  assert.equal(rulePctText(''), '—')
  assert.equal(rulePctText('abc'), '—')
})
test('rule tier labels cover the four contract tiers without leaking codes', () => {
  assert.equal(ruleTierLabel('CONSERVATIVE'), '保守')
  assert.equal(ruleTierLabel('BALANCED'), '适中')
  assert.equal(ruleTierLabel('LOOSE'), '宽松')
  assert.equal(ruleTierLabel('CUSTOM'), '自定义')
  assert.equal(ruleTierLabel('AGGRESSIVE'), '档位待确认')
  assert.equal(ruleTierLabel(null), '档位待确认')
})
test('rule status keeps revoked, superseded and active distinct', () => {
  assert.equal(ruleStatusLabel({ status: 'ACTIVE', supersededAt: null }), '生效中')
  assert.equal(ruleStatusLabel({ status: 'REVOKED', supersededAt: null }), '已撤销')
  assert.equal(ruleStatusLabel({ status: 'ACTIVE', supersededAt: '2026-09-20T00:00:00Z' }), '已被新规则取代')
  assert.equal(ruleStatusLabel({ status: 'UNKNOWN', supersededAt: null }), '状态待确认')
})
test('trigger stats report censored observations and missing medians honestly', () => {
  assert.equal(ruleTriggerText(null), '暂无历史触发统计。')
  assert.equal(ruleTriggerText({ triggerCount: 5, medianFurtherDecline: '-0.032', medianRecoveryDays: '12', censoredCount: 2 }),
    '历史触发 5 次 · 触发后中位续跌 跌 3.20% · 中位修复 12 天；其中 2 次处于历史末端，未完整观察。')
  assert.equal(ruleTriggerText({ triggerCount: 0, medianFurtherDecline: null, medianRecoveryDays: null, censoredCount: 0 }),
    '历史触发 0 次 · 续跌幅度统计不足 · 修复天数统计不足。')
  assert.equal(ruleTriggerText({ triggerCount: 3, medianFurtherDecline: '0.011', medianRecoveryDays: '7.5', censoredCount: 0 }),
    '历史触发 3 次 · 触发后中位续跌 涨 1.10% · 中位修复 7.5 天。')
})
test('stats-updated badge only appears when the confirmed rule came from an older draft', () => {
  assert.equal(ruleStatsUpdated({ sourceDraftId: 'a' }, { draftId: 'b' }), true)
  assert.equal(ruleStatsUpdated({ sourceDraftId: 'a' }, { draftId: 'a' }), false)
  assert.equal(ruleStatsUpdated({ sourceDraftId: 'a' }, { draftId: null }), false)
  assert.equal(ruleStatsUpdated(null, { draftId: 'b' }), false)
  assert.equal(ruleStatsUpdated({ sourceDraftId: null }, { draftId: 'b' }), false)
})
test('adjustment stepping stays within the ±20% tolerance of the draft value', () => {
  // -0.0710 → 单位 -710，容差 142 单位，步长 36 单位，最多 3 步
  assert.equal(ruleAdjustMaxSteps('-0.0710'), 3)
  assert.equal(ruleAdjustedValue('-0.0710', 0), '-0.0710')
  assert.equal(ruleAdjustedValue('-0.0710', 1), '-0.0674')
  assert.equal(ruleAdjustedValue('-0.0710', -1), '-0.0746')
  assert.equal(ruleAdjustedValue('-0.0710', 99), '-0.0602')
  assert.equal(ruleAdjustedValue('-0.0710', -99), '-0.0818')
  // 任何步数的结果都不越过草案值 ±20% 的后端容差
  for (const steps of [-99, -3, -1, 0, 1, 3, 99]) {
    const adjusted = Number(ruleAdjustedValue('-0.0710', steps))
    assert.ok(Math.abs(adjusted - -0.071) <= 0.071 * 0.2 + 1e-12, `steps=${steps}`)
  }
  // 止盈线正值同理：0.1530 → 单位 1530，步长 77，最多 3 步
  assert.equal(ruleAdjustMaxSteps('0.1530'), 3)
  assert.equal(ruleAdjustedValue('0.1530', 1), '0.1607')
  assert.equal(ruleAdjustedValue('0.1530', -3), '0.1299')
})
test('zero or invalid draft values cannot be adjusted', () => {
  assert.equal(ruleAdjustMaxSteps('0'), 0)
  assert.equal(ruleAdjustedValue('0', 5), '0.0000')
  assert.equal(ruleAdjustMaxSteps('abc'), 0)
  assert.equal(ruleAdjustedValue('abc', 1), null)
  assert.equal(ruleAdjustedValue(null, 1), null)
  assert.equal(ruleAdjustedValue(undefined, -1), null)
})
