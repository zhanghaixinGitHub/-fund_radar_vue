/** 实验分数与正式上涨概率使用独立契约。 */
export interface DirectionExperiment {
  fundCode: string
  version: 'DIRECTION_PAGE_TRIAL_V1'
  status: 'EXPERIMENTAL' | 'DATA_INSUFFICIENT' | 'NOT_APPLICABLE' | 'UNAVAILABLE'
  modelReleased: false
  horizonTradingDays: 20
  researchRunId: string
  cutoffDate: string | null
  latestNavDate: string | null
  targetBaseDate: string | null
  targetEndDate: string | null
  readAt: string
  inputHash: string | null
  sourceRevisionId: string | null
  models: {
    branch: 'DROP_60D_GROUP_L2' | 'REFERENCE'
    score: number
    direction: 'UP' | 'NON_UP'
    modelHash: string
    fitEnd: string
  }[]
  reasonCodes: string[]
  message: string
}
