/** 同步中心返回的任务状态；状态由服务端决定，前端只做展示和轮询。 */
export interface SyncJobStatus {
  jobId: string
  jobType: string
  status: 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED'
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
