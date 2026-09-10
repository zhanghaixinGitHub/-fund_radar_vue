<script setup lang="ts">
import { computed, ref } from 'vue'
import SimulationTradeDialog from '@/components/SimulationTradeDialog.vue'
import { useAuthStore } from '@/stores/auth'

defineProps<{ fundCode: string }>()
const auth = useAuthStore()
const mode = ref<'BUY' | 'PLAN' | null>(null)
const message = ref('')
const canBuy = computed(() => auth.hasPermission('SIM_PORTFOLIO_SELF_WRITE'))
const canPlan = computed(() => auth.hasPermission('SIM_PLAN_SELF_WRITE'))
function saved(value: string) { mode.value = null; message.value = value }
</script>

<template>
  <div
    v-if="canBuy || canPlan"
    class="sim-fund-actions"
  >
    <div class="sim-actions">
      <button
        v-if="canBuy"
        class="primary-button"
        type="button"
        @click="mode = 'BUY'"
      >
        模拟买入 / 加仓
      </button>
      <button
        v-if="canPlan"
        class="secondary-button"
        type="button"
        @click="mode = 'PLAN'"
      >
        设置定投
      </button>
      <RouterLink
        class="primary-link"
        :to="{ path: '/portfolio', query: { fundCode } }"
      >
        查看持仓
      </RouterLink>
    </div>
    <p
      v-if="message"
      role="status"
    >
      {{ message }}
    </p>
    <SimulationTradeDialog
      v-if="mode"
      :fund-code="fundCode"
      :mode="mode"
      @close="mode = null"
      @saved="saved"
    />
  </div>
</template>
