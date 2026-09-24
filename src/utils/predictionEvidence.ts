import type { MultiPrediction } from '@/types/multiPrediction'
import type { Direction1dEvidence, Direction1dForecast } from '@/types/direction1d'
import type { PredictionEvidence } from '@/types/predictionEvidence'

const names: Record<string, string> = {
  return_5d: '近 5 个交易日涨跌', return_20d: '近 20 个交易日涨跌', return_60d: '近 60 个交易日涨跌',
  volatility_20d: '近 20 个交易日的日波动', max_drawdown_60d: '近 60 个交易日最大回撤',
  relative_position_60d: '净值在近 60 个交易日高低点之间的位置', consecutive_decline_days: '连续下跌天数',
}
const labels: Record<string, string> = { UP: '上涨', FLAT: '基本持平', DOWN: '下跌', NON_UP: '下跌或持平' }
// 一日持平是原始单位净值相等；较长周期的“基本持平”另有回报范围，不能混用。
const dailyLabels: Record<string, string> = { ...labels, FLAT: '持平' }
const numeric = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const percent = (value: number) => `${value > 0 ? '+' : ''}${(value * 100).toFixed(2)}%`
function featureText(key: string, value: number): string {
  return key === 'consecutive_decline_days' ? `${value} 天`
    : key === 'relative_position_60d' ? `${(value * 100).toFixed(1)}%（0% 为最低点，100% 为最高点）`
      : key === 'volatility_20d' ? `${(value * 100).toFixed(2)}%` : percent(value)
}
function unavailable(message: string): PredictionEvidence {
  return { summary: message, facts: [], supporting: [], opposing: [], limitations: ['当前无法提供可靠的具体原因。'] }
}

/**
 * 使用预测原文中的输入与参数还原决策。基础方法核对实际回看涨跌和阈值；
 * 三分类线性模型核对原始得分、最高类别及指标对“胜出类别相对第二类别”的影响。
 * 缺少数据、版本不支持、结果不一致时停止归因，不把历史涨跌直接当作未来涨跌原因。
 */
export function multiPredictionEvidence(prediction?: MultiPrediction): PredictionEvidence {
  if (!prediction) return unavailable('这个时间段还没有预测，因此暂时没有对应依据。')
  const snapshot = prediction.featureSnapshot
  if (!snapshot || snapshot.fundCode !== prediction.fundCode || snapshot.dataAsOf !== prediction.dataAsOf) {
    return unavailable('这条预测没有可核对的原始输入，暂时无法还原系统为什么作出这个判断。')
  }
  const input = snapshot.features
  const manifest = prediction.modelManifest
  const parameters = manifest.parameters ?? {}
  const evidence: PredictionEvidence = {
    summary: '', facts: [], supporting: [], opposing: [],
    limitations: ['这些依据解释系统当时的判断，不保证未来一定按这个方向变化。'],
  }
  if (manifest.adapter === 'NAV_MOMENTUM_THREE_STATE_V2' || manifest.adapter === 'NAV_MOMENTUM_V1') {
    const momentum = input.momentum
    const lookback = input.actualLookbackReturns
    const rawThreshold = parameters.momentumThreshold
    const threshold = manifest.adapter === 'NAV_MOMENTUM_V1' ? 0
      : typeof rawThreshold === 'string' && rawThreshold.trim() ? Number(rawThreshold) : rawThreshold
    if (!numeric(momentum) || !numeric(lookback) || !Number.isInteger(lookback) || lookback < 1
      || !numeric(threshold) || threshold < 0 || (manifest.adapter !== 'NAV_MOMENTUM_V1' && threshold === 0)) {
      return unavailable('本条记录缺少完整的历史涨跌或判断门槛，暂时无法还原预测依据。')
    }
    const expected = manifest.adapter === 'NAV_MOMENTUM_V1' ? (momentum > 0 ? 'UP' : 'NON_UP')
      : momentum > threshold ? 'UP' : momentum < -threshold ? 'DOWN' : 'FLAT'
    if (expected !== prediction.direction) return unavailable('保存的依据与预测结论不一致，已停止展示原因，请重新核查原始记录。')
    const movement = `近 ${lookback} 个交易日累计${momentum > 0 ? '上涨' : momentum < 0 ? '下跌' : '涨跌'} ${Math.abs(momentum * 100).toFixed(2)}%`
    const tendency = prediction.direction === 'UP' ? '系统据此判断上涨趋势可能延续'
      : prediction.direction === 'DOWN' ? '系统据此判断下跌趋势可能延续'
        : prediction.direction === 'FLAT' ? '系统认为这段涨跌不足以形成明显方向' : '系统据此倾向于非上涨'
    evidence.summary = `${movement}，${tendency}，给出“预计${labels[prediction.direction]}”。`
    evidence.facts = [{ label: `本次参考的历史区间（${lookback} 个交易日）`, value: percent(momentum) }]
    evidence.limitations.unshift('本次只参考这段历史涨跌，尚未综合市场、新闻和持仓变化。')
    return evidence
  }
  if (manifest.adapter === 'LOGISTIC_MULTICLASS_V2') {
    const keys = manifest.features ?? []
    const { mean, scale, coefficients, intercepts, classes } = parameters
    if (keys.length !== 7 || keys.some(key => !names[key] || !numeric(input[key]))
      || !Array.isArray(classes) || classes.join(',') !== 'DOWN,FLAT,UP'
      || !Array.isArray(mean) || !Array.isArray(scale) || !Array.isArray(coefficients) || !Array.isArray(intercepts)
      || mean.length !== keys.length || scale.length !== keys.length || coefficients.length !== 3 || intercepts.length !== 3
      || !mean.every(numeric) || !scale.every(v => numeric(v) && v > 0) || !intercepts.every(numeric)
      || !coefficients.every(row => Array.isArray(row) && row.length === keys.length && row.every(numeric))) {
      return unavailable('本条预测的依据不完整，暂时无法解释各项数据对结论的影响。')
    }
    const logits = coefficients.map((row: number[], i) => intercepts[i] + keys.reduce((sum, key, j) =>
      sum + ((input[key] as number) - mean[j]) / scale[j] * row[j]!, 0))
    const order = manifest.directionPolicySnapshot?.tieBreakOrder
    if (!order || [...order].sort().join(',') !== 'DOWN,FLAT,UP' || !logits.every(numeric)) return unavailable('原始判断规则不完整，暂时无法核对预测依据。')
    const ranked = classes.map((label: string, i: number) => ({ label, i, logit: logits[i]! }))
      .sort((a, b) => b.logit - a.logit || order.indexOf(a.label) - order.indexOf(b.label))
    const winner = ranked[0]!, runner = ranked[1]!
    if (winner.label !== prediction.direction) return unavailable('保存的依据与预测结论不一致，暂时无法提供可靠的原因。')
    const impacts = keys.map((key, j) => ({ key, value: input[key] as number,
      impact: ((input[key] as number) - mean[j]) / scale[j] * (coefficients[winner.i][j] - coefficients[runner.i][j]),
    })).sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    evidence.summary = `系统综合历史涨跌、波动和回撤等 ${keys.length} 项数据后，对“${labels[winner.label]}”的判断强于“${labels[runner.label]}”，因此给出当前结果。`
    evidence.facts = impacts.map(item => ({ label: names[item.key]!, value: featureText(item.key, item.value) }))
    const sentence = (item: typeof impacts[number]) => `${names[item.key]}为 ${featureText(item.key, item.value)}，在本次计算中${item.impact > 0 ? '支持' : '削弱'}“${labels[winner.label]}”相对于“${labels[runner.label]}”的判断。`
    evidence.supporting = impacts.filter(item => item.impact > 0).slice(0, 3).map(sentence)
    evidence.opposing = impacts.filter(item => item.impact < 0).slice(0, 3).map(sentence)
    evidence.limitations.unshift('以下列出影响较大的因素，单个指标不能解释全部判断，也不代表真实市场涨跌的原因。')
    return evidence
  }
  return unavailable('这条记录使用的方法尚未提供可核对的解释数据，暂时无法说明具体由哪些因素得出结论。')
}

/** 按原预测和原登记模型还原指标作用；解释不可用时只列原输入，不把分数当作上涨概率。 */
export function dailyPredictionEvidence(forecast?: Direction1dForecast | null, restored?: Direction1dEvidence | null): PredictionEvidence {
  if (!forecast) return unavailable('一天预测尚未生成，暂时没有对应依据。')
  const usable = forecast.branches.filter(branch => branch.status === 'AVAILABLE' && numeric(branch.score))
  const ternary = forecast.schemaVersion === 'DIRECTION_1D_EXPERIMENT_V2'
  if (!usable.length) return unavailable('这条记录没有可用的判断结果。')
  const directions = new Set(usable.map(branch => branch.predictedDirection))
  const result = directions.size > 1 ? '保存的判断不一致，因此没有给出统一方向。'
    : `保存的结果倾向“${dailyLabels[usable[0]!.predictedDirection!] ?? '未知'}”。`
  const evidence: PredictionEvidence = {
    summary: `系统参考当时最近 60 个交易日的涨跌、波动和回撤等数据。${result}`,
    facts: [],
    supporting: [],
    opposing: [],
    limitations: ['各项数据对本次判断的具体影响暂不可用，所列历史涨跌不能单独解释预测原因。',
      ternary ? '下一交易日单位净值高于前一天算上涨，相等算持平，低于前一天算下跌。'
        : '旧一日结果仍把下跌与持平合并；已有记录不能重新拆分成当时并未计算的结果。'],
  }
  const values = forecast.input?.values
  if (values?.length === 61 && values[60]?.navDate === forecast.baseNavDate
    && values.every((row, i) => Number.isFinite(Number(row.unitNav)) && Number(row.unitNav) > 0
      && /^\d{4}-\d{2}-\d{2}$/.test(row.navDate) && (i === 0 || row.navDate > values[i - 1]!.navDate))) {
    evidence.facts = [5, 20, 60].map(days => ({ label: `当时近 ${days} 个交易日的净值涨跌`,
      value: percent(Number(values[60]!.unitNav) / Number(values[60 - days]!.unitNav) - 1),
    }))
  } else evidence.limitations.unshift('当时的净值明细不完整，无法展示可核对的历史涨跌。')
  if (restored) {
    const valid = restored.fundCode === forecast.fundCode && restored.inputHash === forecast.inputHash
      && restored.baseNavDate === forecast.baseNavDate && restored.targetNavDate === forecast.targetNavDate
      && restored.branches.length === usable.length && new Set(restored.branches.map(b => b.branchId)).size === usable.length
      && restored.branches.every(b => usable.some(original => original.branchId === b.branchId
        && original.modelId === b.modelId && original.modelHash === b.modelHash && original.predictedDirection === b.direction)
        && numeric(b.intercept) && b.factors.length === 7 && new Set(b.factors.map(f => f.feature)).size === 7
        && (!ternary || (b.referenceDirection && ['UP', 'FLAT', 'DOWN'].includes(b.referenceDirection) && b.referenceDirection !== b.direction))
        && b.factors.every(f => names[f.feature] && numeric(f.value) && numeric(f.contribution)))
    if (!valid) return unavailable('取得的指标解释与这条预测不一致，已停止展示原因。')
    // 固定/每周分支可能引用同一登记包，不能当作两份独立依据重复展示。
    const unique = [...new Map(restored.branches.map(b => [b.modelHash, b])).values()]
    evidence.summary = directions.size > 1 ? '保存的不同分析存在分歧，因此系统没有给出统一方向。'
      : `系统综合考虑历史涨跌、波动和回撤等数据后，最终倾向“${dailyLabels[usable[0]!.predictedDirection!]}”。`
    evidence.supporting = []
    evidence.opposing = []
    evidence.limitations = ['以下列出影响较大的因素，不能将单个因素视为真实市场涨跌的原因。',
      ternary ? '下一交易日单位净值高于前一天算上涨，相等算持平，低于前一天算下跌。'
        : '这份一日原预测仅区分上涨和非上涨，未分别预测下跌与持平。']
    for (const [index, branch] of unique.entries()) {
      const prefix = unique.length > 1 ? `第 ${index + 1} 份分析：` : ''
      const toward = ternary || branch.direction === 'UP' ? 1 : -1
      const sorted = [...branch.factors].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
      const comparison = ternary && branch.referenceDirection ? `相对于“${dailyLabels[branch.referenceDirection]}”` : ''
      const sentence = (factor: typeof sorted[number]) => `${prefix}${names[factor.feature]}为 ${featureText(factor.feature, factor.value)}，在本次计算中${factor.contribution * toward > 0 ? '支持' : '削弱'}“${dailyLabels[branch.direction]}”${comparison}的判断。`
      evidence.supporting.push(...sorted.filter(f => f.contribution * toward > 0).slice(0, 3).map(sentence))
      evidence.opposing.push(...sorted.filter(f => f.contribution * toward < 0).slice(0, 3).map(sentence))
    }
  }
  if (usable.length < 2) evidence.limitations.unshift('其中一次分析暂不可用，本次只保留另一次判断。')
  return evidence
}
