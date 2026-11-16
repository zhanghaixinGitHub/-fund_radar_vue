<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { usePageNavigation, type PageSection } from '@/composables/usePageNavigation'

const navigation = usePageNavigation()
const bar = ref<globalThis.HTMLElement | null>(null)
// group 标记分组起点，保留原有栏目顺序和地址。
const groups = computed(() => {
  const result: { title: string; items: PageSection[] }[] = []
  for (const item of navigation.sections.value) {
    if (!result.length || item.group) result.push({ title: item.group ?? navigation.moduleLabel.value, items: [] })
    result[result.length - 1]!.items.push(item)
  }
  return result
})
watch(() => [navigation.section.value, navigation.moduleLabel.value], async () => {
  await nextTick()
  const active = bar.value?.querySelector<globalThis.HTMLElement>('[aria-current="page"]')
  const sidebar = bar.value?.closest<globalThis.HTMLElement>('.workspace-sidebar')
  if (!active || !sidebar) return
  const bounds = sidebar.getBoundingClientRect()
  const item = active.getBoundingClientRect()
  if (item.top < bounds.top) sidebar.scrollTop -= bounds.top - item.top
  else if (item.bottom > bounds.bottom) sidebar.scrollTop += item.bottom - bounds.bottom
}, { immediate: true })
</script>

<template>
  <nav
    ref="bar"
    class="page-section-tabs"
    aria-label="页面栏目"
  >
    <section
      v-for="group in groups"
      :key="group.title"
      class="section-navigation-group"
      :aria-label="group.title"
    >
      <p
        v-if="group.title !== navigation.moduleLabel.value"
        class="section-navigation-heading"
      >
        {{ group.title }}
      </p>
      <RouterLink
        v-for="item in group.items"
        :key="item.key"
        :to="navigation.sectionTarget(item.key)"
        :class="{ 'is-selected': navigation.section.value === item.key }"
        :aria-current="navigation.section.value === item.key ? 'page' : undefined"
      >
        {{ item.label }}
      </RouterLink>
    </section>
  </nav>
</template>
