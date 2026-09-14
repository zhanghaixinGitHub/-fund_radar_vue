import assert from 'node:assert/strict'
import test from 'node:test'
import { effectScope } from 'vue'
import { useSpxManualSync } from '../src/composables/useSpxManualSync.ts'

const start = Date.parse('2026-09-14T07:40:00+08:00')
const attempt = { attemptId: 'new', state: 'ON_TIME', stage: 'DONE', completedSteps: 3,
  requestedAt: new Date(start).toISOString() }
const snapshot = (extra = {}) => ({ serverTime: new Date(Date.now()).toISOString(), availability: 'READY',
  canSync: true, nextAllowedAt: null, lastAttempt: null, performedNow: false, ...extra })
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no }); return { promise, resolve, reject } }
const settle = async () => { for (let n = 0; n < 8; n++) await Promise.resolve() }

function setup(t, api) {
  t.mock.timers.enable({ apis: ['Date', 'setInterval'], now: start })
  const scope = effectScope()
  const model = scope.run(() => useSpxManualSync(api))
  t.after(() => scope.stop())
  return model
}

test('真实阶段自动刷新，完成后倒计时自动恢复按钮，轮询不会POST', async (t) => {
  const pending = deferred()
  let posts = 0, reads = 0, current = snapshot()
  const model = setup(t, { getStatus: async () => { reads++; return current }, synchronize: () => { posts++; return pending.promise } })
  await model.refresh()
  const request = model.synchronize()
  current = snapshot({ availability: 'RUNNING', canSync: false, lastAttempt: { ...attempt, state: 'RUNNING', stage: 'FETCH', completedSteps: 1 } })
  t.mock.timers.tick(1000); await settle()
  assert.equal(model.last.value.stage, 'FETCH')
  pending.resolve(snapshot({ availability: 'COOLDOWN', canSync: false, lastAttempt: attempt, performedNow: true,
    nextAllowedAt: new Date(start + 60000).toISOString() }))
  await request
  assert.equal(model.running.value, false)
  assert.equal(model.last.value.state, 'ON_TIME')
  assert.equal(model.cooldownSeconds.value, 59)
  current = snapshot({ serverTime: new Date(start + 60000).toISOString(), lastAttempt: attempt })
  t.mock.timers.tick(59000); await settle()
  assert.equal(model.canSync.value, true)
  assert.equal(posts, 1)
  assert.equal(reads, 3)
})

test('晚返回的旧GET不会覆盖POST成功结果，开始新请求时不显示旧成功', async (t) => {
  const pendingRead = deferred(), pendingPost = deferred()
  let reads = 0
  const model = setup(t, { getStatus: () => ++reads === 1 ? Promise.resolve(snapshot({ lastAttempt: { ...attempt, attemptId: 'old' } })) : pendingRead.promise,
    synchronize: () => pendingPost.promise })
  await model.refresh()
  const request = model.synchronize()
  assert.equal(model.last.value, null)
  t.mock.timers.tick(1000); await settle()
  pendingPost.resolve(snapshot({ lastAttempt: attempt, performedNow: true }))
  await request
  pendingRead.resolve(snapshot({ availability: 'RUNNING', lastAttempt: { ...attempt, state: 'RUNNING' } }))
  await settle()
  assert.equal(model.last.value.state, 'ON_TIME')
})

test('失败原因保留，显示失败结果后不会自动重发POST', async (t) => {
  let posts = 0, reads = 0
  const model = setup(t, { getStatus: async () => { reads++; return snapshot() }, synchronize: async () => {
    posts++; return snapshot({ lastAttempt: { ...attempt, state: 'FAILED', errorCode: 'SPX_TIMEOUT', message: '连接超时' }, performedNow: true })
  } })
  await model.refresh(); await model.synchronize()
  assert.equal(model.last.value.errorCode, 'SPX_TIMEOUT')
  assert.equal(model.last.value.message, '连接超时')
  t.mock.timers.tick(120000); await settle()
  assert.equal(posts, 1)
  assert.equal(reads, 1)
})

test('服务端拒绝新执行时，明确提示下方是最近一次记录', async (t) => {
  const model = setup(t, { getStatus: async () => snapshot(), synchronize: async () => snapshot({
    canSync: false, availability: 'COOLDOWN', message: '两次同步至少间隔60秒', lastAttempt: attempt,
  }) })
  await model.refresh(); await model.synchronize()
  assert.match(model.notice.value, /未发起新的同步/)
  assert.match(model.notice.value, /最近一次记录/)
})

test('组件卸载后停止状态轮询，也不接纳在途响应', async (t) => {
  t.mock.timers.enable({ apis: ['Date', 'setInterval'], now: start })
  const pending = deferred()
  let reads = 0
  const scope = effectScope()
  const model = scope.run(() => useSpxManualSync({ getStatus: () => {
    reads++; return reads === 1 ? Promise.resolve(snapshot({ availability: 'RUNNING', canSync: false })) : pending.promise
  }, synchronize: async () => snapshot() }))
  await model.refresh()
  t.mock.timers.tick(1000); await settle()
  scope.stop()
  pending.resolve(snapshot({ lastAttempt: attempt })); await settle()
  t.mock.timers.tick(120000); await settle()
  assert.equal(reads, 2)
  assert.equal(model.status.value.availability, 'RUNNING')
})

test('POST连接断开只提示查询，不把未知结果当作采集失败或自动重发', async (t) => {
  let posts = 0
  const model = setup(t, { getStatus: async () => snapshot(), synchronize: async () => { posts++; throw new Error('连接中断') } })
  await model.refresh(); await model.synchronize()
  assert.match(model.error.value, /未能确认本次同步结果/)
  assert.equal(model.canSync.value, false)
  t.mock.timers.tick(120000); await settle()
  assert.equal(posts, 1)
})
