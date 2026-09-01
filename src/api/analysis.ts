import { get, post, put } from '@/api/http'
import type {
  AnalysisRunStatus,
  BenchmarkNavPointInput,
  BenchmarkRegistrationInput,
  BenchmarkSeriesStatus,
} from '@/types/analysis'

/** 创建管理员受控滚动回测任务；该调用只排队，不同步等待、不自动发布模型。 */
export function startRollingBacktest(feeRate?: number, benchmarkCode?: string): Promise<AnalysisRunStatus> {
  return post<AnalysisRunStatus>('/api/v1/admin/analysis/runs/rolling-backtest', {
    ...(feeRate === undefined ? {} : { feeRate }),
    ...(benchmarkCode ? { benchmarkCode } : {}),
  })
}

/** 读取已创建分析运行的持久状态；请求不会重跑回测或发起外部数据同步。 */
export function getAnalysisRun(analysisRunId: string): Promise<AnalysisRunStatus> {
  return get<AnalysisRunStatus>(`/api/v1/admin/analysis/runs/${encodeURIComponent(analysisRunId)}`)
}

/** 读取已登记基准的状态和覆盖范围；不下载每日原始点。 */
export function getAnalysisBenchmarks(): Promise<BenchmarkSeriesStatus[]> {
  return get<BenchmarkSeriesStatus[]>('/api/v1/admin/analysis/benchmarks')
}

/** 登记 DRAFT 基准，不会自动启用来源、基准或模型。 */
export function registerAnalysisBenchmark(
  benchmarkCode: string,
  payload: BenchmarkRegistrationInput,
): Promise<BenchmarkSeriesStatus> {
  return put<BenchmarkSeriesStatus>(`/api/v1/admin/analysis/benchmarks/${encodeURIComponent(benchmarkCode)}`, payload)
}

/** 批量导入人工核验的基准日序列；ACTIVE 基准须先暂停。 */
export function importAnalysisBenchmarkPoints(
  benchmarkCode: string,
  points: BenchmarkNavPointInput[],
): Promise<BenchmarkSeriesStatus> {
  return put<BenchmarkSeriesStatus>(
    `/api/v1/admin/analysis/benchmarks/${encodeURIComponent(benchmarkCode)}/points`,
    { points },
  )
}

/** 显式启用通过来源与历史覆盖校验的基准。 */
export function activateAnalysisBenchmark(benchmarkCode: string): Promise<BenchmarkSeriesStatus> {
  return post<BenchmarkSeriesStatus>(`/api/v1/admin/analysis/benchmarks/${encodeURIComponent(benchmarkCode)}/activate`)
}

/** 显式暂停基准，阻止新的回测使用该序列。 */
export function suspendAnalysisBenchmark(benchmarkCode: string): Promise<BenchmarkSeriesStatus> {
  return post<BenchmarkSeriesStatus>(`/api/v1/admin/analysis/benchmarks/${encodeURIComponent(benchmarkCode)}/suspend`)
}
