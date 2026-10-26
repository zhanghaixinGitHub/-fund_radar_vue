import type { FundManager, FundManagerPerformance, FundManagerPeriodReturn } from '../types/fund'

/** 管理团队不变的一个自然日区间；结束日为空表示截至今天，姓名为空表示该段资料缺失。 */
export interface FundManagerPeriod {
  beginDate: string
  endDate: string | null
  managerNames: string[]
}

/** 经理资料卡只使用现有任职记录；本基金累计天数不能当作基金经理全部从业年限。 */
export interface FundManagerCardProfile {
  managerName: string
  educationLabel: string
  tenureRanges: Array<{ beginDate: string; endDate: string | null }>
  tenureDays: number | null
  incompleteTenure: boolean
  /** 多段任期各自展示回报，不把离任空档拼成连续收益；旧接口不提供时保持缺失。 */
  tenureReturns?: Array<{ beginDate: string | null; endDate: string | null; performance: FundManagerPerformance }>
}

/** 无法放入历史分期的原始记录，保留原因，不用公告日期猜测任职日期。 */
interface UnplacedManagerRecord {
  manager: FundManager
  reason: string
  dateRange: string
}

const DAY_MS = 86_400_000

/** 严格读取接口的自然日，拒绝不存在的日期，防止 Date 自动滚动到下个月。 */
function parseDay(value: string | null): number | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const timestamp = Date.parse(`${value}T00:00:00Z`)
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value
    ? timestamp / DAY_MS
    : null
}

/** 界面以中国时区的今天为截止，避免临近午夜时把尚未发生的变更提前展示。 */
function todayInChina(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

/**
 * 按姓名整理资料卡，完整任期独立于页面左侧的团队时期，同一经理跨行时仍展示其完整任期。
 * 重复、重叠和相邻任期先合并，再累计截至指定日期的自然日，任职首尾日均计入，不重复计天。
 * 缺日期或倒置日期不参与累计，并保留不完整标记；未来任职不提前计入，学历冲突不擅自择一。
 */
export function buildFundManagerProfiles(managers: readonly FundManager[], asOfDate = todayInChina()) {
  const today = parseDay(asOfDate)
  if (today === null) throw new RangeError('基金经理资料截止日期无效')
  const groups = new Map<string, FundManager[]>()
  for (const manager of managers) {
    const name = manager.managerName.trim()
    if (!name) continue
    const records = groups.get(name) ?? []
    records.push(manager)
    groups.set(name, records)
  }

  const profiles = new Map<string, FundManagerCardProfile>()
  const formatDay = (day: number) => new Date(day * DAY_MS).toISOString().slice(0, 10)
  for (const [managerName, records] of groups) {
    const educations = [...new Set(records.map(record => record.education?.trim()).filter(Boolean))]
    const intervals: Array<{ begin: number; end: number }> = []
    let incompleteTenure = false
    for (const record of records) {
      const begin = parseDay(record.beginDate)
      const end = parseDay(record.endDate)
      if (begin === null || (record.endDate && (end === null || end < begin))) {
        incompleteTenure = true
        continue
      }
      if (begin > today) continue
      intervals.push({ begin, end: end === null ? Number.POSITIVE_INFINITY : end })
    }

    intervals.sort((left, right) => left.begin - right.begin)
    const merged: typeof intervals = []
    for (const interval of intervals) {
      const previous = merged.at(-1)
      if (previous && interval.begin <= previous.end + 1) {
        previous.end = Math.max(previous.end, interval.end)
      } else {
        merged.push({ ...interval })
      }
    }
    profiles.set(managerName, {
      managerName,
      educationLabel: educations.length > 1 ? '学历待核实' : (educations[0] || '学历暂缺'),
      tenureRanges: merged.map(interval => ({
        beginDate: formatDay(interval.begin),
        endDate: interval.end > today ? null : formatDay(interval.end),
      })),
      tenureDays: merged.length
        ? merged.reduce((total, interval) => total + Math.min(interval.end, today) - interval.begin + 1, 0)
        : null,
      incompleteTenure,
      // 同一来源同一任期只展示一次；不同任期的回报不能相加，也不能移用到其他任期。
      ...(records.some(record => record.tenurePerformance) ? {
        tenureReturns: [...new Map(records.filter(record => record.tenurePerformance).map(record => [
          `${record.dataSource}:${record.beginDate}:${record.endDate}`,
          { beginDate: record.beginDate, endDate: record.endDate, performance: record.tenurePerformance! },
        ])).values()],
      } : {}),
    })
  }
  return profiles
}

/** 仅格式化后端已完成的任期回报；0%有效，未知、非法日期或非有限数值不伪装成回报。 */
export function formatManagerTenureReturn(performance?: FundManagerPerformance | null): string {
  const start = parseDay(performance?.startDate ?? null)
  const end = parseDay(performance?.endDate ?? null)
  const raw = performance?.returnRate
  const rate = raw === null || raw === undefined || String(raw).trim() === '' ? NaN : Number(raw)
  if (performance?.status !== 'AVAILABLE' || start === null || end === null || end <= start
    || !Number.isFinite(rate) || rate <= -1) return '暂无法计算'
  return `${rate > 0 ? '+' : ''}${(rate * 100).toFixed(2)}%`
}

/** 阶段回报必须同时匹配日期和团队；无法匹配时保持未知，绝不拿完整任期回报兜底。 */
export function matchManagerPeriodReturn(
  period: FundManagerPeriod, returns: readonly FundManagerPeriodReturn[] = [],
): FundManagerPerformance | null {
  const matches = returns.filter(item => item.beginDate === period.beginDate && item.endDate === period.endDate
    && item.managerNames.length === period.managerNames.length
    && new Set(item.managerNames).size === period.managerNames.length
    && period.managerNames.every(name => item.managerNames.includes(name)))
  return matches.length === 1 ? matches[0]!.performance : null
}

/**
 * 将个人任期转换为团队分期，按最近时期优先返回，不修改接口记录。
 *
 * 任职起止日均计入任期：加入日切换团队，离任次日移除该经理；同日发生的变更合并处理。
 * 按姓名累计在任记录数，重复或重叠记录不会重复展示同一人，也不会提前将其移除。
 * 日期缺失、非法或倒置的记录单独保留；未来任职单独说明，空档不延用前任经理。
 * asOfDate 仅用于固定验收日期，默认使用中国时区今天；无效截止日期直接报错。
 */
export function buildFundManagerTimeline(managers: readonly FundManager[], asOfDate = todayInChina()) {
  const today = parseDay(asOfDate)
  if (today === null) throw new RangeError('基金经理分期截止日期无效')

  const events = new Map<number, Map<string, number>>()
  const unplacedRecords: UnplacedManagerRecord[] = []

  function addEvent(day: number, name: string, delta: number) {
    if (day > today) return
    const changes = events.get(day) ?? new Map<string, number>()
    changes.set(name, (changes.get(name) ?? 0) + delta)
    events.set(day, changes)
  }

  for (const manager of managers) {
    const name = manager.managerName.trim()
    const begin = parseDay(manager.beginDate)
    const end = parseDay(manager.endDate)
    const dateRange = `${begin === null ? '起始日期暂缺' : manager.beginDate} 至 ${
      manager.endDate ? (end === null ? '结束日期暂缺' : manager.endDate) : '今'
    }`
    if (!name || begin === null || (manager.endDate && (end === null || end < begin))) {
      unplacedRecords.push({ manager, reason: '任职日期或姓名待补全，暂无法分期', dateRange })
      continue
    }
    if (begin > today) {
      unplacedRecords.push({ manager, reason: '尚未到任职日期', dateRange })
      continue
    }
    addEvent(begin, name, 1)
    if (end !== null) addEvent(end + 1, name, -1)
  }

  const boundaries = [...events.keys()].sort((left, right) => left - right)
  const activeNames = new Map<string, number>()
  const periods: FundManagerPeriod[] = []
  const formatDay = (day: number) => new Date(day * DAY_MS).toISOString().slice(0, 10)

  for (let index = 0; index < boundaries.length; index++) {
    const day = boundaries[index]!
    for (const [name, delta] of events.get(day)!) {
      const count = (activeNames.get(name) ?? 0) + delta
      if (count > 0) activeNames.set(name, count)
      else activeNames.delete(name)
    }
    const managerNames = [...activeNames.keys()].sort((left, right) => left.localeCompare(right, 'zh-CN'))
    const nextDay = boundaries[index + 1]
    const endDate = nextDay === undefined ? null : formatDay(nextDay - 1)
    const previous = periods.at(-1)
    // 只有实际管理团队变化才新增一行，同名续任或重复记录不制造额外时期。
    if (previous && previous.managerNames.length === managerNames.length
      && previous.managerNames.every((name, position) => name === managerNames[position])) {
      previous.endDate = endDate
    } else {
      periods.push({ beginDate: formatDay(day), endDate, managerNames })
    }
  }

  return { periods: periods.reverse(), unplacedRecords }
}
