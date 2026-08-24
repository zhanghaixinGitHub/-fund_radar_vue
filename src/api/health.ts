import { get } from '@/api/http'
import type { CoreHealth } from '@/types/api'

export function getCoreHealth(): Promise<CoreHealth> {
  return get<CoreHealth>('/api/v1/health')
}
