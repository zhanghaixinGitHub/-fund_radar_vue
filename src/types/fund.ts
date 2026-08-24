/** Public M0 fund contract returned only by the Java core service. */
export interface FundSummary {
  fundCode: string
  fundName: string
  fundType: string
  status: string
  asOfDate: string
}

/** Public M0 fund detail; `M0_MOCK` must never be presented as market data. */
export interface FundDetail extends FundSummary {
  navStatus: string
  dataSource: string
}

/** Cursor-compatible public fund page. */
export interface FundPage {
  items: FundSummary[]
  nextCursor: string | null
}

export interface FundListQuery {
  keyword?: string
  pageSize?: number
  cursor?: string
}
