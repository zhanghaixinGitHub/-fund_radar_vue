<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { getDirectionExperiment } from '@/api/watchlist'
import type { DirectionExperiment } from '@/types/directionExperiment'
import { assertDirectionExperiment } from '@/utils/directionExperiment'

const props = defineProps<{ fundCode: string }>()
const result = ref<DirectionExperiment | null>(null)
const loading = ref(false)
const errorMessage = ref('')
let sequence = 0
const disagreement = computed(() => result.value?.models.length === 2
  && result.value.models[0]?.direction !== result.value.models[1]?.direction)

async function load(): Promise<void> {
  const request = ++sequence
  const code = props.fundCode
  result.value = null
  loading.value = true
  errorMessage.value = ''
  try {
    const value = await getDirectionExperiment(code)
    if (request !== sequence) return
    assertDirectionExperiment(value, code)
    result.value = value
  } catch (error) {
    if (request === sequence) errorMessage.value = error instanceof Error ? error.message : '实验结果暂时无法读取。'
  } finally {
    if (request === sequence) loading.value = false
  }
}

function time(value: string): string {
  return new Date(value).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })
}

watch(() => props.fundCode, () => { void load() }, { immediate: true })
onBeforeUnmount(() => { ++sequence })
</script>

<template>
  <div
    class="experiment-panel"
    :aria-busy="loading"
    data-testid="direction-experiment"
  >
    <div class="experiment-heading">
      <div>
        <span class="experiment-badge">实验模型 · 未正式发布</span>
        <h3>用当前本地净值试算</h3>
      </div>
      <button
        type="button"
        :disabled="loading"
        @click="load"
      >
        {{ loading ? '正在计算…' : '重新试算' }}
      </button>
    </div>
    <p class="experiment-context">
      最新组合方案与原模型在 1,389 道历史开发题上均答对 56.59%，尚无稳定优势，独立验证未完成。
    </p>
    <p
      v-if="loading"
      role="status"
    >
      正在读取本地净值并运行已保存模型…
    </p>
    <p
      v-else-if="errorMessage"
      role="alert"
    >
      {{ errorMessage }}
    </p>
    <template v-else-if="result">
      <p role="status">
        {{ result.message }}
      </p>
      <template v-if="result.status === 'EXPERIMENTAL'">
        <div class="experiment-models">
          <div
            v-for="model in result.models"
            :key="model.branch"
            class="experiment-model"
          >
            <p class="model-name">
              {{ model.branch === 'DROP_60D_GROUP_L2' ? '最新组合方案 · 四特征＋强约束' : '原模型对照 · 七特征' }}
            </p>
            <p class="model-direction">
              {{ model.direction === 'UP' ? '倾向上涨' : '倾向非上涨（含持平）' }}
            </p>
            <p>模型分数约 <strong>{{ model.score.toFixed(3) }}</strong><span class="score-scale"> / 1</span></p>
          </div>
        </div>
        <p class="score-explanation">
          分数大于 0.5 判断上涨，否则判断非上涨。它不是收益率，也不是经验证的上涨概率。
        </p>
        <p v-if="disagreement">
          两套模型当前判断不一致，暂未形成一致方向。
        </p>
        <dl class="experiment-dates">
          <div><dt>模型训练截止</dt><dd>{{ result.models[0]?.fitEnd }}</dd></div>
          <div><dt>输入最新净值日</dt><dd>{{ result.latestNavDate }}</dd></div>
          <div><dt>信息截止日</dt><dd>{{ result.cutoffDate }}</dd></div>
          <div><dt>观察区间 · 20 个交易日</dt><dd>{{ result.targetBaseDate }} → {{ result.targetEndDate }}</dd></div>
        </dl>
        <details>
          <summary>本次试算依据</summary>
          <p>固定使用最近完整交易日前一交易日结束的 61 日净值，计入已知现金分红再投，不填补缺数。</p>
          <p>沿用“净值下一交易日结束前可用”的研究假设，历史首次版本与分红完整性仍未核验。模型没有用近期数据重新训练。</p>
          <p>读取时间（北京时间）：{{ time(result.readAt) }}</p>
          <p>输入指纹：<code>{{ result.inputHash }}</code></p>
          <p
            v-for="model in result.models"
            :key="model.branch"
          >
            {{ model.branch === 'REFERENCE' ? '原模型' : '组合模型' }}版本：<code>{{ model.modelHash }}</code>
          </p>
        </details>
        <p class="experiment-footnote">
          仅供试用观察，不据此直接作买卖决定。刷新只运行已保存模型，结果未作为正式预测或独立测试留档。
        </p>
      </template>
    </template>
  </div>
</template>

<style scoped>
.experiment-panel { margin: 20px 0; padding: 22px; border: 1px solid #d9c6a0; border-radius: 12px; background: #fffaf0; line-height: 1.7; }
.experiment-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.experiment-heading h3 { margin: 6px 0 0; font-size: 20px; }
.experiment-badge { color: #77511a; font-size: 13px; font-weight: 700; }
button { flex-shrink: 0; min-height: 44px; padding: 8px 16px; color: #473c29; border: 1px solid #c4b594; border-radius: 10px; background: #fff; cursor: pointer; }
button:hover:not(:disabled) { background: #f7eedb; }
button:disabled { cursor: wait; opacity: .65; }
button:focus-visible, summary:focus-visible { outline: 3px solid #0f766e; outline-offset: 3px; }
.experiment-context, .score-explanation, .experiment-footnote { color: #605642; font-size: 14px; }
.experiment-models { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.experiment-model { padding: 16px; background: #fff; border: 1px solid #e5dbc7; border-radius: 10px; }
.experiment-model p { margin: 0 0 8px; }
.model-name { font-size: 13px; color: #605642; }
.model-direction { font-size: 21px; font-weight: 700; }
.experiment-model strong { font-size: 26px; font-variant-numeric: tabular-nums; }
.score-scale { font-size: 13px; color: #605642; }
.experiment-dates { display: flex; flex-wrap: wrap; gap: 16px 28px; }
dt { font-size: 13px; color: #605642; }
dd { margin: 4px 0 0; }
summary { padding: 10px 0; min-height: 44px; cursor: pointer; }
details p { font-size: 13px; }
code { overflow-wrap: anywhere; }
.experiment-footnote { margin-bottom: 0; padding-top: 14px; border-top: 1px solid #e5dbc7; }
@media (max-width: 600px) {
  .experiment-panel { padding: 16px; }
  .experiment-heading { align-items: flex-start; flex-direction: column; }
  .experiment-models { grid-template-columns: 1fr; }
  .experiment-dates { flex-direction: column; }
}
</style>
