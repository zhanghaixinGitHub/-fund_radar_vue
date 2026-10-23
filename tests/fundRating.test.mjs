import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { URL } from 'node:url'
import { formatRatingScore, normalizeRatingFilter, ratingFilterOptions, ratingLabel, ratingSourceUrl } from '../src/utils/fundRating.ts'

const current = { status: 'RATED', grade: 'GOOD', validUntil: '2026-11-01T00:00:00+08:00' }
test('四种等级仅翻译服务端结果，过期和故障不冒充偏弱', () => {
  const now = Date.parse('2026-10-10T00:00:00+08:00')
  for (const [grade, label] of Object.entries({ WEAK: '偏弱', AVERAGE: '一般', GOOD: '良好', EXCELLENT: '优质' }))
    assert.equal(ratingLabel({ ...current, grade }, false, now), label)
  assert.equal(ratingLabel(current, false, Date.parse(current.validUntil)), '评级待更新')
  assert.equal(ratingLabel({ status: 'NOT_RATED' }), '暂无评分')
  assert.equal(ratingLabel({ status: 'UNSUPPORTED' }), '暂无评分')
  assert.equal(ratingLabel({ status: 'WITHDRAWN' }), '评级待更新')
  assert.equal(ratingLabel(), '评级暂不可用')
  assert.equal(ratingLabel(undefined, true), '评级读取中')
  assert.equal(ratingLabel({ ...current, validUntil: null }), '评级暂不可用')
})
test('来源只接受安全的 HTTPS 页面', () => {
  assert.equal(ratingSourceUrl('javascript:alert(1)'), undefined)
  assert.equal(ratingSourceUrl('https://user:secret@example.org'), undefined)
  assert.equal(ratingSourceUrl('https://example.org/report'), 'https://example.org/report')
})

test('部分评分独立标注，到期不继续显示当前结果，也不伪造综合等级', () => {
  const now = Date.parse('2026-10-23T00:00:00+08:00')
  const partial = { ...current, status: 'PARTIAL', grade: null, partialScore: '67.11' }
  assert.equal(ratingLabel(partial, false, now), '部分评分')
  assert.equal(ratingLabel(partial, false, Date.parse(current.validUntil)), '评级待更新')
  assert.equal(ratingLabel({ ...partial, validUntil: null }, false, now), '评级暂不可用')
})

test('数字分仅格式化服务端结果，零分保留，缺失和非法值不补零', () => {
  assert.equal(formatRatingScore('64.124959252060'), '64.12')
  assert.equal(formatRatingScore('0'), '0.00')
  assert.equal(formatRatingScore(100), '100.00')
  for (const value of [null, undefined, '', ' ', true, false, 'NaN', 'Infinity', -1, 101])
    assert.equal(formatRatingScore(value), null)
})

test('评级筛选白名单包含四档和两种业务状态，未知或多值参数恢复全部', () => {
  for (const { value } of ratingFilterOptions) assert.equal(normalizeRatingFilter(value), value)
  for (const value of ['', null, undefined, 'unknown', ['GOOD'], '良好'])
    assert.equal(normalizeRatingFilter(value), '')
})
test('评级随列表展示，不再补发评级请求，且保留详情导航', () => {
  const source = readFileSync(new URL('../src/views/FundMarketPage.vue', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /readFundRatings|ratingLoading|evaluationSequence/)
  assert.match(source, /:value="fund\.rating"/)
  const navigation = readFileSync(new URL('../src/composables/usePageNavigation.ts', import.meta.url), 'utf8')
  assert.match(navigation, /key: 'comparison'[^\n]+\n\s*\{ key: 'rating'/)
})
