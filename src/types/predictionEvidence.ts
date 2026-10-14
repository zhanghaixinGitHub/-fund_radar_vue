/** 面向用户的预测依据；facts 是当时输入，supporting/opposing 才是可还原的判断作用。 */
export interface PredictionEvidence {
  summary: string
  facts: { label: string; value: string }[]
  supporting: string[]
  opposing: string[]
  limitations: string[]
}

/** V4 将综合分析保存在 context，正反清单字段兼容保留为空；日期、方向及原事实由服务端核对。 */
export interface PredictionNarrative {
  styleVersion: string
  summary: string
  context: string
  supporting: string
  opposing: string
  limitations: string[]
  /** 原预测时已知的具体事实及条件性影响；来源链接只指向该条事实的原文。 */
  drivers?: PredictionDriver[]
  counterpoints?: PredictionDriver[]
  conditions?: string[]
  inventory?: { id: string; name: string; status: string; detail: string }[]
}
export interface PredictionDriver {
  category: '净值' | '基金净值' | '持仓行情' | '行业行情' | '市场行情' | '财务' | '公告' | '政策' | '新闻' | '公司经营' | '基金经理'
  title: string
  assessment: string
  observation: string
  implication: string
  meaning?: string
  relation?: string
  sources?: { title: string; url: string; publishedDate: string }[]
  source?: { title: string; url: string; publishedDate: string }
}
export interface PredictionNarrativeResponse {
  fundCode: string
  recordId: string
  kind: 'daily' | 'multi'
  state: 'READY' | 'PENDING' | 'FALLBACK'
  narrative?: PredictionNarrative
}
