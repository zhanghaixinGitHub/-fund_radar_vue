/** Query order and a refreshed directory snapshot do not change the list's location. */
export function workspaceScrollKey(path: string): string {
  const url = new URL(path, 'https://fund-radar.invalid')
  url.searchParams.delete('snapshotId')
  url.searchParams.sort()
  return url.pathname + url.search + url.hash
}

/** 同页的持仓构成页签只替换内容，不能按新页面置顶。 */
export function isWorkspaceLocalTabTransition(source: string, destination: string): boolean {
  const from = new URL(source, 'https://fund-radar.invalid')
  const to = new URL(destination, 'https://fund-radar.invalid')
  if (from.pathname !== to.pathname || from.hash !== to.hash) return false
  if (from.searchParams.get('composition') === to.searchParams.get('composition')) return false
  from.searchParams.delete('composition')
  to.searchParams.delete('composition')
  return workspaceScrollKey(from.pathname + from.search + from.hash) === workspaceScrollKey(to.pathname + to.search + to.hash)
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
