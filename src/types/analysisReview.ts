/** 事后综合回看独立于事前预测；时间沿用原件，始终排除准确率统计。 */
export interface AnalysisReviewEvidence {
  fact: string
  interpretation: string
  sources: { title: string; url: string | null }[]
}
export interface AnalysisReview {
  reviewId: string
  recordType: 'COMPREHENSIVE_ASOF_REVIEW'
  fundCode: string
  targetNavDate: string
  baseNavDate: string
  informationCutoff: string
  actualGeneratedAt: string
  importedAt: string
  direction: 'UP' | 'DOWN'
  confidence: 'LOW'
  summary: string
  supportingEvidence: AnalysisReviewEvidence[]
  counterEvidence: AnalysisReviewEvidence[]
  changeConditions: string[]
  limitations: string[]
  excludedFromAccuracy: true
}
export interface AnalysisReviewCursor { before: string; beforeId: string }
export interface AnalysisReviewPage { items: AnalysisReview[]; nextCursor: AnalysisReviewCursor | null }
