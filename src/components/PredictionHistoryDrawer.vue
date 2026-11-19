<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId } from 'vue'
const props = withDefaults(defineProps<{ title: string; closeLabel?: string; closeDisabled?: boolean }>(), { closeLabel: '关闭预测详情' })
const emit = defineEmits<{ close: [] }>()
const dialog = ref<globalThis.HTMLDialogElement | null>(null)
const titleId = useId()
function requestClose() {
  if (!props.closeDisabled) emit('close')
}
function outside(event: globalThis.MouseEvent) {
  if (event.target !== dialog.value) return
  const bounds = dialog.value.getBoundingClientRect()
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) requestClose()
}
onMounted(() => dialog.value?.showModal())
onBeforeUnmount(() => dialog.value?.close())
</script>

<template>
  <dialog
    ref="dialog"
    class="fund-quick-drawer prediction-history-drawer"
    :aria-labelledby="titleId"
    @cancel.prevent="requestClose"
    @click="outside"
  >
    <header class="history-drawer-heading">
      <h2 :id="titleId">
        {{ title }}
      </h2>
      <button
        type="button"
        class="secondary-button"
        :aria-label="closeLabel"
        :disabled="closeDisabled"
        autofocus
        @click="requestClose"
      >
        关闭
      </button>
    </header>
    <div class="history-drawer-content">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="history-drawer-footer">
      <slot name="footer" />
    </footer>
  </dialog>
</template>

<style scoped>
.prediction-history-drawer { width: min(640px, 100vw); box-sizing: border-box; padding: 0; border: 1px solid var(--ui-line, #d8e2d3); color: var(--ui-ink, #263d33); }
.history-drawer-heading { position: sticky; top: 0; z-index: 1; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 22px 24px; border-bottom: 1px solid var(--ui-line, #d8e2d3); background: var(--ui-surface, #fff); }
.history-drawer-heading h2 { margin: 0; font-size: 20px; overflow-wrap: anywhere; }
.history-drawer-heading button { flex-shrink: 0; min-height: 44px; }
.history-drawer-content { padding: 0 24px 28px; overflow-wrap: anywhere; line-height: 1.8; font-size: 14px; }
.prediction-history-drawer[open]:has(.history-drawer-footer) { display: flex; flex-direction: column; }
.prediction-history-drawer:has(.history-drawer-footer) > .history-drawer-content { flex: 1 0 auto; }
.prediction-history-drawer:has(.history-drawer-footer) > :is(header, footer) { flex-shrink: 0; }
.history-drawer-footer { position: sticky; bottom: 0; display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; padding: 12px 24px; background: var(--ui-surface); border-top: 1px solid var(--ui-line); }
.prediction-history-drawer .history-drawer-content :deep(p) { font-size: 14px; line-height: 1.8; }
.history-drawer-content :deep(.daily-review + .daily-review) { margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--ui-line, #d8e2d3); }
@media (max-width: 480px) { .history-drawer-heading { padding: 16px; } .history-drawer-content { padding: 0 16px 24px; } }
</style>
