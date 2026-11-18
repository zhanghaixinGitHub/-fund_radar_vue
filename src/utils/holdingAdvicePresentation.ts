import type { DecisionReport } from '@/types/multiPrediction'

export interface AdviceExcerpt { title: string; text: string }

/** 只摘录已保存原文，省略处明确标记；完整分析和历史报告不改写。 */
function excerpt(value: string, limit = 90): string {
  const text = value.trim()
  const first = text.match(/^.*?[。！？](?:[”’])?/u)?.[0] ?? text
  if (first.length <= limit) return first
  const prefix = first.slice(0, limit)
  const boundary = Math.max(prefix.lastIndexOf('，'), prefix.lastIndexOf('；'))
  return `${prefix.slice(0, boundary >= 35 ? boundary : limit)}…`
}

export function holdingKeyEvidence(report: DecisionReport): AdviceExcerpt[] {
  const rows: AdviceExcerpt[] = []
  if (report.timingAssessment) rows.push({ title: '综合取舍', text: excerpt(report.timingAssessment) })
  const active = (report.periodAssessments ?? []).filter(period => period.kind === 'DATED_ANALYSIS'
    && ['UP', 'DOWN', 'FLAT'].includes(period.decision) && ['T5_V1', 'T20_V1'].includes(period.horizonId))
  const short = active.find(period => period.horizonId === 'T5_V1')
  const medium = active.find(period => period.horizonId === 'T20_V1')
  if (short && medium && short.decision !== medium.decision) {
    rows.push({ title: '五日依据', text: excerpt(short.summary) }, { title: '二十日依据', text: excerpt(medium.summary) })
  } else {
    const main = medium ?? short
    if (main) {
      rows.push({ title: main.horizonId === 'T20_V1' ? '二十日依据' : '五日依据', text: excerpt(main.summary) })
      if (main.counterReason) rows.push({ title: '反对因素与取舍', text: excerpt(main.counterReason) })
    }
  }
  return rows.filter((row, index) => row.text && rows.findIndex(other => other.text === row.text) === index).slice(0, 3)
}

/** 八个分项从旧的串联说明拆开；不按分数自行推导优劣或买卖。 */
export function holdingQualityRows(value?: string): AdviceExcerpt[] {
  if (!value?.trim()) return []
  return value.split(/[；;]\s*(?=[^：:；;]{2,12}[：:])/u).map(part => {
    const match = part.trim().match(/^([^：:]{2,12})[：:]\s*([\s\S]*)$/u)
    return match ? { title: match[1]!, text: match[2]! } : { title: '基金质量', text: part.trim() }
  })
}

/** 重要订单、冻结和规则限制不截断；费用未知用对应业务短句说明。 */
export function holdingImportantLimits(report: DecisionReport): string[] {
  const limits = report.executionConstraints.filter(text => /已有待确认|已有执行中的定投|冻结|已确认减仓线|暂缓操作不代表/.test(text))
  for (const text of report.opposingEvidence) if (/本人确认|已确认个人规则|本人预计用款/.test(text)) limits.push(text)
  if (report.executionConstraints.some(text => text.startsWith('未核齐本次申赎'))) limits.push('申赎开放状态及逐笔费用尚未核齐，操作前需核对；本次不提供精确买卖数量。')
  return [...new Set(limits)]
}
