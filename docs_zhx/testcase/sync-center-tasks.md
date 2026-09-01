# 基金雷达 — 同步中心手动触发与进度测试用例

> 关联需求：`docs_zhx/requirements/sync-center-tasks.md`
> 关联设计：`docs_zhx/design/sync-center-tasks.md`

## TC-01｜管理员手动触发与实时进度

前置条件：Python、Java、Vue、PostgreSQL 已启动；管理员已登录；Tushare 仅使用已授权的本机配置。

操作步骤：

1. 打开“数据同步中心”，确认三张任务卡均可见，第三张显示“同步特征快照”。
2. 在“基金市场净值增量同步”点击“开始同步”。
3. 观察进度条、当前基金和步骤数至少连续刷新两次。
4. 在任务进行时尝试点击三张卡的按钮。
5. 等待任务结束，刷新页面。

数据库验证：

```sql
SELECT sync_type, status, started_at, finished_at, fetched_count, created_count, updated_count, skipped_count
FROM source_sync_run
WHERE sync_type = 'MARKET_NAV_INCREMENTAL'
ORDER BY started_at DESC
LIMIT 1;
```

| 验收点 | 预期值 |
| --- | --- |
| 触发 | 返回任务标识，页面不等待完整同步结束 |
| 进度 | 每秒更新真实服务端步骤、说明和当前基金 |
| 并发 | 运行中三张卡的按钮均不可点击；重复请求返回冲突 |
| 完成 | 最终统计与 `source_sync_run` 一致 |
| 刷新 | 任务卡显示持久化的上次成功同步时间 |

测试结果：

- [ ] 待执行

---

## TC-02｜完整资料同步的阶段进度与父运行记录

前置条件：数据库已执行 `20260828_06` 迁移；基金市场存在已登记的 Tushare 基金；管理员已登录并确认本次 Tushare 调用范围。

操作步骤：

1. 点击“基金市场完整资料同步”的“开始同步”。
2. 依次确认页面出现基础资料、扩展净值、经理、规模、分红的真实进度说明。
3. 等待成功后查看任务统计和“上次成功同步时间”。
4. 故意以测试 Provider 使任意子阶段失败，再观察状态。

数据库验证：

```sql
SELECT sync_type, status, started_at, finished_at, error_summary
FROM source_sync_run
WHERE sync_type IN (
  'MARKET_DETAIL', 'MARKET_DETAIL_PROFILE', 'MARKET_DETAIL_NAV',
  'MARKET_DETAIL_MANAGER', 'MARKET_DETAIL_SHARE', 'MARKET_DETAIL_DIVIDEND'
)
ORDER BY started_at DESC;
```

| 验收点 | 预期值 |
| --- | --- |
| 进度 | 经理、规模、分红阶段按已完成基金数持续推进 |
| 全量成功 | 五个子运行和一个 `MARKET_DETAIL` 父运行均为 `SUCCEEDED` |
| 任一失败 | 父运行是 `FAILED`，页面不把本次显示为完整成功 |
| 历史时间 | “上次成功同步时间”仅取 `MARKET_DETAIL` 的最近成功 `finished_at` |

测试结果：

- [ ] 离线接口与任务测试待执行
- [ ] 真实 Tushare 调用待管理员在页面明确触发后执行

---

## TC-03｜权限与服务边界

前置条件：准备管理员、无 `SYNC_JOB_START` 权限用户及无 Cookie 请求。

操作步骤：

1. 无权限用户调用三个 Java 同步接口。
2. 使用浏览器 `Origin` 直接调用 Python 内部同步接口。
3. 使用有效管理员会话调用 Java 接口。

| 验收点 | 预期值 |
| --- | --- |
| Java 权限 | 无权限用户被拒绝，不创建任务 |
| Python 边界 | 浏览器 Origin 被 Python 拒绝 |
| 凭据 | 任意响应、错误和日志均不返回服务令牌或 Tushare Token |
| 管理员 | 仅经 Java 成功创建并轮询任务 |

测试结果：

- [ ] 待执行

---

## TC-04｜特征自动同步、手动重试与部分成功

前置条件：至少一只股票型基金具备已授权历史净值；不存在 ACTIVE 模型、评分、回测或通知。

操作步骤：

1. 成功执行一次基金市场净值增量同步，观察任务进入特征阶段。
2. 确认特征成功时净值任务完成，并在特征任务卡查看统计。
3. 以测试桩使特征构建失败，确认净值任务显示 `PARTIAL_SUCCESS`。
4. 点击“同步特征快照”，确认仅本地读取、逐基金进度与最终写入统计可见。

数据库验证：

```sql
SELECT fund_code, as_of_date, feature_version, eligibility_status
FROM feature_snapshot
ORDER BY computed_at DESC;
```

| 验收点 | 预期值 |
| --- | --- |
| 自动触发 | 仅在净值类来源成功后构建特征，不调用新的外部数据源 |
| 部分成功 | 保留市场净值的 source_sync_run 与统计，特征失败可单独重试 |
| 互斥 | 计划任务与手动重试同时到达时，只有一个特征构建获得咨询锁 |
| 边界 | 不创建 SCORED 评分、回测运行或站内通知 |

测试结果：

- [ ] 真实页面与来源调用待管理员明确触发后执行
