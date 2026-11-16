<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { usePageNavigation, type PageSection } from '@/composables/usePageNavigation'

const props = defineProps<{
  items?: PageSection[]
  current?: string
  target?: (key: string) => RouteLocationRaw
}>()
const navigation = usePageNavigation()
const entries = computed(() => props.items ?? navigation.sections.value)
const selected = computed(() => props.current ?? navigation.section.value)
const destination = (key: string) => (props.target ?? navigation.sectionTarget)(key)
const bar = ref<globalThis.HTMLElement | null>(null)
function wheel(event: globalThis.WheelEvent) {
  const element = bar.value
  if (!element || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return
  const before = element.scrollLeft
  const unit = event.deltaMode === 1 ? 20 : event.deltaMode === 2 ? element.clientWidth : 1
  element.scrollLeft += event.deltaY * unit
  if (element.scrollLeft !== before) event.preventDefault()
}
watch(() => selected.value, async () => {
  await nextTick()
  const element = bar.value
  const active = element?.querySelector<globalThis.HTMLElement>('[aria-current="page"]')
  if (!element || !active) return
  if (active.offsetLeft < element.scrollLeft) element.scrollLeft = active.offsetLeft
  else if (active.offsetLeft + active.offsetWidth > element.scrollLeft + element.clientWidth) {
    element.scrollLeft = active.offsetLeft + active.offsetWidth - element.clientWidth
  }
}, { immediate: true })
</script>

<template>
  <nav
    ref="bar"
    class="page-section-tabs"
    aria-label="页面栏目"
    @wheel="wheel"
  >
    <RouterLink
      v-for="item in entries"
      :key="item.key"
      :to="destination(item.key)"
      :class="{ 'is-selected': selected === item.key }"
      :aria-current="selected === item.key ? 'page' : undefined"
    >
      {{ item.label }}
    </RouterLink>
  </nav>
</template>
