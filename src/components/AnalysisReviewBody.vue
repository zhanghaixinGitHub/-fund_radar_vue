<script setup lang="ts">
import type { AnalysisReview, AnalysisReviewEvidence } from '@/types/analysisReview'

defineProps<{ review: AnalysisReview }>()

/** 原分析的实际时刻统一按北京时间展示；不会用入库时间替代生成时间。 */
function timeText(value: string) {
  return new Date(value).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit',
    day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
}

/** 多份行情留档合并成一个资料提示；原来源和原判断仍由后台完整保留。 */
function displaySources(sources: AnalysisReviewEvidence['sources']) {
  const seen = new Set<string>()
  return sources.map(source => ({ ...source, title: source.url ? source.title : '历史行情资料' })).filter(source => {
    const key = `${source.title}:${source.url ?? ''}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
</script>

<template>
  <section
    class="analysis-review"
    :aria-label="`${review.targetNavDate}综合回看`"
  >
    <header>
      <h4>一日综合回看</h4>
      <span class="review-label">事后回看</span>
      <strong :class="review.direction === 'UP' ? 'tone-up' : 'tone-down'">{{ review.direction === 'UP' ? '偏上涨' : '偏下跌' }}</strong>
      <span>把握低</span>
    </header>
    <p class="review-summary">
      {{ review.summary }}
    </p>
    <p class="review-time">
      资料截止 {{ timeText(review.informationCutoff) }} · 实际生成 {{ timeText(review.actualGeneratedAt) }}
    </p>
    <p class="review-notice">
      收盘后按早盘公开资料重建，不计入事前预测准确率。
    </p>
    <details>
      <summary>查看综合依据</summary>
      <template
        v-for="group in [{ title: '主要依据', items: review.supportingEvidence }, { title: '相反因素', items: review.counterEvidence }]"
        :key="group.title"
      >
        <h5>{{ group.title }}</h5>
        <section
          v-for="(item, index) in group.items"
          :key="index"
          class="review-evidence"
        >
          <p>{{ item.fact }}</p>
          <p class="review-meaning">
            {{ item.interpretation }}
          </p>
          <div class="review-sources">
            <template
              v-for="(source, sourceIndex) in displaySources(item.sources)"
              :key="sourceIndex"
            >
              <a
                v-if="source.url"
                :href="source.url"
                target="_blank"
                rel="noopener noreferrer"
              >{{ source.title }}</a>
              <span v-else>{{ source.title }}</span>
            </template>
          </div>
        </section>
      </template>
      <h5>什么情况会改变判断</h5>
      <ul>
        <li
          v-for="condition in review.changeConditions"
          :key="condition"
        >
          {{ condition }}
        </li>
      </ul>
      <h5>资料与判断的局限</h5>
      <ul>
        <li
          v-for="limitation in review.limitations"
          :key="limitation"
        >
          {{ limitation }}
        </li>
      </ul>
    </details>
  </section>
</template>

<style scoped>
.analysis-review { padding: 20px 24px; border-top: 1px solid #dfe8e3; background: #f6faf8; color: #294c3e; font-size: 13px; line-height: 1.8; overflow-wrap: anywhere; }
header { display: flex; align-items: baseline; flex-wrap: wrap; gap: 8px 16px; }
h4 { margin: 0; font-size: 16px; }
header > span { color: #536c63; }
header strong { font-size: 20px; }
.tone-up { color: #c14343; }.tone-down { color: #0f766e; }
.review-label { padding: 1px 8px; border: 1px solid #cbd9d1; border-radius: 4px; }
.review-summary { max-width: 90ch; margin: 10px 0; }
.review-time, .review-notice, .review-meaning { color: #536c63; }
.review-time { font-size: 12px; font-variant-numeric: tabular-nums; }
.review-notice { margin: 6px 0; }
summary { width: fit-content; min-height: 44px; padding: 10px 0; color: #0f766e; cursor: pointer; }
summary:focus-visible, a:focus-visible { outline: 2px solid #0f766e; outline-offset: 3px; }
h5 { margin: 16px 0 8px; font-size: 14px; }
.review-evidence { max-width: 90ch; margin-bottom: 16px; }
.review-evidence p { margin: 6px 0; }
.review-sources { display: flex; flex-wrap: wrap; gap: 8px 16px; font-size: 12px; color: #647b72; }
a { color: #0f766e; }
ul { max-width: 90ch; padding-left: 20px; }
</style>
