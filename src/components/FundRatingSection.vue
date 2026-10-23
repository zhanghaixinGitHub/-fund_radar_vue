<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { readFundRating, type RatingDetail } from '@/api/fundRating'
import { formatRatingScore, ratingLabel, ratingSourceUrl } from '@/utils/fundRating'

const props = defineProps<{ fundCode: string; ratingRef?: string }>()
const value = ref<RatingDetail | null>(null)
const loading = ref(false)
const error = ref(false)
const now = ref(Date.now())
let sequence = 0
let timer: ReturnType<typeof globalThis.setTimeout> | undefined
/** 定时器仅更新本地过期显示，不采集或计算；长有效期分段安排，避免整数上限截断。 */
function refreshExpiry() {
  globalThis.clearTimeout(timer)
  now.value = Date.now()
  const delay = value.value?.validUntil ? Date.parse(value.value.validUntil) - now.value : 0
  if (delay > 0) timer = globalThis.setTimeout(refreshExpiry, Math.min(delay + 1, 2_147_483_647))
}
async function load() {
  const ticket = ++sequence
  globalThis.clearTimeout(timer)
  value.value = null; loading.value = true; error.value = false
  try {
    const result = await readFundRating(props.fundCode, props.ratingRef)
    if (ticket !== sequence) return
    value.value = result
    refreshExpiry()
  } catch { if (ticket === sequence) error.value = true }
  finally { if (ticket === sequence) loading.value = false }
}
watch(() => [props.fundCode, props.ratingRef], load, { immediate: true })
onBeforeUnmount(() => { sequence++; globalThis.clearTimeout(timer) })
const label = computed(() => ratingLabel(value.value, loading.value, now.value))
const rated = computed(() => value.value?.status === 'RATED' && ['偏弱', '一般', '良好', '优质'].includes(label.value))
const partial = computed(() => value.value?.status === 'PARTIAL' && label.value === '部分评分')
const available = computed(() => partial.value || (value.value?.status === 'NOT_RATED' && !!value.value.scoreCoverage))
const sources = computed(() => [...new Map(value.value?.dimensions.flatMap(d => d.sources)
  .filter(s => ratingSourceUrl(s.url)).map(s => [s.url, s]) ?? []).values()])
</script>

<template>
  <section
    class="analysis-section rating-section"
    aria-labelledby="rating-title"
    :aria-busy="loading"
  >
    <div class="section-heading">
      <h2 id="rating-title">
        基金评级
      </h2>
      <div class="rating-result">
        <span
          v-if="partial && value?.scoreRange"
          class="rating-score"
        >综合评分范围约 {{ value.scoreRange.lower }}—{{ value.scoreRange.upper }} 分</span>
        <span
          v-else-if="partial && formatRatingScore(value?.partialScore)"
          class="rating-score"
        >可评部分 {{ formatRatingScore(value?.partialScore) }} 分</span>
        <span
          v-else-if="rated && formatRatingScore(value?.score)"
          class="rating-score"
        >
          综合评分 {{ formatRatingScore(value?.score) }} 分
        </span>
        <strong class="rating-level">{{ label }}</strong>
      </div>
    </div>
    <p
      v-if="loading"
      role="status"
    >
      正在读取基金评级…
    </p>
    <div
      v-else-if="error"
      role="alert"
    >
      <p>评级暂不可用，请稍后重试。</p>
      <button
        class="secondary-button"
        type="button"
        @click="load"
      >
        重新读取
      </button>
    </div>
    <template v-else-if="value">
      <p>{{ label === '评级待更新' ? '评级依据需要更新，当前不展示综合等级。' : value.summary }}</p>
      <p
        v-if="available && value.scoreCoverage"
        class="section-note"
      >
        已确定 {{ value.scoreCoverage.pointDimensions }}/8 个维度，权重覆盖 {{ value.scoreCoverage.pointWeight }}%；
        <template v-if="value.scoreCoverage.intervalDimensions">
          另有 {{ value.scoreCoverage.intervalDimensions }} 个维度保留范围，覆盖 {{ value.scoreCoverage.intervalWeight }}%；
        </template>
        未评分权重 {{ value.scoreCoverage.missingWeight }}%。部分分不代表完整总分。
      </p>
      <p class="section-note">
        {{ value.comparison.category }} · {{ value.comparison.scope }}
        <span v-if="value.comparison.productCount > 0"> · {{ value.comparison.productCount }} 个产品</span>
      </p>
      <p class="section-note">
        <span v-if="value.asOfDate">评价截至 {{ value.asOfDate }} · </span>{{ value.comparison.period }}
      </p>
      <p v-if="value.previousRating">
        上次评级：{{ value.previousRating.gradeLabel }}（{{ value.previousRating.asOfDate }}，已过有效期）
      </p>
      <div class="rating-dimensions">
        <article
          v-for="dimension in value.dimensions"
          :key="dimension.key"
          class="rating-dimension"
        >
          <div class="dimension-heading">
            <h3>{{ dimension.name }}</h3>
            <div class="dimension-result">
              <strong v-if="(rated || available) && formatRatingScore(dimension.score)">{{ formatRatingScore(dimension.score) }} 分</strong>
              <strong v-else-if="available && dimension.scoreRange">约 {{ dimension.scoreRange.lower }}—{{ dimension.scoreRange.upper }} 分</strong>
              <span>{{ rated ? dimension.gradeLabel : (available && (dimension.score || dimension.scoreRange)) ? '已评部分' : '资料待补齐' }}</span>
            </div>
          </div>
          <dl v-if="dimension.metrics.length">
            <div
              v-for="metric in dimension.metrics"
              :key="metric.name"
            >
              <dt>{{ metric.name }}</dt><dd>{{ metric.value }}{{ metric.unit }} <small>（{{ metric.period }}）</small></dd>
            </div>
          </dl>
          <p>{{ dimension.explanation }}</p>
        </article>
      </div>
      <div
        v-if="rated"
        class="rating-observations"
      >
        <div v-if="value.strengths.length">
          <h3>主要优势</h3><ul>
            <li
              v-for="item in value.strengths"
              :key="item.dimension"
            >
              {{ item.text }}
            </li>
          </ul>
        </div>
        <div v-if="value.weaknesses.length">
          <h3>主要不足</h3><ul>
            <li
              v-for="item in value.weaknesses"
              :key="item.dimension"
            >
              {{ item.text }}
            </li>
          </ul>
        </div>
      </div>
      <p
        v-if="value.dataDates.holdings || value.dataDates.fees"
        class="section-note"
      >
        <span v-if="value.dataDates.holdings">持仓及流动性资料截至 {{ value.dataDates.holdings }} </span>
        <span v-if="value.dataDates.manager"> · 经理资料核对 {{ value.dataDates.manager }}</span>
        <span v-if="value.dataDates.fees"> · 费用核对 {{ value.dataDates.fees }}</span>
      </p>
      <h3>资料限制</h3>
      <ul>
        <li
          v-for="note in value.limitations"
          :key="note"
        >
          {{ note }}
        </li>
      </ul>
      <p
        v-if="!rated"
        class="section-note"
      >
        历史评价不代表未来收益。
      </p>
      <div
        v-if="sources.length"
        class="rating-sources"
      >
        <h3>来源资料</h3>
        <ul>
          <li
            v-for="source in sources"
            :key="source.url"
          >
            <a
              :href="ratingSourceUrl(source.url)"
              target="_blank"
              rel="noopener noreferrer"
            >{{ source.title }}</a><span v-if="source.publishedOn"> · {{ source.publishedOn }}</span>
          </li>
        </ul>
      </div>
    </template>
  </section>
</template>

<style scoped>
.rating-level { color: #3e4c78; background: #edf0f8; border-radius: 8px; padding: 6px 12px; }
.rating-result, .dimension-result { display: flex; align-items: baseline; justify-content: flex-end; gap: 12px; flex-wrap: wrap; }
.rating-score { color: var(--text-secondary, #53616b); }
.dimension-result strong { font-size: 15px; color: var(--text-primary, #193733); white-space: nowrap; }
.rating-dimensions { margin: 20px 0; border-top: 1px solid var(--border-color, #e0e5e9); }
.rating-dimension { padding: 16px 0; border-bottom: 1px solid var(--border-color, #e0e5e9); }
.dimension-heading { display: flex; gap: 16px; align-items: baseline; justify-content: space-between; }
.dimension-heading h3 { margin: 0; font-size: 16px; }
.dimension-heading span { color: #566580; flex-shrink: 0; }
.rating-dimension p, .rating-dimension dl { margin: 8px 0 0; }
.rating-dimension dl > div { display: flex; gap: 12px; flex-wrap: wrap; }
.rating-dimension dd { margin: 0; }
.rating-dimension small, .rating-dimension p { color: var(--text-secondary, #53616b); }
.rating-observations { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 20px; }
.rating-section li, .rating-sources a { overflow-wrap: anywhere; }
</style>
