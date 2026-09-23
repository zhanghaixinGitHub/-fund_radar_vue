<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { get } from '@/api/http'
import type { MultiPrediction } from '@/types/multiPrediction'
const props = defineProps<{fundCode:string}>()
interface Row { payload: MultiPrediction; resolution?: {endDate:string}; outcomeCheck?: {details:{summary?:string}}; outcomes: { correct:boolean; checkedAt:string; totalReturn:string; actualDirection:string }[] | null }
const rows=ref<Row[]>([]),error=ref(''),busy=ref(false),hasMore=ref(false)
let request=0
async function load(more=false) {
  const current=++request;busy.value=true;error.value=''
  try {
    const last=more ? rows.value.at(-1)?.payload : undefined
    const result=await get<{items:Row[]}>(`/api/v1/watchlist/${props.fundCode}/predictions/history${last ? `?before=${encodeURIComponent(last.generatedAt)}&beforeId=${last.predictionId}` : ''}`)
    if(current!==request)return
    rows.value=more ? [...rows.value,...result.items] : result.items;hasMore.value=result.items.length===30
  } catch(e) {if(current===request)error.value=e instanceof Error?e.message:'历史读取失败'}
  finally {if(current===request)busy.value=false}
}
watch(()=>props.fundCode,()=>{rows.value=[];void load()}, {immediate:true});onBeforeUnmount(()=>{++request})
const labels:Record<string,string>={T5_V1:'五日',T20_V1:'二十日',M6_V1:'半年'}
</script>
<template>
  <section
    class="analysis-section"
    aria-label="多周期真实预测历史"
  >
    <h2>实际发出的多周期预测</h2><p>同一期首次原文保留；到期结果单独追加。历史回放及候选模型记录不计为额外的真实主预测。</p>
    <p
      v-if="busy"
      role="status"
    >
      读取中…
    </p><p
      v-if="error"
      role="alert"
      class="error-message"
    >
      {{ error }} <button
        class="secondary-button"
        @click="load()"
      >
        重试
      </button>
    </p>
    <p v-if="!busy&&!rows.length&&!error">
      尚无已保存的真实预测
    </p>
    <article
      v-for="row in rows"
      :key="row.payload.predictionId"
      class="prediction-history-row"
    >
      <h3>{{ labels[row.payload.horizonId] }} · {{ row.payload.direction==='UP'?'预计上涨':'预计下跌或持平' }}</h3><p>{{ row.payload.startDate }} → {{ row.resolution?.endDate ?? row.payload.endDate ?? `${row.payload.nominalEndDate}（待官方日历确定）` }}</p><p>{{ row.payload.reason }}</p><p>生成于 {{ new Date(row.payload.generatedAt).toLocaleString('zh-CN') }}</p><p v-if="!row.outcomes?.length">
        {{ row.outcomeCheck?.details.summary ?? '尚未到期或到期资料待齐，未计为成功或失败' }}
      </p><p
        v-for="outcome in row.outcomes"
        :key="outcome.checkedAt"
      >
        核验 {{ outcome.checkedAt }}：{{ outcome.correct?'方向相符':'方向不符' }}；总回报 {{ (Number(outcome.totalReturn)*100).toFixed(2) }}%
      </p><details><summary>原文模型身份</summary><p>{{ row.payload.predictionId }}</p><p>{{ row.payload.modelId }} · 采用版本 {{ row.payload.activationRevision }}</p><p>{{ row.payload.modelHash }}</p></details>
    </article>
    <button
      v-if="hasMore"
      class="secondary-button"
      :disabled="busy"
      @click="load(true)"
    >
      加载更早记录
    </button>
  </section>
</template>
<style scoped>.prediction-history-row{padding:16px 0;border-bottom:1px solid #dce5df;overflow-wrap:anywhere}.prediction-history-row p{line-height:1.7}summary{cursor:pointer;min-height:36px}</style>
