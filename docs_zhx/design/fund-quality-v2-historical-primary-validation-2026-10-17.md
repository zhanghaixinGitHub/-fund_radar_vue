# 基金质量V2：年度主报告与真实历史成对曲线验收记录

最新来源对账见[10月17日现金分红与再投资验证](fund-quality-v2-cash-reinvestment-validation-2026-10-17.md)：006730两期另建通过原件和逐日恒等式核验的再投资序列，新增12字段，原供应商复权值及冲突保留。22份历史主输入共73字段，其中40字段独立复算通过；4份分红公告独立网格核对、六包三种子重建及364项工程回归通过。原198个当前字段和61个历史字段的数值/日期/来源保留；完整八维和合格校准/验证仍为0，正式评分及00:30任务不变。

以下保留05:18批次原始记录。

生成时间：2026-10-17T05:18:23.639403+08:00。评价基金本身的综合质量，不预测涨跌，不训练模型。

## 已得到的真实结果

- 当前市场运行时重新查询49份额、48个产品；9月30日原始字段仍为198条，全部原有数值、单位、观察日和数值来源绑定保留。
- 22份真实年度主报告、11个既有独立产品、两个历史考察月，共61条原始字段。相同产品跨月与A/C都不增加独立产品数。
- 其中2个被动产品在两个历史考察月形成4组成对历史，28条收益、风险、跟踪和稳定性字段通过独立标准库复算，容差1e-12。
- 22份主年报的身份、类型、观察日期与送出/公开时点已独立核对：8份实际PDF使用PDFium，14份为真实完整转载响应，未把转载冒称PDF。
- 006730两组成对来源冲突被拒收，未放宽舍入上界；详细日期和幅度见下表。
- 合并隔离输入71包、3个考察月；所有类型仍为NOT_READY。完整八维包、合格校准/验证产品均为0，没有生成锚点、总分或等级。
- 工程回归353项和Ruff通过；正式49条结果只读回查一致，实际考察日仍为2026-09-30。

61条是22个历史输入包中的字段值条数；28条已包含其中，不相加为89条。它们与9月198条属于不同考察月份，不能混成一份完整输入或更多独立产品。

## 主报告时点与来源契约

- 年报与中期统一进入report，保留report_kind=annual/half；季度前十持仓不能成为完整主报告。
- 以正文经济期末选择当时最新报告，核对登记期末、原文类型、送出日和公开收据；2025年报可用于2026-04-30，不能倒称2025-12-31当时已知。
- 年报7节财报/8节组合只建立内部章号视图，原页、原始SHA、证券及财务数字保留。原始摘录继续定位到原页，不把改写章号当作原文。
- 年报继续保留historical-annual附件角色；修复单目录角色提升导致6份年报在9月历史附件筛选中消失的问题。最终全量保留原件，不删除或覆盖前序档案。
- 历史本份额净值为本机已有授权来源规范记录的只读事务快照，六份快照均保留真实提取日、公告日及维护时间；不是原始HTTP响应，也不能证明历史修订回放或首次公开时点。
- 复用006730已有2019年以来的发行人日合同基准；013275/013330各补取一次官网历史曲线响应，实际新HTTP请求共2次。没有只截短9月三年包，也没有通用指数替代合同基准。

## 来源冲突拒收

| 份额 | 考察日 | 首个/最后冲突日 | 冲突日数 | 最严重日期 | 最大标准化差异 | 舍入上界 |
| --- | --- | --- | ---: | --- | ---: | ---: |
| 006730 | 2025-04-30 | 2022-06-24 / 2025-04-30 | 692 | 2023-04-07 | 0.00223008097947 | 7.58025400502e-05 |
| 006730 | 2026-04-30 | 2023-06-21 / 2026-04-30 | 692 | 2026-01-09 | 0.00380837299981 | 7.58025400502e-05 |

差异是两条基金收益曲线归一化后的比例差，不是预测误差。006730当前9月旧原件包的既有成对曲线保持原样；本表只拒收新增历史数据库快照与发行人曲线的组合。必须继续核对原始分红、复权口径及供应商修订，不把来源冲突写成未采集。

## 独立校验与失败保留

- 身份回放最初将集合转载SHA错误当作唯一主件；实际有两份同期同公开日的发行人PDF。修正检查后分别核原件和同源转载；另补解析“二〇二五年三月三十一日”。前次失败与21/22回执均保留。
- 算术回放首次误用月末路径计算最大回撤，真实差异约0.003171；主公式使用逐估值日。修复独立回放后28字段通过，主算法与1e-12容差未改，前次失败脚本保留。
- 22份身份核验不等于22份所有表格都完成第二解析器校验；28字段算术通过不等于完整八维、权重公平或新盲法验收。
- 六个历史成对候选包（含两组来源冲突）在哈希种子1/17/999下从原件完整重建一致；不只比较总分或摘要字段。
- 现有固定35/13产品分组不变；历史22条中校准侧18条、验证侧4条。既有研究已检查过这些原件，本次不冒称新的盲法验证。

## 正式启用仍被哪些实质条件阻止

- 现金目标区间未由适用合同和预先冻结参照建立；现金加一年内政府债券5%下限不是现金目标。
- 策略容量和持续运作上下界未完成证据验证；股票成交负荷、基金规模、募集上限不能冒充通用策略容量。
- 治理需要三年官方事项、适用对象/严重性/整改及独立复核；不能因报告无声明、零条搜索或布尔标志记为最好档。
- 完整发行人及行业穿透、同目标独立产品参照、历史生效合同和36个月披露链路仍存在逐基金缺口。
- 30个校准产品只是各类候选门槛；当前历史两只曲线和同产品多月不能凑产品数，且统计充分性与后续独立验收尚未成立。
- 尚不具备真实总分差异、重复贡献、权重敏感性、类型公平性和等级上限的全包验收依据。因此正式存储/API/页面激活仍关闭，原批次和真实日期保留，00:30任务不变。

## 历史逐基金、逐指标真实缺口

下列每份报告保留可用字段、缺少字段、来源要求与阻塞原因；完整原始表格及日期清单见对应冻结包。

### 002112 德邦鑫星价值灵活配置混合-C：考察2025-04-30

- 产品：CN_PUBLIC_FUND:001412；固定分组：calibration；报告观察日：2024-12-31。
- 原件：[年度报告](https://www.dbfund.com.cn/upload/pdf/1743380674851-德邦鑫星价值灵活配置混合型证券投资基金2024年年度报告.pdf)；公开日2025-03-31；实际送出日2025-03-31；SHA `7c119b15d297b2f9627942d7827fa66a1cc68396466a4792585449623cb68abc`。
- [完整冻结指标包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/historical-primary/packets/2025-04-30-002112.json)。

| 已重建指标 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| holder_pressure_band | 2 | ordinal:0,1,2 | 2024-12-31 |
| restricted_ratio | 0E+2 | ratio | 2024-12-31 |

| 尚缺指标 | 状态 | 精确阻塞原因 | 需要的真实来源 |
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

- 产品：CN_PUBLIC_FUND:001323；固定分组：validation；报告观察日：2024-12-31。
- 原件：[年度报告](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2025-03-31；实际送出日2025-03-31；SHA `ec5614f19ce821af2ac40607999e03642b6e4beeec07c5eb7cee614f1ba7a83f`。
- [完整冻结指标包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/historical-primary/packets/2025-04-30-002170.json)。

| 已重建指标 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| holder_pressure_band | 0 | ordinal:0,1,2 | 2024-12-31 |

| 尚缺指标 | 状态 | 精确阻塞原因 | 需要的真实来源 |
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

- 产品：CN_PUBLIC_FUND:004604；固定分组：calibration；报告观察日：2024-12-31。
- 原件：[年度报告](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2025-03-31；实际送出日2025-03-31；SHA `e5784a8a3c0d84d768dcc7b38156d5c53cf2aa6875727325b048d201717cba6e`。
- [完整冻结指标包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/historical-primary/packets/2025-04-30-004605.json)。

| 已重建指标 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| restricted_ratio | 0.0004677658138806089264928822738 | ratio | 2024-12-31 |

| 尚缺指标 | 状态 | 精确阻塞原因 | 需要的真实来源 |
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

- 产品：CN_PUBLIC_FUND:005311；固定分组：calibration；报告观察日：2024-12-31。
- 原件：[年度报告](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2025-03-29；实际送出日2025-03-29；SHA `06e6c08810fefa065ea4d28ef958ef5881679a10ddc2fa7e11a715dc6bbee1c4`。
- [完整冻结指标包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/historical-primary/packets/2025-04-30-005312.json)。

| 已重建指标 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| holder_pressure_band | 0 | ordinal:0,1,2 | 2024-12-31 |
| restricted_ratio | 0.0004216072296382003752711994124 | ratio | 2024-12-31 |

| 尚缺指标 | 状态 | 精确阻塞原因 | 需要的真实来源 |
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

- 产品：CN_PUBLIC_FUND:006729；固定分组：calibration；报告观察日：2024-12-31。
- 原件：[年度报告](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2025-03-29；实际送出日2025-03-29；SHA `52b50aa751d8377321f43cff2e42ad3d89a9feac3cf639b0eddc6c4aa650ca55`。
- [完整冻结指标包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/historical-primary/packets/2025-04-30-006730.json)。

| 已重建指标 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| restricted_ratio | 0.0006813776598448287056239903359 | ratio | 2024-12-31 |

| 尚缺指标 | 状态 | 精确阻塞原因 | 需要的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| cost_1y | SOURCE_VALUE_UNRESOLVED | SUMMARY_ORIGINAL_REQUIRED | 本份额标准费用；综合运作费不叠加分项，ETF联接按合法减免核验 |
| extra_downside | SOURCE_VALUE_CONFLICT | QUALITY_PAIRED_PROVIDER_PUBLISHER_NAV_CONFLICT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | SOURCE_VALUE_CONFLICT | QUALITY_PAIRED_PROVIDER_PUBLISHER_NAV_CONFLICT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_VALUE_UNRESOLVED | RATING_MARKET_SECTION_MISSING:(?:9\|10)\.[67]\.1\s*管理人受调查或处罚 | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| holder_pressure_band | SOURCE_VALUE_UNRESOLVED | HOLDER_INTERVAL_ROWS_UNPARSED | 全期持有人阈值披露及申赎表；区间不当精确比例 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | COLLECTION_REQUIRED | FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | SOURCE_VALUE_CONFLICT | QUALITY_PAIRED_PROVIDER_PUBLISHER_NAV_CONFLICT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | SOURCE_VALUE_CONFLICT | QUALITY_PAIRED_PROVIDER_PUBLISHER_NAV_CONFLICT | 本份额再投资净值、合同基准 |
| relative_return_3y | SOURCE_VALUE_CONFLICT | QUALITY_PAIRED_PROVIDER_PUBLISHER_NAV_CONFLICT | 本份额再投资净值、合同基准 |
| rolling_target_success | SOURCE_VALUE_CONFLICT | QUALITY_PAIRED_PROVIDER_PUBLISHER_NAV_CONFLICT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |
| team_months | COLLECTION_REQUIRED | MANAGER_ORIGINAL_RECORDS_NOT_REGISTERED | 完整正式团队时间线及原文；任职不替代治理 |

### 012835 招商景气精选股票-A：考察2025-04-30

- 产品：CN_PUBLIC_FUND:012835；固定分组：calibration；报告观察日：2024-12-31。
- 原件：[年度报告](https://static.cmfchina.com/fundarticle/20250328/20014837351079.pdf)；公开日2025-03-28；实际送出日2025-03-28；SHA `f9f7e9bd6473ca31485e90fc61088becf6b138f46f1b4afad6c5c14979eaa335`。
- [完整冻结指标包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/historical-primary/packets/2025-04-30-012835.json)。

| 已重建指标 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| cost_1y | 0.02897832512315270935960591133 | ratio | 2024-07-19 |
| key_person_coverage | 1 | ratio | 2025-04-30 |
| team_months | 10.48049281314168377823408624 | month | 2025-04-30 |

| 尚缺指标 | 状态 | 精确阻塞原因 | 需要的真实来源 |
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

- 产品：CN_PUBLIC_FUND:161032；固定分组：calibration；报告观察日：2024-12-31。
- 原件：[年度报告](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2025-03-31；实际送出日2025-03-31；SHA `6e8c212a7d3d1c55287ab59fa9cbb6cea37cc011a92f2f50f00d89649bbcbd57`。
- [完整冻结指标包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/historical-primary/packets/2025-04-30-013275.json)。

| 已重建指标 | 原始值 | 单位 | 观察日 |
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

| 尚缺指标 | 状态 | 精确阻塞原因 | 需要的真实来源 |
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

- 产品：CN_PUBLIC_FUND:161029；固定分组：calibration；报告观察日：2024-12-31。
- 原件：[年度报告](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2025-03-31；实际送出日2025-03-31；SHA `f99e498cafdd889755d8e0f36fdb74cf02605eb736a97cac9f22909dda8e2021`。
- [完整冻结指标包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/historical-primary/packets/2025-04-30-013330.json)。

| 已重建指标 | 原始值 | 单位 | 观察日 |
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

| 尚缺指标 | 状态 | 精确阻塞原因 | 需要的真实来源 |
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

- 产品：CN_PUBLIC_FUND:017960；固定分组：calibration；报告观察日：2024-12-31。
- 原件：[年度报告](https://static.cmfchina.com/fundarticle/20250328/20014556174077.pdf)；公开日2025-03-28；实际送出日2025-03-28；SHA `587836d2871ff14b102faa4987baa045d21c984ed3b09c4420c824d597732f1d`。
- [完整冻结指标包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/historical-primary/packets/2025-04-30-017960.json)。

| 已重建指标 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| cost_1y | 0.02887832512315270935960591133 | ratio | 2025-03-20 |

| 尚缺指标 | 状态 | 精确阻塞原因 | 需要的真实来源 |
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

- 产品：CN_PUBLIC_FUND:018124；固定分组：calibration；报告观察日：2024-12-31。
- 原件：[年度报告](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2025-03-28；实际送出日2025-03-28；SHA `79defe408c9b88a892d9b3727f4f5822ddd5b26e4f3ef05f8c403b4dd4bfd01c`。
- [完整冻结指标包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/historical-primary/packets/2025-04-30-018125.json)。

| 已重建指标 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| holder_pressure_band | 0 | ordinal:0,1,2 | 2024-12-31 |

| 尚缺指标 | 状态 | 精确阻塞原因 | 需要的真实来源 |
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

- 产品：CN_PUBLIC_FUND:003397；固定分组：validation；报告观察日：2024-12-31。
- 原件：[年度报告](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2025-03-28；实际送出日2025-03-28；SHA `cb0d84bf9fe05f084d1e89d945a60c2e5ac3aef52cc6954a1b9777b57c8a2d8f`。
- [完整冻结指标包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/historical-primary/packets/2025-04-30-018590.json)。

| 已重建指标 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| holder_pressure_band | 0 | ordinal:0,1,2 | 2024-12-31 |
| restricted_ratio | 0E+2 | ratio | 2024-12-31 |

| 尚缺指标 | 状态 | 精确阻塞原因 | 需要的真实来源 |
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

- 产品：CN_PUBLIC_FUND:001412；固定分组：calibration；报告观察日：2025-12-31。
- 原件：[年度报告](https://www.dbfund.com.cn/upload/pdf/1774921360946-德邦鑫星价值灵活配置混合型证券投资基金2025年年度报告.pdf)；公开日2026-03-31；实际送出日2026-03-31；SHA `6d8853f58caf4cfe115dd50a003263e35a1e800b2dbdd0b1db28591d354d5f60`。
- [完整冻结指标包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/historical-primary/packets/2026-04-30-002112.json)。

| 已重建指标 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| restricted_ratio | 0E+2 | ratio | 2025-12-31 |

| 尚缺指标 | 状态 | 精确阻塞原因 | 需要的真实来源 |
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

- 产品：CN_PUBLIC_FUND:001323；固定分组：validation；报告观察日：2025-12-31。
- 原件：[年度报告](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2026-03-31；实际送出日2026-03-31；SHA `c9ab72fd1e97355dab2d6a22752d19305c5c16423c227873a2250861b54ad216`。
- [完整冻结指标包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/historical-primary/packets/2026-04-30-002170.json)。

| 已重建指标 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| holder_pressure_band | 0 | ordinal:0,1,2 | 2025-12-31 |
| restricted_ratio | 0.00001943471127044849269614717122 | ratio | 2025-12-31 |

| 尚缺指标 | 状态 | 精确阻塞原因 | 需要的真实来源 |
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

- 产品：CN_PUBLIC_FUND:004604；固定分组：calibration；报告观察日：2025-12-31。
- 原件：[年度报告](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2026-03-31；实际送出日2026-03-31；SHA `6a86116eed88de01d562642f9afc5871b3b68e2be1dc5dbc0c90f3acb4b67a42`。
- [完整冻结指标包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/historical-primary/packets/2026-04-30-004605.json)。

| 已重建指标 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| 无 | — | — | — |

| 尚缺指标 | 状态 | 精确阻塞原因 | 需要的真实来源 |
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

- 产品：CN_PUBLIC_FUND:005311；固定分组：calibration；报告观察日：2025-12-31。
- 原件：[年度报告](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2026-03-30；实际送出日2026-03-30；SHA `5cc72fe50966beeb02a0be0dbd3f5cb6b6da9b226090dba54cb22428f4d30bad`。
- [完整冻结指标包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/historical-primary/packets/2026-04-30-005312.json)。

| 已重建指标 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| holder_pressure_band | 0 | ordinal:0,1,2 | 2025-12-31 |
| restricted_ratio | 0.05161118376630351603007199922 | ratio | 2025-12-31 |

| 尚缺指标 | 状态 | 精确阻塞原因 | 需要的真实来源 |
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

- 产品：CN_PUBLIC_FUND:006729；固定分组：calibration；报告观察日：2025-12-31。
- 原件：[年度报告](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2026-03-30；实际送出日2026-03-30；SHA `e65fa59ecbbcdabdede670f6a2bc78b8e432f5c2a2cec8e3ee3a60814c3ea52a`。
- [完整冻结指标包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/historical-primary/packets/2026-04-30-006730.json)。

| 已重建指标 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| restricted_ratio | 0.006317827737960594891884638597 | ratio | 2025-12-31 |

| 尚缺指标 | 状态 | 精确阻塞原因 | 需要的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| cost_1y | SOURCE_VALUE_UNRESOLVED | SUMMARY_ORIGINAL_REQUIRED | 本份额标准费用；综合运作费不叠加分项，ETF联接按合法减免核验 |
| extra_downside | SOURCE_VALUE_CONFLICT | QUALITY_PAIRED_PROVIDER_PUBLISHER_NAV_CONFLICT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | SOURCE_VALUE_CONFLICT | QUALITY_PAIRED_PROVIDER_PUBLISHER_NAV_CONFLICT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_VALUE_UNRESOLVED | RATING_MARKET_SECTION_MISSING:(?:9\|10)\.[67]\.1\s*管理人受调查或处罚 | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| holder_pressure_band | SOURCE_VALUE_UNRESOLVED | HOLDER_INTERVAL_ROWS_UNPARSED | 全期持有人阈值披露及申赎表；区间不当精确比例 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | COLLECTION_REQUIRED | FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | SOURCE_VALUE_CONFLICT | QUALITY_PAIRED_PROVIDER_PUBLISHER_NAV_CONFLICT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | SOURCE_VALUE_CONFLICT | QUALITY_PAIRED_PROVIDER_PUBLISHER_NAV_CONFLICT | 本份额再投资净值、合同基准 |
| relative_return_3y | SOURCE_VALUE_CONFLICT | QUALITY_PAIRED_PROVIDER_PUBLISHER_NAV_CONFLICT | 本份额再投资净值、合同基准 |
| rolling_target_success | SOURCE_VALUE_CONFLICT | QUALITY_PAIRED_PROVIDER_PUBLISHER_NAV_CONFLICT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |
| team_months | COLLECTION_REQUIRED | MANAGER_ORIGINAL_RECORDS_NOT_REGISTERED | 完整正式团队时间线及原文；任职不替代治理 |

### 012835 招商景气精选股票-A：考察2026-04-30

- 产品：CN_PUBLIC_FUND:012835；固定分组：calibration；报告观察日：2025-12-31。
- 原件：[年度报告](https://static.cmfchina.com/fundarticle/20260331/20021470156969.pdf)；公开日2026-03-31；实际送出日2026-03-31；SHA `1cfd02918f462d726923407a2cb1c0914dc154eb8489e2240881f3de6270999e`。
- [完整冻结指标包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/historical-primary/packets/2026-04-30-012835.json)。

| 已重建指标 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| cost_1y | 0.02897832512315270935960591133 | ratio | 2025-07-18 |
| key_person_coverage | 1 | ratio | 2026-04-30 |
| team_months | 22.47227926078028747433264887 | month | 2026-04-30 |

| 尚缺指标 | 状态 | 精确阻塞原因 | 需要的真实来源 |
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

- 产品：CN_PUBLIC_FUND:161032；固定分组：calibration；报告观察日：2025-12-31。
- 原件：[年度报告](https://www.fullgoal.com.cn/wbs-file/fund_report/20260331/CN_50100000_161032_FB010010_20260005.pdf)；公开日2026-03-31；实际送出日2026-03-31；SHA `a75af2c5a78bc53cf8549f0a4a58568994c26be39b31b3cc1ddb0717b9769a37`。
- [完整冻结指标包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/historical-primary/packets/2026-04-30-013275.json)。

| 已重建指标 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| extra_downside | 0.005690868552110240297156633769485035027904 | ratio/year^0.5 | 2026-04-30 |
| extra_drawdown | 0.0134029821580542697774233467210188984949 | ratio | 2026-04-30 |
| monthly_target_success | 0.5555555555555555555555555555555555555556 | ratio | 2026-04-30 |
| relative_return_1y | 0.034256279887329339975939383988920597248 | ratio | 2026-04-30 |
| relative_return_3y | 0.045625120321092600084912618191671882967 | ratio/year | 2026-04-30 |
| rolling_target_success | 1 | ratio | 2026-04-30 |
| tracking_error | 0.01987162033533640009671412584932458043609 | ratio/year^0.5 | 2026-04-30 |

| 尚缺指标 | 状态 | 精确阻塞原因 | 需要的真实来源 |
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

- 产品：CN_PUBLIC_FUND:161029；固定分组：calibration；报告观察日：2025-12-31。
- 原件：[年度报告](https://www.fullgoal.com.cn/wbs-file/fund_report/20260331/CN_50100000_161029_FB010010_20260002.pdf)；公开日2026-03-31；实际送出日2026-03-31；SHA `db48c4b8567c4b96b4474da3a27b10c9df728c715fa0199a9638802f9e2f123d`。
- [完整冻结指标包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/historical-primary/packets/2026-04-30-013330.json)。

| 已重建指标 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| extra_downside | 0.003869488129732834978839873873601977887193 | ratio/year^0.5 | 2026-04-30 |
| extra_drawdown | 0.0102434557399193257679160938618780837581 | ratio | 2026-04-30 |
| monthly_target_success | 0.5277777777777777777777777777777777777778 | ratio | 2026-04-30 |
| relative_return_1y | 0.035156668040635749476472015469402591418 | ratio | 2026-04-30 |
| relative_return_3y | 0.051972025382825634310776231545853979514 | ratio/year | 2026-04-30 |
| rolling_target_success | 1 | ratio | 2026-04-30 |
| tracking_error | 0.01635608691931156852587044228336149237116 | ratio/year^0.5 | 2026-04-30 |

| 尚缺指标 | 状态 | 精确阻塞原因 | 需要的真实来源 |
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

- 产品：CN_PUBLIC_FUND:017960；固定分组：calibration；报告观察日：2025-12-31。
- 原件：[年度报告](https://static.cmfchina.com/fundarticle/20260331/20021570786044.pdf)；公开日2026-03-31；实际送出日2026-03-31；SHA `fb5c071960066dbece4a54180f13f90532bf11edcd2a73bf99f9bd16cd5d9e0d`。
- [完整冻结指标包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/historical-primary/packets/2026-04-30-017960.json)。

| 已重建指标 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| cost_1y | 0.02917832512315270935960591133 | ratio | 2026-03-20 |
| key_person_coverage | 1 | ratio | 2026-04-30 |
| team_months | 36 | month | 2026-04-30 |

| 尚缺指标 | 状态 | 精确阻塞原因 | 需要的真实来源 |
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

- 产品：CN_PUBLIC_FUND:018124；固定分组：calibration；报告观察日：2025-12-31。
- 原件：[年度报告](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2026-03-31；实际送出日2026-03-31；SHA `1b47f8dc2c4c234cc6f0f24d5c3833146e5a3b80f1b176f7078f2872dfe87618`。
- [完整冻结指标包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/historical-primary/packets/2026-04-30-018125.json)。

| 已重建指标 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| holder_pressure_band | 0 | ordinal:0,1,2 | 2025-12-31 |

| 尚缺指标 | 状态 | 精确阻塞原因 | 需要的真实来源 |
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

- 产品：CN_PUBLIC_FUND:003397；固定分组：validation；报告观察日：2025-12-31。
- 原件：[年度报告](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2026-03-28；实际送出日2026-03-28；SHA `9b1c43e2cd18cee8054149601ce787faf8f608b810c180ea78c5ffb49647a96e`。
- [完整冻结指标包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/historical-primary/packets/2026-04-30-018590.json)。

| 已重建指标 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| holder_pressure_band | 0 | ordinal:0,1,2 | 2025-12-31 |
| restricted_ratio | 0E+2 | ratio | 2025-12-31 |

| 尚缺指标 | 状态 | 精确阻塞原因 | 需要的真实来源 |
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

## 本轮冻结证据

- [当前市场原件盘点](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/inventory.json)
- [22份历史主输入](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/historical-primary/result.json)
- [22份原件身份与时间独立回放](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/historical-primary/independent-report-identity.json)
- [28字段独立算术和来源冲突](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/historical-primary/independent-arithmetic-replay.json)
- [六包三种子完整重建](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/historical-primary/hash-seed-replay.json)
- [71包跨月隔离试算](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/cross-month-experiment.json)
- [正式结果只读回查](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/formal-readback.json)
- [既有字段与来源保全](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/preservation-and-source-drift.json)
- [353项工程回归](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run13/engineering-checks.json)
