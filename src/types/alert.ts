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

/** 接收状态筛选后的本人提醒分页，页码从 1 开始，空列表总页数为 0。 */
export interface AlertRulePage {
  items: AlertRule[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

/** 创建或更新提醒规则时提交给 Java 核心服务的请求体。 */
export interface UpsertAlertRuleRequest {
  fundCode: string
  ruleType: AlertRule['ruleType']
  threshold: number | null
  enabled: boolean
}

/** 当前消息生成能力；与接收开关分开，防止未接通时仍承诺能收到消息。 */
export interface AlertAvailability {
  eventAvailable: boolean
  eventFundCodes: string[]
  signalChangeAvailable: boolean
  riskLevelAvailable: boolean
}
