<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { getAlertRules, upsertAlertRule } from '@/api/alerts'
import type { AlertRule } from '@/types/alert'
const props = defineProps<{ fundCode: string; followed: boolean }>()
const rules = ref<AlertRule[]>([])
const selected = ref<AlertRule['ruleType']>('EVENT')
const enabled = ref(true)
const existingRisk = computed(() => rules.value.find(r => r.fundCode === props.fundCode && r.ruleType === 'RISK_LEVEL'))
const busy = ref(false)
const loaded = ref(false)
const message = ref('')
let sequence = 0
function apply() {
  if (selected.value === 'RISK_LEVEL' && !existingRisk.value) selected.value = 'EVENT'
  const rule = rules.value.find(r => r.fundCode === props.fundCode && r.ruleType === selected.value)
  enabled.value = rule?.enabled ?? true
}
watch(() => [props.fundCode, props.followed], async () => {
  const ticket = ++sequence
  rules.value = []; loaded.value = false; message.value = ''; busy.value = false
  if (!props.followed) return
  try { const result = await getAlertRules(); if (ticket === sequence) { rules.value = result; loaded.value = true; apply() } }
  catch { if (ticket === sequence) message.value = '提醒设置暂时无法加载。' }
}, { immediate: true })
async function save() {
  if (busy.value || !loaded.value || !props.followed) return
  const ticket = sequence
  const threshold = selected.value === 'RISK_LEVEL' ? existingRisk.value?.threshold ?? null : null
  if (selected.value === 'RISK_LEVEL' && (threshold === null || !Number.isFinite(Number(threshold)))) {
    message.value = '原提醒条件尚未核对，当前设置保持不变。'; return
  }
  busy.value = true; message.value = ''
  try {
    const result = await upsertAlertRule({ fundCode: props.fundCode, ruleType: selected.value, enabled: enabled.value, threshold })
    // 旧基金请求完成后不能污染新基金的设置或成功提示。
    if (ticket !== sequence) return
    rules.value = [...rules.value.filter(r => r.ruleType !== result.ruleType || r.fundCode !== result.fundCode), result]
    message.value = '提醒设置已保存。'
  } catch { if (ticket === sequence) message.value = '提醒设置未能保存，请稍后重试。' }
  finally { if (ticket === sequence) busy.value = false }
}
onBeforeUnmount(() => sequence++)
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
      ><option value="EVENT">基金相关事项</option><option value="SIGNAL_CHANGE">判断发生变化</option><option
        v-if="existingRisk"
        value="RISK_LEVEL"
      >已有风险提醒</option></select></label>
      <p v-if="selected === 'RISK_LEVEL'">
        沿用已保存的条件，不替你更改风险安排。
      </p>
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
