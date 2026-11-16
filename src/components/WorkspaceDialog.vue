<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{ titleId: string; busy?: boolean; error?: string }>()
const emit = defineEmits<{ close: [] }>()
const element = ref<globalThis.HTMLDialogElement | null>(null)
function close() { if (!props.busy) emit('close') }
onMounted(() => element.value?.showModal())
onBeforeUnmount(() => element.value?.close())
</script>

<template>
  <dialog
    ref="element"
    class="workspace-dialog"
    :aria-labelledby="titleId"
    :aria-busy="busy"
    @cancel.prevent="close"
  >
    <button
      class="workspace-dialog-close secondary-button"
      type="button"
      aria-label="关闭弹窗"
      :disabled="busy"
      @click="close"
    >
      关闭
    </button>
    <p
      v-if="error"
      class="form-error"
      role="alert"
    >
      {{ error }}
    </p>
    <slot />
  </dialog>
</template>
