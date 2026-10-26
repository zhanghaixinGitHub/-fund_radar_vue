import type { FundNavPoint, FundShareSnapshot } from '../types/fund'

/** 份额表的一行；份额及变化量均为万份，单位净值为元，缺失值保持为空。 */
export interface FundShareHistoryRow extends Omit<FundShareSnapshot, 'fundShare'> {
  fundShare: number
  /** 上一条已有份额记录的日期，不假设记录逐季连续。 */
  previousDate: string | null
  /** 当前份额减去上一条份额；没有上一条记录时不以零作为基数。 */
  shareChange: number | null
  /** 只接受本基金份额类别在同一自然日的单位净值，不用邻近日期补齐。 */
  unitNav: number | null
}

/** 空白、非法值及负数不参与计算，避免 Number(null) 等转换把缺失份额伪装为零。 */
function readNumber(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null
  if (typeof value === 'string' && !value.trim()) return null
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : null
}

/**
 * 将同一基金代码的份额和净值按日期对齐，返回从旧到新的全部份额行。
 * 先在完整历史中计算相邻记录变化，再由界面截取最近 12 条，保证表格末行仍能找到真实上期。
 * 份额按来源四位小数转为整数后求差，避免二进制浮点尾差；不把份额差解释为资金净流入。
 * 净值必须严格同日且大于零；没有同日记录时保持缺失，不前填、不后填，也不使用累计净值。
 */
export function buildFundShareHistoryRows(
  points: readonly FundShareSnapshot[],
  navPoints: readonly FundNavPoint[],
): FundShareHistoryRow[] {
  const navByDate = new Map<string, number>()
  for (const point of navPoints) {
    const nav = readNumber(point.unitNav)
    if (nav !== null && nav > 0) navByDate.set(point.navDate, nav)
  }

  const shares = points.flatMap(point => {
    const share = readNumber(point.fundShare)
    return share === null ? [] : [{ ...point, fundShare: share }]
  }).sort((left, right) => left.tradeDate.localeCompare(right.tradeDate))

  return shares.map((point, index) => {
    const previous = shares[index - 1]
    return {
      ...point,
      previousDate: previous?.tradeDate ?? null,
      shareChange: previous
        ? (Math.round(point.fundShare * 10_000) - Math.round(previous.fundShare * 10_000)) / 10_000
        : null,
      unitNav: navByDate.get(point.tradeDate) ?? null,
    }
  })
}
