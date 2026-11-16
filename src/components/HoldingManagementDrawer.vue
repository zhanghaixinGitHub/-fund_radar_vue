<script setup lang="ts">
import { simMoney } from '@/utils/simulation'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import DecisionPanelV2 from '@/components/DecisionPanelV2.vue'
import type { DecisionReport } from '@/types/multiPrediction'
import type { SimPlan } from '@/types/simulation'
import type { PortfolioListItem } from '@/utils/portfolioList'

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
const dialog = ref<globalThis.HTMLDialogElement | null>(null)
const titleId = computed(() => `holding-drawer-title-${props.position.fundCode}`)
const planLabels = { ACTIVE: '执行中', PAUSED: '已暂停', ENDED: '已结束' }
const subtitle = computed(() => {
  const position = props.position
  if (position.kind === 'recorded') return `${position.fundCode} · ${position.navDate ? `净值 ${position.navDate} / ${simMoney(position.unitNav)}` : '等待首笔交易确认'}`
  if (position.kind === 'confirmed') return `${position.fundCode}${position.dataAsOfDate ? ` · 截至 ${position.dataAsOfDate}` : ''}`
  return position.fundCode
})
const statusLabel = computed(() => {
  if (props.plan) return `定投${planLabels[props.plan.status]}`
  const position = props.position
  return position.kind === 'recorded' && Number(position.shares) === 0 && (Number(position.totalBuy) > 0 || position.estimatedShares) ? '已清仓' : ''
})
const earningsTarget = computed(() => ({
  name: 'portfolio-earnings',
  query: { fundCode: props.position.fundCode, from: route.fullPath },
}))
const ordersTarget = computed(() => ({ path: route.path, query: { section: 'orders', fundCode: props.position.fundCode } }))
const fullDetailTarget = computed(() => `/watchlist/${props.position.fundCode}`)
const showEarnings = computed(() => props.position.kind === 'recorded' || (props.position.kind === 'confirmed' && !!props.position.additionalPosition))
const buyLabel = computed(() => props.position.kind === 'recorded' && Number(props.position.shares) <= 0 ? '买入' : '加仓')

function outside(event: globalThis.MouseEvent) {
  if (event.target !== dialog.value) return
  const rect = dialog.value?.getBoundingClientRect()
  if (rect && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) emit('close')
}
onMounted(() => dialog.value?.showModal())
onBeforeUnmount(() => dialog.value?.close())
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
      <span>持仓管理</span>
      <button
        type="button"
        class="secondary-button"
        aria-label="关闭持仓管理"
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

    <section
      v-if="position.kind !== 'unrecorded'"
      class="holding-drawer-section"
      aria-label="持仓操作"
    >
      <h3>持仓操作</h3>
      <div class="holding-drawer-actions">
        <button
          v-if="canWrite"
          class="secondary-button holding-drawer-action"
          type="button"
          :disabled="position.kind === 'recorded' && !!position.issue"
          @click="emit('trade', 'BUY')"
        >
          {{ buyLabel }}
        </button>
        <button
          v-if="canWrite && (position.kind === 'recorded' || position.additionalPosition)"
          class="secondary-button holding-drawer-action"
          type="button"
          :disabled="position.kind === 'recorded' ? !!position.issue || Number(position.availableShares) <= 0 : !!position.additionalPosition?.issue || Number(position.additionalPosition?.availableShares) <= 0"
          @click="emit('trade', 'SELL')"
        >
          卖出
        </button>
        <button
          v-if="canPlan"
          class="secondary-button holding-drawer-action"
          type="button"
          @click="emit('trade', 'PLAN')"
        >
          {{ plan ? '管理定投' : '设置定投' }}
        </button>
        <RouterLink
          v-if="position.kind === 'recorded'"
          class="secondary-button holding-drawer-action"
          :to="ordersTarget"
          @click="emit('close')"
        >
          交易记录
        </RouterLink>
      </div>
    </section>

    <section
      class="holding-drawer-section"
      :aria-label="position.kind === 'unrecorded' ? '基金资料' : '收益与分析'"
    >
      <h3>{{ position.kind === 'unrecorded' ? '基金资料' : '收益与分析' }}</h3>
      <RouterLink
        v-if="showEarnings"
        class="holding-drawer-link"
        :to="earningsTarget"
        @click="emit('close')"
      >
        查看收益明细 <span aria-hidden="true">›</span>
      </RouterLink>
      <RouterLink
        v-if="position.kind !== 'recorded'"
        class="holding-drawer-link"
        :to="fullDetailTarget"
        @click="emit('close')"
      >
        查看完整基金资料 <span aria-hidden="true">›</span>
      </RouterLink>
      <DecisionPanelV2
        v-if="position.kind === 'recorded'"
        :fund-code="position.fundCode"
        :initial-report="initialReport"
        compact
      />
    </section>
    <p
      v-if="position.kind !== 'unrecorded'"
      class="holding-drawer-simulation"
    >
      买入、卖出和定投均为模拟账户操作
    </p>
  </dialog>
</template>

<style scoped>
.holding-management-drawer .holding-drawer-title { margin: 0 0 10px; font-size: 20px; line-height: 1.5; overflow-wrap: anywhere; }
.holding-drawer-badge { margin-top: 16px; }
.holding-drawer-notice { margin: 22px 0 0; color: var(--ui-muted); font-size: 14px; line-height: 1.8; }
.holding-drawer-section { margin-top: 26px; padding-top: 24px; border-top: 1px solid var(--ui-line); }
.holding-drawer-section h3 { margin: 0 0 16px; font-size: 16px; }
.holding-drawer-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.holding-drawer-action { display: flex; align-items: center; justify-content: center; min-height: 40px; padding: 8px 12px; text-align: center; text-decoration: none; }
.holding-drawer-action:hover:not(:disabled) { color: var(--ui-ink); background: #dde7d6; border-color: #a5b79e; }
.holding-drawer-link { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 0; border-bottom: 1px solid var(--ui-line); color: var(--ui-primary); font-size: 14px; text-decoration: none; }
.holding-drawer-simulation { margin: 32px 0 0; padding: 15px; border-radius: 8px; background: var(--ui-canvas); color: var(--ui-muted); font-size: 12px; text-align: center; }
.holding-management-drawer :deep(.decision-panel) { padding: 0; margin: 20px 0 0; border: 0; background: transparent; }
.holding-management-drawer :deep(.decision-panel .section-heading) { display: block; }
.holding-management-drawer :deep(.decision-panel h2) { margin: 0 0 12px; font-size: 18px; }
.holding-management-drawer :deep(.decision-panel .section-heading .primary-button) { width: 100%; margin-top: 8px; color: var(--ui-primary); background: #fff; border-color: #cbd8c9; }
.holding-management-drawer :deep(.decision-panel .section-heading .primary-button:hover:not(:disabled)) { color: var(--ui-ink); background: #dde7d6; border-color: #a5b79e; }
.holding-management-drawer :deep(.decision-panel > a) { display: inline-block; margin-top: 16px; color: var(--ui-primary); text-decoration: none; }
@media (max-width: 720px) {
  .holding-drawer-actions { gap: 10px; }
  .holding-drawer-action { min-height: 44px; }
}
</style>
