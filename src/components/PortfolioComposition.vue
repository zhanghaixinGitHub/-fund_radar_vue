<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { CSSProperties } from 'vue'
import type { SimComposition, SimCompositionItem, SimCompositionView } from '@/types/simulation'
import { simMoney } from '@/utils/simulation'
import CompositionSourceDrawer from '@/components/CompositionSourceDrawer.vue'

const props = defineProps<{ data: SimComposition | null; loading: boolean; error: string }>()
const emit = defineEmits<{ retry: [] }>()
const route = useRoute()
const router = useRouter()
const views = [
  { id: 'assets', label: '实际资产' },
  { id: 'industries', label: '股票行业' },
  { id: 'themes', label: '主题分布' },
] as const
type ViewId = (typeof views)[number]['id']
const active = computed<ViewId>(() => views.find(view => view.id === route.query.composition)?.id ?? 'assets')
const currentView = computed<SimCompositionView | null>(() => props.data?.[active.value] ?? null)
const currentLabel = computed(() => views.find(view => view.id === active.value)?.label ?? '实际资产')
const expandedIndustries = ref(false)
const selected = ref<SimCompositionItem | null>(null)
let returnFocus: globalThis.HTMLElement | null = null

function percent(value: string | number | null) { return value == null ? '—' : `${Number(value).toFixed(2)}%` }
function reportRange(view: SimCompositionView) {
  if (!view.reportStart) return '报告日期待补充'
  return view.reportStart === view.reportEnd ? `报告截至 ${view.reportStart}` : `报告截至 ${view.reportStart} 至 ${view.reportEnd}`
}
function selectView(id: ViewId) {
  selected.value = null
  expandedIndustries.value = false
  void router.replace({ path: route.path, query: { ...route.query, composition: id === 'assets' ? undefined : id } })
}
function tabKeydown(event: globalThis.KeyboardEvent, index: number) {
  const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']
  if (!keys.includes(event.key)) return
  event.preventDefault()
  const target = event.key === 'Home' ? 0 : event.key === 'End' ? views.length - 1
    : event.key === 'ArrowLeft' ? (index + views.length - 1) % views.length : (index + 1) % views.length
  selectView(views[target].id)
  void nextTick(() => globalThis.document.getElementById(`composition-tab-${views[target].id}`)?.focus())
}
function openSource(item: SimCompositionItem, event: globalThis.MouseEvent) {
  returnFocus = event.currentTarget as globalThis.HTMLElement
  selected.value = item
}
function closeSource() {
  selected.value = null
  void nextTick(() => returnFocus?.focus())
}
function color(item: SimCompositionItem, index: number) {
  if (item.pending) return 'var(--chart-pending)'
  const assets: Record<string, string> = {
    STOCK: 'var(--chart-stock)', BOND: 'var(--chart-bond)', FUND: 'var(--chart-fund)', CASH_OTHER: 'var(--chart-cash)',
  }
  return assets[item.key] ?? `var(--chart-category-${(index % 8) + 1})`
}
function barStyle(item: SimCompositionItem, index: number): CSSProperties {
  const width = Math.min(100, Math.max(0, Number(item.weightPct)))
  return { '--bar-size': `${width}%`, '--bar-color': color(item, index) }
}
function mergedContributions(items: SimCompositionItem[]) {
  const contributions = new globalThis.Map<string, SimCompositionItem['contributions'][number]>()
  for (const contribution of items.flatMap(item => item.contributions)) {
    const existing = contributions.get(contribution.fundCode)
    if (existing) {
      existing.amount = String(Number(existing.amount) + Number(contribution.amount))
      existing.weightPct = String(Number(existing.weightPct) + Number(contribution.weightPct))
      const sources = new globalThis.Map(existing.sources.map(source => [`${source.fundCode}-${source.endDate}-${source.title}`, source]))
      for (const source of contribution.sources) sources.set(`${source.fundCode}-${source.endDate}-${source.title}`, source)
      existing.sources = [...sources.values()]
    } else {
      contributions.set(contribution.fundCode, { ...contribution, sources: [...contribution.sources] })
    }
  }
  return [...contributions.values()]
}
const visibleItems = computed(() => {
  const items = currentView.value?.items ?? []
  if (active.value !== 'industries' || expandedIndustries.value) return items
  const known = items.filter(item => !item.pending)
  const pending = items.filter(item => item.pending)
  if (known.length <= 5) return items
  const rest = known.slice(5)
  const other: SimCompositionItem = {
    key: 'OTHER_INDUSTRIES', name: '其他行业', description: '前五名以外的已披露行业。',
    amount: String(rest.reduce((sum, item) => sum + Number(item.amount), 0)),
    weightPct: String(rest.reduce((sum, item) => sum + Number(item.weightPct), 0)),
    pending: false, contributions: mergedContributions(rest), evidence: [],
  }
  return [...known.slice(0, 5), other, ...pending]
})
</script>

<template>
  <section
    class="portfolio-composition"
    aria-labelledby="portfolio-composition-title"
    :aria-busy="loading"
  >
    <div class="composition-heading">
      <div>
        <h2 id="portfolio-composition-title">
          持仓构成
        </h2>
        <p>按最近可核验报告估算，不代表实时持仓。</p>
      </div>
      <div
        class="composition-tabs"
        role="tablist"
        aria-label="持仓构成视图"
      >
        <button
          v-for="(view, index) in views"
          :id="`composition-tab-${view.id}`"
          :key="view.id"
          type="button"
          role="tab"
          :aria-selected="active === view.id"
          :aria-controls="'composition-panel'"
          :class="{ 'is-selected': active === view.id }"
          :tabindex="active === view.id ? 0 : -1"
          @click="selectView(view.id)"
          @keydown="tabKeydown($event, index)"
        >
          {{ view.label }}
        </button>
      </div>
    </div>
    <p
      v-if="loading && !data"
      class="composition-note"
      role="status"
    >
      正在读取持仓构成…
    </p>
    <div
      v-else-if="error && !data"
      class="composition-error"
      role="alert"
    >
      <span>{{ error }}</span><button
        type="button"
        class="secondary-button"
        @click="emit('retry')"
      >
        重试
      </button>
    </div>
    <template v-else-if="currentView">
      <div
        v-if="error"
        class="composition-error"
        role="alert"
      >
        <span>{{ error }} 当前保留上次成功结果。</span><button
          type="button"
          class="secondary-button"
          @click="emit('retry')"
        >
          重试
        </button>
      </div>
      <div
        v-if="Number(currentView.totalAmount) > 0"
        id="composition-panel"
        role="tabpanel"
        :aria-labelledby="`composition-tab-${active}`"
      >
        <div class="composition-summary">
          <span>{{ active === 'assets' ? '账户持有金额' : '已披露股票估算金额' }}<strong>{{ simMoney(currentView.totalAmount) }} 元</strong></span>
          <span>{{ reportRange(currentView) }}</span>
        </div>
        <p
          v-if="active === 'assets'"
          class="composition-note"
        >
          按账户持有金额加权，资产配置资料覆盖 {{ percent(currentView.coveragePct) }}；待补充不当作现金。
        </p>
        <p
          v-else-if="active === 'industries'"
          class="composition-note"
        >
          仅统计可确定股票金额的部分，不是整个账户；行业资料覆盖账户持有金额 {{ percent(currentView.coveragePct) }}。
        </p>
        <p
          v-else
          class="composition-note"
        >
          主题可重叠，比例合计不要求100%。有个股明细的账户金额覆盖 {{ percent(currentView.coveragePct) }}，其中主题对应覆盖 {{ percent(currentView.mappedCoveragePct) }}。
        </p>
        <ul class="composition-bars">
          <li
            v-for="(item, index) in visibleItems"
            :key="item.key"
          >
            <button
              type="button"
              @click="openSource(item, $event)"
            >
              <span class="composition-bar-label"><strong>{{ item.name }}</strong><span>{{ percent(item.weightPct) }} · {{ simMoney(item.amount) }} 元</span></span>
              <span
                class="composition-bar-track"
                aria-hidden="true"
              ><span :style="barStyle(item, index)" /></span>
            </button>
          </li>
        </ul>
        <button
          v-if="active === 'industries' && currentView.items.filter(item => !item.pending).length > 5"
          type="button"
          class="composition-expand"
          @click="expandedIndustries = !expandedIndustries"
        >
          {{ expandedIndustries ? '收起行业' : '展开全部行业' }}
        </button>
        <p
          v-if="active === 'themes'"
          class="composition-note composition-scope-note"
        >
          仅说明当前已披露、已映射范围内的主题，不能据此认定未披露持仓没有这些主题。
        </p>
        <details
          v-if="currentView.excludedHoldings.length"
          class="composition-excluded"
        >
          <summary>查看未纳入本视图的基金（{{ currentView.excludedHoldings.length }}）</summary>
          <ul>
            <li
              v-for="holding in currentView.excludedHoldings"
              :key="holding.fundCode"
            >
              <span>{{ holding.fundName }} · {{ holding.fundCode }}</span><span>{{ holding.reason }} · {{ simMoney(holding.amount) }} 元</span>
            </li>
          </ul>
        </details>
      </div>
      <p
        v-else
        class="composition-note"
      >
        {{ Number(data?.accountAmount) === 0 ? '暂无正份额持有金额，暂不形成持仓构成。' : '暂时没有可形成此分布的已核验资料。' }}
      </p>
    </template>
    <CompositionSourceDrawer
      v-if="selected"
      :item="selected"
      :view-label="currentLabel"
      @close="closeSource"
    />
  </section>
</template>
