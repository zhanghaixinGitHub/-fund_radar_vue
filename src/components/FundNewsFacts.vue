<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { get } from '@/api/http'
import { getFundMaterials } from '@/api/fundMaterials'
import { holdingContext, newsHeading, readingPoints, type NewsFact } from '@/utils/newsFacts'

/** 只展示已经保存的公开事实；消息与预测依据分开，不在读取页面时触发采集。 */
interface NewsFacts {
  fundCode: string; checkedAt: string | null; complete: boolean; limitations: string[]
  items: NewsFact[]
}
const props = defineProps<{ fundCode: string }>()
const route = useRoute()
/** 公司经营页和持仓表均通过 stock 传递公司范围，直接打开或前进后退也沿用该范围。 */
const requestedStock = computed(() => typeof route.query.stock === 'string' ? route.query.stock : '')
const result = ref<NewsFacts | null>(null)
const busy = ref(false)
const error = ref('')
const page = ref(1)
const selectedCompany = ref('')
/** 链接指定的公司即使没有公告，也保留筛选项，不能悄悄退回全部公告。 */
const linkedCompany = ref<{ value: string; label: string } | null>(null)
const selectedCompanyLabel = computed(() => linkedCompany.value?.value === selectedCompany.value
  ? linkedCompany.value.label : selectedCompany.value)
const heading = ref<InstanceType<typeof globalThis.HTMLHeadingElement> | null>(null)
const pageSize = 8
const preparedItems = computed(() => (result.value?.items ?? [])
  .map(item => ({ ...item, ...newsHeading(item.title), points: readingPoints(item), context: holdingContext(item.relation) })))
// 沿用公告卡片中的关联公司，不把筛选选项解释为基金当前持仓；暂无要点的公司也保留，明确告知资料状态。
const companies = computed(() => {
  const options = new Map(preparedItems.value.filter(item => item.company).map(item => [item.company, item.company]))
  if (linkedCompany.value) options.set(linkedCompany.value.value, linkedCompany.value.label)
  return [...options].map(([value, label]) => ({ value, label }))
    .sort((left, right) => left.label.localeCompare(right.label, 'zh-CN'))
})
const filteredItems = computed(() => preparedItems.value
  .filter(item => !selectedCompany.value || item.company === selectedCompany.value))
const readableItems = computed(() => filteredItems.value.filter(item => item.points.length > 0))
// 没有可靠摘要的文件不继续占用正文卡片，统一说明数量，避免页面再次退化成标题目录。
const unavailableCount = computed(() => filteredItems.value.length - readableItems.value.length)
const pages = computed(() => Math.max(1, Math.ceil(readableItems.value.length / pageSize)))
const visibleItems = computed(() => readableItems.value.slice((page.value - 1) * pageSize, page.value * pageSize))
let sequence = 0
/** 翻页后把阅读起点和键盘焦点移回标题，避免用户停在下一页底部。 */
async function turnPage(delta: number) {
  page.value = Math.min(pages.value, Math.max(1, page.value + delta))
  await nextTick()
  heading.value?.focus({ preventScroll: true })
  heading.value?.scrollIntoView({ block: 'start' })
}
async function load() {
  const ticket = ++sequence
  const fundCode = props.fundCode
  const stockCode = requestedStock.value
  result.value = null; busy.value = true; error.value = ''; page.value = 1
  selectedCompany.value = ''; linkedCompany.value = null
  try {
    // 要点接口沿用公告标题中的公司简称；以同一基金的公司名单把股票代码准确映射到简称，不模糊匹配。
    // 只在链接指定公司时读取名单；名单读取失败则提示重试，避免展示其他公司的公告。
    const [value, materials] = await Promise.all([
      get<NewsFacts>(`/api/v1/funds/${encodeURIComponent(fundCode)}/news-facts`),
      stockCode ? getFundMaterials(fundCode) : Promise.resolve(null),
    ])
    if (ticket !== sequence) return
    if (value.fundCode !== fundCode || (materials && materials.fundCode !== fundCode)) throw new Error('基金资料归属不一致')
    if (stockCode) {
      const companyName = materials?.companies.find(company => company.stockCode === stockCode)?.stockName
      // 未识别的旧代码也保留独立空态，不把“无法识别公司”解释为“未选择公司”。
      linkedCompany.value = { value: companyName || stockCode, label: companyName || '所选公司' }
      selectedCompany.value = linkedCompany.value.value
    }
    result.value = value
  } catch {
    if (ticket === sequence) error.value = '近期消息暂时无法读取，请稍后重试。'
  } finally { if (ticket === sequence) busy.value = false }
}
// 筛选后从第一页开始，公告数量、分页和暂缺提示都使用相同的公司范围。
watch(selectedCompany, () => { page.value = 1 })
watch(() => [props.fundCode, requestedStock.value], load, { immediate: true })
onBeforeUnmount(() => ++sequence)
</script>

<template>
  <section
    class="news-facts"
    aria-labelledby="fund-news-title"
  >
    <header>
      <h2
        id="fund-news-title"
        ref="heading"
        tabindex="-1"
      >
        近期公告要点
      </h2>
      <span
        v-if="result"
        role="status"
      >{{ readableItems.length }} 条已整理公告</span>
    </header>
    <p
      v-if="busy"
      role="status"
    >
      消息加载中…
    </p>
    <p
      v-else-if="error"
      role="status"
    >
      {{ error }} <button
        type="button"
        @click="load"
      >
        重试
      </button>
    </p>
    <template v-else-if="result">
      <div
        v-if="companies.length"
        class="news-filters"
      >
        <label for="news-company-filter">
          关联公司
          <select
            id="news-company-filter"
            v-model="selectedCompany"
          >
            <option value="">全部公告</option>
            <option
              v-for="company in companies"
              :key="company.value"
              :value="company.value"
            >{{ company.label }}</option>
          </select>
        </label>
      </div>
      <p v-if="!readableItems.length">
        {{ selectedCompany ? `${selectedCompanyLabel}的公告暂未整理出可靠要点。` : '近期公告暂未整理出可靠要点。' }}
      </p>
      <article
        v-for="item in visibleItems"
        :key="item.eventId"
        class="news-item"
      >
        <div class="news-meta">
          <span
            v-if="item.company"
            class="news-company"
          >{{ item.company }}</span>
          <time :datetime="item.publishedDate">{{ item.publishedDate || '披露日期暂缺' }}</time>
        </div>
        <h3>{{ item.subject }}</h3>
        <ul class="news-points">
          <li
            v-for="point in item.points"
            :key="point"
          >
            {{ point }}
          </li>
        </ul>
        <p
          v-if="item.context"
          class="news-context"
        >
          {{ item.context }}
        </p>
      </article>
      <nav
        v-if="pages > 1"
        class="news-pagination"
        aria-label="近期消息翻页"
      >
        <button
          :disabled="page === 1"
          @click="turnPage(-1)"
        >
          上一页
        </button>
        <span>第 {{ page }} / {{ pages }} 页 · {{ readableItems.length }} 条</span>
        <button
          :disabled="page === pages"
          @click="turnPage(1)"
        >
          下一页
        </button>
      </nav>
      <p class="coverage-note">
        <span v-if="unavailableCount">另有 {{ unavailableCount }} 条公告暂未能提取可靠要点。</span>
        仅展示已取得的近期公告{{ result.complete ? '，未列出不代表没有重要事项。' : '，部分资料暂缺，未列出不代表没有重要事项。' }}
      </p>
    </template>
  </section>
</template>

<style scoped>
.news-facts { padding: 1.25rem 0; margin-bottom: 1rem; }
header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: .5rem; }
h2 { font-size: 1.05rem; margin: 0; scroll-margin-top: 7rem; }
.news-filters { display: flex; flex-wrap: wrap; margin-top: 1rem; }
.news-filters label { display: flex; flex-direction: column; gap: .4rem; font-size: .875rem; max-width: 100%; }
.news-filters select { min-width: 14rem; max-width: 100%; min-height: 2.75rem; padding: .55rem .8rem; border: 1px solid var(--color-border, #dce6e4); border-radius: .4rem; background: #fff; color: inherit; font: inherit; }
.news-filters select:focus-visible { outline: 2px solid var(--color-primary, #0f766e); outline-offset: 2px; }
.news-item { margin-top: 1rem; padding: 1.15rem 1.25rem; background: #fff; border: 1px solid var(--color-border, #dce6e4); border-radius: .65rem; }
.news-meta { display: flex; align-items: center; flex-wrap: wrap; gap: .65rem; font-size: .8rem; color: var(--color-text-secondary, #64748b); }
.news-company { font-weight: 650; color: var(--color-primary, #0f766e); }
h3 { margin: .45rem 0 .7rem; font-size: 1rem; font-weight: 650; line-height: 1.6; overflow-wrap: anywhere; }
.news-points { margin: 0; padding-left: 1.15rem; display: grid; gap: .4rem; }
.news-points li { padding-left: .2rem; line-height: 1.75; overflow-wrap: anywhere; font-size: .925rem; }
.news-points li::marker { color: var(--color-primary, #0f766e); }
.news-context { margin: .85rem 0 0; padding-top: .7rem; border-top: 1px solid #edf1f0; font-size: .78rem; color: var(--color-text-secondary, #64748b); line-height: 1.6; }
.coverage-note { margin: 1rem 0 0; color: var(--color-text-secondary, #64748b); font-size: .875rem; line-height: 1.7; }
header span { color: var(--color-text-secondary, #64748b); font-size: .8rem; }
.news-pagination { display: flex; flex-wrap: wrap; align-items: center; gap: .8rem; margin-top: 1rem; }
@media (max-width: 640px) {
  .news-filters label, .news-filters select { width: 100%; min-width: 0; }
  .news-item { padding: 1rem; }
  .news-meta { gap: .5rem; }
}
</style>
