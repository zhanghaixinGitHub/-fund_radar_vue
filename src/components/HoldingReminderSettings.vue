<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HoldingReminderPanel from '@/components/HoldingReminderPanel.vue'
import PredictionHistoryDrawer from '@/components/PredictionHistoryDrawer.vue'
import ReminderSettingsTable from '@/components/ReminderSettingsTable.vue'
import { fetchHoldingRules } from '@/api/advice'
import { getSimOverview } from '@/api/simulation'
import { useAuthStore } from '@/stores/auth'
import type { HoldingRule, HoldingRulesView } from '@/types/advice'
import type { SimPosition } from '@/types/simulation'
import { rulePctText } from '@/utils/advice'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const positions = ref<SimPosition[]>([])
const activeRules = ref(new Map<string, HoldingRule | null | 'unavailable'>())
const loading = ref(true)
const error = ref('')
const editingCode = ref('')
const saving = ref(false)
let generation = 0

const linkedCode = computed(() => {
  const code = route.query.fund
  return typeof code === 'string' && /^\d{6}$/.test(code) ? code : ''
})
const heldPositions = computed(() => positions.value.filter(item => Number(item.shares) > 0)
  .sort((left, right) => left.fundCode.localeCompare(right.fundCode)))
const rows = computed(() => heldPositions.value.map(({ fundCode, fundName }) => {
  const rule = activeRules.value.get(fundCode)
  const pending = rule === undefined ? '读取中…' : '读取失败'
  const values = rule === undefined || rule === 'unavailable'
    ? [pending, pending, pending]
    : [
        threshold(rule?.takeProfitPct),
        threshold(rule?.ruleParams?.downsideBasis === 'HOLDING_LOSS' ? rule.reduceDrawdownPct : null),
        threshold(rule?.ruleParams?.downsideBasis !== 'HOLDING_LOSS' ? rule?.reduceDrawdownPct : null),
      ]
  return { fundCode, fundName, values }
}))
const editingName = computed(() => {
  const fund = positions.value.find(item => item.fundCode === editingCode.value)
  return fund ? fund.fundName + '（' + editingCode.value + '）' : '基金 ' + editingCode.value
})
const canWrite = computed(() => auth.hasPermission('SIM_PORTFOLIO_SELF_WRITE'))

function threshold(value: string | number | null | undefined) {
  return value == null ? '未设置' : rulePctText(value)
}

async function load() {
  const run = ++generation
  loading.value = true
  error.value = ''
  try {
    const overview = await getSimOverview()
    if (run !== generation) return
    positions.value = overview.positions
    activeRules.value.clear()
  } catch {
    if (run === generation) error.value = '持仓基金暂时无法读取。'
    return
  } finally {
    if (run === generation) loading.value = false
  }

  const codes = heldPositions.value.map(item => item.fundCode)
  let index = 0
  async function readRules() {
    while (run === generation && index < codes.length) {
      const code = codes[index++]!
      let active: HoldingRule | null | 'unavailable'
      try {
        active = (await fetchHoldingRules(code)).active
      } catch {
        active = 'unavailable'
      }
      if (run === generation && !activeRules.value.has(code)) activeRules.value.set(code, active)
    }
  }
  await Promise.all(Array.from({ length: Math.min(4, codes.length) }, readRules))
}

function updateRow(view: HoldingRulesView) {
  activeRules.value.set(view.fundCode, view.active)
}

function closeDrawer() {
  editingCode.value = ''
  if (linkedCode.value) void router.replace({ query: { ...route.query, fund: undefined } })
}

watch(linkedCode, code => { editingCode.value = code }, { immediate: true })
void load()
onBeforeUnmount(() => { generation++ })
</script>

<template>
  <ReminderSettingsTable
    id="holding-reminder-title"
    title="持仓提醒设置"
    description="按基金设置止盈和下跌提醒，达到数值后只提示复核。"
    :columns="['止盈提醒', '持仓亏损提醒', '高点回撤提醒']"
    :rows="rows"
    :loading="loading"
    :error="error"
    empty-message="当前没有持仓基金。"
    @retry="load"
    @settings="editingCode = $event"
  >
    <PredictionHistoryDrawer
      v-if="editingCode && !loading && !error"
      :title="editingName"
      close-label="关闭持仓提醒设置"
      :close-disabled="saving"
      @close="closeDrawer"
    >
      <HoldingReminderPanel
        :key="editingCode"
        :fund-code="editingCode"
        :can-write="canWrite"
        inline-editor
        @busy-change="saving = $event"
        @rules-change="updateRow"
      />
    </PredictionHistoryDrawer>
  </ReminderSettingsTable>
</template>
