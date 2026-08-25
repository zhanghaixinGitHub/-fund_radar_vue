import { get } from '@/api/http'
import type { CoreHealth } from '@/types/api'

/** 查询 Java 核心服务及其内部 AI 服务的聚合健康状态。 */
export function getCoreHealth(): Promise<CoreHealth> {
  return get<CoreHealth>('/api/v1/health')
}
