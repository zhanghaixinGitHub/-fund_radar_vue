import { get } from '@/api/http'

export type RatingGrade = 'WEAK' | 'AVERAGE' | 'GOOD' | 'EXCELLENT'
export interface RatingSummary {
  fundCode: string
  status: 'RATED' | 'NOT_RATED' | 'UNSUPPORTED' | 'STALE' | 'NOT_FOUND' | 'WITHDRAWN'
  grade: RatingGrade | null
  gradeLabel: string | null
  asOfDate: string | null
  validUntil: string | null
  ratingRef: string | null
  message: string | null
}
export interface RatingDimension {
  key: string; name: string; grade: RatingGrade | null; gradeLabel: string | null; explanation: string
  metrics: { name: string; value: string; unit: string; period: string }[]
  sources: { title: string; url: string; publishedOn: string | null }[]
}
export interface RatingDetail extends RatingSummary {
  summary: string
  comparison: { category: string; currency: string | null; productCount: number; scope: string; period: string }
  dimensions: RatingDimension[]
  strengths: { dimension: string; text: string }[]
  weaknesses: { dimension: string; text: string }[]
  dataDates: { nav: string | null; holdings: string | null; manager: string | null; fees: string | null }
  limitations: string[]
  previousRating: RatingSummary | null
}

/** 一页共用一个有界请求；此 API 只有已发布快照读取能力。 */
export const readFundRatings = (codes: string[]) => get<{ items: RatingSummary[] }>(
  `/api/v1/funds/ratings?${new URLSearchParams({ fundCodes: codes.join(',') })}`,
)
export const readFundRating = (code: string, reference?: string) => get<RatingDetail>(
  `/api/v1/funds/${encodeURIComponent(code)}/rating${reference ? `?${new URLSearchParams({ ratingRef: reference })}` : ''}`,
)
