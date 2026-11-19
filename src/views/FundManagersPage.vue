<script setup lang="ts">
import ListPagination from '@/components/ListPagination.vue'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getFundManagers } from '@/api/fundManagers'
import { normalizePageSize } from '@/utils/pagination'
import type { ManagerPage } from '@/types/fundManager'
import { useManagerRefresh } from '@/composables/useManagerRefresh'
import { managerDate } from '@/utils/fundManagerNavigation'

const route = useRoute()
const router = useRouter()
const pageSize = computed(() => normalizePageSize(route.query.size))
const keyword = ref('')
const company = ref('')
const state = ref('all')
const fundType = ref('')
const result = ref<ManagerPage | null>(null)
const loading = ref(false)
const errorMessage = ref('')
let request = 0

async function load(quiet = false): Promise<void> {
  const current = ++request
  if (!quiet) loading.value = true
  errorMessage.value = ''
  try {
    const value = await getFundManagers({ keyword: String(route.query.keyword ?? ''), company: String(route.query.company ?? ''),
      state: String(route.query.state ?? 'all'), fundType: String(route.query.fundType ?? ''),
      page: Math.max(1, Number(route.query.page) || 1), pageSize: pageSize.value,
      snapshotId: !quiet && route.query.snapshotId ? String(route.query.snapshotId) : undefined })
    if (current === request) result.value = value
  } catch (error) {
    if (current === request) errorMessage.value = error instanceof Error ? error.message : '基金经理资料暂不可用，请稍后重试。'
  } finally { if (current === request) loading.value = false }
}
async function search(): Promise<void> {
  const target = { name: 'fund-managers', query: {
    size: String(pageSize.value),
    ...(keyword.value.trim() ? { keyword: keyword.value.trim() } : {}),
    ...(company.value.trim() ? { company: company.value.trim() } : {}), ...(state.value !== 'all' ? { state: state.value } : {}),
    ...(fundType.value ? { fundType: fundType.value } : {}),
  } }
  if (router.resolve(target).fullPath === route.fullPath) await load()
  else await router.push(target)
}
async function resetFilters(): Promise<void> {
  keyword.value = ''; company.value = ''; state.value = 'all'; fundType.value = ''
  await search()
}
async function changePage(page: number, size = pageSize.value): Promise<void> {
  await router.push({ query: { ...route.query, page: String(page), size: String(size), snapshotId: size === pageSize.value ? result.value?.snapshotId ?? undefined : undefined } })
}
watch(() => route.fullPath, () => {
  keyword.value = String(route.query.keyword ?? '')
  company.value = String(route.query.company ?? '')
  state.value = String(route.query.state ?? 'all')
  fundType.value = String(route.query.fundType ?? '')
  void load()
}, { immediate: true })
useManagerRefresh(() => load(true))
</script>

<template>
  <section
    class="manager-panel"
    aria-labelledby="manager-directory-title"
  >
    <h1 id="manager-directory-title" class="visually-hidden">基金经理</h1>
    <section
      class="fund-results-panel manager-directory-panel"
      aria-label="基金经理列表"
    >
      <h2 class="fund-results-title">
        基金经理列表
      </h2>
      <form
        class="fund-filter-toolbar manager-filter-toolbar"
        :aria-busy="loading"
        @submit.prevent="search"
      >
        <div class="fund-filter-search">
          <label
            class="visually-hidden"
            for="manager-name"
          >经理姓名</label>
          <svg
            class="fund-filter-search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            aria-hidden="true"
          ><circle
            cx="10.5"
            cy="10.5"
            r="6.5"
          /><path d="m15.5 15.5 4.5 4.5" /></svg>
          <input
            id="manager-name"
            v-model="keyword"
            maxlength="128"
            placeholder="搜索经理姓名"
            type="search"
          >
        </div>
        <div class="manager-company-filter">
          <label
            class="visually-hidden"
            for="manager-company"
          >基金公司</label>
          <input
            id="manager-company"
            v-model="company"
            maxlength="128"
            placeholder="基金公司"
            type="search"
          >
        </div>
        <div class="fund-filter-select">
          <select
            v-model="state"
            aria-label="任职范围"
          >
            <option value="all">
              含历史任职
            </option><option value="current">
              有在管基金
            </option><option value="history">
              有离任记录
            </option>
          </select>
        </div>
        <div class="fund-filter-select">
          <select
            v-model="fundType"
            aria-label="基金类型"
          >
            <option value="">
              全部类型
            </option><option value="STOCK">
              股票型
            </option><option value="MIXED">
              混合型
            </option><option value="BOND">
              债券型
            </option><option value="INDEX">
              指数型
            </option><option value="MONEY">
              货币型
            </option><option value="QDII">
              QDII
            </option><option value="FOF">
              FOF
            </option><option value="OTHER">
              其他
            </option>
          </select>
        </div>
        <button
          class="secondary-button fund-filter-submit"
          type="submit"
          :disabled="loading"
        >
          {{ loading ? '查询中' : '查找' }}
        </button>
        <button
          class="secondary-button fund-filter-reset"
          type="button"
          :disabled="loading"
          @click="resetFilters"
        >
          重置
        </button>
      </form>
      <p
        v-if="errorMessage"
        class="state-message error-message"
        role="alert"
      >
        {{ errorMessage }} <button
          type="button"
          @click="load()"
        >
          重试
        </button>
      </p>
      <p
        v-if="loading && !result"
        class="manager-empty"
        role="status"
      >
        正在读取经理资料…
      </p>
      <template v-if="result">
        <p class="manager-note">
          {{ result.notice }}<span v-if="result.stale"> 当前显示上次保存的资料。</span>
        </p>
        <p
          v-if="!result.items.length"
          class="manager-empty"
        >
          暂未收录相关经理，可调整姓名或基金公司查询。
        </p>
        <div
          v-else
          class="manager-table-scroll"
          role="region"
          aria-label="基金经理列表，宽表可左右滚动"
          tabindex="0"
          :aria-busy="loading"
        >
          <table class="manager-table market-table" data-table-align data-align-right="4" data-align-center="6">
            <thead>
              <tr>
                <th scope="col">
                  姓名
                </th><th scope="col">
                  关联公司 / 资料涉及基金
                </th><th scope="col">
                  学历
                </th><th scope="col">
                  已收录在管份额
                </th><th scope="col">
                  核对日期
                </th>
                <th scope="col">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="manager in result.items"
                :key="manager.managerId"
              >
                <td>
                  {{ manager.managerName }}
                </td>
                <td>{{ manager.companies.join('、') || '公司暂缺' }}<small>{{ manager.anchorFundName }}</small></td>
                <td>{{ manager.education || '暂缺' }}</td><td>{{ manager.shareCount === null ? '待核对' : `${manager.shareCount} 个` }}</td>
                <td>{{ manager.checkedAt ? managerDate(manager.checkedAt) : '待核对' }}</td>
                <td>
                  <button
                    class="market-table-action"
                    type="button"
                    :aria-label="`查看${manager.managerName}的详情`"
                    @click="router.push({ name: 'fund-manager-detail', params: { managerId: manager.managerId }, query: { from: route.fullPath } })"
                  >
                    查看详情
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <ListPagination
          v-if="result.totalCount > 0"
          :page="result.page"
          :page-size="result.pageSize"
          :total="result.totalCount"
          :loading="loading"
          label="经理目录分页"
          @change="changePage"
        />
      </template>
    </section>
  </section>
</template>

<style src="@/styles/fund-managers.css"></style>
