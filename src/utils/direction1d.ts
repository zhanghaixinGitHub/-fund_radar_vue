import type { Direction1dForecast, Direction1dRecord } from '@/types/direction1d'

const reasons: Record<string, string> = {
  READY_EXPERIMENTAL: '数据与模型已就绪（实验）', DATA_PENDING: '等待官方净值', HISTORY_TOO_SHORT: '完整历史不足61个交易日',
  MODEL_PENDING: '当前基金还没有可用模型', GROUP_UNVERIFIED: '基金资料或产品身份待核实', SPECIAL_POLICY_REQUIRED: '现有模型暂不适用',
  CROSS_MARKET_MODEL_REQUIRED: '涉及港股或海外市场，交易日期、净值发布时间和模型适用性尚未验证',
  COMMODITY_MODEL_REQUIRED: '涉及黄金、原油或其他商品，现有三组模型尚未验证适用性',
  FOF_MODEL_REQUIRED: '属于投资其他基金的产品，现有模型尚未验证适用性',
  MONEY_MARKET_TARGET_REQUIRED: '货币基金需要先明确收益指标，不能直接套用当前单位净值涨跌模型',
  REIT_MODEL_REQUIRED: 'REIT产品的预测数据和现有模型适用性尚未验证',
  PROFILE_SOURCE_UNVERIFIED: '缺少可信来源的完整基金档案', FUND_NOT_ACTIVE: '基金当前运作状态未确认正常',
  PRODUCT_IDENTITY_UNVERIFIED: '基金份额与主产品的对应关系待核实', ASSET_MODEL_UNSUPPORTED: '当前基金类型还没有对应模型',
  SOURCE_UNAVAILABLE: '来源暂不可用', MODEL_NOT_ACTIVE_FOR_WINDOW: '模型在本次检查时尚未可用',
  MODEL_UNAVAILABLE: '本期模型不可用', MODEL_NOT_RELEASED: '未正式发布', MISSED_DEADLINE: '已过本期留档截止',
  PENDING_TARGET: '待到期', PENDING_NAV: '等待目标日官方净值', PREDICTED: '已提前留档',
  OPEN: '本期窗口已开启', QUEUED: '后台排队中', RUNNING: '后台执行中', FAILED: '本次未完成',
  SUCCEEDED: '检查完成', PARTIAL: '部分待重试', LATE_ARCHIVE: '迟到档案，不计提前预测',
  CLOCK_SKEW: '服务时钟不一致，已停止新预测', EVIDENCE_EXPIRED: '来源证据已到期',
  NO_NEW_ASSESSED_SAMPLES: '尚无新增已核对样本，本周不拟合', INSUFFICIENT_MATURE_504_SESSION_WINDOW: '近504交易日成熟样本不足，继续使用上一模型',
  SKIPPED: '本次按规则跳过', UNKNOWN: '事件完整性未知', KNOWN_EVENT: '已知分红或其他事件',
  CN_BOND: '境内债券', CN_EQUITY: '境内股票', CN_MIXED: '境内混合',
  EVIDENCE_CORRUPTED: '原始记录校验失败',
}
export const direction1dReason = (code: string) => reasons[code] ?? code
export const direction1dDirection = (direction: string | null | undefined) => ({ UP: '上涨', NON_UP: '非上涨（下跌或持平）', DOWN: '下跌', FLAT: '持平' })[direction ?? ''] ?? '暂无方向'
export const direction1dTime = (time?: string | null) => time ? new Date(time).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }) : '尚无记录'

/**
 * 将同一次预测归纳成用户可读的方向和依据，不重新打分，也不选择性隐藏相反意见。
 * NON_UP 包含下跌和持平；分支分数不作为概率、置信度或收益展示。
 */
export function direction1dSummary(forecast: Direction1dForecast) {
  const available = forecast.branches.filter(branch => branch.status === 'AVAILABLE' && branch.predictedDirection)
  const directions = new Set(available.map(branch => branch.predictedDirection))
  const direction = directions.size === 1 ? available[0]?.predictedDirection : null
  const agreement = available.length === 0 ? '当前没有可用的模型判断。'
    : directions.size > 1 ? '模型判断不一致，暂时无法给出统一方向。'
      : available.length === 1 ? '当前仅一个模型可用。' : '现有模型判断一致。'

  return {
    direction: direction === 'UP' ? '上涨' : direction === 'NON_UP' ? '下跌或持平'
      : available.length ? '方向不明确' : '暂无预测',
    tone: direction === 'UP' ? 'up' : direction === 'NON_UP' ? 'non-up' : 'neutral',
    evidence: available.length
      ? `参考近60个交易日的净值涨跌、波动和回撤。${agreement}` : agreement,
    history: available.length ? direction1dInputSummary(forecast) : '',
  }
}

/**
 * 只用生成预测时保存的61条官方单位净值解释输入，避免用后来的行情解释旧预测。
 * 5/20交易日涨跌沿用模型的末值/期初值-1口径；它们是历史输入摘要，不是特征贡献或未来收益。
 * 缺失、日期错位或非法净值时不补值、不拼接当前行情，也不编造具体涨跌原因。
 */
function direction1dInputSummary(forecast: Direction1dForecast): string {
  const values = forecast.input?.values
  if (!values || values.length !== 61
    || values.some((row, index) => !/^\d{4}-\d{2}-\d{2}$/.test(row.navDate)
      || (index > 0 && row.navDate <= values[index - 1]!.navDate)
      || !Number.isFinite(Number(row.unitNav)) || Number(row.unitNav) <= 0)
    || values[60]?.navDate !== forecast.baseNavDate) return '本次预测的净值明细暂不可用。'

  const last = Number(values[60].unitNav)
  const change = (sessions: number) => {
    const ratio = last / Number(values[60 - sessions]!.unitNav) - 1
    if (ratio === 0) return `近${sessions}个交易日持平`
    const percent = Math.abs(ratio) * 100
    const amount = percent < .01 ? '不足0.01%' : `${percent.toFixed(2)}%`
    return `近${sessions}个交易日${ratio > 0 ? '上涨' : '下跌'}${amount}`
  }
  return `净值截至 ${forecast.baseNavDate}：${change(5)}，${change(20)}。`
}

/** 单基金接口固定数据范围；异常时不退回全账号查询，也不展示其他基金的记录。 */
export function assertDirection1dFundHistory(fundCode: string, records: Direction1dRecord[]): void {
  if (!/^\d{6}$/.test(fundCode)) throw new Error('基金代码无效，无法读取本基金预测历史。')
  for (const record of records) {
    // 已失效的原文只显示服务端错误原因，不能继续读取其中的预测字段。
    if (record.status) continue
    assertDirection1dForecast(record.forecast)
    if (record.forecast.fundCode !== fundCode) throw new Error('预测历史与当前基金不一致，已停止展示。')
  }
}

/** 仅核对已验证的提前预测；平盘归为非上涨，不可用分支和未公布结果都不计对错。 */
export function direction1dConclusion(record: Direction1dRecord, branchId: 'FIXED' | 'WEEKLY'): string {
  if (record.status) return direction1dReason(record.status)
  const branch = record.forecast.branches.find(item => item.branchId === branchId)
  if (branch?.status !== 'AVAILABLE' || !branch.predictedDirection) return '暂无有效预测'
  if (record.receiptStatus !== 'VERIFIED') return '未满足提前预测条件'
  const outcome = record.outcomes[0]
  if (!outcome) return '等待结果'
  if (!['UP', 'DOWN', 'FLAT'].includes(outcome.actualDirection)
    || outcome.y !== (outcome.actualDirection === 'UP' ? 1 : 0)) return '实际结果待核验'
  return (branch.predictedDirection === 'UP') === (outcome.y === 1) ? '正确' : '错误'
}

/** 阻止错误版本或不可用分支显示为可用方向；服务端仍承担最终校验。 */
export function assertDirection1dForecast(value: Direction1dForecast): void {
  if (value.schemaVersion !== 'DIRECTION_1D_EXPERIMENT_V1' || value.horizonTradingDays !== 1
    || value.targetDefinition !== 'UNIT_NAV_DIRECTION_V1' || value.modelReleased !== false || value.upProbability !== null
    || value.branches.length !== 2 || new Set(value.branches.map(b => b.branchId)).size !== 2) throw new Error('1日预测契约未通过校验。')
  for (const b of value.branches) {
    if (!['FIXED', 'WEEKLY'].includes(b.branchId)) throw new Error('分支身份不合法。')
    if (b.status === 'AVAILABLE') {
      if (b.score === null || !Number.isFinite(b.score) || b.score < 0 || b.score > 1
        || b.predictedDirection !== (b.score > .5 ? 'UP' : 'NON_UP')) throw new Error('模型结果不可用。')
    } else if (b.score !== null || b.predictedDirection !== null) throw new Error('不可用模型不得展示分数。')
  }
}
