<template>
  <!-- 未匹配任何已注册路由时展示的兜底页面。 -->
  <section
    class="status-page"
    aria-labelledby="not-found-title"
  >
    <p class="eyebrow">
      404
    </p>
    <h1 id="not-found-title">
      页面不存在
    </h1>
    <p class="lead">
      当前仅开放 M0 系统状态页。
    </p>
    <RouterLink
      class="primary-link"
      to="/"
    >
      返回系统状态
    </RouterLink>
  </section>
</template>
