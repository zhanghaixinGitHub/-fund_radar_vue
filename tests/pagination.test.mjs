import test from 'node:test'
import assert from 'node:assert/strict'
import { effectScope, nextTick, ref } from 'vue'
import { findLastPage, normalizePage, normalizePageSize, readFixedPage } from '../src/utils/pagination.ts'
import { useDirection1dFundHistory } from '../src/composables/useDirection1dFundHistory.ts'

test('市场分页统一约束：条数只接受 10、20、50，跳页限制在有效整数范围', () => {
  for (const size of [10, 20, 50, '20']) assert.equal(normalizePageSize(size), Number(size))
  for (const size of [undefined, '', 0, 8, 100, 10.5]) assert.equal(normalizePageSize(size), 10)
  assert.equal(normalizePage(-1, 3, 8), 1)
  assert.equal(normalizePage(100, 3, 8), 8)
  assert.equal(normalizePage(2.5, 3, 8), 3)
  assert.equal(normalizePage('invalid', 3, 8), 3)
  assert.equal(normalizePage(100000), 10000)
})

test('旧接口窗口适配：10、20、50 条跨页后不遗漏、不重复，单次最多请求三页', async () => {
  for (const count of [0, 1, 10, 20, 21, 40, 50, 51, 65, 101]) {
    const rows = Array.from({ length: count }, (_, index) => index)
    for (const size of [10, 20, 50]) {
      const actual = []
      for (let page = 1; page <= Math.max(1, Math.ceil(count / size)); page++) {
        const calls = []
        const result = await readFixedPage(async serverPage => {
          calls.push(serverPage)
          return { items: rows.slice((serverPage - 1) * 20, serverPage * 20), hasMore: serverPage * 20 < count }
        }, page, size)
        actual.push(...result.items)
        assert.equal(result.hasMore, page * size < count)
        assert.ok(calls.length <= 3)
      }
      assert.deepEqual(actual, rows)
    }
  }
})

test('固定接口仅返回满页状态时，任意条数的尾页定位保持真实记录与总数', async () => {
  for (const count of [20, 40, 50, 65]) {
    for (const size of [10, 20, 50]) {
      const read = page => readFixedPage(async serverPage => {
        const items = Array.from({ length: Math.min(20, Math.max(0, count - (serverPage - 1) * 20)) }, (_, index) => (serverPage - 1) * 20 + index)
        return { items, hasMore: items.length === 20 }
      }, page, size)
      const last = await findLastPage(read, row => row.items.length > 0, row => row.hasMore, () => true)
      assert.equal(last.page, Math.ceil(count / size))
      assert.equal((last.page - 1) * size + last.value.items.length, count)
    }
  }
})

test('未知总数的尾页定位处理空列表、整页和不足一页，并限制请求数量', async () => {
  for (const count of [0, 1, 19, 20, 21, 40, 41, 199999]) {
    const calls = []
    const last = await findLastPage(async page => {
      calls.push(page)
      const length = Math.min(20, Math.max(0, count - (page - 1) * 20))
      return { length, more: page * 20 < count }
    }, value => value.length > 0, value => value.more, () => true)
    assert.equal(last.page, Math.max(1, Math.ceil(count / 20)))
    assert.equal(last.value.length, count ? (count % 20 || 20) : 0)
    assert.ok(calls.length <= 28)
    assert.ok(calls.every(page => page >= 1 && page <= 10000))
  }
})

test('仅通过是否满页判断后续记录时，整页尾页不能落到空白下一页', async () => {
  const last = await findLastPage(async page => ({ length: page <= 3 ? 20 : 0 }),
    value => value.length > 0, value => value.length === 20, () => true)
  assert.equal(last.page, 3)
})

test('接口失败、达到上限及请求过期时不提交伪造的尾页', async () => {
  await assert.rejects(findLastPage(async () => { throw new Error('offline') },
    () => true, () => true, () => true), /offline/)
  await assert.rejects(findLastPage(async () => ({}),
    () => true, () => true, () => true, 8), /暂时无法跳至尾页/)
  let active = true
  let calls = 0
  const last = await findLastPage(async () => {
    calls++
    active = false
    return { length: 20 }
  }, value => value.length > 0, () => true, () => active)
  assert.equal(last, null)
  assert.equal(calls, 1)
})

test('单基金历史首尾跳转丢弃中间游标，尾页后上一页仍读取正确页码', async () => {
  const calls = []
  const scope = effectScope()
  const code = ref('000042')
  const history = scope.run(() => useDirection1dFundHistory(() => code.value, async (fundCode, page, cursor) => {
    calls.push({ fundCode, page, cursor })
    return { items: [], page, pageSize: 20, totalCount: 65,
      nextCursor: page < 4 ? { beforeDate: '2026-10-26', beforeId: `page-${page}` } : undefined }
  }))
  try {
    await nextTick()
    assert.equal(history.canPrevious.value, false)
    await history.next()
    assert.equal(calls.at(-1).cursor.beforeId, 'page-1')
    await history.last()
    assert.deepEqual(calls.at(-1), { fundCode: '000042', page: 4, cursor: undefined })
    assert.equal(history.canNext.value, false)
    await history.previous()
    assert.equal(calls.at(-1).page, 3)
    assert.equal(calls.at(-1).cursor, undefined)
    await history.first()
    assert.deepEqual(calls.at(-1), { fundCode: '000042', page: 1, cursor: undefined })
    code.value = '000043'
    await nextTick()
    assert.deepEqual(calls.at(-1), { fundCode: '000043', page: 1, cursor: undefined })
  } finally { scope.stop() }
})
