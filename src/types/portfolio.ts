/** Java 对外返回的单只截图持仓展示字段；不是份额、成本或实时净值。 */
export interface PortfolioHoldingSnapshot {
  fundCode: string
  fundName: string
  reportedAmount: number | string
  reportedWeightPct: number | string
  reportedDailyGainAmount: number | string
  reportedHoldingGainAmount: number | string
  reportedHoldingGainPct: number | string
  reportedCumulativeGainAmount: number | string
}

/** 当前登录用户的最新确认持仓快照。 */
export interface PortfolioSnapshot {
  available: boolean
  sourceKind: 'USER_CONFIRMED_SCREENSHOT' | null
  dataAsOfStatus: 'KNOWN' | 'UNKNOWN' | null
  dataAsOfDate: string | null
  importedAt: string | null
  holdings: PortfolioHoldingSnapshot[]
}
