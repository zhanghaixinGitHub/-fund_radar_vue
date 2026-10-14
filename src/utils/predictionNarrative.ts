import type { PredictionDriver, PredictionEvidence, PredictionNarrative, PredictionNarrativeResponse } from '@/types/predictionEvidence'

const displayVersion = 'PREDICTION_NARRATIVE_ZH_V4'

/** 校验当前记录与返回正文，切换基金或历史版本时不得把另一条预测的说明套过来。 */
export function readNarrative(response: PredictionNarrativeResponse, fundCode: string, kind: string, recordId: string): PredictionNarrative | null {
  if (response.fundCode !== fundCode || response.kind !== kind || response.recordId !== recordId) {
    throw new Error('解释与当前预测不一致')
  }
  if (!['READY', 'PENDING', 'FALLBACK'].includes(response.state)) return null
  const value = response.narrative
  // 002112综合信息说明沿用同一正文结构，单独标识净值、持仓及消息的实际覆盖。
  // 仅接受该基金的一日已完成说明；其他基金、周期和旧版因果话术仍按原边界拒绝。
  const informationVersion = fundCode === '002112' && kind === 'daily' && response.state === 'READY'
    && ['PREDICTION_INFORMATION_ZH_V1', 'PREDICTION_INFORMATION_ZH_V2', 'PREDICTION_INFORMATION_ZH_V3', 'PREDICTION_INFORMATION_ZH_V4'].includes(value?.styleVersion ?? '')
  if (!value || (value.styleVersion !== displayVersion && !informationVersion)) return null
  // 当前002112说明已由服务端按原文核对；篇幅和条数只是组织目标，不能在前端再次整包拒绝。
  // 基金、期次、来源、安全链接和正文类型仍必须匹配；历史说明沿用原有验证边界。
  const organizedInformation = informationVersion && value.styleVersion === 'PREDICTION_INFORMATION_ZH_V4'
  if (!value.summary || !value.context
    || ![value.summary, value.context, value.supporting, value.opposing].every(item => typeof item === 'string' && (organizedInformation || item.length <= 1400))
    || value.supporting !== '' || value.opposing !== ''
    || !Array.isArray(value.limitations) || (!organizedInformation && value.limitations.length > 5)
    || !value.limitations.every(item => typeof item === 'string' && (organizedInformation || item.length <= 250))) {
    throw new Error('解释正文暂不可用')
  }
  if (['PREDICTION_INFORMATION_ZH_V2', 'PREDICTION_INFORMATION_ZH_V3'].includes(value.styleVersion)) {
    // 业务事实使用纯文本展示；链接仅接受正常HTTP(S)来源，防止原文链接变成可执行地址。
    const text = (item: unknown, limit: number) => typeof item === 'string' && item.length > 0 && item.length <= limit
    const validSource = (source: NonNullable<typeof value.drivers>[number]['source']) => {
      if (!source) return true
      if (!text(source.title, 220) || !text(source.url, 1500) || !/^\d{4}-\d{2}-\d{2}$/.test(source.publishedDate)) return false
      try {
        const url = new URL(source.url)
        return ['https:', 'http:'].includes(url.protocol) && !!url.hostname && !url.username && !url.password
      } catch { return false }
    }
    if (!Array.isArray(value.drivers) || value.drivers.length < 2 || value.drivers.length > 7
      || !value.drivers.every(item => item && ['净值', '持仓行情', '公告', '政策', '新闻'].includes(item.category)
        && text(item.title, 200) && text(item.assessment, 30) && text(item.observation, 600)
        && text(item.implication, 300) && validSource(item.source))) throw new Error('具体依据暂不可用')
  } else if (value.styleVersion === 'PREDICTION_INFORMATION_ZH_V4') {
    const text = (s: unknown) => typeof s === 'string' && s.length > 0
    const validSource = (s: NonNullable<NonNullable<typeof value.drivers>[number]['sources']>[number]) => {
      // 原文标题和公司关联保留全文；链接仍按安全地址及来源日期核对。
      if (!s || !text(s.title) || !text(s.url) || s.url.length > 1500 || !/^\d{4}-\d{2}-\d{2}$/.test(s.publishedDate)) return false
      try { const u = new URL(s.url); return ['http:', 'https:'].includes(u.protocol) && !!u.hostname && !u.username && !u.password }
      catch { return false }
    }
    const validDriver = (d: NonNullable<typeof value.drivers>[number]) => d
      // 经理变更及任期表现由后端按原预测快照保存，前端沿用相同的来源与身份校验。
      && ['净值', '持仓行情', '公司经营', '公告', '新闻', '政策', '基金经理'].includes(d.category)
      && ['支持上涨', '支持下跌', '双向影响', '背景观察'].includes(d.assessment)
      && text(d.title) && text(d.observation) && text(d.meaning) && text(d.implication)
      && typeof d.relation === 'string'
      && Array.isArray(d.sources) && d.sources.every(validSource)
    if (!Array.isArray(value.drivers) || value.drivers.length < 1 || !value.drivers.every(validDriver)
      || !Array.isArray(value.counterpoints) || !value.counterpoints.every(validDriver)
      || !Array.isArray(value.conditions) || !value.conditions.every(s => text(s))
      || !Array.isArray(value.inventory) || value.inventory.length !== 16
      || new Set(value.inventory.map(s => s.id)).size !== 16
      || !value.inventory.every(s => /^D(0[1-9]|1[0-6])$/.test(s.id) && text(s.name) && text(s.detail))) {
      throw new Error('本次具体依据未通过核对')
    }
  } else if (value.drivers !== undefined) {
    throw new Error('具体依据版本不匹配')
  }
  return value
}

/**
 * 同一份综合依据中，净值、持仓等计算事实只完整展示一次。
 * 仅省略逐行完全相同的观察，日期、数值或口径不同的内容仍保留；
 * 带原文来源的引用不拆行去重，避免去掉公告上下文、否定或条件。
 * 这里只创建展示副本，不改保存的分析，也不省略各条依据的含义与影响。
 */
export function narrativeGroups(value: PredictionNarrative) {
  const seen = new Map<string, string>()
  const display = (driver: PredictionDriver): PredictionDriver => {
    if (value.styleVersion !== 'PREDICTION_INFORMATION_ZH_V4'
      || driver.source || driver.sources?.length
      || !['净值', '持仓行情', '公司经营'].includes(driver.category)) return driver
    const references = new Set<string>()
    const lines = driver.observation.split(/\r?\n/).filter(line => {
      const fact = line.trim()
      if (!fact) return false
      const previous = seen.get(fact)
      if (previous) { references.add(previous); return false }
      seen.set(fact, driver.title)
      return true
    })
    return { ...driver, observation: lines.length ? lines.join('\n')
      : `相关数据见上文${[...references].map(title => `“${title}”`).join('、')}。` }
  }
  return [
    { title: '主要判断依据', drivers: (value.drivers ?? []).map(display) },
    ...(value.counterpoints?.length
      ? [{ title: '还需要考虑的相反因素', drivers: value.counterpoints.map(display) }] : []),
  ]
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
