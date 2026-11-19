<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { direction1dTime } from '@/utils/direction1d'

type State = 'ACTIVE' | 'RESOLVED' | 'RETRACTED' | 'EXPIRED'
interface Basis {
  title?: string; explanation?: string; condition?: string; basisDate?: string
  sourceName?: string; sourceUrl?: string; limitation?: string; changeExplanation?: string
}
interface Notice {
  noticeId: string; category: string; fundCode: string | null; revision: number; lifecycle: State
  payload: Basis; updatedAt: string; read: boolean
}
const { item, reasons, fundName, historyMode } = defineProps<{
  item: Notice; reasons: { label: string; payload?: Basis }[]; fundName?: string; historyMode?: boolean
}>()
const stateLabel = (value: Exclude<State, 'ACTIVE'>) => ({ RESOLVED: '条件已解除', RETRACTED: '提醒已撤销', EXPIRED: '信息观察期已结束' }[value] ?? '状态待核对')
const destination = (notice: Notice) => notice.fundCode && /^\d{6}$/.test(notice.fundCode)
  ? notice.category === 'thresholds'
    ? `/portfolio/${notice.fundCode}?section=reminders`
    : notice.category === 'events' ? `/funds/${notice.fundCode}?section=documents` : `/funds/${notice.fundCode}`
  : '/portfolio?section=funding'

function sourceLink(value?: string) {
  try {
    const url = new URL(value || '')
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''
  } catch {
    return ''
  }
}

</script>

<template>
  <article class="notification-content review-message">
    <dl class="review-facts">
      <div>
        <dt>关联基金</dt>
        <dd class="review-fund">
          <span v-if="item.fundCode && fundName" class="review-fund-name" :title="fundName">{{ fundName }}</span>
          <span v-if="item.fundCode && fundName">/</span>
          <span class="review-fund-code">{{ item.fundCode || '我的持仓' }}</span>
        </dd>
      </div>
      <div><dt>提醒状态</dt><dd><template v-if="item.lifecycle !== 'ACTIVE'">{{ stateLabel(item.lifecycle) }} · </template>{{ item.read ? '已读' : '未读' }}</dd></div>
      <div><dt>依据日期</dt><dd>{{ item.payload.basisDate || '—' }}</dd></div>
      <div><dt>{{ historyMode ? '发送时间' : '提醒时间' }}</dt><dd>{{ direction1dTime(item.updatedAt) }}</dd></div>
    </dl>
    <section class="review-reason">
      <h3>提醒原因</h3>
      <dl class="review-reason-list">
        <div v-for="reason in reasons" :key="reason.label">
          <dt>{{ reason.label }}</dt>
          <dd v-if="reason.payload">
            <p>{{ reason.payload.explanation || '这条提醒暂缺详细说明。' }}</p>
            <p v-if="reason.payload.condition">设置条件：{{ reason.payload.condition }}</p>
            <p v-if="reason.payload.changeExplanation">{{ reason.payload.changeExplanation }}</p>
            <p v-if="reason.payload.limitation">{{ reason.payload.limitation }}</p>
            <p v-if="reason.payload.sourceUrl || reason.payload.sourceName">
              <a v-if="sourceLink(reason.payload.sourceUrl)" :href="sourceLink(reason.payload.sourceUrl)" target="_blank" rel="noopener noreferrer">
                {{ reason.payload.sourceName || '查看公告原文' }}
              </a>
              <span v-else>{{ reason.payload.sourceName }}</span>
            </p>
          </dd>
          <dd v-else class="review-empty-reason">—</dd>
        </div>
      </dl>
    </section>
    <div class="review-actions">
      <RouterLink :to="destination(item)">
        前往复查
      </RouterLink>
      <slot name="actions" />
    </div>
  </article>
</template>

<style scoped>
.review-message { min-width: 0; overflow-wrap: anywhere; }
.review-facts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 20px; margin: 0; padding: 18px 0; border-bottom: 1px solid var(--ui-line); }
.review-facts dt { color: var(--ui-muted); font-size: 12px; }
.review-facts dd { margin: 2px 0 0; }
.review-fund { display: flex; align-items: baseline; gap: 6px; min-width: 0; }
.review-fund-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.review-fund-code { flex: none; }
.review-reason { padding-block: 18px; }
.review-reason h3 { margin: 0 0 8px; font-size: 16px; }
.review-reason-list { margin: 0; }
.review-reason-list > div { display: grid; grid-template-columns: 7em minmax(0, 1fr); gap: 8px; padding: 10px 0; border-bottom: 1px solid var(--ui-line); }
.review-reason-list dt { font-weight: 600; }
.review-reason-list dd { margin: 0; }
.review-empty-reason { color: var(--ui-muted); }
.review-reason p { margin: 0; white-space: pre-line; }
.review-reason p + p { margin-top: 4px; }
.review-message a { color: var(--ui-primary); text-underline-offset: 3px; }
.review-actions { display: flex; align-items: center; gap: 16px; white-space: nowrap; }
</style>
