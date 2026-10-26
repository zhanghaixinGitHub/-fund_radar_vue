<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'
import type { FundManagerCardProfile } from '@/utils/fundManagerTimeline'
import { formatManagerTenureReturn } from '@/utils/fundManagerTimeline'

/** 仅展示已有任职资料；完整任期和累计天数均属于本基金，不推算全职业经历或投资收益。 */
defineProps<{ profile: FundManagerCardProfile; managerTarget?: RouteLocationRaw }>()
</script>

<template>
  <article
    class="manager-profile-card"
    :aria-label="`${profile.managerName}的基金经理资料`"
  >
    <header class="manager-profile-heading">
      <h3>
        <RouterLink
          v-if="managerTarget"
          class="manager-name-link"
          :to="managerTarget"
        >
          {{ profile.managerName }}
        </RouterLink>
        <template v-else>
          {{ profile.managerName }}
        </template>
      </h3>
      <span class="manager-education">{{ profile.educationLabel }}</span>
    </header>
    <p class="manager-tenure-summary">
      <template v-if="profile.tenureDays !== null">
        本基金累计任职
        <strong>{{ profile.incompleteTenure ? '至少 ' : '' }}{{ profile.tenureDays.toLocaleString('zh-CN') }}</strong>
        天
      </template>
      <template v-else>
        本基金任职时长暂缺
      </template>
    </p>
    <dl class="manager-profile-facts">
      <div class="manager-tenure-fact">
        <dt>本基金任期：</dt>
        <dd>
          <span
            v-for="range in profile.tenureRanges"
            :key="range.beginDate"
            class="manager-tenure-range"
          >
            <time :datetime="range.beginDate">{{ range.beginDate }}</time>
            <span>{{ range.endDate ? '至' : '至今' }}</span>
            <time
              v-if="range.endDate"
              :datetime="range.endDate"
            >{{ range.endDate }}</time>
          </span>
          <span v-if="!profile.tenureRanges.length">任职日期暂缺</span>
        </dd>
      </div>
      <div class="manager-return-fact">
        <dt>完整任期回报：</dt>
        <dd>
          <template v-if="profile.tenureReturns?.length">
            <div
              v-for="(entry, index) in profile.tenureReturns"
              :key="index"
              class="manager-return-entry"
            >
              <small v-if="profile.tenureReturns.length > 1">{{ entry.beginDate || '日期暂缺' }} 至 {{ entry.endDate || '今' }}</small>
              <strong
                :class="{
                  'is-positive': formatManagerTenureReturn(entry.performance) !== '暂无法计算' && Number(entry.performance.returnRate) > 0,
                  'is-negative': formatManagerTenureReturn(entry.performance) !== '暂无法计算' && Number(entry.performance.returnRate) < 0,
                }"
              >{{ formatManagerTenureReturn(entry.performance) }}</strong>
              <small v-if="formatManagerTenureReturn(entry.performance) === '暂无法计算'">
                {{ entry.performance.reason || '回报资料暂不完整' }}
              </small>
            </div>
          </template>
          <template v-else>
            回报资料暂不可用
          </template>
        </dd>
      </div>
    </dl>
  </article>
</template>

<style scoped>
.manager-profile-card { height: 100%; min-width: 0; padding: 18px; color: #203a34; background: #f7faf8; border: 1px solid var(--workspace-border, #dfe8e3); border-radius: 8px; }
.manager-profile-heading { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }
.manager-profile-heading h3 { margin: 0; font-size: 16px; line-height: 1.5; overflow-wrap: anywhere; }
/* 姓名默认与卡片正文同色，访问过也不变蓝紫；交互时再显示主题色和下划线。 */
.manager-name-link,
.manager-name-link:visited { color: #203a34; text-decoration: none; text-underline-offset: 4px; border-radius: 2px; }
.manager-name-link:hover,
.manager-name-link:focus-visible { color: var(--workspace-accent, #0f766e); text-decoration: underline; text-decoration-thickness: 1px; }
.manager-education { padding: 2px 8px; color: #536e63; background: #eaf1ed; border-radius: 4px; font-size: 12px; }
.manager-tenure-summary { margin: 8px 0 18px; color: #647b72; font-size: 12px; line-height: 1.6; }
.manager-tenure-summary strong { color: #425d52; font-weight: 600; font-variant-numeric: tabular-nums; }
/* 每个字段独占一行，标签和值横向对齐；多段任期只在右侧换行，避免再次变成上下两列。 */
.manager-profile-facts { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; margin: 0; }
.manager-profile-facts > div { display: grid; grid-template-columns: max-content minmax(0, 1fr); align-items: baseline; gap: 6px; }
.manager-profile-facts dt { margin: 0; color: #647b72; font-size: 12px; white-space: nowrap; }
.manager-profile-facts dd { display: grid; min-width: 0; gap: 6px; margin: 0; font-size: 13px; font-weight: 600; line-height: 1.6; }
.manager-tenure-range { display: flex; flex-wrap: wrap; gap: 0 3px; font-size: 12px; font-variant-numeric: tabular-nums; }
.manager-tenure-range time { white-space: nowrap; }
.manager-return-fact dd { color: #647b72; font-weight: 400; }
.manager-return-entry { display: grid; gap: 4px; }
.manager-return-entry strong { font-size: 16px; font-variant-numeric: tabular-nums; }
.manager-return-entry strong.is-positive { color: #b42318; }
.manager-return-entry strong.is-negative { color: #15803d; }
.manager-return-entry small { color: #647b72; font-size: 11px; font-weight: 400; line-height: 1.6; overflow-wrap: anywhere; }

@media (max-width: 420px) {
  .manager-profile-card { padding: 14px; }
  .manager-profile-facts { gap: 10px; }
}
</style>
