/** 模拟账本数值由 Java 十进制计算；用字符串传输，保留份额精度。 */
export type DecimalValue = string | number
export interface SimPosition {
  fundCode: string; fundName: string; shares: DecimalValue; frozenShares: DecimalValue
  availableShares: DecimalValue; cost: DecimalValue; marketValue: DecimalValue
  holdingGain: DecimalValue; holdingGainRate: DecimalValue | null; realizedGain: DecimalValue
  dividendGain: DecimalValue; receivableDividend: DecimalValue; paidDividend: DecimalValue
  cumulativeGain: DecimalValue; dailyGain: DecimalValue | null; totalBuy: DecimalValue; totalSell: DecimalValue
  unitNav: DecimalValue | null; navDate: string | null; issue: string | null
}
export interface SimOverview {
  positions: SimPosition[]; marketValue: DecimalValue; holdingGain: DecimalValue; cumulativeGain: DecimalValue
  pendingBuyAmount: DecimalValue; pendingOrders: number; complete: boolean; rules: string
  job: { status: string; attemptedAt: string; completedAt: string | null; message: string | null } | null
}
export interface SimPreview {
  fundCode: string; fundName: string; supported: boolean; reason: string | null
  referenceNav: DecimalValue | null; referenceDate: string | null; tradeDate: string; eligibleDate: string
  availableShares: DecimalValue; pendingBuys: number; rules: string
}
export interface SimExecution {
  shares: DecimalValue; unitNav: DecimalValue; grossAmount: DecimalValue
  cost: DecimalValue; realizedGain: DecimalValue; navRevision: string; source: string
}
export interface SimOrder {
  orderId: string; fundCode: string; fundName: string; side: 'BUY' | 'SELL'
  amount: DecimalValue | null; shares: DecimalValue | null; tradeDate: string; eligibleDate: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'; sourceKind: 'MANUAL' | 'RECURRING'
  createdAt: string; confirmedAt: string | null; execution: SimExecution | null
}
export interface SimPlan {
  planId: string; fundCode: string; fundName: string; amount: DecimalValue
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'; dayValue: number; startDate: string; endDate: string | null
  maxPeriods: number | null; scheduledDate: string; executionDate: string
  status: 'ACTIVE' | 'PAUSED' | 'ENDED'; version: number; requestKey: string
  orderedPeriods: number; investedAmount: DecimalValue
}
export interface SimPeriod {
  executionId: string; planId: string; scheduledDate: string; executionDate: string
  status: 'ORDERED' | 'MISSED' | 'SKIPPED'; orderId: string | null; message: string; createdAt: string
}
export interface SimDaily { date: string; marketValue: DecimalValue; cumulativeGain: DecimalValue; dailyGain: DecimalValue | null }
export interface SimLedger {
  entryId: string; fundCode: string; entryType: string; payload: Record<string, unknown>; createdAt: string
}
export interface SimPage<T> { items: T[]; page: number; pageSize: number; totalCount: number }
export interface SimOrderRequest {
  requestKey: string; fundCode: string; side: 'BUY' | 'SELL'
  amount: string | null; shares: string | null; pausePlan: boolean
}
export interface SimPlanRequest {
  requestKey: string; fundCode: string; amount: string; frequency: SimPlan['frequency']; dayValue: number
  startDate: string; endDate: string | null; maxPeriods: number | null; version: number
}
