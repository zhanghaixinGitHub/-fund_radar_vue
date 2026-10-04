<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { getAlertAvailability, getAlertRules, upsertAlertRule } from '@/api/alerts'
import type { AlertAvailability, AlertRule } from '@/types/alert'
import { alertAvailabilityNote, alertDescriptions } from '@/utils/alertPresentation'

const props = defineProps<{ fundCode: string; followed: boolean }>()
const rules = ref<AlertRule[]>([])
const availability = ref<AlertAvailability | null>(null)
const loaded = ref(false)
const loading = ref(false)
const loadError = ref('')
const pending = ref(new Set<AlertRule['ruleType']>())
const messages = ref<Partial<Record<AlertRule['ruleType'], string>>>({})
const failed = ref(new Set<AlertRule['ruleType']>())
let sequence = 0

/** 两类常规订阅直接展示；历史风险规则仅在实际存在时保留，不擅自新增阈值。 */
const rows = computed(() => {
  const types: AlertRule['ruleType'][] = ['EVENT', 'SIGNAL_CHANGE']
  if (rules.value.some(rule => rule.ruleType === 'RISK_LEVEL')) types.push('RISK_LEVEL')
  return types.map(type => ({ type, ...alertDescriptions[type], rule: rules.value.find(rule => rule.ruleType === type) }))
})

async function load() {
  const ticket = ++sequence
  rules.value = []; availability.value = null; loaded.value = false; loadError.value = ''
  pending.value = new Set(); failed.value = new Set(); messages.value = {}
  loading.value = props.followed
  if (!props.followed) return
  // 能力说明失败不阻止管理接收设置；切换基金后旧请求不能污染新页面。
  const [ruleResult, abilityResult] = await Promise.allSettled([getAlertRules(), getAlertAvailability()])
  if (ticket !== sequence) return
  if (ruleResult.status === 'fulfilled') {
    rules.value = ruleResult.value.filter(rule => rule.fundCode === props.fundCode)
    loaded.value = true
  } else loadError.value = '提醒设置暂时无法加载，请重试。'
  if (abilityResult.status === 'fulfilled') availability.value = abilityResult.value
  loading.value = false
}
watch(() => [props.fundCode, props.followed], () => void load(), { immediate: true })

/** 每类独立保存；服务端确认成功后才改变开关，失败时保留原状态。 */
async function toggle(type: AlertRule['ruleType']) {
  if (!loaded.value || !props.followed || pending.value.has(type)) return
  const rule = rules.value.find(item => item.ruleType === type)
  // 默认设置必须来自持久化记录，不能把尚未补齐的规则显示成已开启。
  if (!rule) return
  const threshold = type === 'RISK_LEVEL' ? Number(rule.threshold) : null
  if (type === 'RISK_LEVEL' && (rule.threshold === null || threshold === null || !Number.isFinite(threshold) || threshold < 0 || threshold > 1)) {
    messages.value[type] = '原提醒条件尚未核对，当前设置保持不变。'
    failed.value.add(type)
    return
  }
  const ticket = sequence
  pending.value.add(type); failed.value.delete(type); messages.value[type] = ''
  try {
    const saved = await upsertAlertRule({ fundCode: props.fundCode, ruleType: type, enabled: !rule.enabled, threshold })
    if (ticket !== sequence) return
    rules.value = rules.value.map(item => item.ruleType === type ? saved : item)
    messages.value[type] = saved.enabled ? '已开启接收。' : '已关闭接收，不影响关注这只基金。'
  } catch {
    if (ticket !== sequence) return
    failed.value.add(type)
    messages.value[type] = '设置未能保存，已保留原状态，请重试。'
  } finally {
    if (ticket === sequence) pending.value.delete(type)
  }
}
onBeforeUnmount(() => sequence++)
</script>

<template>
  <section class="analysis-section fund-alert-settings">
    <h2>我的提醒</h2>
    <p class="section-note">
      关注后默认接收以下两类提醒，可分别关闭。收到的消息在<RouterLink to="/notifications">
        站内提醒
      </RouterLink>查看。
    </p>
    <p
      v-if="!followed"
      class="empty-analysis"
    >
      关注这只基金后即可管理提醒。再次关注会保留你之前的开关选择。
    </p>
    <p
      v-else-if="loading"
      role="status"
    >
      正在读取提醒设置…
    </p>
    <div
      v-else-if="loadError"
      class="alert-load-error"
    >
      <p role="alert">
        {{ loadError }}
      </p>
      <button
        class="secondary-button"
        type="button"
        @click="load"
      >
        重新加载
      </button>
    </div>
    <ul
      v-else-if="loaded"
      class="fund-alert-list"
    >
      <li
        v-for="row in rows"
        :key="row.type"
        class="fund-alert-row"
      >
        <div class="fund-alert-copy">
          <h3 :id="`alert-title-${row.type}`">
            {{ row.title }}
          </h3>
          <p :id="`alert-description-${row.type}`">
            {{ row.description }}
          </p>
          <p class="fund-alert-availability">
            {{ alertAvailabilityNote(row.type, fundCode, availability) }}
          </p>
          <p
            v-if="!row.rule"
            class="fund-alert-feedback"
            role="status"
          >
            暂未取得这项提醒设置，请重新加载后查看。
            <button
              class="text-button"
              type="button"
              @click="load"
            >
              重新加载
            </button>
          </p>
          <p
            v-if="messages[row.type]"
            class="fund-alert-feedback"
            :class="{ 'is-error': failed.has(row.type) }"
            role="status"
          >
            {{ messages[row.type] }}
          </p>
        </div>
        <div
          v-if="row.rule"
          class="fund-alert-controls"
        >
          <span
            class="fund-alert-state"
            :class="{ 'is-enabled': row.rule.enabled }"
          >
            {{ row.rule.enabled ? '接收已开启' : '接收已关闭' }}
          </span>
          <button
            class="secondary-button"
            type="button"
            role="switch"
            :aria-checked="row.rule.enabled"
            :aria-labelledby="`alert-title-${row.type}`"
            :aria-describedby="`alert-description-${row.type}`"
            :aria-busy="pending.has(row.type)"
            :disabled="pending.has(row.type)"
            @click="toggle(row.type)"
          >
            {{ pending.has(row.type) ? '保存中…' : row.rule.enabled ? '关闭提醒' : '开启提醒' }}
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.fund-alert-settings > .section-note { margin-bottom: 20px; }
.section-note a { margin-inline: 4px; color: #0f766e; text-decoration: underline; text-underline-offset: 3px; }
.fund-alert-list { list-style: none; padding: 0; margin: 0; border-top: 1px solid #dce7e2; }
.fund-alert-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 28px; padding: 22px 0; }
.fund-alert-row + .fund-alert-row { border-top: 1px solid #dce7e2; }
.fund-alert-row:last-child { padding-bottom: 4px; }
.fund-alert-copy { flex: 1; min-width: 0; max-width: 780px; }
.fund-alert-copy h3 { margin: 0 0 8px; font-size: 17px; }
.fund-alert-copy p { margin: 0; line-height: 1.75; color: #49635c; overflow-wrap: anywhere; }
.fund-alert-copy .fund-alert-availability { margin-top: 6px; font-size: 13px; color: #74603e; }
.fund-alert-copy .fund-alert-feedback { margin-top: 8px; color: #0f766e; }
.fund-alert-copy .is-error { color: #a33131; }
.fund-alert-controls { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; flex-shrink: 0; }
.fund-alert-state { color: #61706b; font-size: 13px; }
.fund-alert-state.is-enabled { color: #0f766e; }
.fund-alert-controls button { min-height: 44px; min-width: 108px; }
@media (max-width: 640px) {
  .fund-alert-row { flex-direction: column; gap: 14px; padding-block: 20px; }
  .fund-alert-controls { width: 100%; flex-direction: row; align-items: center; justify-content: space-between; }
}
</style>
