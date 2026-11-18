<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HoldingReminderPanel from '@/components/HoldingReminderPanel.vue'
import { getSimOverview } from '@/api/simulation'
import { useAuthStore } from '@/stores/auth'
import type { SimPosition } from '@/types/simulation'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const positions = ref<SimPosition[]>([])
const loading = ref(true)
const error = ref('')
let generation = 0
let alive = true

const fundCode = computed(() => {
  const value = String(route.query.fund ?? '')
  return /^\d{6}$/.test(value) ? value : ''
})
const heldPositions = computed(() => positions.value.filter(item => Number(item.shares) > 0)
  .sort((left, right) => left.fundCode.localeCompare(right.fundCode)))
const fundOptions = computed(() => {
  const options = [...heldPositions.value]
  if (fundCode.value && !options.some(item => item.fundCode === fundCode.value)) {
    const previousPosition = positions.value.find(item => item.fundCode === fundCode.value)
    options.push(previousPosition ?? { fundCode: fundCode.value, fundName: '基金' } as SimPosition)
  }
  return options
})
const canWrite = computed(() => auth.hasPermission('SIM_PORTFOLIO_SELF_WRITE'))

async function load(): Promise<void> {
  const run = ++generation
  loading.value = true
  error.value = ''
  try {
    const overview = await getSimOverview()
    if (!alive || run !== generation) return
    positions.value = overview.positions
  } catch {
    if (!alive || run !== generation) return
    positions.value = []
    error.value = '持仓基金暂时无法读取，请重试。'
  } finally {
    if (alive && run === generation) loading.value = false
  }
}

function selectFund(event: globalThis.Event): void {
  const value = (event.target as globalThis.HTMLSelectElement).value
  void router.replace({ query: { ...route.query, section: 'rules', fund: value || undefined } })
}

void load()
onBeforeUnmount(() => { alive = false; generation++ })
</script>

<template>
  <section
    class="notification-card holding-reminder-settings"
    aria-labelledby="holding-reminder-title"
  >
    <div class="holding-reminder-heading">
      <div>
        <h2 id="holding-reminder-title">
          持仓提醒
        </h2>
        <p class="sim-muted">
          按基金设置止盈和下跌提醒，达到数值后只提示复核，不会自动交易。
        </p>
      </div>
      <label for="holding-reminder-fund">持仓基金</label>
      <select
        id="holding-reminder-fund"
        :value="fundCode"
        :disabled="loading || !!error"
        @change="selectFund"
      >
        <option value="">
          请选择基金
        </option>
        <option
          v-for="fund in fundOptions"
          :key="fund.fundCode"
          :value="fund.fundCode"
        >
          {{ fund.fundName }}（{{ fund.fundCode }}）
        </option>
      </select>
    </div>
    <p
      v-if="loading"
      class="state-message"
      role="status"
    >
      正在读取持仓基金…
    </p>
    <p
      v-else-if="error"
      class="state-message error-message"
      role="alert"
    >
      {{ error }}
      <button
        class="secondary-button"
        type="button"
        @click="load"
      >
        重新读取
      </button>
    </p>
    <div
      v-else-if="!fundCode"
      class="sim-empty"
    >
      <strong>请选择要设置提醒的基金</strong>
      <p v-if="heldPositions.length">
        选择后可查看和修改这只基金的提醒。
      </p>
      <p v-else>
        当前没有正份额持仓，建立持仓后即可设置提醒。
      </p>
    </div>
    <HoldingReminderPanel
      v-else
      :fund-code="fundCode"
      :can-write="canWrite"
    />
  </section>
</template>

<style scoped>
.holding-reminder-heading { display: grid; grid-template-columns: minmax(0,1fr) auto minmax(220px,320px); gap: 16px; align-items: center; padding-bottom: 20px; border-bottom: 1px solid var(--ui-line); }
.holding-reminder-heading h2 { margin: 0 0 8px; }
.holding-reminder-heading p { margin: 0; }
.holding-reminder-heading label { font-weight: 700; }
.holding-reminder-heading select { width: 100%; min-height: 40px; padding: 8px 12px; box-sizing: border-box; border: 1px solid var(--ui-line); border-radius: 8px; background: var(--ui-surface); color: var(--ui-ink); font: inherit; }
.holding-reminder-settings .sim-empty { margin-top: 20px; }
.holding-reminder-settings .error-message .secondary-button { margin-left: 12px; }
@media(max-width: 800px) { .holding-reminder-heading { grid-template-columns: minmax(0,1fr); gap: 12px; } .holding-reminder-heading select { min-height: 44px; font-size: 16px; } }
</style>
