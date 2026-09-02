# 基金雷达：当前 2000 积分可用数据补齐实施文档

> 关联需求：[当前 2000 积分可用数据补齐需求](../requirements/tushare-2000-data-completion.md)
> 关联设计：[免费已授权数据预测 V1](../design/free-data-prediction-v1.md)
> 关联既有实施：[基金雷达总实施看板](fund-radar.md)、[关注基金预测模块](watchlist-prediction-module.md)
> 版本：v1.1 ｜ 日期：2026-09-02 ｜ 变更等级：L3 ｜ 状态：代码和本地迁移已完成；管理员已手动完成一次真实补齐，后续仍不自动发起外部同步

## 0. 实施结论

本次不是再造一套“爬数据脚本”，而是在现有的三段式链路上补一个可审计的数据补齐任务：

```text
Vue 同步中心（只展示、管理员手动启动）
  -> Java /api/v1/sync-jobs（权限、审计、错误转换）
  -> FastAPI /internal/v1/funds/sync-jobs（单并发任务）
  -> Tushare 已验证接口（限流、超时、重试）
  -> fund_ai（幂等写入、水位、质量结果、同步运行记录）
```

它只处理需求文档中 P0 的当前已授权数据；`daily`、`daily_basic` 虽已最小验权成功，但仍是 P1，默认没有全市场同步任务。`fund_portfolio`、新闻、公告和未获授权接口没有客户端调用、没有表写入、没有页面展示。

历史回补由具备 `SYNC_JOB_START` 权限的管理员在同步中心手动启动。打开基金详情、打开关注页、读取预测结果都只能查本地数据库，绝不触发 Tushare。

### 0.1 本次实施记录（2026-09-02）

1. 已对 `fund_daily`、`index_basic`、`index_classify`、`index_daily`、`index_weight` 做最小只读字段探测，均返回业务码 `0`；未输出 Token 或原始数据。
2. `index_basic` 的 `CSI` 市场分片探测恰好达到来源 8,000 行上限，因此默认目录同步只处理 `SSE,SZSE,SW,CICC,MSCI,OTH`。这不是数据缺失的补零策略，而是主动拒绝将可能截断的 `CSI` 目录入库；后续若要使用某个 CSI 指数，只能先在 `benchmark_series` 显式登记为 `DRAFT`，再同步其日线和权重。
3. 本地 PostgreSQL 已从 `20260901_10` 加性升级到 `20260902_11`，未执行真实外部补齐；自动化和构建验证见[测试用例](../testcase/tushare-2000-data-completion.md)。
4. 当前本地 `TUSHARE_PRO_FUND` 来源已登记 13 个已验权接口能力；`fund_portfolio` 不在清单中。能力登记只更新治理元数据，不读取或写入外部行情、持仓、新闻或公告数据。
5. 当前尚无 `DRAFT` 或 `ACTIVE` 的市场参考指数登记，因此首次任务会同步指数目录和分类，但不会擅自拉取任意指数的日线/权重。先由管理员按基准治理流程登记候选指数，才能启动这两类数据的受控回补。
6. 首次管理员任务发现 `fund_daily.change` 与 `pct_chg` 可以为负数。适配器已改为解析“有限有符号十进制”；失败游标计数改为从 ORM 未回填默认值时安全地从 `0` 累加，并确保游标落库异常不会覆盖原始数据域失败。该次遗留的场内基金日线运行记录已人工标记为 `FAILED`，未重跑外部补齐。
7. 第二次管理员任务已成功完成详情补齐、场内基金日线和指数目录三个阶段；`index_classify.level` 的真实值为 `L1`，而非仅有数字。适配器现只接受 `1` 或 `L1`（不区分大小写）并规范为整数层级；如 `LEVEL_ONE` 等未知值仍失败。分类阶段及父任务已正确收口为 `FAILED`，成功阶段数据保留，未遗留 `RUNNING` 记录，也未自动重跑。
8. 第三次管理员手动任务已成功结束：读取 72,931 条，新增 360 条，更新 0 条，跳过 72,516 条。详情补齐、场内基金日线、指数目录、指数分类均已成功；当前未登记 `DRAFT` 或 `ACTIVE` 基准指数，所以指数日线和权重阶段以 0 条成功结束，不把无白名单误报为数据缺失。最新运行记录、游标和已落库数据均可追溯。

## 1. 现有基础与本次改动边界

### 1.1 直接复用的已有能力

| 现有对象 | 已有事实 | 本次用法 |
| --- | --- | --- |
| `TushareFundSyncService` | 已能同步基金档案、净值、经理、份额和分红，并以内容哈希幂等写入 | 保留其字段规范化和写入逻辑；扩展为可被总补齐任务带父运行标识调用 |
| `LocalSyncJobManager` | 单线程、单活动任务；重复启动拒绝 | 新任务与净值、完整资料、特征快照共用同一排他保护 |
| `source_registry` / `source_sync_run` | 已登记来源开关、许可说明、限频、运行统计和脱敏错误 | 扩展为接口级能力清单、父子运行和逐数据域水位 |
| 现有基金表 | 已有 `fund_profile`、`nav_daily`、`fund_manager_assignment`、`fund_share_snapshot`、`fund_dividend` | 不迁移、不删除历史数据；按现有业务键 UPSERT |
| `benchmark_series` / `benchmark_nav_daily` | 已有业绩基准登记和日值表，但当前为空 | 只保存经过白名单审核的市场参考指数；先以 `DRAFT` 状态落库，不能自动激活为模型基准 |
| Java 同步中心接口 | 已有 `SYNC_JOB_START` / `SYNC_JOB_READ` 权限和 Java → FastAPI 服务身份链路 | 新接口沿用这两个权限，不向浏览器暴露 FastAPI、Token 或来源原始响应 |
| Vue `SyncCenterPage.vue` | 已有任务卡、进度轮询、成功时间和失败文案 | 新增一张“补齐当前免费数据”任务卡；详情页不新增同步按钮 |

### 1.2 本次不做的事

1. 不修改用户关注范围：同步对象始终是 `fund_share_class.source_code='TUSHARE_PRO_FUND' AND status='ACTIVE'`，不读取 `watchlist_item`。
2. 不用 `daily`、`daily_basic` 反推基金股票持仓，也不全量下载 A 股日线。
3. 不把指数直接等同于某只基金的业绩基准；市场参考指数先登记、审核、回测验证，再决定是否进入模型。
4. 不生成预测概率、不激活模型、不改变用户的资金、持仓、提醒或交易状态。
5. 不保存 Tushare Token、原始 HTTP 请求/响应、新闻正文或未经授权的页面内容。

## 2. 数据模型和迁移

### 2.1 模型变更总览

| 对象 | 动作 | 业务键 / 关键约束 | 目的 |
| --- | --- | --- | --- |
| `source_registry` | 扩展 | `authorized_api_names` 为 JSON 数组；来源必须 `enabled=true` | 代码在每次调用前校验“来源启用 + 该接口已验证”，不只依赖文字说明 |
| `source_sync_run` | 扩展 | 子运行指向 `parent_sync_run_id`；保存请求窗口与数据截至日 | 让一次总补齐任务和其各数据域运行可追溯 |
| `source_sync_cursor` | 新增 | `(source_id, dataset_code, entity_key)` 唯一 | 保存“某数据域、某基金或指数”最后成功水位；失败不得推进 |
| `fund_exchange_daily` | 新增 | `(fund_code, trade_date, source_id)` 主键，收盘价大于零 | 存 ETF/LOF 等确有交易代码的场内日线；与场外净值隔离 |
| `market_index_catalog` | 新增 | `(source_id, index_code)` 主键 | 保存 `index_basic` 的指数目录，不把目录直接视为模型基准 |
| `market_index_classification` | 新增 | `(source_id, classification_code)` 主键 | 保存 `index_classify` 的分类层级和名称 |
| `index_weight_snapshot` | 新增 | `(source_id, index_code, weight_date, constituent_code)` 主键 | 保存批准的市场参考指数权重快照；不映射到基金持仓 |
| `benchmark_series` / `benchmark_nav_daily` | 复用 | 既有业务键不变 | 仅为通过白名单选择的指数写入日值，并保持初始 `DRAFT` |

`fund_company` 不建一张没有稳定公司来源主键的重复表：它用于校准既有 `fund_profile.management_company_name`。公司接口返回的名称变化会触发档案更新和行摘要变化。

### 2.2 PostgreSQL 迁移 SQL（DDL）

以下 SQL 是 Alembic 迁移 `20260902_11_add_free_data_completion.py` 应执行的等价 PostgreSQL DDL。先在本地备份和迁移环境验证；它只新增对象或字段，不删表、不清数据。

```sql
BEGIN;

ALTER TABLE source_registry
    ADD COLUMN IF NOT EXISTS authorized_api_names JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS authorization_verified_at TIMESTAMPTZ;

ALTER TABLE source_registry
    ADD CONSTRAINT ck_source_registry_authorized_api_names_array
    CHECK (jsonb_typeof(authorized_api_names) = 'array');

ALTER TABLE source_sync_run
    ADD COLUMN IF NOT EXISTS parent_sync_run_id UUID,
    ADD COLUMN IF NOT EXISTS requested_window_start DATE,
    ADD COLUMN IF NOT EXISTS requested_window_end DATE,
    ADD COLUMN IF NOT EXISTS data_as_of_date DATE;

ALTER TABLE source_sync_run
    ADD CONSTRAINT fk_source_sync_run_parent
    FOREIGN KEY (parent_sync_run_id) REFERENCES source_sync_run(sync_run_id);

CREATE INDEX IF NOT EXISTS ix_source_sync_run_parent_started
    ON source_sync_run (parent_sync_run_id, started_at);

CREATE TABLE IF NOT EXISTS source_sync_cursor (
    source_id UUID NOT NULL REFERENCES source_registry(source_id),
    dataset_code VARCHAR(64) NOT NULL,
    entity_key VARCHAR(128) NOT NULL,
    last_successful_data_date DATE,
    last_successful_published_at TIMESTAMPTZ,
    last_sync_run_id UUID REFERENCES source_sync_run(sync_run_id),
    consecutive_failure_count INTEGER NOT NULL DEFAULT 0,
    last_error_summary VARCHAR(512),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (source_id, dataset_code, entity_key),
    CONSTRAINT ck_source_sync_cursor_failure_count_nonnegative
        CHECK (consecutive_failure_count >= 0)
);

CREATE INDEX IF NOT EXISTS ix_source_sync_cursor_dataset_updated
    ON source_sync_cursor (dataset_code, updated_at);

CREATE TABLE IF NOT EXISTS fund_exchange_daily (
    fund_code VARCHAR(32) NOT NULL REFERENCES fund_share_class(fund_code),
    trade_date DATE NOT NULL,
    source_id UUID NOT NULL REFERENCES source_registry(source_id),
    open_price NUMERIC(20, 8),
    high_price NUMERIC(20, 8),
    low_price NUMERIC(20, 8),
    close_price NUMERIC(20, 8) NOT NULL,
    previous_close_price NUMERIC(20, 8),
    change_value NUMERIC(20, 8),
    change_percent NUMERIC(16, 8),
    volume NUMERIC(24, 4),
    amount NUMERIC(24, 4),
    source_published_at TIMESTAMPTZ,
    content_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (fund_code, trade_date, source_id),
    CONSTRAINT ck_fund_exchange_daily_close_positive CHECK (close_price > 0)
);

CREATE INDEX IF NOT EXISTS ix_fund_exchange_daily_fund_date
    ON fund_exchange_daily (fund_code, trade_date);

CREATE TABLE IF NOT EXISTS market_index_catalog (
    source_id UUID NOT NULL REFERENCES source_registry(source_id),
    index_code VARCHAR(64) NOT NULL,
    display_name VARCHAR(128) NOT NULL,
    market VARCHAR(32),
    publisher VARCHAR(128),
    category VARCHAR(128),
    base_date DATE,
    list_date DATE,
    expiry_date DATE,
    row_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (source_id, index_code)
);

CREATE INDEX IF NOT EXISTS ix_market_index_catalog_category
    ON market_index_catalog (category, display_name);

CREATE TABLE IF NOT EXISTS market_index_classification (
    source_id UUID NOT NULL REFERENCES source_registry(source_id),
    classification_code VARCHAR(64) NOT NULL,
    classification_name VARCHAR(128) NOT NULL,
    parent_classification_code VARCHAR(64),
    hierarchy_level INTEGER,
    source_name VARCHAR(128),
    row_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (source_id, classification_code)
);

CREATE INDEX IF NOT EXISTS ix_market_index_classification_parent
    ON market_index_classification (source_id, parent_classification_code);

CREATE TABLE IF NOT EXISTS index_weight_snapshot (
    source_id UUID NOT NULL REFERENCES source_registry(source_id),
    index_code VARCHAR(64) NOT NULL,
    weight_date DATE NOT NULL,
    constituent_code VARCHAR(32) NOT NULL,
    weight NUMERIC(12, 8) NOT NULL,
    row_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (source_id, index_code, weight_date, constituent_code),
    CONSTRAINT ck_index_weight_snapshot_range CHECK (weight >= 0 AND weight <= 100)
);

CREATE INDEX IF NOT EXISTS ix_index_weight_snapshot_index_date
    ON index_weight_snapshot (index_code, weight_date);

COMMIT;
```

> 实现注意：Alembic 中的约束新增需先检查 PostgreSQL 系统目录，避免二次升级时重复创建同名约束。`source_sync_run` 的新列允许为空，确保历史运行记录兼容。

### 2.3 来源能力登记 SQL（DML）

这段 DML 只在前置最小验权再次成功后执行，且由迁移/管理命令中的固定常量生成。它登记当前已核验的能力，并不等同于让所有接口自动被业务代码使用；P1 的 `daily`、`daily_basic` 没有同步计划时仍不会被调用。

```sql
BEGIN;

UPDATE source_registry
SET authorized_api_names = jsonb_build_array(
        'fund_company', 'fund_basic', 'fund_nav', 'fund_manager',
        'fund_share', 'fund_div', 'fund_daily', 'daily', 'daily_basic',
        'index_basic', 'index_classify', 'index_daily', 'index_weight'
    ),
    authorization_verified_at = now(),
    license_scope = 'Tushare 2000积分：仅限基金档案/净值/经理/份额/分红/场内基金日线、A股日线及估值日线、指数目录/分类/日线/权重；不含fund_portfolio、fund_adj、新闻、公告。',
    updated_at = now()
WHERE source_code = 'TUSHARE_PRO_FUND'
  AND enabled = true;

COMMIT;
```

执行后必须验证受影响行数恰为 1。若为 0，不得通过脚本自行创建或启用来源，先排查来源登记和授权状态。

## 3. Python 实施设计

### 3.1 代码职责和文件落点

| 位置 | 改动 | 职责边界 |
| --- | --- | --- |
| `app/integrations/tushare.py` | 保持现有基金档案/净值/经理/份额/分红契约；补充 `fund_daily` 的最小字段 DTO 和解析 | 不改变已运行接口的返回语义 |
| `app/integrations/tushare_market_reference.py` | 新增指数目录、分类、日线、权重客户端与 DTO | 与基金客户端分开，复用配置、超时、重试和脱敏错误类型；不引入网页抓取 |
| `app/models/fund.py` | 扩展 `SourceRegistry`、`SourceSyncRun`、新增 `SourceSyncCursor` | 保存治理和水位，不保存凭据 |
| `app/models/market_reference.py` | 新增场内基金日线、指数目录/分类/权重模型 | 市场参考数据与基金净值、模型结果隔离 |
| `app/repositories/market_reference_sync.py` | 新增批量 UPSERT、游标读取/推进、质量查询 | 所有写入在仓储层，禁止在路由直接写 SQL |
| `app/services/tushare_market_reference_sync.py` | 新增市场参考数据域同步服务 | 每个数据域各自分页、限流、幂等写入和水位推进 |
| `app/services/tushare_free_data_completion.py` | 新增总编排服务 | 串行调度现有基金资料阶段和新增市场参考阶段，生成父运行结果 |
| `app/services/sync_jobs.py` | 增加任务类型、状态映射和总任务进度 | 继续使用单 `ThreadPoolExecutor(max_workers=1)`；任务之间不可并行 |
| `app/api/routes/funds.py` | 新增受服务身份保护的内部启动/查询接口 | 只管理任务，不返回外部原始数据 |
| `app/commands/sync_tushare_funds.py` | 新增受控维护命令 `market-free-data-completion` | 仅管理员本机维护用，输出脱敏统计 JSON |

新增公共函数必须带类型标注、docstring、明确的可预期异常；HTTP 客户端必须沿用已有连接超时、读取超时、指数退避和有限重试配置。

### 3.2 接口适配和规范化规则

| API | 适配方法 | 写入对象 | 成功水位 | 特殊规则 |
| --- | --- | --- | --- | --- |
| `fund_company` + `fund_basic` | 复用现有目录/详情读取 | `fund_share_class`、`fund_profile` | `FUND_PROFILE/{fund_code}` | 公司名称只作资料校准；无稳定来源 ID 不单独造公司主表 |
| `fund_nav` | 复用现有历史 + 增量方法 | `nav_daily` | `FUND_NAV/{source_fund_code}` | 历史窗口分段；响应碰到行数上限即失败，禁止把截断结果当完整历史 |
| `fund_manager` | 复用现有明细同步 | `fund_manager_assignment` | `FUND_MANAGER/{source_fund_code}` | 只保存姓名、任职日期、学历和公告日期；不采集非必要个人资料 |
| `fund_share` | 复用现有日期窗口读取 | `fund_share_snapshot` | `FUND_SHARE/{source_fund_code}` | 空响应写 `NO_DISCLOSURE` 结果但不写零份额；成功水位使用请求窗口末日 |
| `fund_div` | 复用现有分红合并逻辑 | `fund_dividend` | `FUND_DIVIDEND/{source_fund_code}` | 同键同值或空字段补全可合并；不同非空值冲突必须失败，不推进水位 |
| `fund_daily` | 新增场内基金日线适配 | `fund_exchange_daily` | `FUND_EXCHANGE_DAILY/{trade_code}` | 只有已有明确交易代码的 ETF/LOF 才调用；`change`/`pct_chg` 允许负值；绝不根据六位代码猜 `.SH`/`.SZ` 后缀 |
| `index_basic` | 新增指数目录适配 | `market_index_catalog` | `INDEX_CATALOG/GLOBAL` | 只同步未达到来源行上限的市场分片；默认不成为模型基准 |
| `index_classify` | 新增分类适配 | `market_index_classification` | `INDEX_CLASSIFY/GLOBAL` | `level` 接受 `1` 或 `L1` 并规范为整数；保留层级和来源分类，不把分类名当基金行业暴露 |
| `index_daily` | 新增指数日线适配 | `benchmark_nav_daily`（仅白名单） | `INDEX_DAILY/{index_code}` | 白名单指数才入日线；无记录要与非交易日区分，不能伪造成功 |
| `index_weight` | 新增指数权重适配 | `index_weight_snapshot`（仅白名单） | `INDEX_WEIGHT/{index_code}` | 每个权重生效日全量比对；不把成分股写成基金持仓 |

新增适配器须执行四层校验：HTTP 状态、Tushare 业务码、字段集合/类型、返回代码与请求代码一致。遇到业务码 `40203` 等权限失败，抛出不可重试的 `TushareIntegrationError`；记录接口名和脱敏摘要，不记录 Token 或完整响应。

### 3.3 总任务及父子运行记录

新增任务类型：

```text
MARKET_FREE_DATA_COMPLETION          # 管理员手动历史补齐父任务
MARKET_DETAIL / MARKET_DETAIL_*      # 复用既有基金档案、净值、经理、份额和分红子运行
MARKET_FREE_EXCHANGE_DAILY           # 场内基金日线子运行
MARKET_FREE_INDEX_CATALOG            # 指数目录子运行
MARKET_FREE_INDEX_CLASSIFY           # 指数分类子运行
MARKET_FREE_INDEX_DAILY              # 指数日线子运行
MARKET_FREE_INDEX_WEIGHT             # 指数权重子运行
```

现有 `MARKET_DETAIL_*`、`MARKET_NAV_INCREMENTAL` 继续保留，不重命名历史审计记录。总任务创建一个 `MARKET_FREE_DATA_COMPLETION` 父运行；每个子阶段的 `source_sync_run.parent_sync_run_id` 指向它。父运行只有在所有“必需阶段”完成且质量检查通过时才为 `SUCCEEDED`。

以下情形可记录为阶段完成但必须带原因，不能伪造为有数据：

| 情形 | 阶段状态 | 父任务处理 |
| --- | --- | --- |
| 场外基金没有交易代码 | `NOT_APPLICABLE` | 不阻断父任务 |
| 基金份额窗口无披露 | `NO_DISCLOSURE` | 不阻断父任务，但数据质量显示缺失 |
| 指数当天非交易或尚未公布 | `NO_SOURCE_RECORD` | 不推进该指数日线水位，增量任务下次重试 |
| 分红记录无变化 | `SUCCEEDED`，`skipped_count` 增加 | 正常完成 |
| 字段冲突、代码不匹配、响应达上限、权限拒绝 | `FAILED` | 父任务 `PARTIAL_SUCCESS` 或 `FAILED`；失败数据域不交给特征层 |

### 3.4 同步算法

```text
管理员创建任务
  -> 权限守卫：来源已启用 + API 在 authorized_api_names 中
  -> 获取 PostgreSQL 咨询锁；已有任务则 409
  -> 创建父 source_sync_run
  -> 回补/校准基金档案、净值、经理、份额、分红（复用既有服务）
  -> 同步明确交易代码的场内基金日线
  -> 同步指数目录、指数分类
  -> 读取审核后的市场参考指数白名单（均为 DRAFT 起步）
  -> 回补白名单指数日线与权重快照
  -> 按数据域执行质量检查
  -> 全部通过：提交父运行、更新每个成功游标、允许后续特征候选重建
  -> 任一失败：保留已成功子运行和游标，父运行失败/部分成功，不启动预测
```

实现细节：

1. 先迁移并部署，再登记接口能力；能力登记前，所有新增任务返回 `FREE_DATA_SYNC_CAPABILITY_DENIED`。
2. 每个基金、指数和日期窗口各自写一个小事务。一个基金失败不能回滚已验证成功的其他基金，但失败项绝不更新其游标。
3. 请求按配置的批量大小分片，单来源串行调用；重试只处理网络错误、429 和 5xx，不重试权限/字段/一致性错误。
4. 同源、同业务键、同 `content_hash` 的记录只累计 `skipped_count`；摘要变化才更新 `updated_at`，避免重复运行污染增量判断。
5. 每一次外部调用前后都记录结构化日志：`模块.方法 >>> source_code、api_name、实体数、窗口、耗时、TraceID`。Token、完整 URL 参数和原始响应禁止进日志。
6. 基金完整资料的现有五阶段逻辑不能被复制粘贴；总任务通过调用已有服务/仓储能力组合执行，分红规范化继续使用 `_merge_market_dividend_records` 和重新计算的完整 `content_hash`。

## 4. Java、Vue 和任务接口

### 4.1 对外与内部接口

新增接口沿用既有 `SyncJobResponse`，请求体为空，立即返回 `202 Accepted`；状态查询只读当前 Python 进程任务快照和持久化最后成功时间。

| 方向 | 方法和路径 | 权限/认证 | 行为 |
| --- | --- | --- | --- |
| 浏览器 → Java | `POST /api/v1/sync-jobs/market-free-data-completion` | `SYNC_JOB_START`、会话、CSRF、Origin | 创建管理员手动补齐任务 |
| 浏览器 → Java | `GET /api/v1/sync-jobs/market-free-data-completion/latest` | `SYNC_JOB_READ` | 读取最近任务，不触发同步 |
| Java → FastAPI | `POST /internal/v1/funds/sync-jobs/market-free-data-completion` | 服务 Token；浏览器 Origin 拦截 | 启动 `LocalSyncJobManager` 任务 |
| Java → FastAPI | `GET /internal/v1/funds/sync-jobs/market-free-data-completion/latest` | 服务 Token；浏览器 Origin 拦截 | 查询任务摘要 |

Java 需要在 `SyncJobController`、`SyncJobService` 和 `AiSyncJobClient` 增加对称方法。Controller 的 Javadoc 更新为本需求、设计和本文档路径；Controller 只做鉴权、参数和响应，任务编排仍在 Service，远程调用仍在 Integration Client。

错误码沿用现有同步中心的业务错误返回方式：

| 错误码 | 用户可见说明 | 服务端处理 |
| --- | --- | --- |
| `FREE_DATA_SYNC_IN_PROGRESS` | 已有数据补齐任务正在运行 | HTTP 409，不创建第二个任务 |
| `FREE_DATA_SYNC_CAPABILITY_DENIED` | 当前来源未完成接口授权核验 | HTTP 409，记录受控审计，不发外部请求 |
| `FREE_DATA_SYNC_BASELINE_MISSING` | 基金市场基础目录或净值未就绪 | HTTP 409，提示先完成基础同步 |
| `FREE_DATA_SYNC_QUALITY_FAILED` | 数据已部分同步，但质量检查未通过 | 任务 `PARTIAL_SUCCESS`，展示可重试数据域 |
| `FREE_DATA_SYNC_FAILED` | 数据补齐未完成，请稍后重试 | 任务 `FAILED`，保留脱敏失败摘要 |

### 4.2 Vue 同步中心改动

在 `SyncCenterPage.vue` 的任务注册表增加 `freeDataCompletion`，显示：

1. “补齐当前免费数据”的明确范围：档案、净值、经理、份额、分红、场内基金日线和市场参考指数；
2. 数据截至日、当前阶段、已完成/总数、成功/更新/跳过/失败统计；
3. “不含基金持仓、新闻、公告”的固定提示；
4. `QUEUED`、`RUNNING`、`SUCCEEDED`、`PARTIAL_SUCCESS`、`FAILED` 和无任务空态；
5. 仅有 `SYNC_JOB_START` 权限时显示“开始补齐”按钮；所有前端权限控制都不是服务端鉴权替代。

前端每秒轮询运行中任务；路由离开时停止轮询。页面只调用 Java `/api/v1/*`，不保存数据源原始内容，不显示 Token，不直接调用 FastAPI 或 Tushare。

## 5. 实施顺序、发布和回滚

### 5.1 依赖顺序

| 顺序 | 工作包 | 完成条件 |
| --- | --- | --- |
| 1 | 再次执行最小只读验权、确认字段样本和当前 Token 权限 | 每个 P0 接口返回码、字段名和保存范围有脱敏记录；失败接口不登记能力 |
| 2 | Alembic 迁移、SQLAlchemy 模型、仓储 UPSERT 和水位逻辑 | 全新库与已有库升级均通过；无重复键、无破坏性数据迁移 |
| 3 | 指数/场内基金 Tushare 适配器和单元测试 | 字段、代码一致性、超时/重试、权限拒绝和异常值校验通过 |
| 4 | 总补齐服务、父子运行、质量检查和维护命令 | 使用 Fake Provider 的历史回补、断点续跑和重复执行均可复现 |
| 5 | FastAPI 内部接口、Java Client/Service/Controller | 服务身份、权限拒绝、409 和脱敏错误映射通过 |
| 6 | Vue 同步中心任务卡和进度展示 | 加载、运行、空态、失败、部分成功和无权限均可用 |
| 7 | 本机候选服务联调 | 先在候选端口健康检查，再切换；旧服务保留到新服务验证完成 |
| 8 | 管理员手动真实小范围冒烟 | 先 1 只基金 + 1 个指数 + 最小日期窗口；成功后才允许完整历史回补 |
| 9 | 管理员手动完整回补与一个完整增量周期观察 | 每个数据域有最新成功水位、质量报告和页面只读验证 |

真实回补不是部署动作的一部分；第 8、9 步需要管理员在同步中心或维护命令明确发起。任务发起前再次检查当前权限和数据源条款，防止文档结论过期。

### 5.2 日常运行

历史任务成功后，才启用以下增量策略：

| 作业 | 频率 | 依赖 | 说明 |
| --- | --- | --- |
| 既有 `MARKET_NAV_INCREMENTAL` | 工作日数据可得后 | 基金目录和净值历史 | 保持现有行为，不重复造净值同步 |
| `MARKET_FREE_DATA_INCREMENTAL`：场内基金/指数日线 | 在净值增量成功后串行执行 | 最新已确认的基金净值数据日 | 使用同一数据日；指数无记录不推进水位 |
| `MARKET_FREE_DATA_INCREMENTAL`：档案、经理、份额、分红 | 每周一次 | 来源能力与单并发锁 | 低频披露按各实体游标更新，空披露不补零 |
| 指数目录、分类、权重 | 每周目录/分类；权重按来源发布节奏 | 指数白名单 | 新目录只进入目录表；不自动激活模型基准 |

Windows 本机 Celery Worker 若承担定时任务，必须使用 `--pool=solo`；否则任务可能被预取但不执行。任何调度失败都要保留现有最后成功数据和失败记录，不能把页面时间伪装为最新。

### 5.3 回滚

1. 发现权限、字段或质量异常时，先在 `source_registry` 移除对应 `authorized_api_names` 或置 `enabled=false`，停止后续外部调用；已保存历史不删除。
2. 关闭 Vue 任务卡和 Java 新入口，保留旧的净值/完整资料同步接口；已有详情页继续读旧本地数据。
3. Python 代码可回退到上一稳定版本；新增表、游标和运行记录保持只读，不执行 `DROP TABLE`。
4. 若某个指数或场内基金数据有问题，暂停该白名单项、清除其在后续特征选择中的资格；不要删除其他数据域的成功水位。

## 6. 验证和验收

### 6.1 自动化验证

| 层级 | 最少覆盖 | 通过标准 |
| --- | --- | --- |
| Python 单元测试 | 13 个接口的权限守卫、DTO 字段校验、代码一致性、超时/重试、空披露、分红冲突、内容哈希 | 无未授权调用；异常不能推进游标；同输入重跑无新增重复行 |
| Python 集成测试 | Alembic 升级、批量 UPSERT、父子运行、咨询锁、断点续跑、质量失败 | 父运行状态、子运行统计和游标与事务事实一致 |
| Java 测试 | `SYNC_JOB_START/READ`、服务身份转发、409/错误码映射、审计 | 未授权用户不能启动或读取；Java 不泄露 FastAPI 内部错误细节 |
| Vue 测试 | 任务卡状态、轮询停止、无权限、部分成功、固定数据边界文案 | 浏览器只调用 Java；不出现持仓/新闻已覆盖的误导文案 |
| 静态检查 | Python Ruff + pytest；Java Maven test；Vue lint、type-check、build；`git diff --check` | 所有命令通过后才进入候选服务联调 |

### 6.2 数据库验证 SQL

以下只读 SQL 用于真实小范围和完整回补后的人工验收：

```sql
-- 1. 确认来源能力已登记，且不含付费持仓/新闻/公告接口。
SELECT source_code, enabled, authorized_api_names, authorization_verified_at
FROM source_registry
WHERE source_code = 'TUSHARE_PRO_FUND';

-- 2. 每个成功游标都能关联到已成功的来源运行。
SELECT c.dataset_code, c.entity_key, c.last_successful_data_date, r.status, r.finished_at
FROM source_sync_cursor c
LEFT JOIN source_sync_run r ON r.sync_run_id = c.last_sync_run_id
WHERE c.source_id = (SELECT source_id FROM source_registry WHERE source_code = 'TUSHARE_PRO_FUND')
  AND (r.status IS DISTINCT FROM 'SUCCEEDED' OR r.finished_at IS NULL);

-- 预期：0 行。

-- 3. 场内基金日线不允许重复业务键或非正收盘价。
SELECT fund_code, trade_date, source_id, COUNT(*)
FROM fund_exchange_daily
GROUP BY fund_code, trade_date, source_id
HAVING COUNT(*) > 1;

SELECT * FROM fund_exchange_daily WHERE close_price <= 0;

-- 预期：两条查询均为 0 行。

-- 4. 指数权重日期内的明显异常。
SELECT index_code, weight_date, SUM(weight) AS total_weight
FROM index_weight_snapshot
GROUP BY index_code, weight_date
HAVING SUM(weight) <= 0 OR SUM(weight) > 100.000001;

-- 预期：0 行；若来源权重不是百分比单位，先修正规范化逻辑，不能修改约束逃避检查。

-- 5. 父运行可追溯到每个数据域子运行。
SELECT parent.sync_run_id AS parent_run_id, child.sync_type, child.status,
       child.fetched_count, child.created_count, child.updated_count, child.skipped_count
FROM source_sync_run parent
LEFT JOIN source_sync_run child ON child.parent_sync_run_id = parent.sync_run_id
WHERE parent.sync_type = 'MARKET_FREE_DATA_COMPLETION'
ORDER BY parent.started_at DESC, child.sync_type;
```

### 6.3 最终验收条件

1. 所有 P0 数据域都已再次最小验权，权限失败的接口不会被登记或调用。
2. 白名单内每个基金/指数都有可解释的最早、最新数据日；真正无披露或不适用的情况有状态，不以零值补齐。
3. 重跑同一窗口不出现重复行，不改变无变化行的业务更新时间；失败实体的游标不前进。
4. 一次完整回补与随后一个增量周期都有持久化运行记录、数据质量结果和前端只读展示证据。
5. 基金详情、关注详情和预测查询在访问时不调用 Tushare；没有 `fund_portfolio` 时继续显示“当前免费数据未覆盖基金持仓”。
6. 预测功能在此任务完成后仍处于“数据已补齐，待滚动回测”状态，只有预测 V1 的独立发布闸门通过后才可以输出概率。

## 7. L3 七维审查、风险和决策

| 维度 | 方案 | 主要风险 | 控制措施 |
| --- | --- | --- | --- |
| 业务与功能边界 | 数据补齐与预测发布分离；公共市场数据与个人关注/资产隔离 | 把“补齐”误解为已有基金持仓或可交易结论 | 固定边界文案、模型拒答状态、页面不触发同步 |
| 数据架构 | 稳定业务键、内容哈希、父子运行、逐实体水位、可加性迁移 | 低频披露/分红导致历史污染或重复 | 点时日期、空披露状态、冲突即失败、幂等 UPSERT |
| 性能与并发 | 后台分段、批量写入、单来源串行、单活动任务 | 全量历史导致远端限流或本地长事务 | 请求窗口分片、超时、指数退避、小事务、单进程咨询锁 |
| 高可用与稳定性 | 子阶段可部分成功、断点续跑、失败不推进水位 | 一个数据域失败影响其他已成功域 | 父/子运行分离、`PARTIAL_SUCCESS`、独立重试 |
| 安全与合规 | 服务端 Token、接口级授权守卫、管理员权限、脱敏日志 | 误调用付费接口、Token 泄露、越权触发同步 | `authorized_api_names`、服务身份、CSRF/Origin、日志最小化 |
| 可观测性与运维 | TraceID、运行统计、阶段进度、数据截至日、质量 SQL | 页面显示旧数据却无人察觉 | 持久化上次成功、陈旧状态、连续失败计数和告警 |
| 扩展性与工程化 | 指数/场内日线独立模块，P1 股票日线无实现入口 | 将来追加数据源破坏既有契约 | Provider/Service/Repository 分层、迁移版本化、来源白名单 |

### 上线前需要冻结的三个工程决策

1. **市场参考指数白名单**：首轮只登记少量宽基/风格代表指数，全部以 `DRAFT` 入库；不能在未经数据核验时硬编码指数代码或自动 `ACTIVE`。
2. **数据时效阈值**：实现时要把“净值/日线/低频披露过期多久算陈旧”写成版本化配置并纳入质量报告，不能写死在 Vue。
3. **真实全量回补的执行时间**：功能部署完成不自动调用外部接口；由管理员选择空闲时段手动启动，并先完成 1 只基金、1 个指数、最小窗口的只读冒烟。

这三个决定不会影响文档中的表结构和接口边界，但会决定真正上线时的数据量、任务时长和页面展示状态。
