# 全市场基金雷达 — 总体设计

> 关联需求：`docs_zhx/requirements/fund-radar.md`
> 版本：v0.1（总体设计）
> 日期：2026-08-24
> 架构原则：前端只调 Java；Java 是业务与审计边界；FastAPI 是内部 AI/数据服务；交易执行默认不存在。

## 1. 架构总览

```text
Vue 3 前端
    │ HTTPS /api/v1/*
    ▼
Spring Boot（Java 核心服务）
    ├── fund-core PostgreSQL：关注、提醒、信号快照、审计
    ├── Redis：缓存、限流、提醒任务协调
    │ mTLS 或服务签名 /internal/v1/*
    ▼
FastAPI + Pydantic（Python AI 服务）
    ├── SQLAlchemy + Alembic：基金库、净值、事件、特征、回测、模型版本
    ├── Celery + Redis：采集、清洗、评分、回测任务
    └── 外部数据适配器：官方披露、基金公告、授权资讯、后期社交数据
```

前端不访问 FastAPI、不持有外部数据源密钥；FastAPI 不操作用户关注、持仓或交易；Java 不训练模型、不爬取外部站点。

## 2. 工程与模块规划

### 2.1 前端：`C:\WebStormProject\workSpace05`

推荐 Vue 3、TypeScript、Vite、Pinia、Vue Router、ECharts。页面以 Java REST API 为唯一数据入口。

```text
src/
  api/             # Java API 客户端、统一错误处理、请求 TraceID
  views/           # 市场总览、基金列表、基金详情、资讯、回测、关注与提醒
  components/      # 走势、回撤、风险标签、资讯卡片、信号解释卡片
  stores/          # 用户会话、筛选条件、关注列表、页面缓存
  router/          # 路由与访问控制
  types/           # 与 Java API 对齐的 TypeScript 类型
```

### 2.2 Java：`C:\ideaProject\workSpace12`

采用 Spring Boot 4.1.1 + Java 17，遵循 `Controller → Service → Mapper/Repository → Entity` 分层，按业务域组织。

```text
fund/              # 对外基金目录、详情和查询编排
watchlist/         # 关注基金
alert/             # 提醒规则与提醒记录
signal/            # AI 信号快照接收、查询与审计
marketnews/        # 面向前端的资讯读模型
integration/ai/    # FastAPI 内部客户端、签名、超时、熔断与幂等
audit/             # 访问与关键操作审计
security/          # 认证、授权、数据范围控制
```

### 2.3 Python：`C:\pythonProject\workSpace06`

采用 FastAPI + Pydantic + SQLAlchemy + Alembic + Celery。FastAPI 仅暴露 Java 所需的内部 AI/数据接口；采集、回测与训练均由 Celery Worker 在后台执行。数据源配置和运行诊断先通过配置文件、受限内部接口与日志管理，不引入第二套面向业务用户的管理后台。

```text
app/api/           # FastAPI 路由、内部鉴权、异常映射
app/schemas/       # Pydantic 请求/响应模型
app/services/      # AI、采集、回测业务编排
app/repositories/  # SQLAlchemy 数据访问
app/models/        # SQLAlchemy 数据模型
app/integrations/  # 外部数据源适配器、限流、授权元数据
app/workers/       # Celery 任务与任务编排
alembic/            # 数据库迁移
```

## 3. 数据设计与所有权

MVP 可使用同一 PostgreSQL 实例但分为两个独立数据库：`fund_core` 和 `fund_ai`。禁止跨服务直接写对方数据库；以内部 API 传递数据，避免双写和所有权不清。

### 3.1 Java 拥有：`fund_core`

| 表 | 关键字段 | 说明 |
| --- | --- | --- |
| `user_account` | `user_id`、`status` | 一期单用户也保留扩展空间；不保存支付宝凭证 |
| `watchlist_item` | `user_id`、`fund_code`、`created_at` | 用户主动关注的基金 |
| `alert_rule` | `rule_id`、`user_id`、`fund_code`、`rule_type`、`threshold` | 风险、事件和信号变化提醒 |
| `signal_snapshot` | `signal_id`、`fund_code`、`as_of_date`、`model_version`、`payload_hash` | AI 结果的不可变业务快照 |
| `notification` | `notification_id`、`rule_id`、`status`、`created_at` | 站内提醒与送达记录 |
| `portfolio_snapshot` | `snapshot_id`、`user_id`、`source_kind`、`data_as_of_status`、`source_content_hash` | 用户确认的本机持仓快照主记录；数据日期未知时日期必须为 `NULL` |
| `portfolio_holding_snapshot` | `snapshot_id`、`fund_code`、`fund_name`、`reported_amount`、`reported_*_gain_*` | 截图中确认的展示字段；不存原图、不将其误作份额/成本/净值 |
| `audit_log` | `trace_id`、`actor`、`action`、`target_id`、`occurred_at` | 关键访问、配置和信号接收审计 |

`signal_snapshot` 唯一约束：`(fund_code, as_of_date, model_version)`；重复接收必须幂等。

### 3.2 FastAPI AI 服务拥有：`fund_ai`

| 表 | 关键字段 | 说明 |
| --- | --- | --- |
| `fund_master` | `fund_master_id`、`manager_id`、`fund_type`、`status` | 基金主实体 |
| `fund_share_class` | `fund_code`、`fund_master_id`、`share_class`、`benchmark_code` | 份额类别；净值按此粒度存储 |
| `nav_daily` | `fund_code`、`nav_date`、`unit_nav`、`accumulated_nav`、`source_id` | 日净值；唯一约束 `(fund_code, nav_date, source_id)` |
| `source_registry` | `source_id`、`license_scope`、`rate_limit`、`enabled` | 来源授权、频率与开关 |
| `news_item` | `news_id`、`source_id`、`published_at`、`url`、`content_hash` | 仅存授权范围内的内容与元数据 |
| `market_event` | `event_id`、`event_type`、`confidence`、`published_at` | 政策、公告、行业、宏观等事件 |
| `event_relation` | `event_id`、`entity_type`、`entity_id`、`relevance_score` | 事件到行业/指数/基金/管理人的关联 |
| `feature_snapshot` | `fund_code`、`as_of_date`、`feature_version`、`completeness` | 可重现特征快照 |
| `forecast_result` | `forecast_id`、`fund_code`、`as_of_date`、`model_version`、`risk_level` | 概率、置信度和解释 |
| `backtest_run` | `run_id`、`strategy_version`、`window_start`、`window_end`、`status` | 防止回测结果与模型版本混淆 |

`nav_daily` 按 `nav_date` 月度或季度分区；所有写入使用来源、日期和内容哈希去重。金额与净值采用 `NUMERIC`，禁止使用 `double/float` 作为持久化金额类型。

## 4. 接口契约

### 4.1 前端 → Java（公开业务 API）

| 接口 | 用途 | 要点 |
| --- | --- | --- |
| `GET /api/v1/funds` | 分页筛选基金 | 强制分页、类型/状态/关键词白名单过滤 |
| `GET /api/v1/funds/{fundCode}` | 基金详情 | 返回数据截至时间与产品类型 |
| `GET /api/v1/funds/{fundCode}/signals` | 信号历史 | 默认按日期倒序，携带模型版本和解释 |
| `GET /api/v1/funds/{fundCode}/nav-history` | 已落库历史单位净值 | `startDate`、`endDate` 可选；最多 5,000 天；不触发外部请求 |
| `GET /api/v1/funds/{fundCode}/events` | 关联资讯与事件 | 返回来源链接、可信度、相关性，不宣称因果 |
| `GET /api/v1/portfolio/current` | 读取本机当前持仓快照 | 只读；返回日期状态与确认字段，不读支付宝、不计算实时净值 |
| `POST /api/v1/watchlist` | 添加关注 | 幂等；仅允许有效基金代码 |
| `DELETE /api/v1/watchlist/{fundCode}` | 取消关注 | 仅能操作本人数据 |
| `GET/PUT /api/v1/alert-rules` | 管理提醒 | 阈值校验、频率限制、审计 |
| `GET /api/v1/backtests/{runId}` | 查看回测 | 显示样本区间、基线、费用假设与风险指标 |

响应统一包含 `traceId`、`dataAsOf`；页面不展示“必涨”“立即买入”等确定性文案。

### 4.2 Java → FastAPI（内部 API）

| 接口 | 用途 | 保护措施 |
| --- | --- | --- |
| `GET /internal/v1/funds/{fundCode}` | 获取 AI 数据读模型 | 服务身份认证、短超时、只读 |
| `GET /internal/v1/signals` | 分页拉取已完成信号 | 游标、模型版本、结果哈希 |
| `GET /internal/v1/funds/{fundCode}/nav-history` | 查询已落库历史单位净值 | 受 `X-Service-Token` 保护；日期区间最多 5,000 天 |
| `GET /internal/v1/events` | 拉取已审核事件 | 只返回授权范围内摘要和链接 |
| `POST /internal/v1/tasks/rebuild` | 受控触发补数/重算 | 管理权限、幂等键、审计、队列异步执行 |

Java 调用 FastAPI 失败时必须降级为缓存数据，并显示最后成功更新时间；不得同步等待长时间模型训练或爬虫任务。

M0 的字段名、分页、错误码与已实现状态见 `docs_zhx/design/fund-radar-api-v1.md`；当前 M1 已有 6 条一次性手工核验目录样本，但自动目录/净值同步仍必须等到已确认授权的数据源。

## 5. 数据任务与模型设计

### 5.1 Celery 任务

- `sync_catalog`：周期同步基金目录和状态，变更审计。
- `sync_nav_daily`：按交易日同步净值，校验缺失、异常值和重复数据，可断点续跑。
- `collect_public_events`：按来源限频拉取公开/授权资讯，保存来源授权与抓取结果。
- `normalize_and_link_event`：去重、分类、实体关联和可信度评分。
- `build_features`：按基金类型构建特征，记录完整度。
- `score_funds`：仅对特征完整的基金生成日频信号。
- `run_backtest`：使用滚动时间窗和未见数据集验证，异步存档结果。

每个任务具有 `task_id`、幂等键、重试上限、退避策略、运行耗时、成功/失败数量和错误摘要。外部请求必须设置连接与读取超时；限流或授权异常不应无限重试。

### 5.2 分析原则

- 股票、混合、指数类：趋势、波动、回撤、基准/行业相关性和经过评级的事件信号。
- 债券类：收益率/利率环境、期限与信用风险相关特征；不套用权益模型。
- QDII：标识外盘、汇率、时区和估值滞后；不与境内日频结果直接横向排名。
- 货币基金：不使用涨跌预测模型，只输出收益与流动性指标。
- 新闻/政策先分析一次并关联实体，禁止为每只基金重复调用大模型。
- 首版优先实现可解释的规则/统计基线；复杂模型必须在相同样本、费用假设和滚动回测下证明增益后才启用。

信号最小字段：`fundCode`、`asOfDate`、`horizon`、`direction`、`upProbability`、`confidence`、`riskLevel`、`maxDrawdownEstimate`、`evidence[]`、`featureVersion`、`modelVersion`、`generatedAt`。

## 6. 七维治理设计

| 维度 | 方案 | 主要风险与控制 |
| --- | --- | --- |
| 业务边界 | 全市场分析和个人关注分离；无交易执行 | AI 被误解为荐基；固定风险提示、解释和审计 |
| 数据架构 | 两个独立数据库、按日期分区、来源哈希去重 | 份额类别混淆、净值补数；唯一约束和数据质量状态 |
| 性能 | 日频批量计算、分页、缓存；事件一次解析后多对多关联 | 不按基金逐个调用大模型，避免成本失控 |
| 可用性 | 外部来源隔离、超时、限流、退避重试和缓存降级 | 数据源失败时标示陈旧数据，不伪造实时结果 |
| 安全 | 前端仅连 Java；服务间认证；密钥仅环境变量；最小权限数据库账号 | 禁止支付宝认证要素、新闻密钥和未脱敏内容进入日志 |
| 可观测性 | TraceID、任务指标、来源健康、模型版本、数据新鲜度、审计日志 | 按来源/任务/模型设置失败和延迟告警 |
| 工程化 | API v1、契约测试、迁移脚本、分环境配置、容器化与回滚 | Python/Java 独立发布；模型和数据版本可回滚 |

## 7. 风险与实施前决策

| 优先级 | 事项 | 决策/处理方式 |
| --- | --- | --- |
| P0 | 自动交易与支付宝账户接入 | 本期永久禁用；未来必须取得书面平台授权并重新评审 |
| P0 | 对外公开荐基或多人资金 | 本期不支持；扩展前完成合规与权限设计 |
| P1 | 行情、新闻与社交数据授权 | 每个来源先登记授权范围、频率和保存期限，未确认不接入 |
| P1 | 模型有效性 | 未完成防泄漏滚动回测和基线比较，不展示方向性信号 |
| P1 | 单用户/多用户范围 | 默认单用户；多用户时再设计注册、RBAC、数据隔离与账号注销 |
| P2 | 前端技术栈 | 方案默认 Vue 3；实施前锁定 Node、包管理器和组件库版本 |

## 8. v0.2｜Tushare 同步设计与字段映射

### 8.1 同步链路

```text
Celery / 受控本机命令
  → Tushare HTTPS（连接、读取、连接池超时；有限重试）
  → Python 规范化和批量幂等写入 fund_ai
  → FastAPI 内部只读接口
  → Java 缓存降级与业务 API
  → Vue 展示单位净值、累计净值（可为空）、净值日期与来源
```

浏览器不直接调用 Tushare；同步命令和任务不接收浏览器参数，不写入交易、持仓、支付宝认证信息或外部原始响应。

### 8.2 字段映射

| Tushare 接口/字段 | 规范化规则 | 目标 | 说明 |
| --- | --- | --- | --- |
| `fund_company.shortname`、`name` | 仅在简称唯一时映射为公司全称 | 同步内存中的 `manager_name` | 不额外建公司表；简称歧义时回退 `fund_basic.management` |
| `fund_basic.ts_code` | 去除 `.OF`、`.SH`、`.SZ` 后作为现有项目基金代码；冲突则本次失败 | `fund_share_class.fund_code` | 不以页面名称作为业务键 |
| `fund_basic.name` | 新建记录时作为无法可靠拆分主产品时的保守回退 | `fund_master.fund_name`、`fund_share_class.fund_name` | 已存在的人工核验主实体不覆盖 |
| `fund_basic.management` | 简称映射后写入 | `fund_master.manager_name` | 缺失管理人则跳过并计数 |
| `fund_basic.fund_type`、`status` | 映射到 `STOCK`、`MIXED`、`BOND`、`INDEX`、`MONEY`、`QDII`、`FOF`、`OTHER` 和 `ACTIVE`、`DELISTED`、`ISSUING` | 主实体/份额类别类型与状态 | 不使用不可靠的名称猜测基金类型 |
| `fund_basic.name` 末尾常见 A/C/E/H/R/Y | 保守识别，否则 `UNSPECIFIED` | `fund_share_class.share_class` | 不把 ETF 名称末尾的 F 当份额类别 |
| `fund_nav.ts_code`、`nav_date`、`unit_nav`、`accum_nav` | 仅接受指定日期、非负有限数值；业务字段计算 SHA-256 | `nav_daily` | 主键为 `(fund_code, nav_date, source_id)`，相同哈希跳过、不同哈希更新 |

### 8.3 完整性、运行记录与失败处理

- `fund_basic` 按 `market(E/O) × status(L/D/I)` 请求。任何分片返回数达到本机配置的行数上限时，目录任务失败关闭，不清表、不写入部分目录。
- `fund_nav` 必须显式传入日期并按该日期一次批量请求；只为已存在的目录份额落库，未知代码只计数跳过。全市场目录未完成时，它不能被表述为全市场净值覆盖。
- `source_registry` 保存授权范围、限频、最近成功/错误摘要；`source_sync_run` 保存每一次目录或净值同步的状态、请求日期和新增/更新/跳过统计。两者均不得保存 Token、Cookie 或原始响应。
- 目录按 500 条一批事务提交；失败后允许新建运行重试，依赖业务键与内容哈希防重。目录同步不做“本次未出现即删除”。
- `fund_share_class.source_code` 表示目录来源；详情存在净值时优先显示最新净值来源，否则显示目录来源，避免把手工目录误标为 Tushare 净值。
- 详情页的 `unitNav`、`accumulatedNav`、`asOfDate` 和 `dataSource` 必须取自同一条按“净值日期倒序、来源代码正序”选出的 `nav_daily` 记录；累计净值为 `NULL` 时对外保持 `null`，页面显示“暂缺”，不得以单位净值替代。

## 9. v0.3｜重点基金历史净值闭环设计

### 9.1 受控范围与同步

全市场 `fund_basic` 分片在当前权限下命中 15,000 条上限时，完整性无法证明，因此独立的 `focused` 同步只能处理配置中的六个精确 Tushare 代码：`010710.OF`、`160323.SZ`、`013275.OF`、`007832.OF`、`002112.OF`、`005312.OF`。配置项 `TUSHARE_FOCUSED_FUND_TS_CODES` 只能填写带市场后缀的代码；空值、重复值或格式错误均拒绝启动。

同步先完整拉取六条目录，再完整拉取每一只基金指定日期范围的历史净值，之后才分批落库。任一目录未精确命中、历史返回空、混入非目标代码或返回行数达到 `TUSHARE_FOCUSED_NAV_MAX_ROWS_PER_QUERY`（默认 10,000）时，运行失败关闭，避免部分范围被误认为完整。运行类型分别为 `FOCUSED_CATALOG` 与 `FOCUSED_NAV_HISTORY`，保留新增、更新、跳过统计和脱敏错误，不记录凭证或原始响应。

`nav_daily` 继续以 `(fund_code, nav_date, source_id)` 为业务去重键，并按月分区。迁移 `20260827_04` 为 2015-01 至 2026-07 补齐历史分区（当月分区沿用既有分区）；同一日期多来源读取时，按来源代码正序选择稳定的一条，避免前端曲线出现重复日期。

### 9.2 读取与展示

```
Vue FundDetailPage
  -> Java GET /api/v1/funds/{fundCode}/nav-history
  -> FastAPI GET /internal/v1/funds/{fundCode}/nav-history
  -> fund_ai.nav_daily（仅持久化查询）
```

Java 以基金代码和日期范围作为 Redis 缓存键。FastAPI 失败时可返回最后一次成功的完整缓存响应，并携带 `stale=true` 与 `cachedAt`；缓存不存在则按既有错误契约失败。Vue 使用实际单位净值绘制无动画折线，并提供可访问的最近 12 个数据点表格，不能用颜色单独表达涨跌或缓存状态。

## 10. v0.4｜重点基金工作日增量同步设计

### 10.1 水位与任务链路

```text
唯一 Celery Beat（工作日 20:00，Asia/Shanghai）
  -> fund_ai.tushare.sync_focused_nav_incremental
  -> 每只基金查询 TUSHARE_PRO_FUND 的 max(nav_date)
  -> fund_nav(ts_code, start_date=水位+1, end_date=本轮日期)
  -> 窗口与代码校验 -> nav_daily 幂等写入 -> source_sync_run
```

`FOCUSED_NAV_INCREMENTAL` 不新增表：水位按 `source_id + fund_code` 读取 `nav_daily`，仍以 `(fund_code, nav_date, source_id)` 幂等写入。所有六只基金必须已有 Tushare 历史基线；任一基线缺失时任务创建失败运行记录并停止，要求先执行 `focused` 完整回填。若水位已达到本轮日期，不发起外部调用、以 0 条变更成功结束。

每只外部响应只接受自身窗口内的 `ts_code` 和 `nav_date`；窗口外、非目标基金或同一基金日期存在矛盾净值都会失败关闭。任务默认配置为开关开启、20:00；可用 `TUSHARE_FOCUSED_INCREMENTAL_ENABLED`、`TUSHARE_FOCUSED_INCREMENTAL_HOUR`、`TUSHARE_FOCUSED_INCREMENTAL_MINUTE` 覆盖。由于未接入中国交易日历，节假日会获得安全的零变更结果；同一环境不得启动多个 Beat，避免重复外部调用。

### 10.2 运行与降级边界

Celery Worker 仅消费任务，Beat 仅投递任务；Windows 本机 Worker 必须使用 `--pool=solo`。外部可恢复异常最多按既有策略重试两次；缺少历史基线属于本地前置条件错误，不重试。同步失败不覆盖已有净值，Java/Vue 仍读取最后已落库数据并按既有缓存契约显示陈旧状态。

### 10.3 数据同步中心异步任务链路

```text
Vue SyncCenterPage「开始同步」
  -> Java POST /api/v1/sync-jobs/focused-nav-incremental（立即返回 202）
  -> Python POST /internal/v1/funds/sync-jobs/focused-nav-incremental（创建本机后台任务）
  -> LocalSyncJobManager（单线程、单活动任务）
  -> PostgreSQL pg_try_advisory_lock（与 Celery 共用）
  -> TushareFundSyncService.sync_focused_nav_incremental（逐基金进度回调）
  -> source_sync_run + nav_daily
  -> Java GET /api/v1/sync-jobs/{jobId}
  -> Vue 每 1.5 秒轮询阶段、当前基金、完成步数和最终统计
```

Python 内部接口拒绝浏览器 `Origin` 和缺失/错误服务令牌；不接收基金代码、日期或 Token 参数，只从本机受校验配置取得六只重点基金和当前日期。创建时已有本机任务返回 `409/FOCUSED_SYNC_IN_PROGRESS`；历史基线缺失、Tushare 失败或配置异常在任务状态中以 `FAILED` 和安全错误码/说明返回，任一失败不覆盖既有净值。Java 对外结果使用 camelCase，Python 内部结果保持 snake_case；Vue 同步期间禁用重复按钮、使用 `aria-live` 和 `progressbar` 展示状态，不从基金详情页触发同步。

本链路不经过 Celery 队列，因此本地错过 20:00 时仅启动 Python、Java、Vue 后即可手动执行；Celery 定时任务仍保留，且与手动请求共享同一锁。同步中心当前进度是进程内安全摘要：页面刷新可继续读取同一 Python 进程的最近任务；若 Python 重启，任务状态不再可查询，Java 返回稳定的“任务状态已失效”提示，用户可重新发起同步。普通 Java → Python 请求仍使用 3 秒读取超时，后台同步不占用浏览器连接。

## 11. v0.5｜重点基金列表页码分页设计

本变更不新增表或同步任务，仅扩展既有只读目录链路：

```text
Vue FundMarketPage（关键字、pageSize、page）
  -> Java GET /api/v1/funds
  -> Redis（key 包含 keyword、pageSize、cursor、page）
  -> FastAPI GET /internal/v1/funds
  -> fund_share_class + latest nav_daily 子查询
```

当请求携带 `page` 时，FastAPI 以 1 为起点对相同筛选条件执行两条受限 SQL：`COUNT(*)` 得到 `total_count`，按 `fund_code ASC` 查询 `OFFSET (page - 1) * page_size LIMIT page_size` 得到当前页及最新净值日期。总页数统一按 `ceil(total_count / page_size)` 计算；页码超出总页数时安全返回空 `items` 与真实总数。`pageSize` 为 1–100，`page` 为 1–10,000，避免无界扫描和过大偏移请求。

不携带 `page` 时保留原有游标读取及 `next_cursor`，以兼容已发布调用方；`page` 与非空 `cursor` 互斥。Java 将 Python snake_case 元数据转换为 camelCase，正常结果与陈旧缓存结果都完整保留 `page`、`pageSize`、`totalCount`、`totalPages`，缓存命中不得跨页。

Vue 默认请求 `page=1&pageSize=10`，显示总条数、每页 10/20/50 条、当前页/总页数、上一页/下一页及跳页输入；关键字或页大小改变时重置第 1 页。控件使用可见标签、键盘 Enter 跳转、禁用加载中的重复请求，并在小屏自动换行，不依赖颜色表达可用状态。

## 12. 用户会话、前后台路由与数据范围

Vue 新增 Pinia 会话状态，只保存服务端返回的掩码手机号、显示名、角色和权限集合；密码、完整手机号、会话 Cookie 均不保存。浏览器经 `credentials: include` 访问 Java，写请求从非 HttpOnly CSRF Cookie 读取令牌。Java 保存 HttpOnly 会话 Cookie 摘要并校验 Origin、CSRF、资源权限和当前 `userId` 数据范围。

```text
登录页或注册页（仅有的匿名账户页）
  -> POST /api/v1/auth/login 或 /api/v1/auth/register
  -> HttpOnly 会话 Cookie + CSRF Cookie
  -> 路由守卫恢复 GET /api/v1/auth/me
  -> 用户端壳层：/funds、/watchlist、/portfolio
      -> 账户下拉“后台管理”（仅有后台权限，新标签页打开 /admin）
  -> 后台壳层：/admin、/admin/sync、/admin/users
```

路由守卫按 Java 返回的权限决定菜单和页面访问体验；前台与后台壳层不混排导航，后台入口用 `target="_blank"` 和 `rel="noopener"` 在新标签页打开，后台账户菜单不提供返回前台入口；账户下拉使用动态 `aria-expanded`、Esc 和点击外部收起，确保键盘访问。所有业务 API 仍由 Java 重新认证和授权。用户端个人接口不允许浏览器传入 `userId`。管理员查看指定用户持仓使用独立后台端点；历史关注迁移显式提交 `confirmed=true`，只迁移关注记录。

## 13. v1.3｜基金市场动态同步设计

```text
fund_share_class(source_code=TUSHARE_PRO_FUND, status=ACTIVE)
  -> source_fund_code（精确 ts_code；首次迁移可由同日 fund_nav 批量反查）
  -> sync_market_nav_incremental
  -> 按 source_id + fund_code 读取各自 max(nav_date)
  -> fund_nav(ts_code, watermark + 1, as_of_date)
  -> 窗口/代码校验 -> nav_daily 幂等写入 -> source_sync_run(MARKET_NAV_INCREMENTAL)
```

`watchlist_item` 不参与任何同步查询；它只由 Java 按当前认证用户读写。`fund_share_class` 不新增“重点”标记或独立范围表，`source_fund_code` 仅用于将六位展示代码准确对应到来源代码。对存量空映射，服务先按每个本地最新净值日期调用一次 `fund_nav(nav_date)`；仍缺失时才依次查询 `.OF/.SH/.SZ` 候选目录，并只接受唯一完整响应。全部解析后在一个事务中补齐；有缺失、冲突或无历史基线则失败关闭。

Python 内部路径为 `POST/GET /internal/v1/funds/sync-jobs/market-nav-incremental[/latest]`，Java 外部路径为 `POST/GET /api/v1/sync-jobs/market-nav-incremental[/latest]`；前端只调用 Java。任务错误码改为 `MARKET_SYNC_*`，历史 `FOCUSED_*` 审计类型在 Alembic `20260828_05` 中改写为 `MARKET_*`。默认页码链路为 Vue → Java → FastAPI 的 `pageSize=10`，显式传参仍允许 1–100。

## 14. v1.4｜个人投资决策辅助设计边界

本节描述后续 M2/M3/M4 完成后的目标设计，不新增表、接口、任务或外部调用，也不表示模型能力已经可用。当前 M3 的用户入口固定为“我的关注 → 单基金详情 → 多周期预测”，输出基金层面的未来约 7/15/30/60 天方向概率、依据和数据缺口；详细设计见 `docs_zhx/design/watchlist-prediction-module.md`。它不改变前端仅调用 Java、Java 负责认证与审计、FastAPI 仅提供内部数据/模型服务以及交易执行不存在的架构边界。

### 14.1 证据优先的分析链路

```text
已授权基金/市场/政策/资讯来源
  -> 来源治理、时间与授权校验、去重和实体关联
  -> 净值/事件/特征完整度校验
  -> 可解释基线或已准入模型 + 滚动回测准入检查
  -> 大模型仅归纳证据、影响路径与不确定性
  -> Java 认证、审计、版本校验和用户范围控制
  -> Vue 展示“事实 / 推断 / 用户规则 / 风险与缺失项”
```

大模型不得直接访问未受治理的网页、个人账户或交易接口；不得用社交舆情或单条新闻绕过数据质量和模型准入。来源、时间、关联对象和证据强度必须先由确定性服务校验，再交由模型解释。

### 14.2 决策辅助输出契约

后续页面和接口使用以下逻辑字段组织分析卡片；字段命名和 API 另行经版本化契约确认，不在本次文档变更中实施：

| 字段 | 语义与强制约束 |
| --- | --- |
| `predictionStatus` | `AVAILABLE`、`DATA_INSUFFICIENT`、`MODEL_NOT_RELEASED`、`STALE` 或 `NOT_APPLICABLE`；不满足任一门槛时不能输出方向概率 |
| `horizon` | 明确约 7/15/30/60 天及对应交易日数；每个周期独立版本、回测和状态，不能复制一个周期的结论 |
| `scope` | 当前 M3 仅限单基金；同类、行业主题和用户组合需在后续独立需求中定义，不能由单基金结论泛化 |
| `directionalProbability` | 仅 `AVAILABLE` 且模型已发布、回测合格时可出现；同时展示上涨与下跌概率，不能转换为个人交易动作 |
| `dataAsOf`、`generatedAt` | 分别表示输入数据截至时间和分析生成时间；陈旧数据不得伪装为实时 |
| `evidence[]` | 每项包含来源标识/链接、发布时间、可信度、关联理由和“事实/模型推断”标签 |
| `modelVersion`、`featureVersion`、`backtestRunId` | 使方向性结果能回溯至已准入模型、特征和回测运行；缺一项即不可操作 |
| `riskDisclosure`、`invalidatingConditions` | 说明可能失效的条件、产品类别限制、相关性与最大回撤风险，不能只展示利好理由 |

个人资金相关的阈值只能作为用户显式确认的只读输入，且不属于当前单基金预测模块。未确认成本、份额、交易日期或风险画像时，系统不计算个人盈亏线，不生成继续定投、止盈、止损、减仓等个人化结论。分析结果无论何种状态都不能触发写入持仓、修改定投、第三方支付或交易动作。

### 14.3 七维治理与准入闸门

| 维度 | 方案 | 风险与待确认项 |
| --- | --- | --- |
| 业务与功能边界 | 决策辅助与交易执行彻底分离；建议只供用户复核 | 用户可能误读为荐基；需确认最终提示文案、适用用户范围与人工确认流程 |
| 数据架构 | 沿用 `source_registry`、`news_item`、`market_event`、`feature_snapshot`、`forecast_result` 与 `backtest_run` 的版本链路 | 每类新增来源须确认授权、更新、保留/展示期限；不保存未经确认的个人成本和交易流水 |
| 性能与并发 | 资讯一次抽取、实体关联后复用；模型批量评分，前端分页读取 | 大模型逐基金、逐新闻实时调用会造成成本与延迟失控，须先定义异步批次、缓存和限额 |
| 高可用与稳定性 | 来源独立超时、限流、退避和降级；数据陈旧或冲突时失败关闭 | 需明确不同基金类别的数据新鲜度阈值与恢复策略；不能用缓存补造新建议 |
| 安全性 | 个人规则与分析结果按 Java 当前会话数据范围隔离；服务间继续使用服务令牌 | 需确认个人风险画像的保留、导出和删除规则；日志禁止记录个人金额、完整持仓或外部凭证 |
| 可观测性与运维 | 记录来源状态、数据截至时间、模型/特征/回测版本、分析任务和 TraceID | 需定义陈旧率、数据缺失率、模型拒绝率和建议分布异常的告警阈值 |
| 可扩展性与工程化 | 先以规则/统计基线和版本化输出契约落地，再引入大模型解释层 | 模型、提示词、来源适配器和决策口径必须独立版本化，可灰度、可回滚、可复现 |

L3 准入顺序固定为：先确认来源合规与数据质量，再完成类别化特征、滚动回测和基线比较，最后才开放带方向的“建议复核”卡片。任何一个闸门未通过时，`forecast_result.score_status` 必须保持 `DATA_INSUFFICIENT`、`NOT_APPLICABLE` 或 `MODEL_REJECTED`，不得生成方向、概率或置信度。

## 15. v1.5｜基金类型分组、关注分页与净值涨跌率读模型设计

本次为既有目录/净值/关注链路的 L2 扩展，调用关系如下：

```text
Vue 基金市场（keyword + fundType + page）
  -> Java /api/v1/funds（认证后补 isWatched）
  -> FastAPI /internal/v1/funds（fundType + page）
  -> fund_ai.fund_share_class + nav_daily（批量计算收益率）

Vue 我的关注（fundType + page，默认 10）
  -> Java /api/v1/watchlist（当前会话用户）
  -> fund_core.watchlist_item（类型优先、关注时间次级排序）
  -> FastAPI /internal/v1/funds/batch（每次最多 50 条摘要）
  -> fund_ai 基金目录 + nav_daily
```

FastAPI `InternalFundSummary` 和 Java/Vue 基金摘要均增加 `dayChangeRate`、`weekChangeRate`、`monthChangeRate`；Java 对浏览器的基金摘要和详情再增加 `isWatched`。计算的输入是已持久化且按 `source_code` 稳定选取的日净值点：最近点与上一可得点计算日涨跌率，最近点与 `<= latest-7 days`、`<= latest-30 days` 的最近点分别计算周/月涨跌率。优先同时使用两端 `accumulated_nav`，两端均无累计净值才使用 `unit_nav`，基准为零或不存在时返回 `null`。读取路径不触发 Tushare、不同步、不写 `nav_daily`。

Java 的 `InternalFundQueryService` 继续只缓存无用户态的 Python 原始响应；控制器取得当前页基金代码后，调用当前会话范围内的关注代码集合并重建响应写入 `isWatched`。缓存键包含 `keyword`、`fundType`、`pageSize`、`cursor` 和 `page`，避免不同筛选条件及不同用户交叉复用。详情页直接使用服务端 `isWatched`，不再先读取整份关注列表。

关注页 API 契约为 `GET /api/v1/watchlist?fundType=&page=1&pageSize=10`，响应为 `items`、`page`、`pageSize`、`totalCount`、`totalPages`、`marketDataUnavailable`。行项目包含基金代码、名称、类型、截至日期、三档涨跌率与 `createdAt`。`marketDataUnavailable=true` 时 Java 仍返回当前用户的关注关系；基金名称/净值字段可缺失，Vue 只显示降级提示，不伪造行情。

`fund_core` 的 Flyway V8 仅增加关注项类型快照与读取索引。DDL：

```sql
ALTER TABLE watchlist_item
    ADD COLUMN fund_type VARCHAR(32);

CREATE INDEX ix_watchlist_item_user_type_created_at
    ON watchlist_item (user_id, fund_type, created_at DESC, fund_code ASC);
```

无独立 DML 迁移：历史 `fund_type IS NULL` 项在当前用户读取页中由 Java 调用受服务令牌保护的批量内部接口获取类型，并按单页结果回填；新增关注时从已校验基金详情写入类型。批量接口拒绝空、重复、非六位代码或超过 50 条的请求，防止 N+1 和不受限内部调用。类型排序固定为 MONEY、BOND、MIXED、STOCK、INDEX、QDII、FOF、OTHER；未知值落入 OTHER。
