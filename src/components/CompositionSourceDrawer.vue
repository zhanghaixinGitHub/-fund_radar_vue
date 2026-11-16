<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { SimCompositionItem } from '@/types/simulation'
import { simMoney } from '@/utils/simulation'

const props = defineProps<{ item: SimCompositionItem; viewLabel: string }>()
const emit = defineEmits<{ close: [] }>()
const dialog = ref<globalThis.HTMLDialogElement | null>(null)
function percent(value: string | number) { return `${Number(value).toFixed(2)}%` }
function outside(event: globalThis.MouseEvent) {
  if (event.target !== dialog.value) return
  const rect = dialog.value?.getBoundingClientRect()
  if (rect && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) emit('close')
}
onMounted(() => dialog.value?.showModal())
onBeforeUnmount(() => dialog.value?.close())
</script>

<template>
  <dialog
    ref="dialog"
    class="composition-source-drawer"
    aria-labelledby="composition-source-title"
    @click="outside"
    @cancel.prevent="emit('close')"
  >
    <header class="composition-drawer-header">
      <span>{{ viewLabel }} · 分类来源</span>
      <button
        type="button"
        class="secondary-button"
        aria-label="关闭分类来源"
        @click="emit('close')"
      >
        关闭
      </button>
    </header>
    <h2 id="composition-source-title">
      {{ props.item.name }}
    </h2>
    <p class="composition-drawer-amount">
      <strong>{{ simMoney(props.item.amount) }}</strong> 元 · {{ percent(props.item.weightPct) }}
    </p>
    <p
      v-if="props.item.description"
      class="composition-note"
    >
      {{ props.item.description }}
    </p>
    <p
      v-if="props.item.pending"
      class="composition-note"
    >
      这部分表示资料尚未核齐，不代表真实资产或行业为零。
    </p>
    <section
      v-if="props.item.evidence.length"
      class="composition-evidence"
      aria-labelledby="composition-evidence-title"
    >
      <h3 id="composition-evidence-title">
        主题分类依据
      </h3>
      <ul>
        <li
          v-for="evidence in props.item.evidence"
          :key="`${evidence.sourceName}-${evidence.sourceUrl}`"
        >
          <a
            v-if="evidence.sourceUrl"
            :href="evidence.sourceUrl"
            target="_blank"
            rel="noopener noreferrer"
          >{{ evidence.sourceName }}</a>
          <span v-else>{{ evidence.sourceName }}</span>
          <small>分类核验日期：{{ evidence.classificationDate }}</small>
        </li>
      </ul>
    </section>
    <section aria-labelledby="composition-funds-title">
      <h3 id="composition-funds-title">
        来源基金
      </h3>
      <p
        v-if="!props.item.contributions.length"
        class="composition-note"
      >
        暂无可列示的来源基金。
      </p>
      <article
        v-for="contribution in props.item.contributions"
        :key="contribution.fundCode"
        class="composition-contribution"
      >
        <div class="composition-contribution-heading">
          <strong>{{ contribution.fundName }}</strong><span>{{ simMoney(contribution.amount) }} 元</span>
        </div>
        <p>{{ contribution.fundCode }} · 占本图统计基数 {{ percent(contribution.weightPct) }}</p>
        <ul
          v-if="contribution.sources.length"
          class="composition-report-list"
        >
          <li
            v-for="source in contribution.sources"
            :key="`${source.fundCode}-${source.endDate}-${source.title}`"
          >
            <span>{{ source.fundName || source.fundCode }} · 报告截至 {{ source.endDate }}</span>
            <a
              v-if="source.sourceUrl"
              :href="source.sourceUrl"
              target="_blank"
              rel="noopener noreferrer"
            >查看报告</a>
            <small>公布于 {{ source.publishedDate }}<template v-if="!source.fullDisclosure">
              · 主要持仓披露
            </template></small>
          </li>
        </ul>
      </article>
    </section>
  </dialog>
</template>
