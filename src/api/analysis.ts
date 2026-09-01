import { get, post } from '@/api/http'
import type { AnalysisRunStatus } from '@/types/analysis'

/** 创建管理员受控滚动回测任务；该调用只排队，不同步等待、不自动发布模型。 */
export function startRollingBacktest(feeRate?: number): Promise<AnalysisRunStatus> {
  return post<AnalysisRunStatus>('/api/v1/admin/analysis/runs/rolling-backtest', feeRate === undefined ? {} : { feeRate })
}

/** 读取已创建分析运行的持久状态；请求不会重跑回测或发起外部数据同步。 */
export function getAnalysisRun(analysisRunId: string): Promise<AnalysisRunStatus> {
  return get<AnalysisRunStatus>(`/api/v1/admin/analysis/runs/${encodeURIComponent(analysisRunId)}`)
}
