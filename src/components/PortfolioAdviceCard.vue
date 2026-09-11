<script setup lang="ts">
import { useRoute } from 'vue-router'
import type { AdviceSummary } from '@/types/advice'
import { adviceLabel } from '@/utils/advice'
import { shanghaiDate, simTime } from '@/utils/simulation'

defineProps<{ fundCode: string; report?: AdviceSummary; error?: string; loading?: boolean }>()
const route = useRoute()
</script>

<template>
  <section
    class="holding-advice"
    :class="{ 'holding-advice-sell': report?.decision === 'SELL' }"
    aria-label="操作建议"
  >
    <div class="holding-advice-heading">
      <strong>{{ loading ? '正在读取操作建议…' : adviceLabel(report?.decision) }}</strong>
      <span
        v-if="report"
        class="holding-advice-time"
      >{{ report.reportDate === shanghaiDate() ? '今日留档' : `${report.reportDate} 留档` }}</span>
    </div>
    <p
      v-if="error"
      role="alert"
    >
      {{ error }}
    </p>
    <p v-else-if="report">
      {{ report.summary }}
    </p>
    <p v-else-if="!loading">
      还没有保存的建议。可进入完整依据，生成当前建议；后台也会每天检查并留档。
    </p>
    <div class="holding-advice-footer">
      <span v-if="report">{{ simTime(report.generatedAt) }}<template v-if="report.originalReportId"> · 沿用已有判断</template></span>
      <div class="holding-advice-links">
        <RouterLink :to="{ name: 'portfolio-advice', params: { fundCode }, query: { from: route.fullPath } }">
          查看完整依据 →
        </RouterLink>
        <RouterLink :to="{ name: 'portfolio-advice', params: { fundCode }, query: { from: route.fullPath, section: 'history' } }">
          历史建议
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.holding-advice { padding: 16px 18px; margin: 12px 0 18px; border: 1px solid #d7e8e1; border-left: 3px solid #13796e; border-radius: 8px; background: #f1f8f5; }
.holding-advice-sell { border-color: #e8ddce; border-left-color: #99652f; background: #fbf7f0; }
.holding-advice-heading, .holding-advice-footer { display: flex; gap: 12px; flex-wrap: wrap; justify-content: space-between; align-items: center; }
.holding-advice-heading strong { color: #24463b; font-size: 15px; }
.holding-advice-time, .holding-advice-footer > span { color: #586e65; font-size: 12px; }
.holding-advice p { margin: 10px 0 12px; color: #3d574c; line-height: 1.75; font-size: 14px; }
.holding-advice-links { display: flex; gap: 18px; flex-wrap: wrap; }
.holding-advice-links a { color: #086b62; font-size: 13px; min-height: 30px; display: inline-flex; align-items: center; }
@media (max-width: 580px) { .holding-advice { padding: 14px; }.holding-advice-links a { min-height: 44px; } }
</style>
