/**
 * 将后端基金枚举转换为面向用户的中文文案。
 *
 * 后端仍保留稳定英文代码，界面不直接展示内部枚举，避免用户将数据同步状态误解为行情结论。
 */
export function fundTypeLabel(value: string): string {
  const labels: Record<string, string> = {
    STOCK: '股票型',
    MIXED: '混合型',
    BOND: '债券型',
    INDEX: '指数型',
    MONEY: '货币型',
    QDII: 'QDII',
    FOF: '基金中基金（FOF）',
    REIT: '公募 REITs',
  }
  return labels[value] ?? '其他类型'
}

/** 将基金存续状态转换为中文，不将内部状态码暴露给用户。 */
export function fundStatusLabel(value: string): string {
  const labels: Record<string, string> = {
    ACTIVE: '正常运作',
    SUSPENDED: '暂停运作',
    CLOSED: '已终止',
    LIQUIDATED: '已清盘',
  }
  return labels[value] ?? '状态待确认'
}

/** 将净值同步状态转换为中文，并明确缺失数据不等同于零净值或实时行情。 */
export function netValueStatusLabel(value: string): string {
  const labels: Record<string, string> = {
    SYNCED: '净值已同步',
    NOT_SYNCED: '尚未同步净值',
    STALE: '净值数据已过期',
    UNAVAILABLE: '暂未取得净值',
  }
  return labels[value] ?? '净值状态待确认'
}

/** 将目录来源转换为中文，避免将一次性样本误认为自动、实时数据源。 */
export function dataSourceLabel(value: string): string {
  const labels: Record<string, string> = {
    MANUAL_PUBLISHER_VERIFIED_SAMPLE: '人工核验的公开资料样本',
    M0_MOCK: '演示用模拟数据',
    MANUAL_IMPORT: '人工录入数据',
    TUSHARE: 'Tushare 数据接口',
    TUSHARE_PRO_FUND: 'Tushare 数据接口',
    AUTHORIZED_COMMERCIAL: '已授权的商业数据源',
  }
  return labels[value] ?? '来源信息待确认'
}

/** 将评分方向转换为中文；缺失方向不补充任何推断。 */
export function signalDirectionLabel(value: string | null): string {
  const labels: Record<string, string> = {
    UP: '向上',
    DOWN: '向下',
    NEUTRAL: '中性',
  }
  return value === null ? '—' : (labels[value] ?? '暂未评估')
}

/** 将评分风险等级转换为中文。 */
export function riskLevelLabel(value: string | null): string {
  const labels: Record<string, string> = {
    LOW: '低',
    MEDIUM: '中',
    HIGH: '高',
    VERY_HIGH: '较高',
  }
  return value === null ? '—' : (labels[value] ?? '暂未评估')
}
