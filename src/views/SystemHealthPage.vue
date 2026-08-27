<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { useSystemStore } from '@/stores/system'

/**
 * 运行状态页面。
 *
 * 用于确认浏览器到 Java 核心服务的连通性，并展示内部 AI 服务的聚合状态。
 */
const systemStore = useSystemStore()
const isHealthy = computed(() => systemStore.health?.status === 'UP')

/** 页面首次渲染后主动执行一次健康检查。 */
onMounted(() => {
  void systemStore.refreshHealth()
})
</script>

<template>
  <section
    class="status-page"
    aria-labelledby="page-title"
  >
    <p class="eyebrow">
      SYSTEM STATUS
    </p>
    <h1 id="page-title">
      运行状态
    </h1>
    <p class="lead">
      用于确认浏览器与 Java 核心服务的连通状态。基金市场和我的关注始终经由该服务访问，FastAPI 与数据来源不直接向浏览器开放。
    </p>

    <article class="health-card">
      <div
        class="health-indicator"
        :class="{ healthy: isHealthy, loading: systemStore.loading }"
        aria-hidden="true"
      />
      <div>
        <p class="card-label">
          Java 核心服务
        </p>
        <strong v-if="systemStore.loading">正在检查连接…</strong>
        <strong v-else-if="isHealthy">运行正常</strong>
        <strong v-else>尚未连接</strong>
        <p
          v-if="systemStore.health"
          class="muted"
        >
          响应时间：{{ systemStore.health.time }}
        </p>
        <p
          v-else
          class="muted"
        >
          {{ systemStore.errorMessage || '请先启动 Java 服务。' }}
        </p>
      </div>
      <button
        class="secondary-button"
        type="button"
        :disabled="systemStore.loading"
        @click="systemStore.refreshHealth"
      >
        重新检查
      </button>
    </article>

    <div class="boundary-grid">
      <article>
        <span class="step-number">01</span>
        <h2>前端</h2>
        <p>Vue 负责展示、状态和请求体验，不保存外部数据源或支付凭证。</p>
      </article>
      <article>
        <span class="step-number">02</span>
        <h2>Java</h2>
        <p>唯一业务接口与审计边界，后续承载基金、关注和提醒能力。</p>
      </article>
      <article>
        <span class="step-number">03</span>
        <h2>FastAPI AI</h2>
        <p>仅作为内部服务，后续处理数据采集、事件理解、回测和信号。</p>
      </article>
    </div>
  </section>
</template>
