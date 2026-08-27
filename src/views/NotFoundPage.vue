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
      请从基金市场或已获授权的后台功能继续操作。
    </p>
    <RouterLink
      class="primary-link"
      to="/"
    >
      返回基金市场
    </RouterLink>
  </section>
</template>
