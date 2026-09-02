# 基金雷达 — M3 特征、概率评分、滚动回测与站内提醒验收用例

> 关联需求：docs_zhx/requirements/m3-decision-assistance.md
> 关联设计：docs_zhx/design/m3-decision-assistance.md
> 关联用户模块验收：docs_zhx/testcase/watchlist-prediction-module.md
> 版本：v1.6
> 日期：2026-09-01
> 说明：本文件保留 M3 基础能力验收设计。历史 v1.4 人工基准与 v1.5 DeepSeek 解释验证已被本次控制面退役决定覆盖，不再是可执行功能验收。M3-04 的评分状态、时间泄漏和无基准不发布的代码级单元验证，以及 M3-06 分析摘要的服务令牌/浏览器隔离、Java 权限与缓存降级映射仍可复用。它们不验证“我的关注”详情的四周期预测，后者由关联用户模块验收文档覆盖。真实基准导入、真实回测、ACTIVE 评分到用户通知的端到端用例尚未执行，不得用作模型上线或回测有效性证明。

## 已执行的基础验证（2026-09-01）

- Python：特征自动/手动同步、来源血缘过滤、部分成功重试、内部服务令牌边界、模型发布约束、M3-05 分析运行/复合游标、M3-06 基金摘要及 v1.4 基准覆盖/服务令牌接口测试通过（Ruff、64 项 pytest）；Alembic 已新增 `20260901_09`。
- Python：v1.5 已新增解释快照 JSON 白名单、截断拒绝、固定模型配置、任务接口服务令牌和运行状态验证（Ruff、68 项 pytest）；Alembic 已升级 `20260901_10`，并核验快照表、幂等键和 `FUND_EXPLANATION` 运行类型约束。
- Java：Flyway 已从 V9 升至 V11，消费检查点、提醒冷却、通知权限与触发引用的迁移测试通过；评分重放只生成一条通知、检查点不重复推进、基金摘要映射、解释任务基金代码校验和未认证访问拒绝的 PostgreSQL 16 集成测试通过（JBR release 17、39 项 Maven 测试）。
- Vue：同步中心特征快照手动按钮、基金分析摘要、本人通知与管理员分析运行/基准治理页面已通过类型检查、Lint 和生产构建。
- Vue：管理员手动解释入口、运行类别状态和基金详情只读解释快照已通过类型检查、Lint 和生产构建。
- 上述验证不产生 ACTIVE 模型、SCORED 结果、回测运行或站内通知。

## TC-M3-01｜来源和数据不足闸门

前置条件：

- 某基金的授权来源被关闭、失败、陈旧或存在冲突。
- 已创建特征构建任务。

操作步骤：

1. 执行该基金、该业务日、指定特征版本的特征构建。
2. 查询特征快照和评分结果。
3. 打开基金评分页面。

数据库验证：

~~~sql
SELECT fund_code, as_of_date, eligibility_status, unavailable_reason, completeness
FROM feature_snapshot
WHERE fund_code = :fund_code
ORDER BY computed_at DESC;

SELECT fund_code, as_of_date, score_status, direction,
       directional_probability, confidence
FROM forecast_result
WHERE fund_code = :fund_code
ORDER BY scored_at DESC;
~~~

| 验收点 | 预期 |
| --- | --- |
| 特征状态 | DATA_INSUFFICIENT 或 NOT_APPLICABLE，并记录可读原因 |
| 评分字段 | 不存在评分，或非 SCORED 行的方向、概率、置信度均为 NULL |
| 页面 | 显示数据不足、最新数据日期和恢复条件，不显示行动倾向 |
| 提醒 | 不生成评分变化通知 |

测试结果：

- [ ] 通过
- [ ] 未通过
- 未通过原因：

---

## TC-M3-02｜基金类型特征隔离

前置条件：

- 至少准备股票或指数型、债券型、货币型各一只基金的已授权净值样本。
- 未接入持仓、久期、信用暴露或海外基准字段。

操作步骤：

1. 为三只基金在同一业务日构建特征快照。
2. 比较 feature_payload 的 schema_version、metrics 和 eligibility_status。

数据库验证：

~~~sql
SELECT fund_code, fund_type, feature_version, eligibility_status, feature_payload
FROM feature_snapshot
WHERE as_of_date = :as_of_date
ORDER BY fund_type, fund_code;
~~~

| 验收点 | 预期 |
| --- | --- |
| 股票或指数型 | 仅使用已授权净值序列的统计特征 |
| 债券型 | 不出现久期、信用和杠杆等未授权推断字段 |
| 货币型 | NOT_APPLICABLE；没有上涨、下跌或趋势特征 |
| QDII、FOF | 缺少已授权基准或日历时保持 DATA_INSUFFICIENT |

测试结果：

- [ ] 通过
- [ ] 未通过
- 未通过原因：

---

## TC-M3-03｜特征快照幂等和可重现

前置条件：

- 同一基金、业务日、特征版本的输入数据水位固定。

操作步骤：

1. 连续两次创建相同特征构建运行。
2. 比较 feature_id、feature_hash、computed_at 和记录数。
3. 修改来源数据水位后再次构建。

数据库验证：

~~~sql
SELECT fund_code, as_of_date, feature_version, COUNT(*) AS row_count,
       MIN(feature_hash), MAX(feature_hash)
FROM feature_snapshot
WHERE fund_code = :fund_code
  AND as_of_date = :as_of_date
  AND feature_version = :feature_version
GROUP BY fund_code, as_of_date, feature_version;
~~~

| 验收点 | 预期 |
| --- | --- |
| 重复运行 | 业务唯一键只保留一条有效快照，不产生重复记录 |
| 固定输入 | 特征哈希一致 |
| 输入变更 | 通过新版本或重新计算策略保留可追溯差异，不覆盖历史语义 |

测试结果：

- [ ] 通过
- [ ] 未通过
- 未通过原因：

---

## TC-M3-04｜评分状态约束与页面披露

前置条件：

- 一条 SCORABLE 特征快照。
- 一条 DATA_INSUFFICIENT 特征快照。
- 一个 ACTIVE 模型发布和一个 SUSPENDED 模型发布。

操作步骤：

1. 分别发起评分。
2. 读取 Java 评分接口。
3. 打开评分详情页面。

数据库验证：

~~~sql
SELECT fund_code, as_of_date, model_version, score_status, direction,
       directional_probability, confidence, risk_level, model_release_id
FROM forecast_result
WHERE fund_code IN (:scorable_fund_code, :insufficient_fund_code)
ORDER BY scored_at DESC;
~~~

| 验收点 | 预期 |
| --- | --- |
| ACTIVE 模型 + 完整特征 | 允许生成 SCORED，并带版本、解释、数据截至时间 |
| 数据不足 | 非 SCORED，方向、概率、置信度均为空 |
| 暂停模型 | MODEL_REJECTED，不产生新 SCORED |
| 页面 | 把模型推断和来源事实分区，不出现买卖、止盈或收益承诺文案 |

测试结果：

- [ ] 通过
- [ ] 未通过
- 未通过原因：

---

## TC-M3-05｜滚动回测无未来数据泄漏

前置条件：

- 已确认的单基金类别、目标周期、费用口径和比较基线。
- 至少包含训练、验证、独立测试三个连续窗口的历史样本。

操作步骤：

1. 创建一条滚动回测运行。
2. 检查训练、验证、测试边界和每期特征数据截至日。
3. 读取回测运行详情。

数据库验证：

~~~sql
SELECT run_id, fund_type, strategy_version, feature_version, model_version,
       window_start, window_end, train_end, validation_end, test_start, test_end,
       fee_rate, status, publication_status, metrics, baselines, failure_reason
FROM backtest_run
WHERE run_id = :run_id;
~~~

| 验收点 | 预期 |
| --- | --- |
| 时间顺序 | train_end < validation_end < test_start <= test_end |
| 特征水位 | 任一训练样本不读取未来净值、事件或标签 |
| 对照 | 同时记录长期持有、定投和已确认基准，含费用假设 |
| 准入 | 未达到样本或阈值时 publication_status 为 INELIGIBLE |

测试结果：

- [ ] 通过
- [ ] 未通过
- 未通过原因：

---

## TC-M3-06｜模型发布、暂停与回滚

前置条件：

- 一条 ELIGIBLE 回测和一条 INELIGIBLE 回测。

操作步骤：

1. 管理员尝试激活两条回测关联的模型发布。
2. 对激活版本创建评分。
3. 暂停该版本后再次创建评分。

数据库验证：

~~~sql
SELECT model_code, model_version, fund_type, backtest_run_id,
       release_status, effective_at, suspended_at
FROM analysis_model_release
ORDER BY wide_updated_at DESC;
~~~

| 验收点 | 预期 |
| --- | --- |
| 不合格回测 | 无法激活，记录审计拒绝原因 |
| 同类别激活 | 同一 model_code、fund_type 最多一个 ACTIVE 版本 |
| 暂停 | 停止新 SCORED 与新提醒，历史结果保持可追溯只读 |
| 回滚 | 不删除历史 feature_snapshot、forecast_result、signal_snapshot 或 notification |

测试结果：

- [ ] 通过
- [ ] 未通过
- 未通过原因：

---

## TC-M3-07｜跨服务信号消费的幂等性

前置条件：

- Python 存在一条 ACTIVE 模型的 SCORED 结果。
- Java 消费水位落后于该评分。

操作步骤：

1. 连续两次执行 Java 信号变化消费任务。
2. 模拟第一次在写入 signal_snapshot 后异常，再次恢复。
3. 查询快照和消费水位。

数据库验证：

~~~sql
SELECT fund_code, as_of_date, model_version, COUNT(*) AS row_count
FROM signal_snapshot
GROUP BY fund_code, as_of_date, model_version
HAVING COUNT(*) > 1;

SELECT consumer_name, last_scored_at, last_forecast_id
FROM analysis_delivery_checkpoint
WHERE consumer_name = 'JAVA_SIGNAL_NOTIFICATION_V1';
~~~

| 验收点 | 预期 |
| --- | --- |
| 快照幂等 | 查询不返回重复行 |
| 失败恢复 | 未完成事务不推进水位；重试后只补缺失内容 |
| 服务边界 | Java 只经内部 API 拉取，不直接连接 fund_ai |

测试结果：

- [ ] 通过
- [ ] 未通过
- 未通过原因：

---

## TC-M3-08｜本人提醒、冷却和去重

前置条件：

- 用户 A 和用户 B 均有账户；A 关注基金，B 未关注。
- A 创建 RISK_LEVEL、SIGNAL_CHANGE、EVENT 三类规则。
- 存在一条新的已发布评分或已授权事件。

操作步骤：

1. 执行 Java 信号或事件消费。
2. 重复执行同一批消费。
3. 以 A、B 分别查询通知和标记已读。

数据库验证：

~~~sql
SELECT rule_id, user_id, fund_code, rule_type, cooldown_hours, last_triggered_at
FROM alert_rule
WHERE fund_code = :fund_code;

SELECT notification_id, rule_id, deduplication_key, trigger_type,
       trigger_ref, signal_id, status, created_at, read_at
FROM notification
WHERE rule_id IN (
    SELECT rule_id FROM alert_rule WHERE fund_code = :fund_code
)
ORDER BY created_at DESC;
~~~

| 验收点 | 预期 |
| --- | --- |
| 用户隔离 | B 不能读取、标记或触发 A 的通知 |
| 去重 | 同一规则和同一评分或事件只有一条通知 |
| 冷却 | 冷却窗口内不重复生成同类提醒 |
| 关注边界 | 未关注、规则关闭或账号失效时不生成新提醒 |
| 内容 | 仅含风险解释和数据截至时间，不含交易指令 |

测试结果：

- [ ] 通过
- [ ] 未通过
- 未通过原因：

---

## TC-M3-09｜来源故障与读取降级

前置条件：

- 已存在一份历史已发布评分。
- Python 内部评分接口或来源同步任务模拟不可用。

操作步骤：

1. 查询 Java 评分接口和前端评分页。
2. 触发一次评分或通知消费任务。
3. 恢复服务后检查水位和新增记录。

数据库验证：

~~~sql
SELECT score_status, scored_at, model_release_id
FROM forecast_result
WHERE fund_code = :fund_code
ORDER BY scored_at DESC;

SELECT COUNT(*)
FROM notification
WHERE created_at >= :failure_started_at;
~~~

| 验收点 | 预期 |
| --- | --- |
| 读取 | 仅可返回明确标记陈旧的历史结果；没有缓存时受控报服务不可用 |
| 评分 | 故障期间不创建伪造的新 SCORED |
| 提醒 | 故障期间不产生评分变化提醒 |
| 恢复 | 从最后成功水位补偿，且不重复快照或通知 |

测试结果：

- [ ] 通过
- [ ] 未通过
- 未通过原因：

---

## TC-M3-10｜非交易与前端披露边界

前置条件：

- 已有一条 SCORED 结果、一条 DATA_INSUFFICIENT 结果和至少一条通知。

操作步骤：

1. 逐页检查基金评分、回测摘要、提醒规则和通知页面。
2. 检查浏览器网络请求目标。
3. 搜索页面按钮、接口和通知文案。

页面与接口验证：

~~~text
浏览器请求只应指向 Java 的 /api/v1 路径。
页面必须显示数据截至日、模型或特征版本、解释和非交易提示。
页面不得出现立即买入、卖出、申购、赎回、支付宝登录或外部账户授权入口。
~~~

| 验收点 | 预期 |
| --- | --- |
| 披露 | 用户能区分来源事实、模型推断和数据不足 |
| 数据不足 | 不显示方向、概率、收益或行动建议 |
| 服务边界 | 浏览器不直接调用 Python、外部数据源或交易平台 |
| 交易边界 | 不存在交易 API、按钮、跳转或后台任务 |

测试结果：

- [ ] 通过
- [ ] 未通过
- 未通过原因：

---

## TC-M3-11｜授权基准登记、覆盖闸门与候选回测

前置条件：

- 系统管理员已登录；`source_registry` 中存在一条人工来源登记。
- 初始来源为未启用，且 `benchmark_series`、`benchmark_nav_daily` 均无目标基准记录。
- 已准备具有授权依据的股票型基准日收盘序列，至少覆盖回测所需的 400 个点和独立测试窗口。

操作步骤：

1. 在“分析运行 → 回测基准”登记基准代码、名称、来源编码和授权依据。
2. 在来源未启用时导入日序列并尝试启用，确认均被拒绝。
3. 由数据治理人员确认授权后启用来源；导入不超过 10000 条的 `YYYY-MM-DD,收盘值` 数据，重复相同数据后再次导入。
4. 确认点数不少于 400 后启用基准；选择该基准创建滚动回测。
5. 准备一份缺少大部分未来标签日期的基准序列，执行同配置回测并查询运行和回测结果。

数据库验证：

~~~sql
SELECT b.benchmark_code, b.status, s.source_code, s.enabled,
       COUNT(n.nav_date) AS point_count, MIN(n.nav_date), MAX(n.nav_date)
FROM benchmark_series b
JOIN source_registry s ON s.source_id = b.source_id
LEFT JOIN benchmark_nav_daily n ON n.benchmark_code = b.benchmark_code
WHERE b.benchmark_code = :benchmark_code
GROUP BY b.benchmark_code, b.status, s.source_code, s.enabled;

SELECT run_id, publication_status, baselines ->> 'benchmark_id' AS benchmark_id,
       baselines ->> 'benchmark_status' AS benchmark_status,
       baselines ->> 'benchmark_coverage' AS benchmark_coverage,
       failure_reason
FROM backtest_run
WHERE run_id = :run_id;
~~~

| 验收点 | 预期 |
| --- | --- |
| 服务边界 | 浏览器只调用 Java；Python 基准接口拒绝缺失服务令牌和浏览器 Origin |
| 来源闸门 | 来源未启用时导入和启用均被拒绝，不写基准点 |
| 幂等导入 | 相同 `benchmark_code + nav_date + value` 重复导入不产生重复行 |
| 启用门槛 | 少于 400 点不能启用；启用基准不会激活模型、评分或提醒 |
| 覆盖闸门 | 测试窗口基准覆盖少于 95% 时 `benchmark_status=DATA_INSUFFICIENT`、`publication_status=INELIGIBLE` |
| 发布边界 | 完整基准回测最多生成 ELIGIBLE 候选，仍须管理员单独激活模型 |

测试结果：

- [ ] 通过
- [ ] 未通过
- 未通过原因：

---

## TC-M3-12｜DeepSeek 已发布评分解释快照

前置条件：

- 系统管理员已登录；Python 的 DeepSeek 本机运行配置已启用，且密钥只存在于被 Git 忽略的本机配置。
- 已存在一条 `ACTIVE` 模型版本、该版本关联的一条 `SCORED` 评分及对应特征快照；另准备一只不满足此前置的基金。

操作步骤：

1. 以基金用户调用管理员解释接口，确认被拒绝；以管理员提交满足前置的六位基金代码。
2. 查询持久运行状态至完成，重复提交相同基金和评分，确认复用现有快照而非重复外部调用。
3. 打开基金详情，确认只显示已保存解释的业务日期、模型/特征版本、说明、证据、风险、数据缺口和非交易声明。
4. 提交不满足 `ACTIVE + SCORED` 前置的基金，确认任务以 `EXPLANATION_SOURCE_NOT_READY` 结束且未调用外部模型。
5. 模拟服务未启用、认证失败、余额不足、限流、响应截断或 JSON 多字段，确认不写半成品，原评分、回测、发布和提醒记录不变。

数据库验证：

~~~sql
SELECT e.forecast_id, e.model_release_id, e.fund_code, e.as_of_date,
       e.provider, e.provider_model, e.prompt_version, e.generated_at,
       e.source_input_hash, e.content_hash, e.prompt_tokens, e.completion_tokens
FROM analysis_explanation_snapshot e
WHERE e.fund_code = :fund_code
ORDER BY e.generated_at DESC;

SELECT forecast_id, provider, provider_model, prompt_version, COUNT(*) AS row_count
FROM analysis_explanation_snapshot
GROUP BY forecast_id, provider, provider_model, prompt_version
HAVING COUNT(*) > 1;

SELECT analysis_run_id, run_type, status, failure_reason, requested_at, finished_at
FROM analysis_run
WHERE run_type = 'FUND_EXPLANATION'
ORDER BY requested_at DESC;
~~~

| 验收点 | 预期 |
| --- | --- |
| 权限与服务边界 | 浏览器只调用 Java；仅 SYSTEM_ADMIN 可创建；Python 拒绝浏览器 Origin 和缺失服务令牌 |
| 前置闸门 | 没有 ACTIVE 模型或 SCORED 评分时不访问外部模型，任务明确记录未就绪原因 |
| 最小化输入 | 外部调用不含 user_id、关注、持仓、原始净值序列、完整记录或任意扩展字段 |
| 输出契约 | 只持久化五个顶层字段和 1 至 4 条 `label/detail` 证据；截断、空内容或额外字段被拒绝 |
| 幂等与审计 | 相同评分、模型和提示词版本不产生重复快照；仅保留哈希、受限内容、请求标识和用量 |
| 业务隔离 | 解释运行不重新评分、不修改回测/发布状态、不投递提醒，也不出现买卖或收益承诺 |
| 密钥保护 | 密钥不出现在仓库、数据库、日志、接口响应、测试报告或前端包中 |

测试结果：

- [ ] 通过
- [ ] 未通过
- 未通过原因：

---

## v1.6｜关注详情多周期预测验收边界

本文件的 TC-M3-01 至 TC-M3-12 验证共享数据治理、评分状态、回测闸门、通知和受控解释；它们不能证明用户已经在“我的关注”里获得 7/15/30/60 天预测。以下场景必须按 `docs_zhx/testcase/watchlist-prediction-module.md` 单独执行并留下真实环境证据：

1. 本人关注关系限制下的预测读取与取消关注后的拒绝。
2. 四个周期独立的概率、数据截至日、模型版本和不可用状态。
3. 净值基线与包含持仓/板块、公告/新闻的综合预测之间的输入覆盖披露。
4. 披露日期/发布时间截止校验、无未来数据的多周期滚动回测和逐周期发布/暂停。
5. 无模型、无来源、服务故障和非交易边界下不生成假概率或个人操作建议。
## v1.7｜分析运行控制面退役验证

本节优先于 TC-M3-11、TC-M3-12 及本文此前关于管理员运行页、人工基准和 DeepSeek 的历史设计。它们不再是待执行用例。

| 验收点 | 预期 |
| --- | --- |
| Vue | 不存在分析运行导航、后台分析路由、页面组件、API 模块或专属样式引用 |
| Java | 不存在管理员分析控制器、管理任务、模型变更或人工投递接口 |
| Python | 不存在分析运行/基准内部接口、外部模型客户端、解释快照服务或专用本机配置 |
| 摘要兼容 | 公共基金详情的只读模型/回测摘要仍可读取，但不返回解释快照字段 |
| 数据库 | 历史迁移和既有表保持，以支持升级；当前应用不再加载或调用退役模型 |
