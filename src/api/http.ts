import type { ApiResponse } from '@/types/api'

/** Java 核心服务要求浏览器携带的请求关联标识请求头。 */
const REQUEST_ID_HEADER = 'X-Request-Id'
/** 由 Vite 环境变量提供的 Java 核心服务地址；本地开发默认同源。 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

/** 为每次浏览器请求生成可追踪的唯一标识。 */
function createRequestId(): string {
  return crypto.randomUUID()
}

/** 发起不含请求体的 GET 请求，并解包统一响应中的 data 字段。 */
export async function get<T>(path: string): Promise<T> {
  return request<T>(path)
}

/** 发起 JSON POST 请求；请求失败时抛出后端返回的可展示错误信息。 */
export async function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

/** 发起 JSON PUT 请求，用于幂等的创建或更新操作。 */
export async function put<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'PUT',
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

/** 发起 DELETE 请求，并解包统一响应中的 data 字段。 */
export async function remove<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' })
}

/**
 * 统一执行 HTTP 请求。
 *
 * 自动添加 JSON 内容类型和请求关联标识，校验 HTTP 状态与业务 success 标识后返回业务数据。
 */
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      [REQUEST_ID_HEADER]: createRequestId(),
      ...init.headers,
    },
  })

  const payload = (await response.json()) as ApiResponse<T>
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || `请求失败（HTTP ${response.status}）`)
  }

  return payload.data
}
