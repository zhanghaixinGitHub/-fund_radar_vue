<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import PredictionHistoryDrawer from '@/components/PredictionHistoryDrawer.vue'
defineProps<{ title: string; label: string }>()
const open = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => { open.value = false })
</script>

<template>
  <div>
    <button
      type="button"
      class="history-disclosure"
      aria-haspopup="dialog"
      :aria-expanded="open"
      @click="open = true"
    >
      {{ label }}<span aria-hidden="true"> ›</span>
    </button>
    <PredictionHistoryDrawer
      v-if="open"
      :title="title"
      @close="open = false"
    >
      <slot />
    </PredictionHistoryDrawer>
  </div>
</template>

<style scoped>
.history-disclosure { display: flex; align-items: center; gap: 8px; box-sizing: border-box; width: 100%; min-height: 32px; padding: 4px 0; border: 0; background: transparent; color: var(--history-fall, #0f766e); font: inherit; font-size: 13px; text-align: left; text-decoration: none; cursor: pointer; }
.history-disclosure:hover { background: #dde7d6; text-decoration: none; }
.history-disclosure:focus-visible { outline: 2px solid var(--history-fall, #0f766e); outline-offset: 3px; }
@media (pointer: coarse) { .history-disclosure { min-height: 44px; } }
</style>
