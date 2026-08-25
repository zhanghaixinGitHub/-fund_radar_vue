/// <reference types="vite/client" />

/** Vite 客户端环境变量的 TypeScript 声明，限定浏览器可读取的公共配置。 */

/** 前端构建阶段注入的环境变量契约。 */
interface ImportMetaEnv {
  /** Java 核心服务基础地址；未设置时由本地 Vite 代理处理。 */
  readonly VITE_API_BASE_URL?: string
}

/** 扩展浏览器 import.meta，使业务代码可以类型安全地读取 env。 */
interface ImportMeta {
  readonly env: ImportMetaEnv
}
