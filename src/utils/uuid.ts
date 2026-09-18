/**
 * 生成 RFC 4122 版本 4 UUID。
 *
 * crypto.randomUUID 仅在安全上下文（HTTPS 或 localhost）可用；
 * 经 HTTP 隧道等不安全来源访问时降级为 Math.random 实现。
 */
export function createUUID(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}
