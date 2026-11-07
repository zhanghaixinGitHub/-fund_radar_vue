import type { DecimalValue, SimOverview, SimPosition } from '../types/simulation'

/** 名单条目与真实模拟持仓明确分开，未知金额不填零，也不生成模拟交易。 */
export type PortfolioListItem = (SimPosition & { kind: 'recorded'; yesterdayGain: DecimalValue | null; yesterdayDate: string }) | {
  kind: 'confirmed'
  fundCode: string; fundName: string
  marketValue: string; holdingGain: string; cumulativeGain: string
  holdingGainRate: number | null; dailyGain: DecimalValue | null
  yesterdayGain: DecimalValue | null; yesterdayDate: string
  dataAsOfDate: string | null
  additionalPosition: SimPosition | null
} | {
  kind: 'unrecorded'
  fundCode: string
  fundName: string
  marketValue: null
  holdingGain: null
  cumulativeGain: null
}

/** 合并服务端按本人隔离的两份名单；已有账本优先，同一基金只展示一次。 */
export function buildPortfolioList(
  overview: Pick<SimOverview, 'positions' | 'unrecordedHoldings' | 'confirmedBaseline' | 'yesterdayIncome'>,
  expectedYesterday = shanghaiYesterday(),
): PortfolioListItem[] {
  const items = new Map<string, PortfolioListItem>()
  const income = new Map(overview.yesterdayIncome?.date === expectedYesterday
    ? overview.yesterdayIncome.funds.map(item => [item.fundCode, item] as const) : [])
  for (const position of overview.positions) {
    const yesterday = income.get(position.fundCode)
    // 只有完整收益或日历明确确认的非交易日才能显示金额；旧版本仅在净值日期恰为昨日时兼容。
    const yesterdayGain = position.issue ? null : yesterday
      ? ['COMPLETE', 'NON_TRADING'].includes(yesterday.status) ? yesterday.dailyGain : null
      : overview.yesterdayIncome ? null : position.navDate === expectedYesterday ? position.dailyGain : null
    items.set(position.fundCode, { ...position, kind: 'recorded', yesterdayGain: yesterdayGain ?? null, yesterdayDate: expectedYesterday })
  }
  for (const holding of overview.confirmedBaseline?.holdings ?? []) {
    const added = overview.positions.find(p => p.fundCode === holding.fundCode) ?? null
    items.set(holding.fundCode, {
      kind: 'confirmed', fundCode: holding.fundCode, fundName: holding.fundName,
      marketValue: addAmounts(holding.reportedAmount, added?.marketValue ?? '0'),
      holdingGain: addAmounts(holding.reportedHoldingGainAmount, added?.holdingGain ?? '0'),
      cumulativeGain: addAmounts(holding.reportedCumulativeGainAmount, added?.cumulativeGain ?? '0'),
      // 截图收益率按原值保留；有新增交易时不能以不唯一的原成本推算合并收益率。
      holdingGainRate: added ? null : Number(holding.reportedHoldingGainPct) / 100,
      // 尚未采用为期初余额时，录入收益和新增部分收益都不能充当整只基金的昨日收益。
      dailyGain: null, yesterdayGain: null, yesterdayDate: expectedYesterday,
      dataAsOfDate: overview.confirmedBaseline?.dataAsOfDate ?? null, additionalPosition: added,
    })
  }
  for (const fund of overview.unrecordedHoldings ?? []) {
    if (!items.has(fund.fundCode)) items.set(fund.fundCode, {
      ...fund, kind: 'unrecorded', marketValue: null, holdingGain: null, cumulativeGain: null,
    })
  }
  return [...items.values()]
}

/** 用北京时间确定昨日，避免本机时区或跨午夜的旧响应把其他日期收益标为昨日。 */
function shanghaiYesterday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date(Date.now() - 86400000))
}

/** 金额合并使用八位定点整数，避免二进制浮点累加改变截图分位数；不推算缺失金额。 */
function addAmounts(left: DecimalValue, right: DecimalValue): string {
  const scale = 100000000n
  const parse = (value: DecimalValue) => {
    const match = /^(-?)(\d+)(?:[.](\d*))?(?:[eE]([+-]?\d+))?$/.exec(String(value))
    if (!match) throw new Error('持仓金额格式不正确。')
    // Java 的八位零会序列化为 0E-8；按十进制移位读取，不能改用浮点数或将待确认金额误填为已投入。
    const exponent = Number(match[4] ?? 0)
    if (Math.abs(exponent) > 30) throw new Error('持仓金额超出范围。')
    const fraction = match[3] ?? ''
    const shift = 8 + exponent - fraction.length
    const digits = BigInt(match[2]! + fraction)
    const divisor = shift < 0 ? 10n ** BigInt(-shift) : 1n
    if (digits % divisor !== 0n) throw new Error('持仓金额精度超出范围。')
    const units = shift < 0 ? digits / divisor : digits * 10n ** BigInt(shift)
    return match[1] ? -units : units
  }
  const sum = parse(left) + parse(right)
  const absolute = sum < 0n ? -sum : sum
  return `${sum < 0n ? '-' : ''}${absolute / scale}.${String(absolute % scale).padStart(8, '0')}`
}

/** 金额降序排列；未知值排在有数值的基金之后，包括真实亏损值之后。 */
export function sortPortfolioList(items: PortfolioListItem[], field: 'marketValue' | 'holdingGain' | 'cumulativeGain'): PortfolioListItem[] {
  return [...items].sort((a, b) => {
    if (a[field] === null) return b[field] === null ? a.fundCode.localeCompare(b.fundCode) : 1
    if (b[field] === null) return -1
    return Number(b[field]) - Number(a[field]) || a.fundCode.localeCompare(b.fundCode)
  })
}
