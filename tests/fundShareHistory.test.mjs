import test from 'node:test'
import assert from 'node:assert/strict'
import { buildFundShareHistoryRows } from '../src/utils/fundShareHistory.ts'

const share = (tradeDate, fundShare) => ({ tradeDate, fundShare, dataSource: 'TUSHARE_PRO_FUND' })
const nav = (navDate, unitNav, accumulatedNav = null) => ({ navDate, unitNav, accumulatedNav })

test('按日期对齐同日单位净值，跨越缺失季度仍与真实上一条记录比较', () => {
  const points = [share('2026-06-30', '179383.2764'), share('2025-06-30', '47602.4257'), share('2026-03-31', '180805.7208')]
  const original = points.map(point => ({ ...point }))
  const rows = buildFundShareHistoryRows(points, [nav('2026-06-30', '6.4916', '6.6396')])
  assert.deepEqual(rows.map(row => [row.tradeDate, row.previousDate, row.shareChange, row.unitNav]), [
    ['2025-06-30', null, null, null],
    ['2026-03-31', '2025-06-30', 133203.2951, null],
    ['2026-06-30', '2026-03-31', -1422.4444, 6.4916],
  ])
  assert.deepEqual(points, original)
})

test('非交易日没有同日净值时留空，不借用前后交易日或累计净值', () => {
  const rows = buildFundShareHistoryRows([share('2024-06-30', 100)], [
    nav('2024-06-28', 2), nav('2024-07-01', 3), nav('2024-06-30', null, 4),
  ])
  assert.equal(rows[0].unitNav, null)
})

test('缺失或非法份额不伪装为零；真实零份额保留且可计算减少量', () => {
  const rows = buildFundShareHistoryRows([
    share('2026-01-01', 100), share('2026-01-02', null), share('2026-01-03', ''),
    share('2026-01-04', '  '), share('2026-01-05', 'NaN'), share('2026-01-06', -1),
    share('2026-01-07', 0),
  ], [])
  assert.deepEqual(rows.map(row => [row.fundShare, row.shareChange]), [[100, null], [0, -100]])
})

test('同日净值的空白、零、负数和非法值均不作为有效价格', () => {
  for (const value of [null, undefined, '', ' ', 0, -1, Infinity, 'NaN']) {
    assert.equal(buildFundShareHistoryRows([share('2026-06-30', 100)], [nav('2026-06-30', value)])[0].unitNav, null)
  }
})

test('最近 12 条的最早一行仍能与未展示的第 13 条比较', () => {
  const points = Array.from({ length: 13 }, (_, index) => share(`2026-01-${String(index + 1).padStart(2, '0')}`, 100 + index))
  const recent = buildFundShareHistoryRows(points, []).slice(-12).toReversed()
  assert.equal(recent.length, 12)
  assert.equal(recent.at(-1).previousDate, '2026-01-01')
  assert.equal(recent.at(-1).shareChange, 1)
})

test('微小份额增减按四位小数精确展示，持平时保持零变化', () => {
  const rows = buildFundShareHistoryRows([
    share('2026-01-01', '0.3000'), share('2026-01-02', '0.3001'),
    share('2026-01-03', '0.3000'), share('2026-01-04', '0.3000'),
  ], [])
  assert.deepEqual(rows.map(row => row.shareChange), [null, 0.0001, -0.0001, 0])
  assert.deepEqual(buildFundShareHistoryRows([], []), [])
})
