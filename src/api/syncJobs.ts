import { get, post } from '@/api/http'
import type { SyncJobLastSuccess, SyncJobStatus } from '@/types/syncJob'

/** 创建基金市场最新净值增量同步任务；浏览器只调用 Java 核心服务。 */
export function startMarketNavIncrementalSync(): Promise<SyncJobStatus> {
  return post<SyncJobStatus>('/api/v1/sync-jobs/market-nav-incremental')
}

/** 创建基金市场完整资料同步任务；只允许管理员主动发起。 */
export function startMarketDetailSync(): Promise<SyncJobStatus> {
  return post<SyncJobStatus>('/api/v1/sync-jobs/market-details')
}

/** 查询指定任务的实时进度，不会重新发起外部数据请求。 */
export function getSyncJob(jobId: string): Promise<SyncJobStatus> {
  return get<SyncJobStatus>(`/api/v1/sync-jobs/${encodeURIComponent(jobId)}`)
}

/** 查询本机 Python 服务当前进程最近一次基金市场同步任务。 */
export function getLatestMarketNavIncrementalSync(): Promise<SyncJobStatus | null> {
  return get<SyncJobStatus | null>('/api/v1/sync-jobs/market-nav-incremental/latest')
}

/** 查询当前 Python 进程最近一次完整资料同步任务。 */
export function getLatestMarketDetailSync(): Promise<SyncJobStatus | null> {
  return get<SyncJobStatus | null>('/api/v1/sync-jobs/market-details/latest')
}

/** 查询每项任务最近一次完整成功的持久化时间。 */
export function getLastSuccessfulSyncTimes(): Promise<SyncJobLastSuccess[]> {
  return get<SyncJobLastSuccess[]>('/api/v1/sync-jobs/last-success')
}
