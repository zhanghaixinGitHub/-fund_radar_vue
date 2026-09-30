<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { readAdviceEffects, readPredictionEffects } from '@/api/automaticPrediction'
import type { AdviceEffects, PredictionEffects } from '@/api/automaticPrediction'
import { shanghaiDate } from '@/utils/simulation'
import { isThreeStateTarget } from '@/utils/predictionDirection'
import { sortPredictionHorizons } from '@/utils/predictionHorizon'
const props = defineProps<{ fundCode: string }>()
const today = shanghaiDate(), start = ref(`${today.slice(0, 4)}-01-01`), end = ref(today)
const effects = ref<PredictionEffects | null>(null), ledger = ref<AdviceEffects | null>(null)
const sortedHorizons = computed(() => sortPredictionHorizons(effects.value?.horizons, item => item.horizon_id))
const error = ref(''), ledgerError = ref(''), busy = ref(false)
const labels: Record<string, string> = { T5_V1: '五个交易日', T20_V1: '二十个交易日', M6_V1: '六个月' }
const pct = (value: number) => `${(value * 100).toFixed(2)}%`
const money = (value: number) => Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
let sequence = 0
async function load() {
  const run = ++sequence; busy.value = true; error.value = ''; ledgerError.value = ''
  const actualEnd = end.value === today ? new Date(`${today}T00:00:00+08:00`).getTime() - 86400000 : null
  const until = actualEnd === null ? end.value : new Date(actualEnd + 8 * 3600000).toISOString().slice(0, 10)
  await Promise.all([
    readPredictionEffects().then(value => { if (run === sequence) effects.value = value }).catch(() => { if (run === sequence) error.value = '实际预测效果暂时无法读取，请稍后重试。' }),
    readAdviceEffects(props.fundCode, start.value, until).then(value => { if (run === sequence) ledger.value = value }).catch(() => { if (run === sequence) ledgerError.value = '这段日期的建议效果暂时无法核对，请稍后重试或缩短日期范围。' }),
  ])
  if (run === sequence) busy.value = false
}
watch(() => props.fundCode, () => { ledger.value = null; effects.value = null; void load() }, { immediate: true })
onBeforeUnmount(() => { ++sequence })
</script>
<template>
  <section
    class="effect-panel"
    aria-label="实际效果回看"
    :aria-busy="busy"
  >
    <h2>真实预测效果</h2>
    <p
      v-if="error"
      class="error-message"
      role="alert"
    >
      {{ error }}
    </p>
    <template v-if="effects">
      <p>本人关注 {{ effects.followedFundCount }} 只，其中 {{ effects.fundCount }} 只已有实际预测。失败期次 {{ effects.failedPeriods }}。</p>
      <p>{{ effects.note }}</p>
      <div class="effect-grid">
        <article
          v-for="item in sortedHorizons"
          :key="`${item.horizon_id}:${item.target_definition_id}:${item.direction_policy_hash}`"
        >
          <h3>{{ labels[item.horizon_id] ?? item.horizon_id }}</h3>
          <p v-if="item.first_generated_date">
            生成于 {{ item.first_generated_date }}<span v-if="item.last_generated_date !== item.first_generated_date"> 至 {{ item.last_generated_date }}</span>
          </p>
          <p>{{ isThreeStateTarget(item.target_definition_id) ? '按上涨、持平、下跌核对' : '按上涨、非上涨核对（历史口径）' }}</p>
          <strong>{{ item.matured ? `正确 ${item.correct} / ${item.matured} 条` : '暂无已核验结果' }}</strong>
          <p>{{ item.funds }} 只基金 · {{ item.records }} 条预测</p><p>已核验 {{ item.matured }}，未到期 {{ item.unmatured }}，待答案 {{ item.pending_answers }}，核验失败 {{ item.check_failed }}</p>
          <template v-if="isThreeStateTarget(item.target_definition_id)">
            <p>实际上涨：{{ item.up_correct }} / {{ item.up_actual }} 判对{{ item.up_actual ? `（${pct(item.up_correct / item.up_actual)}）` : '（暂无样本）' }}</p>
            <p>实际持平：{{ item.flat_correct }} / {{ item.flat_actual }} 判对{{ item.flat_actual ? `（${pct(item.flat_correct / item.flat_actual)}）` : '（暂无样本）' }}</p>
            <p>实际下跌：{{ item.down_correct }} / {{ item.down_actual }} 判对{{ item.down_actual ? `（${pct(item.down_correct / item.down_actual)}）` : '（暂无样本）' }}</p>
          </template>
        </article>
      </div>
      <p v-if="!effects.horizons.length">
        尚无实际发出的预测，等待后台生成。
      </p>
    </template>
    <h2>系统建议模拟效果</h2>
    <p>按当时已保存的建议模拟，与不同初始持仓的对照比较；不代表个人实际收益。</p>
    <form
      class="effect-filters"
      @submit.prevent="load"
    >
      <label>开始日期<input
        v-model="start"
        type="date"
        required
        :max="end"
      ></label>
      <label>结束日期<input
        v-model="end"
        type="date"
        required
        :max="today"
      ></label>
      <button
        class="secondary-button"
        :disabled="busy"
      >
        {{ busy ? '正在读取…' : '查看效果' }}
      </button>
    </form>
    <p v-if="end === today">
      选择截至今天；当天尚未结束，实际计算截至昨天。
    </p>
    <p
      v-if="ledgerError"
      class="error-message"
      role="alert"
    >
      {{ ledgerError }}<span v-if="ledger">；以下保留上次查询的原结果。</span>
    </p>
    <template v-if="ledger">
      <p>查询 {{ ledger.startDate }} 至 {{ ledger.endDate }}<span v-if="ledger.actualStartDate">；实际账本从 {{ ledger.actualStartDate }} 开始</span>。</p>
      <p v-if="ledger.message">
        {{ ledger.message }}
      </p>
      <p v-if="ledger.system">
        本次模拟从全部持有现金开始；原建议为“持有”时不会补成买入。未交易期间的零收益不能当作已经成功避跌。
      </p>
      <div
        v-if="ledger.system && ledger.buyHold"
        class="effect-grid"
      >
        <article><h3>系统当时的建议</h3><strong>{{ pct(ledger.system.netReturn) }}</strong><p>最后账户价值 {{ money(ledger.system.finalEquity) }} 元</p><p>最大回撤 {{ pct(ledger.system.maxDrawdown) }} · 费用 {{ money(ledger.system.fees) }} 元</p></article>
        <article><h3>买入后一直持有</h3><strong>{{ pct(ledger.buyHold.netReturn) }}</strong><p>最后账户价值 {{ money(ledger.buyHold.finalEquity) }} 元</p><p>最大回撤 {{ pct(ledger.buyHold.maxDrawdown) }} · 费用 {{ money(ledger.buyHold.fees) }} 元</p></article>
      </div>
      <p v-if="ledger.reportCount !== undefined">
        保存建议 {{ ledger.reportCount }} 条，落在有效日期的建议 {{ ledger.effectiveDays }} 日；失败报告 {{ ledger.failedReports }} 条，缺少有效建议 {{ ledger.missingReportDays }} 日。
      </p>
      <template v-if="ledger.system && ledger.execution">
        <p>实际模拟成交 {{ ledger.system.tradeCount }} 次，换手 {{ pct(ledger.system.turnover) }}；有持仓 {{ ledger.system.investedSessions }} 日、未持有基金 {{ ledger.system.cashOnlySessions }} 日，资金在途 {{ ledger.execution.pendingCashSessions }} 日。</p>
        <p>提出买卖 {{ ledger.execution.requestedTradeDays }} 日，产生模拟成交 {{ ledger.execution.executedTradeDays }} 日，未能成交 {{ ledger.execution.unexecutedTradeDays }} 日；平均基金持仓占比 {{ pct(ledger.execution.meanInvestedFraction) }}。</p>
        <details v-if="ledger.exposureControls?.length">
          <summary>不同持仓比例的对照</summary>
          <p>初始投入比例在比较前固定，买入后不再平衡；其余现金不投资。应结合平均持仓核对，不能只挑收益最好的一档。</p>
          <div class="effect-table-wrap">
            <table>
              <thead><tr><th>初始投入</th><th>平均持仓</th><th>净收益</th><th>最大回撤</th><th>费用（元）</th></tr></thead><tbody>
                <tr
                  v-for="control in ledger.exposureControls"
                  :key="control.initialRatio"
                >
                  <td>{{ pct(control.initialRatio) }}</td><td>{{ pct(control.execution.meanInvestedFraction) }}</td><td>{{ pct(control.result.netReturn) }}</td><td>{{ pct(control.result.maxDrawdown) }}</td><td>{{ money(control.result.fees) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </details>
        <details v-if="ledger.system.exitReviews?.length">
          <summary>卖出与买回区间</summary>
          <p>以下显示最近 {{ Math.min(20, ledger.system.exitReviews.length) }} 次卖出。各区间可能重叠，不相加冒充组合收益。</p>
          <ul>
            <li
              v-for="(review, index) in ledger.system.exitReviews.slice(-20)"
              :key="`${review.soldOn}:${index}`"
            >
              卖出 {{ review.soldOn }}，{{ review.boughtBackOn ? `买回 ${review.boughtBackOn}` : `截至 ${review.assessedUntil} 未买回` }}；区间错过上涨 {{ pct(review.missedRise) }}、避免下跌 {{ pct(review.avoidedDecline) }}，卖出费 {{ money(review.exitFee) }} 元、买回费 {{ money(review.reentryFee) }} 元。
            </li>
          </ul>
        </details>
        <p>{{ ledger.system.assumption }}</p>
        <ul>
          <li
            v-for="limit in ledger.comparisonLimitations"
            :key="limit"
          >
            {{ limit }}
          </li>
        </ul>
      </template>
    </template>
    <p
      v-if="busy && !effects"
      role="status"
    >
      正在读取真实留档与模拟账本…
    </p>
  </section>
</template>
<style scoped>
.effect-table-wrap { overflow-x: auto; } table { border-collapse: collapse; width: 100%; } th,td { padding: .65rem; text-align: right; white-space: nowrap; border-bottom: 1px solid #dce5df; } summary { cursor: pointer; padding-block: .7rem; }
.effect-panel { overflow-wrap: anywhere; }.effect-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(min(100%,240px),1fr)); gap: 16px; }.effect-grid article { padding: 20px; border: 1px solid #dce5df; border-radius: 12px; background: #fff; }.effect-grid strong { font-size: 22px; }.effect-filters { display: flex; flex-wrap: wrap; align-items: end; gap: 12px; }.effect-filters label { display: grid; gap: 6px; }.effect-filters input,.effect-filters button { min-height: 44px; max-width: 100%; }.effect-panel p { line-height: 1.7; }.effect-panel h2 { margin-top: 24px; }
</style>
