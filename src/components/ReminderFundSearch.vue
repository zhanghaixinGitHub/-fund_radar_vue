<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  id: string
  label: string
  options: readonly { fundCode: string; fundName?: string }[]
  fundCode: string
  disabled?: boolean
  emptyMessage: string
}>()
const emit = defineEmits<{ select: [code?: string] }>()
const keyword = ref('')
const searchOpen = ref(false)
const searchInput = ref<globalThis.HTMLInputElement | null>(null)

const selectedFund = computed(() => props.options.find(item => item.fundCode === props.fundCode))
const selectedFundLabel = computed(() => {
  const fund = selectedFund.value
  return fund && !props.disabled ? fundLabel(fund) : ''
})
const searchValue = computed({
  get: () => searchOpen.value ? keyword.value : selectedFundLabel.value,
  set: (value: string) => {
    keyword.value = value
    searchOpen.value = true
  },
})
const matchingFunds = computed(() => {
  const term = keyword.value.trim().toLowerCase()
  return props.options.filter(item =>
    item.fundCode.includes(term) || item.fundName?.toLowerCase().includes(term),
  )
})

function fundLabel(fund: { fundCode: string; fundName?: string }): string {
  return fund.fundName ? `${fund.fundName}（${fund.fundCode}）` : fund.fundCode
}

function openSearch(): void {
  if (searchOpen.value) return
  keyword.value = ''
  searchOpen.value = true
}

function closeSearch(event: globalThis.FocusEvent): void {
  if (!(event.currentTarget as globalThis.HTMLElement).contains(event.relatedTarget as globalThis.Node | null)) {
    searchOpen.value = false
  }
}

function dismissSearch(): void {
  searchInput.value?.focus()
  searchOpen.value = false
}

function selectFund(code?: string): void {
  keyword.value = ''
  dismissSearch()
  emit('select', code)
}

</script>

<template>
  <div
    class="fund-filter-toolbar reminder-fund-search"
    @focusout="closeSearch"
    @keydown.esc.stop.prevent="dismissSearch"
  >
    <div class="fund-filter-search">
      <label class="visually-hidden" :for="id">{{ label }}</label>
      <svg class="fund-filter-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
      </svg>
      <input
        :id="id"
        ref="searchInput"
        v-model="searchValue"
        :class="{ 'reminder-fund-search-selected': !searchOpen }"
        :title="searchOpen ? undefined : selectedFundLabel"
        maxlength="50"
        placeholder="基金代码或名称，例如：000001"
        type="search"
        :disabled="disabled"
        @focus="openSearch"
        @click="openSearch"
      >
      <div v-if="searchOpen" class="reminder-fund-results">
        <button
          v-for="fund in matchingFunds"
          :key="fund.fundCode"
          type="button"
          :aria-current="fund.fundCode === fundCode ? 'true' : undefined"
          @click="selectFund(fund.fundCode)"
        >
          {{ fundLabel(fund) }}
        </button>
        <p v-if="!matchingFunds.length" role="status">{{ emptyMessage }}</p>
        <button v-if="selectedFund" type="button" @click="selectFund()">清除选择</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reminder-fund-search.fund-filter-toolbar { display: grid; margin: 0; width: 100%; }
.reminder-fund-search-selected:not(:focus) { text-overflow: ellipsis; }
.reminder-fund-results {
  position: absolute;
  z-index: 2;
  inset: calc(100% + 4px) 0 auto;
  max-height: 16rem;
  overflow-y: auto;
  border: 1px solid var(--ui-line);
  border-radius: 8px;
  background: var(--ui-surface);
}
.reminder-fund-results button {
  display: block;
  width: 100%;
  min-height: 44px;
  padding: 8px 12px;
  border: 0;
  background: transparent;
  color: var(--ui-ink);
  font: inherit;
  text-align: start;
  white-space: normal;
}
.reminder-fund-results button[aria-current] { font-weight: 700; }
.reminder-fund-results button:hover,
.reminder-fund-results button:focus-visible { background: var(--ui-canvas); }
.reminder-fund-results button:focus-visible { outline-offset: -2px; }
.reminder-fund-results p { padding: 12px; }
</style>
