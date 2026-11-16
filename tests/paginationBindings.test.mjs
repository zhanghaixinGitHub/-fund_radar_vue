import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { join, relative } from 'node:path'
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'

const root = fileURLToPath(new URL('../src/', import.meta.url))
function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? files(path) : path.endsWith('.vue') ? [path] : []
  })
}

// 用 Vue 编译器核对真实模板与 setup 的连接，防止按钮调用未接入页面的函数。
for (const filename of files(root)) {
  const source = readFileSync(filename, 'utf8')
  if (!source.includes('<ListPagination')) continue
  test(`${relative(root, filename)}：每个分页事件都连接到页面已有变量和函数`, () => {
    const { descriptor } = parse(source, { filename })
    const script = compileScript(descriptor, { id: filename })
    const blocks = descriptor.template.content.match(/<ListPagination\b[\s\S]*?\/>/g) ?? []
    assert.ok(blocks.length > 0)
    for (const block of blocks) {
      assert.match(block, /@change=/)
    }
    // 保留完整模板中的循环作用域，不能把 item 等循环变量误判为漏接。
    const compiled = compileTemplate({
      source: descriptor.template.content, filename, id: filename,
      compilerOptions: { bindingMetadata: script.bindings, expressionPlugins: ['typescript'] },
    })
    assert.deepEqual(compiled.errors, [])
    assert.doesNotMatch(compiled.code, /_ctx\./, `模板引用了未接入 setup 的名称：${compiled.code}`)
  })
}
