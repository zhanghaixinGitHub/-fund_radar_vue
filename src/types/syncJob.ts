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
}

/** 任务最近一次完整成功的持久化时间，不依赖当前 Python 进程是否重启。 */
export interface SyncJobLastSuccess {
  jobType: string
  lastSuccessfulAt: string | null
}
