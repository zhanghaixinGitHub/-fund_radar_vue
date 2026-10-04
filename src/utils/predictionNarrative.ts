import type { PredictionEvidence, PredictionNarrative, PredictionNarrativeResponse } from '@/types/predictionEvidence'

const displayVersion = 'PREDICTION_NARRATIVE_ZH_V4'

/** 校验当前记录与返回正文，切换基金或历史版本时不得把另一条预测的说明套过来。 */
export function readNarrative(response: PredictionNarrativeResponse, fundCode: string, kind: string, recordId: string): PredictionNarrative | null {
  if (response.fundCode !== fundCode || response.kind !== kind || response.recordId !== recordId) {
    throw new Error('解释与当前预测不一致')
  }
  if (!['READY', 'PENDING', 'FALLBACK'].includes(response.state)) return null
  const value = response.narrative
  // 旧版仍保存在后台，但其中的参数因果话术不能在升级等待或失败时重新展示。
  if (!value || value.styleVersion !== displayVersion) return null
  if (!value.summary || !value.context
    || ![value.summary, value.context, value.supporting, value.opposing].every(item => typeof item === 'string' && item.length <= 1400)
    || value.supporting !== '' || value.opposing !== ''
    || !Array.isArray(value.limitations) || value.limitations.length > 5
    || !value.limitations.every(item => typeof item === 'string' && item.length <= 250)) {
    throw new Error('解释正文暂不可用')
  }
  return value
}

/** 无可靠新版说明时只保留核对过的原观察，不从旧 summary/支持项中提取市场因果。 */
export function safeEvidence(evidence: PredictionEvidence): PredictionEvidence {
  const facts = evidence.facts.filter(item => !/参考|均值|概率|得分/.test(item.label))
    .map(item => /日波动/.test(item.label)
      ? { ...item, label: '近 20 个交易日每日收益率标准差（未年化）' }
      : item)
  // 原方向在上层预测结果中继续显示；这里不猜测未核对正文中的方向。
  return {
    summary: facts.length ? '这条预测的解释依据暂不充分，以下仅列出可核对的原始观察。'
      : '这条预测暂时缺少可核对的解释资料，无法说明具体原因。',
    facts,
    supporting: [], opposing: [],
    limitations: [
      '历史涨跌、波动和回撤不能单独说明之后为何会朝预测方向变化。',
      ...evidence.limitations.filter(item => /相等算持平|合并|未分别预测|不完整|不一致|分歧/.test(item)),
      ...(facts.some(item => /标准差/.test(item.label))
        ? ['日波动并非平均每天涨跌幅；缺少当时本基金历史分布，暂不判断高低。'] : []),
    ],
  }
}
