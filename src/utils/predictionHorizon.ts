/** 中文周期标签中的整数；兼容五日、十日、二十日与阿拉伯数字写法。 */
function periodNumber(value: string): number {
  if (/^\d+$/.test(value)) return Number(value)
  const digits: Record<string, number> = { 零: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 }
  const units: Record<string, number> = { 十: 10, 百: 100, 千: 1000 }
  let total = 0, digit = 0
  for (const char of value) {
    if (char in units) { total += (digit || 1) * units[char]!; digit = 0 }
    else digit = digits[char] ?? 0
  }
  return total + digit
}

/**
 * 只用于展示顺序：识别 T5_V1、M6_V1 等周期标识及以周期开头的旧版依据原文。
 * 日预测按交易日口径，月/年用 21/252 个交易日作排序尺度，半年等同六个月；
 * 此尺度不参与到期日计算、预测或效果核验。未知周期返回 null，不能从正文日期猜周期。
 */
function horizonOrder(value: string): number | null {
  const text = value.trim()
  const id = /^([TM])(\d+)_V\d+$/.exec(text)
  if (id) return Number(id[2]) * (id[1] === 'M' ? 21 : 1)
  if (/^(?:未来\s*)?半年/.test(text)) return 126
  const label = /^(?:未来\s*)?([\d零一二两三四五六七八九十百千]+)\s*(?:个)?\s*(交易日|自然日|日|天|星期|周|自然月|月|年)/.exec(text)
  if (!label) return null
  const scale: Record<string, number> = { 交易日: 1, 自然日: 5 / 7, 日: 1, 天: 1, 星期: 5, 周: 5, 自然月: 21, 月: 21, 年: 252 }
  return periodNumber(label[1]!) * scale[label[2]!]!
}

/** 按周期由短到长比较；未知周期置后，相同周期保持接口原有的版本/时间顺序。 */
export function comparePredictionHorizons(left: string, right: string): number {
  return (horizonOrder(left) ?? Number.MAX_SAFE_INTEGER) - (horizonOrder(right) ?? Number.MAX_SAFE_INTEGER)
}

/** 返回排序后的展示副本，不改写接口原始数组或历史报告。 */
export function sortPredictionHorizons<T>(items: readonly T[] | null | undefined, horizon: (item: T) => string): T[] {
  return [...(items ?? [])].sort((left, right) => comparePredictionHorizons(horizon(left), horizon(right)))
}

/**
 * 旧版建议只提供字符串依据，因此只重排可识别的预测条目所在位置；
 * 新闻、持仓约束等其他因素保留原位置与原文，不因排序改变事实或因素分类。
 */
export function sortPredictionEvidence(items: readonly string[] | null | undefined): string[] {
  const source = items ?? []
  const predictions = sortPredictionHorizons(source.filter(item => horizonOrder(item) !== null), item => item)
  let index = 0
  return source.map(item => horizonOrder(item) === null ? item : predictions[index++]!)
}
