/** Java 核心服务返回给浏览器的统一响应信封。 */
export interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  data: T
  traceId: string
  timestamp: string
}

/** Java 核心服务对外暴露的聚合健康状态。 */
export interface CoreHealth {
  service: string
  status: 'UP'
  time: string
}
