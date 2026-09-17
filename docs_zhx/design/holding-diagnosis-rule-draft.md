# 持仓诊断、规则草案与建议 V2 升级

> 日期：2026-09-17
> 变更等级：L3（个人决策辅助口径、跨 Java/Python 服务、新增个人规则数据）
> 状态：设计草案，待评审后进入实施；实施顺序与完成标记登记到 `docs_zhx/implementation/`
> 关联文档：[需求 · 当前项目定位与目标](../requirements/fund-radar.md#current-positioning)（第 1、1.1、1.2、1.3 节为权威入口）、[需求第 21.3 节](../requirements/fund-radar.md)（规则只能由用户显式确认）、[持仓操作建议与每日留档](portfolio-advice-history.md)（本文直接前作，留档/回看口径沿用）

本文是「持仓预警与决策辅助」主线的下一步设计。它是分析提示与复核辅助，不是交易策略，不构成投资建议，不执行任何交易，不替用户决定仓位数值。全文不使用确定性涨跌措辞；建议措辞以需求第 1.3 节边界为准。

## 本次范围与页面

做三件事：

1. **持仓诊断引擎**：每日对照首份诊断基线与上次报告，逐项检查「持有理由是否仍成立」，每项给出「成立 / 已改变 / 数据不足」结论、事实来源和数据截至时间。
2. **规则草案生成器**：按每只持仓基金的历史净值统计生成三档（保守 / 适中 / 宽松）止盈线与减仓线草案，每个阈值附历史触发统计；用户显式选择或微调并确认后规则才生效，系统不自动补写（需求第 21.3 节）。
3. **建议升级 HOLDING_ADVICE_V2**：依据链 = 诊断事实 + 本人已确认规则的触发情况 + 实验模型分数（仅辅助栏）。规则版本化，V1 历史不回改、不混算。

页面：持仓卡片沿用现有入口并展示 V2 标签；持仓分析页新增「诊断详情」与「规则草案确认」两个区块；历史记录与效果回看沿用既有分页结构。

明确不做（非目标）：

- 不训练、不发布新模型；实验模型分数只作辅助栏，未发布模型不得作为主依据。
- 不接入新闻、公告、政策采集（需求第 23 节暂停状态不变）；未接入的分析继续列为缺口。
- 不执行交易，不生成份额、金额等具体仓位数值；减仓线触发只提示复核。
- 不产出买入 / 加仓 / 暂缓结论：本次范围是已有持仓；候选基金侧建议需要另外的已确认输入，不在本次范围，也不得因「没查到风险」直接给出买入建议（需求第 1.3 节）。
- 不替用户补写风险偏好、止盈止损规则；用户不确认时系统只有通用事实展示。
- 不回改 `portfolio_advice_report` 既有 V1 报告与核验结果。
- 不做组合层面的汇总诊断与汇总建议；本次以单基金持仓为单位，组合视角留待后续评审。

## 业务口径

### 诊断项目清单

每项诊断输出：项目键、结论（`VALID` 成立 / `CHANGED` 已改变 / `INSUFFICIENT` 数据不足）、证据正文、来源标识、数据截至日。基线规则：首份报告多数项没有可比基线，如实记 `INSUFFICIENT`（无基线），不把首次状态伪造成「成立」；从第二份起与上一份报告记录的基线对比。「买入时事实快照」当前不存在（`sim_position.snapshot` 只是派生持仓摘要），因此基线只能从首份诊断报告建立，本文不编造不存在的快照。

| 项目 | 事实来源（fund_ai） | 判定逻辑 | 数据不足行为 |
| --- | --- | --- | --- |
| 基金经理是否变更 | `fund_manager_assignment`（manager_name / begin_date / end_date / ann_date） | 当前在任经理组合与基线不一致 → `CHANGED`，并注明「经理变更本身不等于管理能力恶化」（需求第 1.3 节） | 无任职记录 → `INSUFFICIENT` |
| 规模是否暴涨/腰斩 | `fund_share_snapshot`（fund_share / trade_date） | 最新规模相对基线 ≥+100% 或 ≤−50% → `CHANGED`；阈值初值，实施时可复核 | 无规模历史 → `INSUFFICIENT` |
| 相对同类持续跑输 | `GET /internal/v1/funds/{code}/same-type-comparison`（受控当前市场样本的 month_change_rate 排名） | 连续 3 个诊断日处于同类样本后 25% → `CHANGED`；必须标注「受控样本，不是全市场同类平均」 | 同类样本 < 5 只或接口不可用 → `INSUFFICIENT` |
| 相对业绩基准 | `fund_profile.benchmark` 文本 + `benchmark_nav_daily` 覆盖情况 | 基准序列可得且连续 60 个交易日跑输基准 → `CHANGED`；基准数据覆盖范围实施时确认，不可用同类排名代替基准 | 基准序列未覆盖 → `INSUFFICIENT`，说明缺失项 |
| 当前回撤 | `nav_daily`（优先累计净值，同需求第 22 节涨跌率口径） | 当前回撤达到历史最大回撤的 80% 以上 → `CHANGED`（风险提示，不是卖出指令） | 历史净值 < 250 个交易日 → `INSUFFICIENT` |
| 费用变化 | `fund_profile`（management_fee / custodian_fee） | 与上一份报告记录值不同 → `CHANGED`；`fund_profile` 是覆盖式快照无历史版本，基线只能取自上次诊断报告 | 首份报告 → `INSUFFICIENT`（无基线） |
| 分红变化 | `fund_dividend`（ann_date / ex_date / cash_dividend） | 基线之后出现新分红事件 → `CHANGED`，仅提示现金分红再投口径，不解释为恶化 | 分红历史未同步 → `INSUFFICIENT` |

口径注解：同类比较使用既有 `same-type-comparison` 接口，其样本是当前基金市场受控范围（需求第 20 节的 `ACTIVE`、`TUSHARE_PRO_FUND` 份额），接口契约本身声明「不得解释为全市场排名」；诊断证据正文必须原样携带该范围说明。「相对同类持续跑输」按诊断日截面判定，连续 3 个诊断日处于后 25% 才记 `CHANGED`，避免单日排名波动触发提醒。

总体结论：任一项 `CHANGED` → 总体 `CHANGED`；无 `CHANGED` 但有 `INSUFFICIENT` → 总体 `INSUFFICIENT`；全部 `VALID` → 总体 `VALID`。单项独立成立，不被其他项状态统一阻断（需求第 1.2 节分别判定原则）。

### 变化跟踪与提醒去重

同一诊断项的状态变化遵循需求第 1.3 节：同一事件更新原项状态，仅在结论等级、证据或已确认规则条件有实质变化时才形成新的提醒内容；普通分数波动不触发相反结论。状态恢复（如经理变更后再次回到基线组合）同样留档并注明恢复理由，不删除此前的 `CHANGED` 记录。每日报告是全量逐项快照，页面默认只高亮与上份报告相比发生变化的项目。

### 规则草案三档算法

统计由 Python 在公共基金层面计算（不知 user_id），输入为 `nav_daily` 该份额全历史，优先整段累计净值；累计净值缺失回退单位净值；二者都不足 → 数据不足，不生成草案。历史要求：≥ 500 个交易日且 ≥ 30 个滚动窗口，否则输出「历史太短，分位数不稳定」而不给数字。分红不自行还原复权（沿用 nav_daily 现有口径），草案页注明该口径限制。

算法参数（窗口长度 63、最低历史 500、各档分位）随统计结果一并写入 `holding_rule_draft.stats`，草案可复算、可审计；参数将来调整即生成新指纹的新草案，不回改旧草案，已确认规则不受草案刷新影响。

统计量（滚动 63 个交易日窗口，约一个季度）：

- 窗口最大回撤分布 `DD`、窗口收益分布 `R`；
- 历史最大回撤及各回撤区间的修复天数分布；
- 最差 20 个交易日损失分布 `L20`；
- 日收益年化波动率，以及在同类受控样本内的分位（样本不足时标缺）。

三档阈值：

| 档位 | 减仓线（回撤触发） | 止盈线（收益触发） |
| --- | --- | --- |
| 保守 | `DD` 的 50 分位 | `R` 的 70 分位 |
| 适中 | `DD` 的 75 分位 | `R` 的 85 分位 |
| 宽松 | `DD` 的 90 分位 | `R` 的 95 分位 |

每个阈值附三条历史统计：历史上触发过几次（滚动窗口穿越次数）、触发后继续下跌的中位幅度、触发后平均（中位）修复天数。用户微调时以分位值上下 ±20% 为限并记录为 `CUSTOM` 档，防止把草案页变成自由填数字的交易参数页。止盈线的语义是「达到后提示复核」，减仓线的语义是「回撤达到后提示复核」；两者都只产生复核提示，不承诺触发后价格走势，也不换算成金额或份额。

货币基金不适用回撤/止盈类规则（需求第 5 节：货币基金不输出涨跌预测），QDII 等交易估值规则不同的类别先标注「暂不适用」并说明原因，不混入同一口径。

### 建议映射与 HOLDING_ADVICE_V2

规则版本 `HOLDING_ADVICE_V2`，与 V1 分别回看。建议枚举对齐需求第 1.2 节；本次持仓场景实际产出四种：`HOLD` 持有 / `WATCH` 观察 / `REDUCE` 减仓复核 / `UNAVAILABLE` 数据不足暂不建议。映射逻辑：

1. 关键输入不足（份额未确认、持仓有核对问题、诊断关键项 `INSUFFICIENT` 且无法形成事实链）→ `UNAVAILABLE`，列出具体缺失项，不默认继续持有。
2. 本人已确认规则被触发（当前回撤 ≥ 已确认减仓线，或达到止盈线）→ `REDUCE` 复核提示，正文写明触发的是哪条已确认规则及阈值。
3. 规则未确认但诊断总体 `CHANGED` → `WATCH`，列出已改变项；因规则未确认，不产出减仓结论。
4. 诊断总体 `VALID` 且无规则触发 → `HOLD`。
5. 实验模型分数只进辅助栏：与结论方向相反时列入反对依据；模型不可读、未发布或分数缺失不阻断以上事实+规则结论，只在辅助栏标「不可用」。禁止「必涨 / 必跌 / 稳赚 / 重仓」等措辞；每条建议带触发条件、反对依据、失效条件和数据截至时间（需求第 1.2 节五要素）。

失效条件按结论分别写入报告：`HOLD` 失效于任一诊断项转为 `CHANGED` 或已确认规则触发；`WATCH` 失效于诊断恢复 `VALID` 或规则确认后升级为 `REDUCE`；`REDUCE` 失效于规则撤销、阈值不再触发且诊断恢复，恢复同样留档。V2 上线后每日只为有持仓的基金生成 V2 报告；V1 停止新生成，但历史报告、历史接口和到期核验继续保留，两个版本各自回看。

依据链沿用 `AdviceTypes.Evidence` 的 `SUPPORT / AGAINST / CONTEXT` 结构，V2 一条 `REDUCE` 建议的典型构成为：`RULE`（SUPPORT，已确认规则的减仓线及触发事实，来源为规则版本号）、`DIAGNOSIS`（SUPPORT 或 CONTEXT，逐项诊断结论与来源标识）、`MODEL`（辅助栏，方向相反时记 AGAINST）、`DATA_STATUS`（CONTEXT，缺口与数据截至日）。快照留档后页面回看不重新推理。

### 首次回填与存量持仓

功能上线时，对全部已有持仓基金在首个调度批次内各生成一份基线诊断报告；该批次允许较长运行时间，但沿用同一咨询锁，且逐基金独立留档、失败单列。首份报告的多数项目为「无基线」的 `INSUFFICIENT`，页面须如实展示该状态，不得把首次回填伪造成「全部成立」。已有持仓的规则均为「未确认」，首次进入持仓分析页时引导查看草案，但不自动确认、不默认选中档位。

## 数据与服务边界

- Vue 只访问 Java；读取用 `PORTFOLIO_SELF_READ`，草案重新生成与规则确认用 `SIM_PORTFOLIO_SELF_WRITE`（V13 已登记）。每次读取、确认、详情均从服务端会话取 userId 并校验本人归属，沿用 `CurrentUserContext.requirePermission` 模式。
- 权限码沿用论证：规则确认与草案生成属于「维护本人模拟持仓相关设置」，与手动生成建议同属本人写操作，复用 `SIM_PORTFOLIO_SELF_WRITE` 而不新增权限码，避免权限矩阵膨胀；若实施评审认为规则确认需要独立授权粒度，再新增权限码并单独登记。
- Python 只做公共基金层面计算（诊断事实、草案统计、20 交易日回报核验），不接收 user_id、份额、规则参数，不调用新的外部数据源。
- 个人规则、草案、诊断报告存 `fund_core`，由 Java Flyway 新迁移按阶段拆分管理：V16 诊断报告表（阶段 1）、V17 草案与规则两表（阶段 2）、V18 扩展 `portfolio_advice_report.decision` CHECK（阶段 3）。论证：不并入 `portfolio_advice_report`——诊断在规则未确认、不形成建议时也要每日留档，且草案与确认规则有自己的生命周期；但三张新表完整复用 V14 的纪律：同日幂等唯一键、`BEFORE UPDATE` 拒绝改写触发器、中文列注释、快照 JSONB + content_hash。

表设计草案（V16/V17/V18，随阶段拆分应用；字段名实施时按既有命名风格最终确认）：

```sql
CREATE TABLE holding_diagnosis_report (
    report_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_account(user_id) ON DELETE CASCADE,
    fund_code VARCHAR(6) NOT NULL,
    fund_name VARCHAR(200) NOT NULL,
    report_date DATE NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL,
    verdict VARCHAR(16) NOT NULL CHECK (verdict IN ('VALID','CHANGED','INSUFFICIENT')),
    items JSONB NOT NULL,            -- 逐项结论、证据、来源与数据截至日
    cutoff_date DATE,
    fingerprint VARCHAR(64) NOT NULL,
    content_hash VARCHAR(64) NOT NULL,
    CONSTRAINT uq_holding_diagnosis_daily UNIQUE(user_id,fund_code,report_date,fingerprint)
);

CREATE TABLE holding_rule_draft (
    draft_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_account(user_id) ON DELETE CASCADE,
    fund_code VARCHAR(6) NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL,
    stats_cutoff_date DATE NOT NULL, -- 统计所用净值截止日
    stats JSONB NOT NULL,            -- 分位值、波动率、同类分位及样本量
    tiers JSONB NOT NULL,            -- 三档阈值及各自触发次数/续跌/修复统计
    fingerprint VARCHAR(64) NOT NULL,
    UNIQUE(user_id,fund_code,fingerprint)  -- 统计未变不重复生成
);

CREATE TABLE holding_rule_profile (
    rule_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_account(user_id) ON DELETE CASCADE,
    fund_code VARCHAR(6) NOT NULL,
    tier VARCHAR(16) NOT NULL CHECK (tier IN ('CONSERVATIVE','BALANCED','LOOSE','CUSTOM')),
    take_profit_pct NUMERIC(10,4),
    reduce_drawdown_pct NUMERIC(10,4),
    rule_params JSONB NOT NULL,
    source_draft_id UUID REFERENCES holding_rule_draft(draft_id),
    rule_version VARCHAR(60) NOT NULL,
    status VARCHAR(16) NOT NULL CHECK (status IN ('ACTIVE','REVOKED')),
    confirmed_at TIMESTAMPTZ NOT NULL,
    superseded_at TIMESTAMPTZ
);
-- 同一用户同一基金最多一条 ACTIVE；新确认使旧规则置 superseded，不删除历史。
CREATE UNIQUE INDEX uq_holding_rule_active ON holding_rule_profile(user_id,fund_code) WHERE status='ACTIVE';
CREATE INDEX ix_holding_diagnosis_history ON holding_diagnosis_report(user_id,fund_code,report_date DESC,generated_at DESC);

-- 报告与草案不可改写，纪律与 V14 相同：
CREATE FUNCTION reject_holding_archive_rewrite() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Archived holding diagnosis and drafts cannot be rewritten'; END; $$;
CREATE TRIGGER holding_diagnosis_immutable BEFORE UPDATE ON holding_diagnosis_report
    FOR EACH ROW EXECUTE FUNCTION reject_holding_archive_rewrite();
CREATE TRIGGER holding_rule_draft_immutable BEFORE UPDATE ON holding_rule_draft
    FOR EACH ROW EXECUTE FUNCTION reject_holding_archive_rewrite();
-- holding_rule_profile 允许状态流转（ACTIVE→superseded/REVOKED），阈值与档位字段不随状态更新改动；
-- 全部新表新列补中文注释，沿用 V13/V14 的逐列注释检查方式。
```

诊断报告与 V2 建议报告的衔接：`portfolio_advice_report.snapshot` 的 V2 版本记录当时引用的诊断 report_id 与生效规则 rule_id + rule_version；同日同输入沿用既有 fingerprint 幂等，输入或状态变化追加版本，不覆盖。V14 的 `decision` CHECK 只含 `HOLD/SELL/UNAVAILABLE`，V18 须扩展为含 `WATCH/REDUCE`；该表有不可覆盖触发器但 DDL 变更不受影响，历史 V1 行不改动。回看样本 `sample_key` 的 V2 构成 = 基金 + 诊断指纹 + 生效规则版本 + 数据截止日；不同规则版本不混算。

代码落点（按既有结构，类名实施时最终确认）：

- Java `com.fundradar.core.advice` 包内新增诊断与规则的 Service / Repository / Controller；`AdvicePolicy` 新增 V2 构建方法而不是修改 V1 方法，V1 版本常量与历史行为保持原样；`AdviceTypes.Snapshot` 增加 V2 字段（诊断报告标识、规则标识与版本、规则触发明细），旧字段保留以兼容 V1 快照回读。
- Python 侧扩展 `app/services/portfolio_advice.py` 与同名路由文件；诊断事实与草案统计是读取即算，不需要 fund_ai 新表、不需要 alembic 迁移；草案统计结果按「基金 + 净值水位」做进程内或短时效缓存以避免每日全历史重算，缓存不得携带任何用户身份。若实施时发现必须落库缓存，另走 alembic 迁移评审。

## 接口契约

浏览器 → Java（`/api/v1`，统一会话 + Origin + CSRF，写操作服务端取 userId）：

| 方法与路径 | 权限 | 说明 |
| --- | --- | --- |
| `GET /sim-portfolios/current/diagnosis` | PORTFOLIO_SELF_READ | 本人各持仓基金最新诊断摘要，批量读取 |
| `GET /sim-portfolios/current/diagnosis/{fundCode}` | PORTFOLIO_SELF_READ | 单基金诊断分页历史与报告详情 |
| `GET /sim-portfolios/current/rule-drafts/{fundCode}` | PORTFOLIO_SELF_READ | 当前草案（含三档阈值与触发统计）及数据不足原因 |
| `POST /sim-portfolios/current/rule-drafts/{fundCode}/generate` | SIM_PORTFOLIO_SELF_WRITE | 重新生成草案；统计未变幂等，不覆盖已确认规则 |
| `GET /sim-portfolios/current/rules/{fundCode}` | PORTFOLIO_SELF_READ | 当前生效规则及确认历史 |
| `POST /sim-portfolios/current/rules/{fundCode}/confirm` | SIM_PORTFOLIO_SELF_WRITE | 显式确认所选档位或微调值；确认前规则不参与建议 |
| `POST /sim-portfolios/current/rules/{fundCode}/revoke` | SIM_PORTFOLIO_SELF_WRITE | 撤销本人规则；撤销留痕，建议随之降级 |

建议既有四个接口不变；`ruleVersion` 参数扩展接受 `HOLDING_ADVICE_V2`，历史接口默认仍读 V1，前端明确传版本，两版不混算。

响应要点：诊断详情响应含逐项 items 数组（项目键、结论、证据、来源、数据截至日）；草案响应含 `statsCutoffDate`、样本量与三档 tiers，数据不足时返回明确状态与缺失原因而不返回阈值数字；规则确认接口幂等（重复确认同一参数不生成新版本），确认响应返回当前生效规则全文。所有接口响应 `Cache-Control: private, no-store`，与现有建议接口一致。错误码沿用既有风格：跨用户访问统一 404/403 不暴露他人数据存在性，参数非法 400，Python 来源暂不可用时对应功能降级并在页面标明，不返回伪造空结论。

Java → Python（`/internal/v1`，仅 X-Service-Token，全部只读、不含用户身份）：

| 路径 | 说明 |
| --- | --- |
| `GET /portfolio-advice/{fundCode}/diagnosis-facts?asOfDate=` | 公共诊断事实：经理任职、规模变化、同类比较、当前回撤、费用与分红事件及各自数据截至日 |
| `GET /portfolio-advice/{fundCode}/draft-stats` | 草案统计：回撤/收益分布分位、修复天数、最差 20 日损失、波动率同类分位、样本量与截止日；历史不足返回明确状态码而非数值 |
| `GET /portfolio-advice/{fundCode}/outcome?startDate=&endDate=` | 既有 20 交易日回报核验，V2 沿用 |

## 后台任务

复用 `AdviceScheduler`，不新建调度器：同一 `pg_try_advisory_lock(721106,1)` 批次内依次执行「诊断生成 → 草案刷新 → V2 建议留档 → 到期核验」，保持每 30 分钟、北京时间 08:30 起、网页关闭仍运行、停机不补造历史的既有语义；`sim_job_state` 任务名沿用 `portfolio-advice`，阶段失败分别计数，单基金失败不影响其他基金留档。

草案生成时机：持仓份额首次确认后生成一次；之后仅在草案统计指纹变化（净值历史推进或同类样本变化）时刷新，未确认的草案刷新不影响已确认规则。诊断每日生成；同日同输入幂等，事实变化追加版本。

失败语义沿用既有纪律：诊断事实接口失败 → 该基金当日诊断记 `INSUFFICIENT` 并写明来源失败原因，不补造数据；草案统计失败 → 保留旧草案与已确认规则不变；单基金异常计入 failures 并使任务状态为 `PARTIAL`，已保存报告保留。清仓后停止生成新诊断与新建议，但既有报告的到期核验不依赖当前持仓，继续执行（与现有调度器行为一致）。

手动路径与后台共用同一留档逻辑：`POST .../advice/{fundCode}/generate` 触发时先确保当日诊断与草案已存在（缺失则现场生成），再生成建议；与调度批次并发时由同日幂等唯一键去重，不产生重复报告。

## 前端呈现

- 持仓卡片：沿用 `PortfolioAdviceCard`，展示 V2 建议标签、诊断总体结论和规则触发摘要；`src/api/advice.ts` 当前硬编码 `ruleVersion: 'HOLDING_ADVICE_V1'`，须改为显式传入版本并支持 V2 类型。
- 入口导航：持仓卡片「查看完整依据」进入持仓分析页，页内分区为最新建议、诊断详情、规则草案、历史记录、效果回看；无已确认份额时不显示草案确认入口，只显示原因。
- 诊断详情区块：逐项列出结论、证据、来源与数据截至日；`INSUFFICIENT` 项显示具体缺失原因，不得折叠成「一切正常」。
- 规则草案确认区块：三档卡片各展示阈值与三条历史统计，默认不选中任何档；用户显式选择或微调后才出现确认按钮，确认文案写明「规则由本人确认后生效，可随时撤销」。微调交互只提供 ±20% 范围内的步进调整，不提供自由输入；已确认规则展示来源草案的统计截止日，草案刷新后以「统计已更新」徽标提示，但不自动替换已确认阈值。
- 降级：规则未确认时建议最高只到「观察」，页面显示「尚未确认规则，不提供减仓线触发判断」；数据不足显示具体原因，不默认继续持有；模型辅助栏固定标注「实验分数，不是已验证的上涨概率」。
- 代码落点：`src/types/advice.ts` 扩展决策枚举与诊断/草案/规则类型；`src/utils/advice.ts` 的 `adviceLabel` 增加 `WATCH`/`REDUCE` 中文标签；`PortfolioAdvicePage.vue` 以既有 `usePageNavigation` 分区方式新增 `diagnosis` 与 `rules` 两个区块，不改变历史记录与效果回看的既有路由参数。
- 全部展示文案遵循需求第 1.3 节：不出现确定性涨跌措辞；页面页脚保留「分析提示，不构成投资建议，是否操作由本人决定」的固定说明。

## 风险检查（七维）

1. **数据口径与新鲜度**：净值业务日不等于自然日且 `ann_date` 滞后；诊断与草案必须带数据截至日，页面显著标示陈旧。同类比较是受控当前市场样本，禁止表述为全市场同类平均。
2. **统计稳定性**：短历史基金的回撤分位不稳定；< 500 交易日一律输出数据不足而不给阈值。货币基金、QDII 不适用，先显式标注而不混口径。
3. **规则边界与用户控制**：未经确认的草案只是参考数字，不得进入建议依据链；系统不得从行为推断补写规则（需求第 21.3 节）；撤销后建议立即降级并留痕。
4. **用户隔离与权限**：诊断、草案、规则全部本人隔离，跨用户访问拒绝；Python 接口不含 user_id；共享缓存不得混入个人规则或诊断状态。
5. **幂等与留档**：同日幂等键、不可覆盖触发器、输入变化追加版本三条纪律在新表逐一落实；停机期间不伪造历史报告。
6. **模型误读**：辅助栏的实验分数必须与主结论视觉分离并带固定防误读标注；模型不可用不阻断事实+规则结论，也不得反向被当作建议依据。初版实验模型仅支持部分基金（001632、006730、008888），其余基金辅助栏标「不可用」，不得因此把建议降级为数据不足。
7. **性能与并发**：诊断/草案批量处理沿用咨询锁与分批读取；同类比较、草案统计按基金缓存，失败降级为单项 `INSUFFICIENT`，不拖垮整批。草案统计的全历史重算要控制频率，避免每 30 分钟批次对全部持仓基金重复扫描 `nav_daily`。

## 验收标准

- 诊断七项各自的 `VALID / CHANGED / INSUFFICIENT` 分支可复算，来源与数据截至日齐全；首份报告无基线项如实记 `INSUFFICIENT`。
- 草案三档阈值与触发统计能用同一来源净值历史确定性复算；历史不足、货币基金、QDII 分支行为正确。
- 规则未确认时任何报告不出现减仓结论；确认后建议正文引用具体规则版本与阈值；撤销即时生效且历史留痕。
- V2 报告同日幂等、输入变化追加版本、原文不可覆盖（触发器拒绝 UPDATE）；V1 历史报告与核验结果不变；诊断报告与草案回读时校验 content_hash，发现篡改即拒绝展示并报错。
- 跨用户读取诊断、草案、规则、建议均被拒绝；Python 内部接口拒绝无服务令牌访问。
- 建议正文不出现确定性措辞；每条 V2 建议含触发条件、反对依据、失效条件、数据截至时间；模型分数仅在辅助栏。
- 回看口径：V2 的 `HOLD/REDUCE` 样本沿用 20 交易日现金分红再投核验，`REDUCE` 方向相反（负回报支持减仓）；`WATCH/UNAVAILABLE` 只留档不计入支持/不支持统计，与沿用、无建议记录一样另列；两版规则不混算。
- 观察起点沿用既有口径：建议实际生成后首个可按 15:00 截止规则操作的交易日，终点为之后第 20 个交易日，不把生成前的涨跌计入建议效果。
- 测试使用独立临时用户并回滚或定向清理，真实服务验收与测试替身结果分开记录。
- 后台调度：两个批次（锁占用冲突）不重复写入；单基金失败记 `PARTIAL` 且其他基金报告完整保留；停机跨越的日期不补造。
- 首次回填：存量持仓基金各有基线报告，无基线项如实 `INSUFFICIENT`；规则全部处于未确认状态，无任何自动确认。
- 工程基线：Java 测试与真实 PostgreSQL 回滚集成测试通过；Python 相关测试通过；前端类型检查、lint、构建与契约测试通过；真实浏览器走通诊断、草案确认、V2 建议与回看四个页面状态。

## 分阶段实施清单（进度记录处）

**标记约定**：每完成一步，把 `- [ ]` 改成 `- [x]` 并在行尾注明完成日期与验收出处（如「2026-09-20，Java 测试 X 项通过」）。**不要跳步**；某一步卡住时保持 `[ ]` 并在下方「实施验收记录」写明阻塞原因。下次继续时从第一个 `[ ]` 开始。

### 阶段 1：诊断事实（不依赖新数据源，全部读 fund_ai 已落库表）

- [x] 1.1 Python 诊断事实计算：扩展 `app/services/portfolio_advice.py`，实现七项诊断项的事实采集与判定（经理/规模/同类排名/基准/回撤/费用/分红），历史不足返回明确状态码（2026-09-17，pytest 28 项通过）
- [x] 1.2 Python 路由：`GET /internal/v1/portfolio-advice/{fundCode}/diagnosis-facts?asOfDate=`，服务令牌鉴权、只读、不含 user_id（2026-09-17）
- [x] 1.3 Python 测试：七项各自的 VALID / CHANGED / INSUFFICIENT 分支、来源失败降级、响应契约（2026-09-17，`tests/test_portfolio_advice_diagnosis.py` 28 项通过，相关回归 39 项通过）
- [x] 1.4 Java Flyway V16：创建 `holding_diagnosis_report`（含同日幂等唯一键、不可改写触发器、中文列注释），本地 `fund_core` 应用成功（2026-09-17，`V16__create_holding_diagnosis_report.sql`）
- [x] 1.5 Java 诊断 Service / Repository / Controller：`GET /sim-portfolios/current/diagnosis` 与 `.../diagnosis/{fundCode}`，本人归属校验，响应含逐项 items 与数据截至日（2026-09-17）
- [x] 1.6 Java 调度接入：`AdviceScheduler` 同一锁批次内增加「诊断生成」步骤，单基金失败记 PARTIAL 不影响其他基金（2026-09-17）
- [x] 1.7 Java 测试：同日幂等、跨用户拒绝、留档不可覆盖、content_hash 校验、来源失败记 INSUFFICIENT（真实 PostgreSQL 回滚集成测试）（2026-09-17，全量 123 项测试 0 失败）
- [x] 1.8 前端：`src/types` + `src/api` 新增诊断类型与接口；持仓分析页新增「诊断详情」区块，INSUFFICIENT 项显示具体缺失原因（2026-09-17，npm run type-check / lint / build 通过，scripts 契约测试 80 项通过含新增 diagnosis-contract 5 项）
- [x] 1.9 首次回填：对全部存量持仓基金各生成一份基线诊断报告，无基线项如实记 INSUFFICIENT（2026-09-17，调度批次真实执行 checked=23 / failures=0，库内 23 份基线报告：20 INSUFFICIENT、3 CHANGED）
- [ ] 1.10 阶段验收：真实浏览器走通诊断区块；本阶段验收结果记入下方「实施验收记录」（接口与库级验收已于 2026-09-17 完成，浏览器走通待用户登录确认）

### 阶段 2：规则草案与确认（依赖阶段 1 的诊断基线）

- [ ] 2.1 Python 草案统计：滚动 63 日窗口 DD / R / L20 分布、修复天数、波动率同类分位；< 500 交易日、货币基金、QDII 返回明确「不适用/数据不足」状态；按基金+净值水位短时效缓存
- [ ] 2.2 Python 路由：`GET /internal/v1/portfolio-advice/{fundCode}/draft-stats`，只读、无用户身份
- [ ] 2.3 Python 测试：分位复算一致性、历史不足与特殊类别分支、缓存不携带用户身份
- [ ] 2.4 Java Flyway V17：创建 `holding_rule_draft`、`holding_rule_profile`（含唯一 ACTIVE 部分索引、不可改写触发器、中文列注释）
- [ ] 2.5 Java 规则接口：草案查询 / 重新生成 / 规则确认 / 撤销四个端点，确认幂等、撤销留痕、微调限 ±20% 记 CUSTOM
- [ ] 2.6 Java 调度接入：锁批次内增加「草案刷新」（仅统计指纹变化时），未确认草案刷新不影响已确认规则
- [ ] 2.7 Java 测试：确认/撤销生命周期、重复确认不生成新版本、统计未变不重复生成草案、跨用户拒绝
- [ ] 2.8 前端：「规则草案确认」区块——三档卡片含触发统计、默认不选中、微调仅步进、确认文案含「本人确认后生效，可随时撤销」
- [ ] 2.9 阶段验收：真实浏览器走通草案查看→确认→撤销全流程；规则未确认时页面显示「尚未确认规则」；结果记入「实施验收记录」

### 阶段 3：建议 V2 升级（依赖阶段 1、2）

- [ ] 3.1 Java Flyway V18：`portfolio_advice_report.decision` CHECK 扩展为含 `WATCH/REDUCE`；历史 V1 行不改动
- [ ] 3.2 Java `AdvicePolicy` 新增 V2 构建方法：UNAVAILABLE / REDUCE / WATCH / HOLD 映射逻辑与失效条件；V1 方法原样保留
- [ ] 3.3 Java 快照扩展：`AdviceTypes.Snapshot` 记录诊断 report_id、生效规则 rule_id + rule_version、规则触发明细；旧字段保留兼容 V1 回读
- [ ] 3.4 Java 调度接入：锁批次内追加「V2 建议留档」；V1 停止新生成，历史接口与到期核验保留
- [ ] 3.5 Java 测试：枚举映射全分支、依据链 SUPPORT/AGAINST/CONTEXT 构成、模型不可用时辅助栏标「不可用」且不降级建议、V1/V2 不混算
- [ ] 3.6 前端：`src/api/advice.ts` 去除硬编码 V1，显式传版本；`adviceLabel` 增加 WATCH/REDUCE 标签；模型辅助栏固定防误读标注
- [ ] 3.7 阶段验收：每条 V2 建议含触发条件/反对依据/失效条件/数据截至时间；无确定性措辞；结果记入「实施验收记录」

### 阶段 4：回看扩展（依赖阶段 3）

- [ ] 4.1 Java 回看口径：V2 样本键 = 基金 + 诊断指纹 + 生效规则版本 + 数据截止日；`REDUCE` 方向相反（负回报支持减仓）；`WATCH/UNAVAILABLE` 只留档不计入统计
- [ ] 4.2 Java 测试：样本键去重、方向映射、沿用与无建议记录另列、两版规则不混算
- [ ] 4.3 前端：效果回看区块展示 V2 统计（独立样本数/已核验/支持/不支持/持平/待核验）
- [ ] 4.4 阶段验收：到期核验由后台真实产生；不以未到期样本宣称效果；结果记入「实施验收记录」

### 当前进度速览

| 阶段 | 状态 | 完成日期 |
| --- | --- | --- |
| 阶段 1 诊断事实 | 🔶 1.1–1.9 完成，1.10 浏览器验收待确认 | — |
| 阶段 2 规则草案与确认 | ⬜ 未开始 | — |
| 阶段 3 建议 V2 升级 | ⬜ 未开始 | — |
| 阶段 4 回看扩展 | ⬜ 未开始 | — |

（阶段全部步骤 `[x]` 后，将对应行改为 ✅ 并填完成日期；同时在 `docs_zhx/implementation/fund-radar.md` 总进度看板登记。）

## 实施验收记录

### 2026-09-17 阶段 1 实施验收（步骤 1.1–1.9 完成，1.10 浏览器走通待确认）

- **Python 侧**：`app/services/portfolio_advice.py` 新增诊断事实计算与 `GET /internal/v1/portfolio-advice/{fund_code}/diagnosis-facts` 路由；`tests/test_portfolio_advice_diagnosis.py` 29 项通过（另 1 项真实 PG 边界用例默认跳过，显式启用后通过）；相关回归 40 项通过；ruff 无新增错误。真实服务实测 006730/001632/008888 均返回 200、结构完整。
- **联调修复**：首次真实调用暴露 `DetachedInstanceError`（ORM 对象带出 session 边界），已改为纯数据投影并补两条回归测试（含一条真实 PG 用例）。此问题桩测试未覆盖，真实联调才发现。
- **Java 侧**：Flyway `V16__create_holding_diagnosis_report.sql` 已在本地 `fund_core` 应用；新增 DiagnosisClient/Policy/Service/Repository/Controller；AdviceScheduler 同一锁批次内先诊断后建议，单基金失败记 PARTIAL；全量 `mvn test` 123 项 0 失败（真实 PostgreSQL 回滚集成测试）。
- **前端**：诊断类型/API/文案工具 + 持仓卡片诊断徽标 + 持仓分析页「诊断详情」区块；type-check / lint / build 通过；契约测试新增 5 项，`node --test scripts/*.test.mjs` 80/80 全过。
- **首次回填**：2026-09-17 19:16 调度批次真实执行，`checked=23, failures=0`；库内 23 只持仓基金各一份基线报告（20 INSUFFICIENT、3 CHANGED），无基线项如实标记，未伪造「全部成立」。
- **已知限制**：① `fund_share_class.benchmark_code` 未登记的基金基准项如实 INSUFFICIENT（数据缺口，待登记）；② 历史报告逐项明细仅有最新报告可查，历史行只展示摘要元数据（如需历史明细需后端补端点）；③ 前端陈旧标示阈值自定 7 天；④ 浏览器走通（1.10）待用户登录页面确认。

### 待填写

（后续阶段的验收记录追加在本节，参照 portfolio-advice-history.md 的格式：测试通过数、迁移应用情况、真实服务验收范围、已知限制与尚未走满观察期的声明。）
