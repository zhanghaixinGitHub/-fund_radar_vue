import test from 'node:test'
import assert from 'node:assert/strict'
import { buildFundManagerProfiles, buildFundManagerTimeline, formatManagerTenureReturn, matchManagerPeriodReturn } from '../src/utils/fundManagerTimeline.ts'

const record = (managerName, beginDate, endDate = null) => ({
  managerName, beginDate, endDate, annDate: null, education: null, dataSource: 'TUSHARE',
})
const timeline = (managers, asOfDate = '2026-10-26') => buildFundManagerTimeline(managers, asOfDate)
const period = (beginDate, endDate, ...managerNames) => ({ beginDate, endDate, managerNames })

test('经理加入和离任各拆一行，同期管理人并列，最近时期在前', () => {
  const managers = [record('陆阳', '2024-01-30'), record('雷涛', '2024-01-30', '2026-05-29')]
  assert.deepEqual(timeline(managers).periods, [
    period('2026-05-30', null, '陆阳'),
    period('2024-01-30', '2026-05-29', '雷涛', '陆阳'),
  ])
})

test('交错任期保留中途加入与离开，共管不能误画成连续独管', () => {
  assert.deepEqual(timeline([
    record('甲', '2024-01-01'), record('乙', '2024-03-01', '2024-05-31'),
  ]).periods, [
    period('2024-06-01', null, '甲'),
    period('2024-03-01', '2024-05-31', '甲', '乙'),
    period('2024-01-01', '2024-02-29', '甲'),
  ])
})

test('同日交接保留一天共管，起止日均计入任期', () => {
  assert.deepEqual(timeline([
    record('甲', '2024-01-01', '2024-03-01'), record('乙', '2024-03-01'),
  ]).periods, [
    period('2024-03-02', null, '乙'),
    period('2024-03-01', '2024-03-01', '甲', '乙'),
    period('2024-01-01', '2024-02-29', '甲'),
  ])
})

test('同名重复、重叠和连续续任不重复展示，也不拆出无团队变更的时期', () => {
  const managers = [
    record('甲', '2024-01-01', '2024-03-31'),
    record('甲', '2024-02-01', '2024-04-30'),
    record('甲', '2024-05-01'),
    record('甲', '2024-05-01'),
  ]
  const original = managers.map(manager => ({ ...manager }))
  assert.deepEqual(timeline(managers).periods, [period('2024-01-01', null, '甲')])
  assert.deepEqual(managers, original)
})

test('任职空档如实留空，全部离任后不把前任显示到今天', () => {
  assert.deepEqual(timeline([
    record('甲', '2024-01-01', '2024-01-31'), record('乙', '2024-03-01', '2024-04-30'),
  ]).periods, [
    period('2024-05-01', null),
    period('2024-03-01', '2024-04-30', '乙'),
    period('2024-02-01', '2024-02-29'),
    period('2024-01-01', '2024-01-31', '甲'),
  ])
})

test('缺日期、非法日期、倒置日期和空姓名单独保留，不用公告日期填补', () => {
  const managers = [
    { ...record('甲', null), annDate: '2024-01-01' },
    record('乙', '2024-02-30'), record('丙', '2024-01-01', '未知'),
    record('丁', '2024-03-01', '2024-01-01'), record(' ', '2024-01-01'),
  ]
  const result = timeline(managers)
  assert.deepEqual(result.periods, [])
  assert.deepEqual(result.unplacedRecords.map(item => item.manager), managers)
})

test('未来任职单独说明，尚未生效的离任不能提前改变当前团队', () => {
  const result = timeline([
    record('甲', '2024-01-01', '2026-11-01'), record('乙', '2026-11-02'),
  ])
  assert.deepEqual(result.periods, [period('2024-01-01', null, '甲')])
  assert.equal(result.unplacedRecords[0].reason, '尚未到任职日期')
})

test('空输入保持空态，非法截止日期明确失败', () => {
  assert.deepEqual(timeline([]), { periods: [], unplacedRecords: [] })
  assert.throws(() => timeline([], '2026-02-30'), RangeError)
})

test('资料卡保留学历及完整任期，累计天数独立于团队分期且不修改原记录', () => {
  const managers = [
    { ...record('陆阳', '2024-01-30'), education: '硕士' },
    record('雷涛', '2024-01-30', '2026-05-29'),
  ]
  const original = managers.map(manager => ({ ...manager }))
  const profiles = buildFundManagerProfiles(managers, '2026-10-26')
  assert.deepEqual(profiles.get('陆阳'), {
    managerName: '陆阳', educationLabel: '硕士',
    tenureRanges: [{ beginDate: '2024-01-30', endDate: null }],
    tenureDays: 1001, incompleteTenure: false,
  })
  assert.equal(profiles.get('雷涛').tenureRanges[0].endDate, '2026-05-29')
  assert.deepEqual(managers, original)
})

test('资料卡合并重复与重叠任期，分段任期保留空档且不累计未来天数', () => {
  const profiles = buildFundManagerProfiles([
    record('甲', '2024-01-01', '2024-01-31'),
    record('甲', '2024-01-15', '2024-01-31'),
    record('甲', '2024-01-01', '2024-01-31'),
    record('甲', '2024-03-01', '2024-03-31'),
    record('甲', '2024-04-01'),
    record('甲', '2027-01-01'),
  ], '2024-04-02')
  assert.deepEqual(profiles.get('甲').tenureRanges, [
    { beginDate: '2024-01-01', endDate: '2024-01-31' },
    { beginDate: '2024-03-01', endDate: null },
  ])
  assert.equal(profiles.get('甲').tenureDays, 64)
})

test('缺失任期只累计已知天数，学历缺失或冲突均不擅自补填', () => {
  const profiles = buildFundManagerProfiles([
    { ...record('甲', '2024-01-01'), education: ' 硕士 ' },
    { ...record('甲', null), education: '博士' },
    record('乙', '2024-02-30'),
    record('丙', '2024-02-01', '2024-01-01'),
  ], '2024-01-01')
  assert.equal(profiles.get('甲').tenureDays, 1)
  assert.equal(profiles.get('甲').incompleteTenure, true)
  assert.equal(profiles.get('甲').educationLabel, '学历待核实')
  assert.equal(profiles.get('乙').tenureDays, null)
  assert.equal(profiles.get('乙').educationLabel, '学历暂缺')
  assert.deepEqual(profiles.get('丙').tenureRanges, [])
  assert.throws(() => buildFundManagerProfiles([], '未知'), RangeError)
})

test('回报只格式化后端完成的同一任期结果，零回报有效，缺失不补零', () => {
  const performance = { status: 'AVAILABLE', returnRate: '0.123456', startDate: '2024-01-30', endDate: '2026-10-23' }
  assert.equal(formatManagerTenureReturn(performance), '+12.35%')
  assert.equal(formatManagerTenureReturn({ ...performance, returnRate: '0' }), '0.00%')
  assert.equal(formatManagerTenureReturn({ ...performance, returnRate: '-0.1' }), '-10.00%')
  for (const value of [null, undefined, '', 'NaN', 'Infinity', '-1'])
    assert.equal(formatManagerTenureReturn({ ...performance, returnRate: value }), '暂无法计算')
  assert.equal(formatManagerTenureReturn({ ...performance, status: 'UNAVAILABLE' }), '暂无法计算')
  assert.equal(formatManagerTenureReturn({ ...performance, endDate: '2024-01-01' }), '暂无法计算')
  assert.equal(formatManagerTenureReturn(null), '暂无法计算')
})

test('多段任期回报分别保留实际净值日期，共管信息不丢失且不累计百分比', () => {
  const first = { status: 'AVAILABLE', returnRate: '0.1', startDate: '2024-01-02', endDate: '2024-01-31', includesCoManagement: true }
  const second = { status: 'UNAVAILABLE', returnRate: null, reason: '任期内净值缺失' }
  const managers = [
    { ...record('甲', '2024-01-01', '2024-01-31'), tenurePerformance: first },
    { ...record('甲', '2024-01-01', '2024-01-31'), tenurePerformance: first },
    { ...record('甲', '2024-03-01'), tenurePerformance: second },
  ]
  const profile = buildFundManagerProfiles(managers, '2026-10-26').get('甲')
  assert.equal(profile.tenureReturns.length, 2)
  assert.deepEqual(profile.tenureReturns.map(entry => entry.performance), [first, second])
})

test('阶段回报按完整日期和团队匹配，顺序不影响，缺失或冲突不挪用完整任期', () => {
  const stage = period('2024-12-20', '2026-05-29', '雷涛', '陆阳')
  const performance = { status: 'AVAILABLE', returnRate: '0.5', startDate: '2024-12-20', endDate: '2026-05-29' }
  const returned = { ...stage, managerNames: ['陆阳', '雷涛'], performance }
  assert.equal(matchManagerPeriodReturn(stage, [returned]), performance)
  assert.equal(matchManagerPeriodReturn(stage, []), null)
  assert.equal(matchManagerPeriodReturn(stage, [{ ...returned, beginDate: '2024-01-30' }]), null)
  assert.equal(matchManagerPeriodReturn(stage, [{ ...returned, endDate: null }]), null)
  assert.equal(matchManagerPeriodReturn(stage, [{ ...returned, managerNames: ['陆阳', '其他人'] }]), null)
  assert.equal(matchManagerPeriodReturn(stage, [returned, returned]), null)
  assert.equal(matchManagerPeriodReturn(stage, [{ ...returned, managerNames: ['陆阳', '陆阳'] }]), null)
  assert.equal(formatManagerTenureReturn(matchManagerPeriodReturn(stage)), '暂无法计算')
})
