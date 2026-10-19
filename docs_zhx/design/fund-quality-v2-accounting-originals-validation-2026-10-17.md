# 基金质量V2财务原件基础事实接入与验证

生成：2026-10-17T09:25:42.270129+08:00；本批输入冻结：2026-10-17T09:13:15.354092+08:00。

**V2尚未达到正式可用验收条件，原正式评分保留。新增账面事实不等于已补齐质量指标、完整校准或独立方法验收。**

## 已实施

编译器QUALITY_ORIGINALS_20261017_37新增财务基础读取器，正式报告直转和旧完整包补读均纳入可重建的parsed_facts。读取原始解码页，不依赖国内股票表8.3，也不改写财务金额或股票章号。资产负债表要求唯一有效正文、当期日期、人民币元单位和明确的两列表头；同时支持PDF常见的按列抽取和完整转载常见的按行抽取。比较期不能充当当期。
读取货币资金、总资产、净资产、负债合计；年度货币资金附注还能读取活期合计、本金及应计利息。仅有明示数字才形成观察，当前横杠保持未赋值；无明确数值时不由资产恒等式推填余额。显式数值发生矛盾即拒收整组，不取其中较好的一列。

财务观察只补充原件链：没有替代cash_target_deviation或capacity_pressure，没有把账面货币资金当作可动用现金或五日真实变现能力，也没有增设计分项、重分配权重或读取旧分项分数。

## 真实结果及独立核对

- 49条当前输入补出172项账面观察；24条历史输入补出126项；4个开发产品的8份真实年报补出56项。三组共354项，按主代码、经济日期和字段去重后350项，无冲突；这些计数均不是独立产品数量。
- 4个开发产品8份年报的56项金额由另一个原文行/表头读取脚本逐项核对，日期、币种、金额与主包一致；不调用生产财务读取器。000041第一方PDF的7项金额还桥接复用既有独立PDF坐标核验，原件摘要和数值相同。
- 上述独立核对覆盖56项开发年报观察及那一份PDF表示；未把其他当前/历史观察声称为已全部独立复核。其他组先经过原件重建、明示列序和会计恒等式检查。
- 首次原文直转只识别按列抽取，8份转载返回精确缺口；修正按行表头后重建全部8份。独立读取的第一次因表头行含资产/项目标签而拒收，也保留原脚本及失败记录，后续修正后56项全部通过。未删除失败或把它们写成第一次就成功。
- 457项相关工程回归和Ruff通过。当前237个、历史83个计分原始字段的值、单位、日期与来源绑定全部保留，15个旧完整来源包相同。41份核心源码冻结。
- 73个真实部分输入包、三个考察月全包重建后的四类准入仍NOT_READY；完整校准/验证产品仍为0，没有锚点、总分或等级。没有用账面观察凑出总分或宣称新权重已被接受。
- 原正式结果于2026-10-17T09:18:34.533327+08:00只读回查49条，摘要与前批一致，正式日期仍为2026-09-30。历史表仅观察数量{"fund_rating_batch": 130, "fund_rating_current": 15, "fund_rating_result": 584}；未改当前指针、旧批次、正式API或00:30任务。

## 尚未解析与范围限制

当前43份可读财务表均取得4个主表字段；其资金附注常只给当期一列，而年报通常给当期/比较期两列。当前读取器对该单列明细保持缺口，未将它当作缺少原件。002112原文明确给出本金1,244,712,929.30元、应计利息122,814.77元；下一步须在核实单列日期、列序和坏账准备项后再接入，不能靠缺比较列推零。
历史24份输入中18份取得7项，其他6份有章号/表头/列序等真实缺口。模块unknowns_not_assigned描述本读取模块未评估的可用性事项，不是对每个原件‘未披露’的断言；原件可能已有数值，仍需专门解析和范围核验。
000041证券受限附注的若干项明确写无，但流动性声明只覆盖所投资证券；银行存款及其他非证券资产的完整受限范围仍需核对。没有把证券表的零扩成全资产受限比例零。000042/000176持有人表的断列与横杠也仍需坐标/语义证据，未用净额差推造两个未知余额。
现金合理目标、经证据支持的策略容量边界、全期治理及足够独立完整产品仍缺。资料再多也不能把合同复合现金篮子、同类分位数、募集限额或机械含HHI的成交负荷直接改名为理想现金目标/策略容量。现存真实成交额及完整股票表可用于进一步研究，但须先证明与既有集中度的重复贡献和风险测量范围，不能因更易算就替代目标。

## 逐基金财务读取状态

| 组别 | 基金 | 考察日 | 账面观察数 | 待解析原因 |
| --- | --- | --- | ---: | --- |
| current | 001021 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 001632 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 002112 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 002170 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 004237 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 004605 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 005187 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 005284 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 005312 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 006038 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 006476 | 2026-09-30 | 0 | ACCOUNTING_BALANCE_DATE_CNY_UNIT_OR_UNIQUE_BODY_UNVERIFIED |
| current | 006730 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 007045 | 2026-09-30 | 0 | ACCOUNTING_BALANCE_DATE_CNY_UNIT_OR_UNIQUE_BODY_UNVERIFIED |
| current | 007356 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 007509 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 007832 | 2026-09-30 | 0 | ACCOUNTING_BALANCE_DATE_CNY_UNIT_OR_UNIQUE_BODY_UNVERIFIED |
| current | 007950 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 008164 | 2026-09-30 | 0 | ACCOUNTING_BALANCE_DATE_CNY_UNIT_OR_UNIQUE_BODY_UNVERIFIED |
| current | 008603 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 008764 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 008888 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 008960 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 010710 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 010737 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 011036 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 011066 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 011103 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 012835 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 012836 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 013180 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 013275 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 013330 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 013472 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 013853 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 014156 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 014978 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 015596 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 016008 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 017145 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 017493 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 017960 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 018125 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 018156 | 2026-09-30 | 0 | ACCOUNTING_BALANCE_DATE_CNY_UNIT_OR_UNIQUE_BODY_UNVERIFIED |
| current | 018590 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 018853 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 019449 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 021740 | 2026-09-30 | 0 | ACCOUNTING_BALANCE_DATE_CNY_UNIT_OR_UNIQUE_BODY_UNVERIFIED |
| current | 160119 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| current | 160323 | 2026-09-30 | 4 | ACCOUNTING_CASH_NOTE_DATE_UNIT_OR_BODY_UNVERIFIED |
| historical | 002112 | 2025-04-30 | 7 | 本版支持的七项已读；其他可用性未评估 |
| historical | 002170 | 2025-04-30 | 7 | 本版支持的七项已读；其他可用性未评估 |
| historical | 004605 | 2025-04-30 | 0 | ACCOUNTING_BALANCE_DATE_CNY_UNIT_OR_UNIQUE_BODY_UNVERIFIED |
| historical | 005312 | 2025-04-30 | 7 | 本版支持的七项已读；其他可用性未评估 |
| historical | 006730 | 2025-04-30 | 7 | 本版支持的七项已读；其他可用性未评估 |
| historical | 012835 | 2025-04-30 | 7 | 本版支持的七项已读；其他可用性未评估 |
| historical | 013275 | 2025-04-30 | 0 | ACCOUNTING_BALANCE_DATE_CNY_UNIT_OR_UNIQUE_BODY_UNVERIFIED |
| historical | 013330 | 2025-04-30 | 0 | ACCOUNTING_BALANCE_DATE_CNY_UNIT_OR_UNIQUE_BODY_UNVERIFIED |
| historical | 017145 | 2025-04-30 | 7 | 本版支持的七项已读；其他可用性未评估 |
| historical | 017960 | 2025-04-30 | 7 | 本版支持的七项已读；其他可用性未评估 |
| historical | 018125 | 2025-04-30 | 7 | 本版支持的七项已读；其他可用性未评估 |
| historical | 018590 | 2025-04-30 | 7 | 本版支持的七项已读；其他可用性未评估 |
| historical | 002112 | 2026-04-30 | 7 | 本版支持的七项已读；其他可用性未评估 |
| historical | 002170 | 2026-04-30 | 7 | 本版支持的七项已读；其他可用性未评估 |
| historical | 004605 | 2026-04-30 | 0 | ACCOUNTING_BALANCE_DATE_CNY_UNIT_OR_UNIQUE_BODY_UNVERIFIED |
| historical | 005312 | 2026-04-30 | 7 | 本版支持的七项已读；其他可用性未评估 |
| historical | 006730 | 2026-04-30 | 7 | 本版支持的七项已读；其他可用性未评估 |
| historical | 012835 | 2026-04-30 | 7 | 本版支持的七项已读；其他可用性未评估 |
| historical | 013275 | 2026-04-30 | 0 | ACCOUNTING_BALANCE_DATE_CNY_UNIT_OR_UNIQUE_BODY_UNVERIFIED |
| historical | 013330 | 2026-04-30 | 0 | ACCOUNTING_BALANCE_DATE_CNY_UNIT_OR_UNIQUE_BODY_UNVERIFIED |
| historical | 017145 | 2026-04-30 | 7 | 本版支持的七项已读；其他可用性未评估 |
| historical | 017960 | 2026-04-30 | 7 | 本版支持的七项已读；其他可用性未评估 |
| historical | 018125 | 2026-04-30 | 7 | 本版支持的七项已读；其他可用性未评估 |
| historical | 018590 | 2026-04-30 | 7 | 本版支持的七项已读；其他可用性未评估 |
| development | 000041 | 2025-04-30 | 7 | 本版支持的七项已读；其他可用性未评估 |
| development | 000041 | 2026-04-30 | 7 | 本版支持的七项已读；其他可用性未评估 |
| development | 000043 | 2025-04-30 | 7 | 本版支持的七项已读；其他可用性未评估 |
| development | 000043 | 2026-04-30 | 7 | 本版支持的七项已读；其他可用性未评估 |
| development | 000042 | 2025-04-30 | 7 | 本版支持的七项已读；其他可用性未评估 |
| development | 000042 | 2026-04-30 | 7 | 本版支持的七项已读；其他可用性未评估 |
| development | 000176 | 2025-04-30 | 7 | 本版支持的七项已读；其他可用性未评估 |
| development | 000176 | 2026-04-30 | 7 | 本版支持的七项已读；其他可用性未评估 |

## 可回放证据

隔离批次：`C:\pythonProject\workSpace06\.local-runs\quality-v2-20261017-followup\run23`；真实扩样回放：`C:\pythonProject\workSpace06\.local-runs\quality-v2-20261017-followup\accounting37-real-replay`。

主要文件：accounting-fact-ledger.json、fund-metric-source-gaps.json、inventory.json、historical-primary/result.json、preservation-and-source-drift.json、historical-preservation.json、engineering-checks.json、cross-month-experiment.json、formal-readback.json；独立56项核验见accounting37-real-replay/independent-accounting-replay.json。
