/** 同步中心返回的任务状态；状态由服务端决定，前端只做展示和轮询。 */
export interface SyncJobStatus {
  jobId: string
  jobType: string
  status: 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'PARTIAL_SUCCESS' | 'FAILED'
  requestedNavDate: string
  fundCodes: string[]
  progressCurrent: number
  progressTotal: number
  currentFundCode: string | null
  progressMessage: string
  syncRunId: string | null
  fetchedCount: number
  createdCount: number
  updatedCount: number
  skippedCount: number
  errorCode: string | null
  errorMessage: string | null
  startedAt: string | null
  finishedAt: string | null
  /** 新任务返回的业务摘要；旧记录为空时表示没有该统计，不能默认全为零。 */
  resultSummary?: {
    counts?: { COMPLETED: number; WAITING: number; UNSUPPORTED: number; ERROR: number }
    /** 逐基金周期的实际结果；目标日期未取得时为 null，不能用任务兼容日期代替。 */
    items?: { fundCode: string; horizonId: string; targetDate: string | null; state: string; reason?: string | null }[]
    /** 已从保存记录读回的周期、日期和基金数；为空或缺失不能推断存在历史预测。 */
    savedResults?: { horizonId: string; targetDate: string; count: number }[]
    followupIssues?: string[]
    dailyUpdated?: boolean
    historicalGapCount?: number
    currentIssueCount?: number
  } | null
}

/** 任务最近一次完整成功的持久化时间，不依赖当前 Python 进程是否重启。 */
export interface SyncJobLastSuccess {
  jobType: string
  lastSuccessfulAt: string | null
}
