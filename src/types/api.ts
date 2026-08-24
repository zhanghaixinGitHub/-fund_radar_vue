export interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  data: T
  traceId: string
  timestamp: string
}

export interface CoreHealth {
  service: string
  status: 'UP'
  time: string
}
