import type { ApiResponse } from '@/types/api'

const REQUEST_ID_HEADER = 'X-Request-Id'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

function createRequestId(): string {
  return crypto.randomUUID()
}

export async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      [REQUEST_ID_HEADER]: createRequestId(),
    },
  })

  const payload = (await response.json()) as ApiResponse<T>
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || `请求失败（HTTP ${response.status}）`)
  }

  return payload.data
}
