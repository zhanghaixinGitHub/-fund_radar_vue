/** 正式结果和研究状态的页面契约；只有AVAILABLE允许数字，不能把研究分数当概率。 */
export interface WatchlistPrediction {
  fundCode: string
  status: 'AVAILABLE' | 'STALE' | 'MODEL_NOT_RELEASED' | 'DATA_INSUFFICIENT' | 'NOT_APPLICABLE' | 'UNAVAILABLE'
  /** 整体观察未来20个交易日，不是20天逐日预测。 */
  horizonTradingDays: 20
  upProbability: number | null
  direction: 'UP' | 'NON_UP' | null
  /** 数据日期与研究时间不同，均不代表已生成今日预测。 */
  latestNavDate: string | null
  researchRunId: string | null
  researchEvaluatedAt: string | null
  modelVersion: string | null
  /** 已保存的结果身份和原始日期；刷新页面不得改变预测区间。 */
  forecastId: string | null
  cutoffDate: string | null
  targetBaseDate: string | null
  targetEndDate: string | null
  generatedAt: string | null
  modelHash: string | null
  reasonCodes: string[]
  reasons: string[]
  message: string
  disclaimer: string
}
