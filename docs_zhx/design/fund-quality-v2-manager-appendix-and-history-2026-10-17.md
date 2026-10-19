# 基金质量V2任职原件附件与真实历史转换

记录生成：2026-10-17T08:17:09.521860+08:00；批量盘点冻结：2026-10-17T07:37:04.311873+08:00。

**V2尚未达到正式可用的验收条件。完整八维、合格完整校准产品和独立方法验收仍为0，原正式评分保留。**

## 已落地与真实运行

- 材料编译器升级为QUALITY_ORIGINALS_20261017_33，新增独立additional_manager_refs附件。真实任职API不得混入净值或历史披露；旧第一版完整来源包原样保留。
- 附件重核供应商HTTPS端点、角色、请求代码、路径、原始摘要、取得时刻及JSON实际任职行。产品级任职仍由正式主代码与份额任职交叉核验；验包会重新读取附件，不读取外部自填核验标志作为证明。
- 运行时重新查询49只份额、48个产品；批量原始字段235→236，新增016008职责覆盖1。235个旧字段的值、单位、观察日、来源绑定全部不变；15个旧第一版完整来源包相同，499件不同摘要来源已重核。
- 016008新HTTP响应有两条任职行，逐条与招募书历任表及概要现任日期相同：苏燕青2023-02-14至2025-03-20，侯昊自2025-03-20任职。三年1097个自然日连续覆盖。响应元数据count=0、实际items=2，因此未使用count或has_more标志证明完整性。
- 410项相关工程回归及Ruff通过；71包、三个考察月的真实隔离试算四类仍NOT_READY。283个部分指标对另经Pandas复核，其中48个系数、235个常量/小样本情形一致；未据此确认新权重或等级。
- 正式结果于2026-10-17T07:48:29.984318+08:00只读回查49条一致。原2026-09-30日期及130个旧批次保留；本轮没有改动每日00:30任务、生产存储或正式API。

## 017145旧档案复用及新原件

旧项目目录已保存同字节的2025年2月招募书及两份官方目录。前一轮对相同文件的下载属于重复取得，不增加独立原件或产品数量。

复用两份官方目录实际列示的20条记录后，又取得11份新PDF，并复用1份既有中期报告，共12份。全部经主解析及独立PDFium重读身份、日期和报告期；持有人表另由pdfplumber按原表单元格读取。

已观察目录中，截至2026-09-30较新的招募书公开日期为2025-12-09。2026-10-15更新版晚于考察日，未用于指标。2025年年报的公告索引也实际列示2025-12-09招募书，已独立交叉读取。实时完整目录未取得，因此只声称‘已观察目录中最新适用版本’，不声称全部目录已遍历。

该招募书不印份额代码。身份按原文法定全称、管理人、托管人，与同时含017144主代码及017145份额代码的正式报告绑定；不因目录路径或成功标志接受，也不因缺少封面代码误用旧版。

| 原件 | 实际公开日 | 经济报告期末 | 原始摘要 |
| --- | --- | --- | --- |
| [华宝海外新能源汽车股票型发起式证券投资基金（QDII）招募说明书（更新）](https://www.fsfund.com//static//notice/2025/12/09/d3b0f462-fc68-43ae-887d-aff2a006fa38/华宝海外新能源汽车股票型发起式证券投资基金（QDII）招募说明书（更新）.pdf) | 2025-12-09 | 不适用 | e4e955d7a75dffcf8b65 |
| [华宝海外新能源汽车股票型发起式证券投资基金（QDII）2025年中期报告](https://www.fsfund.com/webimages/upload2012/2025/08/28/46669e3e-47c1-41d2-bb33-44c04a5a3528/华宝海外新能源汽车股票型发起式证券投资基金（QDII）2025年中期报告.pdf) | 2025-08-29 | 2025-06-30 | 86e774dbbbb976b2477c |
| [华宝海外新能源汽车股票型发起式证券投资基金（QDII）2025年第2季度报告](https://www.fsfund.com/webimages/upload2012/2025/07/18/08d7365b-1196-4594-9231-98feb58b199b/华宝海外新能源汽车股票型发起式证券投资基金（QDII）2025年第2季度报告.pdf) | 2025-07-21 | 2025-06-30 | 63bba41bc8610fe2f6d5 |
| [华宝海外新能源汽车股票型发起式证券投资基金（QDII）2025年第1季度报告](https://www.fsfund.com/webimages/upload2012/2025/04/21/ce9f6991-2d0a-466a-bf21-7d4349bca5d7/华宝海外新能源汽车股票型发起式证券投资基金（QDII）2025年第1季度报告.pdf) | 2025-04-22 | 2025-03-31 | e94d8471488c0c924c56 |
| [华宝海外新能源汽车股票型发起式证券投资基金（QDII）2024年年度报告](https://www.fsfund.com/webimages/upload2012/2025/03/28/3b9eae90-3449-4973-aa37-78fdab7e4df3/华宝海外新能源汽车股票型发起式证券投资基金（QDII）2024年年度报告.pdf) | 2025-03-31 | 2024-12-31 | ea6364435baca2ab9bed |
| [华宝海外新能源汽车股票型发起式证券投资基金（QDII）2024年第4季度报告](https://www.fsfund.com/webimages/upload2012/2025/01/21/1dc41567-ef83-42f4-a324-c428901dceed/华宝海外新能源汽车股票型发起式证券投资基金（QDII）2024年第4季度报告.pdf) | 2025-01-22 | 2024-12-31 | e5251c756147828fdcad |
| [华宝海外新能源汽车股票型发起式证券投资基金（QDII）2026年中期报告](https://www.fsfund.com//static//notice/2026/08/31/a9d7b89e-43a3-4323-952c-2c1633b811e7_t/华宝海外新能源汽车股票型发起式证券投资基金（QDII）2026年中期报告.pdf) | 2026-08-31 | 2026-06-30 | b4fe5c2275001cb1b2e8 |
| [华宝海外新能源汽车股票型发起式证券投资基金（QDII）2026年第2季度报告](https://www.fsfund.com//static//notice/2026/07/21/6dfaa65c-9d95-45a5-9bfc-d228bc57fa84_t/华宝海外新能源汽车股票型发起式证券投资基金（QDII）2026年第2季度报告.pdf) | 2026-07-21 | 2026-06-30 | 6e3161d00593794edf99 |
| [华宝海外新能源汽车股票型发起式证券投资基金（QDII）2026年第1季度报告](https://www.fsfund.com//static//notice/2026/04/22/d9932075-2da2-4478-a415-4f9ca713a899/华宝海外新能源汽车股票型发起式证券投资基金（qdii）2026年第1季度报告.pdf) | 2026-04-22 | 2026-03-31 | 740b0d5b3e17d4531395 |
| [华宝海外新能源汽车股票型发起式证券投资基金（QDII）2025年年度报告](https://www.fsfund.com//static//notice/2026/03/31/477eba5f-86c7-4826-b5eb-553ca993d384/华宝海外新能源汽车股票型发起式证券投资基金（qdii）2025年年度报告.pdf) | 2026-03-31 | 2025-12-31 | 442809bb49accecc284b |
| [华宝海外新能源汽车股票型发起式证券投资基金（QDII）2025年第4季度报告](https://www.fsfund.com//static//notice/2026/01/22/8576c63e-146e-4a60-8620-2959842cb10f/华宝海外新能源汽车股票型发起式证券投资基金（qdii）2025年第4季度报告.pdf) | 2026-01-22 | 2025-12-31 | 1d1c9d47773e0a4250ee |
| [华宝海外新能源汽车股票型发起式证券投资基金（QDII）2025年第3季度报告](https://www.fsfund.com//static//notice/2025/10/28/3ef1efeb-2b36-4f44-ac87-0de27b8649df/华宝海外新能源汽车股票型发起式证券投资基金（qdii）2025年第3季度报告.pdf) | 2025-10-28 | 2025-09-30 | f2382908494c467b717f |

## 三个考察月的实际指标

下列是同一产品的独立输入包，不是三个独立产品。当前017145修正版尚未替换run20冻结的49只批量盘点；采用这个已复核修正版时，当前字段可由236增加为237，但不能把两个版本重复计样本。

两个历史月份各新增2个真实字段，共4个，属于补充输入；原22包79字段仍保留。合并前必须按产品/月份替换或追加明确记录，不能将它们冒充已经完成的73包整组验收。

| 考察月末 | 成本测算值 | 持有人档 | 职责覆盖 | 原始字段数 |
| --- | ---: | ---: | --- | ---: |
| 2025-04-30 | 2.10% | 1 | 窗口不足，保留缺失 | 2 |
| 2026-04-30 | 2.07% | 0 | 窗口不足，保留缺失 | 2 |
| 2026-09-30 | 2.07% | 0 | 1 | 4 |

成本是365天、无涨跌、无申购费且该期限赎回费为0的标准持有情景，直接使用已含基本费用的综合运作费率；不是账户实际支付费用或收益预测。

2024年年报实际列示机构在2024-01-18至2024-07-10期间达到20%阈值；期初/末均10,000,000份，申购和赎回均0，期末比例4.79%。原表五个金额/比例单元格及份额对账独立一致，所以档位为1；不能用期末4.79%把全期状态改成0。2025年年报明确披露全期无达20%单一投资者，档位为0。

2025-04-30与2026-04-30相对于成立日2023-05-23均不足完整36个月，团队/职责质量指标保持缺失，未补入成立前记录。当前月份只证明正式岗位连续承接及条文定义，不证明履职质量、能力或治理清白。

## 真实校准目前缺什么

当前43只候选适用份额中：27只合同给出的是现金加短债篮子而非纯现金目标区间，16只现有合同未定义现金目标区间；43只均未取得预先冻结的策略容量参考。治理方面，14只已有适用不利事项声明需进一步核范围、严重程度和整改，其余29只也缺完整窗口与独立审查。

这是原始资料、方法参考和验收证据三种不同缺口。不能把银行活期本金、合同篮子下限、同类均值、成交负荷原型或公司整改自述直接改称已满足原指标。当前职责覆盖多为常量，原型成交负荷与集中度还可能机械重叠，都须进入真实去重与权重研究。

原始观测和方法参考可分两阶段准备：先重读原件形成带单位、窗口、目标分类和来源的观测集；再在产品与时间隔离的校准侧研究参考定义，冻结后转换完整八维。参考观测集不等于合格完整校准集；缺失资料不补零，其他维度不分走缺失权重。现金分布的分位数本身也不能自动变成理想现金目标。

当前校准侧既有产品数按类型分别为主动14、境外主动4、增强4、被动9；这些是当前产品分组，不是已满足时间/资料门槛的合格校准产品。候选门槛按每类30产品，且30不是统计充分保证；A/C、月份和新版本都不能凑数。当前9月数据晚于既有8月31日校准截止，不能倒移到校准期。

| 待核指标 | 当前公式 | 窗口/单位 | 原要求来源 |
| --- | --- | --- | --- |
| cash_target_deviation | max(合同现金下界-现金比例,0,现金比例-合同现金上界) | 最新完整报告日；ratio | 报告货币资金、净资产及适用合同现金区间；无区间不猜目标 |
| capacity_pressure | max(规模/冻结策略容量上界-1,0)+max(冻结持续运作下界/规模-1,0) | 最新报告日及同窗容量核验；ratio | 产品规模、策略可交易容量及持续运作边界；不得默认2亿元 |
| governance_state | 0=已证实重大且未整改；1=非重大或已整改；2=完整核查且未见适用不利事项 | 截至考察日及36个月事项；ordinal:0,1,2 | 官方原文、适用对象、严重性、整改及独立人工复核；未查到不等于2 |

## 来源阻塞的精确边界

| 来源/请求 | 实际观察 | 当前结论 |
| --- | --- | --- |
| Tushare fund_basic，场内/场外、存续/退市四组隔离目录请求 | 四组失败，未保存到HTTP响应；复核场外存续一组得到SSL CERTIFICATE_VERIFY_FAILED、certificate has expired、ConnectError | 目前未取得新增候选目录；这是已观察到的TLS/可信链阻塞，尚不能确认目录查询权限或完整性 |
| 华宝queryArticles公开目录接口 | HTTP 200但业务码9999，网点代码不能为空；按已存官网JS补静态netNo头后仍相同 | 请求契约/渠道仍待定位，不判为账号权限不足；已存目录只能证明已观察行，不能声称全目录完整 |
| 华宝官网明确PDF链接 | 11份新原件取得，1份原件复用；12份身份/日期/报告期独立复核 | 原件通道可用，继续复用与补取；没有因为目录接口失败停止已知原件转换 |

没有关闭TLS验证、改用明文Token请求或把失败目录当空市场。source_registry中的历史授权记录也不能代替本次实际响应。当前两份目录只有20条观察行，2023年至2024年更早披露仍有缺口；后续优先通过官网正常页面核目录和更早报告。

## 逐基金状态与来源索引

完整逐指标所需资料、已有来源及原因保存于同批fund-metric-source-gaps.json。下表列出当前批量状态；017145修正版单列，避免把未合并输入冒充已冻结批次。

| 份额 | 名称 | 候选类别 | 批量已核字段 | 职责覆盖状态 | 未完成指标 |
| --- | --- | --- | ---: | --- | --- |
| 001021 | 华夏亚债中国债券指数-A | 当前候选方法不支持 | 4 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_excess_concentration, industry_replication_deviation, issuer_excess_concentration, issuer_replication_deviation, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, restricted_ratio, rolling_target_success, tracking_error |
| 001632 | 天弘中证食品饮料ETF联接-C | PASSIVE_INDEX | 4 | 1，正式岗位覆盖 | capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_replication_deviation, issuer_replication_deviation, monthly_target_success, relative_return_1y, relative_return_3y, restricted_ratio, rolling_target_success, tracking_error |
| 002112 | 德邦鑫星价值灵活配置混合-C | ACTIVE_EQUITY | 5 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_excess_concentration, issuer_excess_concentration, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, rolling_target_success |
| 002170 | 东吴移动互联灵活配置混合-C | ACTIVE_EQUITY | 5 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_excess_concentration, issuer_excess_concentration, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, rolling_target_success |
| 004237 | 中欧新蓝筹灵活配置混合-C | ACTIVE_EQUITY | 4 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_excess_concentration, issuer_excess_concentration, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, restricted_ratio, rolling_target_success |
| 004605 | 富国新活力灵活配置混合-C | ACTIVE_EQUITY | 5 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_excess_concentration, issuer_excess_concentration, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, rolling_target_success |
| 005187 | 长安鑫兴灵活配置混合-C | ACTIVE_EQUITY | 4 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_excess_concentration, issuer_excess_concentration, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, restricted_ratio, rolling_target_success |
| 005284 | 华商可转债债券-C | 当前候选方法不支持 | 3 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, holder_pressure_band, industry_excess_concentration, industry_replication_deviation, issuer_excess_concentration, issuer_replication_deviation, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, restricted_ratio, rolling_target_success, tracking_error |
| 005312 | 万家经济新动能混合-C | ACTIVE_EQUITY | 4 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, holder_pressure_band, industry_excess_concentration, issuer_excess_concentration, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, rolling_target_success |
| 006038 | 大成景恒混合-C | ACTIVE_EQUITY | 5 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_excess_concentration, issuer_excess_concentration, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, rolling_target_success |
| 006476 | 南方原油(QDII-LOF-FOF)-C | 当前候选方法不支持 | 4 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_excess_concentration, industry_replication_deviation, issuer_excess_concentration, issuer_replication_deviation, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, restricted_ratio, rolling_target_success, tracking_error |
| 006730 | 万家中证500指数增强-C | INDEX_ENHANCED | 11 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, governance_state, industry_excess_concentration, issuer_excess_concentration, mandate_deviation |
| 007045 | 博道沪深300指数增强-C | INDEX_ENHANCED | 3 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, holder_pressure_band, industry_excess_concentration, issuer_excess_concentration, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, restricted_ratio, rolling_target_success |
| 007356 | 汇添富科技创新灵活配置混合-C | ACTIVE_EQUITY | 5 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_excess_concentration, issuer_excess_concentration, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, rolling_target_success |
| 007509 | 华商润丰灵活配置混合-C | ACTIVE_EQUITY | 4 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_excess_concentration, issuer_excess_concentration, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, restricted_ratio, rolling_target_success |
| 007832 | 博道伍佰智航股票-C | ACTIVE_EQUITY | 3 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, holder_pressure_band, industry_excess_concentration, issuer_excess_concentration, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, restricted_ratio, rolling_target_success |
| 007950 | 招商量化精选股票-C | ACTIVE_EQUITY | 4 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, holder_pressure_band, industry_excess_concentration, issuer_excess_concentration, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, rolling_target_success |
| 008164 | 南方标普中国A股大盘红利低波50ETF联接-C | PASSIVE_INDEX | 4 | 1，正式岗位覆盖 | capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_replication_deviation, issuer_replication_deviation, monthly_target_success, relative_return_1y, relative_return_3y, restricted_ratio, rolling_target_success, tracking_error |
| 008603 | 方正富邦新兴成长混合-C | ACTIVE_EQUITY | 4 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_excess_concentration, issuer_excess_concentration, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, restricted_ratio, rolling_target_success |
| 008764 | 天弘越南市场股票(QDII)-C | GLOBAL_ACTIVE_EQUITY | 4 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_excess_concentration, issuer_excess_concentration, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, restricted_ratio, rolling_target_success |
| 008888 | 华夏国证半导体芯片ETF联接-C | PASSIVE_INDEX | 4 | 1，正式岗位覆盖 | capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_replication_deviation, issuer_replication_deviation, monthly_target_success, relative_return_1y, relative_return_3y, restricted_ratio, rolling_target_success, tracking_error |
| 008960 | 长信国防军工量化灵活配置混合-C | ACTIVE_EQUITY | 4 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_excess_concentration, issuer_excess_concentration, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, restricted_ratio, rolling_target_success |
| 010710 | 安信医药健康主题股票-C | ACTIVE_EQUITY | 4 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_excess_concentration, issuer_excess_concentration, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, restricted_ratio, rolling_target_success |
| 010737 | 易方达沪深300指数精选增强-C | INDEX_ENHANCED | 5 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_excess_concentration, issuer_excess_concentration, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, rolling_target_success |
| 011036 | 嘉实中证稀土产业ETF联接-C | PASSIVE_INDEX | 4 | 1，正式岗位覆盖 | capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_replication_deviation, issuer_replication_deviation, monthly_target_success, relative_return_1y, relative_return_3y, restricted_ratio, rolling_target_success, tracking_error |
| 011066 | 大成高鑫股票-C | ACTIVE_EQUITY | 5 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_excess_concentration, issuer_excess_concentration, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, rolling_target_success |
| 011103 | 天弘中证光伏产业指数-C | PASSIVE_INDEX | 4 | 1，正式岗位覆盖 | capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_replication_deviation, issuer_replication_deviation, monthly_target_success, relative_return_1y, relative_return_3y, restricted_ratio, rolling_target_success, tracking_error |
| 012835 | 招商景气精选股票-A | ACTIVE_EQUITY | 4 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, holder_pressure_band, industry_excess_concentration, issuer_excess_concentration, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, rolling_target_success |
| 012836 | 招商景气精选股票-C | ACTIVE_EQUITY | 4 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, holder_pressure_band, industry_excess_concentration, issuer_excess_concentration, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, rolling_target_success |
| 013180 | 广发国证新能源车电池ETF联接-C | PASSIVE_INDEX | 11 | 1，正式岗位覆盖 | capacity_pressure, cash_target_deviation, governance_state, industry_replication_deviation, issuer_replication_deviation, restricted_ratio |
| 013275 | 富国中证煤炭指数(LOF)-C | PASSIVE_INDEX | 13 | 1，正式岗位覆盖 | capacity_pressure, cash_target_deviation, governance_state, issuer_replication_deviation |
| 013330 | 富国中证银行指数-C | PASSIVE_INDEX | 13 | 1，正式岗位覆盖 | capacity_pressure, cash_target_deviation, governance_state, issuer_replication_deviation |
| 013472 | 华宝中证全指农牧渔ETF联接-C | PASSIVE_INDEX | 4 | 1，正式岗位覆盖 | capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_replication_deviation, issuer_replication_deviation, monthly_target_success, relative_return_1y, relative_return_3y, restricted_ratio, rolling_target_success, tracking_error |
| 013853 | 大成匠心卓越三年持有期混合-A | ACTIVE_EQUITY | 5 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_excess_concentration, issuer_excess_concentration, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, rolling_target_success |
| 014156 | 国泰海通中证500指数增强-C | INDEX_ENHANCED | 4 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_excess_concentration, issuer_excess_concentration, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, restricted_ratio, rolling_target_success |
| 014978 | 华安纳斯达克100ETF联接(QDII)-C-CNY | 当前候选方法不支持 | 4 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_excess_concentration, industry_replication_deviation, issuer_excess_concentration, issuer_replication_deviation, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, restricted_ratio, rolling_target_success, tracking_error |
| 015596 | 国泰国证有色金属行业指数-C | PASSIVE_INDEX | 4 | 1，正式岗位覆盖 | capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_replication_deviation, issuer_replication_deviation, monthly_target_success, relative_return_1y, relative_return_3y, restricted_ratio, rolling_target_success, tracking_error |
| 016008 | 招商中证消费电子主题ETF联接-C | PASSIVE_INDEX | 10 | 1，正式岗位覆盖 | capacity_pressure, cash_target_deviation, governance_state, holder_pressure_band, industry_replication_deviation, issuer_replication_deviation, restricted_ratio |
| 017145 | 华宝海外新能源汽车股票(QDII)-C | GLOBAL_ACTIVE_EQUITY | 3 | 批量仍缺；独立修正版已复核为1 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_excess_concentration, issuer_excess_concentration, key_person_coverage, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, restricted_ratio, rolling_target_success |
| 017493 | 东方红新动力灵活配置混合-C | ACTIVE_EQUITY | 5 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_excess_concentration, issuer_excess_concentration, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, rolling_target_success |
| 017960 | 招商趋势领航混合-A | ACTIVE_EQUITY | 4 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, holder_pressure_band, industry_excess_concentration, issuer_excess_concentration, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, rolling_target_success |
| 018125 | 永赢先进制造智选混合-C | ACTIVE_EQUITY | 4 | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_excess_concentration, issuer_excess_concentration, key_person_coverage, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, rolling_target_success |
| 018156 | 创金合信全球医药生物股票(QDII)-C | GLOBAL_ACTIVE_EQUITY | 2 | FORMAL_RESPONSIBILITY_AND_COMPLETE_APPOINTMENT_HISTORY_REQUIRED | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_excess_concentration, issuer_excess_concentration, key_person_coverage, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, restricted_ratio, rolling_target_success, team_months |
| 018590 | 银华体育文化灵活配置混合-C | ACTIVE_EQUITY | 5 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_excess_concentration, issuer_excess_concentration, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, rolling_target_success |
| 018853 | 博时标普石油天然气勘探及生产精选行业指数(QDII)-C-CNY | 当前候选方法不支持 | 3 | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_excess_concentration, industry_replication_deviation, issuer_excess_concentration, issuer_replication_deviation, key_person_coverage, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, restricted_ratio, rolling_target_success, tracking_error |
| 019449 | 摩根日本精选股票(QDII)-C | GLOBAL_ACTIVE_EQUITY | 4 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_excess_concentration, issuer_excess_concentration, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, restricted_ratio, rolling_target_success |
| 021740 | 前海开源黄金ETF联接-C | 当前候选方法不支持 | 3 | FORMAL_RESPONSIBILITY_CLAUSE_OR_FULL_COVERAGE_MISSING | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_excess_concentration, industry_replication_deviation, issuer_excess_concentration, issuer_replication_deviation, key_person_coverage, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, restricted_ratio, rolling_target_success, tracking_error |
| 160119 | 南方中证500ETF联接(LOF)-A | PASSIVE_INDEX | 4 | 1，正式岗位覆盖 | capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_replication_deviation, issuer_replication_deviation, monthly_target_success, relative_return_1y, relative_return_3y, restricted_ratio, rolling_target_success, tracking_error |
| 160323 | 华夏磐泰混合(LOF)-A | ACTIVE_EQUITY | 4 | 1，正式岗位覆盖 | allocation_deviation, capacity_pressure, cash_target_deviation, extra_downside, extra_drawdown, governance_state, industry_excess_concentration, issuer_excess_concentration, mandate_deviation, monthly_target_success, relative_return_1y, relative_return_3y, restricted_ratio, rolling_target_success |

018156原件给出的当前合同及任职起点是2023-11-17，晚于所需2023-09-30；转型前须另核，不能补入起点前历史。018125仍缺正式职责原件；018853和021740当前候选方法尚不支持其目标类型，相应来源缺口也照实保留。

## 尚未完成的正式验收

仍须补齐完整原始输入与方法参考，形成真实校准及未参与选规则的独立验证证据，解释逐基金新旧差异，并验收正式存储、上限原因、发布校验、API、必要页面及激活/回滚。此次未生成V2总分、等级或激活记录；局部回读、410项工程回归和发现目录都不替代该验收。
