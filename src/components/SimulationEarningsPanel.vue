<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId } from 'vue'

withDefaults(defineProps<{ title: string; subtitle?: string; drawer?: boolean }>(), { subtitle: '', drawer: false })
const emit = defineEmits<{ close: [] }>()
const dialog = ref<InstanceType<typeof globalThis.HTMLDialogElement> | null>(null)
const titleId = useId()
let previousOverflow = ''
function closeOnBackdrop(event: globalThis.MouseEvent) {
  if (event.target !== dialog.value || !dialog.value) return
  const bounds = dialog.value.getBoundingClientRect()
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) emit('close')
}
onMounted(() => {
  previousOverflow = globalThis.document.body.style.overflow
  globalThis.document.body.style.overflow = 'hidden'
  dialog.value?.showModal()
})
onBeforeUnmount(() => {
  dialog.value?.close()
  globalThis.document.body.style.overflow = previousOverflow
})
</script>

<template>
  <Teleport to="body">
    <dialog
      ref="dialog"
      class="earnings-panel"
      :class="{ 'earnings-panel-drawer': drawer }"
      :aria-labelledby="titleId"
      @cancel.prevent="emit('close')"
      @click="closeOnBackdrop"
    >
      <div class="earnings-panel-layout">
        <header class="earnings-panel-header">
          <div>
            <h2 :id="titleId">
              {{ title }}
            </h2>
            <p v-if="subtitle">
              {{ subtitle }}
            </p>
          </div>
          <button
            type="button"
            class="earnings-panel-close"
            autofocus
            @click="emit('close')"
          >
            关闭
          </button>
        </header>
        <div class="earnings-panel-body">
          <slot />
        </div>
        <footer
          v-if="$slots.footer"
          class="earnings-panel-footer"
        >
          <slot name="footer" />
        </footer>
      </div>
    </dialog>
  </Teleport>
</template>

<style scoped>
.earnings-panel { width: min(620px, calc(100vw - 32px)); max-width: none; max-height: calc(100dvh - 48px); padding: 0; overflow: hidden; border: 1px solid #dfe8e3; border-radius: 16px; background: #fff; color: #203a34; box-shadow: 0 24px 80px #102a2226; box-sizing: border-box; font: inherit; }
.earnings-panel::backdrop { background: #102a2252; }
.earnings-panel-layout { display: flex; flex-direction: column; max-height: calc(100dvh - 50px); min-height: 0; }
.earnings-panel-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; flex-shrink: 0; padding: 24px; border-bottom: 1px solid #e5ece7; }
.earnings-panel-header h2 { margin: 0; font-size: 20px; line-height: 1.5; }
.earnings-panel-header p { margin: 5px 0 0; color: #647b72; font-size: 13px; line-height: 1.7; }
.earnings-panel-close { flex-shrink: 0; min-height: 36px; padding: 6px 13px; border: 1px solid #dfe8e3; border-radius: 7px; color: #48665b; background: #fff; font: inherit; font-size: 13px; cursor: pointer; }
.earnings-panel-close:hover { background: #f3f7f5; }
.earnings-panel-close:focus-visible { outline: 2px solid #0f766e; outline-offset: 3px; }
.earnings-panel-body { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 24px; }
.earnings-panel-footer { flex-shrink: 0; max-height: 40dvh; overflow-y: auto; padding: 16px 24px; border-top: 1px solid #e5ece7; background: #fafcfb; }
.earnings-panel :deep(.pagination) { margin: 0; padding: 0; border: 0; background: transparent; gap: 10px; font-size: 12px; }
.earnings-panel :deep(.pagination-controls) { gap: 6px; }
.earnings-panel :deep(.pagination button) { min-width: 52px; padding: 7px 9px; font-size: 12px; }
.earnings-panel-drawer { width: min(640px, 100vw); height: 100dvh; max-height: 100dvh; margin: 0 0 0 auto; border-width: 0 0 0 1px; border-radius: 0; }
.earnings-panel-drawer .earnings-panel-layout { height: 100%; max-height: 100dvh; }
@media (max-width: 600px) {
  .earnings-panel-header, .earnings-panel-body { padding: 18px; }
  .earnings-panel-footer { padding: 14px 18px; }
  .earnings-panel-header { gap: 12px; }
  .earnings-panel-drawer { width: 100%; border: 0; }
}
@media (prefers-reduced-motion: no-preference) {
  .earnings-panel-drawer[open] { animation: earnings-panel-enter 180ms ease-out; }
  @keyframes earnings-panel-enter { from { transform: translateX(36px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
}
</style>
