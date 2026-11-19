<script setup lang="ts">
import { computed, ref } from 'vue'
import ListPagination from '@/components/ListPagination.vue'
import ReminderFundSearch from '@/components/ReminderFundSearch.vue'

const props = defineProps<{
  id: string
  title: string
  description: string
  columns: readonly string[]
  rows: readonly { fundCode: string; fundName?: string; values: string[] }[]
  loading: boolean
  error: string
  emptyMessage: string
}>()
const emit = defineEmits<{ settings: [code: string]; retry: [] }>()
const selectedCode = ref('')
const pageNumber = ref(1)
const pageSize = ref(10)
const selectedFund = computed(() => props.rows.find(row => row.fundCode === selectedCode.value))
const filteredRows = computed(() => selectedFund.value ? [selectedFund.value] : props.rows)
const page = computed(() => Math.min(pageNumber.value, Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value))))
const visibleRows = computed(() => filteredRows.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))
const searchOptions = computed(() => [...props.rows].sort((a, b) => a.fundCode.localeCompare(b.fundCode)))

function selectFund(code?: string) {
  selectedCode.value = code ?? ''
  pageNumber.value = 1
}
</script>

<template>
  <section class="notification-card" :aria-labelledby="id">
    <header class="reminder-table-heading">
      <div>
        <h2 :id="id">{{ title }}</h2>
        <p class="sim-muted">{{ description }}</p>
      </div>
      <ReminderFundSearch
        :id="id + '-fund'"
        label="按基金名称或代码筛选"
        :options="searchOptions"
        :fund-code="selectedFund?.fundCode ?? ''"
        :disabled="loading || !!error"
        empty-message="没有匹配的基金"
        @select="selectFund"
      />
    </header>
    <p v-if="loading" class="state-message" role="status">正在读取基金和提醒设置…</p>
    <p v-else-if="error" class="state-message error-message" role="alert">
      {{ error }}
      <button class="text-button" type="button" @click="emit('retry')">重试</button>
    </p>
    <p v-else-if="!visibleRows.length" class="state-message">{{ emptyMessage }}</p>
    <template v-else>
      <div class="reminder-table-scroll" tabindex="0" :aria-label="title">
        <table class="reminder-table" :aria-labelledby="id">
          <thead>
            <tr>
              <th scope="col">基金</th>
              <th v-for="column in columns" :key="column" scope="col">{{ column }}</th>
              <th scope="col">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in visibleRows" :key="row.fundCode">
              <th scope="row">
                <strong v-if="row.fundName">{{ row.fundName }}</strong>
                <span>{{ row.fundCode }}</span>
              </th>
              <td v-for="(value, index) in row.values" :key="columns[index]">{{ value }}</td>
              <td>
                <button
                  class="secondary-button"
                  type="button"
                  aria-haspopup="dialog"
                  :aria-label="'设置 ' + (row.fundName || row.fundCode) + ' 的提醒'"
                  @click="emit('settings', row.fundCode)"
                >设置</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ListPagination
        :page="page"
        :page-size="pageSize"
        :total="filteredRows.length"
        :label="title + '分页'"
        @change="(value, size) => { pageNumber = value; pageSize = size }"
      />
    </template>
    <slot />
  </section>
</template>

<style scoped>
.reminder-table-heading {
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(300px, 48%, 520px);
  align-items: center;
  gap: 16px;
  padding-bottom: 20px;
}
.reminder-table-heading h2 { margin: 0 0 8px; }
.reminder-table-heading p { margin: 0; }
.reminder-table-scroll { overflow-x: auto; }
.reminder-table { width: 100%; border-collapse: collapse; text-align: start; }
.reminder-table :is(th, td) { padding: 12px; border-block-end: 1px solid var(--ui-line); text-align: start; }
.reminder-table thead { background: var(--ui-canvas); }
.reminder-table th[scope="row"] { overflow-wrap: anywhere; }
.reminder-table td, .reminder-table th[scope="col"]:not(:first-child) { white-space: nowrap; }
.reminder-table th[scope="row"] span { display: block; color: var(--ui-muted); font-weight: 400; }
.reminder-table :is(th, td):last-child { text-align: end; }
.reminder-table button { min-height: 40px; }
@media (max-width: 800px) {
  .reminder-table-heading { grid-template-columns: minmax(0, 1fr); gap: 12px; }
}
</style>
