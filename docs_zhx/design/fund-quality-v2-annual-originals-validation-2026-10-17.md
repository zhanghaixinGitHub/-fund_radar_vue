# 基金质量V2：年度原件解析修复与独立核验

生成时间：2026-10-17T06:16:23.184424+08:00。

## 当前结果与验收边界

- 历史输入仍为22包、11个既有产品、2025-04-30/2026-04-30两个考察月，共79个原始字段；本轮新增6个，前批73个数值、单位、观察日及来源绑定不变。
- 新增六字段全部由独立PDF读取与算术核验：三只产品90条受限证券记录、净资产分母和完整资产范围；另核验三只产品的持有人结论。现有成对收益历史40字段也重新独立复算，二者合计46，不能与79相加为125。
- 当前市场重新查询49份额、48产品，仍为198原始字段；旧497件不同哈希来源及15个旧完整来源包保留。
- 370项工程回归及Ruff通过；22份主报告身份/时间检查、六包在1/17/999哈希种子完整重建均通过。
- 完整八维包、合格完整校准产品和验证产品仍为0；四类型跨月隔离试算NOT_READY，未产生锚点、V2总分或等级。本次是原件和算术独立复核，不是新的盲法产品验收。
- 正式评分于2026-10-17T06:15:56.429708+08:00只读回查，49条当前结果一致；保留全部旧批次和真实日期。未激活V2、未改API/日常页面，也未改00:30任务或另建任务。

## 真实原件新增字段

| 份额 | 考察日 | 字段 | 原始值 | 观察日 | 原始来源 |
| --- | --- | --- | ---: | --- | --- |
| 002112 | 2026-04-30 | holder_pressure_band | 1 | 2025-12-31 | [原件](https://www.dbfund.com.cn/upload/pdf/1774921360946-德邦鑫星价值灵活配置混合型证券投资基金2025年年度报告.pdf) |
| 004605 | 2026-04-30 | restricted_ratio | 0.004285057376838081646117930044 | 2025-12-31 | [原件](https://np-cnotice-fund.eastmoney.com/api/content/ann) |
| 013275 | 2026-04-30 | holder_pressure_band | 0 | 2025-12-31 | [原件](https://www.fullgoal.com.cn/wbs-file/fund_report/20260331/CN_50100000_161032_FB010010_20260005.pdf) |
| 013275 | 2026-04-30 | restricted_ratio | 0.0001073078989384266121593457973 | 2025-12-31 | [原件](https://www.fullgoal.com.cn/wbs-file/fund_report/20260331/CN_50100000_161032_FB010010_20260005.pdf) |
| 013330 | 2026-04-30 | holder_pressure_band | 0 | 2025-12-31 | [原件](https://www.fullgoal.com.cn/wbs-file/fund_report/20260331/CN_50100000_161029_FB010010_20260002.pdf) |
| 013330 | 2026-04-30 | restricted_ratio | 0.0006373986126962844425050295694 | 2025-12-31 | [原件](https://www.fullgoal.com.cn/wbs-file/fund_report/20260331/CN_50100000_161029_FB010010_20260002.pdf) |

受限资产（人民币元）：013275为230,397.73/2,147,071,485.69；013330为503,595.92/790,080,037.78；004605为4,104,397.88/957,839,655.12。只用逐条受限估值及同报告净资产，不用回购融资余额代替质押资产。

## 解析问题、修复与独立证据

- 013275/013330原PDF的小节编号实际存在，但pypdf抽取丢失；页底“51”也被抽取到交易所回购否定句中间。修复仅在完整质押父节内接纳两个明确市场标题，严格验证顺序；首行裸页码只有与物理页序连续三页一致且报告身份成立才可移除。原页文本、删除位置及前后文本SHA均保留，表内股数和金额不变。
- 独立pdfplumber/pdfminer按原PDF实际表格网格读取013275的26行、013330的27行和004605的37行，逐行比证券代码、数量、成本、估值；另按实际页底坐标核验两份79页及一份85页文件，不复用主解析的首行规则。
- 受限比例还逐项核银行间/交易所明确无质押、停牌和证券出借明确无持有、其余资产可及时变现的完整范围原句，并从资产负债表当前年度列读取净资产。不存在未知项目补零。
- 持有人标题只有在紧邻“影响投资者决策的其他重要信息”父节中才可采用；遇到下一父节即停止，避免把其他事项的“无”串入。013275/013330均为当报告全期明确无达到20%持有人，取0。
- 002112物理第64页几何网格显示申购和赎回均169,915,200.14份，因此净变动唯一为0；期初、期末和占比横杠仍为未知，不补成0。2025-06-09至2025-08-06曾达到20%，因此持有人档为1。这不代表没有总赎回、没有集中持有人或没有流动性风险。
- 004605初次读取转载关联附件得到HTTP200、987字节脚本，拒收并保存原响应。之后沿管理人官网实际公告104045的下载链接，取得85页年报，与转载主包37行和分母完全一致。该PDF取得时间晚于本次主包冻结，只作为后取得的独立佐证；不倒填取得时间、不改主包来源。

管理人原PDF：[004605年度报告](https://www.fullgoal.com.cn/wbs-file/fund_report/20260331/CN_50100000_004604_FB010010_20260002.pdf)。公开送出日2026-03-31；实际本次取得时间2026-10-17T06:11:10.177158+08:00。

## 方法本身尚未具备的参照

目前可适用类型已核验的43份额、42个独立产品，全部仍缺现金目标、策略容量参照和完整治理核查。新增更多同产品月份无法消除这些共同缺口。

| 字段 | 实际原因（适用份额数量） | 不能冒充的证据 |
| --- | --- | --- |
| cash_target_deviation | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL：27；CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT：16 | 现金加一年内政府债的5%下限，不是纯现金目标区间 |
| capacity_pressure | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED：43 | 法定运作预警、募集上限、成交负荷，不是已冻结策略容量上下界 |
| governance_state | KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED：14；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED：29 | 未搜到、管理人自述或布尔标志，不是完整范围及独立复核 |

这些分别属于方法参照未落实和真实窗口/适用性待核，不笼统归因于权限不足。后续应先从真实资料验证候选指标能否测量；必要的定义修改须另冻结契约和验证方案，不能静默改公式、免除维度或填零。

## 22份历史输入逐基金结果与缺口

### 002112 德邦鑫星价值灵活配置混合-C：考察2025-04-30

- CN_PUBLIC_FUND:001412；固定calibration侧；经济观察日2024-12-31。
- [主年报](https://www.dbfund.com.cn/upload/pdf/1743380674851-德邦鑫星价值灵活配置混合型证券投资基金2024年年度报告.pdf)；公开日2025-03-31；SHA `7c119b15d297b2f9627942d7827fa66a1cc68396466a4792585449623cb68abc`。
- [完整原始包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/packets/2025-04-30-002112.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| holder_pressure_band | 2 | ordinal:0,1,2 | 2024-12-31 |
| restricted_ratio | 0E+2 | ratio | 2024-12-31 |

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
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

- CN_PUBLIC_FUND:001323；固定validation侧；经济观察日2024-12-31。
- [主年报](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2025-03-31；SHA `ec5614f19ce821af2ac40607999e03642b6e4beeec07c5eb7cee614f1ba7a83f`。
- [完整原始包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/packets/2025-04-30-002170.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| holder_pressure_band | 0 | ordinal:0,1,2 | 2024-12-31 |

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
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

- CN_PUBLIC_FUND:004604；固定calibration侧；经济观察日2024-12-31。
- [主年报](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2025-03-31；SHA `e5784a8a3c0d84d768dcc7b38156d5c53cf2aa6875727325b048d201717cba6e`。
- [完整原始包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/packets/2025-04-30-004605.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| restricted_ratio | 0.0004677658138806089264928822738 | ratio | 2024-12-31 |

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
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

- CN_PUBLIC_FUND:005311；固定calibration侧；经济观察日2024-12-31。
- [主年报](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2025-03-29；SHA `06e6c08810fefa065ea4d28ef958ef5881679a10ddc2fa7e11a715dc6bbee1c4`。
- [完整原始包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/packets/2025-04-30-005312.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| holder_pressure_band | 0 | ordinal:0,1,2 | 2024-12-31 |
| restricted_ratio | 0.0004216072296382003752711994124 | ratio | 2024-12-31 |

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
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

- CN_PUBLIC_FUND:006729；固定calibration侧；经济观察日2024-12-31。
- [主年报](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2025-03-29；SHA `52b50aa751d8377321f43cff2e42ad3d89a9feac3cf639b0eddc6c4aa650ca55`。
- [完整原始包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/packets/2025-04-30-006730.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| extra_downside | 0.02576423133259565792314263729261898274315 | ratio/year^0.5 | 2025-04-30 |
| extra_drawdown | 0.0557906445828548020587972665820349397715 | ratio | 2025-04-30 |
| monthly_target_success | 0.5555555555555555555555555555555555555556 | ratio | 2025-04-30 |
| relative_return_1y | -0.003217486893161035004778565418141697138 | ratio | 2025-04-30 |
| relative_return_3y | 0.026138171512195302291792570949580906759 | ratio/year | 2025-04-30 |
| restricted_ratio | 0.0006813776598448287056239903359 | ratio | 2024-12-31 |
| rolling_target_success | 0.48 | ratio | 2025-04-30 |

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
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

- CN_PUBLIC_FUND:012835；固定calibration侧；经济观察日2024-12-31。
- [主年报](https://static.cmfchina.com/fundarticle/20250328/20014837351079.pdf)；公开日2025-03-28；SHA `f9f7e9bd6473ca31485e90fc61088becf6b138f46f1b4afad6c5c14979eaa335`。
- [完整原始包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/packets/2025-04-30-012835.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| cost_1y | 0.02897832512315270935960591133 | ratio | 2024-07-19 |
| key_person_coverage | 1 | ratio | 2025-04-30 |
| team_months | 10.48049281314168377823408624 | month | 2025-04-30 |

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
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

- CN_PUBLIC_FUND:161032；固定calibration侧；经济观察日2024-12-31。
- [主年报](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2025-03-31；SHA `6e8c212a7d3d1c55287ab59fa9cbb6cea37cc011a92f2f50f00d89649bbcbd57`。
- [完整原始包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/packets/2025-04-30-013275.json)。

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

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
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

- CN_PUBLIC_FUND:161029；固定calibration侧；经济观察日2024-12-31。
- [主年报](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2025-03-31；SHA `f99e498cafdd889755d8e0f36fdb74cf02605eb736a97cac9f22909dda8e2021`。
- [完整原始包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/packets/2025-04-30-013330.json)。

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

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
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

- CN_PUBLIC_FUND:017960；固定calibration侧；经济观察日2024-12-31。
- [主年报](https://static.cmfchina.com/fundarticle/20250328/20014556174077.pdf)；公开日2025-03-28；SHA `587836d2871ff14b102faa4987baa045d21c984ed3b09c4420c824d597732f1d`。
- [完整原始包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/packets/2025-04-30-017960.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| cost_1y | 0.02887832512315270935960591133 | ratio | 2025-03-20 |

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
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

- CN_PUBLIC_FUND:018124；固定calibration侧；经济观察日2024-12-31。
- [主年报](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2025-03-28；SHA `79defe408c9b88a892d9b3727f4f5822ddd5b26e4f3ef05f8c403b4dd4bfd01c`。
- [完整原始包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/packets/2025-04-30-018125.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| holder_pressure_band | 0 | ordinal:0,1,2 | 2024-12-31 |

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
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

- CN_PUBLIC_FUND:003397；固定validation侧；经济观察日2024-12-31。
- [主年报](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2025-03-28；SHA `cb0d84bf9fe05f084d1e89d945a60c2e5ac3aef52cc6954a1b9777b57c8a2d8f`。
- [完整原始包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/packets/2025-04-30-018590.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| holder_pressure_band | 0 | ordinal:0,1,2 | 2024-12-31 |
| restricted_ratio | 0E+2 | ratio | 2024-12-31 |

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
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

- CN_PUBLIC_FUND:001412；固定calibration侧；经济观察日2025-12-31。
- [主年报](https://www.dbfund.com.cn/upload/pdf/1774921360946-德邦鑫星价值灵活配置混合型证券投资基金2025年年度报告.pdf)；公开日2026-03-31；SHA `6d8853f58caf4cfe115dd50a003263e35a1e800b2dbdd0b1db28591d354d5f60`。
- [完整原始包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/packets/2026-04-30-002112.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| holder_pressure_band | 1 | ordinal:0,1,2 | 2025-12-31 |
| restricted_ratio | 0E+2 | ratio | 2025-12-31 |

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
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

### 002170 东吴移动互联灵活配置混合-C：考察2026-04-30

- CN_PUBLIC_FUND:001323；固定validation侧；经济观察日2025-12-31。
- [主年报](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2026-03-31；SHA `c9ab72fd1e97355dab2d6a22752d19305c5c16423c227873a2250861b54ad216`。
- [完整原始包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/packets/2026-04-30-002170.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| holder_pressure_band | 0 | ordinal:0,1,2 | 2025-12-31 |
| restricted_ratio | 0.00001943471127044849269614717122 | ratio | 2025-12-31 |

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
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

- CN_PUBLIC_FUND:004604；固定calibration侧；经济观察日2025-12-31。
- [主年报](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2026-03-31；SHA `6a86116eed88de01d562642f9afc5871b3b68e2be1dc5dbc0c90f3acb4b67a42`。
- [完整原始包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/packets/2026-04-30-004605.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| restricted_ratio | 0.004285057376838081646117930044 | ratio | 2025-12-31 |

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| cost_1y | SOURCE_VALUE_UNRESOLVED | SUMMARY_ORIGINAL_REQUIRED | 本份额标准费用；综合运作费不叠加分项，ETF联接按合法减免核验 |
| extra_downside | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_VALUE_UNRESOLVED | KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
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

### 005312 万家经济新动能混合-C：考察2026-04-30

- CN_PUBLIC_FUND:005311；固定calibration侧；经济观察日2025-12-31。
- [主年报](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2026-03-30；SHA `5cc72fe50966beeb02a0be0dbd3f5cb6b6da9b226090dba54cb22428f4d30bad`。
- [完整原始包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/packets/2026-04-30-005312.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| holder_pressure_band | 0 | ordinal:0,1,2 | 2025-12-31 |
| restricted_ratio | 0.05161118376630351603007199922 | ratio | 2025-12-31 |

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
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

- CN_PUBLIC_FUND:006729；固定calibration侧；经济观察日2025-12-31。
- [主年报](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2026-03-30；SHA `e65fa59ecbbcdabdede670f6a2bc78b8e432f5c2a2cec8e3ee3a60814c3ea52a`。
- [完整原始包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/packets/2026-04-30-006730.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| extra_downside | 0.02691105568854857569770529520385510493437 | ratio/year^0.5 | 2026-04-30 |
| extra_drawdown | 0.0557906445828548020587972665820349397715 | ratio | 2026-04-30 |
| monthly_target_success | 0.5833333333333333333333333333333333333333 | ratio | 2026-04-30 |
| relative_return_1y | 0.162811465127833829971093686670207031242 | ratio | 2026-04-30 |
| relative_return_3y | 0.035127162894243960132378864147642704670 | ratio/year | 2026-04-30 |
| restricted_ratio | 0.006317827737960594891884638597 | ratio | 2025-12-31 |
| rolling_target_success | 0.56 | ratio | 2026-04-30 |

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
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

- CN_PUBLIC_FUND:012835；固定calibration侧；经济观察日2025-12-31。
- [主年报](https://static.cmfchina.com/fundarticle/20260331/20021470156969.pdf)；公开日2026-03-31；SHA `1cfd02918f462d726923407a2cb1c0914dc154eb8489e2240881f3de6270999e`。
- [完整原始包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/packets/2026-04-30-012835.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| cost_1y | 0.02897832512315270935960591133 | ratio | 2025-07-18 |
| key_person_coverage | 1 | ratio | 2026-04-30 |
| team_months | 22.47227926078028747433264887 | month | 2026-04-30 |

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
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

- CN_PUBLIC_FUND:161032；固定calibration侧；经济观察日2025-12-31。
- [主年报](https://www.fullgoal.com.cn/wbs-file/fund_report/20260331/CN_50100000_161032_FB010010_20260005.pdf)；公开日2026-03-31；SHA `a75af2c5a78bc53cf8549f0a4a58568994c26be39b31b3cc1ddb0717b9769a37`。
- [完整原始包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/packets/2026-04-30-013275.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| extra_downside | 0.005690868552110240297156633769485035027904 | ratio/year^0.5 | 2026-04-30 |
| extra_drawdown | 0.0134029821580542697774233467210188984949 | ratio | 2026-04-30 |
| holder_pressure_band | 0 | ordinal:0,1,2 | 2025-12-31 |
| monthly_target_success | 0.5555555555555555555555555555555555555556 | ratio | 2026-04-30 |
| relative_return_1y | 0.034256279887329339975939383988920597248 | ratio | 2026-04-30 |
| relative_return_3y | 0.045625120321092600084912618191671882967 | ratio/year | 2026-04-30 |
| restricted_ratio | 0.0001073078989384266121593457973 | ratio | 2025-12-31 |
| rolling_target_success | 1 | ratio | 2026-04-30 |
| tracking_error | 0.01987162033533640009671412584932458043609 | ratio/year^0.5 | 2026-04-30 |

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| cost_1y | SOURCE_VALUE_UNRESOLVED | SUMMARY_ORIGINAL_REQUIRED | 本份额标准费用；综合运作费不叠加分项，ETF联接按合法减免核验 |
| governance_state | SOURCE_VALUE_UNRESOLVED | KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 资产总额作分母，负债单列；同日分类和指数全成分、完整资产账簿；详见industry_structure_policy |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 含现金的全资产穿透权重、同期目标成分、发行人映射 |
| key_person_coverage | COLLECTION_REQUIRED | FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| team_months | COLLECTION_REQUIRED | MANAGER_ORIGINAL_RECORDS_NOT_REGISTERED | 完整正式团队时间线及原文；任职不替代治理 |

### 013330 富国中证银行指数-C：考察2026-04-30

- CN_PUBLIC_FUND:161029；固定calibration侧；经济观察日2025-12-31。
- [主年报](https://www.fullgoal.com.cn/wbs-file/fund_report/20260331/CN_50100000_161029_FB010010_20260002.pdf)；公开日2026-03-31；SHA `db48c4b8567c4b96b4474da3a27b10c9df728c715fa0199a9638802f9e2f123d`。
- [完整原始包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/packets/2026-04-30-013330.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| extra_downside | 0.003869488129732834978839873873601977887193 | ratio/year^0.5 | 2026-04-30 |
| extra_drawdown | 0.0102434557399193257679160938618780837581 | ratio | 2026-04-30 |
| holder_pressure_band | 0 | ordinal:0,1,2 | 2025-12-31 |
| monthly_target_success | 0.5277777777777777777777777777777777777778 | ratio | 2026-04-30 |
| relative_return_1y | 0.035156668040635749476472015469402591418 | ratio | 2026-04-30 |
| relative_return_3y | 0.051972025382825634310776231545853979514 | ratio/year | 2026-04-30 |
| restricted_ratio | 0.0006373986126962844425050295694 | ratio | 2025-12-31 |
| rolling_target_success | 1 | ratio | 2026-04-30 |
| tracking_error | 0.01635608691931156852587044228336149237116 | ratio/year^0.5 | 2026-04-30 |

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| cost_1y | SOURCE_VALUE_UNRESOLVED | SUMMARY_ORIGINAL_REQUIRED | 本份额标准费用；综合运作费不叠加分项，ETF联接按合法减免核验 |
| governance_state | SOURCE_VALUE_UNRESOLVED | KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 资产总额作分母，负债单列；同日分类和指数全成分、完整资产账簿；详见industry_structure_policy |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 含现金的全资产穿透权重、同期目标成分、发行人映射 |
| key_person_coverage | COLLECTION_REQUIRED | FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| team_months | COLLECTION_REQUIRED | MANAGER_ORIGINAL_RECORDS_NOT_REGISTERED | 完整正式团队时间线及原文；任职不替代治理 |

### 017960 招商趋势领航混合-A：考察2026-04-30

- CN_PUBLIC_FUND:017960；固定calibration侧；经济观察日2025-12-31。
- [主年报](https://static.cmfchina.com/fundarticle/20260331/20021570786044.pdf)；公开日2026-03-31；SHA `fb5c071960066dbece4a54180f13f90532bf11edcd2a73bf99f9bd16cd5d9e0d`。
- [完整原始包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/packets/2026-04-30-017960.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| cost_1y | 0.02917832512315270935960591133 | ratio | 2026-03-20 |
| key_person_coverage | 1 | ratio | 2026-04-30 |
| team_months | 36 | month | 2026-04-30 |

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
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

- CN_PUBLIC_FUND:018124；固定calibration侧；经济观察日2025-12-31。
- [主年报](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2026-03-31；SHA `1b47f8dc2c4c234cc6f0f24d5c3833146e5a3b80f1b176f7078f2872dfe87618`。
- [完整原始包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/packets/2026-04-30-018125.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| holder_pressure_band | 0 | ordinal:0,1,2 | 2025-12-31 |

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
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

- CN_PUBLIC_FUND:003397；固定validation侧；经济观察日2025-12-31。
- [主年报](https://np-cnotice-fund.eastmoney.com/api/content/ann)；公开日2026-03-28；SHA `9b1c43e2cd18cee8054149601ce787faf8f608b810c180ea78c5ffb49647a96e`。
- [完整原始包](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/packets/2026-04-30-018590.json)。

| 已重建字段 | 原始值 | 单位 | 观察日 |
| --- | ---: | --- | --- |
| holder_pressure_band | 0 | ordinal:0,1,2 | 2025-12-31 |
| restricted_ratio | 0E+2 | ratio | 2025-12-31 |

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
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

## 当前市场逐基金剩余缺口

以下来自本次实际查询。已有原件待解析、窗口不全、参照未定义和当前方法不支持分别保留；渠道不可读不自动认定账号权限不足。原始包保存逐来源URL、SHA、取得时间、解析错误和拒收原因。

#### 001021 华夏亚债中国债券指数-A

- 产品CN_PUBLIC_FUND:001021；分类核验METHOD_CURRENTLY_UNSUPPORTED；原始字段3项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/af822faf3845c9357cb210849e66215b0939004f5e63c9bc89f24c6e38c04c30.json)。
- 已取得：[half](https://fund.chinaamc.com/upload/resources/file/2026/08/31/16678b32a31142048063d8ddeed8c8f1.pdf)；[prospectus](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[summary](https://fund.chinaamc.com/upload/resources/file/2026/05/29/8d6756a62b35450cb50157e25c01d538.pdf)。
- 当前候选类型不支持；不把通用候选字段盘点当作该产品可评级的证明。

#### 001632 天弘中证食品饮料ETF联接-C

- 产品CN_PUBLIC_FUND:001631；分类核验REBUILT_FROM_ORIGINALS；原始字段3项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/cd31abc824c338903e9238932ae4cbc557075a79d30610aec22f92a8339321f2.json)。
- 已取得：[half](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[prospectus](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[summary](https://np-cnotice-fund.eastmoney.com/api/content/ann)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 资产总额作分母，负债单列；同日分类和指数全成分、完整资产账簿；详见industry_structure_policy |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 含现金的全资产穿透权重、同期目标成分、发行人映射 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | LINK_AND_TARGET_FULL_RESTRICTIONS_REQUIRED | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |
| tracking_error | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；不除以各自宽松程度不同的合同上限 |

#### 002112 德邦鑫星价值灵活配置混合-C

- 产品CN_PUBLIC_FUND:001412；分类核验REBUILT_FROM_ORIGINALS；原始字段4项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/824e8e03f0cedc4aecdf0e32a1e90d027baaef35530419fb727172e8b570e294.json)。
- 已取得：。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

#### 002170 东吴移动互联灵活配置混合-C

- 产品CN_PUBLIC_FUND:001323；分类核验REBUILT_FROM_ORIGINALS；原始字段4项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/5fc61be05eb7cb962ddf4904755534bc95c6d8a128affcafe93103ea2e6678a9.json)。
- 已取得：[half](https://www.scfund.com.cn/upload2010/2026/08/31/025800808_402_b657fb72-b9d2-39eb-bf1d-b442d31f429b.pdf)；[prospectus](https://www.scfund.com.cn/upload2010/2025/12/05/015149665_402_883637fb-f9f3-3add-a678-5f4a5f31f6da.pdf)；[summary](https://www.scfund.com.cn/upload2010/2025/12/05/014946034_402_19a5c364-b597-38b4-a141-8ca42f371610.pdf)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

#### 004237 中欧新蓝筹灵活配置混合-C

- 产品CN_PUBLIC_FUND:166002；分类核验REBUILT_FROM_ORIGINALS；原始字段4项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/b750810be239c668a1b51a13fa72a604b5c94f779407339c462f4bcb5b5e57fc.json)。
- 已取得：[half](https://www.zofund.com/2026/wsnotice/20260831/a846d5afafc44d2aa3686fbd79ac512a.pdf)；[prospectus](https://www.zofund.com/tempdir/minisite/20260709/2ea5dde9-0cd8-4994-a2f5-17159f6b1e4c_1783593065972.pdf)；[summary](https://www.zofund.com/tempdir/minisite/20260519/02691006-b380-4450-ae0d-ad14c659f5af_1779185179106.pdf)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | FULL_ASSET_RESTRICTION_SCOPE_NOT_EXPLICIT | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

#### 004605 富国新活力灵活配置混合-C

- 产品CN_PUBLIC_FUND:004604；分类核验REBUILT_FROM_ORIGINALS；原始字段4项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/4e0b5387f8e68086cd209f5cc8597d341b9b39f0c8c12b31fba99cb88d1b2bd2.json)。
- 已取得：[half](https://wap.fullgoal.com.cn/wbs-file/fund_report/20260831/CN_50100000_004604_FB020010_20260015.pdf)；[prospectus](https://wap.fullgoal.com.cn/wbs-file/fund_report/20250526/CN_50100000_004604_FA010030_20250001.pdf)；[summary](https://np-cnotice-fund.eastmoney.com/api/content/ann)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

#### 005187 长安鑫兴灵活配置混合-C

- 产品CN_PUBLIC_FUND:005186；分类核验REBUILT_FROM_ORIGINALS；原始字段3项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/cd7ce05f3384d6e6dbe325c68a1b5522cb994e54e104928feaf1fd0239abafc5.json)。
- 已取得：[half](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[prospectus](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[summary](https://np-cnotice-fund.eastmoney.com/api/content/ann)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | RATING_MARKET_SECTION_MISSING:(?m)^7\.3\s+[^\n]*股票\s*投\s*资\s*明\s*细 | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

#### 005284 华商可转债债券-C

- 产品CN_PUBLIC_FUND:005273；分类核验METHOD_CURRENTLY_UNSUPPORTED；原始字段2项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/30df05f0cc649bc60b1a5d890cadaf0410eaa41b54dc5b3e6169104ace16d257.json)。
- 已取得：[half](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[prospectus](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[summary](https://np-cnotice-fund.eastmoney.com/api/content/ann)。
- 当前候选类型不支持；不把通用候选字段盘点当作该产品可评级的证明。

#### 005312 万家经济新动能混合-C

- 产品CN_PUBLIC_FUND:005311；分类核验REBUILT_FROM_ORIGINALS；原始字段3项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/e743b903ce0cd4e5a47795d72a866f16443e4ed890a57413eb2ff849698f362e.json)。
- 已取得：[half](https://www.wjasset.com/upload/pdf/1787908209251-wanjiajingjixindongnenghunhexingzhengquantouzijijin2026nianzhongqibaogao.pdf)；[prospectus](https://www.wjasset.com/upload/pdf/1787226214884-wjjjxdnhhxzqtzjjgxzmsms(2026nd1h).pdf)；[summary](https://www.wjasset.com/upload/pdf/1787226162589-wjjjxdnhhxzqtzjjjjcpzlgy(gx).pdf)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| holder_pressure_band | SOURCE_VALUE_UNRESOLVED | HOLDER_FLOW_VALUE_MISSING | 全期持有人阈值披露及申赎表；区间不当精确比例 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

#### 006038 大成景恒混合-C

- 产品CN_PUBLIC_FUND:090019；分类核验REBUILT_FROM_ORIGINALS；原始字段4项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/21b3c0b7221c199d1ea84cc183e88b38ccaa3f41f24a921f8002ea7b60386390.json)。
- 已取得：[half](https://www.dcfund.com.cn/plat_files/upload/ann_upload/20260828/202608281787877319535.pdf)；[prospectus](https://www.dcfund.com.cn/plat_files/upload/ann_upload/20260724/202607241784895235245.pdf)；[summary](https://www.dcfund.com.cn/plat_files/upload/ann_upload/20260630/202606301782775844673.pdf)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

#### 006476 南方原油(QDII-LOF-FOF)-C

- 产品CN_PUBLIC_FUND:501018；分类核验METHOD_CURRENTLY_UNSUPPORTED；原始字段3项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/11a75a03503cd9c167fdb497c85c11b767deb29439f747c3883230747ffd9ca0.json)。
- 已取得：[half](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[prospectus](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[summary](https://np-cnotice-fund.eastmoney.com/api/content/ann)。
- 当前候选类型不支持；不把通用候选字段盘点当作该产品可评级的证明。

#### 006730 万家中证500指数增强-C

- 产品CN_PUBLIC_FUND:006729；分类核验REBUILT_FROM_ORIGINALS；原始字段10项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/c8298ec53e6114adc469ac9cc8c0e3ecaa34743aa400102bff51c55ff5e84086.json)。
- 已取得：[half](https://www.wjasset.com/upload/pdf/1787908232767-wjzz500zszqxfqszqtzjj2026nzqbg.pdf)；[prospectus](https://www.wjasset.com/upload/pdf/1785929889692-wjzz500zszqxfqszqtzjjgxzmsms(2026nd1h).pdf)；[summary](https://www.wjasset.com/upload/pdf/1785929834329-wjzz500zszqxfqszqtzjjjjcpzlgy(gx).pdf)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |

#### 007045 博道沪深300指数增强-C

- 产品CN_PUBLIC_FUND:007044；分类核验REBUILT_FROM_ORIGINALS；原始字段2项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/e449ab7f46abecb3d77039de899cc28ee79db832b617537bce8151841e3432e9.json)。
- 已取得：[half](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[prospectus](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[summary](https://np-cnotice-fund.eastmoney.com/api/content/ann)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| holder_pressure_band | SOURCE_STATEMENT_UNAVAILABLE | REPRINT_THRESHOLD_STATEMENT_NOT_PRESENT_DIRECT_REPORT_CONFIRMATION_REQUIRED | 全期持有人阈值披露及申赎表；区间不当精确比例 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | RATING_MARKET_SECTION_MISSING:[56]\.4\.12\.4\s*期末参与转融通 | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

#### 007356 汇添富科技创新灵活配置混合-C

- 产品CN_PUBLIC_FUND:007355；分类核验REBUILT_FROM_ORIGINALS；原始字段4项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/ba5868860e21ad7a84dea976f5f3574cd819ac62c95c7165d7cbaf8eeb8e8845.json)。
- 已取得：[half](https://www.99fund.com/announcement/zx/upload/2026/20260828/aa0f3ee446614ffb894ce4dce6b265f6.pdf)；[prospectus](https://www.99fund.com/announcement/zx/upload/2026/20260724/2fc5cd2d0108463cbcf17541fb36ba9d.pdf)；[summary](https://www.99fund.com/announcement/zx/upload/2026/20260724/5bb2a20505be4b06b59e0b8f9e188060.pdf)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

#### 007509 华商润丰灵活配置混合-C

- 产品CN_PUBLIC_FUND:003598；分类核验REBUILT_FROM_ORIGINALS；原始字段3项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/2a3461a379b5f36a7d873cb738bb64cba873cdafb5cf6070adeb6bba979a411c.json)。
- 已取得：[half](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[prospectus](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[summary](https://np-cnotice-fund.eastmoney.com/api/content/ann)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | QUALITY_PLEDGED_BONDS_COLLATERAL_AMOUNT_NOT_DISCLOSED:EXCHANGE | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

#### 007832 博道伍佰智航股票-C

- 产品CN_PUBLIC_FUND:007831；分类核验REBUILT_FROM_ORIGINALS；原始字段2项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/bba0ccabe90e51444b75c5185daa582f20d48ff9b194c26e7e02520039427ee8.json)。
- 已取得：[half](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[prospectus](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[summary](https://np-cnotice-fund.eastmoney.com/api/content/ann)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| holder_pressure_band | SOURCE_STATEMENT_UNAVAILABLE | REPRINT_THRESHOLD_STATEMENT_NOT_PRESENT_DIRECT_REPORT_CONFIRMATION_REQUIRED | 全期持有人阈值披露及申赎表；区间不当精确比例 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | RATING_MARKET_SECTION_MISSING:[56]\.4\.12\.4\s*期末参与转融通 | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

#### 007950 招商量化精选股票-C

- 产品CN_PUBLIC_FUND:001917；分类核验REBUILT_FROM_ORIGINALS；原始字段3项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/b9ee8807abd75b85c38743845bd7c237513ae80008d15475d706d5be6921b39f.json)。
- 已取得：[half](https://static.cmfchina.com/fundarticle/20260831/20025436515479.pdf)；[prospectus](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[summary](https://static.cmfchina.com/fundarticle/20260727/20024575175596.pdf)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| holder_pressure_band | SOURCE_STATEMENT_UNAVAILABLE | ORIGINAL_THRESHOLD_STATEMENT_NOT_PRESENT_NOT_PROOF_OF_ZERO | 全期持有人阈值披露及申赎表；区间不当精确比例 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

#### 008164 南方标普中国A股大盘红利低波50ETF联接-C

- 产品CN_PUBLIC_FUND:008163；分类核验REBUILT_FROM_ORIGINALS；原始字段3项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/b2b1b2f81adf78b6427a34f670aa6e48a93c1f5fb5595021ad2ecc682aa8c642.json)。
- 已取得：[half](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[prospectus](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[summary](https://np-cnotice-fund.eastmoney.com/api/content/ann)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 资产总额作分母，负债单列；同日分类和指数全成分、完整资产账簿；详见industry_structure_policy |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 含现金的全资产穿透权重、同期目标成分、发行人映射 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | LINK_AND_TARGET_FULL_RESTRICTIONS_REQUIRED | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |
| tracking_error | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；不除以各自宽松程度不同的合同上限 |

#### 008603 方正富邦新兴成长混合-C

- 产品CN_PUBLIC_FUND:008602；分类核验REBUILT_FROM_ORIGINALS；原始字段3项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/c915c58c093f6e9a4fc43dbdca9486a6384acd9ac59349c43a95341f07fb79a9.json)。
- 已取得：[half](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[prospectus](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[summary](https://np-cnotice-fund.eastmoney.com/api/content/ann)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | FULL_ASSET_RESTRICTION_SCOPE_NOT_EXPLICIT | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

#### 008764 天弘越南市场股票(QDII)-C

- 产品CN_PUBLIC_FUND:008763；分类核验REBUILT_FROM_ORIGINALS；原始字段3项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/36776ece6c2b99abc2b7f69116dd60fe238361de4763de0e6acfc96095090664.json)。
- 已取得：[half](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[prospectus](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[summary](https://np-cnotice-fund.eastmoney.com/api/content/ann)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | RATING_MARKET_SECTION_MISSING:(?m)^7\.3\s+[^\n]*股票\s*投\s*资\s*明\s*细 | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

#### 008888 华夏国证半导体芯片ETF联接-C

- 产品CN_PUBLIC_FUND:008887；分类核验REBUILT_FROM_ORIGINALS；原始字段3项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/375c3fc9948dbc7ac3ff8865c665785f6f6d41a60a6342796e11571547ac7f8f.json)。
- 已取得：[half](https://fund.chinaamc.com/upload/resources/file/2026/08/31/efc08378950448909c453a1b8a721fb1.pdf)；[prospectus](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[summary](https://fund.chinaamc.com/upload/resources/file/2026/05/29/3a0f29a4a8154ff9bdecf823e43ea52e.pdf)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 资产总额作分母，负债单列；同日分类和指数全成分、完整资产账簿；详见industry_structure_policy |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 含现金的全资产穿透权重、同期目标成分、发行人映射 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | LINK_AND_TARGET_FULL_RESTRICTIONS_REQUIRED | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |
| tracking_error | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；不除以各自宽松程度不同的合同上限 |

#### 008960 长信国防军工量化灵活配置混合-C

- 产品CN_PUBLIC_FUND:002983；分类核验REBUILT_FROM_ORIGINALS；原始字段3项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/a5cfc8e580dfcbc23e6ea51cbd09076459b58f00e169ba74ca4e146b90806b92.json)。
- 已取得：[half](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[prospectus](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[summary](https://np-cnotice-fund.eastmoney.com/api/content/ann)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | FULL_ASSET_RESTRICTION_SCOPE_NOT_EXPLICIT | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

#### 010710 安信医药健康主题股票-C

- 产品CN_PUBLIC_FUND:010709；分类核验REBUILT_FROM_ORIGINALS；原始字段3项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/8fd40b119acec8b42a9091962c08c6834b8f2f9fa624cc69821135d3bc96419b.json)。
- 已取得：[half](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[prospectus](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[summary](https://np-cnotice-fund.eastmoney.com/api/content/ann)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | RATING_STOCK_CELLS_INCOMPLETE_OR_AMBIGUOUS | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

#### 010737 易方达沪深300指数精选增强-C

- 产品CN_PUBLIC_FUND:010736；分类核验REBUILT_FROM_ORIGINALS；原始字段4项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/6cf64b0472ab92804fe87548bf6cf098ca0a9a3003aa91a2562ddc99dcf8453d.json)。
- 已取得：[half](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[prospectus](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[summary](https://np-cnotice-fund.eastmoney.com/api/content/ann)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

#### 011036 嘉实中证稀土产业ETF联接-C

- 产品CN_PUBLIC_FUND:011035；分类核验REBUILT_FROM_ORIGINALS；原始字段3项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/21201275862d820bbcb949d53bcca48d3daf6aff6ca420d48d19d6e5c4eb1ecb.json)。
- 已取得：[half](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[prospectus](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[summary](https://np-cnotice-fund.eastmoney.com/api/content/ann)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 资产总额作分母，负债单列；同日分类和指数全成分、完整资产账簿；详见industry_structure_policy |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 含现金的全资产穿透权重、同期目标成分、发行人映射 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | LINK_AND_TARGET_FULL_RESTRICTIONS_REQUIRED | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |
| tracking_error | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；不除以各自宽松程度不同的合同上限 |

#### 011066 大成高鑫股票-C

- 产品CN_PUBLIC_FUND:000628；分类核验REBUILT_FROM_ORIGINALS；原始字段4项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/48e7ccda9b1118d6da6d7bd8ed1ab6314a0ed00da14269911f79bd4fe165978a.json)。
- 已取得：[half](https://www.dcfund.com.cn/plat_files/upload/ann_upload/20260828/202608281787877362819.pdf)；[prospectus](https://www.dcfund.com.cn/plat_files/upload/ann_upload/20260302/202603021772435265532.pdf)；[summary](https://www.dcfund.com.cn/plat_files/upload/ann_upload/20260630/202606301782772671983.pdf)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

#### 011103 天弘中证光伏产业指数-C

- 产品CN_PUBLIC_FUND:011102；分类核验REBUILT_FROM_ORIGINALS；原始字段3项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/19c4c5f4d35967b09236f303b3a9965922bf775fe321d720c99befca4ab006b2.json)。
- 已取得：[half](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[prospectus](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[summary](https://np-cnotice-fund.eastmoney.com/api/content/ann)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 资产总额作分母，负债单列；同日分类和指数全成分、完整资产账簿；详见industry_structure_policy |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 含现金的全资产穿透权重、同期目标成分、发行人映射 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | FULL_ASSET_RESTRICTION_SCOPE_NOT_EXPLICIT | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |
| tracking_error | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；不除以各自宽松程度不同的合同上限 |

#### 012835 招商景气精选股票-A

- 产品CN_PUBLIC_FUND:012835；分类核验REBUILT_FROM_ORIGINALS；原始字段4项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/13881759f21753dd2ec7a2b529bb121fc860589e1d74936b7996e7d61f5d722f.json)。
- 已取得：[half](https://static.cmfchina.com/fundarticle/20260831/20025327278709.pdf)；[prospectus](https://static.cmfchina.com/fundarticle/20260717/20024025722697.pdf)；[summary](https://static.cmfchina.com/fundarticle/20260717/20024026376700.pdf)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| holder_pressure_band | SOURCE_STATEMENT_UNAVAILABLE | ORIGINAL_THRESHOLD_STATEMENT_NOT_PRESENT_NOT_PROOF_OF_ZERO | 全期持有人阈值披露及申赎表；区间不当精确比例 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

#### 012836 招商景气精选股票-C

- 产品CN_PUBLIC_FUND:012835；分类核验REBUILT_FROM_ORIGINALS；原始字段4项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/1c39d9864a265000c7d5fdab80b3a18c6e9e9fb7d89af69aa3db80e29801d5ec.json)。
- 已取得：[half](https://static.cmfchina.com/fundarticle/20260831/20025327278709.pdf)；[prospectus](https://static.cmfchina.com/fundarticle/20260717/20024025722697.pdf)；[summary](https://static.cmfchina.com/fundarticle/20260717/20024027697810.pdf)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| holder_pressure_band | SOURCE_STATEMENT_UNAVAILABLE | ORIGINAL_THRESHOLD_STATEMENT_NOT_PRESENT_NOT_PROOF_OF_ZERO | 全期持有人阈值披露及申赎表；区间不当精确比例 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

#### 013180 广发国证新能源车电池ETF联接-C

- 产品CN_PUBLIC_FUND:013179；分类核验REBUILT_FROM_ORIGINALS；原始字段10项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/ccaf3150d7db5ee658a15cb3e0a7d4ad4ee20da9fb02f714bb512ad834349f9b.json)。
- 已取得：。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 资产总额作分母，负债单列；同日分类和指数全成分、完整资产账簿；详见industry_structure_policy |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 含现金的全资产穿透权重、同期目标成分、发行人映射 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | LINK_AND_TARGET_FULL_RESTRICTIONS_REQUIRED | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |

#### 013275 富国中证煤炭指数(LOF)-C

- 产品CN_PUBLIC_FUND:161032；分类核验REBUILT_FROM_ORIGINALS；原始字段13项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/92194ae8490e64db91d944da527742a1f8db76f7b8b36619eb6935c0e609eb16.json)。
- 已取得：[half](https://www.fullgoal.com.cn/wbs-file/fund_report/20260831/CN_50100000_161032_FB020010_20260015.pdf)；[prospectus](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[summary](https://www.fullgoal.com.cn/wbs-file/fund_report/20260612/CN_50100000_161032_FA010080_20260013_013275_20260612_090000_01.pdf)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_WEIGHTS_PRESENT_FULL_ISSUER_IDENTITY_MAPPING_REQUIRED | 含现金的全资产穿透权重、同期目标成分、发行人映射 |

#### 013330 富国中证银行指数-C

- 产品CN_PUBLIC_FUND:161029；分类核验REBUILT_FROM_ORIGINALS；原始字段13项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/4c9e32d4dcbc5f70a5484216a33753f703d5d1bf21cb411274712fad5948aa90.json)。
- 已取得：[half](https://www.fullgoal.com.cn/wbs-file/fund_report/20260831/CN_50100000_161029_FB020010_20260012.pdf)；[prospectus](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[summary](https://www.fullgoal.com.cn/wbs-file/fund_report/20260520/CN_50100000_161029_FA010080_20260010_013330_20260520_090000_01.pdf)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_WEIGHTS_PRESENT_FULL_ISSUER_IDENTITY_MAPPING_REQUIRED | 含现金的全资产穿透权重、同期目标成分、发行人映射 |

#### 013472 华宝中证全指农牧渔ETF联接-C

- 产品CN_PUBLIC_FUND:013471；分类核验REBUILT_FROM_ORIGINALS；原始字段3项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/1cddc8fee3d5c3b7b8968d20755e1fbebbd6e34048cd78b8aa2ad5ed75a8da25.json)。
- 已取得：[half](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[prospectus](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[summary](https://np-cnotice-fund.eastmoney.com/api/content/ann)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 资产总额作分母，负债单列；同日分类和指数全成分、完整资产账簿；详见industry_structure_policy |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 含现金的全资产穿透权重、同期目标成分、发行人映射 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | LINK_AND_TARGET_FULL_RESTRICTIONS_REQUIRED | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |
| tracking_error | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；不除以各自宽松程度不同的合同上限 |

#### 013853 大成匠心卓越三年持有期混合-A

- 产品CN_PUBLIC_FUND:013853；分类核验REBUILT_FROM_ORIGINALS；原始字段4项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/ab3ab41f5f116bf3cfc085bae8ea95cdc32c354bdbfb9d9845bfe9d6d228880c.json)。
- 已取得：[half](https://www.dcfund.com.cn/plat_files/upload/ann_upload/20260828/202608281787877318317.pdf)；[prospectus](https://www.dcfund.com.cn/plat_files/upload/ann_upload/20260706/202607061783340813715.pdf)；[summary](https://www.dcfund.com.cn/plat_files/upload/ann_upload/20260529/202605291780015319837.pdf)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

#### 014156 国泰海通中证500指数增强-C

- 产品CN_PUBLIC_FUND:014155；分类核验REBUILT_FROM_ORIGINALS；原始字段3项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/17ba48168a065f94a314770a1e017489014975ff4df567c7f7cc1e5d650b04ac.json)。
- 已取得：[half](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[prospectus](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[summary](https://np-cnotice-fund.eastmoney.com/api/content/ann)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | RATING_STOCK_CELLS_INCOMPLETE_OR_AMBIGUOUS | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

#### 014978 华安纳斯达克100ETF联接(QDII)-C-CNY

- 产品CN_PUBLIC_FUND:040046；分类核验METHOD_CURRENTLY_UNSUPPORTED；原始字段3项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/eae3bddc12b4286153896684ca9c1dc84abe946573a6fe3f8eaa3f784509c27f.json)。
- 已取得：[half](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[prospectus](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[summary](https://np-cnotice-fund.eastmoney.com/api/content/ann)。
- 当前候选类型不支持；不把通用候选字段盘点当作该产品可评级的证明。

#### 015596 国泰国证有色金属行业指数-C

- 产品CN_PUBLIC_FUND:160221；分类核验REBUILT_FROM_ORIGINALS；原始字段3项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/216d8cad04606ff4ddd203ed5f6f623deca084d9033df1044df806d073c5ecd2.json)。
- 已取得：[half](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[prospectus](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[summary](https://np-cnotice-fund.eastmoney.com/api/content/ann)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 资产总额作分母，负债单列；同日分类和指数全成分、完整资产账簿；详见industry_structure_policy |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 含现金的全资产穿透权重、同期目标成分、发行人映射 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | RATING_MARKET_SECTION_MISSING:[56]\.4\.12\.4\s*期末参与转融通 | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |
| tracking_error | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；不除以各自宽松程度不同的合同上限 |

#### 016008 招商中证消费电子主题ETF联接-C

- 产品CN_PUBLIC_FUND:016007；分类核验REBUILT_FROM_ORIGINALS；原始字段9项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/f25f47e04db1fea5f5d221618bffcefe302c3a6201658a32c983f173078b3ddb.json)。
- 已取得：。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| holder_pressure_band | SOURCE_STATEMENT_UNAVAILABLE | ORIGINAL_THRESHOLD_STATEMENT_NOT_PRESENT_NOT_PROOF_OF_ZERO | 全期持有人阈值披露及申赎表；区间不当精确比例 |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 资产总额作分母，负债单列；同日分类和指数全成分、完整资产账簿；详见industry_structure_policy |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 含现金的全资产穿透权重、同期目标成分、发行人映射 |
| key_person_coverage | COLLECTION_REQUIRED | FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | LINK_AND_TARGET_FULL_RESTRICTIONS_REQUIRED | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |

#### 017145 华宝海外新能源汽车股票(QDII)-C

- 产品CN_PUBLIC_FUND:017144；分类核验REBUILT_FROM_ORIGINALS；原始字段3项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/8c6829e43ef2951da5dec02801d5033fa2eafe38112baffa16bdb30c41f83f53.json)。
- 已取得：[half](https://www.fsfund.com//static//notice/2026/08/31/a9d7b89e-43a3-4323-952c-2c1633b811e7_t/华宝海外新能源汽车股票型发起式证券投资基金（QDII）2026年中期报告.pdf)；[summary](https://www.fsfund.com//static//notice/2025/12/09/3e64cc0b-fae4-4eea-9622-a71c41500e98/华宝海外新能源汽车股票型发起式证券投资基金（QDII）（C类份额）基金产品资料概要（更新）.pdf)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | FULL_ASSET_RESTRICTION_SCOPE_NOT_EXPLICIT | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

#### 017493 东方红新动力灵活配置混合-C

- 产品CN_PUBLIC_FUND:000480；分类核验REBUILT_FROM_ORIGINALS；原始字段4项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/5ae2829d6117197d7c9e4f7cff128f001ad43042daf20b9f0c3458fe15df5248.json)。
- 已取得：[half](https://www.dfham.com/upload/pdf/1788137438312-dfhxdllhpzhhxzqtzjj2026nzqbg.pdf)；[prospectus](https://www.dfham.com/upload/pdf/1772781335586-dfhxdllhpzhhxzqtzjjzmsms(gx)(2026nd1h).pdf)；[summary](https://www.dfham.com/upload/pdf/1772781336034-dfhxdllhpzhhxzqtzjj(Clfe)jjcpzlgygx.pdf)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

#### 017960 招商趋势领航混合-A

- 产品CN_PUBLIC_FUND:017960；分类核验REBUILT_FROM_ORIGINALS；原始字段4项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/7c84ab89cb86d932e25d8c6a30057280bdebf7da69617befb5d29ec3509bd1dc.json)。
- 已取得：[half](https://static.cmfchina.com/fundarticle/20260831/20025432681571.pdf)；[prospectus](https://static.cmfchina.com/fundarticle/20260601/20023274201065.pdf)；[summary](https://static.cmfchina.com/fundarticle/20260601/20023275679043.pdf)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| holder_pressure_band | SOURCE_STATEMENT_UNAVAILABLE | ORIGINAL_THRESHOLD_STATEMENT_NOT_PRESENT_NOT_PROOF_OF_ZERO | 全期持有人阈值披露及申赎表；区间不当精确比例 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

#### 018125 永赢先进制造智选混合-C

- 产品CN_PUBLIC_FUND:018124；分类核验REBUILT_FROM_ORIGINALS；原始字段4项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/2c6b724e4f8feb2c981a012b5c355fccc93ce93ca8715d4e50e36960549464ce.json)。
- 已取得：[half](https://owa.maxwealthfund.com/gateway/cms.file/file/notice/2026/08/28/永赢先进制造智选混合型发起式证券投资基金2026年中期报告_1787907759675.pdf)；[summary](https://owa.maxwealthfund.com/gateway/cms.file/file/notice/2026/05/29/永赢先进制造智选混合型发起式证券投资基金（C份额）基金产品资料概要更新(2026年第1号)_1780022805109.pdf)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

#### 018156 创金合信全球医药生物股票(QDII)-C

- 产品CN_PUBLIC_FUND:018155；分类核验REBUILT_FROM_ORIGINALS；原始字段2项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/c56742f322cbd416d58c82b997a2bce70e6a8bdc15b52713b586a53e03535817.json)。
- 已取得：[half](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[prospectus](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[summary](https://np-cnotice-fund.eastmoney.com/api/content/ann)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | COLLECTION_REQUIRED | FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | RATING_MARKET_SECTION_MISSING:(?m)^7\.3\s+[^\n]*股票\s*投\s*资\s*明\s*细 | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；重叠窗口不作独立样本 |
| team_months | SOURCE_WINDOW_INCOMPLETE | AVAILABLE_PRODUCT_HISTORY_SHORTER_THAN_36_MONTHS | 完整正式团队时间线及原文；任职不替代治理 |

#### 018590 银华体育文化灵活配置混合-C

- 产品CN_PUBLIC_FUND:003397；分类核验REBUILT_FROM_ORIGINALS；原始字段4项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/f36f45fcabd823a19de9326cca23e16603aa540d9d313358361008c7393c27ce.json)。
- 已取得：[half](https://pdf.dfcfw.com/pdf/H2_AN202608291828680593_1.pdf?1787994591000.pdf)；[prospectus](https://www.yhfund.com.cn/plat_files/upload/png_upload/20260205/202602051770279217385.docx)；[summary](https://www.yhfund.com.cn/plat_files/upload/png_upload/20260205/202602051770279188363.docx)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

#### 018853 博时标普石油天然气勘探及生产精选行业指数(QDII)-C-CNY

- 产品CN_PUBLIC_FUND:018851；分类核验METHOD_CURRENTLY_UNSUPPORTED；原始字段3项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/21794b1c622388630b7c2b05dd8ab0c29d7db6be2aa68ba4b9a746b2b63e7eb5.json)。
- 已取得：[half](https://www.bosera.com/common/downloadFile.do?fileId=BBA5BD9F036BCDF0E87A60C35BC63D75)；[summary](https://www.bosera.com/common/downloadFile.do?fileId=6C4F2BBBB6690D110E822D13585F05B0)。
- 当前候选类型不支持；不把通用候选字段盘点当作该产品可评级的证明。

#### 019449 摩根日本精选股票(QDII)-C

- 产品CN_PUBLIC_FUND:007280；分类核验REBUILT_FROM_ORIGINALS；原始字段3项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/fd924c47280e77b5cd223082144677bfb931c64f6744b8312a43985e94214afe.json)。
- 已取得：[half](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[prospectus](https://www.cifm.com/fund/007280/lawfile/202509/P020250930310405876444.pdf)；[summary](https://np-cnotice-fund.eastmoney.com/api/content/ann)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | FULL_ASSET_RESTRICTION_SCOPE_NOT_EXPLICIT | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

#### 021740 前海开源黄金ETF联接-C

- 产品CN_PUBLIC_FUND:009198；分类核验METHOD_CURRENTLY_UNSUPPORTED；原始字段3项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/cacaab53e1037589bf553ed588c2c89b0ff3e7cd6ceb4e77690df7234b5b928d.json)。
- 已取得：[half](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[summary](https://np-cnotice-fund.eastmoney.com/api/content/ann)。
- 当前候选类型不支持；不把通用候选字段盘点当作该产品可评级的证明。

#### 160119 南方中证500ETF联接(LOF)-A

- 产品CN_PUBLIC_FUND:160119；分类核验REBUILT_FROM_ORIGINALS；原始字段3项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/f0e8376c5b8c862bae1811364569ae0e0cbd121d5911fa3ca14dcac344a00e2a.json)。
- 已取得：[half](https://www.nffund.com/main/files/2026/08/28/223050409776.pdf)；[prospectus](https://np-cnotice-fund.eastmoney.com/api/content/ann)；[summary](https://np-cnotice-fund.eastmoney.com/api/content/ann)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 资产总额作分母，负债单列；同日分类和指数全成分、完整资产账簿；详见industry_structure_policy |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED | INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 含现金的全资产穿透权重、同期目标成分、发行人映射 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | LINK_AND_TARGET_FULL_RESTRICTIONS_REQUIRED | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |
| tracking_error | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；不除以各自宽松程度不同的合同上限 |

#### 160323 华夏磐泰混合(LOF)-A

- 产品CN_PUBLIC_FUND:160323；分类核验REBUILT_FROM_ORIGINALS；原始字段3项；[本次冻结包及逐来源记录](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/packets/e5b0419e22b070ed1e06765ef6511a49cca283ca3613110a7d603f1896ae7cb2.json)。
- 已取得：[half](https://fund.chinaamc.com/upload/resources/file/2026/08/31/2c7aebc9bd354063a44418c35b6be43b.pdf)；[prospectus](https://fund.chinaamc.com/upload/resources/file/2026/05/29/bd0d5742e792442c95ebca97bd84dcb4.pdf)；[summary](https://fund.chinaamc.com/upload/resources/file/2026/05/29/5304890800d64207a0abe49562510706.pdf)。

| 尚缺字段 | 状态 | 精确原因 | 必须具备的真实来源 |
| --- | --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| capacity_pressure | METHOD_REFERENCE_REQUIRED | STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED | CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| extra_downside | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 同日基金与合同基准收益；A为已核验年估值次数 |
| extra_drawdown | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| governance_state | SOURCE_WINDOW_INCOMPLETE | GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整行业敞口、报告日分类及冻结参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED | INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE | HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | 合同范围、完整穿透资产及合规核验 |
| monthly_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；零超额目标为候选立场 |
| relative_return_1y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| relative_return_3y | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额再投资净值、合同基准 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED | QUALITY_PLEDGED_BONDS_COLLATERAL_AMOUNT_NOT_DISCLOSED:EXCHANGE | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| rolling_target_success | COLLECTION_REQUIRED | CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | 本份额与合同基准37个月末；重叠窗口不作独立样本 |

## 冻结检查记录

- [当前市场原件盘点](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/inventory.json)
- [79字段历史输入](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/result.json)
- [五字段独立年报核验](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/independent-annual-restrictions-and-holder.json)
- [004605另取得官网PDF独立核验](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/independent-issuer-004605/independent-restricted-ratio.json)
- [40字段成对历史独立复算](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/independent-arithmetic-replay.json)
- [方法参照可取得性证据](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/method-feasibility-evidence.json)
- [跨月全包隔离试算](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/cross-month-experiment.json)
- [原正式结果只读回查](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/formal-readback.json)
- [工程检查](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/engineering-checks.json)
