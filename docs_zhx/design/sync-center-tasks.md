# 基金雷达 — 同步中心手动触发与进度设计

> 关联需求：`docs_zhx/requirements/sync-center-tasks.md`
> 关联测试：`docs_zhx/testcase/sync-center-tasks.md`
> 版本：v1.1（补记已实现的免费数据补齐任务）
> 日期：2026-09-09
> 变更等级：L2

## 当前任务口径（2026-09-22）

- 页面移除“完整资料同步”的菜单、任务卡及状态轮询；原完整资料服务、接口和来源运行记录保留兼容，由资料更新服务继续调用。
- “免费数据补齐”对用户改名为“基金资料与市场数据更新”，覆盖基金基础资料、历史净值、经理、份额、分红及已授权市场参考资料。
- “特征快照同步”对用户改名为“历史指标计算”，说明当前只支持股票型基金，使用已保存净值计算涨跌幅、波动和最大回撤；按钮、状态、逐基金进度及详情页名称统一。内部任务类型、接口路径和数据库结构不变。
- 一键同步固定为 **标普500 → 基金资料与市场数据更新 → 净值增量 → 历史指标计算 → 模拟费率**，共五项。资料更新内部已经同步完整资料，因此不再单独创建 `MARKET_DETAIL` 子任务；批次进度分母为 5。
- 单独运行净值增量仍自动计算历史指标；批次内净值步骤仍关闭中途计算，在后续独立步骤只计算一次。本次不调整自动调度的时间、开关或运行方式。
- 验收重点：五项按顺序各执行一次、失败后继续后续步骤、全程互斥、资料更新保留完整资料能力，以及旧页面参数不再显示独立完整资料任务。下文带日期的旧阶段数量属于历史设计，当前以本节为准。

> 2026-09-13新增SPX：一键批次固定顺序为SPX → 完整资料 → 免费数据补齐 → 净值增量 → 特征快照。`LocalSyncJobManager`增加`SPX_MANUAL`阶段，原四项保持原实现；SPX失败后继续其余项。独立按钮经Java `/api/v1/sync-jobs/spx-manual` → Python `/internal/v1/spx-manual`，与批次共用采集、互斥和60秒间隔。SPX资料持久化到本机独立目录，不新增数据库表，完整批次仍沿用当前进程状态且不支持服务重启断点续跑。原SPX Windows自动任务停用；[详细契约与当前验收](../implementation/fund-direction-1d-progress-2026-09-13.md)。

> 当日晚间反馈修正：手动接口取消每日4次预算，`maxAttemptsPerDay=null`；旧1—4号记录继续可读。增加`availability`，与上次采集结果分离；Attempt增加`stage/stageLabel/completedSteps/totalSteps/errorCode`。阶段文件仅说明实际执行到了哪里，不把步骤比例当成时间完成百分比。Vue的`useSpxManualSync`每秒只GET运行状态，间隔倒计时到0再次核实服务端可用性；POST结果使旧GET失效，卸载停止轮询，未知结果不自动重发。异常仅公开固定原因码/说明，内部保留脱敏定位栈。

## 1. 链路

```text
Vue 同步中心（管理员）
  -> Java POST /api/v1/sync-jobs/{任务}
  -> Python POST /internal/v1/funds/sync-jobs/{任务}
  -> LocalSyncJobManager（单后台线程、单活动任务）
  -> TushareFundSyncService + PostgreSQL 咨询锁
  -> Tushare / fund_ai / source_sync_run
  -> StockFeatureSnapshotService（特征咨询锁）
  -> feature_snapshot

Vue 每秒 GET /api/v1/sync-jobs/{jobId}
  -> Java -> Python 进程内 SyncJobSnapshot

Vue 初始化 GET /api/v1/sync-jobs/last-success
  -> Java -> Python -> source_sync_run（持久化成功时间）
```

浏览器不直接连接 Python 或 Tushare。Java 在 Controller 层校验权限，Python 仅接受 Java 服务令牌。同步启动请求立即返回 `202` 与任务标识；真实工作在 Python 的单线程执行器中完成，状态读取不触发外部调用。

## 2. 任务与进度模型

`LocalSyncJobManager` 使用 `SyncJobSnapshot` 保存当前 Python 进程内的实时状态。`MARKET_NAV_INCREMENTAL` 按基金逐只更新进度，并在来源成功后自动执行特征阶段；`MARKET_DETAIL` 的总步数为“基础资料、扩展净值及三类逐基金资料”，经理、规模、分红每读取一只基金就更新一次。`STOCK_FEATURE_SNAPSHOT` 可独立手动重试，只读取本地股票型基金净值并逐基金回报进度。

后续已增加第四类任务 `MARKET_FREE_DATA_COMPLETION`：按需手动执行已授权的免费数据补齐，沿用同一任务互斥和进度读取方式；具体数据阶段及持久化父运行见[数据补齐实施记录](../implementation/tushare-2000-data-completion.md)。来源任务最近成功时间包含净值增量、完整资料和免费补齐三项；特征任务的最近信息仍限于当前 Python 进程。

完整资料同步在既有五个子运行记录外增加 `MARKET_DETAIL` 父运行记录：子运行记录便于定位数据源阶段；父运行记录聚合读取/新增/更新/跳过统计，只在全部子阶段成功后完成。`source_sync_run` 不保存 Token 或原始响应。

| 浏览器接口 | 权限 | 说明 |
| --- | --- | --- |
| `POST /api/v1/sync-jobs/market-nav-incremental` | `SYNC_JOB_START` | 手动净值增量同步 |
| `POST /api/v1/sync-jobs/market-details` | `SYNC_JOB_START` | 手动完整资料同步 |
| `POST /api/v1/sync-jobs/market-free-data-completion` | `SYNC_JOB_START` | 手动免费数据补齐 |
| `POST /api/v1/sync-jobs/stock-feature-snapshots` | `SYNC_JOB_START` | 手动特征快照重试 |
| `GET /api/v1/sync-jobs/{jobId}` | `SYNC_JOB_READ` | 任务实时状态 |
| `GET /api/v1/sync-jobs/*/latest` | `SYNC_JOB_READ` | 当前 Python 进程最近任务 |
| `GET /api/v1/sync-jobs/last-success` | `SYNC_JOB_READ` | 三类来源任务的持久化最后成功时间；不含特征任务重启前历史 |

## 3. 一致性、稳定性与安全

`LocalSyncJobManager` 在进程内限制一个活动任务，`TushareFundSyncService` 使用既有 PostgreSQL 咨询锁处理跨进程来源同步冲突，`StockFeatureSnapshotService` 使用独立咨询锁串行化计划任务与手动重试。启动冲突返回 `409`，不排队、不重试；特征锁冲突或失败在来源成功后以 `PARTIAL_SUCCESS` 保留来源事实。进度回调异常只记录警告，不能中断真实写库。

历史成功时间只查询 `status = SUCCEEDED` 且 `finished_at IS NOT NULL` 的运行记录；失败或运行中的任务不能覆盖展示时间。页面轮询间隔为 1 秒，离开页面立即清理计时器。

## 4. 回滚

无数据库 DDL 变更。回滚 Java、Python 和 Vue 同步中心代码即可；已存在的 `source_sync_run` 记录与详情快照保持不删，净值定时任务不受影响。

## 5. 一键同步全部（2026-09-10）

- 新增 `POST /api/v1/sync-jobs/all`（`SYNC_JOB_START`）及 `GET /api/v1/sync-jobs/all/latest`（`SYNC_JOB_READ`）；Java 转发至同路径的 Python `/internal/v1/funds/sync-jobs/*`，继续校验服务令牌并拒绝浏览器 Origin。批次类型为 `MARKET_ALL`，复用原状态响应，按批次 ID 查询仍使用原接口。
- Python 在同一锁内登记批次和四个子任务，保留单后台线程及整个批次的互斥占用。顺序为完整资料、免费数据补齐、净值增量、特征快照；任一阶段完成清理后才进入下一阶段。批次内净值任务关闭中途特征生成，统一在最后生成一次；单独运行净值任务仍自动生成特征。
- 四类入口各执行一次，完整资料与免费补齐内部有既有数据范围重叠；沿用其幂等写入，不将批次统计解释为去重后的新增数据。批次进度为已结束任务数 / 4，当前步骤显示子任务真实进度；读取条数和来源运行 ID 保留在对应子任务中。
- 每项失败后继续尝试后续项；四项成功才为 `SUCCEEDED`，部分成功为 `PARTIAL_SUCCESS`，全部失败为 `FAILED`。后续来源缺失时仍由原服务拒绝，不能因批次继续而绕过来源、权限、数据质量检查。批次指出失败任务，页面提供原单项重试入口。
- 一键与单项按钮在加载、状态未知、创建或执行期间禁用，后端同步检查互斥。POST 不自动重试；响应丢失时只重新读取最近任务。页面刷新、离开不影响后台串行调度；离开后清理轮询，读失败时延长到 5 秒重试。
- 延续本机进程内任务模型，不引入数据库迁移。Python 重启会清空实时批次及子任务状态，不承诺断点续跑；三类来源成功时间仍从 `source_sync_run` 读取。
