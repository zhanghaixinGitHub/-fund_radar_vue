import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { URL } from 'node:url'
import { ratingLabel, ratingSourceUrl } from '../src/utils/fundRating.ts'

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
test('评级随列表展示，不再补发评级请求，且保留详情导航', () => {
  const source = readFileSync(new URL('../src/views/FundMarketPage.vue', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /readFundRatings|ratingLoading|evaluationSequence/)
  assert.match(source, /:value="fund\.rating"/)
  const navigation = readFileSync(new URL('../src/composables/usePageNavigation.ts', import.meta.url), 'utf8')
  assert.match(navigation, /key: 'comparison'[^\n]+\n\s*\{ key: 'rating'/)
})
