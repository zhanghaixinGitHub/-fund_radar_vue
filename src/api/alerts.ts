import { get, put } from '@/api/http'
import type { AlertAvailability, AlertRule, AlertRulePage, UpsertAlertRuleRequest } from '@/types/alert'

/** 查询当前登录用户的资讯型提醒规则，不包含交易或下单能力。 */
export function getAlertRules(): Promise<AlertRule[]> {
  return get<AlertRule[]>('/api/v1/alert-rules')
}

/** 分页读取提醒开关；enabled 未指定时查询全部，由服务端按登录用户隔离。 */
export function getAlertRulePage(page = 1, pageSize = 10, enabled?: boolean): Promise<AlertRulePage> {
  const search = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  if (enabled !== undefined) search.set('enabled', String(enabled))
  return get<AlertRulePage>(`/api/v1/alert-rules/page?${search.toString()}`)
}

/** 只读查询当前可发送的提醒范围，不启动消息检查。 */
export function getAlertAvailability(): Promise<AlertAvailability> {
  return get<AlertAvailability>('/api/v1/alert-rules/availability')
}

/** 创建或更新一条个人提醒规则；按基金和提醒类型幂等写入，绝不触发交易。 */
export function upsertAlertRule(request: UpsertAlertRuleRequest): Promise<AlertRule> {
  return put<AlertRule>('/api/v1/alert-rules', request)
}
