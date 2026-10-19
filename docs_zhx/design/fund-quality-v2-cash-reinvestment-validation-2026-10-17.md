# 基金质量V2：历史现金分红与再投资来源对账

生成时间：2026-10-17T05:43:45.378097+08:00。

## 本次真实结果

- 006730两个历史考察月新增12个收益、风险及稳定性原始字段。原供应商复权值、原冲突和前次拒收包保留；新序列明确记为由原件现金分红、单位净值与发行人收益共同核验的独立派生序列。
- 历史输入仍是22包、11个既有产品、两个考察月，共73个原始字段；前批61个数值、单位、观察日及数值来源绑定未改。
- 3个产品、两个考察月的6组成对历史，共40字段通过独立算术复算。40已包含新增12，不相加为52。
- 4份分红公告由独立pdfplumber/pdfminer网格重读C类代码列、金额列、元/10份单位、除息日、再投资采用净值日及明确免收再投资费用条文；主解析使用pypdf原文。
- 364项工程回归及Ruff通过，六包在哈希种子1/17/999下从原件完整重建一致。
- 当前市场重新查询49份额、48个产品，9月原始字段仍为198条；原497件不同哈希来源和15个旧完整来源包保留。
- 71个真实输入包的跨月隔离试算仍为四类NOT_READY。完整八维、合格校准/验证产品为0；没有生成锚点、总分或等级，正式评分及00:30任务不变。

## 原件及份额金额

| 公告送出日 | C类除息日 | 元/10份 | 元/份 | 原件 |
| --- | --- | ---: | ---: | --- |
| 2022-06-22 | 2022-06-24 | 2.344 | 0.2344 | [发行人PDF](https://www.wjasset.com/upload/pdf/1655805804054-wjzz500zszqxfqszqtzjjfhgg.pdf) |
| 2023-06-20 | 2023-06-21 | 1.676 | 0.1676 | [发行人PDF](https://www.wjasset.com/upload/pdf/1687222129143-wjzz500zszqxfqszqtzjjfhgg.pdf) |
| 2025-01-08 | 2025-01-10 | 0.143 | 0.0143 | [发行人PDF](https://www.wjasset.com/upload/pdf/1736250063748-wjzz500zszqxfqszqtzjjfhgg.pdf) |
| 2026-01-08 | 2026-01-12 | 0.560 | 0.056 | [发行人PDF](https://www.wjasset.com/upload/pdf/1767785653716-wjzz500zszqxfqszqtzjjfhgg.pdf) |

另外保存2022/2023年正式年报作为报告期分配的复核原件。2025年4月考察使用当时已经送出的2025-01-08公告，没有倒用2025-08-29中期报告。2026年分红按2026-01-12实际除息日归入窗口，不能按公告中“2025年度分红”字样倒移年份。

## 逐日对账与原冲突保留

| 考察日 | 实际估值日 | 窗口内已核C类事件 | 再投资最大差 | 严格舍入上界 | 原供应商最大差 |
| --- | ---: | --- | ---: | ---: | ---: |
| 2025-04-30 | 728 | 2022-06-24=0.2344; 2023-06-21=0.1676; 2025-01-10=0.0143 | 5.54195302538e-07 | 7.5028998708e-07 | 0.00223008097947 |
| 2026-04-30 | 727 | 2023-06-21=0.1676; 2025-01-10=0.0143; 2026-01-12=0.056 | 5.10912167684e-07 | 7.5028998708e-07 | 0.00380837299981 |

每一估值日先核发行人与规范快照的本份额单位净值一致，再以原公告现金金额重算再投资递推，并与发行人累计收益曲线逐日比较。严格上界仍为0.000001/最小发行人累计收益因子，未因冲突放宽。供应商复权数组与源文件原样保留；派生序列有单独来源基准、现金事件、差异和SHA。

RAW契约由QUALITY_RAW_20261017_3显式升级为QUALITY_RAW_20261017_4，新增现金再投资来源政策；21个原始字段公式、单位、窗口、维度归属与候选权重未改变。旧RAW3包、失败及原正式批次不改写。

## 独立检查的边界与保留失败

- 2022公告代码行在第一页、金额行在第二页。独立网格首轮零匹配即拒绝；修复后按C代码单元格实际横坐标匹配次页金额单元格，不按预期金额反查。首轮读取器和实际单元格诊断保留。
- 原事件快照是已有规范记录，不是原始HTTP响应；事件布尔状态不作为来源证明。逐笔原公告和每日单位净值/收益恒等式共同验证。
- 四份公告不是四个独立基金；同产品不同月份和A/C仍只计一个产品。本次新增数据都在既有开发侧，未声称新盲法验证。
- 22份年报身份与时间独立检查仍通过，但不代表所有表格完成第二解析器核验。40字段复算也不代表完整方法或权重已验收。

## 正式启用仍未满足

现金目标区间、策略容量与持续运作边界、全资产发行人/行业参照、完整历史合同与披露链、治理适用对象/整改及独立复核仍有缺口。不补零、不重分权，不用成交负荷替代通用容量，不用规则端点、同产品多月或A/C凑30个校准产品。只有真实完整包、独立产品与月份验证和发布验收通过后，才推进正式存储/API/页面接入。

## 全部22份历史输入的逐基金字段和缺口

### 002112 德邦鑫星价值灵活配置混合-C：考察2025-04-30

- CN_PUBLIC_FUND:001412；固定calibration侧；报告观察日2024-12-31。
- [原年报](https://www.dbfund.com.cn/upload/pdf/1743380674851-德邦鑫星价值灵活配置混合型证券投资基金2024年年度报告.pdf)；公开日2025-03-31；SHA `7c119b15d297b2f9627942d7827fa66a1cc68396466a4792585449623cb68abc`。
- [完整冻结包及来源](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/historical-primary/packets/2025-04-30-002112.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| holder_pressure_band | 2 | ordinal:0,1,2 | 2024-12-31 |
| restricted_ratio | 0E+2 | ratio | 2024-12-31 |

| 尚缺字段 | 状态 | 精确原因 | 真实来源要求 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| cost_1y | SOURCE_VALUE_UNRESOLVED | SUMMARY_ORIGINAL_REQUIRED | 本份额标准费用；综合运作费不叠加分项，ETF联接按合法减免核验 |
| extra_downside | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_VALUE_UNRESOLVED | RATING_MARKET_SECTION_MISSING:(?:9\|10)\.[67]\.1\s*管理人受调查或处罚 | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | COLLECTION_REQUIRED | FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| rolling_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；重叠窗口不作独立样本 |
| team_months | COLLECTION_REQUIRED | MANAGER_ORIGINAL_RECORDS_NOT_REGISTERED | 完整正式团队时间线及原文；任职不替代治理 |

### 002170 东吴移动互联灵活配置混合-C：考察2025-04-30

- CN_PUBLIC_FUND:001323；固定validation侧；报告观察日2024-12-31。
- [原年报](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2025-03-31；SHA `ec5614f19ce821af2ac40607999e03642b6e4beeec07c5eb7cee614f1ba7a83f`。
- [完整冻结包及来源](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/historical-primary/packets/2025-04-30-002170.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| holder_pressure_band | 0 | ordinal:0,1,2 | 2024-12-31 |

| 尚缺字段 | 状态 | 精确原因 | 真实来源要求 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| cost_1y | SOURCE_VALUE_UNRESOLVED | SUMMARY_ORIGINAL_REQUIRED | 本份额标准费用；综合运作费不叠加分项，ETF联接按合法减免核验 |
| extra_downside | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_VALUE_UNRESOLVED | RATING_MARKET_SECTION_MISSING:(?:9\|10)\.[67]\.1\s*管理人受调查或处罚 | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | COLLECTION_REQUIRED | FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | RATING_MARKET_RESTRICTED_TABLE_MISSING; FIXED_LAYOUT:QUALITY_RESTRICTED_LAYOUT_COLUMNS_UNVERIFIED | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；重叠窗口不作独立样本 |
| team_months | COLLECTION_REQUIRED | MANAGER_ORIGINAL_RECORDS_NOT_REGISTERED | 完整正式团队时间线及原文；任职不替代治理 |

### 004605 富国新活力灵活配置混合-C：考察2025-04-30

- CN_PUBLIC_FUND:004604；固定calibration侧；报告观察日2024-12-31。
- [原年报](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2025-03-31；SHA `e5784a8a3c0d84d768dcc7b38156d5c53cf2aa6875727325b048d201717cba6e`。
- [完整冻结包及来源](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/historical-primary/packets/2025-04-30-004605.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| restricted_ratio | 0.0004677658138806089264928822738 | ratio | 2024-12-31 |

| 尚缺字段 | 状态 | 精确原因 | 真实来源要求 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| cost_1y | SOURCE_VALUE_UNRESOLVED | SUMMARY_ORIGINAL_REQUIRED | 本份额标准费用；综合运作费不叠加分项，ETF联接按合法减免核验 |
| extra_downside | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_VALUE_UNRESOLVED | RATING_MARKET_SECTION_MISSING:(?:9\|10)\.[67]\.1\s*管理人受调查或处罚 | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| holder_pressure_band | SOURCE_VALUE_UNRESOLVED | HOLDER_INTERVAL_ROWS_UNPARSED | 全期持有人阈值披露及申赎表；区间不当精确比例 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | COLLECTION_REQUIRED | FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| rolling_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；重叠窗口不作独立样本 |
| team_months | COLLECTION_REQUIRED | MANAGER_ORIGINAL_RECORDS_NOT_REGISTERED | 完整正式团队时间线及原文；任职不替代治理 |

### 005312 万家经济新动能混合-C：考察2025-04-30

- CN_PUBLIC_FUND:005311；固定calibration侧；报告观察日2024-12-31。
- [原年报](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2025-03-29；SHA `06e6c08810fefa065ea4d28ef958ef5881679a10ddc2fa7e11a715dc6bbee1c4`。
- [完整冻结包及来源](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/historical-primary/packets/2025-04-30-005312.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| holder_pressure_band | 0 | ordinal:0,1,2 | 2024-12-31 |
| restricted_ratio | 0.0004216072296382003752711994124 | ratio | 2024-12-31 |

| 尚缺字段 | 状态 | 精确原因 | 真实来源要求 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| cost_1y | SOURCE_VALUE_UNRESOLVED | SUMMARY_ORIGINAL_REQUIRED | 本份额标准费用；综合运作费不叠加分项，ETF联接按合法减免核验 |
| extra_downside | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_VALUE_UNRESOLVED | RATING_MARKET_SECTION_MISSING:(?:9\|10)\.[67]\.1\s*管理人受调查或处罚 | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | COLLECTION_REQUIRED | FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| rolling_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；重叠窗口不作独立样本 |
| team_months | COLLECTION_REQUIRED | MANAGER_ORIGINAL_RECORDS_NOT_REGISTERED | 完整正式团队时间线及原文；任职不替代治理 |

### 006730 万家中证500指数增强-C：考察2025-04-30

- CN_PUBLIC_FUND:006729；固定calibration侧；报告观察日2024-12-31。
- [原年报](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2025-03-29；SHA `52b50aa751d8377321f43cff2e42ad3d89a9feac3cf639b0eddc6c4aa650ca55`。
- [完整冻结包及来源](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/historical-primary/packets/2025-04-30-006730.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| extra_downside | 0.02576423133259565792314263729261898274315 | ratio/year^0.5 | 2025-04-30 |
| extra_drawdown | 0.0557906445828548020587972665820349397715 | ratio | 2025-04-30 |
| monthly_target_success | 0.5555555555555555555555555555555555555556 | ratio | 2025-04-30 |
| relative_return_1y | -0.003217486893161035004778565418141697138 | ratio | 2025-04-30 |
| relative_return_3y | 0.026138171512195302291792570949580906759 | ratio/year | 2025-04-30 |
| restricted_ratio | 0.0006813776598448287056239903359 | ratio | 2024-12-31 |
| rolling_target_success | 0.48 | ratio | 2025-04-30 |

| 尚缺字段 | 状态 | 精确原因 | 真实来源要求 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| cost_1y | SOURCE_VALUE_UNRESOLVED | SUMMARY_ORIGINAL_REQUIRED | 本份额标准费用；综合运作费不叠加分项，ETF联接按合法减免核验 |
| governance_state | SOURCE_VALUE_UNRESOLVED | RATING_MARKET_SECTION_MISSING:(?:9\|10)\.[67]\.1\s*管理人受调查或处罚 | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| holder_pressure_band | SOURCE_VALUE_UNRESOLVED | HOLDER_INTERVAL_ROWS_UNPARSED | 全期持有人阈值披露及申赎表；区间不当精确比例 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | COLLECTION_REQUIRED | FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| team_months | COLLECTION_REQUIRED | MANAGER_ORIGINAL_RECORDS_NOT_REGISTERED | 完整正式团队时间线及原文；任职不替代治理 |

### 012835 招商景气精选股票-A：考察2025-04-30

- CN_PUBLIC_FUND:012835；固定calibration侧；报告观察日2024-12-31。
- [原年报](https://static.cmfchina.com/fundarticle/20250328/20014837351079.pdf)；公开日2025-03-28；SHA `f9f7e9bd6473ca31485e90fc61088becf6b138f46f1b4afad6c5c14979eaa335`。
- [完整冻结包及来源](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/historical-primary/packets/2025-04-30-012835.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| cost_1y | 0.02897832512315270935960591133 | ratio | 2024-07-19 |
| key_person_coverage | 1 | ratio | 2025-04-30 |
| team_months | 10.48049281314168377823408624 | month | 2025-04-30 |

| 尚缺字段 | 状态 | 精确原因 | 真实来源要求 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_VALUE_UNRESOLVED | RATING_MARKET_SECTION_MISSING:(?:9\|10)\.[67]\.1\s*管理人受调查或处罚 | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| holder_pressure_band | SOURCE_STATEMENT_UNAVAILABLE | ORIGINAL_THRESHOLD_STATEMENT_NOT_PRESENT_NOT_PROOF_OF_ZERO | 全期持有人阈值披露及申赎表；区间不当精确比例 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | QUALITY_RESTRICTED_BOND_TABLE_UNVERIFIED | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

### 013275 富国中证煤炭指数(LOF)-C：考察2025-04-30

- CN_PUBLIC_FUND:161032；固定calibration侧；报告观察日2024-12-31。
- [原年报](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2025-03-31；SHA `6e8c212a7d3d1c55287ab59fa9cbb6cea37cc011a92f2f50f00d89649bbcbd57`。
- [完整冻结包及来源](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/historical-primary/packets/2025-04-30-013275.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| extra_downside | 0.006239858631400355719114727669948200963453 | ratio/year^0.5 | 2025-04-30 |
| extra_drawdown | 0.0134029821580542697774233467210188984949 | ratio | 2025-04-30 |
| holder_pressure_band | 0 | ordinal:0,1,2 | 2024-12-31 |
| monthly_target_success | 0.5 | ratio | 2025-04-30 |
| relative_return_1y | 0.0318500038943200275198345527603174633340 | ratio | 2025-04-30 |
| relative_return_3y | 0.0458983686385919225165089345208727999894 | ratio/year | 2025-04-30 |
| restricted_ratio | 0.0002581974543712894143271112672 | ratio | 2024-12-31 |
| rolling_target_success | 1 | ratio | 2025-04-30 |
| tracking_error | 0.02122944963012051835945480837445398986003 | ratio/year^0.5 | 2025-04-30 |

| 尚缺字段 | 状态 | 精确原因 | 真实来源要求 |
| --- | --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| cost_1y | SOURCE_VALUE_UNRESOLVED | SUMMARY_ORIGINAL_REQUIRED | 本份额标准费用；综合运作费不叠加分项，ETF联接按合法减免核验 |
| governance_state | SOURCE_VALUE_UNRESOLVED | RATING_MARKET_SECTION_MISSING:(?:9\|10)\.[67]\.1\s*管理人受调查或处罚 | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 资产总额作分母，负债单列；同日分类和指数全成分、完整资产账簿；详见industry_structure_policy |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 含现金的全资产穿透权重、同期目标成分、发行人映射 |
| key_person_coverage | COLLECTION_REQUIRED | FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| team_months | COLLECTION_REQUIRED | MANAGER_ORIGINAL_RECORDS_NOT_REGISTERED | 完整正式团队时间线及原文；任职不替代治理 |

### 013330 富国中证银行指数-C：考察2025-04-30

- CN_PUBLIC_FUND:161029；固定calibration侧；报告观察日2024-12-31。
- [原年报](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2025-03-31；SHA `f99e498cafdd889755d8e0f36fdb74cf02605eb736a97cac9f22909dda8e2021`。
- [完整冻结包及来源](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/historical-primary/packets/2025-04-30-013330.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| extra_downside | 0.004340136151145486906547865416053451582374 | ratio/year^0.5 | 2025-04-30 |
| extra_drawdown | 0.0103772288456117175149660591554524885703 | ratio | 2025-04-30 |
| holder_pressure_band | 0 | ordinal:0,1,2 | 2024-12-31 |
| monthly_target_success | 0.4444444444444444444444444444444444444444 | ratio | 2025-04-30 |
| relative_return_1y | 0.079142624261201833316613388539551052440 | ratio | 2025-04-30 |
| relative_return_3y | 0.053394655689930728259656688626676942968 | ratio/year | 2025-04-30 |
| restricted_ratio | 0.0004341267576930547573107427514 | ratio | 2024-12-31 |
| rolling_target_success | 1 | ratio | 2025-04-30 |
| tracking_error | 0.01878882281673589233513822407673018474455 | ratio/year^0.5 | 2025-04-30 |

| 尚缺字段 | 状态 | 精确原因 | 真实来源要求 |
| --- | --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| cost_1y | SOURCE_VALUE_UNRESOLVED | SUMMARY_ORIGINAL_REQUIRED | 本份额标准费用；综合运作费不叠加分项，ETF联接按合法减免核验 |
| governance_state | SOURCE_VALUE_UNRESOLVED | RATING_MARKET_SECTION_MISSING:(?:9\|10)\.[67]\.1\s*管理人受调查或处罚 | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 资产总额作分母，负债单列；同日分类和指数全成分、完整资产账簿；详见industry_structure_policy |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 含现金的全资产穿透权重、同期目标成分、发行人映射 |
| key_person_coverage | COLLECTION_REQUIRED | FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| team_months | COLLECTION_REQUIRED | MANAGER_ORIGINAL_RECORDS_NOT_REGISTERED | 完整正式团队时间线及原文；任职不替代治理 |

### 017960 招商趋势领航混合-A：考察2025-04-30

- CN_PUBLIC_FUND:017960；固定calibration侧；报告观察日2024-12-31。
- [原年报](https://static.cmfchina.com/fundarticle/20250328/20014556174077.pdf)；公开日2025-03-28；SHA `587836d2871ff14b102faa4987baa045d21c984ed3b09c4420c824d597732f1d`。
- [完整冻结包及来源](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/historical-primary/packets/2025-04-30-017960.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| cost_1y | 0.02887832512315270935960591133 | ratio | 2025-03-20 |

| 尚缺字段 | 状态 | 精确原因 | 真实来源要求 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_VALUE_UNRESOLVED | RATING_MARKET_SECTION_MISSING:(?:9\|10)\.[67]\.1\s*管理人受调查或处罚 | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| holder_pressure_band | SOURCE_STATEMENT_UNAVAILABLE | ORIGINAL_THRESHOLD_STATEMENT_NOT_PRESENT_NOT_PROOF_OF_ZERO | 全期持有人阈值披露及申赎表；区间不当精确比例 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | COLLECTION_REQUIRED | FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | QUALITY_RESTRICTED_BOND_TABLE_UNVERIFIED | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；重叠窗口不作独立样本 |
| team_months | SOURCE_WINDOW_INCOMPLETE | AVAILABLE_PRODUCT_HISTORY_SHORTER_THAN_36_MONTHS | 完整正式团队时间线及原文；任职不替代治理 |

### 018125 永赢先进制造智选混合-C：考察2025-04-30

- CN_PUBLIC_FUND:018124；固定calibration侧；报告观察日2024-12-31。
- [原年报](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2025-03-28；SHA `79defe408c9b88a892d9b3727f4f5822ddd5b26e4f3ef05f8c403b4dd4bfd01c`。
- [完整冻结包及来源](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/historical-primary/packets/2025-04-30-018125.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| holder_pressure_band | 0 | ordinal:0,1,2 | 2024-12-31 |

| 尚缺字段 | 状态 | 精确原因 | 真实来源要求 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| cost_1y | SOURCE_VALUE_UNRESOLVED | SUMMARY_ORIGINAL_REQUIRED | 本份额标准费用；综合运作费不叠加分项，ETF联接按合法减免核验 |
| extra_downside | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_VALUE_UNRESOLVED | RATING_MARKET_SECTION_MISSING:(?:9\|10)\.[67]\.1\s*管理人受调查或处罚 | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | COLLECTION_REQUIRED | FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | RATING_MARKET_RESTRICTED_TABLE_MISSING; FIXED_LAYOUT:QUALITY_RESTRICTED_LAYOUT_SECURITY_UNRESOLVED: | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；重叠窗口不作独立样本 |
| team_months | COLLECTION_REQUIRED | MANAGER_ORIGINAL_RECORDS_NOT_REGISTERED | 完整正式团队时间线及原文；任职不替代治理 |

### 018590 银华体育文化灵活配置混合-C：考察2025-04-30

- CN_PUBLIC_FUND:003397；固定validation侧；报告观察日2024-12-31。
- [原年报](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2025-03-28；SHA `cb0d84bf9fe05f084d1e89d945a60c2e5ac3aef52cc6954a1b9777b57c8a2d8f`。
- [完整冻结包及来源](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/historical-primary/packets/2025-04-30-018590.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| holder_pressure_band | 0 | ordinal:0,1,2 | 2024-12-31 |
| restricted_ratio | 0E+2 | ratio | 2024-12-31 |

| 尚缺字段 | 状态 | 精确原因 | 真实来源要求 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| cost_1y | SOURCE_VALUE_UNRESOLVED | SUMMARY_ORIGINAL_REQUIRED | 本份额标准费用；综合运作费不叠加分项，ETF联接按合法减免核验 |
| extra_downside | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_VALUE_UNRESOLVED | RATING_MARKET_SECTION_MISSING:(?:9\|10)\.[67]\.1\s*管理人受调查或处罚 | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | COLLECTION_REQUIRED | FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| rolling_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；重叠窗口不作独立样本 |
| team_months | COLLECTION_REQUIRED | MANAGER_ORIGINAL_RECORDS_NOT_REGISTERED | 完整正式团队时间线及原文；任职不替代治理 |

### 002112 德邦鑫星价值灵活配置混合-C：考察2026-04-30

- CN_PUBLIC_FUND:001412；固定calibration侧；报告观察日2025-12-31。
- [原年报](https://www.dbfund.com.cn/upload/pdf/1774921360946-德邦鑫星价值灵活配置混合型证券投资基金2025年年度报告.pdf)；公开日2026-03-31；SHA `6d8853f58caf4cfe115dd50a003263e35a1e800b2dbdd0b1db28591d354d5f60`。
- [完整冻结包及来源](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/historical-primary/packets/2026-04-30-002112.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| restricted_ratio | 0E+2 | ratio | 2025-12-31 |

| 尚缺字段 | 状态 | 精确原因 | 真实来源要求 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| cost_1y | SOURCE_VALUE_UNRESOLVED | SUMMARY_ORIGINAL_REQUIRED | 本份额标准费用；综合运作费不叠加分项，ETF联接按合法减免核验 |
| extra_downside | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_VALUE_UNRESOLVED | RATING_MARKET_SECTION_MISSING:(?:9\|10)\.[67]\.1\s*管理人受调查或处罚 | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| holder_pressure_band | SOURCE_VALUE_UNRESOLVED | HOLDER_FLOW_VALUE_MISSING | 全期持有人阈值披露及申赎表；区间不当精确比例 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | COLLECTION_REQUIRED | FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| rolling_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；重叠窗口不作独立样本 |
| team_months | COLLECTION_REQUIRED | MANAGER_ORIGINAL_RECORDS_NOT_REGISTERED | 完整正式团队时间线及原文；任职不替代治理 |

### 002170 东吴移动互联灵活配置混合-C：考察2026-04-30

- CN_PUBLIC_FUND:001323；固定validation侧；报告观察日2025-12-31。
- [原年报](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2026-03-31；SHA `c9ab72fd1e97355dab2d6a22752d19305c5c16423c227873a2250861b54ad216`。
- [完整冻结包及来源](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/historical-primary/packets/2026-04-30-002170.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| holder_pressure_band | 0 | ordinal:0,1,2 | 2025-12-31 |
| restricted_ratio | 0.00001943471127044849269614717122 | ratio | 2025-12-31 |

| 尚缺字段 | 状态 | 精确原因 | 真实来源要求 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| cost_1y | SOURCE_VALUE_UNRESOLVED | SUMMARY_ORIGINAL_REQUIRED | 本份额标准费用；综合运作费不叠加分项，ETF联接按合法减免核验 |
| extra_downside | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_VALUE_UNRESOLVED | RATING_MARKET_SECTION_MISSING:(?:9\|10)\.[67]\.1\s*管理人受调查或处罚 | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | COLLECTION_REQUIRED | FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| rolling_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；重叠窗口不作独立样本 |
| team_months | COLLECTION_REQUIRED | MANAGER_ORIGINAL_RECORDS_NOT_REGISTERED | 完整正式团队时间线及原文；任职不替代治理 |

### 004605 富国新活力灵活配置混合-C：考察2026-04-30

- CN_PUBLIC_FUND:004604；固定calibration侧；报告观察日2025-12-31。
- [原年报](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2026-03-31；SHA `6a86116eed88de01d562642f9afc5871b3b68e2be1dc5dbc0c90f3acb4b67a42`。
- [完整冻结包及来源](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/historical-primary/packets/2026-04-30-004605.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| 无 | — | — | — |

| 尚缺字段 | 状态 | 精确原因 | 真实来源要求 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| cost_1y | SOURCE_VALUE_UNRESOLVED | SUMMARY_ORIGINAL_REQUIRED | 本份额标准费用；综合运作费不叠加分项，ETF联接按合法减免核验 |
| extra_downside | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_VALUE_UNRESOLVED | KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| holder_pressure_band | SOURCE_VALUE_UNRESOLVED | HOLDER_PERIOD_SECTION_MISSING | 全期持有人阈值披露及申赎表；区间不当精确比例 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | COLLECTION_REQUIRED | FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | QUALITY_PLEDGED_BONDS_MARKET_SECTIONS_UNVERIFIED | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；重叠窗口不作独立样本 |
| team_months | COLLECTION_REQUIRED | MANAGER_ORIGINAL_RECORDS_NOT_REGISTERED | 完整正式团队时间线及原文；任职不替代治理 |

### 005312 万家经济新动能混合-C：考察2026-04-30

- CN_PUBLIC_FUND:005311；固定calibration侧；报告观察日2025-12-31。
- [原年报](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2026-03-30；SHA `5cc72fe50966beeb02a0be0dbd3f5cb6b6da9b226090dba54cb22428f4d30bad`。
- [完整冻结包及来源](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/historical-primary/packets/2026-04-30-005312.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| holder_pressure_band | 0 | ordinal:0,1,2 | 2025-12-31 |
| restricted_ratio | 0.05161118376630351603007199922 | ratio | 2025-12-31 |

| 尚缺字段 | 状态 | 精确原因 | 真实来源要求 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| cost_1y | SOURCE_VALUE_UNRESOLVED | SUMMARY_ORIGINAL_REQUIRED | 本份额标准费用；综合运作费不叠加分项，ETF联接按合法减免核验 |
| extra_downside | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_VALUE_UNRESOLVED | RATING_MARKET_SECTION_MISSING:(?:9\|10)\.[67]\.1\s*管理人受调查或处罚 | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | COLLECTION_REQUIRED | FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| rolling_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；重叠窗口不作独立样本 |
| team_months | COLLECTION_REQUIRED | MANAGER_ORIGINAL_RECORDS_NOT_REGISTERED | 完整正式团队时间线及原文；任职不替代治理 |

### 006730 万家中证500指数增强-C：考察2026-04-30

- CN_PUBLIC_FUND:006729；固定calibration侧；报告观察日2025-12-31。
- [原年报](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2026-03-30；SHA `e65fa59ecbbcdabdede670f6a2bc78b8e432f5c2a2cec8e3ee3a60814c3ea52a`。
- [完整冻结包及来源](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/historical-primary/packets/2026-04-30-006730.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| extra_downside | 0.02691105568854857569770529520385510493437 | ratio/year^0.5 | 2026-04-30 |
| extra_drawdown | 0.0557906445828548020587972665820349397715 | ratio | 2026-04-30 |
| monthly_target_success | 0.5833333333333333333333333333333333333333 | ratio | 2026-04-30 |
| relative_return_1y | 0.162811465127833829971093686670207031242 | ratio | 2026-04-30 |
| relative_return_3y | 0.035127162894243960132378864147642704670 | ratio/year | 2026-04-30 |
| restricted_ratio | 0.006317827737960594891884638597 | ratio | 2025-12-31 |
| rolling_target_success | 0.56 | ratio | 2026-04-30 |

| 尚缺字段 | 状态 | 精确原因 | 真实来源要求 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| cost_1y | SOURCE_VALUE_UNRESOLVED | SUMMARY_ORIGINAL_REQUIRED | 本份额标准费用；综合运作费不叠加分项，ETF联接按合法减免核验 |
| governance_state | SOURCE_VALUE_UNRESOLVED | RATING_MARKET_SECTION_MISSING:(?:9\|10)\.[67]\.1\s*管理人受调查或处罚 | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| holder_pressure_band | SOURCE_VALUE_UNRESOLVED | HOLDER_INTERVAL_ROWS_UNPARSED | 全期持有人阈值披露及申赎表；区间不当精确比例 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | COLLECTION_REQUIRED | FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| team_months | COLLECTION_REQUIRED | MANAGER_ORIGINAL_RECORDS_NOT_REGISTERED | 完整正式团队时间线及原文；任职不替代治理 |

### 012835 招商景气精选股票-A：考察2026-04-30

- CN_PUBLIC_FUND:012835；固定calibration侧；报告观察日2025-12-31。
- [原年报](https://static.cmfchina.com/fundarticle/20260331/20021470156969.pdf)；公开日2026-03-31；SHA `1cfd02918f462d726923407a2cb1c0914dc154eb8489e2240881f3de6270999e`。
- [完整冻结包及来源](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/historical-primary/packets/2026-04-30-012835.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| cost_1y | 0.02897832512315270935960591133 | ratio | 2025-07-18 |
| key_person_coverage | 1 | ratio | 2026-04-30 |
| team_months | 22.47227926078028747433264887 | month | 2026-04-30 |

| 尚缺字段 | 状态 | 精确原因 | 真实来源要求 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_VALUE_UNRESOLVED | KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| holder_pressure_band | SOURCE_STATEMENT_UNAVAILABLE | ORIGINAL_THRESHOLD_STATEMENT_NOT_PRESENT_NOT_PROOF_OF_ZERO | 全期持有人阈值披露及申赎表；区间不当精确比例 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | QUALITY_RESTRICTED_BOND_TABLE_UNVERIFIED | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

### 013275 富国中证煤炭指数(LOF)-C：考察2026-04-30

- CN_PUBLIC_FUND:161032；固定calibration侧；报告观察日2025-12-31。
- [原年报](https://www.fullgoal.com.cn/wbs-file/fund_report/20260331/CN_50100000_161032_FB010010_20260005.pdf)；公开日2026-03-31；SHA `a75af2c5a78bc53cf8549f0a4a58568994c26be39b31b3cc1ddb0717b9769a37`。
- [完整冻结包及来源](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/historical-primary/packets/2026-04-30-013275.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| extra_downside | 0.005690868552110240297156633769485035027904 | ratio/year^0.5 | 2026-04-30 |
| extra_drawdown | 0.0134029821580542697774233467210188984949 | ratio | 2026-04-30 |
| monthly_target_success | 0.5555555555555555555555555555555555555556 | ratio | 2026-04-30 |
| relative_return_1y | 0.034256279887329339975939383988920597248 | ratio | 2026-04-30 |
| relative_return_3y | 0.045625120321092600084912618191671882967 | ratio/year | 2026-04-30 |
| rolling_target_success | 1 | ratio | 2026-04-30 |
| tracking_error | 0.01987162033533640009671412584932458043609 | ratio/year^0.5 | 2026-04-30 |

| 尚缺字段 | 状态 | 精确原因 | 真实来源要求 |
| --- | --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| cost_1y | SOURCE_VALUE_UNRESOLVED | SUMMARY_ORIGINAL_REQUIRED | 本份额标准费用；综合运作费不叠加分项，ETF联接按合法减免核验 |
| governance_state | SOURCE_VALUE_UNRESOLVED | KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| holder_pressure_band | SOURCE_VALUE_UNRESOLVED | HOLDER_PERIOD_SECTION_MISSING | 全期持有人阈值披露及申赎表；区间不当精确比例 |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 资产总额作分母，负债单列；同日分类和指数全成分、完整资产账簿；详见industry_structure_policy |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 含现金的全资产穿透权重、同期目标成分、发行人映射 |
| key_person_coverage | COLLECTION_REQUIRED | FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | QUALITY_PLEDGED_BONDS_MARKET_SECTIONS_UNVERIFIED | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| team_months | COLLECTION_REQUIRED | MANAGER_ORIGINAL_RECORDS_NOT_REGISTERED | 完整正式团队时间线及原文；任职不替代治理 |

### 013330 富国中证银行指数-C：考察2026-04-30

- CN_PUBLIC_FUND:161029；固定calibration侧；报告观察日2025-12-31。
- [原年报](https://www.fullgoal.com.cn/wbs-file/fund_report/20260331/CN_50100000_161029_FB010010_20260002.pdf)；公开日2026-03-31；SHA `db48c4b8567c4b96b4474da3a27b10c9df728c715fa0199a9638802f9e2f123d`。
- [完整冻结包及来源](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/historical-primary/packets/2026-04-30-013330.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| extra_downside | 0.003869488129732834978839873873601977887193 | ratio/year^0.5 | 2026-04-30 |
| extra_drawdown | 0.0102434557399193257679160938618780837581 | ratio | 2026-04-30 |
| monthly_target_success | 0.5277777777777777777777777777777777777778 | ratio | 2026-04-30 |
| relative_return_1y | 0.035156668040635749476472015469402591418 | ratio | 2026-04-30 |
| relative_return_3y | 0.051972025382825634310776231545853979514 | ratio/year | 2026-04-30 |
| rolling_target_success | 1 | ratio | 2026-04-30 |
| tracking_error | 0.01635608691931156852587044228336149237116 | ratio/year^0.5 | 2026-04-30 |

| 尚缺字段 | 状态 | 精确原因 | 真实来源要求 |
| --- | --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| cost_1y | SOURCE_VALUE_UNRESOLVED | SUMMARY_ORIGINAL_REQUIRED | 本份额标准费用；综合运作费不叠加分项，ETF联接按合法减免核验 |
| governance_state | SOURCE_VALUE_UNRESOLVED | KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| holder_pressure_band | SOURCE_VALUE_UNRESOLVED | HOLDER_PERIOD_SECTION_MISSING | 全期持有人阈值披露及申赎表；区间不当精确比例 |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 资产总额作分母，负债单列；同日分类和指数全成分、完整资产账簿；详见industry_structure_policy |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 含现金的全资产穿透权重、同期目标成分、发行人映射 |
| key_person_coverage | COLLECTION_REQUIRED | FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | QUALITY_PLEDGED_BONDS_MARKET_SECTIONS_UNVERIFIED | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| team_months | COLLECTION_REQUIRED | MANAGER_ORIGINAL_RECORDS_NOT_REGISTERED | 完整正式团队时间线及原文；任职不替代治理 |

### 017960 招商趋势领航混合-A：考察2026-04-30

- CN_PUBLIC_FUND:017960；固定calibration侧；报告观察日2025-12-31。
- [原年报](https://static.cmfchina.com/fundarticle/20260331/20021570786044.pdf)；公开日2026-03-31；SHA `fb5c071960066dbece4a54180f13f90532bf11edcd2a73bf99f9bd16cd5d9e0d`。
- [完整冻结包及来源](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/historical-primary/packets/2026-04-30-017960.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| cost_1y | 0.02917832512315270935960591133 | ratio | 2026-03-20 |
| key_person_coverage | 1 | ratio | 2026-04-30 |
| team_months | 36 | month | 2026-04-30 |

| 尚缺字段 | 状态 | 精确原因 | 真实来源要求 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_VALUE_UNRESOLVED | KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| holder_pressure_band | SOURCE_STATEMENT_UNAVAILABLE | ORIGINAL_THRESHOLD_STATEMENT_NOT_PRESENT_NOT_PROOF_OF_ZERO | 全期持有人阈值披露及申赎表；区间不当精确比例 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | QUALITY_RESTRICTED_BOND_TABLE_UNVERIFIED | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

### 018125 永赢先进制造智选混合-C：考察2026-04-30

- CN_PUBLIC_FUND:018124；固定calibration侧；报告观察日2025-12-31。
- [原年报](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2026-03-31；SHA `1b47f8dc2c4c234cc6f0f24d5c3833146e5a3b80f1b176f7078f2872dfe87618`。
- [完整冻结包及来源](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/historical-primary/packets/2026-04-30-018125.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| holder_pressure_band | 0 | ordinal:0,1,2 | 2025-12-31 |

| 尚缺字段 | 状态 | 精确原因 | 真实来源要求 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| cost_1y | SOURCE_VALUE_UNRESOLVED | SUMMARY_ORIGINAL_REQUIRED | 本份额标准费用；综合运作费不叠加分项，ETF联接按合法减免核验 |
| extra_downside | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_VALUE_UNRESOLVED | RATING_MARKET_SECTION_MISSING:(?:9\|10)\.[67]\.1\s*管理人受调查或处罚 | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | COLLECTION_REQUIRED | FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | QUALITY_PLEDGED_BONDS_COLLATERAL_AMOUNT_NOT_DISCLOSED:EXCHANGE | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；重叠窗口不作独立样本 |
| team_months | COLLECTION_REQUIRED | MANAGER_ORIGINAL_RECORDS_NOT_REGISTERED | 完整正式团队时间线及原文；任职不替代治理 |

### 018590 银华体育文化灵活配置混合-C：考察2026-04-30

- CN_PUBLIC_FUND:003397；固定validation侧；报告观察日2025-12-31。
- [原年报](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2026-03-28；SHA `9b1c43e2cd18cee8054149601ce787faf8f608b810c180ea78c5ffb49647a96e`。
- [完整冻结包及来源](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/historical-primary/packets/2026-04-30-018590.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| holder_pressure_band | 0 | ordinal:0,1,2 | 2025-12-31 |
| restricted_ratio | 0E+2 | ratio | 2025-12-31 |

| 尚缺字段 | 状态 | 精确原因 | 真实来源要求 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| cost_1y | SOURCE_VALUE_UNRESOLVED | SUMMARY_ORIGINAL_REQUIRED | 本份额标准费用；综合运作费不叠加分项，ETF联接按合法减免核验 |
| extra_downside | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_VALUE_UNRESOLVED | RATING_MARKET_SECTION_MISSING:(?:9\|10)\.[67]\.1\s*管理人受调查或处罚 | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | COLLECTION_REQUIRED | FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| rolling_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；重叠窗口不作独立样本 |
| team_months | COLLECTION_REQUIRED | MANAGER_ORIGINAL_RECORDS_NOT_REGISTERED | 完整正式团队时间线及原文；任职不替代治理 |

## 本次冻结证据

- [当前市场原件回放](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/inventory.json)
- [73字段历史输入](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/historical-primary/result.json)
- [40字段独立复算](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/historical-primary/independent-arithmetic-replay.json)
- [四份原公告独立网格](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/cash-reconciliation-development/independent-cash-grid-with-fees.json)
- [六包三种子](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/historical-primary/hash-seed-replay.json)
- [跨月隔离试算](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/cross-month-experiment.json)
- [正式结果只读回查](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/formal-readback.json)
- [364项回归](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run14/engineering-checks.json)
