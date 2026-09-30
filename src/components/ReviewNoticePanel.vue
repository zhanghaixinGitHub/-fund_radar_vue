<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { get, post } from '@/api/http'
import { direction1dTime } from '@/utils/direction1d'

type State = 'ACTIVE' | 'RESOLVED' | 'RETRACTED' | 'EXPIRED'
interface Basis {
  title: string; explanation: string; condition?: string; basisDate?: string
  sourceName?: string; sourceUrl?: string; limitation?: string; changeExplanation?: string
}
interface Notice {
  noticeId: string; scope: string | null; fundCode: string | null; revision: number; lifecycle: State
  payload: Basis; createdAt: string; updatedAt: string; read: boolean
}
interface Revision { revision: number; lifecycle: State; payload: Basis; recordedAt: string }
interface Page<T> { items: T[]; page: number; hasMore: boolean }
const result = ref<Page<Notice> | null>(null)
const busy = ref(false)
const error = ref('')
const historyError = ref<Record<string, string>>({})
const histories = ref<Record<string, Page<Revision>>>({})
const pending = ref(new Set<string>())
let sequence = 0
const stateLabel = (value: State) => ({ ACTIVE: '待复查', RESOLVED: '条件已解除', RETRACTED: '提醒已撤销', EXPIRED: '信息观察期已结束' }[value] ?? '状态待核对')
/** 复查入口由已知页面和基金代码形成，不执行载荷中的任意网址。 */
const destination = (item: Notice) => item.fundCode && /^\d{6}$/.test(item.fundCode)
  ? `/funds/${item.fundCode}?section=documents` : '/portfolio?section=funding'
const sourceUrl = (value?: string) => {
  try { const url = new globalThis.URL(value ?? ''); return url.protocol === 'https:' && url.hostname === 'www.dbfund.com.cn' ? url.href : null }
  catch { return null }
}
async function load(page = 1) {
  const ticket = ++sequence
  busy.value = true; error.value = ''
  try {
    const value = await get<Page<Notice>>(`/api/v1/notifications/reviews?page=${page}`)
    if (ticket === sequence) { result.value = value; histories.value = {}; historyError.value = {} }
  } catch { if (ticket === sequence) error.value = '复查提醒暂时无法读取，请稍后重试。' }
  finally { if (ticket === sequence) busy.value = false }
}
async function markRead(item: Notice) {
  if (pending.value.has(item.noticeId)) return
  pending.value.add(item.noticeId)
  try {
    const saved = await post<Notice>(`/api/v1/notifications/reviews/${item.noticeId}/read`, { revision: item.revision })
    if (result.value) result.value.items = result.value.items.map(row => row.noticeId === saved.noticeId ? saved : row)
  } catch { error.value = '已读状态暂未保存，请稍后重试。' }
  finally { pending.value.delete(item.noticeId) }
}
async function history(item: Notice, page = 1) {
  if (pending.value.has(item.noticeId)) return
  pending.value.add(item.noticeId); historyError.value[item.noticeId] = ''
  try { histories.value[item.noticeId] = await get<Page<Revision>>(`/api/v1/notifications/reviews/${item.noticeId}/history?page=${page}`) }
  catch { historyError.value[item.noticeId] = '变化历史暂时无法读取。' }
  finally { pending.value.delete(item.noticeId) }
}
onMounted(() => load())
onBeforeUnmount(() => sequence++)
</script>

<template>
  <section
    class="review-notices"
    aria-labelledby="review-notices-title"
  >
    <header>
      <h2 id="review-notices-title">
        事实与本人条件复查
      </h2><button
        type="button"
        :disabled="busy"
        @click="load()"
      >
        刷新
      </button>
    </header>
    <p>已读仅表示你查看过。条件解除、提醒撤销和消息观察期结束会分别说明，并保留变化历史。</p>
    <p
      v-if="error"
      role="alert"
    >
      {{ error }}
    </p>
    <p
      v-if="busy && !result"
      role="status"
    >
      提醒读取中…
    </p>
    <template v-if="result">
      <p v-if="!result.items.length">
        目前没有已形成的复查提醒。资料不足或尚未设置条件时，不代表风险不存在。
      </p>
      <article
        v-for="item in result.items"
        :key="item.noticeId"
      >
        <h3>{{ item.payload.title }}</h3>
        <p>{{ item.fundCode ? `基金 ${item.fundCode}` : item.scope === 'SIMULATED' ? '模拟组合' : '本人确认持仓' }} · {{ stateLabel(item.lifecycle) }} · {{ item.read ? '已读' : '未读' }}</p>
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
          <a
            v-if="sourceUrl(item.payload.sourceUrl)"
            :href="sourceUrl(item.payload.sourceUrl)!"
            target="_blank"
            rel="noopener noreferrer"
          >{{ item.payload.sourceName }}原文</a>
          <button
            v-if="!item.read"
            type="button"
            :disabled="pending.has(item.noticeId)"
            @click="markRead(item)"
          >
            标记已读
          </button>
          <button
            type="button"
            :disabled="pending.has(item.noticeId)"
            @click="history(item)"
          >
            查看变化历史
          </button>
        </div>
        <p
          v-if="historyError[item.noticeId]"
          role="status"
        >
          {{ historyError[item.noticeId] }}
        </p>
        <template v-if="histories[item.noticeId]">
          <ol>
            <li
              v-for="revision in histories[item.noticeId]!.items"
              :key="revision.revision"
            >
              {{ direction1dTime(revision.recordedAt) }} · {{ stateLabel(revision.lifecycle) }}
              <p v-if="revision.payload.condition">
                {{ revision.payload.condition }}
              </p>
              <p>{{ revision.payload.changeExplanation || revision.payload.explanation }}</p>
            </li>
          </ol>
          <div class="review-actions">
            <button
              v-if="histories[item.noticeId]!.page > 1"
              type="button"
              :disabled="pending.has(item.noticeId)"
              @click="history(item, histories[item.noticeId]!.page - 1)"
            >
              较新变化
            </button>
            <button
              v-if="histories[item.noticeId]!.hasMore"
              type="button"
              :disabled="pending.has(item.noticeId)"
              @click="history(item, histories[item.noticeId]!.page + 1)"
            >
              更早变化
            </button>
          </div>
        </template>
      </article>
      <nav
        class="review-actions"
        aria-label="复查提醒分页"
      >
        <button
          v-if="result.page > 1"
          type="button"
          :disabled="busy"
          @click="load(result.page - 1)"
        >
          上一页
        </button>
        <button
          v-if="result.hasMore"
          type="button"
          :disabled="busy"
          @click="load(result.page + 1)"
        >
          下一页
        </button>
      </nav>
    </template>
  </section>
</template>

<style scoped>
.review-notices { padding: 1.2rem; margin-block: 1rem; border: 1px solid var(--color-border, #dbe4e2); border-radius: 12px; overflow-wrap: anywhere; }
header, .review-actions { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
header { justify-content: space-between; }
article { border-top: 1px solid var(--color-border, #dbe4e2); padding-block: 1rem; }
p { line-height: 1.7; }
</style>
