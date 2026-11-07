# 基金市场并行评分指挥台账

用户于2026-10-29要求：总指挥统一协调，每只未完整评分基金新建独立对话，并行补件与评分。

沿用原新评分规则和既有执行主线，不改公式、权重、窗口，不借用其他份额、不编造数据。完整分必须八维均有可复算确定值；部分分及真实缺项不称为完整评分。

派发时现场目录59只，完整6只、未完整53只；已为全部未完整基金创建53个独立对话。基线读取时间：2026-10-29T09:28:07.147060+00:00。此数字不是完成后的验收结果。

本台账刷新时间：2026-10-30T07:37:46.894445+00:00。工作者状态：{'NEEDS_COORDINATOR_SOURCE_DECISION': 20, 'PROVEN_GAP': 1, 'PUBLISHED': 2, 'READY_FOR_INTEGRATION': 5, 'FORMALLY_PUBLISHED_PARTIAL_5_OF_8_REMAINING_FACTS_OPEN': 1, 'RESEARCHING': 14, 'FORMAL_7_OF_8_CURRENT_AUTHORIZED_RISK_SOURCE_GAP_COORDINATOR_CONFIRMED': 1, 'EXECUTION_PUBLISHED_LIQUIDITY_INTERVAL_CANDIDATE_READY_POINT_DIMENSIONS_3OF8': 1, 'CONDITIONAL_ARITHMETIC_BROADER_DISCOVERY_RESEARCHING': 1, 'CONDITIONAL_RESEARCH_UNCAPPED_DISCOVERY_AND_ADMISSION_REQUIRED': 1, 'RESEARCHING_REMAINING_DIMENSIONS': 1, 'RESEARCH_CONTINUES_RAW_ADMISSION_AND_POINT_CANDIDATES_AWAIT_COORDINATOR_INTEGRATION': 1, 'FORMAL_7_OF_8_CURRENT_AUTHORIZED_EXECUTION_SOURCE_GAP_COORDINATOR_CONFIRMED': 1, 'NEEDS_REAL_SOURCE_INPUT': 1, 'IN_PROGRESS': 2}。全市场完整评分目标仍未完成。

## 实际评分验收

读回时间（北京时间）：2026-10-30T15:20:19.071780+08:00。当前59只：完整8只，部分51只。
相较派发基线，正式新增58个确定维度，涉及28只。原6只完整分与全部原批次均保留；原有确定维度改变列表：[]。

016008已正式8/8、100%覆盖，完整评分73.58；单一投资者实际集中标签仍未知并保留说明。160119分红估计量纠错以新版本追加，旧版本仍原样可复算；006730新版本按公开精度全61窗唯一判档，旧版本也保留。

评分登记/回滚预演/正式发布/运行服务读回在integration/<代码>/下逐件保留。仅有候选分、材料下载或工作者READY不能替代这里的实际验收。

## 职责与写入边界

- 独立对话并行复用/采集原件、核验来源和身份、离线计算；仅写各基金专属目录。
- 总指挥统一审查公共适配候选、集成验证、不可变归档及评分发布，并实际读回。发布短临界区串行，资料与计算继续并行。
- 共享评分服务仅在已核项目归属、无活动同步且需要加载已验收接线时受控重启；不触发全市场重采、不修改旧评分历史、不提交Git。先核最新发布，避免回退或重复。
- PROVEN_GAP只是本轮有证据的缺项结论；不表示穷尽所有合法来源。仍可自行完成的工作继续分派，不因一个基金卡住其他基金。

## 逐只任务

|代码|基金|派发确定维度|实际读回维度|工作状态|独立对话|
|---|---|---:|---:|---|---|
## 本轮恢复范围

按用户后续指令，本轮仅恢复5只：004605, 007832, 010737, 012836, 018125；其他既有对话未因本轮恢复。
工作者状态是底稿中的研究状态，不等于窗口实时运行状态；正式维度以实际接口回执为准。

|000042|中证财通可持续发展100指数增强A|7/8|7/8|NEEDS_COORDINATOR_SOURCE_DECISION|[查看对话](codex://threads/01a186fd-a778-7ab2-bd92-f88a1eabd3bc)|
|013180|广发国证新能源车电池ETF联接-C|7/8|7/8|PROVEN_GAP|[查看对话](codex://threads/01a186fe-3c5d-70e3-a4d7-ec0c6fba6159)|
|016008|招商中证消费电子主题ETF联接-C|7/8|8/8|PUBLISHED|[查看对话](codex://threads/01a186fe-42df-7eb1-877a-8ef57f2b6a73)|
|005156|嘉实领航资产配置混合（FOF）A|6/8|6/8|NEEDS_COORDINATOR_SOURCE_DECISION|[查看对话](codex://threads/01a186fe-4b63-7200-854d-a3153c66bd73)|
|000003|中海可转债债券A|5/8|5/8|NEEDS_COORDINATOR_SOURCE_DECISION|[查看对话](codex://threads/01a186fe-53c9-7eb1-83c5-06b7865d1ad7)|
|000009|易方达天天理财货币A|5/8|6/8|READY_FOR_INTEGRATION|[查看对话](codex://threads/01a186fe-5c7a-70c3-8eb7-56d8bc3467a1)|
|015596|国泰国证有色金属行业指数-C|4/8|4/8|NEEDS_COORDINATOR_SOURCE_DECISION|[查看对话](codex://threads/01a186fe-68e4-7c00-86aa-f7aa35a72028)|
|160119|南方中证500ETF联接(LOF)-A|4/8|7/8|READY_FOR_INTEGRATION|[查看对话](codex://threads/01a186fe-7da8-7c21-82fc-727f36afd379)|
|001632|天弘中证食品饮料ETF联接-C|3/8|3/8|NEEDS_COORDINATOR_SOURCE_DECISION|[查看对话](codex://threads/01a186fe-f256-71b2-8c32-52f636f7cd25)|
|003321|易方达原油（QDII-LOF-FOF）C人民币|3/8|3/8|NEEDS_COORDINATOR_SOURCE_DECISION|[查看对话](codex://threads/01a186ff-0b50-7762-869a-6d7540f8278c)|
|013472|华宝中证全指农牧渔ETF联接-C|3/8|3/8|NEEDS_COORDINATOR_SOURCE_DECISION|[查看对话](codex://threads/01a186ff-1356-7893-8d9d-c09052fb5751)|
|160323|华夏磐泰混合(LOF)-A|3/8|5/8|FORMALLY_PUBLISHED_PARTIAL_5_OF_8_REMAINING_FACTS_OPEN|[查看对话](codex://threads/01a186ff-1b39-7d10-a76d-96005bf6a77f)|
|000015|华夏纯债债券A|2/8|2/8|NEEDS_COORDINATOR_SOURCE_DECISION|[查看对话](codex://threads/01a186ff-26ce-7172-953f-69499c2c1bd8)|
|000041|华夏全球股票（QDII）人民币|2/8|2/8|RESEARCHING|[查看对话](codex://threads/01a186ff-3e43-7473-bcf7-a9646581d087)|
|000216|华安黄金ETF联接A|2/8|4/8|NEEDS_COORDINATOR_SOURCE_DECISION|[查看对话](codex://threads/01a186ff-570c-79b0-b128-a9738d31409c)|
|001021|华夏亚债中国债券指数-A|2/8|2/8|RESEARCHING|[查看对话](codex://threads/01a186ff-6a30-73a0-be1a-726e27cce8db)|
|004237|中欧新蓝筹灵活配置混合-C|2/8|2/8|RESEARCHING|[查看对话](codex://threads/01a186ff-f019-7542-ba39-8127f98a0de5)|
|004605|富国新活力灵活配置混合-C|2/8|7/8|FORMAL_7_OF_8_CURRENT_AUTHORIZED_RISK_SOURCE_GAP_COORDINATOR_CONFIRMED|[查看对话](codex://threads/01a186ff-fe99-7f13-a755-9841d3300f7a)|
|005187|长安鑫兴灵活配置混合-C|2/8|3/8|EXECUTION_PUBLISHED_LIQUIDITY_INTERVAL_CANDIDATE_READY_POINT_DIMENSIONS_3OF8|[查看对话](codex://threads/01a18700-07f2-7343-a2e5-17043878f19a)|
|005312|万家经济新动能混合-C|2/8|2/8|CONDITIONAL_ARITHMETIC_BROADER_DISCOVERY_RESEARCHING|[查看对话](codex://threads/01a18700-1835-7ad3-9b5f-cb18e2f518a6)|
|006038|大成景恒混合-C|2/8|2/8|RESEARCHING|[查看对话](codex://threads/01a18700-2d10-7b21-a073-554d22683111)|
|006476|南方原油(QDII-LOF-FOF)-C|2/8|2/8|NEEDS_COORDINATOR_SOURCE_DECISION|[查看对话](codex://threads/01a18700-593e-79a2-8416-e5e972809503)|
|006730|万家中证500指数增强-C|2/8|3/8|CONDITIONAL_RESEARCH_UNCAPPED_DISCOVERY_AND_ADMISSION_REQUIRED|[查看对话](codex://threads/01a18700-6a2f-7411-b6ed-62f94b03e29b)|
|007356|汇添富科技创新灵活配置混合-C|2/8|2/8|READY_FOR_INTEGRATION|[查看对话](codex://threads/01a18700-7cf2-7351-8c2e-1ab20cc98105)|
|007509|华商润丰灵活配置混合-C|2/8|2/8|NEEDS_COORDINATOR_SOURCE_DECISION|[查看对话](codex://threads/01a18701-4392-7e13-bbd2-381ff35e94d5)|
|008164|南方标普中国A股大盘红利低波50ETF联接-C|2/8|3/8|NEEDS_COORDINATOR_SOURCE_DECISION|[查看对话](codex://threads/01a18702-548e-7353-9dfa-0ec64bda5868)|
|008764|天弘越南市场股票(QDII)-C|2/8|2/8|RESEARCHING|[查看对话](codex://threads/01a18702-616e-7102-a6fb-e489b56215a9)|
|010710|安信医药健康主题股票-C|2/8|2/8|RESEARCHING|[查看对话](codex://threads/01a18702-b5de-7231-957b-f24d294be664)|
|010737|易方达沪深300指数精选增强-C|2/8|5/8|RESEARCHING|[查看对话](codex://threads/01a18702-dc46-7732-a489-65a13f238603)|
|011066|大成高鑫股票-C|2/8|2/8|NEEDS_COORDINATOR_SOURCE_DECISION|[查看对话](codex://threads/01a18703-6c03-7391-97b2-875e8bf61665)|
|014978|华安纳斯达克100ETF联接(QDII)-C-CNY|2/8|4/8|RESEARCHING_REMAINING_DIMENSIONS|[查看对话](codex://threads/01a18703-79ea-7d40-b65e-9265d4c60ec6)|
|017145|华宝海外新能源汽车股票(QDII)-C|2/8|2/8|NEEDS_COORDINATOR_SOURCE_DECISION|[查看对话](codex://threads/01a18703-954c-7a10-b77e-c84dfe5746d3)|
|017493|东方红新动力灵活配置混合-C|2/8|2/8|RESEARCH_CONTINUES_RAW_ADMISSION_AND_POINT_CANDIDATES_AWAIT_COORDINATOR_INTEGRATION|[查看对话](codex://threads/01a18704-4224-7c62-b77b-bdd531c18667)|
|018125|永赢先进制造智选混合-C|2/8|7/8|FORMAL_7_OF_8_CURRENT_AUTHORIZED_EXECUTION_SOURCE_GAP_COORDINATOR_CONFIRMED|[查看对话](codex://threads/01a18704-5d38-70a3-97b7-03f2b2ba2e8c)|
|018156|创金合信全球医药生物股票(QDII)-C|2/8|2/8|NEEDS_COORDINATOR_SOURCE_DECISION|[查看对话](codex://threads/01a18704-64f9-7271-9013-dc721f11a144)|
|018853|博时标普石油天然气勘探及生产精选行业指数(QDII)-C-CNY|2/8|4/8|NEEDS_REAL_SOURCE_INPUT|[查看对话](codex://threads/01a18704-7171-7560-b521-903f63d8251d)|
|019449|摩根日本精选股票(QDII)-C|2/8|3/8|RESEARCHING|[查看对话](codex://threads/01a18705-9b04-72e2-9d30-bfc7a0a93a8c)|
|160140|南方道琼斯美国精选REIT指数（QDII-LOF）A|2/8|2/8|NEEDS_COORDINATOR_SOURCE_DECISION|[查看对话](codex://threads/01a18706-072a-7e03-98d3-56d0351c640f)|
|002170|东吴移动互联灵活配置混合-C|1/8|2/8|RESEARCHING|[查看对话](codex://threads/01a18706-51a6-76e2-87ea-7f26d9df43d6)|
|005284|华商可转债债券-C|1/8|2/8|NEEDS_COORDINATOR_SOURCE_DECISION|[查看对话](codex://threads/01a18706-75fa-7870-b0fa-01ebb8f91a5a)|
|007045|博道沪深300指数增强-C|1/8|2/8|IN_PROGRESS|[查看对话](codex://threads/01a18706-8013-7d32-87ca-73d492d1937b)|
|007832|博道伍佰智航股票-C|1/8|7/8|RESEARCHING|[查看对话](codex://threads/01a18706-85e2-76e3-a253-b00a14b4d827)|
|007950|招商量化精选股票-C|1/8|4/8|IN_PROGRESS|[查看对话](codex://threads/01a18706-8fe4-7510-a49a-650af94870a7)|
|008603|方正富邦新兴成长混合-C|1/8|2/8|RESEARCHING|[查看对话](codex://threads/01a18706-966d-7560-8e6d-c933c3071531)|
|008960|长信国防军工量化灵活配置混合-C|1/8|2/8|RESEARCHING|[查看对话](codex://threads/01a18707-87fc-7ff3-8bb3-f8ef310fb076)|
|012835|招商景气精选股票-A|1/8|2/8|NEEDS_COORDINATOR_SOURCE_DECISION|[查看对话](codex://threads/01a18707-9578-7322-8cc8-33f006f576ff)|
|012836|招商景气精选股票-C|1/8|2/8|RESEARCHING|[查看对话](codex://threads/01a18707-a529-7c41-b7ee-15136d730da7)|
|013853|大成匠心卓越三年持有期混合-A|1/8|2/8|READY_FOR_INTEGRATION|[查看对话](codex://threads/01a18707-bd39-7cc2-a146-6ffa4ccf87cd)|
|014156|国泰海通中证500指数增强-C|1/8|2/8|RESEARCHING|[查看对话](codex://threads/01a18708-1f50-7d61-86fa-d23b7b23af4e)|
|017960|招商趋势领航混合-A|1/8|3/8|READY_FOR_INTEGRATION|[查看对话](codex://threads/01a18708-3730-7f41-adb6-eebf81d1f8fd)|
|018590|银华体育文化灵活配置混合-C|1/8|8/8|PUBLISHED|[查看对话](codex://threads/01a18708-49a1-77a2-8a2d-8e426b29d807)|
|021740|前海开源黄金ETF联接-C|1/8|2/8|NEEDS_COORDINATOR_SOURCE_DECISION|[查看对话](codex://threads/01a18708-737c-7e50-b42a-12876ea25aac)|
|180101|博时招商蛇口产业园REIT|1/8|1/8|NEEDS_COORDINATOR_SOURCE_DECISION|[查看对话](codex://threads/01a18708-66e4-73e0-9f5e-5cef651ad585)|

## 可复核文件

- 派发名单与对话映射：`C:\pythonProject\workSpace06\.local-runs\parallel-rating-command-20261029\dispatch.json`。
- 逐只候选结果汇总：`C:\pythonProject\workSpace06\.local-runs\parallel-rating-command-20261029\summary.json`。
- 并行约定：`C:\pythonProject\workSpace06\.local-runs\parallel-rating-command-20261029\worker-contract.txt`。
- 每只原件、候选模块、验证和缺项回执：同目录`funds/<基金代码>/result.json`及其指向的文件。

READY_TO_PUBLISH是候选状态，发布成功须另有真实任务回执及API/数据库读回；本指挥台账不得替代评分验收。
