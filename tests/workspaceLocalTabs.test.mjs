import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { Buffer } from 'node:buffer'
import { pathToFileURL, URL } from 'node:url'
import { createRequire } from 'node:module'
import { createRenderer, nextTick, reactive, ref } from 'vue'
import ts from 'typescript'

const url = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
const vueUrl = pathToFileURL(createRequire(import.meta.url).resolve('vue')).href
const transpile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
const scrollUtils = transpile(readFileSync(new URL('../src/utils/workspaceScroll.ts', import.meta.url), 'utf8'))

test('全局滚动监听在持仓构成页签切换时保留位置，栏目切换仍置顶', async t => {
  const route = reactive({ fullPath: '/portfolio?section=overview', query: { section: 'overview' } })
  let navigation
  const router = {
    beforeEach(guard) { navigation = guard; return () => {} },
    resolve: target => ({ fullPath: target }),
  }
  const key = `__workspaceLocalTab${Math.random().toString(16).slice(2)}`
  globalThis[key] = { route, router }
  const dependencies = {
    vue: vueUrl,
    'vue-router': url(`export const useRoute = () => globalThis[${JSON.stringify(key)}].route; export const useRouter = () => globalThis[${JSON.stringify(key)}].router`),
    '@/utils/workspaceScroll': url(scrollUtils),
  }
  let code = transpile(readFileSync(new URL('../src/composables/useWorkspaceScroll.ts', import.meta.url), 'utf8'))
  code = code.replace(/from ['"]([^'"]+)['"]/g, (_, name) => `from '${dependencies[name]}'`)
  const { useWorkspaceScroll } = await import(url(code))
  const content = ref({ scrollTop: 640, scrollHeight: 2000, clientHeight: 400, children: [] })
  const renderer = createRenderer({ createComment: () => ({}), insert() {}, remove() {}, parentNode: () => null, nextSibling: () => null })
  const app = renderer.createApp({ setup: () => { useWorkspaceScroll(content); return () => null } })
  app.mount({})
  t.after(() => { app.unmount(); delete globalThis[key] })

  navigation(
    { fullPath: '/portfolio?section=overview&composition=industries', query: { section: 'overview', composition: 'industries' } },
    route,
  )
  route.fullPath = '/portfolio?section=overview&composition=industries'
  await nextTick(); await nextTick()
  assert.equal(content.value.scrollTop, 640)

  navigation({ fullPath: '/portfolio?section=holdings', query: { section: 'holdings' } }, route)
  route.fullPath = '/portfolio?section=holdings'
  await nextTick(); await nextTick()
  assert.equal(content.value.scrollTop, 0)
})
