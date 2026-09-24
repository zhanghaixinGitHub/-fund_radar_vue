/** 面向用户的预测依据；facts 是当时输入，supporting/opposing 才是可还原的判断作用。 */
export interface PredictionEvidence {
  summary: string
  facts: { label: string; value: string }[]
  supporting: string[]
  opposing: string[]
  limitations: string[]
}
