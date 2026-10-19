# 基金质量V2职责覆盖补齐与真实部分指标诊断

实际盘点冻结：2026-10-17T07:16:16.039672+08:00；交付生成：2026-10-17T07:28:13.005433+08:00。

V2尚不能正式启用。已补齐可由已有原件证明的职责字段，但完整八维输入、合格完整校准产品和独立验收仍为0。原正式评分保留。

## 本轮可检查的结果

- 当前实时目录49只份额、48个产品，已核原始字段由198增至235；新增37项均为正式职责与连续任职覆盖，不是37个新产品。
- 职责覆盖现有43只份额可重建为1；37个新增值均由独立PDFium/原始转载/DOCX及自然日集合复核。任职来源分别按已冻结授权供应商记录、公开API、正式招募书历任表读取，不把输入中的核验布尔值当作证据。
- 修复无冒号、全角编号句点，以及正式条文写作‘谋取利益’的漏读；仍要求明确经理岗位、编号条目、法律/合同依据和受益人为份额持有人，否定条文、公司职责和个人简历不能补值。
- 当前198个旧字段的值、单位、观察日及来源绑定完全保留，15个原完整来源包不变；498件不同哈希来源均重核，38份编译源码已冻结。
- 历史22包、11个既有产品仍为79个字段；004605在2026-04-30考察月的受限比例改绑已核正式PDF，值、单位和2025-12-31观察日不变。旧转载及旧批次保留。独立报告身份核验9份PDF、13份完整转载；三产品两月份40个字段独立算术一致。
- 396项相关工程回归和Ruff通过。71包、3考察月真实隔离试算四种类型仍为NOT_READY，没有校准锚点、V2总分、等级或正式写入。
- 正式结果于2026-10-17T07:21:46.109312+08:00只读比较49条一致；真实日期2026-09-30和130个旧批次保留，每日00:30统一任务不变。

## 真实部分指标诊断及局限

71包中65包属于目前候选支持类型，按同产品同月去除A/C后涉及42个产品。35/13是原先冻结的全产品分组，其中部分产品当前方法不支持。描述统计只用校准侧49个产品月份；验证侧15个产品月份不参与相关性、阈值或权重选择。历史月份不增加独立产品，既往已看过的原件也不声称是新的盲法验证。

按考察月与类型分别计算平均秩Spearman，逐对列出实际共有产品数；少于3对或常量时不计算相关系数。独立Pandas平均秩/Pearson重算283对，48个系数及235个常量或小样本情形一致。已有字段可得性有选择偏差，不能据这些部分样本确认权重、类型公平、等级上限或逐只升降级。详见同批real-partial-metric-diagnostics.json及independent-partial-diagnostics.json。

当前校准侧职责覆盖在各类型的可得样本中均为1。这只证明连续任职与岗位定义，不证明履职质量。按现候选公式，完整覆盖会机械贡献主动类4.5分、被动类3分；这不是已计算的基金总分。规则锚点不需要伪造低覆盖样本，但这项是否应继续占管理维度30%仍待真实完整校准。此次没有据此改权重或移除必要指标。

| 当前考察类型 | 校准侧产品 | 职责覆盖可得产品 | 覆盖值种类 | 完整八维 |
| --- | ---: | ---: | ---: | ---: |
| ACTIVE_EQUITY | 14 | 13 | 1 | 0 |
| GLOBAL_ACTIVE_EQUITY | 4 | 2 | 1 | 0 |
| INDEX_ENHANCED | 4 | 4 | 1 | 0 |
| PASSIVE_INDEX | 9 | 8 | 1 | 0 |

当前月有至少5个共有产品的可计算指标对如下，全部仅为可得样本的描述统计。主动类持有人状态与受限比例在6个产品中平均秩相关约0.840，提示需要继续核查流动性维度的共同贡献；样本量小且状态有大量相同值，不能据此宣称指标重复、因果关系或已经消除重复计分。

| 类型 | 指标对 | 共有产品数 | Spearman |
| --- | --- | ---: | ---: |
| ACTIVE_EQUITY | cost_1y / holder_pressure_band | 9 | -0.229175 |
| ACTIVE_EQUITY | cost_1y / restricted_ratio | 10 | 0.621951 |
| ACTIVE_EQUITY | cost_1y / team_months | 14 | 0.449717 |
| ACTIVE_EQUITY | holder_pressure_band / restricted_ratio | 6 | 0.840168 |
| ACTIVE_EQUITY | holder_pressure_band / team_months | 9 | -0.125000 |
| ACTIVE_EQUITY | restricted_ratio / team_months | 10 | 0.030367 |
| PASSIVE_INDEX | cost_1y / holder_pressure_band | 8 | 0.248922 |
| PASSIVE_INDEX | cost_1y / team_months | 9 | -0.029829 |
| PASSIVE_INDEX | holder_pressure_band / team_months | 8 | 0.215980 |

## 指标契约与共同阻塞

八维缺资料仍不补零、不重新分配权重、不使用第一版分项分数。当前RAW4和候选权重不变。最低30产品是按类型的候选准入门槛，既不等于统计充分，也不能用跨月或A/C凑数。

所有适用产品仍缺已冻结且可核的现金目标区间、策略容量参考和完整治理事实审查。合同‘现金加短债下限’并非纯现金目标；部分下界或未知保证金不能补成点值。成交负荷与持仓集中度可能重叠，不能直接冒充策略容量。年报声明、目录查无标题以及管理人所称整改，均不能替代监管决定、独立整改和基金影响核查。

| 指标 | 单位/窗口 | 明确公式 | 必要来源 |
| --- | --- | --- | --- |
| relative_return_1y | ratio；12个月 | F末/F初 - B末/B初 | 本份额再投资净值、合同基准 |
| relative_return_3y | ratio/year；36个月 | (F末/F初)^(365.25/实际天数) - (B末/B初)^(365.25/实际天数) | 本份额再投资净值、合同基准 |
| extra_drawdown | ratio；36个月 | max_t(1-(F_t/B_t)/max_s<=t(F_s/B_s)) | 本份额再投资净值、合同基准 |
| extra_downside | ratio/year^0.5；36个月 | sqrt(A/N * sum(min(rF-rB,0)^2)) | 同日基金与合同基准收益；A为已核验年估值次数 |
| tracking_error | ratio/year^0.5；36个月 | sqrt(A * sum((rF-rB-mean(rF-rB))^2)/(N-1)) | 同日基金与合同基准收益；不除以各自宽松程度不同的合同上限 |
| allocation_deviation | ratio；36个月逐次完整披露 | 各披露日实际资产权重到合同允许集合的最小半L1距离的均值 | 完整资产配置、同期合同约束；缺一披露日不假定合规 |
| mandate_deviation | ratio；36个月逐次完整披露 | 已核验超出合同投资范围资产金额/同期净资产的披露日均值 | 合同范围、完整穿透资产及合规核验 |
| rolling_target_success | ratio；25个重叠12月窗口 | sum(相对回报>0记1，=0记0.5，否则0)/25 | 本份额与合同基准37个月末；重叠窗口不作独立样本 |
| monthly_target_success | ratio；36个月 | sum(月度相对回报>0记1，=0记0.5，否则0)/36 | 本份额与合同基准37个月末；零超额目标为候选立场 |
| governance_state | ordinal:0,1,2；截至考察日及36个月事项 | 0=已证实重大且未整改；1=非重大或已整改；2=完整核查且未见适用不利事项 | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |
| key_person_coverage | ratio；36个月 | 有明确且有效责任人覆盖的自然日数/窗口自然日数 | 正式职责及任职生效记录；临时代理按正式职责核验，不重复惩罚换任 |
| team_months | month；当前团队截至考察日 | min(36,距最近正式团队变更的自然日数/30.4375) | 完整正式团队时间线及原文；任职不替代治理 |
| issuer_replication_deviation | ratio；同一最新完整披露日 | 0.5*sum(|实际发行人权重-目标发行人权重|) | 含现金的全资产穿透权重、同期目标成分、发行人映射 |
| industry_replication_deviation | ratio；同一最新完整披露日 | 0.5*sum(|完整资产行业及非权益类别权重-合同基准参照同类别权重|) | 资产总额作分母，负债单列；同日分类和指数全成分、完整资产账簿；详见industry_structure_policy |
| issuer_excess_concentration | ratio；同一最新完整披露日 | max(0,发行人HHI-预先冻结同目标独立产品参照HHI中位数) | 完整发行人敞口及冻结参照；不从本次评分对象反推参照 |
| industry_excess_concentration | ratio；同一最新完整披露日 | max(0,行业HHI-预先冻结同目标同分类版本参照HHI中位数) | 完整行业敞口、报告日分类及冻结参照 |
| restricted_ratio | ratio；最新完整报告日；距考察日不超过210天 | 已核实受限资产金额合计/产品净资产 | 全资产受限情况及资产负债表；股票之外未知受限情况不补0 |
| cash_target_deviation | ratio；最新完整报告日 | max(合同现金下界-现金比例,0,现金比例-合同现金上界) | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| holder_pressure_band | ordinal:0,1,2；最近完整报告期 | 0=明确全期无单一持有人>=20%；1=存在>=20%且无已核验净赎回；2=存在且有净赎回 | 全期持有人阈值披露及申赎表；区间不当精确比例 |
| capacity_pressure | ratio；最新报告日及同窗容量核验 | max(规模/冻结策略容量上界-1,0)+max(冻结持续运作下界/规模-1,0) | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| cost_1y | ratio；考察日适用费率，一万元365天 | 外扣申购费/(1+申购费)+(1-申购费用比例)*赎回费+综合年运作费率 | 本份额标准费用；综合运作费不叠加分项，ETF联接按合法减免核验 |

## 逐基金原件、指标和缺口

下列来源是本批实际保存的资料；‘待采集/待解析/方法参考缺失/当前不支持’保留原状态。已找到旧版本但未核公开日期及最新适用版本，不能自动视为职责已补齐。完整机器可读字段、来源哈希、缺失角色及原始原因保存于同批fund-metric-source-gaps.json。

### 001021 华夏亚债中国债券指数-A

产品：CN_PUBLIC_FUND:001021；候选类型：None；已核字段：4；职责覆盖：1。

- 实际来源half：[58fd1c2e700ed5ba](https://fund.chinaamc.com/upload/resources/file/2026/08/31/16678b32a31142048063d8ddeed8c8f1.pdf)；登记公开日未登记，不能用取得日代填。
- 实际来源prospectus：[92a381ca642ec029](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-05-29。
- 实际来源summary：[85b50c2af63765b9](https://fund.chinaamc.com/upload/resources/file/2026/05/29/8d6756a62b35450cb50157e25c01d538.pdf)；登记公开日未登记，不能用取得日代填。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 预先冻结并经验证的本类现金目标上下界及对应合同版本 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；FULL_ASSET_RESTRICTION_SCOPE_NOT_EXPLICIT | 报告完整受限表、全部资产范围声明和资产负债表逐元对账；不从旧分项或风险档换算 |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| tracking_error | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 001632 天弘中证食品饮料ETF联接-C

产品：CN_PUBLIC_FUND:001631；候选类型：PASSIVE_INDEX；已核字段：4；职责覆盖：1。

- 实际来源half：[63567eb0d7dc8f45](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-08-31。
- 实际来源summary：[1a5ff63c8c0535a6](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-06-26。
- 实际来源prospectus：[90e775557539d3e7](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2025-10-21。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":["2026-06-26"],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-1…（完整结构见JSON） |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED；INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 同日目标指数完整成分权重、发行人及行业映射；目标ETF实际持仓不能冒充指数目标权重 |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED；INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 同日目标指数完整成分权重、发行人及行业映射；目标ETF实际持仓不能冒充指数目标权重 |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；LINK_AND_TARGET_FULL_RESTRICTIONS_REQUIRED | 报告完整受限表、全部资产范围声明和资产负债表逐元对账；不从旧分项或风险档换算 |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| tracking_error | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 002112 德邦鑫星价值灵活配置混合-C

产品：CN_PUBLIC_FUND:001412；候选类型：ACTIVE_EQUITY；已核字段：5；职责覆盖：1。

- 实际来源half：[2d2e4d3c130582c0](https://www.dbfund.com.cn/upload/pdf/1788138485694-德邦鑫星价值灵活配置混合型证券投资基金2026年中期报告.pdf)；登记公开日未登记，不能用取得日代填。
- 实际来源summary：[747baa543a798931](https://www.dbfund.com.cn/upload/pdf/1782436868041-德邦鑫星价值灵活配置混合型证券投资基金（德邦鑫星价值C份额）基金产品资料概要更新.pdf)；登记公开日未登记，不能用取得日代填。
- 实际来源prospectus：[e7926574f2301a62](https://www.dbfund.com.cn/upload/pdf/1782436784811-德邦鑫星价值灵活配置混合型证券投资基金更新招募说明书（2026年第2号）.pdf)；登记公开日未登记，不能用取得日代填。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2024-12-31","2025-12-31","2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays"…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":["2026-02-09"],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"COMBINED_MANAGER_CUSTODIAN_OR_STAFF":{"covered_days":366,"missing_inter…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2024-12-31","2025-12-31","2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays"…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 002170 东吴移动互联灵活配置混合-C

产品：CN_PUBLIC_FUND:001323；候选类型：ACTIVE_EQUITY；已核字段：5；职责覆盖：1。

- 实际来源half：[0208aae18f568fe7](https://www.scfund.com.cn/upload2010/2026/08/31/025800808_402_b657fb72-b9d2-39eb-bf1d-b442d31f429b.pdf)；登记公开日未登记，不能用取得日代填。
- 实际来源summary：[4bf186284fdd91dd](https://www.scfund.com.cn/upload2010/2025/12/05/014946034_402_19a5c364-b597-38b4-a141-8ca42f371610.pdf)；登记公开日未登记，不能用取得日代填。
- 实际来源prospectus：[50fe551daf14ce7d](https://www.scfund.com.cn/upload2010/2025/12/05/015149665_402_883637fb-f9f3-3add-a678-5f4a5f31f6da.pdf)；登记公开日未登记，不能用取得日代填。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2024-12-31","2025-12-31","2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays"…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"COMBINED_MANAGER_CUSTODIAN_OR_STAFF":{"covered_days":366,"missing_intervals":[["202…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2024-12-31","2025-12-31","2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays"…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 004237 中欧新蓝筹灵活配置混合-C

产品：CN_PUBLIC_FUND:166002；候选类型：ACTIVE_EQUITY；已核字段：4；职责覆盖：1。

- 实际来源half：[5b88fb7fdae633ea](https://www.zofund.com/2026/wsnotice/20260831/a846d5afafc44d2aa3686fbd79ac512a.pdf)；登记公开日未登记，不能用取得日代填。
- 实际来源summary：[fd21e2480e1f136e](https://www.zofund.com/tempdir/minisite/20260519/02691006-b380-4450-ae0d-ad14c659f5af_1779185179106.pdf)；登记公开日未登记，不能用取得日代填。
- 实际来源prospectus：[a4bea9e6b0cd3335](https://www.zofund.com/tempdir/minisite/20260709/2ea5dde9-0cd8-4994-a2f5-17159f6b1e4c_1783593065972.pdf)；登记公开日未登记，不能用取得日代填。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；FULL_ASSET_RESTRICTION_SCOPE_NOT_EXPLICIT | 全部资产受限声明与金额；联接还需自身及目标ETF可赎回/受限情况分别核验 |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 004605 富国新活力灵活配置混合-C

产品：CN_PUBLIC_FUND:004604；候选类型：ACTIVE_EQUITY；已核字段：5；职责覆盖：1。

- 实际来源prospectus：[1f6af5579af3dd22](https://wap.fullgoal.com.cn/wbs-file/fund_report/20250526/CN_50100000_004604_FA010030_20250001.pdf)；登记公开日未登记，不能用取得日代填。
- 实际来源summary：[b356e39299be11b3](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-06-26。
- 实际来源half：[2ce51f77ed65ae0f](https://wap.fullgoal.com.cn/wbs-file/fund_report/20260831/CN_50100000_004604_FB020010_20260015.pdf)；登记公开日2026-08-31。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2024-12-31","2025-12-31","2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays"…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":["2025-11-11"],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"COMBINED_MANAGER_CUSTODIAN_OR_STAFF":{"covered_days":366,"missing_inter…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2024-12-31","2025-12-31","2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays"…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 005187 长安鑫兴灵活配置混合-C

产品：CN_PUBLIC_FUND:005186；候选类型：ACTIVE_EQUITY；已核字段：4；职责覆盖：1。

- 实际来源half：[80a8581d32283b52](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-08-31。
- 实际来源summary：[8d39cbfef8c7272a](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-06-26。
- 实际来源prospectus：[6f5754f20267846f](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-05-26。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；RATING_MARKET_SECTION_MISSING:(?m)^7\.3\s+[^\n]*股票\s*投\s*资\s*明\s*细 | 报告完整受限表、全部资产范围声明和资产负债表逐元对账；不从旧分项或风险档换算 |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 005284 华商可转债债券-C

产品：CN_PUBLIC_FUND:005273；候选类型：None；已核字段：3；职责覆盖：1。

- 实际来源half：[4258ea0242995fa6](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-08-31。
- 实际来源prospectus：[dbc3b9d44c9119e6](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2025-12-03。
- 实际来源summary：[c211ae2f0979c0d5](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2025-12-03。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| holder_pressure_band | SOURCE_VALUE_UNRESOLVED；HOLDER_FLOW_ROW_AMBIGUOUS | 完整当期20%持有人及期初/申购/赎回/期末份额表 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；QUALITY_PLEDGED_BONDS_COLLATERAL_AMOUNT_NOT_DISCLOSED:EXCHANGE | 报告完整受限表、全部资产范围声明和资产负债表逐元对账；不从旧分项或风险档换算 |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| tracking_error | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 005312 万家经济新动能混合-C

产品：CN_PUBLIC_FUND:005311；候选类型：ACTIVE_EQUITY；已核字段：4；职责覆盖：1。

- 实际来源half：[aefee1502153af75](https://www.wjasset.com/upload/pdf/1787908209251-wanjiajingjixindongnenghunhexingzhengquantouzijijin2026nianzhongqibaogao.pdf)；登记公开日未登记，不能用取得日代填。
- 实际来源prospectus：[54b06be2b55a315c](https://www.wjasset.com/upload/pdf/1787226214884-wjjjxdnhhxzqtzjjgxzmsms(2026nd1h).pdf)；登记公开日未登记，不能用取得日代填。
- 实际来源summary：[b8ff9d081d893ce5](https://www.wjasset.com/upload/pdf/1787226162589-wjjjxdnhhxzqtzjjjjcpzlgy(gx).pdf)；登记公开日未登记，不能用取得日代填。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2024-12-31","2025-12-31","2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays"…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"COMBINED_MANAGER_CUSTODIAN_OR_STAFF":{"covered_days":366,"missing_intervals":[["202…（完整结构见JSON） |
| holder_pressure_band | SOURCE_VALUE_UNRESOLVED；HOLDER_FLOW_VALUE_MISSING | 完整当期20%持有人及期初/申购/赎回/期末份额表 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2024-12-31","2025-12-31","2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays"…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 006038 大成景恒混合-C

产品：CN_PUBLIC_FUND:090019；候选类型：ACTIVE_EQUITY；已核字段：5；职责覆盖：1。

- 实际来源half：[b0d8bb1f484b3728](https://www.dcfund.com.cn/plat_files/upload/ann_upload/20260828/202608281787877319535.pdf)；登记公开日2026-08-28。
- 实际来源summary：[aec83191cf4cb60d](https://www.dcfund.com.cn/plat_files/upload/ann_upload/20260630/202606301782775844673.pdf)；登记公开日2026-06-30。
- 实际来源prospectus：[f925cab4c0ac14a9](https://www.dcfund.com.cn/plat_files/upload/ann_upload/20260724/202607241784895235245.pdf)；登记公开日2026-07-25。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 预先冻结并经验证的本类现金目标上下界及对应合同版本 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 006476 南方原油(QDII-LOF-FOF)-C

产品：CN_PUBLIC_FUND:501018；候选类型：None；已核字段：4；职责覆盖：1。

- 实际来源half：[8657be8afc9ec45b](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-08-31。
- 实际来源summary：[bd8ee002772cd05d](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-05-21。
- 实际来源prospectus：[710b9d9d35703379](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-05-21。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":[],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值日历"} |
| extra_drawdown | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":[],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值日历"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":[],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值日历"} |
| relative_return_1y | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":[],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值日历"} |
| relative_return_3y | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":[],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值日历"} |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；FULL_ASSET_RESTRICTION_SCOPE_NOT_EXPLICIT | 报告完整受限表、全部资产范围声明和资产负债表逐元对账；不从旧分项或风险档换算 |
| rolling_target_success | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":[],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值日历"} |
| tracking_error | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":[],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值日历"} |

### 006730 万家中证500指数增强-C

产品：CN_PUBLIC_FUND:006729；候选类型：INDEX_ENHANCED；已核字段：11；职责覆盖：1。

- 实际来源half：[af1454c6c12c20af](https://www.wjasset.com/upload/pdf/1787908232767-wjzz500zszqxfqszqtzjj2026nzqbg.pdf)；登记公开日未登记，不能用取得日代填。
- 实际来源prospectus：[836fb79929aa7793](https://www.wjasset.com/upload/pdf/1785929889692-wjzz500zszqxfqszqtzjjgxzmsms(2026nd1h).pdf)；登记公开日未登记，不能用取得日代填。
- 实际来源summary：[e179f05caf31b9d3](https://www.wjasset.com/upload/pdf/1785929834329-wjzz500zszqxfqszqtzjjjjcpzlgy(gx).pdf)；登记公开日未登记，不能用取得日代填。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2024-12-31","2025-12-31","2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays"…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"COMBINED_MANAGER_CUSTODIAN_OR_STAFF":{"covered_days":366,"missing_intervals":[["202…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2024-12-31","2025-12-31","2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays"…（完整结构见JSON） |

### 007045 博道沪深300指数增强-C

产品：CN_PUBLIC_FUND:007044；候选类型：INDEX_ENHANCED；已核字段：3；职责覆盖：1。

- 实际来源half：[021ac042abb1d146](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-08-31。
- 实际来源summary：[3d1c0297baa2be42](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2025-11-07。
- 实际来源prospectus：[82eaaec5ed638520](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2025-11-07。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| holder_pressure_band | SOURCE_STATEMENT_UNAVAILABLE；REPRINT_THRESHOLD_STATEMENT_NOT_PRESENT_DIRECT_REPORT_CONFIRMATION_REQUIRED | 当期明确未触发20%阈值的原文，或完整触发区间及份额表；现有正文无该声明，不能推定为零 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；RATING_MARKET_SECTION_MISSING:[56]\.4\.12\.4\s*期末参与转融通 | 报告完整受限表、全部资产范围声明和资产负债表逐元对账；不从旧分项或风险档换算 |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 007356 汇添富科技创新灵活配置混合-C

产品：CN_PUBLIC_FUND:007355；候选类型：ACTIVE_EQUITY；已核字段：5；职责覆盖：1。

- 实际来源half：[fa36fbc40faf18f3](https://www.99fund.com/announcement/zx/upload/2026/20260828/aa0f3ee446614ffb894ce4dce6b265f6.pdf)；登记公开日未登记，不能用取得日代填。
- 实际来源prospectus：[11722d4769e85289](https://www.99fund.com/announcement/zx/upload/2026/20260724/2fc5cd2d0108463cbcf17541fb36ba9d.pdf)；登记公开日未登记，不能用取得日代填。
- 实际来源summary：[8175abc6d94fabce](https://www.99fund.com/announcement/zx/upload/2026/20260724/5bb2a20505be4b06b59e0b8f9e188060.pdf)；登记公开日未登记，不能用取得日代填。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 007509 华商润丰灵活配置混合-C

产品：CN_PUBLIC_FUND:003598；候选类型：ACTIVE_EQUITY；已核字段：4；职责覆盖：1。

- 实际来源half：[e77249bd24eb2c88](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-08-31。
- 实际来源summary：[7d2a02c7e80342d3](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-01-16。
- 实际来源prospectus：[fa9fdc2d5e22302d](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-01-16。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；QUALITY_PLEDGED_BONDS_COLLATERAL_AMOUNT_NOT_DISCLOSED:EXCHANGE | 报告完整受限表、全部资产范围声明和资产负债表逐元对账；不从旧分项或风险档换算 |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 007832 博道伍佰智航股票-C

产品：CN_PUBLIC_FUND:007831；候选类型：ACTIVE_EQUITY；已核字段：3；职责覆盖：1。

- 实际来源summary：[08a04760a747bef4](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-09-24。
- 实际来源prospectus：[73a7a6ee727c9346](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-09-24。
- 实际来源half：[1b9355d3a9d82937](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-08-31。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| holder_pressure_band | SOURCE_STATEMENT_UNAVAILABLE；REPRINT_THRESHOLD_STATEMENT_NOT_PRESENT_DIRECT_REPORT_CONFIRMATION_REQUIRED | 当期明确未触发20%阈值的原文，或完整触发区间及份额表；现有正文无该声明，不能推定为零 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；RATING_MARKET_SECTION_MISSING:[56]\.4\.12\.4\s*期末参与转融通 | 报告完整受限表、全部资产范围声明和资产负债表逐元对账；不从旧分项或风险档换算 |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 007950 招商量化精选股票-C

产品：CN_PUBLIC_FUND:001917；候选类型：ACTIVE_EQUITY；已核字段：4；职责覆盖：1。

- 实际来源half：[338d92442ad1f801](https://static.cmfchina.com/fundarticle/20260831/20025436515479.pdf)；登记公开日2026-08-31。
- 实际来源summary：[b741c1a560baf255](https://static.cmfchina.com/fundarticle/20260727/20024575175596.pdf)；登记公开日2026-07-27。
- 实际来源prospectus：[f00f9bbc00b73175](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-07-27。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| holder_pressure_band | SOURCE_STATEMENT_UNAVAILABLE；ORIGINAL_THRESHOLD_STATEMENT_NOT_PRESENT_NOT_PROOF_OF_ZERO | 当期明确未触发20%阈值的原文，或完整触发区间及份额表；现有正文无该声明，不能推定为零 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 008164 南方标普中国A股大盘红利低波50ETF联接-C

产品：CN_PUBLIC_FUND:008163；候选类型：PASSIVE_INDEX；已核字段：4；职责覆盖：1。

- 实际来源half：[0e72d0ac5bbe232a](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-08-31。
- 实际来源summary：[acb8dc679ccf4b41](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-03-09。
- 实际来源prospectus：[391b838e2f573592](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2025-12-03。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED；INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 同日目标指数完整成分权重、发行人及行业映射；目标ETF实际持仓不能冒充指数目标权重 |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED；INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 同日目标指数完整成分权重、发行人及行业映射；目标ETF实际持仓不能冒充指数目标权重 |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；LINK_AND_TARGET_FULL_RESTRICTIONS_REQUIRED | 报告完整受限表、全部资产范围声明和资产负债表逐元对账；不从旧分项或风险档换算 |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| tracking_error | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 008603 方正富邦新兴成长混合-C

产品：CN_PUBLIC_FUND:008602；候选类型：ACTIVE_EQUITY；已核字段：4；职责覆盖：1。

- 实际来源half：[caa38486e346efd0](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-08-31。
- 实际来源summary：[e2556cb73513be9b](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-05-21。
- 实际来源prospectus：[97567bbfb18172bf](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-05-21。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 预先冻结并经验证的本类现金目标上下界及对应合同版本 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；FULL_ASSET_RESTRICTION_SCOPE_NOT_EXPLICIT | 全部资产受限声明与金额；联接还需自身及目标ETF可赎回/受限情况分别核验 |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 008764 天弘越南市场股票(QDII)-C

产品：CN_PUBLIC_FUND:008763；候选类型：GLOBAL_ACTIVE_EQUITY；已核字段：4；职责覆盖：1。

- 实际来源half：[91840aba8c3b155c](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-08-31。
- 实际来源summary：[3a99641a02206041](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-06-26。
- 实际来源prospectus：[ac1f5866e0f68d8e](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2025-11-13。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":[],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值日历"} |
| extra_drawdown | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":[],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值日历"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":["2026-06-26"],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-1…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":[],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值日历"} |
| relative_return_1y | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":[],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值日历"} |
| relative_return_3y | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":[],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值日历"} |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；RATING_MARKET_SECTION_MISSING:(?m)^7\.3\s+[^\n]*股票\s*投\s*资\s*明\s*细 | 报告完整受限表、全部资产范围声明和资产负债表逐元对账；不从旧分项或风险档换算 |
| rolling_target_success | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":[],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值日历"} |

### 008888 华夏国证半导体芯片ETF联接-C

产品：CN_PUBLIC_FUND:008887；候选类型：PASSIVE_INDEX；已核字段：4；职责覆盖：1。

- 实际来源half：[18219e1073501159](https://fund.chinaamc.com/upload/resources/file/2026/08/31/efc08378950448909c453a1b8a721fb1.pdf)；登记公开日未登记，不能用取得日代填。
- 实际来源prospectus：[604088c4d945e9ae](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-05-29。
- 实际来源summary：[71e647b0fca2b751](https://fund.chinaamc.com/upload/resources/file/2026/05/29/3a0f29a4a8154ff9bdecf823e43ea52e.pdf)；登记公开日未登记，不能用取得日代填。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 预先冻结并经验证的本类现金目标上下界及对应合同版本 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED；INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 同日目标指数完整成分权重、发行人及行业映射；目标ETF实际持仓不能冒充指数目标权重 |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED；INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 同日目标指数完整成分权重、发行人及行业映射；目标ETF实际持仓不能冒充指数目标权重 |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；LINK_AND_TARGET_FULL_RESTRICTIONS_REQUIRED | 报告完整受限表、全部资产范围声明和资产负债表逐元对账；不从旧分项或风险档换算 |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| tracking_error | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 008960 长信国防军工量化灵活配置混合-C

产品：CN_PUBLIC_FUND:002983；候选类型：ACTIVE_EQUITY；已核字段：4；职责覆盖：1。

- 实际来源half：[5afc7f947bec309c](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-08-31。
- 实际来源summary：[a9bed5cb1ebe921d](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-09-21。
- 实际来源prospectus：[b1c22ee7ae0e965c](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-09-21。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"observed_on":"2026-09-30","state":"CURRENT_QUARTER_DISCLOSURE_DEADLINE_UNVERIFIED"}],"expected_report_dates":["2023-12-31","20…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 预先冻结并经验证的本类现金目标上下界及对应合同版本 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":["2026-04-30"],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-1…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"observed_on":"2026-09-30","state":"CURRENT_QUARTER_DISCLOSURE_DEADLINE_UNVERIFIED"}],"expected_report_dates":["2023-12-31","20…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；FULL_ASSET_RESTRICTION_SCOPE_NOT_EXPLICIT | 全部资产受限声明与金额；联接还需自身及目标ETF可赎回/受限情况分别核验 |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 010710 安信医药健康主题股票-C

产品：CN_PUBLIC_FUND:010709；候选类型：ACTIVE_EQUITY；已核字段：4；职责覆盖：1。

- 实际来源half：[dd628abbb8f99fe2](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-08-28。
- 实际来源prospectus：[9347eb8c96aa95f0](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-07-27。
- 实际来源summary：[3772c4ca9f7533d9](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-07-27。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 预先冻结并经验证的本类现金目标上下界及对应合同版本 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；RATING_STOCK_CELLS_INCOMPLETE_OR_AMBIGUOUS | 报告完整受限表、全部资产范围声明和资产负债表逐元对账；不从旧分项或风险档换算 |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 010737 易方达沪深300指数精选增强-C

产品：CN_PUBLIC_FUND:010736；候选类型：INDEX_ENHANCED；已核字段：5；职责覆盖：1。

- 实际来源half：[d822d6653f70ce12](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-08-31。
- 实际来源summary：[6179f2073447db2a](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-08-11。
- 实际来源prospectus：[0093e017d2200680](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-06-01。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"observed_on":"2026-09-30","state":"CURRENT_QUARTER_DISCLOSURE_DEADLINE_UNVERIFIED"}],"expected_report_dates":["2023-12-31","20…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"observed_on":"2026-09-30","state":"CURRENT_QUARTER_DISCLOSURE_DEADLINE_UNVERIFIED"}],"expected_report_dates":["2023-12-31","20…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 011036 嘉实中证稀土产业ETF联接-C

产品：CN_PUBLIC_FUND:011035；候选类型：PASSIVE_INDEX；已核字段：4；职责覆盖：1。

- 实际来源half：[45971a3e8107d13c](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-08-31。
- 实际来源prospectus：[d37febcec6616a2d](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-07-04。
- 实际来源summary：[1b7561db3f6e1d98](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-06-10。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":["2026-01-05","2026-02-12"],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-0…（完整结构见JSON） |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED；INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 同日目标指数完整成分权重、发行人及行业映射；目标ETF实际持仓不能冒充指数目标权重 |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED；INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 同日目标指数完整成分权重、发行人及行业映射；目标ETF实际持仓不能冒充指数目标权重 |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；LINK_AND_TARGET_FULL_RESTRICTIONS_REQUIRED | 报告完整受限表、全部资产范围声明和资产负债表逐元对账；不从旧分项或风险档换算 |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| tracking_error | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 011066 大成高鑫股票-C

产品：CN_PUBLIC_FUND:000628；候选类型：ACTIVE_EQUITY；已核字段：5；职责覆盖：1。

- 实际来源half：[26f684c0cc6de3a7](https://www.dcfund.com.cn/plat_files/upload/ann_upload/20260828/202608281787877362819.pdf)；登记公开日2026-08-28。
- 实际来源summary：[703b4974fc27b2ab](https://www.dcfund.com.cn/plat_files/upload/ann_upload/20260630/202606301782772671983.pdf)；登记公开日2026-06-30。
- 实际来源prospectus：[b25757162af5d498](https://www.dcfund.com.cn/plat_files/upload/ann_upload/20260302/202603021772435265532.pdf)；登记公开日2026-03-03。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 预先冻结并经验证的本类现金目标上下界及对应合同版本 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 011103 天弘中证光伏产业指数-C

产品：CN_PUBLIC_FUND:011102；候选类型：PASSIVE_INDEX；已核字段：4；职责覆盖：1。

- 实际来源half：[1de7894ab989f1fe](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-08-31。
- 实际来源summary：[1c6f2920e5ebb36c](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-06-26。
- 实际来源prospectus：[feb4ce3e38bac146](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2025-10-21。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 预先冻结并经验证的本类现金目标上下界及对应合同版本 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":["2026-06-26"],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-1…（完整结构见JSON） |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED；INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 同日目标指数完整成分权重、发行人及行业映射；目标ETF实际持仓不能冒充指数目标权重 |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED；INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 同日目标指数完整成分权重、发行人及行业映射；目标ETF实际持仓不能冒充指数目标权重 |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；FULL_ASSET_RESTRICTION_SCOPE_NOT_EXPLICIT | 报告完整受限表、全部资产范围声明和资产负债表逐元对账；不从旧分项或风险档换算 |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| tracking_error | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 012835 招商景气精选股票-A

产品：CN_PUBLIC_FUND:012835；候选类型：ACTIVE_EQUITY；已核字段：4；职责覆盖：1。

- 实际来源half：[f8f21718411ea131](https://static.cmfchina.com/fundarticle/20260831/20025327278709.pdf)；登记公开日2026-08-31。
- 实际来源prospectus：[b54f115dc1dadfd0](https://static.cmfchina.com/fundarticle/20260717/20024025722697.pdf)；登记公开日2026-07-17。
- 实际来源summary：[96473d9c17d7d10a](https://static.cmfchina.com/fundarticle/20260717/20024026376700.pdf)；登记公开日2026-07-17。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2023-09-30","2023-12-31","2024-03-31","2024-06-30","2024-09-30","2024-12-31","2025-03-31","2025-06-30","2025-09-30","2025-12-31","2026-03-31","2026-06-30"],"contract_versions_available":14,"disclosure_wait_or_unv…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":["2025-10-27"],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"COMBINED_MANAGER_CUSTODIAN_OR_STAFF":{"covered_days":640,"missing_inter…（完整结构见JSON） |
| holder_pressure_band | SOURCE_STATEMENT_UNAVAILABLE；ORIGINAL_THRESHOLD_STATEMENT_NOT_PRESENT_NOT_PROOF_OF_ZERO | 当期明确未触发20%阈值的原文，或完整触发区间及份额表；现有正文无该声明，不能推定为零 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2023-09-30","2023-12-31","2024-03-31","2024-06-30","2024-09-30","2024-12-31","2025-03-31","2025-06-30","2025-09-30","2025-12-31","2026-03-31","2026-06-30"],"contract_versions_available":14,"disclosure_wait_or_unv…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 012836 招商景气精选股票-C

产品：CN_PUBLIC_FUND:012835；候选类型：ACTIVE_EQUITY；已核字段：4；职责覆盖：1。

- 实际来源half：[f8f21718411ea131](https://static.cmfchina.com/fundarticle/20260831/20025327278709.pdf)；登记公开日2026-08-31。
- 实际来源prospectus：[b54f115dc1dadfd0](https://static.cmfchina.com/fundarticle/20260717/20024025722697.pdf)；登记公开日2026-07-17。
- 实际来源summary：[0248ba52c05c3ee2](https://static.cmfchina.com/fundarticle/20260717/20024027697810.pdf)；登记公开日2026-07-17。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2023-09-30","2023-12-31","2024-03-31","2024-06-30","2024-09-30","2024-12-31","2025-03-31","2025-06-30","2025-09-30","2025-12-31","2026-03-31","2026-06-30"],"contract_versions_available":14,"disclosure_wait_or_unv…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":["2025-10-27"],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"COMBINED_MANAGER_CUSTODIAN_OR_STAFF":{"covered_days":640,"missing_inter…（完整结构见JSON） |
| holder_pressure_band | SOURCE_STATEMENT_UNAVAILABLE；ORIGINAL_THRESHOLD_STATEMENT_NOT_PRESENT_NOT_PROOF_OF_ZERO | 当期明确未触发20%阈值的原文，或完整触发区间及份额表；现有正文无该声明，不能推定为零 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2023-09-30","2023-12-31","2024-03-31","2024-06-30","2024-09-30","2024-12-31","2025-03-31","2025-06-30","2025-09-30","2025-12-31","2026-03-31","2026-06-30"],"contract_versions_available":14,"disclosure_wait_or_unv…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 013180 广发国证新能源车电池ETF联接-C

产品：CN_PUBLIC_FUND:013179；候选类型：PASSIVE_INDEX；已核字段：11；职责覆盖：1。

- 实际来源link-half：[f7ad041c6c36a6be](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日未登记，不能用取得日代填。
- 实际来源link-summary：[756edf0e4de0eb93](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日未登记，不能用取得日代填。
- 实际来源link-prospectus：[a7950eac6ce8111e](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日未登记，不能用取得日代填。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 预先冻结并经验证的本类现金目标上下界及对应合同版本 |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED；INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 同日目标指数完整成分权重、发行人及行业映射；目标ETF实际持仓不能冒充指数目标权重 |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED；INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 同日目标指数完整成分权重、发行人及行业映射；目标ETF实际持仓不能冒充指数目标权重 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；LINK_AND_TARGET_FULL_RESTRICTIONS_REQUIRED | 全部资产受限声明与金额；联接还需自身及目标ETF可赎回/受限情况分别核验 |

### 013275 富国中证煤炭指数(LOF)-C

产品：CN_PUBLIC_FUND:161032；候选类型：PASSIVE_INDEX；已核字段：13；职责覆盖：1。

- 实际来源half：[c69162ee3bb4c2b7](https://www.fullgoal.com.cn/wbs-file/fund_report/20260831/CN_50100000_161032_FB020010_20260015.pdf)；登记公开日2026-08-31。
- 实际来源summary：[5a9b3e1c5ba6023d](https://www.fullgoal.com.cn/wbs-file/fund_report/20260612/CN_50100000_161032_FA010080_20260013_013275_20260612_090000_01.pdf)；登记公开日2026-06-12。
- 实际来源prospectus：[5befdb4baf20b80e](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-06-12。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| governance_state | SOURCE_WINDOW_INCOMPLETE；KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":["2025-11-11"],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"COMBINED_MANAGER_CUSTODIAN_OR_STAFF":{"covered_days":366,"missing_inter…（完整结构见JSON） |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED；INDEX_WEIGHTS_PRESENT_FULL_ISSUER_IDENTITY_MAPPING_REQUIRED | 同日指数成分和行业原件已核实；仍缺股票/债券跨证券发行人身份及非证券资产归属规则，证券代码不能代替发行人 |

### 013330 富国中证银行指数-C

产品：CN_PUBLIC_FUND:161029；候选类型：PASSIVE_INDEX；已核字段：13；职责覆盖：1。

- 实际来源half：[e462c50f26d2b078](https://www.fullgoal.com.cn/wbs-file/fund_report/20260831/CN_50100000_161029_FB020010_20260012.pdf)；登记公开日2026-08-31。
- 实际来源summary：[d61d127f31a254cb](https://www.fullgoal.com.cn/wbs-file/fund_report/20260520/CN_50100000_161029_FA010080_20260010_013330_20260520_090000_01.pdf)；登记公开日2026-05-20。
- 实际来源prospectus：[aa1876f35c74c316](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-05-20。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| governance_state | SOURCE_WINDOW_INCOMPLETE；KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":["2025-11-11"],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"COMBINED_MANAGER_CUSTODIAN_OR_STAFF":{"covered_days":366,"missing_inter…（完整结构见JSON） |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED；INDEX_WEIGHTS_PRESENT_FULL_ISSUER_IDENTITY_MAPPING_REQUIRED | 同日指数成分和行业原件已核实；仍缺股票/债券跨证券发行人身份及非证券资产归属规则，证券代码不能代替发行人 |

### 013472 华宝中证全指农牧渔ETF联接-C

产品：CN_PUBLIC_FUND:013471；候选类型：PASSIVE_INDEX；已核字段：4；职责覆盖：1。

- 实际来源prospectus：[72cb004851efcf10](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-09-03。
- 实际来源summary：[43c6ef73d77835d4](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-09-03。
- 实际来源half：[895c9465ab74f5fe](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-08-31。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 预先冻结并经验证的本类现金目标上下界及对应合同版本 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED；INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 同日目标指数完整成分权重、发行人及行业映射；目标ETF实际持仓不能冒充指数目标权重 |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED；INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 同日目标指数完整成分权重、发行人及行业映射；目标ETF实际持仓不能冒充指数目标权重 |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；LINK_AND_TARGET_FULL_RESTRICTIONS_REQUIRED | 报告完整受限表、全部资产范围声明和资产负债表逐元对账；不从旧分项或风险档换算 |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| tracking_error | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 013853 大成匠心卓越三年持有期混合-A

产品：CN_PUBLIC_FUND:013853；候选类型：ACTIVE_EQUITY；已核字段：5；职责覆盖：1。

- 实际来源half：[89376b88f0b476b1](https://www.dcfund.com.cn/plat_files/upload/ann_upload/20260828/202608281787877318317.pdf)；登记公开日2026-08-28。
- 实际来源prospectus：[372e6548d6420831](https://www.dcfund.com.cn/plat_files/upload/ann_upload/20260706/202607061783340813715.pdf)；登记公开日2026-07-07。
- 实际来源summary：[666039d253c19d20](https://www.dcfund.com.cn/plat_files/upload/ann_upload/20260529/202605291780015319837.pdf)；登记公开日2026-05-29。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 预先冻结并经验证的本类现金目标上下界及对应合同版本 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 014156 国泰海通中证500指数增强-C

产品：CN_PUBLIC_FUND:014155；候选类型：INDEX_ENHANCED；已核字段：4；职责覆盖：1。

- 实际来源half：[55aaab07a1cf29fb](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-08-31。
- 实际来源prospectus：[1b69ed0c9f1ebb52](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2025-12-12。
- 实际来源summary：[889d0e2f5fbfca75](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2025-12-12。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；RATING_STOCK_CELLS_INCOMPLETE_OR_AMBIGUOUS | 报告完整受限表、全部资产范围声明和资产负债表逐元对账；不从旧分项或风险档换算 |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 014978 华安纳斯达克100ETF联接(QDII)-C-CNY

产品：CN_PUBLIC_FUND:040046；候选类型：None；已核字段：4；职责覆盖：1。

- 实际来源summary：[4e4673633065288f](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-09-18。
- 实际来源prospectus：[d73e6a21d7f4e50a](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-09-18。
- 实际来源half：[56f2f7fe545cb9e2](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-08-31。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":[],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值日历"} |
| extra_drawdown | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":[],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值日历"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":[],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值日历"} |
| relative_return_1y | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":[],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值日历"} |
| relative_return_3y | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":[],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值日历"} |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；LINK_AND_TARGET_FULL_RESTRICTIONS_REQUIRED | 报告完整受限表、全部资产范围声明和资产负债表逐元对账；不从旧分项或风险档换算 |
| rolling_target_success | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":[],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值日历"} |
| tracking_error | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":[],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值日历"} |

### 015596 国泰国证有色金属行业指数-C

产品：CN_PUBLIC_FUND:160221；候选类型：PASSIVE_INDEX；已核字段：4；职责覆盖：1。

- 实际来源summary：[afe3c289687cdd8a](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-09-21。
- 实际来源prospectus：[13c1b0bd255ac65a](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-09-21。
- 实际来源half：[329ee6c22c1fb83c](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-08-31。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 预先冻结并经验证的本类现金目标上下界及对应合同版本 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED；INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 同日目标指数完整成分权重、发行人及行业映射；目标ETF实际持仓不能冒充指数目标权重 |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED；INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 同日目标指数完整成分权重、发行人及行业映射；目标ETF实际持仓不能冒充指数目标权重 |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；RATING_MARKET_SECTION_MISSING:[56]\.4\.12\.4\s*期末参与转融通 | 报告完整受限表、全部资产范围声明和资产负债表逐元对账；不从旧分项或风险档换算 |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| tracking_error | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 016008 招商中证消费电子主题ETF联接-C

产品：CN_PUBLIC_FUND:016007；候选类型：PASSIVE_INDEX；已核字段：9；职责覆盖：FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED。

- 实际来源link-half：[19277ca7387b21fb](https://static.cmfchina.com/fundarticle/20260831/20025160463726.pdf)；登记公开日未登记，不能用取得日代填。
- 实际来源link-prospectus：[753554835658bbc1](https://static.cmfchina.com/fundarticle/20260213/20020663127281.pdf)；登记公开日未登记，不能用取得日代填。
- 实际来源link-summary：[df7e184e51217126](https://static.cmfchina.com/fundarticle/20260213/20020665025744.pdf)；登记公开日未登记，不能用取得日代填。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 预先冻结并经验证的本类现金目标上下界及对应合同版本 |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| holder_pressure_band | SOURCE_STATEMENT_UNAVAILABLE；ORIGINAL_THRESHOLD_STATEMENT_NOT_PRESENT_NOT_PROOF_OF_ZERO | 当期明确未触发20%阈值的原文，或完整触发区间及份额表；现有正文无该声明，不能推定为零 |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED；INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 同日目标指数完整成分权重、发行人及行业映射；目标ETF实际持仓不能冒充指数目标权重 |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED；INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 同日目标指数完整成分权重、发行人及行业映射；目标ETF实际持仓不能冒充指数目标权重 |
| key_person_coverage | COLLECTION_REQUIRED；FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED | 正式职责原文、正式任免/代理记录及三年连续覆盖 |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；LINK_AND_TARGET_FULL_RESTRICTIONS_REQUIRED | 全部资产受限声明与金额；联接还需自身及目标ETF可赎回/受限情况分别核验 |

### 017145 华宝海外新能源汽车股票(QDII)-C

产品：CN_PUBLIC_FUND:017144；候选类型：GLOBAL_ACTIVE_EQUITY；已核字段：3；职责覆盖：FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING。

- 实际来源summary：[259b6abce56a4353](https://www.fsfund.com//static//notice/2025/12/09/3e64cc0b-fae4-4eea-9622-a71c41500e98/华宝海外新能源汽车股票型发起式证券投资基金（QDII）（C类份额）基金产品资料概要（更新）.pdf)；登记公开日2025-12-09。
- 实际来源half：[b4fe5c2275001cb1](https://www.fsfund.com//static//notice/2026/08/31/a9d7b89e-43a3-4323-952c-2c1633b811e7_t/华宝海外新能源汽车股票型发起式证券投资基金（QDII）2026年中期报告.pdf)；登记公开日2026-08-31。
- 另于2026-10-17 07:22实际取得2025临时更新招募书126页，已找到职责原文；文件写明费率更新截至2025-02-14、其余截至2024-10-31。真实公开日期及截至2026-09-30最新适用版本尚未核定，因此未接入本冻结批次；不是权限不足。见manager-prospectus-discovery收据。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":0,"disclosure_wait_or_unverified_dates":[{"observed_on":"2026-09-30","state":"CURRENT_QUARTER_DISCLOSURE_DEADLINE_UNVERIFIED"}],"expected_report_dates":["2023-12-31","20…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 预先冻结并经验证的本类现金目标上下界及对应合同版本 |
| extra_downside | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":[],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值日历"} |
| extra_drawdown | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":[],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值日历"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED；FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式基金经理职责条文、全部任职/代理生效记录和连续自然日覆盖证明 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":0,"disclosure_wait_or_unverified_dates":[{"observed_on":"2026-09-30","state":"CURRENT_QUARTER_DISCLOSURE_DEADLINE_UNVERIFIED"}],"expected_report_dates":["2023-12-31","20…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":[],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值日历"} |
| relative_return_1y | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":[],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值日历"} |
| relative_return_3y | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":[],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值日历"} |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；FULL_ASSET_RESTRICTION_SCOPE_NOT_EXPLICIT | 全部资产受限声明与金额；联接还需自身及目标ETF可赎回/受限情况分别核验 |
| rolling_target_success | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":[],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值日历"} |

### 017493 东方红新动力灵活配置混合-C

产品：CN_PUBLIC_FUND:000480；候选类型：ACTIVE_EQUITY；已核字段：5；职责覆盖：1。

- 实际来源half：[8e6afb7ab0ad3bd7](https://www.dfham.com/upload/pdf/1788137438312-dfhxdllhpzhhxzqtzjj2026nzqbg.pdf)；登记公开日2026-08-31。
- 实际来源summary：[58117d44740672eb](https://www.dfham.com/upload/pdf/1772781336034-dfhxdllhpzhhxzqtzjj(Clfe)jjcpzlgygx.pdf)；登记公开日2026-03-06。
- 实际来源prospectus：[c4b885844b255e0f](https://www.dfham.com/upload/pdf/1772781335586-dfhxdllhpzhhxzqtzjjzmsms(gx)(2026nd1h).pdf)；登记公开日2026-03-06。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 017960 招商趋势领航混合-A

产品：CN_PUBLIC_FUND:017960；候选类型：ACTIVE_EQUITY；已核字段：4；职责覆盖：1。

- 实际来源half：[a4e0350124800641](https://static.cmfchina.com/fundarticle/20260831/20025432681571.pdf)；登记公开日2026-08-31。
- 实际来源prospectus：[809349512dba25f2](https://static.cmfchina.com/fundarticle/20260601/20023274201065.pdf)；登记公开日2026-06-01。
- 实际来源summary：[c9486d04f0bcb3e4](https://static.cmfchina.com/fundarticle/20260601/20023275679043.pdf)；登记公开日2026-06-01。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2023-09-30","2023-12-31","2024-03-31","2024-06-30","2024-09-30","2024-12-31","2025-03-31","2025-06-30","2025-09-30","2025-12-31","2026-03-31","2026-06-30"],"contract_versions_available":10,"disclosure_wait_or_unv…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":["2025-10-27"],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"COMBINED_MANAGER_CUSTODIAN_OR_STAFF":{"covered_days":640,"missing_inter…（完整结构见JSON） |
| holder_pressure_band | SOURCE_STATEMENT_UNAVAILABLE；ORIGINAL_THRESHOLD_STATEMENT_NOT_PRESENT_NOT_PROOF_OF_ZERO | 当期明确未触发20%阈值的原文，或完整触发区间及份额表；现有正文无该声明，不能推定为零 |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2023-09-30","2023-12-31","2024-03-31","2024-06-30","2024-09-30","2024-12-31","2025-03-31","2025-06-30","2025-09-30","2025-12-31","2026-03-31","2026-06-30"],"contract_versions_available":10,"disclosure_wait_or_unv…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 018125 永赢先进制造智选混合-C

产品：CN_PUBLIC_FUND:018124；候选类型：ACTIVE_EQUITY；已核字段：4；职责覆盖：FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING。

- 实际来源half：[4ec6732484568544](https://owa.maxwealthfund.com/gateway/cms.file/file/notice/2026/08/28/永赢先进制造智选混合型发起式证券投资基金2026年中期报告_1787907759675.pdf)；登记公开日2026-08-31。
- 实际来源summary：[d393c4b6242ca68a](https://owa.maxwealthfund.com/gateway/cms.file/file/notice/2026/05/29/永赢先进制造智选混合型发起式证券投资基金（C份额）基金产品资料概要更新(2026年第1号)_1780022805109.pdf)；登记公开日2026-05-30。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2024-12-31","2025-12-31","2026-06-30"],"contract_versions_available":0,"disclosure_wait_or_unverified_dates":[{"observed_on":"2026-09-30","state":"CURRENT_QUARTER_DISCLOSURE_DEADLINE_UNVERIFIED"}],"expected_repor…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 预先冻结并经验证的本类现金目标上下界及对应合同版本 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":["2026-02-09"],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"COMBINED_MANAGER_CUSTODIAN_OR_STAFF":{"covered_days":366,"missing_inter…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED；FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式基金经理职责条文、全部任职/代理生效记录和连续自然日覆盖证明 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2024-12-31","2025-12-31","2026-06-30"],"contract_versions_available":0,"disclosure_wait_or_unverified_dates":[{"observed_on":"2026-09-30","state":"CURRENT_QUARTER_DISCLOSURE_DEADLINE_UNVERIFIED"}],"expected_repor…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 018156 创金合信全球医药生物股票(QDII)-C

产品：CN_PUBLIC_FUND:018155；候选类型：GLOBAL_ACTIVE_EQUITY；已核字段：2；职责覆盖：FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED。

- 实际来源summary：[20a77a2bc44dda00](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-09-30。
- 实际来源half：[eb9657a52d7fdd96](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-08-28。
- 实际来源prospectus：[931c0313e2da1926](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-09-30。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 预先冻结并经验证的本类现金目标上下界及对应合同版本 |
| extra_downside | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":["2023-09-28","2023-10-09","2023-10-10","2023-10-11","2023-10-12","2023-10-13","2023-10-16","2023-10-17","2023-10-18","2023-10-19","2023-10-20","2023-10-23","2023-10-24","2023-10-25","2023-10-26","2023-10-27","2023-…（完整结构见JSON） |
| extra_drawdown | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":["2023-09-28","2023-10-09","2023-10-10","2023-10-11","2023-10-12","2023-10-13","2023-10-16","2023-10-17","2023-10-18","2023-10-19","2023-10-20","2023-10-23","2023-10-24","2023-10-25","2023-10-26","2023-10-27","2023-…（完整结构见JSON） |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| key_person_coverage | COLLECTION_REQUIRED；FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED | 正式职责原文、正式任免/代理记录及三年连续覆盖 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":["2023-09-28","2023-10-09","2023-10-10","2023-10-11","2023-10-12","2023-10-13","2023-10-16","2023-10-17","2023-10-18","2023-10-19","2023-10-20","2023-10-23","2023-10-24","2023-10-25","2023-10-26","2023-10-27","2023-…（完整结构见JSON） |
| relative_return_1y | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":["2023-09-28","2023-10-09","2023-10-10","2023-10-11","2023-10-12","2023-10-13","2023-10-16","2023-10-17","2023-10-18","2023-10-19","2023-10-20","2023-10-23","2023-10-24","2023-10-25","2023-10-26","2023-10-27","2023-…（完整结构见JSON） |
| relative_return_3y | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":["2023-09-28","2023-10-09","2023-10-10","2023-10-11","2023-10-12","2023-10-13","2023-10-16","2023-10-17","2023-10-18","2023-10-19","2023-10-20","2023-10-23","2023-10-24","2023-10-25","2023-10-26","2023-10-27","2023-…（完整结构见JSON） |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；RATING_MARKET_SECTION_MISSING:(?m)^7\.3\s+[^\n]*股票\s*投\s*资\s*明\s*细 | 报告完整受限表、全部资产范围声明和资产负债表逐元对账；不从旧分项或风险档换算 |
| rolling_target_success | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":["2023-09-28","2023-10-09","2023-10-10","2023-10-11","2023-10-12","2023-10-13","2023-10-16","2023-10-17","2023-10-18","2023-10-19","2023-10-20","2023-10-23","2023-10-24","2023-10-25","2023-10-26","2023-10-27","2023-…（完整结构见JSON） |
| team_months | SOURCE_WINDOW_INCOMPLETE；AVAILABLE_PRODUCT_HISTORY_SHORTER_THAN_36_MONTHS | {"available_manager_from":"2023-11-17","original_current_contract_date":"2023-11-17","required_from":"2023-09-30","source":"现有原文与任职记录起点晚于候选窗口；转型前历史须另核，不能补入成立前记录"} |

### 018590 银华体育文化灵活配置混合-C

产品：CN_PUBLIC_FUND:003397；候选类型：ACTIVE_EQUITY；已核字段：5；职责覆盖：1。

- 实际来源half：[8431d6ed27f30cc8](https://pdf.dfcfw.com/pdf/H2_AN202608291828680593_1.pdf?1787994591000.pdf)；登记公开日未登记，不能用取得日代填。
- 实际来源summary：[542a707ae51ccc6f](https://www.yhfund.com.cn/plat_files/upload/png_upload/20260205/202602051770279188363.docx)；登记公开日未登记，不能用取得日代填。
- 实际来源prospectus：[c1069c85219c2803](https://www.yhfund.com.cn/plat_files/upload/png_upload/20260205/202602051770279217385.docx)；登记公开日未登记，不能用取得日代填。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2024-12-31","2025-12-31","2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays"…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"COMBINED_MANAGER_CUSTODIAN_OR_STAFF":{"covered_days":366,"missing_intervals":[["202…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2024-12-31","2025-12-31","2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays"…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 018853 博时标普石油天然气勘探及生产精选行业指数(QDII)-C-CNY

产品：CN_PUBLIC_FUND:018851；候选类型：None；已核字段：3；职责覆盖：FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING。

- 实际来源summary：[54a64e36184b6445](https://www.bosera.com/common/downloadFile.do?fileId=6C4F2BBBB6690D110E822D13585F05B0)；登记公开日未登记，不能用取得日代填。
- 实际来源half：[3a83b0add42918c4](https://www.bosera.com/common/downloadFile.do?fileId=BBA5BD9F036BCDF0E87A60C35BC63D75)；登记公开日2026-08-31。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":0,"disclosure_wait_or_unverified_dates":[{"observed_on":"2026-09-30","state":"CURRENT_QUARTER_DISCLOSURE_DEADLINE_UNVERIFIED"}],"expected_report_dates":["2023-12-31","20…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":["2023-10-09","2023-10-10","2023-10-11","2023-10-12","2023-10-16","2023-10-17"],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值…（完整结构见JSON） |
| extra_drawdown | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":["2023-10-09","2023-10-10","2023-10-11","2023-10-12","2023-10-16","2023-10-17"],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值…（完整结构见JSON） |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED；FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式基金经理职责条文、全部任职/代理生效记录和连续自然日覆盖证明 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":0,"disclosure_wait_or_unverified_dates":[{"observed_on":"2026-09-30","state":"CURRENT_QUARTER_DISCLOSURE_DEADLINE_UNVERIFIED"}],"expected_report_dates":["2023-12-31","20…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":["2023-10-09","2023-10-10","2023-10-11","2023-10-12","2023-10-16","2023-10-17"],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值…（完整结构见JSON） |
| relative_return_1y | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":["2023-10-09","2023-10-10","2023-10-11","2023-10-12","2023-10-16","2023-10-17"],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值…（完整结构见JSON） |
| relative_return_3y | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":["2023-10-09","2023-10-10","2023-10-11","2023-10-12","2023-10-16","2023-10-17"],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值…（完整结构见JSON） |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；RATING_MARKET_SECTION_MISSING:(?m)^7\.3\s+[^\n]*股票\s*投\s*资\s*明\s*细 | 报告完整受限表、全部资产范围声明和资产负债表逐元对账；不从旧分项或风险档换算 |
| rolling_target_success | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":["2023-10-09","2023-10-10","2023-10-11","2023-10-12","2023-10-16","2023-10-17"],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值…（完整结构见JSON） |
| tracking_error | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":["2023-10-09","2023-10-10","2023-10-11","2023-10-12","2023-10-16","2023-10-17"],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值…（完整结构见JSON） |

### 019449 摩根日本精选股票(QDII)-C

产品：CN_PUBLIC_FUND:007280；候选类型：GLOBAL_ACTIVE_EQUITY；已核字段：4；职责覆盖：1。

- 实际来源half：[58918a87bf1333ea](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-08-31。
- 实际来源summary：[8bd1a09f68b9d521](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2025-09-30。
- 实际来源prospectus：[c09e419c4b7f17b7](https://www.cifm.com/fund/007280/lawfile/202509/P020250930310405876444.pdf)；登记公开日未登记，不能用取得日代填。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"observed_on":"2026-09-30","state":"CURRENT_QUARTER_DISCLOSURE_DEADLINE_UNVERIFIED"}],"expected_report_dates":["2023-12-31","20…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":["2023-10-09","2023-11-23","2024-04-29","2024-05-06","2024-08-12","2024-11-04"],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值…（完整结构见JSON） |
| extra_drawdown | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":["2023-10-09","2023-11-23","2024-04-29","2024-05-06","2024-08-12","2024-11-04"],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值…（完整结构见JSON） |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"observed_on":"2026-09-30","state":"CURRENT_QUARTER_DISCLOSURE_DEADLINE_UNVERIFIED"}],"expected_report_dates":["2023-12-31","20…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":["2023-10-09","2023-11-23","2024-04-29","2024-05-06","2024-08-12","2024-11-04"],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值…（完整结构见JSON） |
| relative_return_1y | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":["2023-10-09","2023-11-23","2024-04-29","2024-05-06","2024-08-12","2024-11-04"],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值…（完整结构见JSON） |
| relative_return_3y | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":["2023-10-09","2023-11-23","2024-04-29","2024-05-06","2024-08-12","2024-11-04"],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值…（完整结构见JSON） |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；FULL_ASSET_RESTRICTION_SCOPE_NOT_EXPLICIT | 全部资产受限声明与金额；联接还需自身及目标ETF可赎回/受限情况分别核验 |
| rolling_target_success | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":["2023-10-09","2023-11-23","2024-04-29","2024-05-06","2024-08-12","2024-11-04"],"own_nav_status":"GLOBAL_VALUATION_CALENDAR_REVIEW_REQUIRED","paired_source_error":null,"required":"本份额再投资净值与合同基准完整37个月末及逐估值日；跨境须另核真实估值…（完整结构见JSON） |

### 021740 前海开源黄金ETF联接-C

产品：CN_PUBLIC_FUND:009198；候选类型：None；已核字段：3；职责覆盖：FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING。

- 实际来源half：[43ac104262c8ef82](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-08-31。
- 实际来源summary：[34133145b8783a14](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2025-12-10。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":0,"disclosure_wait_or_unverified_dates":[{"observed_on":"2026-09-30","state":"CURRENT_QUARTER_DISCLOSURE_DEADLINE_UNVERIFIED"}],"expected_report_dates":["2023-12-31","20…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":["2023-09-28","2023-10-09","2023-10-10","2023-10-11","2023-10-12","2023-10-13","2023-10-16","2023-10-17","2023-10-18","2023-10-19","2023-10-20","2023-10-23","2023-10-24","2023-10-25","2023-10-26","2023-10-27","2023-…（完整结构见JSON） |
| extra_drawdown | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":["2023-09-28","2023-10-09","2023-10-10","2023-10-11","2023-10-12","2023-10-13","2023-10-16","2023-10-17","2023-10-18","2023-10-19","2023-10-20","2023-10-23","2023-10-24","2023-10-25","2023-10-26","2023-10-27","2023-…（完整结构见JSON） |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| key_person_coverage | SOURCE_VALUE_UNRESOLVED；FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | 正式基金经理职责条文、全部任职/代理生效记录和连续自然日覆盖证明 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":0,"disclosure_wait_or_unverified_dates":[{"observed_on":"2026-09-30","state":"CURRENT_QUARTER_DISCLOSURE_DEADLINE_UNVERIFIED"}],"expected_report_dates":["2023-12-31","20…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":["2023-09-28","2023-10-09","2023-10-10","2023-10-11","2023-10-12","2023-10-13","2023-10-16","2023-10-17","2023-10-18","2023-10-19","2023-10-20","2023-10-23","2023-10-24","2023-10-25","2023-10-26","2023-10-27","2023-…（完整结构见JSON） |
| relative_return_1y | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":["2023-09-28","2023-10-09","2023-10-10","2023-10-11","2023-10-12","2023-10-13","2023-10-16","2023-10-17","2023-10-18","2023-10-19","2023-10-20","2023-10-23","2023-10-24","2023-10-25","2023-10-26","2023-10-27","2023-…（完整结构见JSON） |
| relative_return_3y | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":["2023-09-28","2023-10-09","2023-10-10","2023-10-11","2023-10-12","2023-10-13","2023-10-16","2023-10-17","2023-10-18","2023-10-19","2023-10-20","2023-10-23","2023-10-24","2023-10-25","2023-10-26","2023-10-27","2023-…（完整结构见JSON） |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；LINK_AND_TARGET_FULL_RESTRICTIONS_REQUIRED | 报告完整受限表、全部资产范围声明和资产负债表逐元对账；不从旧分项或风险档换算 |
| rolling_target_success | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":["2023-09-28","2023-10-09","2023-10-10","2023-10-11","2023-10-12","2023-10-13","2023-10-16","2023-10-17","2023-10-18","2023-10-19","2023-10-20","2023-10-23","2023-10-24","2023-10-25","2023-10-26","2023-10-27","2023-…（完整结构见JSON） |
| tracking_error | COLLECTION_REQUIRED；ALIGNED_CONTRACT_BENCHMARK_AND_FUND_HISTORY_REQUIRED | {"own_nav_missing_dates":["2023-09-28","2023-10-09","2023-10-10","2023-10-11","2023-10-12","2023-10-13","2023-10-16","2023-10-17","2023-10-18","2023-10-19","2023-10-20","2023-10-23","2023-10-24","2023-10-25","2023-10-26","2023-10-27","2023-…（完整结构见JSON） |

### 160119 南方中证500ETF联接(LOF)-A

产品：CN_PUBLIC_FUND:160119；候选类型：PASSIVE_INDEX；已核字段：4；职责覆盖：1。

- 实际来源summary：[933cde39517a3812](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-07-29。
- 实际来源prospectus：[dac8da1684a9c854](https://np-cnotice-fund.eastmoney.com/api/content/ann)；登记公开日2026-07-29。
- 实际来源half：[c2a647100894bda4](https://www.nffund.com/main/files/2026/08/28/223050409776.pdf)；登记公开日2026-08-31。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CONTRACT_BASKET_IS_NOT_CASH_TARGET_INTERVAL | 预先冻结的适用现金目标区间；合同现金加一年内政府债券下限不能代替现金上下界 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；KNOWN_ADVERSE_DECLARATIONS_SCOPE_SEVERITY_AND_REMEDIATION_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":["2025-10-17","2025-11-18"],"official_decisions_obtained":[{"document_number":"深外管检〔2025〕29号","event_date":"2025-11-18","source_hashes":["44b5639932cf0b0bf1814491031fb9b2…（完整结构见JSON） |
| industry_replication_deviation | REFERENCE_DATA_REQUIRED；INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 同日目标指数完整成分权重、发行人及行业映射；目标ETF实际持仓不能冒充指数目标权重 |
| issuer_replication_deviation | REFERENCE_DATA_REQUIRED；INDEX_CONSTITUENT_WEIGHTS_AND_ISSUER_TAXONOMY_REQUIRED | 同日目标指数完整成分权重、发行人及行业映射；目标ETF实际持仓不能冒充指数目标权重 |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；LINK_AND_TARGET_FULL_RESTRICTIONS_REQUIRED | 报告完整受限表、全部资产范围声明和资产负债表逐元对账；不从旧分项或风险档换算 |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| tracking_error | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

### 160323 华夏磐泰混合(LOF)-A

产品：CN_PUBLIC_FUND:160323；候选类型：ACTIVE_EQUITY；已核字段：4；职责覆盖：1。

- 实际来源half：[bae39540e2b86c20](https://fund.chinaamc.com/upload/resources/file/2026/08/31/2c7aebc9bd354063a44418c35b6be43b.pdf)；登记公开日未登记，不能用取得日代填。
- 实际来源prospectus：[9ab14228c054199f](https://fund.chinaamc.com/upload/resources/file/2026/05/29/bd0d5742e792442c95ebca97bd84dcb4.pdf)；登记公开日未登记，不能用取得日代填。
- 实际来源summary：[3ce3baa3f231d510](https://fund.chinaamc.com/upload/resources/file/2026/05/29/5304890800d64207a0abe49562510706.pdf)；登记公开日未登记，不能用取得日代填。

| 未完成指标 | 当前状态/原因 | 精确所需资料（长结构见JSON） |
| --- | --- | --- |
| allocation_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| capacity_pressure | METHOD_REFERENCE_REQUIRED；STRATEGY_CAPACITY_BOUNDS_NOT_EVIDENCED | 经证据支持并预先冻结的策略容量上界与持续运作下界；规模值或募集上限不等于策略容量 |
| cash_target_deviation | METHOD_REFERENCE_REQUIRED；CASH_TARGET_INTERVAL_NOT_DEFINED_BY_AVAILABLE_CONTRACT | 预先冻结并经验证的本类现金目标上下界及对应合同版本 |
| extra_downside | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| extra_drawdown | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| governance_state | SOURCE_WINDOW_INCOMPLETE；GOVERNANCE_THREE_YEAR_AND_INDEPENDENT_REVIEW_REQUIRED | {"available":["2026-01-01","2026-06-30"],"known_declared_event_dates":[],"official_decisions_obtained":[],"report_declaration_coverage":{"by_report_scope":{"MANAGER":{"covered_days":181,"missing_intervals":[["2023-09-30","2025-12-31"],["202…（完整结构见JSON） |
| industry_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| issuer_excess_concentration | REFERENCE_DATA_REQUIRED；INDEPENDENT_STYLE_PEER_STRUCTURE_REFERENCE_NOT_FROZEN | 预先冻结的同目标独立产品持仓参照、同报告日和同分类版本；不从本次对象反推参照 |
| mandate_deviation | SOURCE_WINDOW_INCOMPLETE；HISTORICAL_ALLOCATION_AND_EFFECTIVE_CONTRACTS_REQUIRED | {"available_report_dates":["2026-06-30"],"contract_versions_available":1,"disclosure_wait_or_unverified_dates":[{"calendar_hash":"4cb07f1a22092f38dad6f2100edbefb3bdc3dc1f925152afba5bc1fc3fbbffb2","elapsed_workdays":0,"observed_on":"2026-09-…（完整结构见JSON） |
| monthly_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_1y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| relative_return_3y | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |
| restricted_ratio | SOURCE_VALUE_UNRESOLVED；QUALITY_PLEDGED_BONDS_COLLATERAL_AMOUNT_NOT_DISCLOSED:EXCHANGE | 报告完整受限表、全部资产范围声明和资产负债表逐元对账；不从旧分项或风险档换算 |
| rolling_target_success | COLLECTION_REQUIRED；CONTRACT_BENCHMARK_HISTORY_REQUIRED_OWN_NAV_REBUILT | {"own_nav_missing_dates":[],"own_nav_status":"OWN_ADJUSTED_NAV_WINDOW_REBUILT","paired_source_error":null,"required":"完整37个月末、逐估值日合同基准；本份额净值已重建，不能重复报告为未采集"} |

## 收据与后续验收边界

run17两次独立脚本失败收据仍保留：初版仅支持公开API，未实现既有授权供应商快照/招募书历任表/DOCX读取，并曾匹配到目录标题。随后扩展独立读取器支持真实来源类型并读取正文条目，37项重新回读均通过；没有因此修改主数据或声称失败原件已通过。

正式启用仍须取得完整原始包，按产品和月份冻结真实校准、保留未用于选规则的独立验证，解释逐基金差异后再验收存储、API、页面及激活回滚。现阶段不得以本轮原件解析、描述相关性或工程回归替代该验收。
