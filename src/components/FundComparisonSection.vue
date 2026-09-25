<script setup lang="ts">
import { ref, watch } from 'vue'
import { getFundSameTypeComparison } from '@/api/funds'
import FundSameTypeComparison from '@/components/FundSameTypeComparison.vue'
import type { FundSameTypeComparison as Comparison } from '@/types/fund'
const props = defineProps<{ fundCode: string }>()
const comparison = ref<Comparison | null>(null)
const loading = ref(false)
const error = ref('')
let sequence = 0
watch(() => props.fundCode, async code => {
  const ticket = ++sequence
  comparison.value = null; loading.value = true; error.value = ''
  try { const result = await getFundSameTypeComparison(code); if (ticket === sequence) comparison.value = result }
  catch { if (ticket === sequence) error.value = '同类比较暂时不可用。' }
  finally { if (ticket === sequence) loading.value = false }
}, { immediate: true })
</script>
<template>
  <section class="analysis-section">
    <h2>同类对比</h2><FundSameTypeComparison
      :comparison="comparison"
      :current-fund-code="fundCode"
      :loading="loading"
      :error-message="error"
    />
  </section>
</template>
