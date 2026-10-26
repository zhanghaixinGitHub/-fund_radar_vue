# 基金雷达 — 市场基础信息与关注后完整详情设计

> 关联需求：`docs_zhx/requirements/fund-detail-expansion.md`
> 关联测试：`docs_zhx/testcase/fund-detail-expansion.md`
> 关联实施看板：`docs_zhx/implementation/fund-radar.md` 的 M1-05
> 版本：v1.0
> 日期：2026-08-28
> 变更等级：L2

## 1. 链路与权限

```text
Vue 市场基础详情
  -> Java GET /api/v1/funds/{fundCode}
  -> FastAPI GET /internal/v1/funds/{fundCode}

Vue 我的关注完整详情
  -> Java GET /api/v1/watchlist/{fundCode}/detail
  -> 当前会话 + watchlist_item 本人关系校验
  -> FastAPI GET /internal/v1/funds/{fundCode}/watchlist-detail
  -> fund_ai 本地读模型

管理员受控基线同步
  -> Python TushareFundSyncService.sync_market_details()
  -> Tushare（只在同步任务中调用）
  -> fund_ai 扩展资料表 + source_sync_run
```

Java 是唯一对浏览器暴露完整详情的边界。Python 内部接口只验证服务令牌、不感知用户；因此 Java 必须在调用 Python 前完成本人关注关系校验。市场基础详情可继续缓存不含用户态的资料快照；本期完整详情不写共享 Redis，避免 `isWatched`、用户标识或授权结论进入缓存。

## 2. 数据模型与粒度

| 表/对象 | 粒度与业务键 | 内容 |
| --- | --- | --- |
| `fund_profile` | `fund_code + source_id` 当前资料快照 | `fund_basic` 的产品资料与内容哈希 |
| `nav_daily` 扩展 | `fund_code + nav_date + source_id` | 原净值字段加公告、分红、资产、复权净值 |
| `fund_manager_assignment` | `fund_code + source_id + source_record_key` | 经理姓名与任职历史 |
| `fund_share_snapshot` | `fund_code + trade_date + source_id` | 基金份额（万份）历史 |
| `fund_dividend` | `fund_code + source_id + source_event_key` | 分红事件及其实施状态 |

所有快照或历史记录均保存 `content_hash`。首次出现为新增、哈希变化为更新、哈希相同为跳过；任何字段缺失保持 `NULL`。同步运行通过既有 `source_sync_run.sync_type` 分别记录 `MARKET_DETAIL_PROFILE`、`MARKET_DETAIL_NAV`、`MARKET_DETAIL_MANAGER`、`MARKET_DETAIL_SHARE`、`MARKET_DETAIL_DIVIDEND`，不记录 Token 或原始响应。

## 3. 接口契约

| 接口 | 权限与用途 |
| --- | --- |
| `GET /api/v1/funds/{fundCode}` | `FUND_READ`；市场基础详情，携带基础资料、基础净值和来源状态 |
| `GET /api/v1/watchlist/{fundCode}/detail` | `FUND_READ` 且本人关注关系存在；完整详情 |
| `GET /internal/v1/funds/{fundCode}/watchlist-detail` | 仅 Java 服务令牌；不含用户态 |

完整详情以 `basic`、`managers`、`latestShare`、`dividends` 四个区块返回；`basic` 内含最新净值快照及扩展净值字段。每个区块都附带来源、业务日期和同步状态；列表限制为基金经理最多 50 条、分红最多 100 条，均按业务日期倒序。不存在基金返回 `404/FUND_NOT_FOUND`，基金存在但当前用户未关注返回 `403/WATCHLIST_REQUIRED`。

## 4. 同步与稳定性

首次同步仅由管理员触发，对当前 43 只市场基金分批执行；先读取来源精确代码，再按接口和代码批量/分页拉取，单个接口失败时整类运行标为失败且不标记成功。同步不从页面、普通读接口或用户关注动作中发起。

本期不新增自动调度。人工基线同步和字段完整性验收完成后，才在后续变更中单独登记目录/经理、净值/规模和分红的刷新计划。

## 5. 回滚

数据库迁移仅新增表和可空列，回滚时先确认新增历史表数据已归档，再删除表和列。Java/Vue 保留市场基础详情的兼容接口；完整详情接口与路由可独立下线，不影响市场浏览或既有关注关系。

## 6. v1.1｜历史解读、时间线与受控比较设计（2026-09-01）

### 6.1 新增只读接口

| 浏览器接口 | Java 授权与校验 | Python 内部接口 | 缓存策略 |
| --- | --- | --- | --- |
| `GET /api/v1/funds/{fundCode}/same-type-comparison` | `FUND_READ` | `GET /internal/v1/funds/{fundCode}/same-type-comparison`，仅服务令牌 | 不使用共享缓存；失败独立降级 |
| `GET /api/v1/watchlist/{fundCode}/share-history?startDate&endDate` | `FUND_READ`、`WATCHLIST_SELF_READ`、本人关注关系、日期左闭右闭且窗口不超过 5,000 天 | `GET /internal/v1/funds/{fundCode}/share-history?startDate&endDate`，仅服务令牌 | 不使用共享缓存，避免授权结果进入缓存 |

浏览器始终访问 Java。Python 的份额历史接口不接收用户标识；Java 先完成当前用户关注关系校验才调用它。不存在基金统一映射为 `404/FUND_NOT_FOUND`，存在但未关注时份额历史统一为 `403/WATCHLIST_REQUIRED`。

### 6.2 数据读取与确定性规则

1. `nav_daily` 历史统计和曲线按 `fund_code + nav_date` 分组；同日期多来源按 `source_registry.source_code ASC` 稳定选取一条。历史区间涨跌优先两端累计净值，端点任一累计净值缺失才使用单位净值；最高/最低值始终是单位净值及对应日期。
2. `fund_share_snapshot` 也按 `fund_code + trade_date` 分组，同日多来源按来源代码升序稳定选取。每条输出保留日期、来源值和来源代码；页面不猜测单位或换算。
3. 同类型比较的候选集固定为 `fund_share_class.status = ACTIVE AND source_code = TUSHARE_PRO_FUND AND fund_type = target.fund_type`。比较前以目标基金最新净值日期过滤候选项，并剔除缺少近一月涨跌率或来源的记录；按 `month_change_rate DESC, fund_code ASC` 排序。响应回传范围代码、目标位置、可比较样本数、每行日期和来源，前端不得改写为全市场排名。
4. 经理与分红时间线直接渲染已有完整详情数组：经理按任职记录，分红按公告记录。两类记录均显示来源和来源日期，缺失保持“暂缺”。

### 6.3 稳定性、性能与降级

份额历史和净值历史均限制至最多 5,000 天；同类型比较限定为当前 43 个市场样本，使用批量净值点查询和批量最新来源查询，避免按基金 N+1。四个页面区块彼此独立：比较、份额趋势、历史曲线任一失败不阻断基础详情；状态分别显示“尚未同步”“数据不足”或“暂时不可用”。任何读取路径均不创建 `source_sync_run`、不调用 Tushare。

## 7. v1.2｜2026-09-01 与多周期预测模块的衔接

`/watchlist/:fundCode` 是关注详情的共同容器：本设计覆盖其中的基础资料、净值历史、份额趋势和时间线；未来趋势预测作为独立区域，遵循 `docs_zhx/design/watchlist-prediction-module.md` 的数据、回测和发布设计。

基础资料接口不得在读取时启动预测；预测读取也不得复用共享缓存中的关注授权结论。两类区域可独立降级：基础资料可用但预测未发布时，用户仍可查看历史资料，并明确看到“预测准备中”；反之不得用预测结果补造缺失的基础资料、持仓或事件事实。

## 8. 经理任期回报（2026-10-26）

- 沿用完整详情接口，在每条经理任职记录增加可空 `tenurePerformance`（Python 内部为 `tenure_performance`）。保留原认证、基金读取权限及关注关系边界，不新增接口、表、采集或调度。Java 原样转发小数比例、实际净值起止日、不可计算原因和是否含共管，不重新计算收益。
- `status` 为 `AVAILABLE` / `UNAVAILABLE`；`returnRate` 是小数比例，`0.125` 表示 `12.50%`，未知为 `null`；`startDate` / `endDate` 为实际净值端点；`reason` 是简短业务说明；`includesCoManagement` 表示此完整任期内有其他经理参与；`calculationBasis=CASH_REINVESTED_NAV_V1` 只保留在契约中，页面展示自然语言口径。
- 计算只支持当前同份额、同 `TUSHARE_PRO_FUND` 来源的境内股票、混合、债券和指数基金；QDII、货币等口径未核实的产品明确不可计算。日历复用已核验的交易所休市事实，范围为 2015-11-16 至 2026-12-31；超出部分不截断成完整任期，日历不等同基金专有申赎日历，有缺数时保守拒绝。
- 起点为任职日起首个有效披露净值日收盘，离任终点为离任日及之前最后一个净值日；在任以最新已披露净值为终点。日历用于检查应有开市日缺口，不删除季末周末等额外披露的净值；周末离任不强求存在周末净值。首日的分红不再计入。逐日连乘 `(当日单位净值 + 当日每份已实施现金分红) / 前日单位净值`，最后减一，中途不舍入，输出保留十二位小数。假设现金按除权日净值立即再投，不计到账延迟和个人申赎费用，不宣称与其他平台同口径。
- 累计净值仅用于核对相邻日的累计现金变化，不以累计净值比值当总回报。来源复权因子仅作为未解释调整的拒绝条件（变化与现金调整差超过 10 基点即拒绝，兼容历史四位净值舍入），不作为收益数值或缺失替代；拆分、折算等未完成核对时明确缺失。分红日期冲突、未实施、披露日期不明、同日多条或现金金额不合法时不计算，未记录现金变化也不得当作零分红。
- 单基金所有经理共用两次输入查询，净值上限 5,000 条、分红上限 100 条，多取一条发现超限即降级；不按经理 N+1。缺少任何应有净值、离任末期未覆盖、重复日期或披露日期异常均拒绝完整任期回报。查询置于独立保存点，异常仅降级回报并保留日志堆栈。
- 前端保持每行一个管理团队时期；卡片展示个人完整任期的回报及实际净值区间。多段任期分别显示，不相加百分比，不把离任空档拼成连续业绩；零回报有效。共管历史明确标注，基金回报不等于经理个人贡献。从业年限与从业年均回报仍不由本基金任期推算。
- 验收覆盖现金再投与普通/累计净值比值的区别、正负零收益、净值/事件缺口、重复、未来披露、非现金调整、来源与份额隔离、有界批量读取、服务令牌、Java 精度透传、前端多任期与空值，并独立记录真实数据库、HTTP 和布局验证。

字段来源：[Tushare 基金净值](https://tushare.pro/document/2?doc_id=119)、[基金分红](https://tushare.pro/document/2?doc_id=120)。

### 8.1 同时展示阶段与完整任期回报

- 完整详情另提供 `managerPeriods`（内部 `manager_periods`）：每项包含展示日期 `beginDate` / `endDate`、该阶段的 `managerNames` 和独立的 `performance`。经理加入日、离任次日切分团队；同名重复、重叠或相邻续任不新增无实际变化的阶段，任职资料空档保留。个人记录中的 `tenurePerformance` 保持原义。
- 两类回报复用同一份有界净值/分红输入及分红再投公式，阶段增多不增加数据库查询。各阶段从自己的首个有效净值收盘独立计算，不能相加阶段百分比，也不能用阶段回报反推或覆盖完整任期回报；单个净值日的阶段保留不可计算说明。
- 左侧日期下展示一次“本阶段回报”和实际净值区间，团队共用；右侧经理卡片明确标注“完整任期回报”并保留个人任期与实际净值区间。当前独管阶段可以没有共管标记，而个人完整任期仍可能含历史共管。
- 前端按展示起止日期及完整团队集合匹配阶段结果，不能只按姓名或起始日期绑定。缺失、重复、团队不一致时保持未知，不拿完整任期回报兜底。旧调用方缺少阶段字段时可继续读取原详情。
