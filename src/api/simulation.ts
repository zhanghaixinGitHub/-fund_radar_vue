import { get, post, put } from '@/api/http'
import type {
  SimDaily, SimLedger, SimOrder, SimOrderRequest, SimOverview, SimPage, SimPeriod, SimPlan, SimPlanRequest, SimPreview,
} from '@/types/simulation'

const base = '/api/v1/sim-portfolios/current'
const codePath = (code: string) => encodeURIComponent(code)
function query(page: number, fundCode?: string) {
  const params = new URLSearchParams({ page: String(page), pageSize: '20' })
  if (fundCode) params.set('fundCode', fundCode)
  return params.toString()
}
export const getSimOverview = () => get<SimOverview>(base)
export const getSimPreview = (code: string) => get<SimPreview>(`${base}/preview/${codePath(code)}`)
export const placeSimOrder = (request: SimOrderRequest) => post<SimOrder>(`${base}/orders`, request)
export const cancelSimOrder = (id: string) => post<SimOrder>(`${base}/orders/${codePath(id)}/cancel`)
export const getSimOrders = (page = 1, code?: string) => get<SimPage<SimOrder>>(`${base}/orders?${query(page, code)}`)
export const getSimLedger = (page = 1, code?: string) => get<SimPage<SimLedger>>(`${base}/ledger?${query(page, code)}`)
export const getSimPlans = () => get<SimPlan[]>(`${base}/recurring-plans`)
export const previewSimPlan = (request: SimPlanRequest) => post<{ scheduledDate: string; executionDate: string }>(`${base}/recurring-plans/preview`, request)
export const saveSimPlan = (request: SimPlanRequest, id?: string) => id
  ? put<SimPlan>(`${base}/recurring-plans/${codePath(id)}`, request)
  : post<SimPlan>(`${base}/recurring-plans`, request)
export const changeSimPlan = (plan: SimPlan, action: 'PAUSE' | 'RESUME' | 'END') => post<SimPlan>(
  `${base}/recurring-plans/${codePath(plan.planId)}/actions`, { action, version: plan.version },
)
export const getSimPeriods = (id: string, page = 1) => get<SimPage<SimPeriod>>(`${base}/recurring-plans/${codePath(id)}/executions?${query(page)}`)
export const getSimPerformance = (code: string, start: string, end: string) => get<SimDaily[]>(
  `${base}/performance/${codePath(code)}?${new URLSearchParams({ startDate: start, endDate: end })}`,
)
