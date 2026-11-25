import { get, post } from './http'
import type { CurrentForecast, PredictionReviewRequest, PredictionReviewHistoryPage } from '@/types/predictionReview'
import { assertPredictionReview } from '@/utils/predictionReview'

export async function readCurrentForecast(code: string): Promise<CurrentForecast> {
  const value = await get<CurrentForecast>(`/api/v1/watchlist/${encodeURIComponent(code)}/predictions/review-v2/current-window`)
  if (value.fundCode !== code || !Array.isArray(value.window?.periods)
    || !Number.isFinite(Date.parse(value.window.nextWindowOpenAt))) throw new Error('预测日期暂时无法核对。')
  assertPredictionReview(value.review, code)
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
