import { get, post } from './http'
import type { PredictionReview, PredictionReviewRequest } from '@/types/predictionReview'
import { assertPredictionReview } from '@/utils/predictionReview'

export async function readPredictionReview(code: string): Promise<PredictionReview | null> {
  const value = await get<PredictionReview | null>(`/api/v1/watchlist/${encodeURIComponent(code)}/predictions/review-v2`)
  assertPredictionReview(value, code)
  return value
}
export const requestPredictionReview = (code: string) => post<PredictionReviewRequest>(
  `/api/v1/watchlist/${encodeURIComponent(code)}/predictions/review-v2/generate`,
)
