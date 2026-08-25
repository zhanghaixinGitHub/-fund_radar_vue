import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { router } from './router'
import './styles.css'

/**
 * 前端应用启动入口。
 *
 * 创建 Vue 应用，注册全局状态管理和路由后挂载到页面根节点。
 */
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')
