import { get, post } from './http'
import type { PredictionReview, PredictionReviewRequest, PredictionReviewHistoryPage } from '@/types/predictionReview'
import { assertPredictionReview } from '@/utils/predictionReview'

export async function readPredictionReview(code: string): Promise<PredictionReview | null> {
  const value = await get<PredictionReview | null>(`/api/v1/watchlist/${encodeURIComponent(code)}/predictions/review-v2`)
  assertPredictionReview(value, code)
  return value
}
export const requestPredictionReview = (code: string) => post<PredictionReviewRequest>(
  `/api/v1/watchlist/${encodeURIComponent(code)}/predictions/review-v2/generate`,
)
export async function readPredictionReviewHistory(code: string, cursor?: { before: string; beforeId: string }): Promise<PredictionReviewHistoryPage> {
  const query = cursor ? `?${new URLSearchParams(cursor)}` : ''
  const value = await get<PredictionReviewHistoryPage>(`/api/v1/watchlist/${encodeURIComponent(code)}/predictions/review-v2/history${query}`)
  for (const item of value.items) assertPredictionReview(item, code)
  return value
}
