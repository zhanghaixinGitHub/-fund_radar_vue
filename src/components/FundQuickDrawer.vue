<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getFundDetail } from '@/api/funds'
import type { FundDetail } from '@/types/fund'
import { fundTypeLabel, formatChangeRate, changeRateTone } from '@/utils/fundPresentation'
import SimulationFundActions from '@/components/SimulationFundActions.vue'

const props = defineProps<{ code: string; watched?: boolean }>()
const emit = defineEmits<{ close: [] }>()
const route = useRoute()
const dialog = ref<globalThis.HTMLDialogElement | null>(null)
const detail = ref<FundDetail | null>(null)
const loading = ref(false)
const error = ref('')
let sequence = 0
const target = computed(() => ({
  name: props.watched ? 'watchlist-fund-detail' : 'fund-detail',
  params: { fundCode: props.code }, query: { from: route.fullPath },
}))
async function load() {
  const ticket = ++sequence
  detail.value = null; loading.value = true; error.value = ''
  try { const result = await getFundDetail(props.code); if (ticket === sequence) detail.value = result }
  catch { if (ticket === sequence) error.value = '基金资料暂时无法读取，请重试。' }
  finally { if (ticket === sequence) loading.value = false }
}
function outside(event: globalThis.MouseEvent) {
  if (event.target !== dialog.value) return
  const rect = dialog.value?.getBoundingClientRect()
  if (rect && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) emit('close')
}
watch(() => props.code, load, { immediate: true })
onMounted(() => dialog.value?.showModal())
onBeforeUnmount(() => { sequence++; dialog.value?.close() })
</script>

<template>
  <dialog
    ref="dialog"
    class="fund-quick-drawer"
    aria-labelledby="fund-quick-title"
    @click="outside"
    @cancel.prevent="emit('close')"
  >
    <header class="quick-drawer-header">
      <span>基金速览</span>
      <button
        type="button"
        class="secondary-button"
        aria-label="关闭基金速览"
        @click="emit('close')"
      >
        关闭
      </button>
    </header>
    <h2 id="fund-quick-title">
      {{ detail?.fundName || code }}
    </h2>
    <p class="quick-drawer-caption">
      {{ code }}<template v-if="detail">
        · {{ fundTypeLabel(detail.fundType) }}
      </template>
    </p>
    <p
      v-if="loading"
      role="status"
    >
      正在读取基金资料…
    </p>
    <div
      v-else-if="error"
      role="alert"
    >
      <p>{{ error }}</p><button
        type="button"
        class="secondary-button"
        @click="load"
      >
        重试
      </button>
    </div>
    <template v-else-if="detail">
      <dl class="quick-drawer-metrics">
        <div><dt>单位净值</dt><dd>{{ detail.unitNav ?? '—' }}</dd></div>
        <div>
          <dt>最新净值日涨跌</dt><dd :class="['change-rate', changeRateTone(detail.dayChangeRate)]">
            {{ formatChangeRate(detail.dayChangeRate) }}
          </dd>
        </div>
      </dl>
      <p class="quick-drawer-caption">
        净值截至 {{ detail.navAnnDate || detail.asOfDate || '暂无日期' }}
      </p>
      <dl class="quick-drawer-facts">
        <div>
          <dt>近一周</dt><dd :class="['change-rate', changeRateTone(detail.weekChangeRate)]">
            {{ formatChangeRate(detail.weekChangeRate) }}
          </dd>
        </div>
        <div>
          <dt>近一月</dt><dd :class="['change-rate', changeRateTone(detail.monthChangeRate)]">
            {{ formatChangeRate(detail.monthChangeRate) }}
          </dd>
        </div>
      </dl>
      <p
        v-if="detail.stale"
        class="state-message warning-message"
      >
        当前为缓存资料，请留意数据日期。
      </p>
    </template>
    <div class="quick-drawer-actions">
      <RouterLink
        class="primary-link"
        :to="target"
        @click="emit('close')"
      >
        打开完整资料
      </RouterLink>
      <SimulationFundActions :fund-code="code" />
    </div>
  </dialog>
</template>
