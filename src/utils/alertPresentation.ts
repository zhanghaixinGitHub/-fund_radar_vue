import type { AlertAvailability, AlertRule } from '@/types/alert'

/** 详情与站内设置采用相同名称，只解释用户会收到什么。 */
export const alertDescriptions: Record<AlertRule['ruleType'], { title: string; description: string }> = {
  EVENT: {
    title: '基金相关事项',
    description: '这只基金或其披露持仓中的公司有已核实的新公告时提醒你，例如定期报告、业绩或回购公告。',
  },
  SIGNAL_CHANGE: {
    title: '走势判断变化',
    description: '对这只基金未来走势的判断改变时提醒你，例如从偏向上涨变为偏向下跌；不等同于当天实际涨跌。',
  },
  RISK_LEVEL: {
    title: '已有风险提醒',
    description: '达到你之前保存的风险条件时提醒你，开启或关闭不会更改原条件。',
  },
}

/** 未收到能力状态时按未知展示，不能由接收开关推定消息能够发送。 */
export function alertAvailabilityNote(type: AlertRule['ruleType'], fundCode: string, value: AlertAvailability | null): string {
  if (!value) return '暂时无法确认这类提醒是否可用，接收设置仍会保留。'
  if (type === 'EVENT') {
    if (!value.eventFundCodes.includes(fundCode)) return '这只基金的公告提醒暂未开放，接收设置会保留。'
    if (!value.eventAvailable) return '公告提醒暂时无法发送，接收设置会保留。'
    return '仅提醒已核实的近 30 天公告，暂不覆盖所有事项。'
  }
  if (type === 'SIGNAL_CHANGE' && !value.signalChangeAvailable) return '这类提醒暂未开放，接收设置会保留。'
  if (type === 'RISK_LEVEL' && !value.riskLevelAvailable) return '这类提醒暂时无法发送，接收设置会保留。'
  return ''
}
