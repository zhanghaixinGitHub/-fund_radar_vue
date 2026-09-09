/** 当前现金研究协议只交付状态；正式发布前概率和方向必须为null。 */
export interface WatchlistPrediction {
  fundCode: string
  status: 'MODEL_NOT_RELEASED' | 'DATA_INSUFFICIENT' | 'NOT_APPLICABLE' | 'UNAVAILABLE'
  /** 整体观察未来20个交易日，不是20天逐日预测。 */
  horizonTradingDays: 20
  upProbability: null
  direction: null
  /** 数据日期与研究时间不同，均不代表已生成今日预测。 */
  latestNavDate: string | null
  researchRunId: string | null
  researchEvaluatedAt: string | null
  modelVersion: string | null
  reasonCodes: string[]
  reasons: string[]
  message: string
  disclaimer: string
}
