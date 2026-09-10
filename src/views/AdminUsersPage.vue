<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePageNavigation } from '@/composables/usePageNavigation'

import {
  grantAdminUserWatchlistCredits,
  getAdminUserWatchlistCreditLedger,
  getAdminUserPortfolio,
  getAdminUsers,
  resetAdminUserPassword,
  transferLegacyWatchlist,
  updateAdminUserRole,
  updateAdminUserStatus,
} from '@/api/adminUsers'
import type { AccountRole } from '@/types/auth'
import type { AdminUser, WatchlistCreditLedgerPage } from '@/types/adminUser'
import type { PortfolioSnapshot } from '@/types/portfolio'
import { ACCOUNT_ROLE_OPTIONS, accountDisplayLabel, accountRoleLabel } from '@/utils/accountPresentation'

const route = useRoute()
const router = useRouter()
const { section, sectionLabel, sectionTarget } = usePageNavigation()
const users = ref<AdminUser[]>([])
const selectedUser = computed(() => users.value.find((user) => user.userId === route.query.user) ?? null)
const detailTab = computed(() => ['ledger', 'portfolio'].includes(String(route.query.tab)) ? String(route.query.tab) : 'account')
let detailRequest = 0
let usersRequest = 0
const total = ref(0)
const page = ref(Math.max(0, Number.isInteger(Number(route.query.page)) ? Number(route.query.page) - 1 : 0))
const pageSize = 20
const loading = ref(false)
const actionUserId = ref<string | null>(null)
const errorMessage = ref('')
const successMessage = ref('')
const resetTarget = ref<AdminUser | null>(null)
const resetPasswordValue = ref('')
const creditTarget = ref<AdminUser | null>(null)
const creditAmount = ref(1)
const creditReason = ref('')
const transferTargetUserId = ref('')
const portfolioUser = ref<AdminUser | null>(null)
const portfolio = ref<PortfolioSnapshot | null>(null)
const creditLedgerUser = ref<AdminUser | null>(null)
const creditLedger = ref<WatchlistCreditLedgerPage | null>(null)
const creditLedgerPage = ref(0)
const creditLedgerLoading = ref(false)
const creditLedgerPageSize = 10

const roleOptions = ACCOUNT_ROLE_OPTIONS

const activeUsers = computed(() => users.value.filter((user) => !user.legacyRecord && user.status === 'ACTIVE'))
const hasPreviousPage = computed(() => page.value > 0)
const hasNextPage = computed(() => (page.value + 1) * pageSize < total.value)

/** 读取脱敏账户列表；服务端已完成权限和数据范围判断。 */
async function loadUsers(): Promise<void> {
  const sequence = ++usersRequest
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await getAdminUsers(page.value, pageSize)
    if (sequence !== usersRequest) return
    users.value = response.items
    total.value = response.total
  } catch (error) {
    if (sequence !== usersRequest) return
    users.value = []
    total.value = 0
    errorMessage.value = error instanceof Error ? error.message : '用户列表暂时不可用。'
  } finally {
    if (sequence === usersRequest) loading.value = false
  }
}

/** 变更角色前由管理员二次确认；目标会话由服务端撤销。 */
async function changeRole(user: AdminUser, role: AccountRole): Promise<void> {
  if (role === user.role) {
    return
  }
  if (!globalThis.confirm(`确认将“${accountDisplayLabel(user)}”调整为“${accountRoleLabel(role)}”吗？该用户需要重新登录。`)) {
    await loadUsers()
    return
  }
  await runUserAction(user.userId, async () => {
    await updateAdminUserRole(user.userId, role)
    successMessage.value = '角色已更新，目标用户的既有会话已失效。'
  })
}

/** 启用或停用前二次确认，避免误操作。 */
async function toggleStatus(user: AdminUser): Promise<void> {
  const targetStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
  if (!globalThis.confirm(`确认${targetStatus === 'ACTIVE' ? '启用' : '停用'}“${accountDisplayLabel(user)}”吗？`)) {
    return
  }
  await runUserAction(user.userId, async () => {
    await updateAdminUserStatus(user.userId, targetStatus)
    successMessage.value = targetStatus === 'ACTIVE' ? '账户已启用。' : '账户已停用，既有会话已失效。'
  })
}

/** 打开人工重置密码表单；密码输入只保留在当前表单，提交后立即清空。 */
function openPasswordReset(user: AdminUser): void {
  resetTarget.value = user
  resetPasswordValue.value = ''
  successMessage.value = ''
}

async function submitPasswordReset(): Promise<void> {
  if (!resetTarget.value) {
    return
  }
  if (!resetPasswordValue.value) {
    errorMessage.value = '请输入新密码。'
    return
  }
  const target = resetTarget.value
  await runUserAction(target.userId, async () => {
    await resetAdminUserPassword(target.userId, resetPasswordValue.value)
    resetPasswordValue.value = ''
    resetTarget.value = null
    successMessage.value = '密码已人工重置，目标用户的既有会话已失效。'
  })
}

/** 打开积分发放表单；积分仅代表额外有效关注名额，发放原因必填且不写入浏览器持久化状态。 */
function openCreditGrant(user: AdminUser): void {
  successMessage.value = ''
  void router.push({ path: route.path, query: { ...route.query, section: 'credits', user: user.userId, tab: undefined } })
}

async function submitCreditGrant(): Promise<void> {
  if (!creditTarget.value) {
    return
  }
  const amount = Number(creditAmount.value)
  const reason = creditReason.value.trim()
  if (!Number.isInteger(amount) || amount < 1 || amount > 10_000) {
    errorMessage.value = '试用关注积分数量必须在 1 至 10000 之间。'
    return
  }
  if (!reason) {
    errorMessage.value = '请填写试用关注积分发放原因。'
    return
  }
  const target = creditTarget.value
  if (!globalThis.confirm(`确认向“${accountDisplayLabel(target)}”发放 ${amount} 个试用关注积分吗？积分只能扩容有效关注名额。`)) {
    return
  }
  await runUserAction(target.userId, async () => {
    await grantAdminUserWatchlistCredits(target.userId, amount, reason)
    creditTarget.value = null
    creditAmount.value = 1
    creditReason.value = ''
    successMessage.value = '试用关注积分已发放，目标账户的有效关注额度已更新。'
    await router.replace(sectionTarget('credits'))
  })
}

/** 经浏览器确认后请求迁移历史关注；后端还会校验 confirmed 标志和目标账号状态。 */
async function submitLegacyTransfer(): Promise<void> {
  if (!transferTargetUserId.value) {
    errorMessage.value = '请选择接收历史关注的已启用用户。'
    return
  }
  const target = activeUsers.value.find((user) => user.userId === transferTargetUserId.value)
  if (!target || !globalThis.confirm(`确认将历史本机关注迁移给“${accountDisplayLabel(target)}”吗？提醒和持仓不会被迁移。`)) {
    return
  }
  await runUserAction('legacy-watchlist', async () => {
    const result = await transferLegacyWatchlist(target.userId)
    successMessage.value = `已迁移 ${result.transferredCount} 条历史关注；提醒和持仓保持原归属。`
    transferTargetUserId.value = ''
  })
}

/** 管理员按需查看指定用户的已确认持仓，不把财务数据写入全局状态。 */
async function viewPortfolio(user: AdminUser): Promise<void> {
  const sequence = ++detailRequest
  actionUserId.value = user.userId
  errorMessage.value = ''
  try {
    portfolioUser.value = user
    const response = await getAdminUserPortfolio(user.userId)
    if (sequence !== detailRequest) return
    portfolio.value = response
  } catch (error) {
    if (sequence !== detailRequest) return
    portfolioUser.value = null
    portfolio.value = null
    errorMessage.value = error instanceof Error ? error.message : '持仓快照暂时不可用。'
  } finally {
    if (sequence === detailRequest) actionUserId.value = null
  }
}

/** 系统管理员按需查看指定用户积分流水；明细只保留在当前页面内存，不进入全局状态。 */
async function viewCreditLedger(user: AdminUser): Promise<void> {
  actionUserId.value = user.userId
  errorMessage.value = ''
  try {
    creditLedgerUser.value = user
    creditLedgerPage.value = 0
    await loadCreditLedger()
  } catch (error) {
    creditLedgerUser.value = null
    creditLedger.value = null
    errorMessage.value = error instanceof Error ? error.message : '积分流水暂时不可用。'
  } finally {
    if (creditLedgerUser.value?.userId === user.userId && detailTab.value === 'ledger') actionUserId.value = null
  }
}

/** 按当前页读取已选用户的积分流水；后端完成系统管理员授权和读取审计。 */
async function loadCreditLedger(): Promise<void> {
  if (!creditLedgerUser.value) {
    return
  }
  creditLedgerLoading.value = true
  const sequence = ++detailRequest
  try {
    const response = await getAdminUserWatchlistCreditLedger(
      creditLedgerUser.value.userId,
      creditLedgerPage.value,
      creditLedgerPageSize,
    )
    if (sequence !== detailRequest) return
    creditLedger.value = response
  } catch (error) {
    if (sequence !== detailRequest) return
    errorMessage.value = error instanceof Error ? error.message : '积分流水暂时不可用。'
  } finally {
    if (sequence === detailRequest) creditLedgerLoading.value = false
  }
}

/** 执行会改变账号或归属的操作，并在成功后刷新列表。 */
async function runUserAction(userId: string, action: () => Promise<void>): Promise<void> {
  actionUserId.value = userId
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await action()
    await loadUsers()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '操作未完成，请稍后重试。'
  } finally {
    actionUserId.value = null
  }
}

/** 从 Vue 事件中安全读取下拉选项，避免组件逻辑直接依赖浏览器 DOM 类型。 */
function changeRoleFromEvent(user: AdminUser, event: unknown): void {
  const candidate = event as { target?: { value?: string } }
  const role = candidate.target?.value
  if (role === 'FUND_USER' || role === 'DATA_OPERATOR' || role === 'SYSTEM_ADMIN') {
    void changeRole(user, role)
  }
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function formatAmount(value: number | string): string {
  const numeric = typeof value === 'number' ? value : Number(value)
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', currencyDisplay: 'narrowSymbol' })
    .format(Number.isFinite(numeric) ? numeric : 0)
}

function closePortfolio(): void {
  void setUserTab('account')
}

function closeCreditLedger(): void {
  void setUserTab('account')
}

function previousCreditLedgerPage(): void {
  if (creditLedgerPage.value > 0 && !creditLedgerLoading.value) {
    creditLedgerPage.value -= 1
    void loadCreditLedger()
  }
}

function nextCreditLedgerPage(): void {
  if (creditLedger.value && creditLedgerPage.value + 1 < creditLedger.value.totalPages && !creditLedgerLoading.value) {
    creditLedgerPage.value += 1
    void loadCreditLedger()
  }
}

function creditLedgerTypeLabel(entryType: string): string {
  switch (entryType) {
    case 'ADMIN_GRANT':
      return '管理员发放'
    case 'MIGRATION_GRANT':
      return '存量迁移发放'
    case 'WATCHLIST_CREDIT_LOCKED':
      return '关注额度锁定'
    case 'WATCHLIST_CREDIT_RELEASED':
      return '取消关注释放'
    default:
      return '未知类型'
  }
}

function formatCreditDelta(creditDelta: number): string {
  return creditDelta > 0 ? `+${creditDelta}` : '—'
}

function previousPage(): void {
  if (hasPreviousPage.value) {
    void router.push({ path: route.path, query: { ...route.query, page: String(page.value), user: undefined, tab: undefined } })
  }
}

function nextPage(): void {
  if (hasNextPage.value) {
    void router.push({ path: route.path, query: { ...route.query, page: String(page.value + 2), user: undefined, tab: undefined } })
  }
}

function openUser(user: AdminUser, tab = 'account'): void {
  void router.push({ path: route.path, query: { ...route.query, section: 'accounts', user: user.userId, tab } })
}

async function setUserTab(tab: string): Promise<void> {
  await router.push({ path: route.path, query: { ...route.query, tab } })
}

watch(() => route.query.page, () => {
  if (route.name !== 'admin-users') return
  page.value = Math.max(0, Number.isInteger(Number(route.query.page)) ? Number(route.query.page) - 1 : 0)
  void loadUsers()
})

/** 切换用户或子页立即清空敏感表单与旧明细，慢响应不能覆盖新选择。 */
watch(() => `${selectedUser.value?.userId ?? ''}:${section.value}:${detailTab.value}`, () => {
  ++detailRequest
  if (portfolioUser.value || creditLedgerUser.value) actionUserId.value = null
  portfolioUser.value = null
  portfolio.value = null
  creditLedgerUser.value = null
  creditLedger.value = null
  creditLedgerLoading.value = false
  resetTarget.value = null
  resetPasswordValue.value = ''
  creditTarget.value = null
  creditAmount.value = 1
  creditReason.value = ''
  const user = selectedUser.value
  if (!user) return
  if (section.value === 'credits') creditTarget.value = user
  else if (detailTab.value === 'ledger') void viewCreditLedger(user)
  else if (detailTab.value === 'portfolio') void viewPortfolio(user)
}, { immediate: true })

onBeforeUnmount(() => { ++detailRequest; ++usersRequest; resetPasswordValue.value = '' })

onMounted(() => {
  void loadUsers()
})
</script>

<template>
  <section
    class="admin-page admin-users-page"
    aria-labelledby="admin-users-title"
  >
    <p class="eyebrow">
      ACCOUNT GOVERNANCE
    </p>
    <h1 id="admin-users-title">
      {{ selectedUser ? accountDisplayLabel(selectedUser) : sectionLabel }}
    </h1>
    <p class="lead">
      {{ selectedUser ? '查看所选账户资料及已授权操作。' : '选择账户后查看详情，或从左侧管理关注积分和历史关注归属。' }}
    </p>

    <p
      v-if="errorMessage"
      class="form-error"
      role="alert"
    >
      {{ errorMessage }}
    </p>
    <p
      v-else-if="successMessage"
      class="form-success"
      aria-live="polite"
    >
      {{ successMessage }}
    </p>

    <div
      v-if="selectedUser"
      class="workspace-detail-navigation"
    >
      <RouterLink
        class="secondary-link"
        :to="sectionTarget(section)"
      >
        ← 返回{{ sectionLabel }}
      </RouterLink>
      <nav
        v-if="section === 'accounts'"
        class="workspace-tabs"
        aria-label="用户详情分类"
      >
        <button
          v-for="tab in [{ key: 'account', label: '账户信息' }, { key: 'ledger', label: '积分流水' }, { key: 'portfolio', label: '确认持仓' }]"
          :key="tab.key"
          type="button"
          :aria-pressed="detailTab === tab.key"
          @click="setUserTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <section
      v-if="selectedUser && section === 'accounts' && detailTab === 'account'"
      class="admin-summary-card"
      aria-labelledby="selected-user-title"
    >
      <h2 id="selected-user-title">
        账户资料
      </h2>
      <dl class="detail-grid">
        <div><dt>账户</dt><dd>{{ accountDisplayLabel(selectedUser) }}</dd></div>
        <div><dt>手机号</dt><dd>{{ selectedUser.mobileMasked }}</dd></div>
        <div><dt>状态</dt><dd>{{ selectedUser.status === 'ACTIVE' ? '已启用' : '已停用' }}</dd></div>
        <div>
          <dt>当前角色</dt><dd>
            <select
              :value="selectedUser.role"
              :disabled="selectedUser.legacyRecord || actionUserId !== null"
              aria-label="所选用户角色"
              @change="changeRoleFromEvent(selectedUser, $event)"
            >
              <option
                v-for="option in roleOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </dd>
        </div>
      </dl>
      <div class="admin-row-actions">
        <button
          class="secondary-button"
          :disabled="selectedUser.legacyRecord || actionUserId !== null"
          type="button"
          @click="toggleStatus(selectedUser)"
        >
          {{ selectedUser.status === 'ACTIVE' ? '停用账户' : '启用账户' }}
        </button>
        <button
          class="secondary-button"
          :disabled="selectedUser.legacyRecord || actionUserId !== null"
          type="button"
          @click="openPasswordReset(selectedUser)"
        >
          重置密码
        </button>
        <button
          class="secondary-button"
          :disabled="selectedUser.legacyRecord || selectedUser.status !== 'ACTIVE' || actionUserId !== null"
          type="button"
          @click="openCreditGrant(selectedUser)"
        >
          发放关注积分
        </button>
      </div>
    </section>

    <section
      v-if="section === 'migration'"
      class="admin-operation-card"
      aria-labelledby="legacy-transfer-title"
    >
      <div>
        <h2 id="legacy-transfer-title">
          迁移待归属的历史关注
        </h2>
        <p>仅迁移旧本机账户的关注列表；提醒规则和个人持仓不会被自动迁移。</p>
      </div>
      <div class="admin-pagination">
        <button
          class="text-button"
          :disabled="loading || !hasPreviousPage"
          type="button"
          @click="previousPage"
        >
          上一页用户
        </button>
        <span>接收用户来自账户列表第 {{ page + 1 }} 页</span>
        <button
          class="text-button"
          :disabled="loading || !hasNextPage"
          type="button"
          @click="nextPage"
        >
          下一页用户
        </button>
      </div>
      <div class="admin-inline-form">
        <label for="legacy-target">接收用户</label>
        <select
          id="legacy-target"
          v-model="transferTargetUserId"
        >
          <option value="">
            请选择已启用用户
          </option>
          <option
            v-for="user in activeUsers"
            :key="user.userId"
            :value="user.userId"
          >
            {{ accountDisplayLabel(user) }}（{{ user.mobileMasked }}）
          </option>
        </select>
        <button
          class="secondary-button"
          :disabled="actionUserId === 'legacy-watchlist'"
          type="button"
          @click="submitLegacyTransfer"
        >
          {{ actionUserId === 'legacy-watchlist' ? '正在迁移…' : '确认并迁移' }}
        </button>
      </div>
    </section>

    <section
      v-if="section === 'accounts' && detailTab === 'account' && resetTarget"
      class="admin-operation-card password-reset-card"
      aria-labelledby="password-reset-title"
    >
      <div>
        <h2 id="password-reset-title">
          人工重置密码
        </h2>
        <p>目标：{{ accountDisplayLabel(resetTarget) }}（{{ resetTarget.mobileMasked }}）。提交后其全部既有会话会立即失效。</p>
      </div>
      <form
        class="admin-inline-form"
        @submit.prevent="submitPasswordReset"
      >
        <label for="reset-password">新密码</label>
        <input
          id="reset-password"
          v-model="resetPasswordValue"
          autocomplete="new-password"
          maxlength="128"
          required
          type="password"
        >
        <button
          class="primary-button"
          :disabled="actionUserId === resetTarget.userId"
          type="submit"
        >
          {{ actionUserId === resetTarget.userId ? '正在重置…' : '提交重置' }}
        </button>
        <button
          class="text-button"
          type="button"
          @click="resetTarget = null"
        >
          取消
        </button>
      </form>
    </section>

    <section
      v-if="section === 'credits' && creditTarget"
      class="admin-operation-card credit-grant-card"
      aria-labelledby="credit-grant-title"
    >
      <div>
        <h2 id="credit-grant-title">
          发放试用关注积分
        </h2>
        <p>目标：{{ accountDisplayLabel(creditTarget) }}（{{ creditTarget.mobileMasked }}）。积分仅增加可同时关注的基金数量，不可充值、转赠、提现或兑换交易建议。</p>
      </div>
      <form
        class="admin-inline-form"
        @submit.prevent="submitCreditGrant"
      >
        <label for="credit-amount">积分数量</label>
        <input
          id="credit-amount"
          v-model.number="creditAmount"
          inputmode="numeric"
          min="1"
          max="10000"
          required
          step="1"
          type="number"
        >
        <label for="credit-reason">发放原因</label>
        <input
          id="credit-reason"
          v-model="creditReason"
          maxlength="256"
          required
          type="text"
        >
        <button
          class="primary-button"
          :disabled="actionUserId === creditTarget.userId || creditTarget.legacyRecord || creditTarget.status !== 'ACTIVE'"
          type="submit"
        >
          {{ actionUserId === creditTarget.userId ? '正在发放…' : '确认发放' }}
        </button>
        <button
          class="text-button"
          type="button"
          @click="router.push(sectionTarget('credits'))"
        >
          取消
        </button>
      </form>
    </section>

    <section
      v-if="section !== 'migration' && !selectedUser"
      class="admin-table-card"
      aria-labelledby="user-list-title"
    >
      <header class="admin-table-header">
        <div>
          <h2 id="user-list-title">
            账户列表
          </h2>
          <p>共 {{ total }} 个账户</p>
        </div>
        <button
          class="secondary-button"
          :disabled="loading"
          type="button"
          @click="loadUsers"
        >
          刷新
        </button>
      </header>

      <p
        v-if="loading"
        class="state-message"
        role="status"
      >
        正在读取账户列表…
      </p>
      <div
        v-else
        class="admin-table-wrap"
      >
        <table>
          <thead>
            <tr>
              <th>账户</th>
              <th>角色</th>
              <th>状态</th>
              <th>关注额度</th>
              <th>试用积分</th>
              <th>创建时间</th>
              <th>管理操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in users"
              :key="user.userId"
              :class="{ 'is-legacy-row': user.legacyRecord }"
            >
              <td>
                <strong>{{ accountDisplayLabel(user) }}</strong>
                <span>{{ user.mobileMasked }}{{ user.legacyRecord ? ' · 待归属历史账户' : '' }}</span>
              </td>
              <td>
                {{ accountRoleLabel(user.role) }}
              </td>
              <td><span :class="`account-status is-${user.status.toLowerCase()}`">{{ user.status === 'ACTIVE' ? '已启用' : '已停用' }}</span></td>
              <td>{{ user.watchlistCount }} / {{ 5 + user.trialCreditTotal }}</td>
              <td>可用 {{ user.trialCreditAvailable }} · 锁定 {{ user.trialCreditLocked }}</td>
              <td>{{ formatTime(user.createdAt) }}</td>
              <td>
                <div class="admin-row-actions">
                  <button
                    class="text-button"
                    :disabled="actionUserId === user.userId"
                    type="button"
                    @click="openUser(user)"
                  >
                    查看详情
                  </button>
                  <button
                    v-if="section === 'credits'"
                    class="text-button"
                    :disabled="user.legacyRecord || user.status !== 'ACTIVE' || actionUserId === user.userId"
                    type="button"
                    @click="openCreditGrant(user)"
                  >
                    发放积分
                  </button>
                  <button
                    v-if="section === 'credits'"
                    class="text-button"
                    :disabled="actionUserId === user.userId"
                    type="button"
                    @click="openUser(user, 'ledger')"
                  >
                    查看积分流水
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="admin-pagination">
        <button
          class="secondary-button"
          :disabled="!hasPreviousPage || loading"
          type="button"
          @click="previousPage"
        >
          上一页
        </button>
        <span>第 {{ page + 1 }} 页</span>
        <button
          class="secondary-button"
          :disabled="!hasNextPage || loading"
          type="button"
          @click="nextPage"
        >
          下一页
        </button>
      </footer>
    </section>

    <section
      v-if="creditLedgerUser"
      class="admin-credit-ledger-card"
      aria-labelledby="credit-ledger-title"
    >
      <header>
        <div>
          <h2 id="credit-ledger-title">
            {{ accountDisplayLabel(creditLedgerUser) }} 的积分流水
          </h2>
          <p>按时间倒序展示发放、迁移、锁定和释放记录；手机号与内部标识不会展示。</p>
        </div>
        <button
          class="text-button"
          type="button"
          @click="closeCreditLedger"
        >
          关闭
        </button>
      </header>
      <p
        v-if="creditLedgerLoading"
        class="state-message"
        role="status"
      >
        正在读取积分流水…
      </p>
      <p
        v-else-if="!creditLedger?.items.length"
        class="state-message"
      >
        该账户尚无积分流水。
      </p>
      <div
        v-else
        class="admin-table-wrap"
      >
        <table>
          <thead>
            <tr><th>时间</th><th>类型</th><th>积分变动</th><th>原因</th><th>操作人</th></tr>
          </thead>
          <tbody>
            <tr
              v-for="(entry, index) in creditLedger?.items"
              :key="`${entry.createdAt}-${entry.entryType}-${index}`"
            >
              <td>{{ formatTime(entry.createdAt) }}</td>
              <td>{{ creditLedgerTypeLabel(entry.entryType) }}</td>
              <td>{{ formatCreditDelta(entry.creditDelta) }}</td>
              <td>{{ entry.reason }}</td>
              <td>{{ entry.actorDisplayName }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <footer
        v-if="creditLedger && creditLedger.totalPages > 1"
        class="admin-pagination"
      >
        <button
          class="secondary-button"
          :disabled="creditLedgerPage === 0 || creditLedgerLoading"
          type="button"
          @click="previousCreditLedgerPage"
        >
          上一页
        </button>
        <span>第 {{ creditLedgerPage + 1 }} / {{ creditLedger.totalPages }} 页，共 {{ creditLedger.totalCount }} 条</span>
        <button
          class="secondary-button"
          :disabled="creditLedgerPage + 1 >= creditLedger.totalPages || creditLedgerLoading"
          type="button"
          @click="nextCreditLedgerPage"
        >
          下一页
        </button>
      </footer>
    </section>

    <section
      v-if="portfolioUser"
      class="admin-portfolio-card"
      aria-labelledby="admin-portfolio-title"
    >
      <header>
        <div>
          <h2 id="admin-portfolio-title">
            {{ accountDisplayLabel(portfolioUser) }} 的确认持仓
          </h2>
          <p>仅展示该用户已确认并入库的快照；不是实时资产，也不会修改原数据。</p>
        </div>
        <button
          class="text-button"
          type="button"
          @click="closePortfolio"
        >
          关闭
        </button>
      </header>
      <p
        v-if="actionUserId === portfolioUser.userId"
        class="state-message"
        role="status"
      >
        正在加载确认持仓…
      </p>
      <p
        v-else-if="!portfolio?.available"
        class="state-message"
      >
        该用户尚无可展示的确认持仓快照。
      </p>
      <div
        v-else
        class="admin-table-wrap"
      >
        <table>
          <thead><tr><th>基金</th><th>截图金额</th><th>占比</th><th>日收益</th><th>持有收益</th></tr></thead>
          <tbody>
            <tr
              v-for="holding in portfolio?.holdings"
              :key="holding.fundCode"
            >
              <td><strong>{{ holding.fundName }}</strong><span>{{ holding.fundCode }}</span></td>
              <td>{{ formatAmount(holding.reportedAmount) }}</td>
              <td>{{ holding.reportedWeightPct }}%</td>
              <td>{{ formatAmount(holding.reportedDailyGainAmount) }}</td>
              <td>{{ formatAmount(holding.reportedHoldingGainAmount) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>
