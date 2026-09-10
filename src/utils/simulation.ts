import type { DecimalValue, SimPlan } from '@/types/simulation'

export function simMoney(value: DecimalValue | null | undefined): string {
  return value === null || value === undefined ? '—' : Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
export function simShares(value: DecimalValue): string {
  const [integer, decimal = ''] = plainDecimal(value).split('.')
  return decimal.replace(/0+$/, '') ? `${integer}.${decimal.replace(/0+$/, '')}` : String(integer)
}
/** 份额快捷选择使用整数运算，防止浮点舍入导致“全部卖出”超过可卖份额。 */
export function fractionShares(value: DecimalValue, denominator: 1 | 2 | 4): string {
  const [whole = '0', fractional = ''] = plainDecimal(value).split('.')
  const scaled = BigInt(whole) * 100000000n + BigInt(fractional.padEnd(8, '0').slice(0, 8))
  const result = scaled / BigInt(denominator)
  return simShares(`${result / 100000000n}.${String(result % 100000000n).padStart(8, '0')}`)
}
function plainDecimal(value: DecimalValue): string {
  const match = /^(\d+)(?:[.](\d*))?(?:[eE]([+-]?\d+))?$/.exec(String(value))
  if (!match) throw new Error('份额格式不合法。')
  const integer = match[1] ?? '0'
  const fractional = match[2] ?? ''
  const exponent = Number(match[3] ?? 0)
  if (Math.abs(exponent) > 32) throw new Error('份额超出支持范围。')
  const digits = integer + fractional
  const point = integer.length + exponent
  if (point <= 0) return `0.${'0'.repeat(-point)}${digits}`
  if (point >= digits.length) return digits + '0'.repeat(point - digits.length)
  return `${digits.slice(0, point)}.${digits.slice(point)}`
}
export const simTone = (value: DecimalValue | null | undefined) => value == null ? '' : Number(value) > 0 ? 'sim-positive' : Number(value) < 0 ? 'sim-negative' : ''
export const simPercent = (value: DecimalValue | null) => value === null ? '—' : `${(Number(value) * 100).toFixed(2)}%`
export const planFrequency = (plan: Pick<SimPlan, 'frequency' | 'dayValue'>) => plan.frequency === 'DAILY'
  ? '每个交易日' : plan.frequency === 'WEEKLY' ? `每周${['一', '二', '三', '四', '五', '六', '日'][plan.dayValue - 1]}` : `每月 ${plan.dayValue} 日`
export function shanghaiDate(offset = 0): string {
  const current = new Date(Date.now() + offset * 86400000)
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(current)
  return `${parts.find(p => p.type === 'year')?.value}-${parts.find(p => p.type === 'month')?.value}-${parts.find(p => p.type === 'day')?.value}`
}
export const simTime = (value: string | null | undefined) => value ? new Date(value).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }) : '—'
