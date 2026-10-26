import { get } from '@/api/http'
import type { ManagerDetail, ManagerPage, ManagerRelatedDetail } from '@/types/fundManager'

/** 卡片按当前基金锚点取得人物编号，不对全市场同名人员做前端归并。 */
export function getManagerLinks(fundCode: string): Promise<Record<string, string>> {
  return get(`/api/v1/fund-managers/links?fundCode=${encodeURIComponent(fundCode)}`)
}

/** 只访问Java的公共已发布资料；搜索、打开详情及轮询均不触发来源采集。 */
export function getFundManagers(query: Record<string, string | number | undefined>): Promise<ManagerPage> {
  const parameters = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) if (value !== undefined && value !== '') parameters.set(key, String(value))
  return get<ManagerPage>(`/api/v1/fund-managers?${parameters}`)
}
export function getFundManager(id: string): Promise<ManagerDetail> {
  return get<ManagerDetail>(`/api/v1/fund-managers/${encodeURIComponent(id)}`)
}
export function getManagerRelatedFund(id: string, relatedFundId: string): Promise<ManagerRelatedDetail> {
  return get<ManagerRelatedDetail>(`/api/v1/fund-managers/${encodeURIComponent(id)}/funds/${encodeURIComponent(relatedFundId)}`)
}
