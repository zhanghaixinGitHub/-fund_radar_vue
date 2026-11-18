<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { readStrategyPreference, saveStrategyPreference } from '@/api/multiPrediction'
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
const preference = ref('BALANCED'), saved = ref('BALANCED')
const isDefault = ref(true), loading = ref(true), saving = ref(false), loaded = ref(false)
const error = ref(''), message = ref('')
const canWrite = computed(() => auth.hasPermission('SIM_PORTFOLIO_SELF_WRITE'))
const options = [{ value: 'SHORT', title: '短线', description: '更关注近期变化与短期持有安排。' }, { value: 'BALANCED', title: '均衡', description: '兼顾近期变化与中长期持有安排。' }, { value: 'LONG', title: '长线', description: '更关注中长期方向与持续持有安排。' }]
async function load() {
  loading.value = true; error.value = ''
  try {
    const value = await readStrategyPreference()
    preference.value = saved.value = value.preference; isDefault.value = value.defaultPreference; loaded.value = true
  } catch { error.value = '投资偏好暂时无法读取，请重试。' }
  finally { loading.value = false }
}
async function save() {
  if (saving.value || loading.value || !loaded.value || !canWrite.value) return
  saving.value = true; error.value = ''; message.value = ''
  try { await saveStrategyPreference(preference.value); saved.value = preference.value; isDefault.value = false; message.value = '投资偏好已保存。' }
  catch { error.value = '投资偏好未能确认保存，请重试。' }
  finally { saving.value = false }
}
onMounted(load)
</script>

<template>
  <section
    class="account-settings fund-results-panel"
    aria-labelledby="preference-title"
    :aria-busy="loading || saving"
  >
    <header class="settings-heading">
      <h2 id="preference-title">
        投资偏好
      </h2><p>统一设置本账号的持有偏好，无需逐只基金填写。</p>
    </header>
    <p
      v-if="loading"
      role="status"
    >
      正在读取投资偏好…
    </p>
    <p
      v-if="error"
      class="settings-error"
      role="alert"
    >
      {{ error }} <button
        v-if="!loaded"
        type="button"
        @click="load"
      >
        重新读取
      </button>
    </p>
    <form
      v-if="loaded"
      @submit.prevent="save"
    >
      <fieldset
        class="preference-options"
        :disabled="loading || saving || !canWrite"
      >
        <legend>持有偏好</legend>
        <label
          v-for="option in options"
          :key="option.value"
          class="preference-option"
          :class="{ selected: preference === option.value }"
        >
          <input
            v-model="preference"
            type="radio"
            name="investment-preference"
            :value="option.value"
            @change="message = ''"
          >
          <span><strong>{{ option.title }}</strong><small>{{ option.description }}</small></span>
        </label>
      </fieldset>
      <p class="settings-muted">
        {{ isDefault ? '尚未设置个人偏好，当前显示系统默认的均衡选项。' : `已保存：${options.find(option => option.value === saved)?.title}` }}
      </p>
      <p class="settings-note">
        这些选项参与当前持仓建议的周期取舍，不代表风险承受能力。资金安排中的用款和损失承受条件会优先限制建议；修改后需要重新评估。
      </p>
      <div class="settings-actions">
        <button
          v-if="canWrite"
          type="submit"
          :disabled="loading || saving || (!isDefault && preference === saved)"
        >
          {{ saving ? '保存中…' : '保存偏好' }}
        </button><span
          v-else
          class="settings-muted"
        >当前账号可查看，暂无修改权限。</span><span
          v-if="message"
          role="status"
        >{{ message }}</span>
      </div>
    </form>
  </section>
</template>

<style scoped>
.preference-options { display:grid; gap:12px; border:0; padding:0; margin:24px 0 16px; max-width:680px; }
.preference-options legend { font-weight:600; margin-bottom:12px; }
.preference-option { display:flex; align-items:center; gap:12px; padding:16px; border:1px solid var(--ui-line); border-radius:7px; cursor:pointer; }
.preference-option.selected { border-color:var(--ui-primary); background:var(--ui-canvas); }
.preference-option input { width:18px; height:18px; flex-shrink:0; accent-color:var(--ui-primary); }
.preference-option strong,.preference-option small { display:block; }
.preference-option small { margin-top:4px; color:var(--ui-muted); font-size:13px; line-height:1.6; }
</style>
