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
}
export interface PredictionNarrativeResponse {
  fundCode: string
  recordId: string
  kind: 'daily' | 'multi'
  state: 'READY' | 'PENDING' | 'FALLBACK'
  narrative?: PredictionNarrative
}
