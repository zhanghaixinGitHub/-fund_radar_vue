/** Java 对外接口返回的本地资讯型提醒规则，不包含交易能力。 */
export interface AlertRule {
  ruleId: string
  fundCode: string
  ruleType: 'RISK_LEVEL' | 'SIGNAL_CHANGE' | 'EVENT'
  threshold: number | string | null
  enabled: boolean
  createdAt: string
  updatedAt: string
}

/** 创建或更新提醒规则时提交给 Java 核心服务的请求体。 */
export interface UpsertAlertRuleRequest {
  fundCode: string
  ruleType: AlertRule['ruleType']
  threshold: number | null
  enabled: boolean
}
