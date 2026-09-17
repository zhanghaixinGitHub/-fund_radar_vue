<script setup lang="ts">
import { useRoute } from 'vue-router'
import type { AdviceSummary, DiagnosisSummary } from '@/types/advice'
import { adviceLabel, diagnosisStale, diagnosisVerdictLabel, diagnosisVerdictTone } from '@/utils/advice'
import { shanghaiDate, simTime } from '@/utils/simulation'

defineProps<{ fundCode: string; report?: AdviceSummary; diagnosis?: DiagnosisSummary; diagnosisError?: string; error?: string; loading?: boolean }>()
const route = useRoute()
</script>

<template>
  <section
    class="holding-advice"
    :class="{
      'holding-advice-hold': report?.decision === 'HOLD',
      'holding-advice-sell': report?.decision === 'SELL',
      'holding-advice-buy': report?.decision === 'BUY',
    }"
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
    <div class="holding-diagnosis">
      <template v-if="diagnosis">
        <span
          class="diagnosis-verdict"
          :class="diagnosisVerdictTone(diagnosis.verdict)"
        >诊断：{{ diagnosisVerdictLabel(diagnosis.verdict) }} · {{ diagnosis.reportDate }}</span>
        <span
          v-if="diagnosisStale(diagnosis.cutoffDate, shanghaiDate())"
          class="holding-diagnosis-stale"
        >数据截至 {{ diagnosis.cutoffDate ?? '未知' }}，可能陈旧</span>
      </template>
      <span
        v-else-if="diagnosisError"
        class="diagnosis-verdict diagnosis-unknown"
        role="alert"
      >{{ diagnosisError }}</span>
      <span
        v-else-if="!loading && !error"
        class="diagnosis-verdict diagnosis-unknown"
      >尚无诊断报告，后台每日核对后留档</span>
    </div>
    <div class="holding-advice-footer">
      <span v-if="report">{{ simTime(report.generatedAt) }}<template v-if="report.originalReportId"> · 沿用已有判断</template></span>
      <div class="holding-advice-links">
        <RouterLink :to="{ name: 'portfolio-advice', params: { fundCode }, query: { from: route.fullPath } }">
          查看完整依据 →
        </RouterLink>
        <RouterLink :to="{ name: 'portfolio-advice', params: { fundCode }, query: { from: route.fullPath, section: 'diagnosis' } }">
          诊断详情
        </RouterLink>
        <RouterLink :to="{ name: 'portfolio-advice', params: { fundCode }, query: { from: route.fullPath, section: 'history' } }">
          历史建议
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 暂无建议和未加载记录用浅灰色；卖出沿用原浅绿，持有保持原色，明确买入时使用浅红。 */
.holding-advice { padding: 16px 18px; margin: 12px 0 18px; border: 1px solid #e0e0e0; border-left: 3px solid #9ca3af; border-radius: 8px; background: #f5f5f5; }
.holding-advice-hold, .holding-advice-sell { border-color: #d7e8e1; border-left-color: #13796e; background: #f1f8f5; }
.holding-advice-buy { border-color: #eccaca; border-left-color: #bc4444; background: #fff1f0; }
.holding-advice-heading, .holding-advice-footer { display: flex; gap: 12px; flex-wrap: wrap; justify-content: space-between; align-items: center; }
.holding-advice-heading strong { color: #24463b; font-size: 15px; }
.holding-advice-time, .holding-advice-footer > span { color: #586e65; font-size: 12px; }
.holding-advice p { margin: 10px 0 12px; color: #3d574c; line-height: 1.75; font-size: 14px; }
.holding-advice-links { display: flex; gap: 18px; flex-wrap: wrap; }
.holding-advice-links a { color: #086b62; font-size: 13px; min-height: 30px; display: inline-flex; align-items: center; }
.holding-diagnosis { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin: 4px 0 12px; }
.diagnosis-verdict { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 13px; }
.diagnosis-valid { color: #326a56; background: #e4f0e9; }.diagnosis-changed { color: #9a3b3b; background: #fbeaea; }.diagnosis-insufficient { color: #825621; background: #fbf1df; }.diagnosis-unknown { color: #5b6b62; background: #ecefee; }
.holding-diagnosis-stale { color: #825621; font-size: 12px; }
@media (max-width: 580px) { .holding-advice { padding: 14px; }.holding-advice-links a { min-height: 44px; } }
</style>
