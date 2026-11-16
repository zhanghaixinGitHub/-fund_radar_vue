import { onBeforeUnmount, ref } from 'vue'

/** Resolve every confirmation explicitly; navigation and duplicate requests never approve a write. */
export function useConfirmation() {
  const confirmation = ref('')
  let pending: ((accepted: boolean) => void) | null = null
  function resolveConfirmation(accepted: boolean) {
    const resolve = pending
    pending = null
    confirmation.value = ''
    resolve?.(accepted)
  }
  function confirmAction(message: string): Promise<boolean> {
    if (pending) return Promise.resolve(false)
    confirmation.value = message
    return new Promise(resolve => { pending = resolve })
  }
  onBeforeUnmount(() => resolveConfirmation(false))
  return { confirmation, confirmAction, resolveConfirmation }
}
