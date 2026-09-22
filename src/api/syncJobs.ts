import { get, post } from '@/api/http'
import type { SyncJobLastSuccess, SyncJobStatus } from '@/types/syncJob'

/** 批量处理全部有效关注基金；日期、数据完整性和留档由后端检查。 */
export function startDirection1dPredictionSync(): Promise<SyncJobStatus> {
  return post<SyncJobStatus>('/api/v1/sync-jobs/direction-1d-predictions')
}

export function getLatestDirection1dPredictionSync(): Promise<SyncJobStatus | null> {
  return get<SyncJobStatus | null>('/api/v1/sync-jobs/direction-1d-predictions/latest')
}

/** 费率同步进入后台任务；无代码时沿用模拟持仓及定投范围全量初始化。 */
export function startSimulationFeeSync(fundCode?: string): Promise<SyncJobStatus> {
  const query = fundCode ? `?${new URLSearchParams({ fundCode })}` : ''
  return post<SyncJobStatus>(`/api/v1/sync-jobs/simulation-fees${query}`)
}

export function getLatestSimulationFeeSync(): Promise<SyncJobStatus | null> {
  return get<SyncJobStatus | null>('/api/v1/sync-jobs/simulation-fees/latest')
}

/** 一次创建全部同步的后台串行批次；后续调度不依赖当前页面。 */
export function startAllSync(): Promise<SyncJobStatus> {
  return post<SyncJobStatus>('/api/v1/sync-jobs/all')
}

/** 恢复当前 Python 进程最近批次，只读取状态。 */
export function getLatestAllSync(): Promise<SyncJobStatus | null> {
  return get<SyncJobStatus | null>('/api/v1/sync-jobs/all/latest')
}

/** 创建基金市场最新净值增量同步任务；浏览器只调用 Java 核心服务。 */
export function startMarketNavIncrementalSync(): Promise<SyncJobStatus> {
  return post<SyncJobStatus>('/api/v1/sync-jobs/market-nav-incremental')
}

/** 更新基金资料与市场数据；覆盖完整资料，仅使用当前已验权能力。 */
export function startMarketFreeDataCompletionSync(): Promise<SyncJobStatus> {
  return post<SyncJobStatus>('/api/v1/sync-jobs/market-free-data-completion')
}

/** 从已保存的净值计算历史指标；沿用后台任务标识，不触发外部市场数据调用。 */
export function startStockFeatureSnapshotSync(): Promise<SyncJobStatus> {
  return post<SyncJobStatus>('/api/v1/sync-jobs/stock-feature-snapshots')
}

/** 查询指定任务的实时进度，不会重新发起外部数据请求。 */
export function getSyncJob(jobId: string): Promise<SyncJobStatus> {
  return get<SyncJobStatus>(`/api/v1/sync-jobs/${encodeURIComponent(jobId)}`)
}

/** 查询本机 Python 服务当前进程最近一次基金市场同步任务。 */
export function getLatestMarketNavIncrementalSync(): Promise<SyncJobStatus | null> {
  return get<SyncJobStatus | null>('/api/v1/sync-jobs/market-nav-incremental/latest')
}

/** 查询当前 Python 进程最近一次基金资料与市场数据更新任务，不会重新发起同步。 */
export function getLatestMarketFreeDataCompletionSync(): Promise<SyncJobStatus | null> {
  return get<SyncJobStatus | null>('/api/v1/sync-jobs/market-free-data-completion/latest')
}

/** 查询当前 Python 进程最近一次历史指标计算任务。 */
export function getLatestStockFeatureSnapshotSync(): Promise<SyncJobStatus | null> {
  return get<SyncJobStatus | null>('/api/v1/sync-jobs/stock-feature-snapshots/latest')
}

/** 查询每项任务最近一次完整成功的持久化时间。 */
export function getLastSuccessfulSyncTimes(): Promise<SyncJobLastSuccess[]> {
  return get<SyncJobLastSuccess[]>('/api/v1/sync-jobs/last-success')
}
