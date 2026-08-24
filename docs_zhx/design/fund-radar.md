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
| `GET /api/v1/funds/{fundCode}/events` | 关联资讯与事件 | 返回来源链接、可信度、相关性，不宣称因果 |
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
| `GET /internal/v1/events` | 拉取已审核事件 | 只返回授权范围内摘要和链接 |
| `POST /internal/v1/tasks/rebuild` | 受控触发补数/重算 | 管理权限、幂等键、审计、队列异步执行 |

Java 调用 FastAPI 失败时必须降级为缓存数据，并显示最后成功更新时间；不得同步等待长时间模型训练或爬虫任务。

M0 的字段名、分页、错误码与已实现状态见 `docs_zhx/design/fund-radar-api-v1.md`；M0 仅返回标注为 `M0_MOCK` 的临时数据，M1 才可接入已确认授权的数据源。

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
