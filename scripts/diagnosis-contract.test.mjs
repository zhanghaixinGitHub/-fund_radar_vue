import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../src/utils/advice.ts', import.meta.url), 'utf8')
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
const { isDiagnosisVerdict, diagnosisVerdictLabel, diagnosisVerdictTone, diagnosisItemOrder, diagnosisItemLabel, diagnosisStale } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`)

test('only the three contract verdicts are accepted, everything else stays unknown', () => {
  assert.equal(isDiagnosisVerdict('VALID'), true)
  assert.equal(isDiagnosisVerdict('CHANGED'), true)
  assert.equal(isDiagnosisVerdict('INSUFFICIENT'), true)
  assert.equal(isDiagnosisVerdict('NORMAL'), false)
  assert.equal(isDiagnosisVerdict('valid'), false)
  assert.equal(isDiagnosisVerdict(null), false)
  assert.equal(isDiagnosisVerdict(undefined), false)
})
test('verdict labels never collapse insufficient or unknown data into everything is fine', () => {
  assert.equal(diagnosisVerdictLabel('VALID'), '成立')
  assert.equal(diagnosisVerdictLabel('CHANGED'), '已改变')
  assert.equal(diagnosisVerdictLabel('INSUFFICIENT'), '数据不足')
  assert.equal(diagnosisVerdictLabel('NORMAL'), '结论待确认')
  assert.equal(diagnosisVerdictLabel(undefined), '结论待确认')
})
test('verdict tones map to distinct highlight classes', () => {
  assert.equal(diagnosisVerdictTone('VALID'), 'diagnosis-valid')
  assert.equal(diagnosisVerdictTone('CHANGED'), 'diagnosis-changed')
  assert.equal(diagnosisVerdictTone('INSUFFICIENT'), 'diagnosis-insufficient')
  assert.equal(diagnosisVerdictTone('ELSE'), 'diagnosis-unknown')
})
test('all seven diagnosis items have fixed order and Chinese labels', () => {
  assert.deepEqual([...diagnosisItemOrder], ['MANAGER', 'SCALE', 'SAME_TYPE_RANK', 'BENCHMARK', 'DRAWDOWN', 'FEE', 'DIVIDEND'])
  const labels = { MANAGER: '基金经理', SCALE: '规模变化', SAME_TYPE_RANK: '同类排名', BENCHMARK: '业绩基准', DRAWDOWN: '当前回撤', FEE: '费用', DIVIDEND: '分红' }
  for (const key of diagnosisItemOrder) assert.equal(diagnosisItemLabel(key), labels[key])
  assert.equal(diagnosisItemLabel('UNKNOWN_ITEM'), '诊断项目待确认')
  assert.equal(diagnosisItemLabel(null), '诊断项目待确认')
})
test('stale data is flagged instead of presented as current', () => {
  assert.equal(diagnosisStale(null, '2026-09-17'), true)
  assert.equal(diagnosisStale(undefined, '2026-09-17'), true)
  assert.equal(diagnosisStale('', '2026-09-17'), true)
  assert.equal(diagnosisStale('not-a-date', '2026-09-17'), true)
  assert.equal(diagnosisStale('2026-09-16', '2026-09-17'), false)
  assert.equal(diagnosisStale('2026-09-10', '2026-09-17'), false)
  assert.equal(diagnosisStale('2026-09-09', '2026-09-17'), true)
  assert.equal(diagnosisStale('2026-08-01', '2026-09-17'), true)
})
