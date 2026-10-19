# 基金质量V2：原件转换、候选定义与真实验证进展

更新于 2026-10-17T17:21:36.109460+08:00。**最新实现为V56，完整V2仍未通过验收，原正式评分保留。**评价基金本身的综合质量，不预测涨跌，不以训练模型为前提。

## 本轮实际完成

| 项目 | 实际结果 |
| --- | --- |
| 精确指数身份已解决 | 发布方allIndexes目录明确HSCI为Hang Seng Composite Index、PI价格指数、网站内部代码00011.00。未猜HSCI.00；目录、历史及当前报价三个实际端点身份一致，另列10069.00全收益与20069.00净全收益以防混用。 |
| 官方日价格原件已取得并接入 | 正确内部代码查询返回1231条历史收盘。两开发产品三份额的当前包各转换739点，排除9月30日以后11点；两份2026-05-01历史包各转换736点，排除116点后续观察。单位是指数点，不是人民币合同基准。 |
| 真正收据进入资料链 | 两份实际目录/历史JSON及两份下载收据原字节通过普通source-root接入。转换及verify_packet均重读URL、大小、时间、摘要、身份、日期、正值；布尔标志不授予原件资格。 |
| 缺日未假装齐全 | 当前基金估值日727个，22日没有当日恒生收盘，先保留原始缺日，不补零、不插值、不无条件前填。两历史包尚无完整本份额日历，缺日列表空不代表已对齐。 |
| 休市依据已取得 | 四年证券市场假日通告、当日台风交易规则及天文台实际信号时间解释全部22日：21公假，1日由两原文前提推导天气停市。2024通告第2页已查看，半日市与整日休市分开；该研究证据尚未接入自动价格对齐。 |
| 真实转换、核验与入口 | 仅改变的两产品、三当前份额和两历史包共5包完成V56转换、原件核验及最终源码隔离入口；均NOT_READY，没有锚点、总分或等级。A/C及跨月不增加独立产品数。 |
| 工程检查 | 736项测试及Ruff通过，冻结66份运行源码，源码/测试快照154项。工程假样本未进入真实校准。 |

[真实5包转换](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run46/targeted-primary1/result.json)、[最终源码再次核原件及入口](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run46/targeted-entry1/result.json)、[发布方三端点核对](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run46/publisher-identity-crosscheck.json)、[736项工程检查](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run46/engineering-checks.json)。本轮新增评分原始字段仍为0；合法的成分价格事实不能冒充完整八维资料。

## 修正上一轮的来源状态

V55的两个历史请求分别传HSCI和HSCI.00，原HTTP500响应继续保留。实际发布方目录现已证明其网站请求身份是00011.00，正确请求已成功取得历史。**不再把前两次500当作HSCI历史不可获取，也不能据它们判账户无权限。**先前用products查到的是挂钩产品目录，不是指数总目录。[精确目录原件](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run46/hsci-index-catalog1/receipt.json)、[正确历史请求原件](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run46/hsci-price-originals2/receipt.json)、[保留旧失败及修正](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run46/earlier-history500-correction.json)。

这不推翻012835官网“合成基准”两次同日期查询的窗口依赖事实。它是另一个合成响应；本轮取得的是发布方单一成分的价格。V55实测2024Q2基准59个同日期比值的舍入区间不相容，仍未将该合成曲线当连续B_t使用。[此前同日期证据](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run45/cmf-chain-coherence1/result.json)。也未把另外基金的同名字段当作本份额已经验证。

## 成分价格、日历与汇率的真实边界

当前739个实际恒生价格日与727个基金估值日不是同一集合，原始日期和值均保留。对22个无当日收盘日，港交所四年原件共明确58个年度公假，实际命中的21日已逐日绑定来源；2024-09-06则由港交所“中午12点仍有八号信号则全日取消交易”和天文台“12:40才降为三号”两前提推导，明确标为推断。没有把2024-09-23起的新恶劣天气交易规则倒用于此前日期。[22日逐日依据](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run46/hkex-closure-reconciliation1/result.json)、[通告第2页版面核对](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run46/hkex-closure-reconciliation1/visual-review.json)。

这些来源先作为真实日期映射依据保留。尚需把合格的休市规则接入成分序列对齐、解释基准在非基金估值日的计算口径，并另路核算；目前自动程序仍不填这22日。历史包没有完整基金日历，因此只承认736条成分观察，不声称“历史零缺口”。

已有沪深300、中证800各727日，中债总值/1-3年全价各749个窗口内工作日，继续复用V55原件；当前新模块只将恒生成分接入包，其他成分仍待同样的身份、代码和日期绑定。[既有成分原件与日历](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run45/component-coverage1/result.json)。中债响应未印CBA00223，应结合实际合同名称、官方全价/期限标签及编制说明核定，不能从数字后缀猜代码。

两产品的2025年年报又已实际读到“外币交易”政策，均规定采用估值日即期汇率，未在该段指定某条发布序列；两份2026中报本轮关键词读取没有补出具名来源，不据此声称全文件所有可能依据不存在。[四份财务原件核读](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run46/valuation-fx-periodic-originals1/result.json)。当前招募书也仅约定依届时法规，或由管理人与托管人协商实际汇率。不能任取中间价、交易参考价或结算价充作实际基金估值HKD/CNY序列。仍需核实际选用依据及相应日原值，HSCI点位自身不完成汇率转换。

## 配置约束仍未成为完整评分指标

两个产品各11个当前应披露时点，共22个独立产品时点；012835/012836同属一个产品，份额层共33个可计算时点。年度与四季报同日不重复。92个条件演算不是92个产品、月份或盲法验证样本。6份合同各21条组合限制及调整期原句继续保留，当前只解释股票和港股比例子集，不能认定全部约束满足。

012835在2026年一季度股票463,338,335.75元、总资产580,750,136.35元、两类净资产合计572,662,073.61元。股票占总资产约79.78%，占净资产约80.91%。按两种合同分母假设，子集距离分别为0.002172661272…和0。**两种场景均不证明违规、合规或应调级，不能择优选分母。**当使用净资产场景时，程序把合同阈值换回总资产坐标，不把按净资产归一、合计超过1的资产权重塞进simplex。[此前实际分母案例及版面](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run43/denominator-review1/result.json)。

新公告原页具名列出两个产品，自2023年7月10日起调整费率并修订合同；程序只将它记为登记修订日的公告依据，仍保留完整版本链未证明的缺口。[官网原页](https://www.cmfchina.com/web/fundnoticedetail/210674/index.html)。既有5份托管协议也已实际读取，当前抽取仍未提供可直接绑定通用“基金资产”分母的依据，不据此声称所有可能解释均不存在。[托管原件读取](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run44/trustee-originals1/result.json)。

完整允许集合的操作定义、适用约束、同期有效版本、分母及投资范围穿透仍需闭环。程序始终不把子集结果写入metrics，也不把未发现偏离写为0。RAW4、候选权重、锚点、等级上限和校准器未变；如果研究后修改定义，必须显式冻结新契约，不能静默缩减范围以凑出分数。



## 合同生效日与计算方法继续保留

具名调整公告的目录日期2026-04-30、正文落款2026-05-01、保守可用日下界5月1日及真实生效日2026-06-01分别保存；公开/落款日不等于生效日，也不证明首次HTTP版本。两产品当前包采用“已生效”事件，2026-05-01历史包为“已公告未生效”。最新公式未倒用三年，完整初始合同和全部生效变更链仍需闭环。

012835/012836从沪深300 80%＋恒生综合10%（经汇率调整）＋中债综合全价10%，变为中证800 80%＋恒生综合10%＋中债综合全价1-3年10%。017960从中证800 65%＋恒生综合15%（经汇率调整）＋中债综合全价20%，变为中证800 75%＋中债综合全价1-3年15%＋恒生综合10%。新招募书明确000906、HSCI、CBA00223，按预设权重计算每日组合收益后逐日连乘，恒生按基金估值汇率折人民币。[真实生效时间线](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run46/benchmark-effective-timeline.csv)。

## 逐基金、逐指标、逐来源结果

| 可复查资料 | 范围和边界 |
| --- | --- |
| [逐基金缺口](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run46/current-fund-gaps.csv) | 最新一次运行时目录49行，3个V56当前包和46个未改动V55冻结包逐行标版本、实际回读范围；未把全部49称为本轮重建。 |
| [逐指标逐来源](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run46/current-metric-source-gaps.csv) | 888行公式、单位、窗口及真实缺项，补入恒生来源状态；成分角色不会把完整基准角色标为已满足。 |
| [逐基金基准缺口](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run46/benchmark-source-gaps.csv) | 49行，修正三个份额的旧500/缺采集结论，列已取得成分及待核实际汇率、其他成分、有效链与日历。其他基金没有外推此结果。 |
| [成分逐包事实](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run46/component-price-checkpoints.csv) | 5行，明确实际739/736点、未来排除11/116、基金日历727/0、22/0无收盘数及零计数边界。不是5个独立产品。 |
| [完整配置检查点](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run46/allocation-checkpoints.csv) | 341个份额层检查点引用V55，现金/分母/完整允许集合问题未因加入恒生而消失。 |
| [73包逐值比较](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run46/source-selection-and-metric-deltas.csv) | 5包实际转换及最终源码再核，68包复用V55冻结原件结果；全部原值、单位、日期、来源与V55相等。 |
| [合并汇总](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run46/real-evidence-summary.json) | 当前249、历史108项评分原值保留；343/168项账面观察及现金/运作/配置/合同事实完整相等。合并引用的648个文件路径、541个不同摘要已实际核哈希；目录根合并使路径数改变，旧原件未删除。 |

完整资格按实际必要原值集合重算，未使用audit.trial_ready固定值。本轮另于2026-10-17T17:22:31.808705+08:00重新只读查询运行时目录，共49只、代码集合与V55一致；这是目录回查，不是再次转换49包。[运行时目录回执](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run46/runtime-catalog-readback.json)。HSCI两个原响应及两个收据新增4个不同来源摘要；本轮全部12个HTTP回执均已核原字节，包含2个404死链接，不全部叫可用行情。[本轮实际回执](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run46/http-originals-checked.json)。

## 真实校准、验证与正式边界

完整八维产品、合格完整校准及完整独立验证仍为0。最低30个校准产品仅候选门槛，不代表统计充分；A/C、重叠月份及指数日点不扩充产品数，新11个封存验证产品数值未解封调参。RAW4、候选权重、锚点、等级上限及校准器不变；没有把不完整产品临时补零、重分权或拿V1分数充原值。

V56最终源码已对5个改变包真实回读并执行隔离入口，两个产品、当前三份额与历史两包均未就绪，不生成校准或等级。其余68包保留V55冻结结果并核原值及原件摘要，没有声称全73本轮再次转换或运行入口。新权重合理性、实际重复贡献、类型公平性和等级上限仍未完成完整真实方法验收。

用户没有认可的既定现金目标和容量参考，继续研究候选定义；现金加短政府债下限不当纯现金目标，募集上限或股票成交切片不当全基金策略容量。已取得的原件继续解析和绑定，真实缺口按来源/方法/权限分别保留，不能靠放宽定义凑分数。

2026-10-17T17:20:21.741426+08:00只读复核正式结果49条，等级、分数、批次及真实日期逐条相等，截至日仍2026-09-30，摘要`5aa211fcb953ae46446e0bc84ee4a60292259530b2ee51511177fe22fde3f2b2`。历史批次/结果/当前指针130/584/15仅核数量。[正式只读回执](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run46/final-readback/formal-readback.json)。

本轮没有正式写库、激活、发布、迁移或重启。既有北京时间00:30统一任务不变，先资料后分析、按月评分、每日重大事项检查后按需复核。正式存储、等级上限原因、发布校验、API及必要页面接入仍须以真实完整试算和验收为前提。其他会话工作未重置或覆盖，旧原件、失败响应、批次、真实日期及四份旧文档全文均保留。
