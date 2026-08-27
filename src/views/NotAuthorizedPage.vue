<template>
  <section
    class="status-page"
    aria-labelledby="not-authorized-title"
  >
    <p class="eyebrow">
      ACCESS DENIED
    </p>
    <h1 id="not-authorized-title">
      当前账号没有访问此页面的权限
    </h1>
    <p class="lead">
      菜单可见性只用于减少误操作；实际接口权限始终由服务端校验。若确有工作需要，请联系系统管理员调整角色。
    </p>
    <RouterLink
      class="primary-link"
      to="/funds"
    >
      返回基金市场
    </RouterLink>
  </section>
</template>
