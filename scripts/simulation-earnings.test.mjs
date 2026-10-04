import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { Buffer } from 'node:buffer'
import { URL, URLSearchParams } from 'node:url'
const source = stripTypeScriptTypes(readFileSync(new URL('../src/utils/simulationEarnings.ts', import.meta.url), 'utf8'))
const { earningsFailureMessage, earningsMoney, earningsTooltipValue, earningsStatus, earningsReturnPath, shouldOpenEarnings, shouldBlockEarningsLink, rememberEarningsScroll, takeEarningsScroll } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
test('正负收益有符号，未知不能冒充零', () => {
  assert.equal(earningsMoney('12.2'), '+12.20'); assert.equal(earningsMoney('-3.2'), '-3.20')
  assert.equal(earningsMoney('0'), '0.00'); assert.equal(earningsMoney(null), '—'); assert.equal(earningsMoney(''), '—')
  assert.notEqual(earningsStatus('PENDING'), earningsStatus('MISSING'))
  assert.notEqual(earningsStatus('NON_TRADING'), earningsStatus('COMPLETE'))
})
test('返回保留筛选排序分页历史条件，拒绝外部路径及越权字段', () => {
  const path = '/portfolio?section=holdings&keyword=测试%20基金&sort=cumulativeGain&page=2&size=20&showHistory=1'
  const value = earningsReturnPath(path)
  const params = new URLSearchParams(value.split('?')[1])
  assert.equal(params.get('sort'), 'cumulativeGain'); assert.equal(params.get('keyword'), '测试 基金')
  assert.equal(params.get('page'), '2'); assert.equal(params.get('size'), '20'); assert.equal(params.get('showHistory'), '1')
  assert.equal(earningsReturnPath('https://example.com'), '/portfolio?section=holdings')
  assert.equal(earningsReturnPath('/portfolio?userId=other&sort=illegal'), '/portfolio')
  rememberEarningsScroll(path, 456); assert.equal(takeEarningsScroll(value), 456); assert.equal(takeEarningsScroll(value), null)
})
test('卡片排除综合建议和底部操作，选择文本及辅助点击不导航', () => {
  class Element { constructor(excluded = false) { this.excluded = excluded } closest(selector) { assert.match(selector, /data-earnings-exclude/); return this.excluded ? {} : null } }
  globalThis.Element = Element
  const event = { target: new Element(), button: 0, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false }
  assert.equal(shouldOpenEarnings(event, ''), true)
  assert.equal(shouldOpenEarnings(event, '选择的收益金额'), false)
  assert.equal(shouldOpenEarnings({ ...event, target: new Element(true) }, ''), false)
  assert.equal(shouldOpenEarnings({ ...event, ctrlKey: true }, ''), false)
  assert.equal(shouldOpenEarnings({ ...event, button: 1 }, ''), false)
})
test('曲线提示不能把缺失值或无效数值变成零', () => {
  for (const value of [null, undefined, '', NaN, Infinity, '非法']) assert.equal(earningsTooltipValue(value), '数据未完整')
  assert.equal(earningsTooltipValue(0), '0.00 元'); assert.equal(earningsTooltipValue('-12.5'), '-12.50 元')
})
test('收益链接选字在捕获阶段保护，键盘辅助点击和其他按钮保留', () => {
  class Element { constructor(link = true) { this.link = link } closest(selector) { assert.equal(selector, '[data-earnings-link]'); return this.link ? {} : null } }
  globalThis.Element = Element
  const event = { target: new Element(), button: 0, detail: 1 }
  assert.equal(shouldBlockEarningsLink(event, '演示基金'), true)
  assert.equal(shouldBlockEarningsLink(event, ''), false)
  assert.equal(shouldBlockEarningsLink({ ...event, detail: 0 }, '演示基金'), false)
  assert.equal(shouldBlockEarningsLink({ ...event, ctrlKey: true }, '演示基金'), false)
  assert.equal(shouldBlockEarningsLink({ ...event, metaKey: true }, '演示基金'), false)
  assert.equal(shouldBlockEarningsLink({ ...event, target: new Element(false) }, '演示基金'), false)
})
test('失败提示区分参数、登录、权限、不可用，不把服务故障归咎于日期', () => {
  assert.match(earningsFailureMessage(400, 'INVALID_ARGUMENT', 'earnings'), /查询条件无效/)
  assert.match(earningsFailureMessage(401, 'UNAUTHORIZED', 'earnings'), /重新登录/)
  assert.match(earningsFailureMessage(403, 'FORBIDDEN', 'earnings'), /没有.*权限/)
  assert.match(earningsFailureMessage(404, 'HTTP_ERROR', 'earnings'), /暂时不可用/)
  for (const status of [500, 502, 503, null]) {
    const message = earningsFailureMessage(status, 'INTERNAL_ERROR', 'earnings')
    assert.match(message, /暂时无法获取/); assert.doesNotMatch(message, /日期|基金代码|本人记录/)
  }
})
test('失败提示保留本人历史边界与容量说明，未知后台码不透出', () => {
  assert.match(earningsFailureMessage(409, 'SIM_NOT_FOUND', 'earnings'), /本人收益记录/)
  assert.match(earningsFailureMessage(409, 'SIM_HISTORY_LIMIT', 'fund-search'), /完整的 6 位/)
  assert.match(earningsFailureMessage(409, 'SIM_HISTORY_LIMIT', 'earnings'), /2000/)
  assert.equal(earningsFailureMessage(500, 'private-database-error', 'day-details'), '当天基金构成暂时无法获取，请稍后重试。')
})
