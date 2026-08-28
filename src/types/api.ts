/** Java 核心服务返回给浏览器的统一响应信封。 */
export interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  data: T
  traceId: string
  timestamp: string
}
