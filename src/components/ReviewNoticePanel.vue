<script setup lang="ts">
import ListPagination from '@/components/ListPagination.vue'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { get, post } from '@/api/http'
import { direction1dTime } from '@/utils/direction1d'
import { readFixedPage } from '@/utils/pagination'

type State = 'ACTIVE' | 'RESOLVED' | 'RETRACTED' | 'EXPIRED'
interface Basis {
  title: string; explanation: string; condition?: string; basisDate?: string
  sourceName?: string; sourceUrl?: string; limitation?: string; changeExplanation?: string
}
interface Notice {
  noticeId: string; category: string; fundCode: string | null; revision: number; lifecycle: State
  payload: Basis; updatedAt: string; read: boolean
}
interface Revision { revision: number; lifecycle: State; payload: Basis; recordedAt: string }
interface Page<T> { items: T[]; page: number; hasMore: boolean }
const { item, canMarkRead } = defineProps<{ item: Notice; canMarkRead: boolean }>()
const emit = defineEmits<{ read: [] }>()
const historySize = ref(10)
const historyError = ref('')
const revisions = ref<Page<Revision> | null>(null)
const pending = ref(false)
const stateLabel = (value: State) => ({ ACTIVE: '待复查', RESOLVED: '条件已解除', RETRACTED: '提醒已撤销', EXPIRED: '信息观察期已结束' }[value] ?? '状态待核对')
const destination = (notice: Notice) => notice.fundCode && /^\d{6}$/.test(notice.fundCode)
  ? notice.category === 'thresholds'
    ? '/portfolio?section=holdings'
    : `/funds/${notice.fundCode}?section=documents`
  : '/portfolio?section=funding'

async function markRead() {
  pending.value = true
  historyError.value = ''
  try {
    await post(`/api/v1/notifications/reviews/${item.noticeId}/read`, { revision: item.revision })
    emit('read')
  } catch {
    historyError.value = '已读状态暂未保存，请稍后重试。'
  } finally {
    pending.value = false
  }
}

async function history(page = 1) {
  pending.value = true
  historyError.value = ''
  try {
    revisions.value = await readFixedPage(
      target => get<Page<Revision>>(`/api/v1/notifications/reviews/${item.noticeId}/history?page=${target}`),
      page,
      historySize.value,
    )
  } catch {
    historyError.value = '变化历史暂时无法读取，请重试。'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <article class="notification-content review-message">
    <h3>{{ item.payload.title }}</h3>
    <p>{{ item.fundCode ? `基金 ${item.fundCode}` : '我的持仓' }} · {{ stateLabel(item.lifecycle) }} · {{ item.read ? '已读' : '未读' }}</p>
    <p v-if="item.payload.condition">
      原条件：{{ item.payload.condition }}
    </p>
    <p>{{ item.payload.explanation }}</p>
    <p v-if="item.payload.changeExplanation">
      {{ item.payload.changeExplanation }}
    </p>
    <p v-if="item.payload.limitation">
      {{ item.payload.limitation }}
    </p>
    <p>依据日期 {{ item.payload.basisDate || '未知' }} · 最近变化 {{ direction1dTime(item.updatedAt) }}</p>
    <div class="review-actions">
      <RouterLink :to="destination(item)">
        前往复查
      </RouterLink>
      <button
        v-if="!item.read && canMarkRead"
        class="text-button"
        type="button"
        :disabled="pending"
        @click="markRead()"
      >
        标记已读
      </button>
      <button
        class="text-button"
        type="button"
        :disabled="pending"
        @click="history()"
      >
        查看变化历史
      </button>
    </div>
    <p
      v-if="historyError"
      role="status"
    >
      {{ historyError }}
    </p>
    <template v-if="revisions">
      <ol>
        <li
          v-for="revision in revisions.items"
          :key="revision.revision"
        >
          {{ direction1dTime(revision.recordedAt) }} · {{ stateLabel(revision.lifecycle) }}
          <p v-if="revision.payload.condition">
            {{ revision.payload.condition }}
          </p>
          <p>{{ revision.payload.changeExplanation || revision.payload.explanation }}</p>
        </li>
      </ol>
      <ListPagination
        :page="revisions.page"
        :page-size="historySize"
        :total="item.revision"
        :loading="pending"
        label="提醒变化历史分页"
        @change="(value, size) => { historySize = size; history(value) }"
      />
    </template>
  </article>
</template>

<style scoped>
.review-message { min-width: 0; overflow-wrap: anywhere; }
.review-message h3 { margin: 0; }
.review-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
</style>
