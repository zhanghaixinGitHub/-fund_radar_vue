<script setup lang="ts">
import { ref, watch } from 'vue'
import { getAlertRules, upsertAlertRule } from '@/api/alerts'
import type { AlertRule } from '@/types/alert'
const props = defineProps<{ fundCode: string; followed: boolean }>()
const rules = ref<AlertRule[]>([])
const selected = ref<AlertRule['ruleType']>('EVENT')
const enabled = ref(true)
const threshold = ref(.5)
const busy = ref(false)
const loaded = ref(false)
const message = ref('')
let sequence = 0
function apply() {
  const rule = rules.value.find(r => r.fundCode === props.fundCode && r.ruleType === selected.value)
  enabled.value = rule?.enabled ?? true; threshold.value = Number(rule?.threshold ?? .5)
}
watch(() => [props.fundCode, props.followed], async () => {
  const ticket = ++sequence
  rules.value = []; loaded.value = false; message.value = ''
  if (!props.followed) return
  try { const result = await getAlertRules(); if (ticket === sequence) { rules.value = result; loaded.value = true; apply() } }
  catch { if (ticket === sequence) message.value = '提醒设置暂时无法加载。' }
}, { immediate: true })
async function save() {
  busy.value = true; message.value = ''
  try {
    const result = await upsertAlertRule({ fundCode: props.fundCode, ruleType: selected.value, enabled: enabled.value, threshold: selected.value === 'RISK_LEVEL' ? threshold.value : null })
    rules.value = [...rules.value.filter(r => r.ruleType !== result.ruleType || r.fundCode !== result.fundCode), result]
    message.value = '提醒设置已保存。'
  } catch { message.value = '提醒设置未能保存，请稍后重试。' }
  finally { busy.value = false }
}
</script>
<template>
  <section class="analysis-section">
    <h2>我的提醒</h2>
    <p
      v-if="!followed"
      class="empty-analysis"
    >
      加入关注后，可为这只基金设置站内提醒。
    </p>
    <form
      v-else-if="loaded"
      class="alert-rule-form"
      @submit.prevent="save"
    >
      <label>提醒内容<select
        v-model="selected"
        @change="apply"
      ><option value="EVENT">重要关联事件</option><option value="SIGNAL_CHANGE">判断发生变化</option><option value="RISK_LEVEL">风险达到指定程度</option></select></label>
      <label v-if="selected === 'RISK_LEVEL'">风险阈值（0 至 1）<input
        v-model.number="threshold"
        type="number"
        min="0"
        max="1"
        step=".01"
        required
      ></label>
      <label class="toggle-label"><input
        v-model="enabled"
        type="checkbox"
      >启用提醒</label>
      <button
        class="secondary-button"
        type="submit"
        :disabled="busy"
      >
        {{ busy ? '保存中…' : '保存提醒' }}
      </button>
    </form>
    <p
      v-if="message"
      role="status"
    >
      {{ message }}
    </p>
    <p class="section-note">
      已收集的公告不会自动成为重要事件提醒，需要先核对事件内容及关联。
    </p>
  </section>
</template>
