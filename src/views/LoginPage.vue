<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const mobile = ref('')
const password = ref('')
const submitting = ref(false)
const localError = ref('')
const rememberPassword = ref(false)
const savedLoginKey = 'fund-radar.saved-login'

// 仅在用户主动选择后保存；不写入账号状态、日志或服务端。
try {
  const saved = JSON.parse(globalThis.localStorage.getItem(savedLoginKey) || 'null')
  if (saved && typeof saved.mobile === 'string' && /^1[3-9]\d{9}$/.test(saved.mobile)
    && typeof saved.password === 'string' && saved.password.length >= 6 && saved.password.length <= 20) {
    mobile.value = saved.mobile
    password.value = saved.password
    rememberPassword.value = true
  }
} catch {
  // 浏览器禁止存储或记录损坏时，仍允许手动登录。
}

function clearSavedLogin(): void {
  if (rememberPassword.value) return
  try {
    globalThis.localStorage.removeItem(savedLoginKey)
    localError.value = ''
  } catch {
    localError.value = '无法清除保存的密码，请在浏览器设置中清除此网站的数据。'
  }
}
const redirectPath = computed(() => (
  typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
    ? route.query.redirect
    : '/funds'
))

/** 提交已注册手机号和密码；服务端不会在登录请求中创建账户。 */
async function submit(): Promise<void> {
  localError.value = ''
  if (!/^1[3-9]\d{9}$/.test(mobile.value)) {
    localError.value = '请输入中国大陆 11 位手机号。'
    return
  }
  if (!password.value) {
    localError.value = '请输入密码。'
    return
  }
  submitting.value = true
  try {
    await authStore.signIn(mobile.value, password.value)
    try {
      if (rememberPassword.value) {
        globalThis.localStorage.setItem(savedLoginKey, JSON.stringify({ mobile: mobile.value, password: password.value }))
      } else {
        globalThis.localStorage.removeItem(savedLoginKey)
      }
    } catch {
      localError.value = '登录成功，但浏览器无法保存或清除密码。请允许网站存储，或取消保存后重试。'
      return
    }
    await router.replace(redirectPath.value)
  } catch {
    localError.value = authStore.errorMessage || '手机号或密码错误。'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <section
      class="login-card"
      aria-labelledby="login-title"
    >
      <p class="eyebrow">
        基金雷达
      </p>
      <h1 id="login-title">
        登录后查看你的基金关注
      </h1>
      <p class="login-lead">
        使用已注册的中国大陆手机号和密码登录。还没有账号？请先完成注册。
      </p>

      <form
        class="login-form"
        @submit.prevent="submit"
      >
        <label for="mobile">手机号</label>
        <input
          id="mobile"
          v-model.trim="mobile"
          autocomplete="tel"
          inputmode="numeric"
          maxlength="11"
          name="mobile"
          pattern="^1[3-9]\d{9}$"
          placeholder="请输入 11 位手机号"
          required
          type="tel"
        >

        <label for="password">密码</label>
        <input
          id="password"
          v-model="password"
          autocomplete="current-password"
          maxlength="20"
          minlength="6"
          name="password"
          placeholder="请输入密码"
          required
          type="password"
        >
        <p class="field-hint">
          密码为 6 至 20 位字符。
        </p>

        <label
          class="remember-password"
          for="remember-password"
        >
          <input
            id="remember-password"
            v-model="rememberPassword"
            type="checkbox"
            :disabled="submitting"
            aria-describedby="remember-password-hint"
            @change="clearSavedLogin"
          >
          保存密码
        </label>
        <p
          id="remember-password-hint"
          class="field-hint"
        >
          登录成功后保存在当前浏览器，下次打开自动填写。仅在自己的设备上使用；取消勾选可清除。
        </p>

        <p
          v-if="localError"
          class="form-error"
          role="alert"
        >
          {{ localError }}
        </p>
        <button
          class="primary-button login-submit"
          :aria-busy="submitting"
          :disabled="submitting"
          type="submit"
        >
          {{ submitting ? '正在登录…' : '登录并进入基金雷达' }}
        </button>
      </form>

      <p class="auth-switch">
        还没有账号？
        <RouterLink :to="{ name: 'register', query: { redirect: redirectPath } }">
          去注册
        </RouterLink>
      </p>

      <p class="login-note">
        暂未接入短信验证，因此手机号仅作为登录标识；忘记密码请联系管理员人工重置。
      </p>
    </section>
  </main>
</template>

<style scoped>
.login-form .remember-password {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  cursor: pointer;
}

.login-form .remember-password input {
  width: 18px;
  height: 18px;
  min-height: 0;
  margin: 0;
  padding: 0;
  accent-color: var(--color-primary);
}
</style>
