<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { readEvaluationStatus, type EvaluationStatus } from '@/api/fundEvaluation'

const props = defineProps<{ fundCode: string }>()
const value = ref<EvaluationStatus | null>(null)
const error = ref('')
let sequence = 0
watch(() => props.fundCode, async code => {
  const ticket = ++sequence; value.value = null; error.value = ''
  try {
    const response = await readEvaluationStatus([code])
    if (ticket === sequence) value.value = response.items.find(item => item.fundCode === code) ?? null
  } catch { if (ticket === sequence) error.value = '历史评价资料暂时无法读取，请稍后重试。' }
}, { immediate: true })
onBeforeUnmount(() => sequence++)
</script>

<template>
  <section
    class="analysis-section"
    aria-labelledby="evaluation-title"
  >
    <h2 id="evaluation-title">
      历史综合评价
    </h2>
    <p
      v-if="error"
      role="alert"
    >
      {{ error }}
    </p>
    <template v-else-if="value">
      <p>{{ value.message }}</p>
      <p
        v-if="value.coverageCheckedAt"
        class="section-note"
      >
        资料核对日 {{ value.coverageCheckedAt.slice(0, 10) }}<span v-if="value.navAsOfDate"> · 净值截至 {{ value.navAsOfDate }}</span>
      </p>
      <ul>
        <li
          v-for="reason in value.reasons"
          :key="reason"
        >
          {{ reason }}
        </li>
      </ul>
      <p class="section-note">
        {{ value.note }}
      </p>
    </template>
    <p v-else>
      正在读取历史评价资料…
    </p>
  </section>
</template>
