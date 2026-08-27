<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import type { PermissionCode } from '@/types/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const showAppShell = computed(() => route.meta.requiresAuth !== false)
const isAdminArea = computed(() => route.meta.appArea === 'admin')

/** 菜单只反映已授予权限，接口本身仍由 Java 服务端校验。 */
function can(permission: PermissionCode): boolean {
  return authStore.hasPermission(permission)
}

/** 退出后清理浏览器内存身份并返回登录页。 */
async function signOut(): Promise<void> {
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
        to="/funds"
      >
        <span
          class="brand-mark"
          aria-hidden="true"
        >◒</span>
        <span>基金雷达</span>
      </RouterLink>
      <nav
        class="top-nav"
        aria-label="主导航"
      >
        <span class="nav-section-label">用户端</span>
        <RouterLink
          v-if="can('FUND_READ')"
          to="/funds"
        >
          基金市场
        </RouterLink>
        <RouterLink
          v-if="can('WATCHLIST_SELF_READ')"
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
        <template v-if="can('ADMIN_DASHBOARD_VIEW')">
          <span class="nav-section-label">后台</span>
          <RouterLink to="/admin">
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
        </template>
      </nav>
      <div class="account-menu">
        <span>
          <strong>{{ authStore.user?.displayName }}</strong>
          <small>{{ authStore.user?.mobileMasked }}</small>
        </span>
        <button
          class="text-button"
          type="button"
          @click="signOut"
        >
          退出
        </button>
      </div>
    </header>

    <main
      id="main-content"
      class="page-content"
      tabindex="-1"
    >
      <p
        v-if="isAdminArea"
        class="area-banner"
      >
        后台管理区 · 高风险操作受服务端权限与审计保护
      </p>
      <RouterView />
    </main>
  </div>
</template>
