<script setup lang="ts">
import type { PredictionReviewPeriod } from '@/types/predictionReview'
import { reviewDateRange, reviewDirection, isSupplementaryReview } from '@/utils/predictionReview'
import PredictionHistoryDisclosure from '@/components/PredictionHistoryDisclosure.vue'
defineProps<{ period: PredictionReviewPeriod; detailed?: boolean }>()
const time = (value: string) => new Date(value).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })
</script>

<template>
  <div class="daily-review">
    <strong
      class="review-direction"
      :class="`tone-${period.decision.toLowerCase()}`"
    >{{ reviewDirection(period) }}</strong>
    <p v-if="period.decision !== 'ABSTAIN'">判断把握较低</p>
    <p>{{ reviewDateRange(period) }}</p>
    <p v-if="period.kind === 'RETROSPECTIVE'">
      区间已结束 · 仅供复盘
    </p>
    <p v-else-if="period.kind === 'CONDITIONAL_OUTLOOK'">
      半年条件展望 · 终点待核
    </p>
    <p v-else-if="isSupplementaryReview(period)">
      区间内补充判断 · 非事前预测
    </p>
    <p v-if="period.decision === 'ABSTAIN'">
      {{ period.awaitingReason || period.summary }}
    </p>
    <p class="review-time">
      分析于 {{ time(period.analysisAt) }}
    </p>
    <component
      :is="detailed ? 'section' : PredictionHistoryDisclosure"
      v-bind="detailed ? {} : { label: '查看当时依据', title: `${period.startDate} · ${period.horizonId === 'T1' ? '一日' : period.horizonId === 'T5_V1' ? '五日' : period.horizonId === 'T20_V1' ? '二十日' : '半年'}判断依据` }"
    >
      <p v-if="!detailed">
        {{ reviewDirection(period) }} · {{ reviewDateRange(period) }}<br>分析于 {{ time(period.analysisAt) }}
      </p>
      <p>{{ period.summary }}</p>
      <p><b>主要依据：</b>{{ period.primaryReason }}</p>
      <p><b>相反因素：</b>{{ period.counterReason }}</p>
      <p
        v-for="condition in period.conditions"
        :key="condition"
      >
        <b>改变条件：</b>{{ condition }}
      </p>
      <p
        v-for="limitation in period.limitations"
        :key="limitation"
      >
        {{ limitation }}
      </p>
      <p>判断把握较低，不代表实际收益；未纳入准确率统计。</p>
    </component>
  </div>
</template>

<style scoped>
.daily-review { min-width: 0; overflow-wrap: anywhere; }
.review-direction { display: block; margin-top: 14px; font-size: 23px; line-height: 1.5; font-weight: 600; }
.tone-up { color: var(--history-rise, #b43d3d); }
.tone-down { color: var(--history-fall, #0f766e); }
.tone-flat, .tone-abstain, .review-time { color: var(--history-muted, #536c63); }
.daily-review p { color: var(--history-muted, #536c63); font-size: 12px; line-height: 1.65; }
.daily-review summary { cursor: pointer; color: var(--history-fall, #0f766e); font-size: 13px; }
.daily-review summary:focus-visible { outline: 2px solid var(--history-fall, #0f766e); outline-offset: 3px; }
</style>
