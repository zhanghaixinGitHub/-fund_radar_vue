<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { getWatchlistPrediction } from '@/api/watchlist'
import type { WatchlistPrediction } from '@/types/prediction'

const props = defineProps<{ fundCode: string }>()
const prediction = ref<WatchlistPrediction | null>(null)
const loading = ref(false)
const errorMessage = ref('')
// 每次切基金、刷新、卸载都废弃旧请求，慢响应不能覆盖新基金的状态。
let requestSequence = 0

const statusLabel = computed(() => {
  if (!prediction.value) return ''
  return {
    MODEL_NOT_RELEASED: '模型未发布',
    DATA_INSUFFICIENT: '研究资料不足',
    NOT_APPLICABLE: '暂不适用',
    UNAVAILABLE: '暂时无法读取',
  }[prediction.value.status]
})

function displayTime(value: string | null): string {
  if (!value) return '暂无研究记录'
  const time = new Date(value)
  return Number.isFinite(time.getTime())
    ? time.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })
    : '研究时间暂缺'
}

/** 卡片独立请求，失败不影响基金资料和净值图；不触发训练或同步。 */
async function load(): Promise<void> {
  const sequence = ++requestSequence
  const code = props.fundCode
  prediction.value = null
  errorMessage.value = ''
  loading.value = true
  try {
    const result = await getWatchlistPrediction(code)
    if (sequence !== requestSequence) return
    // 前端仅辅助防止错配；Java/Python仍是实际授权与发布边界。
    if (result.fundCode !== code || result.upProbability !== null || result.direction !== null
      || result.horizonTradingDays !== 20
      || !['MODEL_NOT_RELEASED', 'DATA_INSUFFICIENT', 'NOT_APPLICABLE', 'UNAVAILABLE'].includes(result.status)) {
      throw new Error('预测状态未通过校验，暂不展示。')
    }
    prediction.value = result
  } catch (error) {
    if (sequence === requestSequence) {
      errorMessage.value = error instanceof Error ? error.message : '预测状态暂时无法加载，请稍后重试。'
    }
  } finally {
    if (sequence === requestSequence) loading.value = false
  }
}

watch(() => props.fundCode, () => { void load() }, { immediate: true })
onBeforeUnmount(() => { ++requestSequence })
</script>

<template>
  <section
    class="analysis-section prediction-card"
    aria-labelledby="watchlist-prediction-title"
    :aria-busy="loading"
    data-testid="watchlist-prediction"
  >
    <div class="section-heading prediction-heading">
      <div>
        <p class="eyebrow">
          仅我的关注 · 研究验证中
        </p>
        <h2 id="watchlist-prediction-title">
          未来 20 个交易日方向
        </h2>
      </div>
      <button
        class="prediction-refresh"
        type="button"
        :disabled="loading"
        aria-label="刷新预测状态"
        @click="load"
      >
        {{ loading ? '正在读取…' : '刷新状态' }}
      </button>
    </div>
    <p class="prediction-intro">
      观察这段时间整体上涨还是下跌，不是每天的涨跌，也不预测具体净值。
    </p>
    <p
      v-if="loading"
      class="prediction-state"
      role="status"
    >
      正在读取这只基金的研究与发布状态…
    </p>
    <div
      v-else-if="errorMessage"
      class="prediction-state"
      role="alert"
    >
      <strong>暂时无法读取预测状态</strong>
      <p>{{ errorMessage }}</p>
      <p>这不表示基金会下跌，你仍可查看其他基金资料。</p>
    </div>
    <template v-else-if="prediction">
      <div
        class="prediction-state"
        role="status"
      >
        <span class="prediction-badge">{{ statusLabel }}</span>
        <p class="prediction-message">
          {{ prediction.message }}
        </p>
        <p>目前不展示上涨概率，不用 0% 或 50% 代替未知结果。</p>
      </div>
      <details class="prediction-reasons">
        <summary>为什么现在没有预测数字？</summary>
        <ul>
          <li
            v-for="reason in prediction.reasons"
            :key="reason"
          >
            {{ reason }}
          </li>
        </ul>
      </details>
      <dl class="prediction-metadata">
        <div>
          <dt>本地最新净值日</dt>
          <dd>{{ prediction.latestNavDate || '暂缺' }}</dd>
        </div>
        <div>
          <dt>最近研究记录时间（北京时间）</dt>
          <dd>{{ displayTime(prediction.researchEvaluatedAt) }}</dd>
        </div>
      </dl>
      <p class="prediction-disclaimer">
        {{ prediction.disclaimer }}
      </p>
    </template>
  </section>
</template>

<style scoped>
.prediction-card { color: #17332e; }
.prediction-heading { align-items: flex-start; gap: 16px; }
.prediction-refresh {
  flex-shrink: 0; min-height: 44px; padding: 8px 16px; border: 1px solid #b6ccc3;
  border-radius: 10px; color: #24554a; background: #fff; cursor: pointer;
}
.prediction-refresh:hover:not(:disabled) { background: #edf5f1; }
.prediction-refresh:disabled { color: #657b73; cursor: wait; }
.prediction-refresh:focus-visible, summary:focus-visible {
  outline: 3px solid #0f766e; outline-offset: 3px;
}
.prediction-intro, .prediction-disclaimer { color: #536c63; line-height: 1.7; }
.prediction-state { padding: 20px; margin: 18px 0; border-radius: 12px; background: #f0f5f1; line-height: 1.7; }
.prediction-state p { margin: 8px 0 0; }
.prediction-badge {
  display: inline-block; padding: 3px 10px; border: 1px solid #bed0c6; border-radius: 6px;
  color: #385b4b; background: #e3eee7; font-size: 13px; font-weight: 700;
}
.prediction-message { font-size: 18px; font-weight: 700; }
.prediction-reasons { color: #345b4e; line-height: 1.8; }
.prediction-reasons summary { min-height: 44px; padding: 10px 0; cursor: pointer; }
.prediction-reasons li { margin: 8px 0; }
.prediction-reasons ul { padding-left: 24px; margin: 4px 0 16px; }
.prediction-metadata { display: flex; flex-wrap: wrap; gap: 16px 40px; margin: 20px 0 0; }
.prediction-metadata dt { color: #536c63; font-size: 13px; }
.prediction-metadata dd { margin: 6px 0 0; font-size: 14px; }
.prediction-disclaimer { padding-top: 16px; margin: 18px 0 0; border-top: 1px solid #dce7df; font-size: 13px; }
@media (max-width: 600px) {
  .prediction-heading { flex-direction: column; }
  .prediction-state { padding: 16px; }
  .prediction-metadata { flex-direction: column; gap: 16px; }
}
</style>
