/** 公告要点兼容既有摘要字段：每行一项，不在浏览器根据标题或数字猜测结论。 */
export interface NewsFact {
  eventId: string
  title: string
  sourceName: string
  publishedDate: string
  stage: string
  summary: string
  relation: string
}

/** 旧接口的通用提示不算摘要；等待正文要点时明确说明，避免把套话当作提取成功。 */
export function readingPoints(item: NewsFact): string[] {
  if (item.stage !== '已披露文件') return []
  const summary = item.summary?.trim() ?? ''
  if (!summary || /需结合原文|进一步核实|暂未提取到|尚未核对完整/.test(summary)) return []
  return [...new Set(summary.split(/\r?\n/).map(line => line.trim()).filter(Boolean))]
}

/** 压缩已披露持仓关系，但保留报告期、披露日和净资产口径；不解释为当前仓位。 */
export function holdingContext(relation: string): string {
  const match = relation.match(/截至\s*(\d{4}-\d{2}-\d{2})\s*的披露持仓，报告于\s*(\d{4}-\d{2}-\d{2})\s*公开，占基金净资产\s*([\d.]+)%/)
  if (match) return `持仓截至 ${match[1]} · 占基金净资产 ${match[3]}% · ${match[2]} 披露，不代表当前仓位`
  return relation === '基金名称或份额代码与原文一致' ? '本基金公告' : relation
}

/** 仅移除目录重复的公司前缀，保留年份、草案和修订等影响事项含义的标题文字。 */
export function newsHeading(title: string): { company: string; subject: string } {
  const separator = title.indexOf('：')
  if (separator < 1 || separator > 20) return { company: '', subject: title }
  const company = title.slice(0, separator)
  const remainder = title.slice(separator + 1)
  const subject = remainder.startsWith(`${company}关于`) ? remainder.slice(company.length) : remainder
  return { company, subject }
}
