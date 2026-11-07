import type { PredictionDriver, PredictionNarrative } from '@/types/predictionEvidence'

interface QuoteRow {
  name: string
  date: string | null
  change: number | null
  reportDate: string | null
  weight: number | null
}

export interface DriverExplanation {
  title: string
  assessment: string
  observations: string[]
  markets: string[]
  holdings: QuoteRow[]
  relationship: string
  meaning: string
  implication: string
  notices: string[]
  documents: NonNullable<PredictionDriver['sources']>
}

const object = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null
const number = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const date = (value: unknown): string | null => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null
const marketNames: Record<string, string> = { '000300.SH': '沪深300', '000905.SH': '中证500' }

/** 行情字段本身已是百分数；不可再乘100，也不能把缺失涨跌或仓位显示成零。 */
export function explanationPercent(value: number | null): string {
  return value === null ? '暂缺' : `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
}

/**
 * 从保存的观察中分离完整JSON块与普通文字，兼容单行及缩进格式。
 * 引号内的大括号不参与配对；只读展示副本，不修改预测原文、事实或历史记录。
 */
function splitObservation(text: string): { blocks: Record<string, unknown>[]; prose: string; unsupported: boolean } {
  const blocks: Record<string, unknown>[] = []
  const prose: string[] = []
  let start = 0
  let unsupported = false
  for (let index = 0; index < text.length; index++) {
    if (text[index] !== '{' && text[index] !== '[') continue
    prose.push(text.slice(start, index))
    const begin = index
    let depth = 0
    let quoted = false
    let escaped = false
    for (; index < text.length; index++) {
      const char = text[index]
      if (quoted) {
        if (escaped) escaped = false
        else if (char === '\\') escaped = true
        else if (char === '"') quoted = false
      } else if (char === '"') quoted = true
      else if (char === '{' || char === '[') depth++
      else if (char === '}' || char === ']') {
        if (--depth === 0) break
      }
    }
    try {
      const block = object(JSON.parse(text.slice(begin, index + 1)))
      if (block) blocks.push(block)
      else unsupported = true
    } catch { unsupported = true }
    start = index + 1
  }
  prose.push(text.slice(start))
  return { blocks, prose: prose.join('\n').trim(), unsupported }
}

/** 公告有多种版式，不能只按“公告编号”识别；公司待确认标记也不是已经成立的业务事实。 */
const documentExcerpt = (text: string) => /报告全文|公告编号|证券代码|董事会全体成员|主要会计数据|(?:公告|报告)送出日期|公告基本信息|基金管理人名称|其他需要说明的事项|特此公告|关联公司待确认|公告原文|报告期内基金的投资策略和运作分析|管理人对宏观经济.*简要展望|第\d+页共\d+页|[□☑\uF052\uF0FE]/.test(text.replace(/\s+/g, ''))
const technicalText = (text: string) => /"[A-Za-z_][\w]*"\s*:|\b(?:source_refs?|financial_source_refs|input_hash|unknown_current_rebalancing)\b|\b(?:null|undefined)\b/.test(text)

/** 仅替换含义明确的表达；不新增事实、方向或买卖结论，也不截断否定和条件。 */
export function readablePredictionText(text: string | undefined): string {
  if (!text || technicalText(text) || documentExcerpt(text)) return ''
  return text.trim()
    .replaceAll('未来五个估值日侧重新财务信息的消化，天孚较新季报利润和现金增长，配合通信企业经营扩张，低把握偏强。',
      '本次参考的天孚通信季报显示，利润和经营现金流都有增长。结合通信企业的业务增长，判断未来5个净值日倾向上涨，但把握较低。')
    .replaceAll('未来二十个估值日看通信需求向利润和回款持续兑现，天孚与新易盛已有增长和正现金，提供条件性支撑。',
      '未来20个净值日，主要观察通信需求能否带来持续的利润和回款。天孚通信、新易盛已披露的增长和正经营现金流，是当时看涨的依据之一。')
    .replaceAll('中际现金同比下降，部分新增器件业务仍有回款压力，若资金转向或经营不及预期，短期可转弱。',
      '中际旭创的经营现金流比上年同期下降，部分器件业务的回款仍有压力。如果资金流向其他方向，或公司经营表现低于预期，短期走势可能转弱。')
    .replaceAll('经理独立管理阶段样本较短且回撤较大，缺少可比基准归因；公司现金分化与集中估值风险可能推翻偏强情景。',
      '经理独立管理的时间较短，期间回撤较大，目前还无法确认相对比较基准的表现。不同公司的回款有差异，持仓集中和股价过高的风险，也可能使原来的看涨判断失效。')
    .replaceAll('持仓属于各自原报告期，当前调仓未知，历史经营增长可能已经计价。', '持仓来自已披露报告，当前是否调仓尚不清楚。过去的业绩增长可能已反映在股价中。')
    .replaceAll('下一估值日关注通信配置的风险偏好传导', '本次判断主要参考通信行业持仓的表现')
    .replaceAll('已有经营扩张提供背景', '同时参考已披露的业务增长情况')
    .replaceAll('光通信集中暴露放大反转风险', '披露持仓集中在光通信行业，板块下跌可能对基金造成较大影响')
    .replaceAll('强势价格不等于估值安全', '股价上涨不代表当前价格便宜或风险已经降低')
    .replaceAll('若反向机制成为主导，应基于新的真实输入重新判断。', '如果上述相反因素的影响加重，需要重新评估原来的方向判断。')
    .replaceAll('本周期独立权衡价格传导、经营兑现及反向情景，保留低把握。', '本次同时考虑了股价表现、实际经营情况和相反因素，判断把握仍较低。')
    .replaceAll('后续正式财务、订单或经营现金改变现有机制时重新复核。', '如果后续财报、订单或经营现金流出现明显变化，需要重新判断。')
    .replaceAll('基金真实投向或市场风险传导明显变化时，使用新资料版本重新判断。', '如果基金持仓或相关市场风险明显变化，需要根据新资料重新判断。')
    .replaceAll('当前估值余量和未来需求不确定，保存判断不代表准确率已验证。', '目前还无法确认价格是否合理、未来需求能否持续；预测效果尚未验证。')
    .replaceAll('通信配置的风险偏好传导', '市场情绪对通信行业持仓的影响')
    .replaceAll('风险偏好传导', '市场情绪对持仓的影响')
    .replaceAll('通信配置', '通信行业持仓')
    .replaceAll('光通信集中暴露', '持仓集中在光通信行业')
    .replaceAll('经营扩张', '业务增长')
    .replaceAll('条件性偏强', '在这些条件下倾向上涨')
    .replaceAll('低把握偏强', '倾向上涨，但把握较低')
    .replaceAll('低把握偏弱', '倾向下跌，但把握较低')
    .replaceAll('下一估值日', '下一个净值日')
    .replaceAll('未来五个估值日', '未来5个净值日')
    .replaceAll('未来二十个估值日', '未来20个净值日')
    .replaceAll('当前调仓未知', '当前是否已调整持仓仍不清楚')
    .replaceAll('历史经营增长可能已经计价', '过去的业绩增长可能已经反映在股价中')
    .replaceAll('中际现金弱于利润', '中际旭创的回款表现弱于利润表现')
    .replaceAll('华工经营现金为负', '华工科技经营活动的现金流出多于流入')
    .replaceAll('本聊天阅读原文主要选段，其余章节保留真实未读范围，未称全文审计。', '本次仅核对了部分报告内容，信息可能不完整。')
}

/** 只有真实报告链接才提供查阅入口；行情接口、内部引用及访问凭据不出现在普通页面。 */
function reportSources(driver: PredictionDriver): DriverExplanation['documents'] {
  const seen = new Set<string>()
  return [...(driver.sources ?? []), ...(driver.source ? [driver.source] : [])].filter(source => {
    try {
      const url = new URL(source.url)
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password
        || !/\.pdf$/i.test(url.pathname) || url.search || url.hash || seen.has(source.url)) return false
      seen.add(source.url)
      return true
    } catch { return false }
  })
}

/**
 * 只把已约定的行情结构转换为业务事实；未知结构和财报排版文本不会作为解释直接透出。
 * 每行保留独立行情日期和披露日期，多个报告不拼成当前组合，不用财报摘录猜金额、单位或同比。
 */
export function explainPredictionDriver(driver: PredictionDriver, fundCode: string): DriverExplanation {
  const result: DriverExplanation = {
    title: driver.title, assessment: driver.assessment, observations: [], markets: [], holdings: [],
    relationship: readablePredictionText(driver.relation), meaning: readablePredictionText(driver.meaning),
    implication: readablePredictionText(driver.implication), notices: [], documents: reportSources(driver),
  }
  const { blocks, prose, unsupported } = splitObservation(driver.observation)
  let unavailable = unsupported
  let historicalHoldings = false
  for (const block of blocks) {
    const identity = block.fund ?? block.fund_code
    if (identity !== undefined && identity !== fundCode) { unavailable = true; continue }
    let recognized = false
    const markets = object(block.market)
    if (markets) {
      for (const [code, raw] of Object.entries(markets)) {
        const quote = object(raw)
        if (!marketNames[code] || !quote || !number(quote.change_pct) || !date(quote.date)) { unavailable = true; continue }
        result.markets.push(`${quote.date}，${marketNames[code]}${quote.change_pct > 0 ? '上涨' : quote.change_pct < 0 ? '下跌' : '持平'}${quote.change_pct === 0 ? '' : ` ${Math.abs(quote.change_pct).toFixed(2)}%`}。`)
      }
      recognized = true
    }
    const holdings = block.partial_holdings ?? block.latest_partial_top3
    if (Array.isArray(holdings)) {
      for (const raw of holdings) {
        const holding = object(raw)
        if (!holding || typeof holding.name !== 'string' || !holding.name.trim() || technicalText(holding.name)) { unavailable = true; continue }
        const quote = object(holding.base_quote)
        result.holdings.push({ name: holding.name.trim(), date: date(quote?.date),
          change: number(quote?.change_pct) ? quote.change_pct : null,
          reportDate: date(holding.partial_report_end),
          weight: number(holding.partial_weight_pct) && holding.partial_weight_pct >= 0 && holding.partial_weight_pct <= 100 ? holding.partial_weight_pct : null })
      }
      recognized = true
      historicalHoldings = true
    }
    if (!recognized) unavailable = true
  }
  // 去重只覆盖完全相同的展示行；不丢弃同一股票在不同日期或不同报告中的事实。
  result.holdings = result.holdings.filter((row, index, rows) => rows.findIndex(other => JSON.stringify(other) === JSON.stringify(row)) === index)
  result.markets = [...new Set(result.markets)]
  if (result.holdings.length) {
    if (driver.title === '本周期主要依据') result.title = '重仓股的涨跌'
    const reportDates = new Set(result.holdings.map(row => row.reportDate))
    const names = new Set(result.holdings.map(row => row.name))
    if (reportDates.size === 1 && !reportDates.has(null) && names.size === result.holdings.length
      && result.holdings.every(row => row.weight !== null)) {
      const weight = result.holdings.reduce((sum, row) => sum + row.weight!, 0)
      if (weight <= 100) result.relationship ||= `表中 ${result.holdings.length} 只股票在 ${result.holdings[0]!.reportDate} 的披露持仓中合计占 ${weight.toFixed(2)}%。它们的涨跌可能影响基金净值。`
    }
  }
  if (historicalHoldings) result.notices.push('持仓占比来自当时披露的报告，不代表当前仓位；这里仅列出本条依据引用的股票。')
  if (prose) {
    if (documentExcerpt(prose) || technicalText(prose)) {
      result.notices.push(/主要会计|营业收入|净利润/.test(prose)
        ? '财务数据的解释尚不完整，对公司经营的判断存在局限。'
        : '部分资料对本基金的影响尚不明确。')
    } else result.observations = prose.split(/\n\s*\n/).map(readablePredictionText).filter(Boolean)
  }
  if (unavailable || (!result.observations.length && !result.markets.length && !result.holdings.length)) {
    result.notices.push('部分依据暂时无法整理成清楚的说明。')
  }
  if (result.implication === '仅为已核实资料支持的条件性方向，需后续经营和市场验证。') {
    result.implication = '这些因素支持当时的判断，但后续走势仍需观察。'
  }
  return result
}

export interface ExplanationReason extends DriverExplanation {
  /** 每个完整句子单独排版，保留否定、条件、报告期和数字，不按字数截取。 */
  points: string[]
  quoteDate: string | null
  reportDate: string | null
}

/** 完整中文句子去重；不拆逗号，避免把“如果…，则…”拆成无条件结论。 */
function sentences(text: string | undefined): string[] {
  return readablePredictionText(text).split(/(?<=。)\s*/).map(s => s.trim()).filter(Boolean)
}

const distinct = (items: string[]) => [...new Set(items)]
const sharedDate = (rows: QuoteRow[], key: 'date' | 'reportDate'): string | null =>
  rows.length && rows.every(row => row[key] !== null && row[key] === rows[0]![key]) ? rows[0]![key] : null

/**
 * 适用范围核对不作为涨跌理由展示。仅提炼原说明明确存在的资料局限；
 * 渠道、董事、审计机构等未参与方向判断的原文仍保存在原记录，不进入日常阅读区。
 */
function boundaryNotes(driver: PredictionDriver): string[] {
  const notes: string[] = []
  if (/报告期|完整组合|部分披露|调仓/.test(driver.meaning ?? '')) notes.push('持仓来自已披露报告，当前是否调仓尚不清楚。')
  if (/经理.*观点|按其观点/.test(driver.meaning ?? '')) notes.push('基金经理的市场展望属于个人观点，不能保证之后的表现。')
  if (/样本较短|任期较短/.test(driver.meaning ?? '')) {
    notes.push(/回撤明显|回撤较大/.test(driver.meaning ?? '')
      ? '基金经理的任职记录较短，期间回撤较大，尚不能确认能否持续跑赢比较基准。'
      : '基金经理的任职记录较短，尚不能确认长期管理能力。')
  }
  if (/关联公司待确认/.test(driver.observation)) notes.push('部分公告与本基金的关系尚未确认，不能据此判断涨跌。')
  return notes.length ? notes : ['部分资料对本基金的影响尚不明确。']
}

/**
 * 组织完整依据页：方向理由、相反因素、资料限制和参考报告分别展示。
 * 相同事实表只出现一次；综合说明只补充各条理由未说过的完整句子，不改原预测。
 */
export function predictionExplanationView(value: PredictionNarrative, fundCode: string) {
  const notes: string[] = []
  const documents: DriverExplanation['documents'] = []
  const seenTables = new Set<string>()
  const seenObservations = new Set<string>()
  const seenMarkets = new Set<string>()
  const stated = new Set<string>()
  const prepare = (drivers: PredictionDriver[]) => drivers.flatMap(driver => {
    if (driver.title === '披露与适用边界' && ['双向影响', '背景观察'].includes(driver.assessment)) {
      notes.push(...boundaryNotes(driver))
      return []
    }
    const explanation = explainPredictionDriver(driver, fundCode)
    documents.push(...explanation.documents)
    notes.push(...explanation.notices.map(note => note.startsWith('持仓占比来自')
      ? '持仓来自已披露报告，当前是否调仓尚不清楚。' : note))
    const key = JSON.stringify(explanation.holdings)
    const holdings = seenTables.has(key) ? [] : explanation.holdings
    seenTables.add(key)
    const observations = explanation.observations.filter(observation => {
      if (seenObservations.has(observation)) return false
      seenObservations.add(observation)
      return true
    })
    // 完整句子相等才省略；日期、否定词或条件改变的句子会保留。
    const routine = new Set(['这些因素支持当时的判断，但后续走势仍需观察。', '如果上述相反因素的影响加重，需要重新评估原来的方向判断。'])
    let points = distinct([...sentences(explanation.meaning), ...sentences(explanation.implication).filter(point => !routine.has(point))])
    // 只改写已知完整句式，并用同条原记录的行情核对；其他带条件或否定的说明不套这个模板。
    if (/^下一估值日关注通信配置的风险偏好传导，[^。，；]+同步走强，已有经营扩张提供背景，条件性偏强。$/.test(driver.meaning ?? '')
      && driver.assessment === '支持上涨' && explanation.holdings.length
      && sharedDate(explanation.holdings, 'date') && explanation.holdings.every(row => row.change !== null && row.change > 0)) {
      points = [
        `${sharedDate(explanation.holdings, 'date')}，表中 ${explanation.holdings.length} 只披露重仓股都在上涨。当时把这次上涨作为短期看涨的依据。`,
        '同时参考了公司已披露的业务增长情况。',
      ]
      // 综合段落仍按原句核对去重，避免改写后的短句与原句被误判为两组不同理由。
      sentences(explanation.meaning).forEach(point => stated.add(point))
    }
    points.forEach(point => stated.add(point))
    const relationship = holdings.length || !explanation.holdings.length ? explanation.relationship : ''
    const markets = explanation.markets.filter(market => {
      if (seenMarkets.has(market)) return false
      seenMarkets.add(market)
      return true
    })
    return [{ ...explanation, holdings, observations, markets, relationship, documents: [], notices: [], points,
      title: explanation.title === '可能使方向反转的依据' ? '哪些情况可能改变走势'
        : explanation.title === '披露与适用边界' ? '资料变化对走势的影响' : explanation.title,
      quoteDate: sharedDate(holdings, 'date'), reportDate: sharedDate(holdings, 'reportDate') } satisfies ExplanationReason]
  })
  const groups = [
    { title: '为什么这样判断', drivers: prepare(value.drivers ?? []) },
    { title: '可能看错的地方', drivers: prepare(value.counterpoints ?? []) },
  ].filter(group => group.drivers.length)
  // 常规“需验证”等套话已由摘要和风险说明表达，不再为每个因素重复一段。
  const context = sentences(value.context).filter(sentence => {
    const comparable = sentence.replace(/^同时[，,]\s*/, '')
    return !stated.has(comparable)
      && comparable !== '本次同时考虑了股价表现、实际经营情况和相反因素，判断把握仍较低。'
  })
  notes.push(...value.limitations.flatMap(sentences))
  const conditions = distinct((value.conditions ?? []).flatMap(sentences))
  const summary = readablePredictionText(value.summary)
    .replace(/偏强，把握较低。$/, '倾向上涨，但把握较低。')
    .replace(/偏弱，把握较低。$/, '倾向下跌，但把握较低。')
  return { summary, groups, context, conditions, notes: distinct(notes),
    documents: documents.filter((source, index, rows) => rows.findIndex(other => other.url === source.url) === index) }
}
