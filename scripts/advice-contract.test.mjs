import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../src/utils/advice.ts', import.meta.url), 'utf8')
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
const { portfolioReturnPath, evidenceUrl, reviewLabel, adviceLabel, rememberPortfolioScroll, takePortfolioScroll } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`)

test('return links preserve only the portfolio filters and never leave the app', () => {
  assert.equal(portfolioReturnPath('https://example.com/portfolio'), '/portfolio?section=holdings')
  assert.equal(portfolioReturnPath('/portfolio?section=holdings&fundCode=006730&redirect=https://example.com'), '/portfolio?section=holdings&fundCode=006730')
  assert.equal(portfolioReturnPath('/portfolio/other?section=holdings'), '/portfolio?section=holdings')
  assert.equal(evidenceUrl('javascript:alert(1)'), undefined)
  assert.equal(evidenceUrl('https://example.com/notice'), 'https://example.com/notice')
})
test('unavailable data does not silently become hold or successful advice', () => {
  assert.equal(adviceLabel('UNAVAILABLE'), '暂无操作建议')
  assert.equal(reviewLabel({ reviewStatus: 'DATA_INSUFFICIENT' }), '等待资料核验')
  assert.equal(reviewLabel({ reviewStatus: 'ASSESSED', support: 'UNSUPPORTED' }), '后续表现不支持')
  assert.equal(reviewLabel({ reviewStatus: 'ASSESSED', support: 'FLAT' }), '区间持平')
})
test('returning from report restores the same list scroll once', () => {
  rememberPortfolioScroll('/portfolio?section=holdings', 700)
  assert.equal(takePortfolioScroll('/portfolio?section=holdings'), 700)
  assert.equal(takePortfolioScroll('/portfolio?section=holdings'), null)
})
