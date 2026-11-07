import test from 'node:test'
import assert from 'node:assert/strict'
import { buildPortfolioList, sortPortfolioList } from '../src/utils/portfolioList.ts'

test('确认名单补列缺少账本的基金，已有持仓优先且不改写数值', () => {
  const position = { fundCode: '001021', fundName: '已有持仓', marketValue: '391.32', holdingGain: '-8', cumulativeGain: '2' }
  const result = buildPortfolioList({ positions: [position], unrecordedHoldings: [
    { fundCode: '001021', fundName: '重复名称' }, { fundCode: '021740', fundName: '黄金联接C' },
    { fundCode: '021740', fundName: '重复记录' },
  ] })
  assert.equal(result.length, 2)
  assert.deepEqual(result[0], { ...position, kind: 'recorded', yesterdayGain: null, yesterdayDate: result[0].yesterdayDate })
  assert.deepEqual(result[1], { fundCode: '021740', fundName: '黄金联接C', kind: 'unrecorded',
    marketValue: null, holdingGain: null, cumulativeGain: null })
  assert.equal('shares' in result[1], false)
  assert.equal('kind' in position, false)
  assert.deepEqual(buildPortfolioList({ positions: [position] }), [result[0]])
})

test('未知金额不能按零收益排序；亏损记录仍排在缺少账本的基金前面', () => {
  const items = buildPortfolioList({ positions: [
    { fundCode: '001021', fundName: '亏损', marketValue: '100', holdingGain: '-8', cumulativeGain: '-9' },
    { fundCode: '001632', fundName: '盈利', marketValue: '20', holdingGain: '2', cumulativeGain: '3' },
  ], unrecordedHoldings: [{ fundCode: '021740', fundName: '未记录' }] })
  assert.deepEqual(sortPortfolioList(items, 'marketValue').map(p => p.fundCode), ['001021', '001632', '021740'])
  for (const field of ['holdingGain', 'cumulativeGain']) {
    assert.deepEqual(sortPortfolioList(items, field).map(p => p.fundCode), ['001632', '001021', '021740'])
  }
  assert.equal(items[0].fundCode, '001021')
})

test('截图金额和收益逐项保留，份额不推算；未来新增账本使用定点数累加', () => {
  const baseline = { snapshotId: 'test', dataAsOfDate: null, recordedAt: '2026-11-02T00:00:00Z', holdings: [
    { fundCode: '021740', fundName: '黄金联接C', reportedAmount: '1236.88', reportedWeightPct: '8.57',
      reportedDailyGainAmount: '0.00', reportedHoldingGainAmount: '-82.40', reportedHoldingGainPct: '-6.29', reportedCumulativeGainAmount: '-54.12' },
  ] }
  const [original] = buildPortfolioList({ positions: [], confirmedBaseline: baseline })
  assert.equal(original.kind, 'confirmed')
  assert.equal(original.marketValue, '1236.88000000')
  assert.equal(original.holdingGain, '-82.40000000')
  assert.equal(original.cumulativeGain, '-54.12000000')
  assert.equal(original.holdingGainRate, -0.0629)
  assert.equal(original.dailyGain, null)
  assert.equal(original.yesterdayGain, null)
  assert.equal(original.dataAsOfDate, null)
  assert.equal('shares' in original, false)
  const [added] = buildPortfolioList({ confirmedBaseline: baseline, positions: [
    { fundCode: '021740', fundName: '黄金联接C', marketValue: '10.12000001', holdingGain: '0.12', cumulativeGain: '0.11', dailyGain: null },
  ] })
  assert.equal(added.marketValue, '1247.00000001')
  assert.equal(added.holdingGain, '-82.28000000')
  assert.equal(added.cumulativeGain, '-54.01000000')
  assert.equal(added.dailyGain, null)
  assert.equal(added.holdingGainRate, null)
  assert.equal(baseline.holdings[0].reportedAmount, '1236.88')
  const [pending] = buildPortfolioList({ confirmedBaseline: baseline, positions: [
    { fundCode: '021740', fundName: '黄金联接C', marketValue: '0E-8', holdingGain: '0E-8', cumulativeGain: '0E-8', dailyGain: null },
  ] })
  assert.equal(pending.marketValue, '1236.88000000')
  assert.equal(pending.holdingGain, '-82.40000000')
})

test('昨日收益读取准确日期，不能显示今日收益、旧响应或部分收益', () => {
  const positions = [
    { fundCode: '000001', fundName: '普通基金', dailyGain: '99', navDate: '2026-11-02', issue: null },
    { fundCode: '000002', fundName: '待补齐基金', dailyGain: '88', navDate: '2026-11-02', issue: null },
    { fundCode: '000003', fundName: '待核对基金', dailyGain: '77', navDate: '2026-11-01', issue: '待核对' },
  ]
  const overview = { positions, yesterdayIncome: { date: '2026-11-01', funds: [
    { fundCode: '000001', status: 'COMPLETE', dailyGain: '-3.20' },
    { fundCode: '000002', status: 'PARTIAL', dailyGain: '1.20' },
    { fundCode: '000003', status: 'COMPLETE', dailyGain: '3' },
  ] } }
  assert.deepEqual(buildPortfolioList(overview, '2026-11-01').map(p => p.yesterdayGain), ['-3.20', null, null])
  assert.deepEqual(buildPortfolioList(overview, '2026-11-02').map(p => p.yesterdayGain), [null, null, null])
  assert.deepEqual(buildPortfolioList({ positions }, '2026-11-01').map(p => p.yesterdayGain), [null, null, null])
})

test('已确认非交易日的零收益与缺少记录不同；期初余额不会重复加上旧确认值', () => {
  const position = { fundCode: '000001', fundName: '期初基金', marketValue: '123.45', holdingGain: '-5',
    cumulativeGain: '-2', dailyGain: null, estimatedShares: true }
  const [item] = buildPortfolioList({ positions: [position], confirmedBaseline: null,
    yesterdayIncome: { date: '2026-11-01', funds: [{ fundCode: '000001', status: 'NON_TRADING', dailyGain: '0.00000000' }] } }, '2026-11-01')
  assert.equal(item.kind, 'recorded')
  assert.equal(item.marketValue, '123.45')
  assert.equal(item.yesterdayGain, '0.00000000')
  assert.equal(item.estimatedShares, true)
})
