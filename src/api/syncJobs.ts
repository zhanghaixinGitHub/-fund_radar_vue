import { get, post } from '@/api/http'
import type { SyncJobStatus } from '@/types/syncJob'

/** 创建基金市场最新净值增量同步任务；浏览器只调用 Java 核心服务。 */
export function startMarketNavIncrementalSync(): Promise<SyncJobStatus> {
  return post<SyncJobStatus>('/api/v1/sync-jobs/market-nav-incremental')
}

/** 查询指定任务的实时进度，不会重新发起外部数据请求。 */
export function getSyncJob(jobId: string): Promise<SyncJobStatus> {
  return get<SyncJobStatus>(`/api/v1/sync-jobs/${encodeURIComponent(jobId)}`)
}

/** 查询本机 Python 服务当前进程最近一次基金市场同步任务。 */
export function getLatestMarketNavIncrementalSync(): Promise<SyncJobStatus | null> {
  return get<SyncJobStatus | null>('/api/v1/sync-jobs/market-nav-incremental/latest')
}
