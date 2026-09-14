/** SPX资料同步状态；行情百分比不能解释为基金预测收益或上涨概率。 */
export interface SpxManualAttempt {
  attemptId: string
  state: 'ON_TIME' | 'LATE' | 'REFERENCE_ONLY' | 'INCOMPLETE' | 'RUNNING' | 'INTERRUPTED' | 'FAILED' | 'EXPIRED'
  message: string
  requestedAt: string
  receivedAt: string | null
  persistedAt: string | null
  targetDate: string | null
  latestUsDate: string | null
  close: number | null
  previousClose: number | null
  dailyChangePct: number | null
  overnightChangePct: number | null
  rowCount: number
  missingUsDates: string[]
  usableBeforeU08: boolean
  /** 服务端已进入的真实阶段；完成步骤数不是耗时百分比。 */
  stage: 'SOURCE' | 'FETCH' | 'SAVE' | 'DONE'
  stageLabel: string
  completedSteps: number
  totalSteps: number
  errorCode: string | null
}

export interface SpxManualStatus {
  mode: 'MANUAL'
  serverTime: string
  canSync: boolean
  availability: 'READY' | 'RUNNING' | 'COOLDOWN' | 'BLOCKED'
  message: string
  attemptsToday: number
  maxAttemptsPerDay: number | null
  nextAllowedAt: string | null
  lastAttempt: SpxManualAttempt | null
  performedNow: boolean
  errorCode: string | null
}
