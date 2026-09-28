# 002112 缺口补证接手记录（2026-09-27）

## 现在补到了什么

**报告原文缺口已补上，完整候选输入由 750 条增至 830 条；现在仍不能进入训练。** 剩下的是能把正文、单位净值与当时公开版本绑定的证据，不是再跑一次解析或把资格字段改成通过。

本次从东方红官网和巨潮取得 18 份报告 PDF：16 份用于核对原清单中的旧资料，2 份是此前缺失的报告。16 份副本与旧解析的基金身份、报告期、持仓、资产和行业表逐字段一致。原 24 份清单现在全部有可核对的原始 PDF，原 18 份重点报告均有官网或巨潮原件；另加 2 份后共 26 份资料。

新补的两份均为东方红新动力、适用于 C 类 017493：

| 报告 | 公开日期（保持原值） | 原文与核对结果 |
|---|---|---|
| 2023 年中期报告 | 2023-08-31 | 官网原件 55 页、61 条股票持仓；Pypdf 与 PDFium 两种提取结果一致 |
| 2023 年第三季度报告 | 2023-10-25 | 官网原件 12 页、10 条股票持仓；两种提取结果一致 |

来源：[官网中期报告](https://www.dfham.com/upload/pdf/1693440076515-dfhxdllhpzhhxzqtzjj2023nzqbg.pdf)、[官网三季报](https://www.dfham.com/upload/pdf/1698191776194-dfhxdllhpzhhxzqtzjj2023nd3jdbg.pdf)。附件从[基金产品公告页](https://www.dfham.com/product/jijin/hunhe/piangu/000480/notice/index.html#wrap-body-all)的“定期公告”取得，保留了页面观察记录、下载回执、原文字节摘要与解析结果。官网文件部分有 PDF 结构警告，两份新报告另经 PDFium 全字段复核，并查看了持仓页，结果一致。

此前因这两份报告缺失而排除的 80 个目标日，现均可按原公式形成完整 20 项输入。只在原 2021—2023 范围核了答案，新增 38 条上涨、42 条下跌、0 条持平；没有改动三类定义。其中 20 天满足原第三个截止点，另外 60 天不属于前三个截止点的合格时间范围。

| 参考基金 | 截止 2023-04-01 | 截止 2023-07-01 | 截止 2023-10-01 |
|---|---:|---:|---:|
| 017493 | 15 | 74 | 140（原为 120） |
| 160323 | 445 | 504 | 570 |

**上表仍是完整输入与时间条件计数，不是训练准入通过数。** 没有重复折权重统计。原 750 条候选及原实验实际使用的 112 条参考记录保持原样。

## 还缺什么，为什么停止

1. **净值历史版本：979 个去重日期。** 017493 为 262 个、160323 为 717 个，涉及全部 830 条候选的历史窗口和标签两端。当前数据库的数值、公告日期及来源摘要均与冻结快照一致；这说明当前值一致，尚不能证明它们与历史截止点当时公开的版本一致。`nav-version-gap-worklist.json` 已逐日列出基金、日期、单位净值、公告日、摘要和依赖的目标日。
2. **报告历史版本绑定。** 26 份正文和身份已齐，重点 18 份的原件来源已补强，但尚未取得能绑定同一正文的历史公开副本或来源版本／更正记录。官网页面日期、PDF 制作时间和当前多处副本一致，均作为佐证保存，没有单独据此放行。具体文件、摘要和待补证据见 `report-version-gap-worklist.json`。
3. **公开存档查询未取到证据。** 证监会电子披露入口连接失败；两个有界历史存档查询超时。另有两个 PDF 地址返回脚本验证页，已按“不是报告原文”处理，随后从官网正常公告入口取得了原件。未绕过验证或调用付费接口。失败只说明本次未能获取，不能据此断言历史版本不存在。

现有 `direction_1d_source_version` 无两基金对应历史净值版本；本次补查 `historical_nav_sample_batch` 的 2021—2023 元数据也没有对应批次。后续可接受来源提供的有日期版本／更正记录，或可核对的历史公开副本，**不要求证明本系统当年下载过**。不能用现在写入一份版本记录来伪造过去已知。

以下排除仍应保留，不应靠填值“补齐”：017493 缺自身净值的 466 天、连续历史窗口不足的 61 天；160323 缺基准／目标净值的 1 天、历史窗口不足的 71 天、正权重持仓缺行情的 25 天。停牌行情不补零，不沿用旧行情；缺最新报告不退回旧报告；未知公开日期不提前。

当前决定保存在 `decision.json`：资料历史版本未准入、实际拟合预算为 0，所以停止在独立资料准备阶段。**本次新增真实拟合 0 次，累计仍为 52 次（6＋28＋5＋13）**。旧第三轮 161 天检查未通过、L20／T20 各对 85 天的结论不变，未执行该轮 2024 阶段。

## 独立准备与验证

本次新增独立脚本，不修改或覆盖旧研究代码和协议：

- `C:\pythonProject\workSpace06\scripts\fund_002112_gap_evidence.py`：有界下载回执、原文核对、只重查缺报告的 80 天。命令行只有 `freeze`、`reports`、`coverage`，没有训练入口；离线重放不联网。
- `C:\pythonProject\workSpace06\scripts\fund_002112_gap_evidence_verify.py`：另算新增标签与截止时点，核旧 112 条记录、979 个净值依赖、26 份报告映射、旧拟合账本，并更新待准入的候选身份清单。
- `C:\pythonProject\workSpace06\tests\test_fund_002112_gap_evidence.py`：14 项新增边界测试，覆盖失败请求计数、禁止重定向、脚本验证页、文件篡改、报告范围、公开日期、预算和自行声明资格等情况。

与既有 51 项相关测试合计 **65 项通过**，Ruff 检查通过。18 份报告最终重放一致；80 条新增输入重放一致；独立重算 80 条标签通过。原 24 份均核到了匹配的原始 PDF，16 份新取得的旧报告副本无业务字段差异。113,241 个旧研究文件摘要全部一致。三个仓库原有未提交、未跟踪文件和 HEAD 由 `protection-before.json`／`protection-after.json` 核对；本次只新增代码、测试、文档和独立结果目录。

独立方案仍只检验“补回参考资料是否改善原 L20”。新 `independent-preparation.json` 只增加本次 80 条候选身份及来源绑定，保持原日期、11 只基金名单、考核日期、三类定义、门槛、参数、特征和权重规则。最多 12 次（含复现）仍是待执行建议，未预留拟合、未获得新增预算，不能挪用旧第三轮余额。

未读取 2025 封存标签、未使用 2026 回算标签、未补写历史 input-only 预测方向。新闻仍是原 12 份样例，没有新增新闻抓取、外部大模型调用或训练。本次无付费请求、无数据库写入、无服务启停、无提交推送、无旧 `train_registered()` 调用。必要入库和合格模型实际使用的既有授权继续有效；本次资料未准入，未采用候选。

## 接手路径与可重放命令

最新结果目录：

`C:\pythonProject\workSpace06\.local-runs\fund-exposure-002112\peer-gap-evidence\20260927-v1`

优先读取：`decision.json`、`report-supplements-v2.json`、`report-gap-recovery-summary.json`、`nav-version-gap-worklist.json`、`report-version-gap-worklist.json`、`independent-preparation.json`、`independent-audit.json`、`validation.json`、`protection-after.json`、`delivery-manifest.json`。旧 `peer-admission`、`peer-fold-impact` 和三轮实验目录全部保留。

在 `C:\pythonProject\workSpace06` 执行以下命令，只重放本次资料检查，不训练：

```powershell
.\.venv\Scripts\python.exe -X utf8 -B -m scripts.fund_002112_gap_evidence reports
.\.venv\Scripts\python.exe -X utf8 -B -m scripts.fund_002112_gap_evidence coverage
.\.venv\Scripts\python.exe -X utf8 -B -m scripts.fund_002112_gap_evidence_verify
.\.venv\Scripts\python.exe -X utf8 -B -m pytest -q -p no:cacheprovider tests/test_fund_002112_gap_evidence.py tests/test_fund_002112_peer_admission.py tests/test_fund_002112_peer_gap_materials.py tests/test_fund_report_sections_v2.py
```

下一次应沿逐项清单补历史公开版本证据，另存新版本后再决定资料准入；不能只改布尔字段。所有证据补齐后，仍须遵守实际拟合预算和原先冻结的实验门槛。
