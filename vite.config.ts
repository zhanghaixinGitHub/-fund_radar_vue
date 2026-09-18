import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'

/**
 * Vite 开发与构建配置。
 *
 * 启用 Vue、配置 @ 到 src 的路径别名，并将浏览器 `/api` 请求代理到 Java 核心服务。
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl = process.env.VITE_API_BASE_URL || env.VITE_API_BASE_URL || 'http://localhost:8080'

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: '127.0.0.1',
      port: 5173,
      allowedHosts: ['.natappfree.cc'],
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          // 经 HTTP 隧道访问时浏览器 Origin 为外部域名，Java 服务 CORS 校验会拒绝；
          // 代理转发时统一改写为本机开发来源。
          headers: { origin: 'http://localhost:5173' },
        },
      },
    },
  }
})
