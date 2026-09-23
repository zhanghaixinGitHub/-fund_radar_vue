/** 旧原文保持二分类含义；未知值不能被页面兜底解释成下跌。 */
export const THREE_STATE_TARGET = 'NEXT_EXECUTABLE_CASH_REINVESTED_THREE_STATE_V2'
export function directionLabel(direction: string): string {
  return ({ UP: '上涨', FLAT: '持平', DOWN: '下跌', NON_UP: '下跌或持平（旧版二分类）' } as Record<string, string>)[direction] ?? '方向无法识别'
}
export function directionVersion(target?: string): string {
  return target === THREE_STATE_TARGET ? '三分类' : '旧版二分类'
}
export function flatRange(threshold?: string | number): string {
  const value = Number(threshold)
  return Number.isFinite(value) && value > 0 ? `本周期总回报在 ±${Number((value * 100).toFixed(4))}% 内（含边界）算持平。` : ''
}
