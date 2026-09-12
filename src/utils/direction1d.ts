import type { Direction1dForecast } from '@/types/direction1d'

const reasons: Record<string, string> = {
  READY_EXPERIMENTAL: '数据与模型已就绪（实验）', DATA_PENDING: '等待官方净值', HISTORY_TOO_SHORT: '完整历史不足61个交易日',
  MODEL_PENDING: '等待本组可用模型', GROUP_UNVERIFIED: '资产分组尚未核验', SPECIAL_POLICY_REQUIRED: '此类型需要独立协议',
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
