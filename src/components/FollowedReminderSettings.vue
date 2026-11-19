<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import FundAlertRules from '@/components/FundAlertRules.vue'
import PredictionHistoryDrawer from '@/components/PredictionHistoryDrawer.vue'
import ReminderSettingsTable from '@/components/ReminderSettingsTable.vue'
import { getAlertRules } from '@/api/alerts'
import { getWatchlist } from '@/api/watchlist'
import { useAuthStore } from '@/stores/auth'
import type { AlertRule } from '@/types/alert'
import type { WatchlistItem } from '@/types/watchlist'

const auth = useAuthStore()
const funds = ref<WatchlistItem[]>([])
const rules = ref<AlertRule[]>([])
const loading = ref(true)
const error = ref('')
const editingCode = ref('')
const saving = ref(false)
const columns = [
  { type: 'EVENT', label: '基金相关事项' },
  { type: 'SIGNAL_CHANGE', label: '走势判断变化' },
] as const
let generation = 0

const rows = computed(() => {
  const byFund = new Map<string, Set<AlertRule['ruleType']>>()
  for (const rule of rules.value) {
    if (!rule.enabled) continue
    const types = byFund.get(rule.fundCode) ?? new Set<AlertRule['ruleType']>()
    types.add(rule.ruleType)
    byFund.set(rule.fundCode, types)
  }
  return funds.value.map(({ fundCode, fundName }) => ({
    fundCode,
    fundName,
    values: columns.map(({ type }) =>
      byFund.get(fundCode)?.has(type) ? '已开启' : '已关闭',
    ),
  }))
})
const editingFund = computed(() => funds.value.find(fund => fund.fundCode === editingCode.value))

async function loadFunds(run: number) {
  const result = new Map<string, WatchlistItem>()
  for (let page = 1; run === generation; page++) {
    const response = await getWatchlist({ page, pageSize: 50 })
    for (const item of response.items) result.set(item.fundCode, item)
    if (response.page >= response.totalPages || !response.items.length) break
  }
  return [...result.values()]
}

async function load() {
  const run = ++generation
  loading.value = true
  error.value = ''
  try {
    const [fundList, ruleList] = await Promise.all([loadFunds(run), getAlertRules()])
    if (run !== generation) return
    funds.value = fundList
    rules.value = ruleList
  } catch {
    if (run === generation) error.value = '关注基金或提醒设置暂时无法读取。'
  } finally {
    if (run === generation) loading.value = false
  }
}

function updateRow(rule: AlertRule) {
  rules.value = [...rules.value.filter(item => item.fundCode !== rule.fundCode || item.ruleType !== rule.ruleType), rule]
}

function closeDrawer() {
  if (!saving.value) editingCode.value = ''
}

void load()
onBeforeUnmount(() => { generation++ })
</script>

<template>
  <ReminderSettingsTable
    id="followed-reminder-title"
    title="关注提醒设置"
    description="按基金管理提醒接收开关，关注状态保持不变。"
    :columns="columns.map(column => column.label)"
    :rows="rows"
    :loading="loading"
    :error="error"
    empty-message="当前没有关注基金。"
    @retry="load"
    @settings="editingCode = $event"
  >
    <PredictionHistoryDrawer
      v-if="editingFund"
      :title="editingFund.fundName + '（' + editingFund.fundCode + '）'"
      close-label="关闭关注提醒设置"
      :close-disabled="saving"
      @close="closeDrawer"
    >
      <FundAlertRules
        :key="editingFund.fundCode"
        :fund-code="editingFund.fundCode"
        :read-only="!auth.hasPermission('ALERT_RULE_SELF_WRITE')"
        followed
        allow-create
        @saved="updateRow"
        @busy-change="saving = $event"
      />
    </PredictionHistoryDrawer>
  </ReminderSettingsTable>
</template>
