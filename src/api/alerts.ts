import { get, put } from '@/api/http'
import type { AlertRule, UpsertAlertRuleRequest } from '@/types/alert'

/** 查询当前登录用户的资讯型提醒规则，不包含交易或下单能力。 */
export function getAlertRules(): Promise<AlertRule[]> {
  return get<AlertRule[]>('/api/v1/alert-rules')
}

/** 创建或更新一条个人提醒规则；按基金和提醒类型幂等写入，绝不触发交易。 */
export function upsertAlertRule(request: UpsertAlertRuleRequest): Promise<AlertRule> {
  return put<AlertRule>('/api/v1/alert-rules', request)
}
