import { nextTick, onBeforeUnmount, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isWorkspaceLocalTabTransition, isWorkspaceReturn, restoreWorkspaceScroll, workspaceScrollKey } from '@/utils/workspaceScroll'

export function useWorkspaceScroll(content: Ref<globalThis.HTMLElement | null>) {
  const router = useRouter()
  const route = useRoute()
  const positions = new Map<string, number>()
  let cancel = () => {}
  let generation = 0
  let menuTarget: string | null = null
  let restoreTop = 0
  function resetForMenu(target: string) {
    menuTarget = workspaceScrollKey(router.resolve(target).fullPath)
    cancel()
    if (content.value) content.value.scrollTop = 0
  }
  // Capture while the old page is still mounted, before its height can collapse.
  const removeGuard = router.beforeEach((to, from) => {
    generation++
    cancel()
    if (content.value) positions.set(workspaceScrollKey(from.fullPath), content.value.scrollTop)
    const target = workspaceScrollKey(to.fullPath)
    restoreTop = isWorkspaceLocalTabTransition(from.fullPath, to.fullPath)
      ? content.value?.scrollTop ?? 0
      : isWorkspaceReturn(from.query.from, to.fullPath, menuTarget === target) ? positions.get(target) ?? 0 : 0
    menuTarget = null
  })
  watch(() => route.fullPath, async () => {
    const ticket = generation
    await nextTick()
    const area = content.value
    if (!area || ticket !== generation) return
    const top = restoreTop
    cancel = restoreWorkspaceScroll(area, top, retry => {
      let frame = 0
      const schedule = () => {
        if (!frame) frame = globalThis.requestAnimationFrame(() => { frame = 0; retry() })
      }
      const resize = new globalThis.ResizeObserver(schedule)
      const observeChildren = () => { resize.disconnect(); for (const child of area.children) resize.observe(child) }
      const mutations = new globalThis.MutationObserver(() => { observeChildren(); schedule() })
      mutations.observe(area, { childList: true, subtree: true, characterData: true })
      observeChildren()
      // User input wins over a pending restore; never pull them back after they start browsing.
      const interrupt = () => cancel()
      for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown']) area.addEventListener(event, interrupt, { passive: true })
      const timeout = globalThis.setTimeout(interrupt, 30_000)
      return () => {
        mutations.disconnect(); resize.disconnect()
        globalThis.cancelAnimationFrame(frame); globalThis.clearTimeout(timeout)
        for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown']) area.removeEventListener(event, interrupt)
      }
    })
  }, { flush: 'post' })
  onBeforeUnmount(() => { generation++; cancel(); removeGuard() })
  return { resetForMenu }
}
