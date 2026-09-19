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
  dailyGain: DecimalValue | null; pendingBuyAmount: DecimalValue; pendingOrders: number; complete: boolean; rules: string
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
  /** V2 计费口径订单才有：费用与净金额；V1 历史订单为空。 */
  fee: DecimalValue | null; netAmount: DecimalValue | null; ruleVersion: string | null
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
/** 管理员手动补录定投的执行结果；与定时任务共用同一执行与结算链路。 */
export interface SimRecurringRunResult {
  ranAt: string; plansChecked: number; ordersCreated: number; plansSkipped: number; message: string
}
/** sim_fee_rule 管理列表行；含已终止的历史版本，effectiveTo 为空表示生效中。 */
export interface SimFeeRuleRow {
  ruleId: number; fundCode: string; fundName: string; feeType: 'PURCHASE' | 'REDEEM'
  minDays: number | null; maxDays: number | null; rate: DecimalValue
  discountInfo: string | null; dataSource: string
  effectiveFrom: string; effectiveTo: string | null; version: number; updatedAt: string | null
}
/** 全量费率初始化结果；失败项只记录基金与原因。 */
export interface SimFeeInitResult { total: number; updated: number; failures: string[] }
