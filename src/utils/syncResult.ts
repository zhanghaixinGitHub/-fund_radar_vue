import type { SyncJobStatus } from '../types/syncJob'

/** 只读业务摘要；旧任务没有摘要时保留原状态，不推测等待或成功数量。 */
export function syncResultLabel(job: SyncJobStatus | null | undefined): string | null {
  if (!job || !['SUCCEEDED', 'PARTIAL_SUCCESS', 'FAILED'].includes(job.status)) return null
  const summary = job.resultSummary
  if (summary?.counts) {
    if (summary.counts.ERROR > 0 || summary.followupIssues?.length) return '部分项目需重试'
    if (summary.counts.WAITING > 0) return savedPredictions(job).length ? '等待资料，已有预测保留' : '等待资料'
    if (summary.counts.UNSUPPORTED > 0) return summary.counts.COMPLETED > 0 ? '部分基金暂不支持' : '本次基金暂不支持'
  }
  if (summary?.dailyUpdated && !summary.currentIssueCount && summary.historicalGapCount) return '当前资料已更新，历史资料有缺口'
  if (job.errorCode === 'NAV_SYNC_INCOMPLETE') return '部分基金净值待补齐'
  if (job.errorCode?.startsWith('FEATURE_')) return '历史指标待重试'
  return null
}

const horizons: Record<string, string> = { T1: '一日', T5_V1: '五日', T20_V1: '二十日', M6_V1: '半年' }

/** 接口业务日期必须是有效的年月日；不将空值或兼容占位值解释为预测日期。 */
function isBusinessDate(value: string | null | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const timestamp = Date.parse(`${value}T00:00:00Z`)
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value
}

/** 只有真实保存摘要中的有效日期和正整数基金数，才能支持“已有预测”这一展示。 */
function savedPredictions(job: SyncJobStatus | null | undefined) {
  return (job?.resultSummary?.savedResults ?? []).filter((item) =>
    isBusinessDate(item.targetDate) && Number.isInteger(item.count) && item.count > 0,
  )
}

export function savedPredictionLines(job: SyncJobStatus | null | undefined): string[] {
  return savedPredictions(job).map((item) =>
    `${item.targetDate}${item.horizonId === 'T1' ? '目标日' : '起始日'} · ${horizons[item.horizonId] ?? '预测'}已保存 ${item.count} 只`,
  )
}

/**
 * 一日目标日期只读取逐项结果，不能使用 requestedNavDate：该旧字段可能是当天占位值。
 * 缺少逐项日期或存在不同日期时不归并为一个目标日；已保存日期仍由单独摘要展示。
 */
export function predictionProgressNote(job: SyncJobStatus | null | undefined): string {
  if (!job) return ''
  if (job.status === 'QUEUED' || job.status === 'RUNNING') {
    return '正在逐周期检查关注基金；缺净值的项目会等待，其他基金继续，具体进度见上方。'
  }
  const dailyItems = (job.resultSummary?.items ?? []).filter((item) => item.horizonId === 'T1')
  const targetDates = new Set(dailyItems.map((item) => item.targetDate))
  const targetDate = targetDates.size === 1 ? dailyItems[0]?.targetDate : null
  const targetNote = isBusinessDate(targetDate) ? `一日预测目标日 ${targetDate}。` : '一日预测目标日期暂不可用。'
  const savedNote = savedPredictions(job).length ? '已保存结果按下方所属日期查看。' : ''
  return `本次检查结束；${targetNote}${savedNote}`
}
