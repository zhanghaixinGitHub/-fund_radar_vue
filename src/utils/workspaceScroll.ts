/** Query order and a refreshed directory snapshot do not change the list's location. */
export function workspaceScrollKey(path: string): string {
  const url = new URL(path, 'https://fund-radar.invalid')
  url.searchParams.delete('snapshotId')
  if (url.pathname === '/portfolio') {
    if (url.searchParams.get('size') === '10') url.searchParams.delete('size')
    if (url.searchParams.get('page') === '1') url.searchParams.delete('page')
  }
  url.searchParams.sort()
  return url.pathname + url.search + url.hash
}

/** 同页的持仓构成页签只替换内容，不能按新页面置顶。 */
export function isWorkspaceLocalTabTransition(source: string, destination: string): boolean {
  const from = new URL(source, 'https://fund-radar.invalid')
  const to = new URL(destination, 'https://fund-radar.invalid')
  if (from.pathname !== to.pathname || from.hash !== to.hash) return false
  const compositionChanged = from.searchParams.get('composition') !== to.searchParams.get('composition')
  const holdingChanged = from.pathname === '/portfolio' && from.searchParams.get('holding') !== to.searchParams.get('holding')
  if (!compositionChanged && !holdingChanged) return false
  from.searchParams.delete('composition')
  to.searchParams.delete('composition')
  if (from.pathname === '/portfolio') { from.searchParams.delete('holding'); to.searchParams.delete('holding') }
  return workspaceScrollKey(from.pathname + from.search + from.hash) === workspaceScrollKey(to.pathname + to.search + to.hash)
}

/** 只保存页面位置；会话内刷新详情页后，仍能回到列表和抽屉的原位置。 */
export function readScrollMemory(key: string): number {
  try {
    const value = JSON.parse(globalThis.sessionStorage?.getItem('fund-radar-scroll') ?? '{}')[key]
    return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(value, 10_000_000)) : 0
  } catch { return 0 }
}
export function saveScrollMemory(key: string, top: number): void {
  try {
    const entries = JSON.parse(globalThis.sessionStorage?.getItem('fund-radar-scroll') ?? '{}')
    delete entries[key]
    entries[key] = Number.isFinite(top) ? Math.max(0, Math.min(top, 10_000_000)) : 0
    globalThis.sessionStorage?.setItem('fund-radar-scroll', JSON.stringify(Object.fromEntries(Object.entries(entries).slice(-40))))
  } catch { /* 浏览器不允许保存位置时，导航和数据读取仍正常。 */ }
}

/** Restore only an explicit parent return, never a main-menu or peer-page switch. */
export function isWorkspaceReturn(source: unknown, destination: string, menuNavigation = false): boolean {
  if (menuNavigation || typeof source !== 'string' || !source.startsWith('/') || source.startsWith('//')) return false
  return workspaceScrollKey(source) === workspaceScrollKey(destination)
}

interface ScrollArea {
  scrollTop: number
  scrollHeight: number
  clientHeight: number
}

/** Wait for asynchronous rows to create enough height before completing restoration. */
export function restoreWorkspaceScroll(
  area: ScrollArea,
  top: number,
  observe: (retry: () => void) => () => void,
): () => void {
  const target = Math.max(0, top)
  let active = true
  let disconnect = () => {}
  function stop() { active = false; disconnect() }
  function retry() {
    if (!active) return
    const maximum = Math.max(0, area.scrollHeight - area.clientHeight)
    area.scrollTop = Math.min(target, maximum)
    if (maximum + 1 >= target) stop()
  }
  retry()
  if (active) disconnect = observe(retry)
  return stop
}
