<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { usePageNavigation } from '@/composables/usePageNavigation'
import type { PermissionCode } from '@/types/auth'
import { accountDisplayLabel } from '@/utils/accountPresentation'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const showAppShell = computed(() => route.meta.requiresAuth !== false)
const isAdminArea = computed(() => route.meta.appArea === 'admin')
const accountMenuOpen = ref(false)
const accountMenuElement = ref<globalThis.HTMLElement | null>(null)
const sidebarOpen = ref(false)
const { sections, section, sectionLabel, moduleLabel, returnTarget, sectionTarget } = usePageNavigation()
const adminEntryPermissions: PermissionCode[] = [
  'ADMIN_DASHBOARD_VIEW',
  'SYNC_JOB_READ',
  'USER_ACCOUNT_READ',
]
const hasAdminAccess = computed(() => adminEntryPermissions.some((permission) => can(permission)))
const brandTarget = computed(() => (isAdminArea.value ? '/admin' : '/funds'))

/** 菜单只反映已授予权限，接口本身仍由 Java 服务端校验。 */
function can(permission: PermissionCode): boolean {
  return authStore.hasPermission(permission)
}

/** 展开或收起账户操作菜单；管理员入口仅由服务端返回的权限决定。 */
function toggleAccountMenu(): void {
  accountMenuOpen.value = !accountMenuOpen.value
}

/** 在跳转、退出、点击菜单外部或按 Esc 时收起账户菜单。 */
function closeAccountMenu(): void {
  accountMenuOpen.value = false
}

function onDocumentPointerDown(event: globalThis.PointerEvent): void {
  if (accountMenuElement.value && !accountMenuElement.value.contains(event.target as globalThis.Node)) {
    closeAccountMenu()
  }
  const target = event.target as globalThis.Node
  if (sidebarOpen.value && !globalThis.document.getElementById('workspace-sidebar')?.contains(target)
    && !globalThis.document.getElementById('sidebar-toggle')?.contains(target)) sidebarOpen.value = false
}

async function toggleSidebar(): Promise<void> {
  sidebarOpen.value = !sidebarOpen.value
  if (sidebarOpen.value) {
    await nextTick()
    globalThis.document.querySelector<globalThis.HTMLElement>('#workspace-sidebar .is-selected')?.focus()
  }
}

function onDocumentKeyDown(event: globalThis.KeyboardEvent): void {
  if (event.key === 'Escape') {
    closeAccountMenu()
    if (sidebarOpen.value) {
      sidebarOpen.value = false
      globalThis.document.getElementById('sidebar-toggle')?.focus()
    }
  }
}

watch(() => route.fullPath, async () => {
  const wasOpen = sidebarOpen.value
  sidebarOpen.value = false
  closeAccountMenu()
  await nextTick()
  if (wasOpen) globalThis.document.getElementById('main-content')?.focus({ preventScroll: true })
})

onMounted(() => {
  globalThis.document.addEventListener('pointerdown', onDocumentPointerDown)
  globalThis.document.addEventListener('keydown', onDocumentKeyDown)
})

onBeforeUnmount(() => {
  globalThis.document.removeEventListener('pointerdown', onDocumentPointerDown)
  globalThis.document.removeEventListener('keydown', onDocumentKeyDown)
})

/** 退出后清理浏览器内存身份并返回登录页。 */
async function signOut(): Promise<void> {
  closeAccountMenu()
  await authStore.signOut()
  await router.replace({ name: 'login' })
}
</script>

<template>
  <RouterView v-if="!showAppShell" />
  <div
    v-else
    class="app-shell"
    :class="{ 'is-admin-area': isAdminArea }"
  >
    <a
      class="skip-link"
      href="#main-content"
    >跳至正文</a>
    <header class="top-bar">
      <RouterLink
        class="brand"
        :to="brandTarget"
      >
        <span
          class="brand-mark"
          aria-hidden="true"
        >◒</span>
        <span>基金雷达</span>
      </RouterLink>
      <nav
        v-if="!isAdminArea"
        class="top-nav"
        aria-label="用户端导航"
      >
        <RouterLink
          v-if="can('FUND_READ')"
          :class="{ 'is-active-module': moduleLabel === '基金市场' }"
          to="/funds"
        >
          基金市场
        </RouterLink>
        <RouterLink
          v-if="can('WATCHLIST_SELF_READ')"
          :class="{ 'is-active-module': moduleLabel === '我的关注' }"
          to="/watchlist"
        >
          我的关注
        </RouterLink>
        <RouterLink
          v-if="can('PORTFOLIO_SELF_READ')"
          to="/portfolio"
        >
          我的持仓
        </RouterLink>
        <RouterLink
          v-if="can('NOTIFICATION_SELF_READ')"
          to="/notifications"
        >
          站内提醒
        </RouterLink>
      </nav>
      <nav
        v-else
        class="top-nav"
        aria-label="后台管理导航"
      >
        <RouterLink
          v-if="can('ADMIN_DASHBOARD_VIEW')"
          to="/admin"
        >
          工作台
        </RouterLink>
        <RouterLink
          v-if="can('SYNC_JOB_READ')"
          to="/admin/sync"
        >
          数据同步
        </RouterLink>
        <RouterLink
          v-if="can('USER_ACCOUNT_READ')"
          to="/admin/users"
        >
          用户管理
        </RouterLink>
      </nav>
      <div
        ref="accountMenuElement"
        class="account-menu"
      >
        <button
          class="account-trigger"
          :aria-expanded="accountMenuOpen"
          aria-controls="account-actions"
          aria-haspopup="menu"
          type="button"
          @click="toggleAccountMenu"
        >
          <span class="account-identity">
            <strong>{{ accountDisplayLabel(authStore.user) }}</strong>
            <small>{{ authStore.user?.mobileMasked }}</small>
          </span>
          <span
            aria-hidden="true"
            class="account-chevron"
          >⌄</span>
        </button>
        <div
          v-if="accountMenuOpen"
          id="account-actions"
          class="account-dropdown"
          role="menu"
        >
          <RouterLink
            :to="{ name: 'profile' }"
            role="menuitem"
            @click="closeAccountMenu"
          >
            个人信息
          </RouterLink>
          <a
            v-if="hasAdminAccess && !isAdminArea"
            href="/admin"
            rel="noopener"
            role="menuitem"
            target="_blank"
            @click="closeAccountMenu"
          >
            后台管理
          </a>
          <RouterLink
            v-if="isAdminArea"
            to="/funds"
            role="menuitem"
            @click="closeAccountMenu"
          >
            返回前台
          </RouterLink>
          <button
            role="menuitem"
            type="button"
            @click="signOut"
          >
            退出登录
          </button>
        </div>
      </div>
    </header>

    <div
      class="workspace-layout"
      :class="{ 'without-sidebar': sections.length === 0 }"
    >
      <aside
        v-if="sections.length"
        id="workspace-sidebar"
        class="workspace-sidebar"
        :class="{ 'is-open': sidebarOpen }"
        aria-label="当前模块子菜单"
      >
        <strong class="sidebar-heading">{{ moduleLabel }}</strong>
        <RouterLink
          v-if="returnTarget"
          class="sidebar-back"
          :to="returnTarget"
        >
          ← 返回{{ moduleLabel }}
        </RouterLink>
        <p
          v-if="route.params.fundCode"
          class="sidebar-context"
        >
          当前基金 · {{ route.params.fundCode }}
        </p>
        <nav
          class="sidebar-nav"
          :aria-label="`${moduleLabel}子导航`"
        >
          <template
            v-for="item in sections"
            :key="item.key"
          >
            <span
              v-if="item.group"
              class="sidebar-group"
            >{{ item.group }}</span>
            <RouterLink
              :to="sectionTarget(item.key)"
              :class="{ 'is-selected': section === item.key }"
              :aria-current="section === item.key ? 'page' : undefined"
            >
              {{ item.label }}
            </RouterLink>
          </template>
        </nav>
        <small class="sidebar-footer">基金雷达 · {{ isAdminArea ? '后台管理' : '个人工作区' }}</small>
      </aside>
      <main
        id="main-content"
        class="page-content"
        tabindex="-1"
      >
        <div class="workspace-location">
          <button
            v-if="sections.length"
            id="sidebar-toggle"
            class="sidebar-toggle"
            type="button"
            :aria-expanded="sidebarOpen"
            aria-controls="workspace-sidebar"
            @click="toggleSidebar"
          >
            ☰ 子菜单
          </button>
          <nav
            aria-label="当前位置"
            class="workspace-breadcrumb"
          >
            <span v-if="isAdminArea">后台管理<span aria-hidden="true"> / </span></span>
            <RouterLink
              v-if="returnTarget"
              :to="returnTarget"
            >
              {{ moduleLabel }}
            </RouterLink>
            <span v-else>{{ moduleLabel }}</span>
            <span v-if="route.params.fundCode"> / {{ route.params.fundCode }}</span>
            <span v-if="sectionLabel"> / {{ sectionLabel }}</span>
          </nav>
        </div>
        <RouterView />
      </main>
    </div>
  </div>
</template>
