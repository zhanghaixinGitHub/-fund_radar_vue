# 基金雷达 — M3 特征、概率评分、滚动回测与站内提醒详细设计

> 关联需求：docs_zhx/requirements/m3-decision-assistance.md
> 关联验收：docs_zhx/testcase/m3-decision-assistance.md
> 关联总设计：docs_zhx/design/fund-radar.md
> 版本：v1.4
> 日期：2026-09-01
> 变更等级：L3
> 状态：M3-01 至 M3-06 和 v1.4 基准登记/导入能力已实施；M3-06 只通过 Java 展示已发布或已暂停模型的受限摘要、本人通知和管理员运行状态，M3-07 监控发布仍未实施。当前没有 ACTIVE 模型、授权启用的业绩基准或真实用户通知，本文件不代表交易能力已启用。

## 1. 设计原则

1. 事实、特征、评分、回测和提醒严格分层；每一层都可独立追溯和重新计算。
2. 浏览器只访问 Java；Java 负责认证、本人数据范围、审计和站内通知；Python 只处理非个人化的来源、特征、评分与回测。
3. 数据不足优先。只有已发布模型对完整、适用且新鲜的特征评分，其他状态没有方向性字段。
4. 回测通过是评分发布的前置条件，不是页面装饰信息；未准入版本不能被用户提醒链路消费。
5. 所有行为保持非交易边界：不调用外部交易接口，不保存账户凭证，不生成可执行买卖动作。

## 2. 当前基线与目标架构

现有 fund_ai.feature_snapshot、forecast_result、backtest_run、analysis_model_release 和 analysis_run 已保存基础版本、状态与约束；fund_core.alert_rule、signal_snapshot、notification 和 analysis_delivery_checkpoint 已保存规则、快照、通知和消费水位。当前已生成 24 条股票型基金特征快照，但没有 ACTIVE 模型、真实评分、回测、信号或通知记录；本设计的控制面扩展均为非破坏性迁移。

~~~text
已授权来源与本地净值
  -> Python 同步水位
  -> Celery：特征构建
  -> fund_ai.feature_snapshot
  -> Celery：评分（仅已发布模型）
  -> fund_ai.forecast_result
  -> Celery：滚动回测
  -> fund_ai.backtest_run + analysis_model_release
  -> Java 定时拉取已发布评分变化
  -> fund_core.signal_snapshot
  -> 匹配本人 alert_rule
  -> fund_core.notification
  -> Vue 读取评分、回测摘要、规则和本人通知
~~~

Python 不向 Java 推送用户消息，不感知 user_id。Java 不直连 fund_ai 数据库，不训练模型，也不在浏览器请求时同步或评分。

## 3. 数据契约与所有权

### 3.1 逻辑模型登记

| model_code | model_type | 粒度与业务键 | 当前物理对象 | 增量依据 |
| --- | --- | --- | --- | --- |
| FUND_FEATURE_SNAPSHOT | SNAPSHOT | fund_code + as_of_date + feature_version | fund_ai.feature_snapshot | computed_at、feature_id |
| FUND_FORECAST_RESULT | FACT | fund_code + as_of_date + model_version | fund_ai.forecast_result | scored_at、forecast_id |
| FUND_BACKTEST_RUN | METRIC | fund_type + strategy_version + time window + model_version | fund_ai.backtest_run | finished_at、run_id |
| FUND_MODEL_RELEASE | ENTITY | model_code + model_version + fund_type | 新增 fund_ai.analysis_model_release | updated_at、model_release_id |
| FUND_BENCHMARK_SERIES | ENTITY | benchmark_code | fund_ai.benchmark_series | updated_at、benchmark_code |
| FUND_BENCHMARK_NAV | FACT | benchmark_code + nav_date | fund_ai.benchmark_nav_daily | updated_at、benchmark_code、nav_date |
| FUND_SIGNAL_DELIVERY | RELATION | consumer + scored_at + forecast_id | 新增 fund_core.analysis_delivery_checkpoint | updated_at |
| FUND_ALERT_RULE | ENTITY | user_id + fund_code + rule_type | fund_core.alert_rule | updated_at、rule_id |
| FUND_NOTIFICATION | FACT | deduplication_key | fund_core.notification | created_at、notification_id |

时间统一为 Asia/Shanghai 业务口径。数据库使用 TIMESTAMP(6) WITH TIME ZONE；跨服务接口使用携带 +08:00 的 ISO 8601。增量读取使用左闭右开窗口，并在同一时间点以稳定 UUID 游标消除遗漏。

### 3.2 特征快照契约

feature_snapshot 继续复用现有唯一键 fund_code、as_of_date、feature_version。feature_payload 必须使用以下逻辑结构，未知字段保持 null，不得使用 0 补值：

~~~json
{
  "schema_version": "M3_FEATURE_V1",
  "input_watermark": {
    "latest_nav_date": "YYYY-MM-DD",
    "latest_source_sync_time": "YYYY-MM-DDTHH:MM:SS+08:00",
    "source_codes": ["TUSHARE_PRO_FUND"]
  },
  "quality": {
    "observation_count": 0,
    "freshness_status": "FRESH|STALE|MISSING|CONFLICTED",
    "missing_fields": [],
    "eligibility_reason": null
  },
  "metrics": {
    "return_5d": null,
    "return_20d": null,
    "return_60d": null,
    "volatility_20d": null,
    "max_drawdown_60d": null
  },
  "evidence_refs": [
    {"source_sync_run_id": "uuid", "data_as_of": "YYYY-MM-DD"}
  ]
}
~~~

上述 metrics 仅是净值序列可得时的最小统计量。不同基金类型应由 FeatureBuilder 策略实现；货币型固定 NOT_APPLICABLE，QDII/FOF 在缺少获授权基准和交易日历时固定 DATA_INSUFFICIENT。禁止将 payload 用作长期未版本化的任意 JSON 容器。

### 3.3 评分与回测契约

forecast_result 保持现有状态约束：SCORED 必须同时有 direction、directional_probability、confidence、risk_level；其他状态必须全部为空。score_status 不是错误码，页面要将 DATA_INSUFFICIENT、NOT_APPLICABLE、MODEL_REJECTED 展示为明确的业务状态。

backtest_run 的 metrics 和 baselines JSON 至少包含 sample_count、annualized_return、max_drawdown、volatility、hit_rate、turnover、fee_rate、benchmark_id、benchmark_result、benchmark_coverage、benchmark_sample_count、long_hold_result、dca_result、data_cutoff。基准收益仅以同一信号日和未来标签日都存在的基准点计算；覆盖率低于 95% 时固定 `benchmark_status=DATA_INSUFFICIENT`。任一指标无法计算时记录 null 与 failure_reason，不能跳过字段后仍设为 ELIGIBLE。

### 3.4 新增控制表及变更 SQL

以下 SQL 是后续实现阶段的 PostgreSQL 16 迁移草案。它不删除历史数据；实际落库前必须在三个仓库的迁移机制中拆分为 Python Alembic 与 Java Flyway 两次版本化变更。

#### fund_ai：模型发布与评分追溯

~~~sql
CREATE TABLE analysis_model_release (
    model_release_id UUID PRIMARY KEY,
    model_code VARCHAR(128) NOT NULL,
    model_version VARCHAR(128) NOT NULL,
    feature_version VARCHAR(128) NOT NULL,
    fund_type VARCHAR(32) NOT NULL,
    backtest_run_id UUID NOT NULL REFERENCES backtest_run(run_id),
    release_status VARCHAR(16) NOT NULL,
    effective_at TIMESTAMP(6) WITH TIME ZONE,
    suspended_at TIMESTAMP(6) WITH TIME ZONE,
    release_reason TEXT NOT NULL,
    config_hash VARCHAR(64) NOT NULL,
    wide_created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    wide_updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_analysis_model_release_status
        CHECK (release_status IN ('DRAFT', 'ELIGIBLE', 'ACTIVE', 'SUSPENDED', 'RETIRED')),
    CONSTRAINT uq_analysis_model_release_version
        UNIQUE (model_code, model_version, fund_type)
);

CREATE UNIQUE INDEX uq_analysis_model_release_active
    ON analysis_model_release (model_code, fund_type)
    WHERE release_status = 'ACTIVE';

ALTER TABLE forecast_result
    ADD COLUMN model_release_id UUID REFERENCES analysis_model_release(model_release_id);

ALTER TABLE forecast_result
    ADD CONSTRAINT ck_forecast_result_scored_release
    CHECK (score_status <> 'SCORED' OR model_release_id IS NOT NULL);

CREATE INDEX ix_forecast_result_release_scored
    ON forecast_result (model_release_id, scored_at, forecast_id);
~~~

#### fund_core：消费水位、冷却和可追溯通知

~~~sql
CREATE TABLE analysis_delivery_checkpoint (
    consumer_name VARCHAR(64) PRIMARY KEY,
    last_scored_at TIMESTAMP(6) WITH TIME ZONE,
    last_forecast_id UUID,
    updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_analysis_delivery_checkpoint_pair
        CHECK (
            (last_scored_at IS NULL AND last_forecast_id IS NULL)
            OR (last_scored_at IS NOT NULL AND last_forecast_id IS NOT NULL)
        )
);

ALTER TABLE alert_rule
    ADD COLUMN cooldown_hours INTEGER NOT NULL DEFAULT 24,
    ADD COLUMN last_triggered_at TIMESTAMP(6) WITH TIME ZONE;

ALTER TABLE alert_rule
    ADD CONSTRAINT ck_alert_rule_cooldown_hours
    CHECK (cooldown_hours >= 1 AND cooldown_hours <= 720);

ALTER TABLE notification
    ADD COLUMN trigger_type VARCHAR(32),
    ADD COLUMN trigger_ref VARCHAR(128),
    ADD COLUMN signal_id UUID REFERENCES signal_snapshot(signal_id);

ALTER TABLE notification
    ADD CONSTRAINT ck_notification_trigger_type
    CHECK (trigger_type IS NULL OR trigger_type IN ('SIGNAL', 'EVENT', 'RISK'));

CREATE INDEX ix_notification_signal_created
    ON notification (signal_id, created_at DESC);
~~~

回滚方案：先将模型发布状态改为 SUSPENDED，停止新评分和通知；确认没有依赖新列的版本运行后，删除新增索引、约束和列。不得删除 forecast_result、signal_snapshot 或 notification 历史。

## 4. 后台任务与一致性

### 4.1 Python 任务

| 任务 | 触发 | 输入 | 输出 | 幂等键 |
| --- | --- | --- | --- | --- |
| build_feature_snapshot | 某基金来源水位成功且窗口关闭 | fund_code、as_of_date、feature_version | feature_snapshot | fund_code + as_of_date + feature_version |
| score_fund | 特征状态为 SCORABLE 且存在 ACTIVE 模型发布 | feature_id、model_release_id | forecast_result | fund_code + as_of_date + model_version |
| run_rolling_backtest | 系统管理员受控创建 | 类别、策略、特征、模型、时间窗口、费用 | backtest_run | config_hash + window_end |
| publish_model_release | 管理员审核后 | backtest_run、模型元数据 | analysis_model_release | model_code + version + fund_type |

任务在 Celery Worker 执行，不由页面直接发起。每个任务需要运行记录、最大重试次数、指数退避、TraceID 和脱敏错误摘要；来源失败和数据冲突直接结束为 DATA_INSUFFICIENT，不无限重试。

### 4.2 Java 信号消费和通知

1. Java 按 analysis_delivery_checkpoint 以 scored_at、forecast_id 稳定排序拉取 `ACTIVE + SCORED` 的评分变化。
2. 每页评分在一个 fund_core 本地事务中执行 signal_snapshot 的唯一键 UPSERT、alert_rule 匹配、notification 去重写入、last_triggered_at 更新和消费水位推进。
3. 通知去重键为 rule_id + forecast_id；rule 已绑定唯一 user_id，因此同一评分不得重复推送。
4. 暂停、撤回或非 SCORED 评分不进入 changes 接口，不产生评分变化提醒。
5. 消费失败不推进水位；再次消费由唯一键保证幂等。每页最多 100 条、单次最多 100 页；任一写入失败会回滚该页并阻止水位跨越。

## 5. 接口契约

### 5.1 浏览器到 Java

| 接口 | 权限与范围 | 约束 |
| --- | --- | --- |
| GET /api/v1/funds/{fundCode}/signals | FUND_READ；只读已发布评分 | 游标分页，返回数据截至日、特征/模型版本、状态、解释和陈旧标记 |
| GET /api/v1/funds/{fundCode}/analysis-summary | FUND_READ；只读已发布或已暂停模型摘要 | 只返回受限模型元数据和关联回测固定字段；Python 不可用时仅返回同基金的明确陈旧缓存 |
| GET /api/v1/alert-rules | 当前用户 | 只能读取本人规则 |
| PUT /api/v1/alert-rules | 当前用户且已关注该基金 | RISK_LEVEL 必须有 0 到 1 阈值；其他类型无阈值；写审计 |
| GET /api/v1/notifications | 当前用户 | 稳定按 created_at、notification_id 逆序分页，不返回其他用户数据 |
| POST /api/v1/notifications/{id}/read | 当前用户 | 幂等标记已读；不存在或非本人统一 404 |
| GET /api/v1/admin/analysis/benchmarks | SYSTEM_ADMIN | 只返回基准元数据、来源启用状态和覆盖摘要，不返回原始日序列 |
| PUT /api/v1/admin/analysis/benchmarks/{benchmarkCode} | SYSTEM_ADMIN | 登记 DRAFT 基准元数据；不启用来源、基准或模型 |
| PUT /api/v1/admin/analysis/benchmarks/{benchmarkCode}/points | SYSTEM_ADMIN | 限制 10000 点，按代码和日期幂等导入；ACTIVE 基准必须先暂停 |
| POST /api/v1/admin/analysis/benchmarks/{benchmarkCode}/activate | SYSTEM_ADMIN | 仅来源已启用且至少 400 点时启用；不激活模型 |
| POST /api/v1/admin/analysis/benchmarks/{benchmarkCode}/suspend | SYSTEM_ADMIN | 停止新回测使用，保留历史回测和发布记录 |
| POST /api/v1/admin/analysis/runs/rolling-backtest | SYSTEM_ADMIN | 仅创建受控异步回测，不同步等待完成 |
| GET /api/v1/admin/analysis/runs/{runId} | SYSTEM_ADMIN | 返回持久运行、回测引用和脱敏失败摘要 |
| POST /api/v1/admin/analysis/model-releases/{id}/activate | SYSTEM_ADMIN | 仅 ELIGIBLE 回测可激活；写审计并自动暂停同类别旧 ACTIVE 版本 |
| POST /api/v1/admin/analysis/model-releases/{id}/suspend | SYSTEM_ADMIN | 显式暂停发布并写审计 |
| POST /api/v1/admin/analysis/signal-delivery | SYSTEM_ADMIN | 仅消费已有评分，不启动评分、回测或发布 |

所有公开响应均含 traceId、dataAsOf、scoreStatus 和非交易披露。基金用户只看到已发布版本的评分和面向用户的回测摘要；完整配置、失败详情和审批记录仅管理员可见。

### 5.2 Java 到 FastAPI

| 内部接口 | 调用方 | 规则 |
| --- | --- | --- |
| POST /internal/v1/analysis/runs/rolling-backtest | Java 管理端 | 服务令牌、异步返回持久运行标识；只接受受限费率 |
| GET /internal/v1/analysis/runs/{runId} | Java 管理端 | 只读状态和脱敏统计 |
| GET /internal/v1/signals/changes | Java 消费任务 | 复合游标成对必传；仅返回 ACTIVE 模型的 SCORED 变化 |
| POST /internal/v1/analysis/model-releases/{id}/activate | Java 管理端 | 服务令牌、审核 TraceID；Python 校验关联回测为 ELIGIBLE |
| POST /internal/v1/analysis/model-releases/{id}/suspend | Java 管理端 | 服务令牌、审核 TraceID；停止后续新评分 |
| GET /internal/v1/analysis/fund-summary?fundCode={fundCode} | Java 基金详情 | 服务令牌、只读；仅选择最新 ACTIVE，缺失时选择最新 SUSPENDED，绝不暴露候选模型、原始 JSON 或失败细节 |
| GET /internal/v1/analysis/benchmarks | Java 管理端 | 服务令牌、只读，仅输出摘要与覆盖范围 |
| PUT /internal/v1/analysis/benchmarks/{benchmarkCode} | Java 管理端 | 服务令牌，登记元数据；来源仍按 source_registry 校验 |
| PUT /internal/v1/analysis/benchmarks/{benchmarkCode}/points | Java 管理端 | 服务令牌，最大 10000 点，`benchmark_code + nav_date` UPSERT |
| POST /internal/v1/analysis/benchmarks/{benchmarkCode}/activate | Java 管理端 | 服务令牌，要求来源已启用且最少 400 点 |
| POST /internal/v1/analysis/benchmarks/{benchmarkCode}/suspend | Java 管理端 | 服务令牌，阻止新回测使用，不删除历史 |

Python 拒绝浏览器 Origin 和缺失服务令牌请求。所有内部调用必须设置连接、读取超时与 TraceID；不在 URL、日志或错误体中包含服务令牌。

## 6. 回测与发布规则

1. 训练、验证、测试必须按时间滚动，任一未来日期不得进入此前特征或训练样本。
2. 基线至少包括长期持有、定投和已确认业绩比较基准；费用、再平衡和缺失数据策略必须作为运行配置的一部分。
3. 回测结果不满足样本量、完整度、独立测试区间或已确认的收益与风险阈值时，publication_status 固定 INELIGIBLE。
4. ACTIVE 模型版本的输入来源、特征版本、目标周期和类别发生不兼容变化时必须暂停并重新回测，不能复用旧准入结论。
5. 首个试点只允许一个已确认基金类型和一个目标周期；其他类别默认 DATA_INSUFFICIENT 或 NOT_APPLICABLE。

## 7. 前端呈现和降级

评分页分为 已验证事实、模型评分、回测状态、数据不足原因 四个区域。概率和置信度仅在 SCORED 时显示；其他状态只显示缺失原因、最新数据日期和恢复条件。模型解释必须标注为模型推断，不得与来源事实混排。

通知页只展示触发的基金、规则类型、评分或事件日期、简短风险解释、数据截至时间和已读状态。页面没有交易按钮、外部账户入口、收益承诺或默认行动建议。

## 8. 监控、告警与发布

需要监控的最小指标包括：

- 来源成功率、来源水位滞后、冲突与缺失基金数。
- 特征构建数、SCORABLE 比例、DATA_INSUFFICIENT 比例、单批耗时。
- 评分数、MODEL_REJECTED 数、评分到 Java 消费延迟。
- 回测状态、ELIGIBLE 比例、ACTIVE 模型数、暂停次数。
- 通知命中数、去重数、失败数、每用户每天通知数和未读积压。

模型或来源异常时优先自动暂停 analysis_model_release，停止新评分与新通知；旧结果可以只读展示为陈旧，并附暂停原因和最后成功时间。发布必须采用先部署 Python、再 Java、最后 Vue 的兼容顺序；回滚时先暂停模型，再回退读取端，禁止删除历史派生数据。

## 9. v1.1｜M3-04 实现口径

- `M3_STOCK_MOMENTUM_BASELINE_V1` 只读取 `M3_STOCK_FEATURE_V1` 的 20 日收益、20 日波动率和 60 日最大回撤；概率、置信度和风险层级只有在特征为 `SCORABLE` 且同类别发布为 `ACTIVE` 时才写入。
- 回测在已落库股票型净值上生成离线未来标签；信号日仅使用此前 20 个交易日的输入，未来净值只用于验证。训练、验证、测试使用扩展窗口，最终日期边界和费用、样本数、对照指标都写入 `backtest_run`。
- 当前未登记业绩比较基准，`benchmark_status=NOT_CONFIGURED` 是发布闸门的明确失败原因；长期持有和等额分期投入结果仍会被记录，但不能替代业绩比较基准。
- 回测任务只创建 `DRAFT` 或 `ELIGIBLE` 的 `analysis_model_release`。`ACTIVE`、`SUSPENDED`、`RETIRED` 均需显式状态转换；激活会在一个事务中暂停同一模型代码、基金类型的旧 `ACTIVE` 版本。

## 10. v1.2｜M3-05 实现口径

- Python `analysis_run` 保存 `QUEUED/RUNNING/COMPLETED/FAILED` 和回测引用，提交失败会显式标记失败；任务不会自动补充未授权基准或自动激活模型。
- Java 通过服务令牌、连接/读取超时和 TraceID 调用 Python；管理员创建运行、激活/暂停发布和手动投递均写 Java `audit_log`。
- 投递器使用 PostgreSQL 事务级咨询锁，按页执行快照、规则、通知与水位的一致性事务。RISK_LEVEL 映射为 LOW=0.25、MEDIUM=0.50、HIGH=1.00，SIGNAL_CHANGE 仅在已有方向变化时命中；EVENT 留给后续已授权事件消费者。
- `analysis.delivery.enabled` 默认 false。打开该开关只会周期投递已有 ACTIVE 评分；不会启动 Python 评分、回测或发布。M3-06 已将当前通知接口、基金分析摘要和管理员受控回测状态接入 Vue；页面只能读取 Java API。

## 11. v1.3｜M3-06 只读页面与受控操作口径

- 基金详情的“模型与回测摘要”独立于基金基础事实加载；其只显示 ACTIVE 或 SUSPENDED 发布版本的固定元数据、关联回测的固定统计字段、数据截至日和陈旧缓存标记。不存在可读模型时只显示模型不可用原因，绝不把 DRAFT、ELIGIBLE、INELIGIBLE 候选或原始失败 JSON 暴露给用户。
- Java 缓存成功读取的同基金摘要。Python 暂不可用时，只有已缓存摘要可作为 `stale=true` 的降级结果返回；缓存未命中仍返回服务不可用，不能补造评分、回测或通知。
- Vue 的本人通知页仅调用现有 Java 本人范围接口，并可幂等标记已读、调整既有提醒规则的风险阈值和启用状态；新增规则仍从已关注基金详情发起，不在通知页改变基金或规则类型。
- 管理员分析运行页只能创建受控异步滚动回测并轮询持久运行状态；它不触发来源同步、特征构建、评分、激活、暂停或信号投递。所有页面均维持非交易披露，不提供外部账户、交易跳转或行动指令。

## 12. v1.4｜基准序列与候选模型回测口径

- `benchmark_series` 的来源不可在已有序列后改变；基准状态为 `DRAFT`、`ACTIVE` 或 `SUSPENDED`。只有 `ACTIVE + source_registry.enabled=true` 的股票型基准可进入新回测；导入或更新 ACTIVE 基准前必须先暂停，防止同一模型版本混用不同基准数据。
- `benchmark_nav_daily` 使用 PostgreSQL 批量 UPSERT，业务键为 `benchmark_code + nav_date`，内容哈希未变时不更新。单次导入最多 10000 点，重复日期且收盘值冲突直接拒绝；不允许浏览器直连 Python 或写来源表。
- 回测读取固定候选 `M3_STOCK_MOMENTUM_BASELINE_V1`，不会接受浏览器传入的模型、阈值或特征参数。独立测试窗口中，只有信号日和该基金未来标签日均存在的基准点才计入比较；覆盖少于 95% 或缺少基准收益时，发布状态固定 `INELIGIBLE`。
- 本机迁移 `20260901_09` 只创建上述两张表及索引。当前基准表为 0 行、手动来源禁用，因此当前仍不能创建 ELIGIBLE 或 ACTIVE 模型；需要数据治理人员先确认来源授权并提供人工核验序列。
