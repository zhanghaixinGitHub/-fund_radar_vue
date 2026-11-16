<script setup lang="ts">
import type { DecisionReport } from '@/types/multiPrediction'
import { computed } from 'vue'
import { holdingKeyEvidence, holdingQualityRows, holdingImportantLimits } from '@/utils/holdingAdvicePresentation'
const props = defineProps<{ report: DecisionReport; compact?: boolean }>()
// 初次留档保留原文；日常界面不展示其中的计算方法或后台处理说明。
const businessFacts = computed(() => props.report.facts.filter(item => !/Java|fund_profile|TUSHARE|ACCUMULATED|本项目按|分项占比合成/.test(item)))
const keyEvidence = computed(() => holdingKeyEvidence(props.report))
const qualityRows = computed(() => holdingQualityRows(props.report.qualityAssessment))
// 只合并完全重复的分项结论；同名费用诊断等额外事实仍完整保留。
const otherFacts = computed(() => businessFacts.value.filter(fact => !qualityRows.value.some(row => fact.trim() === `${row.title}：${row.text}`.trim())))
const importantLimits = computed(() => holdingImportantLimits(props.report))
const horizonLabel = (value: string) => ({ T1: '一日', T5_V1: '五日', T20_V1: '二十日', M6_V1: '半年' }[value] ?? '本周期')
const directionLabel = (value: string) => ({ UP: '偏上', DOWN: '偏下', FLAT: '基本持平', ABSTAIN: '暂不判断' }[value] ?? '暂不判断')
const time = (value: string) => new Date(value).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })
</script>
<template>
  <div class="holding-advice-details">
    <p>{{ report.summary }}</p>
    <p
      v-if="report.dataAsOf"
      class="advice-date"
    >
      评分考察日 {{ report.dataAsOf }} · 生成于 {{ time(report.generatedAt) }}
    </p>
    <section
      v-if="keyEvidence.length"
      aria-label="关键依据"
    >
      <h3>{{ compact ? '关键依据' : '为什么这样建议' }}</h3>
      <ul class="key-evidence">
        <li
          v-for="item in keyEvidence"
          :key="item.title"
        >
          <strong>{{ item.title }}</strong><span>{{ item.text }}</span>
        </li>
      </ul>
      <p
        v-if="compact"
        class="advice-date"
      >
        以上为依据摘录，完整分析保留具体条件与反对因素。
      </p>
    </section>
    <section v-if="report.missingOptionalFactors.length">
      <h3>{{ compact ? '尚缺依据' : '本次缺少什么' }}</h3>
      <ul>
        <li
          v-for="item in report.missingOptionalFactors"
          :key="item"
        >
          {{ item }}
        </li>
      </ul>
    </section>
    <section v-if="compact && importantLimits.length">
      <h3>操作前留意</h3>
      <ul>
        <li
          v-for="item in importantLimits"
          :key="item"
        >
          {{ item }}
        </li>
      </ul>
    </section>
    <template v-if="!compact">
      <details v-if="qualityRows.length">
        <summary>基金质量与评分分项</summary>
        <dl class="quality-list">
          <div
            v-for="item in qualityRows"
            :key="item.title"
          >
            <dt>{{ item.title }}</dt><dd>{{ item.text }}</dd>
          </div>
        </dl>
      </details>
      <details>
        <summary>不同周期的依据与分歧</summary>
        <section
          v-for="period in report.periodAssessments"
          :key="period.horizonId"
          class="advice-period"
        >
          <h4>{{ horizonLabel(period.horizonId) }} · {{ period.kind === 'RETROSPECTIVE' ? '已结束，仅供回看' : period.kind === 'CONDITIONAL_OUTLOOK' ? '有条件展望' : directionLabel(period.decision) }}</h4>
          <p>{{ period.startDate }} → {{ period.endDate || '实际结束日期待核' }}</p>
          <p>{{ period.summary }}</p>
          <p v-if="period.counterReason">
            反对因素与取舍：{{ period.counterReason }}
          </p>
          <ul v-if="period.limitations.length">
            <li
              v-for="item in period.limitations"
              :key="item"
            >
              {{ item }}
            </li>
          </ul>
          <p class="advice-date">
            资料截至 {{ time(period.sourceCutoff) }}
          </p>
        </section>
      </details>
      <details>
        <summary>诊断与其他已知事实</summary>
        <ul>
          <li
            v-for="item in otherFacts"
            :key="item"
          >
            {{ item }}
          </li>
        </ul>
        <ul>
          <li
            v-for="item in report.neutralEvidence"
            :key="item"
          >
            {{ item }}
          </li>
        </ul>
      </details>
      <h3>操作前需要留意</h3>
      <p v-if="report.personalAssessment">
        {{ report.personalAssessment }}
      </p>
      <ul>
        <li
          v-for="item in report.executionConstraints"
          :key="item"
        >
          {{ item }}
        </li>
      </ul>
      <h3>什么变化后需要再看</h3>
      <ul>
        <li
          v-for="item in report.reassessmentConditions"
          :key="item"
        >
          {{ item }}
        </li>
      </ul>
      <p class="advice-date">
        本份操作判断最迟适用至 {{ time(report.validUntil) }}，期间资料或个人安排变化也需要重新评估。这里只保存建议，不自动操作模拟账户。
      </p>
    </template>
  </div>
</template>
<style scoped>
.holding-advice-details { overflow-wrap:anywhere; }
.holding-advice-details p,.holding-advice-details li { line-height:1.8; }
.holding-advice-details h3 { font-size:16px; margin:24px 0 8px; }
.holding-advice-details h4 { font-size:14px; margin:0 0 8px; }
.holding-advice-details details { margin-top:16px; }
.holding-advice-details summary { cursor:pointer; padding:10px 0; }
.advice-date { color:var(--ui-muted); font-size:12px; }
.advice-period { padding:16px 0; border-bottom:1px solid var(--ui-line); }
.key-evidence { padding-left:20px; }
.key-evidence li { margin:10px 0; }
.key-evidence strong { display:block; font-weight:600; }
.key-evidence span { display:block; }
.quality-list { margin:8px 0 0; }
.quality-list > div { padding:12px 0; border-bottom:1px solid var(--ui-line); }
.quality-list dt { font-weight:600; }
.quality-list dd { margin:6px 0 0; line-height:1.8; }
</style>
