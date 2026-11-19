<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { readScrollMemory, saveScrollMemory, workspaceScrollKey } from '@/utils/workspaceScroll'
import { useRoute } from 'vue-router'
import DecisionPanelV2 from '@/components/DecisionPanelV2.vue'
import { getFundDetail } from '@/api/funds'
import { usePortfolioRequest } from '@/composables/usePortfolioRequest'
import { useAuthStore } from '@/stores/auth'
import type { FundDetail } from '@/types/fund'
import type { DecisionReport } from '@/types/multiPrediction'
import type { SimPlan } from '@/types/simulation'
import type { PortfolioListItem } from '@/utils/portfolioList'
import { formatChangeRate, fundTypeLabel } from '@/utils/fundPresentation'
import { simMoney, simTone } from '@/utils/simulation'
import { earningsMoney } from '@/utils/simulationEarnings'

const props = defineProps<{
  position: PortfolioListItem
  plan: SimPlan | null
  initialReport: DecisionReport | null
  canWrite: boolean
  canPlan: boolean
}>()
const emit = defineEmits<{
  close: []
  trade: [mode: 'BUY' | 'SELL' | 'PLAN']
}>()
const route = useRoute()
const auth = useAuthStore()
const fundRequest = usePortfolioRequest<FundDetail | null>(
  () => getFundDetail(props.position.fundCode), null, '基金资料暂时无法读取。',
)
const { data: fund } = fundRequest
const scrollKey = `holding:${workspaceScrollKey(route.fullPath)}:${props.position.fundCode}`
const dialog = ref<globalThis.HTMLDialogElement | null>(null)
const titleId = computed(() => `holding-drawer-title-${props.position.fundCode}`)
const planLabels = { ACTIVE: '执行中', PAUSED: '已暂停', ENDED: '已结束' }
const subtitle = computed(() => {
  const position = props.position
  return [position.fundCode, fund.value ? fundTypeLabel(fund.value.fundType) : '',
    position.kind === 'confirmed' && position.dataAsOfDate ? `持仓截至 ${position.dataAsOfDate}` : ''].filter(Boolean).join(' · ')
})
const fundNav = computed(() => {
  const position = props.position
  if (fund.value?.unitNav != null) return { value: fund.value.unitNav, date: fund.value.navAnnDate || fund.value.asOfDate }
  if (position.kind === 'recorded' && position.unitNav != null) return { value: position.unitNav, date: position.navDate }
  return null
})
const statusLabel = computed(() => {
  if (props.plan) return `定投${planLabels[props.plan.status]}`
  const position = props.position
  return position.kind === 'recorded' && Number(position.shares) === 0 && (Number(position.totalBuy) > 0 || position.estimatedShares) ? '已清仓' : ''
})
const fullDetailTarget = computed(() => ({
  name: 'portfolio-fund-detail',
  params: { fundCode: props.position.fundCode },
  query: { from: route.fullPath },
}))
const buyLabel = computed(() => props.position.kind === 'recorded' && Number(props.position.shares) <= 0 ? '买入' : '加仓')

function outside(event: globalThis.MouseEvent) {
  if (event.target !== dialog.value) return
  const rect = dialog.value?.getBoundingClientRect()
  if (rect && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) emit('close')
}
onMounted(async () => {
  dialog.value?.showModal()
  if (auth.hasPermission('FUND_READ')) void fundRequest.load()
  await nextTick()
  if (dialog.value) dialog.value.scrollTop = readScrollMemory(scrollKey)
})
onBeforeUnmount(() => {
  if (dialog.value) saveScrollMemory(scrollKey, dialog.value.scrollTop)
  dialog.value?.close()
})
</script>

<template>
  <dialog
    ref="dialog"
    class="fund-quick-drawer holding-management-drawer"
    :aria-labelledby="titleId"
    @click="outside"
    @cancel.prevent="emit('close')"
  >
    <header class="quick-drawer-header">
      <span>快速查看</span>
      <button
        type="button"
        class="secondary-button"
        aria-label="关闭快速查看"
        @click="emit('close')"
      >
        关闭
      </button>
    </header>
    <h2
      :id="titleId"
      class="holding-drawer-title"
    >
      {{ position.fundName }}
    </h2>
    <p class="quick-drawer-caption">
      {{ subtitle }}
    </p>
    <p
      v-if="fundNav"
      class="quick-drawer-caption"
    >
      单位净值 {{ simMoney(fundNav.value) }} · {{ fundNav.date || '日期暂缺' }}
    </p>
    <span
      v-if="statusLabel"
      class="sim-badge holding-drawer-badge"
    >{{ statusLabel }}</span>

    <p
      v-if="position.kind === 'unrecorded'"
      class="holding-drawer-notice"
    >
      暂无模拟持仓数据，金额、份额和收益暂不可用。
    </p>
    <p
      v-else-if="position.kind === 'confirmed'"
      class="holding-drawer-notice"
    >
      持仓份额待补全，暂不能更新全部持仓估值或卖出原持仓。
    </p>
    <p
      v-else-if="position.issue"
      class="notice-banner"
      role="status"
    >
      {{ position.issue }} 当前显示上次有效估值。
    </p>

    <dl class="quick-drawer-metrics holding-quick-metrics">
      <div><dt>持有金额（元）</dt><dd>{{ simMoney(position.marketValue) }}</dd></div>
      <div>
        <dt>昨日收益（元）</dt><dd :class="simTone(position.kind !== 'unrecorded' ? position.yesterdayGain : null)">
          {{ earningsMoney(position.kind !== 'unrecorded' ? position.yesterdayGain : null) }}
        </dd>
      </div>
      <div>
        <dt>持有收益（元）</dt><dd :class="simTone(position.holdingGain)">
          {{ earningsMoney(position.holdingGain) }}
        </dd>
      </div>
      <div>
        <dt>持有收益率</dt><dd :class="simTone(position.holdingGain)">
          {{ formatChangeRate(position.kind !== 'unrecorded' ? position.holdingGainRate : null) }}
        </dd>
      </div>
    </dl>
    <div class="quick-drawer-actions">
      <RouterLink
        class="primary-link holding-action-button"
        :to="fullDetailTarget"
      >
        查看详情
      </RouterLink>
    </div>
    <section
      v-if="position.kind !== 'unrecorded'"
      class="holding-drawer-section"
      aria-label="持仓操作"
    >
      <h3>持仓操作</h3>
      <div class="holding-drawer-actions">
        <button
          v-if="canWrite"
          class="secondary-button holding-action-button"
          type="button"
          :disabled="position.kind === 'recorded' && !!position.issue"
          @click="emit('trade', 'BUY')"
        >
          {{ buyLabel }}
        </button>
        <button
          v-if="canWrite && (position.kind === 'recorded' || position.additionalPosition)"
          class="secondary-button holding-action-button"
          type="button"
          :disabled="position.kind === 'recorded' ? !!position.issue || Number(position.availableShares) <= 0 : !!position.additionalPosition?.issue || Number(position.additionalPosition?.availableShares) <= 0"
          @click="emit('trade', 'SELL')"
        >
          卖出
        </button>
        <button
          v-if="canPlan"
          class="secondary-button holding-action-button"
          type="button"
          @click="emit('trade', 'PLAN')"
        >
          {{ plan ? '管理定投' : '设置定投' }}
        </button>
      </div>
    </section>

    <details
      v-if="position.kind === 'recorded'"
      class="holding-drawer-section"
    >
      <summary>持仓分析</summary>
      <DecisionPanelV2
        :fund-code="position.fundCode"
        :initial-report="initialReport"
        compact
      />
    </details>
    <p
      v-if="position.kind !== 'unrecorded'"
      class="holding-drawer-simulation"
    >
      买入、卖出和定投均为模拟账户操作
    </p>
  </dialog>
</template>

<style scoped>
.holding-management-drawer .quick-drawer-header { margin-bottom: 20px; }
.holding-management-drawer .holding-drawer-title { margin: 0 0 8px; font-size: 20px; line-height: 1.5; overflow-wrap: anywhere; }
.holding-management-drawer .quick-drawer-caption { margin: 0 0 8px; }
.holding-drawer-badge { margin-top: 12px; }
.holding-drawer-notice { margin: 22px 0 0; color: var(--ui-muted); font-size: 14px; line-height: 1.8; }
.holding-drawer-section { margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--ui-line); }
.holding-drawer-section h3 { margin: 0 0 12px; font-size: 16px; }
.holding-drawer-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.holding-management-drawer .holding-quick-metrics { row-gap: 12px; margin: 16px 0 12px; }
.holding-quick-metrics dd { margin: 6px 0 0; }
.holding-management-drawer .quick-drawer-actions { margin-top: 16px; }
.holding-drawer-section summary { cursor: pointer; color: var(--ui-primary); }
.holding-drawer-simulation { margin: 32px 0 0; padding: 15px; border-radius: 8px; background: var(--ui-canvas); color: var(--ui-muted); font-size: 12px; text-align: center; }
.holding-management-drawer :deep(.decision-panel) { padding: 0; margin: 20px 0 0; border: 0; background: transparent; }
.holding-management-drawer :deep(.decision-panel .section-heading) { display: block; }
.holding-management-drawer :deep(.decision-panel h2) { margin: 0 0 12px; font-size: 18px; }
.holding-management-drawer :deep(.decision-panel .section-heading .primary-button) { width: 100%; margin-top: 8px; color: var(--ui-primary); background: #fff; border-color: #cbd8c9; }
.holding-management-drawer :deep(.decision-panel .section-heading .primary-button:hover:not(:disabled)) { color: var(--ui-ink); background: #dde7d6; border-color: #a5b79e; }
.holding-management-drawer :deep(.decision-panel > .holding-action-button) { margin-top: 16px; }
</style>
