# 002112 现有数据一日预测优化：执行与复核记录

更新时间：2026-10-01 06:13:38（北京时间，最新核对时点）
定时任务：用户已手动停止（PAUSED），不修改或重启；当前仅继续已启动的一次纠偏实验。
协调会话：[读取会话并确认最终效果](codex://threads/01a0f2b6-5ad5-7270-a57d-3057b14cf3a4)
执行会话：[总结训练进展](codex://threads/01a0f28f-e7b7-7770-ad89-b6ab533d4680)

## 先看当前结论

- **定时任务已停止（R016）：**用户明确表示已经手动停止，并要求不要再处理定时任务。只读配置确认PAUSED；协调者没有修改、恢复或新建任务。当前已经启动的一次纠偏实验继续，仍向本文记录实际进展。
- **当前执行：**用户再次明确必须用现有新闻、公告等资料实际训练。已向原执行会话下发纠偏，快照确认会话正在运行。尚无本批新训练完成或提高准确率的核验证据。
- **修订旧收束结论：**R009—R015“没有新合格实验、继续空闲检查”的收束过早。晚抓取、缺当年本地首见记录不足以单独证明未来泄漏；CMS日期是否代表正文修订须结合原接入代码及原文判断。具体风险逐项隔离，不整体排除新闻或持仓，也不放行确有未来版本冲突的数据。
- **纯净值仅作对照：**已核验N8+NE7、RF_D4每20交易会话更新，2025已看开发期130/243（53.50%）；固定NNE129、纯净值基线124、始终上涨128。尚未证明稳定增益或独立未来效果，也没有完成用户必须实际训练比较新闻公告等信息的要求。
- **新批次要求：**先冻结来源准入和候选，实际比较标题内容、可用历史正文、当时已披露持仓及其他合格已有资料，提供非零覆盖和至少10个日期的来源追溯。首批最多6候选/80次实际fit，同一2025开发243日全覆盖；等价或空矩阵不得冒充新资料实验。
- **待核验发现：**执行方报告旧代码把CMS publishDate当作正文版本最晚时间，原接入代码未作此认定；此处仅为执行方自报。旧正文覆盖主要止于2023，2025标题解析必须如实单列，不能叫作正文理解。
- **效果与边界：**旧阶段累计494次真实fit；本次仅确认任务送达且执行中，新fit和分数待核验。不补数据，不倒灌次日新闻或后来持仓，训练内拟合预处理。2025已看开发、2026已看历史且不新增候选评分，没有新盲测结论。旧产物保留，现用系统未采用本次模型。

## 本次目标和边界

用户最新要求是本次工作的依据：只利用002112现在已经拥有的全部信息，由助手自主选择处理方式、特征组合、模型及参数，在严格不偷看未来的条件下，使一日预测准确率尽可能高。

1. 以用户此次明确“只用现有数据、不补数据”时已经存在的本地文件、缓存及数据库资料为边界。可以解析、清洗、关联和提取特征，不新增采集、补正文、补年份或吸收之后新增材料。
2. 现有全部信息进入评估范围；R016用户再次明确新闻、公告、政策、历史披露持仓等可用资料必须进入实际训练比较，不能以纯净值实验代替。方法和最终组合由可靠比较决定。确有泄漏风险的具体资料隔离并说明，不笼统排除整个类别。
3. 每条历史样本只使用预测时点已经公开、可核实版本的信息。禁止未来新闻、后续修订、后来持仓、未来行情净值或目标答案倒灌。
4. 模型选择、特征筛选、文字词表、标准化和参数调整均与最终检验隔离。不能反复查看测试答案调参，也不能删除难预测日期、更改判断口径或减少覆盖率抬高分数。
5. 当前目标按本会话的一日预测要求执行；首次有效比较前必须明确输入截止时点、目标交易日、基准净值和涨跌/持平定义。旧实验中临近收盘判断当天的口径须单独标明，不能直接混报成提前预测下一交易日的成绩。
6. 旧文档只用于解释旧实验记录。旧版“不做新闻训练”“必须补齐资料”“只用固定组合”等阶段限制不作为本次排除现有信息的依据。已冻结旧实验和历史结果保留。
7. 本次协调和本地研究不等于现用模型已切换。研究效果、工程检查、实际运行及现用系统采用分别记录。

## 明天复核时先检查这些结果

| 检查项 | 当前结果或位置 |
| --- | --- |
| 实际使用的固定数据及版本清单 | 旧纯净值对照沿用R006；R016在原冻结边界内重新核查事件、标题、正文和持仓，新阶段输入清单待落盘核验 |
| 预测时点、目标日期与标签定义 | 已核实D日08:00输入→下一交易日U，标签比较NAV(U)与NAV(D)，664行相邻交易日及输入对应关系一致 |
| 已看过答案的开发区间与最终检验区间 | 2025属于已看开发历史；2026属于已看历史评分。本轮及下阶段均禁止用2026调参或给新候选评分；没有新盲测结论 |
| 尝试过哪些特征与方法、为什么调整 | 旧阶段累计494次实际fit；R016已纠正过早排除资料及空闲收束，正在执行真实信息训练任务，新fit尚未核验 |
| 当前可复核次日方案及准确率 | RF_D4__EVERY20为130/243（53.50%），固定NNE129、净值基线124、始终上涨128；目前仅作纯净值对照，不代表目标完成 |
| 相比固定基线多判对多少天 | 比固定三段多1天（+0.41个百分点），比净值基线多6天（+2.47），比始终上涨多2天（+0.82）；差异描述区间均含0，未证实稳定收益 |
| 上涨、下跌、持平表现 | 本批优胜上涨67/128（52.34%）、下跌63/115（54.78%）、持平0；三段65/117、33/66、32/60 |
| 是否有未来信息泄漏 | 已核验模型训练时点及预处理，事件D08覆盖已纠正；历史来源版本/首发、同行选择仍未证明。R008意外看到旧2026汇总已登记，无新评分/拟合，严格总体验收未通过 |
| 无收益、失败和作废候选 | 保留全部旧失败/淘汰；R008两次审查程序异常修复并留证，新增fit0、候选0，审查完成不代表效果改善 |
| 是否已用于现用系统 | 本协调任务未执行现用模型替换 |

## 逐轮执行记录

每次检查追加一条，包含没有变化的检查。历史记录不覆盖；需要纠错时追加修订并指向原记录。已发送指令与已执行完成分开，执行会话自报与协调者核验分开。

| 编号 | 检查时间（北京时间） | 实际动作 | 观察到的结果 | 本轮结论与证据级别 | 下一步 |
| --- | --- | --- | --- | --- | --- |
| R000 | 2026-09-30 22:44:32 | 读取定时任务实际配置和执行会话紧凑快照，建立本文与状态文件 | 任务为ACTIVE、每30分钟；执行会话仍在运行，报告三组对照代码已补上 | 仅确认任务配置及会话报告；没有独立核验训练成绩，不能宣称提升 | 为定时任务加入逐轮文档要求，通知执行方交付可复核的阶段记录，并在下一次检查读取实际产物 |
| R001 | 2026-09-30 22:47:16 | 更新原定时任务，向执行会话发送阶段报告要求，并回读配置与新建文件 | 更新与消息发送工具均成功；任务仍启用且每30分钟，文档路径、每轮记录、不补数据及防泄漏条款均存在；状态和快照游标一致，UTF-8读取无替换字符 | 文档机制已配置并核验；尚未取得执行方新报告或新训练成绩 | 下次按保存游标检查，取得执行方报告及阶段产物后核验并追加结论 |
| R002 | 2026-09-30 23:08—23:13 | 获取会话新快照，读取实际源码、计划及阶段报告；独立复算96模型的开发预测、补值/标准化及来源摘要；发送5项纠偏 | 7,776预测回算一致，44个H缺失日期保留；阶段领先128/243与始终上涨相同；发现预测口径差异、语义年份覆盖及冻结依赖范围问题 | 仅确认开发产物可复算及局部边界；未确认准确率稳定提高，未访问本批2026评分，未宣布最终最佳 | 执行方继续正文处理并落实5项指令；下轮核验报告和时点/覆盖证据 |
| R003 | 2026-09-30 23:38—23:44 | 读取完成报告；独立重建664行次日映射，新增核验204模型/16,992预测和两批完整选模；下发下一阶段指令 | 次日97/180、基线92、始终上涨95；晨间102/180另列；上轮5项纠偏有落盘证据 | 次日历史产物及选择可复核，但收益不稳定、源时间全链路未验完；2026已看结果不得继续当调参答案 | 全信息利用/源时点审查后，进行有界开发期搜索；最多36候选/120拟合，不补数、不再计算2026新候选成绩 |
| R004 | 2026-10-01 00:08—00:19 | 复用游标取得新完成结果；读回来源审查、协议及报告；独立加载103模型核验9,537预测，并发送有界下一阶段 | 15份报告历史同版本未证明；484行移除相关输入。36候选、94次fit，最好124/243，始终上涨128/243，无新2026评分 | 纠正旧97/180的时点验收资格；本批产物可复核，但无准确率收益，未采用。来源全链路仍有限制 | 既有市场广度/量价来源审查合格后最多24候选/80拟合；继续开发期研究，核查上游事件选择偏差 |
| R005 | 2026-10-01 00:38—00:47 | 取一次紧凑快照；读取完成报告与源码，独立重建484行特征、46模型/3,705预测、全部15候选；核对重放差异；查阅冻结政策目录并发送下一阶段 | NNE/RF_D4为129/243，净值124、始终上涨128；事件及报告继续隔离，广度跳过；重放树完全相同，概率仅末位差异 | 开发分数改善但稳定增益未证实；严格来源时点验收仍不完整；无2026新评分、无采用 | 逐来源审查事件准入；固定NNE与三套方法做20/60交易会话更新，最多6候选/80拟合，不补数 |
| R006 | 2026-10-01 01:08—01:18 | 读取完成结果；独立重建更新日历、484行成熟时刻、40模型/1,212概率、1,458映射及6候选评分；发现事件覆盖时点错误并发送修正与有限组合任务 | 每20会话RF为130/243，固定129、始终上涨128；37次新fit。日期级同日事件覆盖误准入，但未进入本批模型 | 净值模型结果及训练边界可复核，无稳定增益；来源覆盖需更正，严格源版本验收未通过，未采用 | 追加D08覆盖更正及剩余来源证据清单；固定4个等权组合，新增fit为0，不执行事件训练或补数据 |
| R007 | 2026-10-01 01:38—01:49 | 读取新完成报告，独立复算4组合/972概率、16配对区间、29,996事件约束及3,388来源日期向量；核对剩余资料入口并发送准入审查任务 | 4组合122/124/124/127，未超过130；日期级同日覆盖错误已修正，事件严格准入未通过；新增fit0、累计494 | 新结果及参考覆盖可复核，无提准、无采用；其他基金历史迁移和静态属性尚未审查完，不宣称穷尽 | 仅审查已冻结同行及静态属性的可用证据，预算0fit；合格才提有限训练方案 |
| R008 | 2026-10-01 02:08—02:19 | 独立重建10,658行/159,870值、核对23PDF/60引句及来源产物；记录旧2026汇总意外曝光，发送目标纠偏与交接要求 | 新增严格准入0、fit0、候选0；仍130/243，未证明稳定改善或采用 | 有界审查可复核，历史证据仍不足；不将事件理解当总目标、不宣称路线穷尽 | 目标更正与13模型交接已核验；无新合格假设，保留状态继续检查 |
| R009 | 2026-10-01 02:39:35 | 复用游标取一次紧凑快照，核对交接说明摘要；未重复读取会话或审查已验结果 | 仅收到R008已验交接的完成回执，会话空闲；交接摘要未变，无新实验或失败报告 | 研究优胜和局限不变；没有新可执行假设，不发重复指令、不追加训练 | 保留状态，继续定时检查并逐轮记录 |
| R010 | 2026-10-01 03:09:17 | 复用游标取一次紧凑快照，更新本文与接续状态 | 游标和执行会话均无变化，仍空闲；没有新结果、失败或待处理请求 | 沿用已核验研究结果及局限；不重复读会话、发指令或训练 | 保留状态，等待下次检查，不补数据 |
| R011 | 2026-10-01 03:39:13 | 复用游标取得一次紧凑快照，更新复核文档和状态 | 与R010相同，会话空闲，无新结果、失败或请求 | 当前研究优胜及未验证限制沿用既有证据；没有新合格假设，未重复训练或发指令 | 保留状态，继续定时检查，不补数据 |
| R012 | 2026-10-01 04:09:20 | 复用游标取得一次紧凑快照，维护本文与状态 | 会话仍空闲，游标无变化，无新结果、失败或请求 | 研究优胜和证据局限不变；无新合格实验，未重复读取会话、发指令或训练 | 保留状态，继续定时检查，不补数据 |
| R013 | 2026-10-01 04:39:18 | 复用游标取得一次紧凑快照，维护本文及接续状态 | 会话空闲、游标未变，没有新结果、失败或请求 | 沿用已核验研究优胜与局限；没有新合格假设，未重复发指令或训练 | 保留成果，继续定时检查，不补数据 |
| R014 | 2026-10-01 05:09:17 | 复用游标取得一次紧凑快照，更新复核文档与状态 | 会话仍空闲、游标未变，无新结果、失败或请求 | 当前研究优胜及证据限制不变；没有新合格假设，未重复发任务或训练 | 保留状态，继续定时检查，不补数据 |
| R015 | 2026-10-01 05:39:21 | 复用游标取得一次紧凑快照，维护本文及接续状态 | 会话空闲、游标未变，没有新结果、失败或请求 | 当前研究优胜与证据局限不变；无新合格假设，未重复发任务、审查或训练 | 保留成果，继续定时检查，不补数据 |
| R016 | 2026-10-01 06:13:38 | 发送实际新闻公告及持仓训练纠偏，确认原会话运行；记录用户停止定时任务 | 新阶段处理中；CMS字段误读为执行方自报。配置PAUSED且未修改，无新成绩核验 | 旧纯净值130/243仅作对照，旧收束结论追加修订 | 继续当前一次纠偏实验，核验真实资料输入与全部结果；不恢复定时任务 |


### R000 证据及范围

- 已读取的定时任务配置：[automation.toml](C:/Users/a/.codex/automations/002112/automation.toml)。配置后续会更新，以实际文件和后续记录为准。
- 会话快照：[check-20260930-224432.json](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/check-20260930-224432.json)。
- 接续状态：[review-state.json](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/review-state.json)，保存检查游标和待核验项。
- 会话报告原意：对照训练代码已补上，将比较仅持仓、加入事件含义、按披露持仓比例关联事件，并使用相同日期评分；政策与公司业务有交集仅说明相关，缺公司证据时不直接标为利好或利空。
- 本轮没有执行新的模型拟合、补采数据或替换现用模型。记录的是当前协调动作，不能推定执行会话期间没有其他动作。

### R002 独立核验结果与调整理由

**本轮实际做了什么：**只读执行方资料；在协调者自己的目录新增复核脚本并运行，没有训练新模型、下载资料或修改执行方冻结文件。已读取执行方两份execution-report.md，并成功发送包含以下5项内容的后续指令。发出指令不代表执行方已经完成修正。

1. **预测口径需要对齐。**计划的预测时点为目标交易日08:00，标签为当天净值相对上一交易日；它不是前一日发出的次日预测。要求保留当前成果和协议，明确标为晨间当日历史研究；后续针对本次下一交易日目标的比较应另行冻结预测日D、截至时刻和下一交易日U，不混报成绩。
2. **语义内容能否被训练真正利用，仍待证明。**已独立统计7,173条正文，年份为2016—2023，最新2023-12-27；当前全信息样本从2024年开始、开发为2025年。要求逐训练折交付非零且随日期变化的语义/持仓加权语义/标题计数覆盖，并利用已有较早年份的独立语义研究说明该分支的效果；不补数据，不将后段稀疏解释成语义无效。
3. **增加简单规则的对照说明。**开发期UP128天、DOWN115天。当前领先128/243仅与始终上涨相同。固定净值线性基线121/243，多对7天只是开发期候选比较；要求最终报告同时列简单规则，不能仅战胜弱模型就声称稳定增益。
4. **报告上下文存在潜在时点混用。**语义构建器的context取15:00已知报告，而morning事件取08:00；全信息方案把context拼入morning输入。协调者核对当前665日，两种时点选中的报告差异为0，因此本轮未证明实际泄漏；要求在语义冻结前分别生成上下文或加入严格等价断言和反例。基础96模型尚未用这一语义块，不能据此误判其已泄漏。
5. **补足代码依赖可回放证据。**base-freeze只包括主搜索脚本、输入、计划及切分，实际还调用标签函数及其他模块常量。要求补充真实依赖和环境的摘要/快照，已经发生的格式调整说明行为等价性，不伪造冻结时间、不覆盖旧协议。

**已核验的数字：**

| 项目 | 结果 |
| --- | --- |
| 全样本日期 | 665，保留44个持仓行情部分缺失日期 |
| 已完成候选与拟合 | 32个基础候选、96个开发模型，账本ID唯一 |
| 开发期 | 2025年243个相同日期，三段117/66/60日 |
| 独立回算 | 7,776条，方向相同，最大概率差2.22×10⁻¹⁶ |
| 补值与标准化 | 独立用训练段计算中位数、均值、方差，与保存预处理器一致 |
| 来源及冻结 | 本批登记来源和基础冻结摘要匹配；各模型/预测文件摘要匹配 |
| 阶段领先 | N＋HGB_D2，128/243（52.67%）；上涨91/128、下跌37/115，无持平日 |
| 固定净值线性基线 | N＋LR_C1，121/243（49.79%） |
| 简单规则 | 始终上涨128/243（52.67%），与阶段领先相同 |
| 最终选择/2026审计 | 检查时selection.json、audit-result.json均不存在；协调者未计算2026分数 |

**证据入口：**

- 协调者复核结果：[review-20260930-2308.json](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/review-20260930-2308.json)。含逐模型回算、摘要和边界检查结果。
- 可复现脚本：[audit_development_r002.py](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/audit_development_r002.py)。使用Python项目的现有虚拟环境执行，只复核开发期，不训练、补数或评分2026。
- 全信息计划：[plan.json](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/all-information-optimization/20260930-v1/plan.json)、[拟合账本](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/all-information-optimization/20260930-v1/fit-ledger.jsonl)、[执行报告](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/all-information-optimization/20260930-v1/execution-report.md)。
- 事件语义：[执行报告](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/holding-impact-experiment/20260930-v2/execution-report.md)、[处理进度](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/holding-impact-experiment/20260930-v2/extraction-progress.json)。进度文件会继续更新，本文4,800条计数对应23:10快照。

**仍未验证：**来源的真实历史发布时间及版本完整链路、大模型历史记忆的影响、全量语义特征覆盖、最终选定方案及后续检验表现。局部检查通过不等于已证明无未来泄漏或真实预测变准。

### R003 已完成批次核验及下一阶段

**上轮5项要求的处理结果：**

1. 新增独立下一交易日批次，保留晨间当日结果。协调者验证664行输入来自前一交易日D的08:00，目标为下一交易日U；训练标签严格在首个评估预测时点前成熟。2024-01-02因缺2023-12-29的冻结输入而对所有候选统一排除，2025/2026的243/180个共同日期没有删减。
2. 逐折语义覆盖已保存并复核：次日各训练折正文18天、加权语义8天，来自2023年底资料窗口延续；2025/2026评估正文及加权语义均0天，旧标题/事件计数仍有变化。不能把ALL_SEMANTICS名称当成该年读到了新闻正文。
3. 已加入始终上涨、训练期多数类等简单规则。次日2026训练期多数类为下跌，85/180；始终上涨95/180；选定方案97/180。当前结果明显偏上涨，不能仅比净值基线高5天就宣布可靠。
4. context在语义特征冻结前改成08:00可得报告。当前数据08与15所选报告差异0日，另有10:00发布报告不能用于08:00的反例证据。
5. 晨间依赖快照是事后补充，报告如实保留这一事实；下一交易日批次8份依赖快照及环境在首次fit前保存，协调者核对当前源码/快照摘要一致。旧冻结和旧96个模型保留。

**两种预测口径分别报告：**

| 口径 | 开发选择 | 2026候选 | 同口径净值基线 | 始终上涨 | 解释 |
| --- | --- | ---: | ---: | ---: | --- |
| D日08:00预测下一交易日U | NHMIF/LR_C1＋NHMIF/HGB_D3＋N/RF_D4等权组合，开发140/243 | 97/180（53.89%） | 92/180（51.11%） | 95/180（52.78%） | 本次主要目标；仅比始终上涨多2天 |
| U日08:00判断当天U | NHMIF_COUNTS/HGB_D2，开发129/243 | 102/180（56.67%） | 91/180（50.56%） | 95/180（52.78%） | 提前量不同，不能当作次日预测成绩 |

N是净值，H是已披露持仓及个股信息，M是大盘，I是行业，F是基金属性；COUNTS是本次派生事件计数。旧G字段的禁用记录不等于本轮事件候选被禁用。新阶段已要求执行方在资料使用清单中明确解释这一区别。

次日方案上涨84/95、下跌13/85；执行方报告的相对净值基线95%分块区间为-8.33至14.44个百分点，包含零，不能证明稳定提升。区间属于已见历史描述，且未补偿此前多轮研究。协调者本轮独立回算判对数及选模过程，没有再次实现这项分块区间。

**协调者实际复核：**

- 本轮新增独立加载次日152模型和晨间52模型，重算12,564＋4,428＝16,992条预测；R002已核96模型/7,776条不重复。两组搜索合计300模型、24,768条预测先后核验通过。
- 从原始净值Decimal重建标签，重算48候选开发排序、最差折同票规则、不同方法族等权组合及选择结果；选择时间先于审计拟合/评分，审计访问账本各只有1次。
- 检查源码、依赖快照、输入、模型、预测和完成文件摘要，训练折中位数/标准化，保存的重复训练预测相同。协调者没有新增fit或启动服务。
- 事件语义17模型及3,081条预测的完整复核是执行方报告，本轮协调者未全部重做；语义事实准确率、大模型历史记忆和源发布时间版本链仍有边界，不能混称全部独立验收。

**下一步已经发出，尚未视为执行完成：**

先完成现有资料类别、已有但未用信息、特征与来源的对应清单及N/H/M/I/F历史可用时点/修订检查。没有影响输入的实质问题后，另行冻结最多36个新候选、最多120次真实监督拟合（含失败和必要复核），检验训练窗口、训练期时间衰减及有依据的特征增减。保持同一D08:00→U口径和开发日期。

本阶段标签读取限制至2025-12-31；禁止读取2026答案/逐日误差来设计方案，也禁止给新候选再次计算2026成绩。参数若需内部选择，只能在训练段内部更早子段完成。2025也属于已看开发历史，因此更好的开发结果只列待验证候选，不能覆盖旧97/180历史结论或宣称未来提升。使用既有语义缓存，不重复外部大模型提取、不补数据，不启动业务服务、不替换现用模型。

**复核入口：**

- [协调者R003结果](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/review-20260930-2338.json)、[只读复核脚本](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/audit_completed_r003.py)、[本轮会话快照](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/check-20260930-233848.json)。
- [下一交易日完整结果](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/next-trading-day-optimization/20260930-v1/result.md)、[逐日预测](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/next-trading-day-optimization/20260930-v1/selected-audit-predictions.jsonl)、[选择记录](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/next-trading-day-optimization/20260930-v1/selection.json)。
- [晨间当日完整结果](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/all-information-optimization/20260930-v1/result.md)、[事件语义完整结果](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/holding-impact-experiment/20260930-v2/result.md)、[三分支交接](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/holding-impact-experiment/20260930-v2/final-handoff.json)。

### R004 报告时点更正、开发期复核与后续安排

**对R003的追加更正：**此前“97/180可复核”指输入、保存模型和评分可回算，源资料时点当时尚未验完。本轮发现15条报告记录的现存CMS时间为2026-05-21，封面送出日及PDF制作时间较早；这些材料不能证明保存的同一版本早年已公开。旧方案含H/F，因此其97/180、开发140/243及旧晨间含报告输入的成绩不能列为通过完整时点审查的结果。保留原模型、原分数和原记录，不把有疑问的成绩重新包装为最佳。

执行方已在新目录隔离H、F、持仓背景、加权语义和3项持仓关联计数，所有484行统一处理，保留共同243个开发日期。保留的8个净值、4个大盘、15个行业、33个非持仓计数及261个未加权事实特征进入比较。“全信息参与评估”不代表必须把有版本疑问的资料加入模型。

**本轮真实结果：**输入时点继续为前一交易日D的08:00，目标为下一交易日U的单位净值相对D上涨、下跌或持平。输入日期2024-01-03至2025-12-31，共484行；三段开发日期为2025-01-02至06-30、07-01至09-30、10-09至12-31，共243日。所有候选243/243覆盖，未按难易删日。

| 比较对象 | 判对天数 | 准确率 | 解释 |
| --- | ---: | ---: | --- |
| 本批36候选中的模型优胜N__WALL__DNONE | 124/243 | 51.03% | 仅净值，全部合格训练历史，无时间衰减，LR_C1 |
| 同口径净值基线 | 124/243 | 51.03% | 与优胜相同，无新增收益 |
| 始终判断上涨 | 128/243 | 52.67% | 比模型优胜多4天 |
| 训练期多数方向 | 115/243 | 47.33% | 类别仅由训练期确定 |
| 隔离H/F后固定三方法等权组合 | 114/243 | 46.91% | NMI/LR_C1、NMI/HGB_D3、N/RF_D4；不是旧含H/F组合的等价复现 |

模型优胜上涨日61/128、下跌日63/115，无持平日；三段为62/117、32/66、30/60，表现并不稳定。2025已经用于多轮开发研究，这些百分比不能作为新盲测或未来准确率，也不能与2026的旧百分比直接比较。

**已执行与独立核验：**

- 执行方完成来源使用清单、时点审查和固定6组×3窗口×2衰减比较。协议于2026-09-30 23:59:02登记，早于首次fit；最多120次，本轮实际94次（含一次真实复拟合），等价结果复用。旧317加本轮94，累计411次。没有因未提准临时扩表。
- 协调者在自己的目录运行只读脚本，独立重算103个不同模型文件、118个运行引用、9,537条预测，最大概率差2.22×10⁻¹⁶。核对全部36候选、同分排序、三折标签成熟边界、窗口、训练权重签名、训练段中位数与标准化；均一致。协调者新增fit为0。
- 核对714个来源文件摘要、16个冻结文件、10份代码依赖快照；核对15条报告时间记录与原件摘要、晚时间约束推导及484行相关输入隔离。来源摘要一致只能证明文件未变，不能证明当时已公开。
- 执行方报告从原件复算546条净值、57,636条个股、980条大盘、3,635条行业记录，N/M/I的484行一致；并报告29项回归检查通过。这些原件数值重建和全部检查本轮未由协调者重做，应与上述独立核验区分。
- 开发标签文件最大日期2025-12-31；代码中的标签入口拒绝越界，训练读取守卫拒绝混合年代净值/旧审计评分。登记及实际运行只有V1/V2/V3，没有新T评分产物。协调者本轮也未读取2026标签或重算成绩。正文事实2024训练早期18行非零，2025开发全部0行。
- 仍未验证：完整历史首次公开和修订链、上游语料筛选是否依赖后来的持仓、每条大模型事实与历史记忆影响。即使程序边界通过，也不能称全链路严格无未来信息。

**00:15:59已向执行会话发送下一阶段指令，尚未视为执行完成：**

优先审查原冻结daily行情中的市场广度及额外量价特征，核对每日股票范围、停牌/退市/新上市、缺失、单位、复权与修订。只能用当日已观测横截面，不能用今天股票名单筛历史。若原件不足以定义可信口径，记录原因并跳过，不补采或用零伪装缺失。现存报告可做同版本交叉查证，无法证明则继续隔离；事件COUNTS/GLOBAL须进一步检查语料筛选和事实提取的上游依赖。

只有形成可解释、时间约束明确的输入后才冻结候选再训练；最多24个新候选、80次真实监督拟合，失败、内部调优和重复都计入。保持本次D08→U及2025共同243日，2026继续禁止访问评分。复用本轮基线，不继续扩无收益的36项参数网格。现有标题文本、财务及同类基金资料等未完成方向另列可执行性清单，不能说已穷尽所有组合。无可用新增假设则如实结束该阶段，不无限追分。

**复核入口和复现：**

- [R004独立结果](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/review-20261001-0008.json)、[只读审查脚本](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/audit_development_r004.py)、[本轮会话快照及已发指令](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/check-20261001-000848.json)。使用C:/pythonProject/workSpace06/.venv/Scripts/python.exe运行该脚本即可复核，不fit、不联网。
- [执行方完整结果](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/development-only-optimization/20260930-v1/result.md)、[过程报告](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/development-only-optimization/20260930-v1/execution-report.md)、[全部资料使用清单](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/development-only-optimization/20260930-v1/information-use.md)。
- [报告版本时间证据](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/development-only-optimization/20260930-v1/report-time-evidence.json)、[逐行时点对应](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/development-only-optimization/20260930-v1/input-time-lineage.jsonl)、[来源摘要](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/development-only-optimization/20260930-v1/source-checks.json)。
- [候选协议](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/development-only-optimization/20260930-v1/protocol.json)、[冻结文件](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/development-only-optimization/20260930-v1/freeze.json)、[拟合账本](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/development-only-optimization/20260930-v1/fit-ledger.jsonl)、[全部候选结果](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/development-only-optimization/20260930-v1/candidate-results.json)、[优胜逐日预测](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/development-only-optimization/20260930-v1/development-predictions/N__WALL__DNONE.jsonl)。模型、其摘要及复用原址均在同目录runs内的complete.json登记，依赖原件在code-snapshot内。

### R005 存量量价结果、重放异常与下一步

**实际完成：**执行会话于00:39完成阶段交接。只解析原冻结清单中的存量原件，新增7项净值特征（1/2/10/40日收益、5/60日波动、20日下行波动）和10项大盘特征（两个指数各5项趋势、波动及相对量额）。固定5组输入×3种方法，共15候选，45次三折拟合加1次重放，共46次；没有扩展上轮24候选/80拟合预算。训练完成、开发分数增加、系统采用三者分别为“是、有限增加但未证实稳定、否”。

预测仍为D日08:00→下一交易日U，比较NAV(U)与NAV(D)。输入目标日期2024-01-03至2025-12-31，共484行；开发仍为2025年243个相同日期、100%覆盖，三段117/66/60天，训练规模239/357/422。最新交易日的量额相对前20日均值，分母排除最新点；净值输入只取当时约束内的61个点，没有用目标日价格或未来复权因子。

| 比较对象 | 判对/日期 | 准确率 | 三段判对 | 结论 |
| --- | ---: | ---: | --- | --- |
| 本批优胜NNE/RF_D4 | 129/243 | 53.09% | 66/117、34/66、29/60 | 原净值8项＋新增7项，未选中大盘新增组 |
| 复用净值基线 | 124/243 | 51.03% | 见原R004同日期结果 | 优胜多5天 |
| 始终上涨 | 128/243 | 52.67% | 62/117、36/66、30/60 | 优胜只多1天 |
| 训练期多数方向 | 115/243 | 47.33% | 55/117、30/66、30/60 | 类别由训练期确定 |

优胜上涨63/128、下跌66/115，无持平日。执行方报告相对净值基线的95%分块描述区间为-4.18至+8.64个百分点，相对始终上涨为-6.69至+7.12个百分点，均包含0。该区间在选模后计算，仅描述已看开发样本、未校正多候选选择；协调者独立复核判对数，没有重复实现这一重采样区间。不能把129/243当成新盲测或未来准确率。

**来源审查及纠偏：**

- 日行情原件506天、每日5,301—5,458行的横截面审查由执行方完成；无法证明未返回代码的停牌/退市/缺失原因和当时完整市场范围，故本阶段未构造全市场广度。协调者核对相关原件摘要，未逐条重做全部股票范围审查。
- 原15份报告没有新增同版本历史公开证据，H/F与依赖继续隔离。不能把晚CMS日期断言为首次发布日期，也不能把封面日期当作保存版本已公开的证明。
- materials明确说明公司公告按披露持仓关联收集，本阶段暂隔离COUNTS/GLOBAL。但协调者另读冻结public的1,475条资料，以及catalogs栏目104/14/46的268/271/759条目录，发现独立官网政策入口也在其中。单条材料库说明不能证明这些来源均依赖未来持仓；已要求按来源核实，不能永久一刀切。官网域名本身也不等于通过时间、版本和完整性审查。

**独立核验及失败保留：**协调者只读重建484行NE/ME特征，最大差8.88×10⁻¹⁶；加载全部46个模型，回算3,705条概率与方向，最大概率差2.22×10⁻¹⁶。核对15候选排名、训练标签成熟与预处理、协议先于fit、真实fit账本、复用基线；1,170个来源摘要、34个冻结文件、12份依赖快照及240个最终产物摘要一致。协调者新增fit为0。

原run在46次模型已保存后因概率列表必须逐字相同而退出；不是训练失败。执行方保留冻结脚本和失败记录，另加只读closeout。协调者核对两次保存模型的200棵树、参数、种子及树数组完全一致，方向一致，概率仅2.22×10⁻¹⁶差异，通过原冻结验证器10⁻¹³绝对容差。没有把事后补充冒充事前协议，也没有把原断言失败改写为成功。32项回归及Ruff通过属于执行方检查记录，本轮没有重复全部测试。

**00:44:27已发指令，尚未视为完成：**

先做上述事件来源级准入表，检查采集入口/栏目/公司名单/关键词是否依赖后来的持仓，以及发布时间、修订、去重、标题或正文、实际年份覆盖与2025的变化；不能因为官网域名直接放行，也不能因为materials有问题就排除所有政策。未有变化的分支不重复训练，本轮不临时扩文本实验。

另登记一个新的有限假设：此前模型主要在三段起点重训，定期纳入当时已经成熟的历史标签可能更适应变化。只用已冻结N+NE 15维，固定LR_C1、HGB_D2、RF_D4，比较每20/60交易会话更新，共最多6候选/80次真实fit。更新日历预先冻结，不能根据涨跌或错误调整；每个预测记录所用模型与最大训练标签成熟时点，预处理仅在当次训练段拟合。保持D08→U与2025共同243日，用既有124、129、128判对结果作同日期对照，最多1次必要重放，所有失败计入。2025仍是已看开发历史，2026继续禁止访问新评分。不补数据、不调用新大模型、不替换现用系统。

**证据与复现入口：**

- [R005协调者结果](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/review-20261001-0038.json)、[只读复核脚本](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/audit_price_r005.py)、[本轮快照与后续指令](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/check-20261001-003849.json)。使用现有C:/pythonProject/workSpace06/.venv/Scripts/python.exe运行审查脚本，不训练、不联网。
- [阶段结果](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/price-volume-development/20261001-v1/result.md)、[执行报告](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/price-volume-development/20261001-v1/execution-report.md)、[交接](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/price-volume-development/20261001-v1/handoff.json)。
- [协议](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/price-volume-development/20261001-v1/protocol.json)、[来源清单](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/price-volume-development/20261001-v1/source-manifest.json)、[逐行特征时间](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/price-volume-development/20261001-v1/feature-lineage.jsonl)、[训练台账](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/price-volume-development/20261001-v1/fit-ledger.jsonl)、[全部候选](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/price-volume-development/20261001-v1/candidate-results.json)、[优胜逐日预测](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/price-volume-development/20261001-v1/development-predictions/NNE__RF_D4.jsonl)。
- [保留的校验失败](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/price-volume-development/20261001-v1/validation-failures.json)、[数值重放补充](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/price-volume-development/20261001-v1/numerical-replay-audit.json)、[事件语料来源审查](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/price-volume-development/20261001-v1/corpus-selection-audit.json)、[最终摘要与模型索引](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/price-volume-development/20261001-v1/final-verification.json)。

### R006 更新频率复核与事件覆盖错误更正要求

**真实训练结果：**执行方完成固定3方法×20/60会话的6候选比较，N8+NE7共15维不变。输入484行，D日08:00预测下一交易日U，2025共同243日全部覆盖。20会话更新13次，60会话更新5次且都是前者的更新点；共享同一训练数据的模型，不重复fit。39个更新模型中首日3个复用R005，新增36个模型加1次重放，实际新增监督fit37次，总计494次。

| 候选 | 正确/243 | 第一段/117 | 第二段/66 | 第三段/60 |
| --- | ---: | ---: | ---: | ---: |
| LR_C1每20会话 | 129 | 62 | 34 | 33 |
| LR_C1每60会话 | 121 | 57 | 32 | 32 |
| HGB_D2每20会话 | 126 | 67 | 31 | 28 |
| HGB_D2每60会话 | 124 | 63 | 32 | 29 |
| RF_D4每20会话 | **130** | 65 | 33 | 32 |
| RF_D4每60会话 | 126 | 61 | 33 | 32 |

本批优胜130/243（53.50%），上涨67/128、下跌63/115，无持平日。比固定三段NNE129多1天、始终上涨128多2天、净值基线124多6天。本轮协调者也独立复算固定5交易会话块、2000次、种子0的描述区间：相对固定NNE为-3.74至+4.64个百分点，相对始终上涨为-6.23至+7.82，相对净值基线为-2.88至+8.23，均含0。这是已看开发期、选模后的描述，没有校正反复开发，不能当成独立显著性或未来提准证据。

**协调者独立核验：**

- 从冻结净值的base/target可用时间重建全部484行标签成熟时刻，与保存值一致。独立生成每个更新点的全部合格历史，核对13个更新点、37笔账本的日期/矩阵/标签签名、事前日历和预算；没有当前或未来标签进入对应训练。
- 加载40模型（含3旧模型和1次新重放），重算1,212条模型概率，核对6候选共1,458条逐日模型映射、训练内中位数和标准化、排序与方向/分段成绩。概率最大差2.22×10⁻¹⁶；唯一重放差1.11×10⁻¹⁶，通过fit前登记的10⁻¹³绝对容差，方向一致。本轮无监督fit失败，协调者新增fit为0。
- 43个冻结文件、16份依赖快照、172个最终产物和3,043个事件来源摘要一致。执行方报告36项检查与Ruff通过，协调者没有重复所有测试或逐页重新解析全部公共网页；来源代码审阅、摘要核对与全页重放应区分。

**来源审查已经说明的事实：**materials依赖披露持仓；historical固定公司清单未排除后来持仓影响；public及104/46/完整14是独立栏目入口，不能套用前两者的限制。执行方逐页回放和来源追溯说明public的1,475条材料来自这些栏目。旧14中断分页与后来单独保存的完整14快照分别保留；public正文主要到2023，当前不能把目录标题当2025有效正文。冻结业务库快照只有12条公司公告研究卡，独立新闻相关表为空；这里没有连接业务库。独立栏目仍缺完整历史同版本与首次公开证据，来源分开不等于训练严格准入通过。

**协调者发现并要求追加修订的错误：**fund_002112_source_admission_v1.py用旧effective_session_main生成来源覆盖，却把表述写成D08。旧字段对日期级事件按同日生效，有精确时刻时沿用15:00边界，因此不能作为08:00准入依据。冻结事件中有2025-01-02的新闻，published_at为空，main生效日为01-02、aux为01-03；它不能在01-02 08:00预测01-03时被假设已知。

只读检索发现新闻来源531条、政策栏目引用24条、媒体栏目引用53条符合“日期级、同日被main准入”的条件，涉及2025目标样本的234个不同预测来源日。分组可重叠，这不代表234天的非零覆盖数都会改变，也不是完整修订覆盖结果。原表中政策232天、媒体225天、完整新闻243天等数字暂不按D08口径验收。当前模型只使用N+NE，事件没有进入本批训练，所以130/243成绩不受这项覆盖表错误影响。

**01:14:41已发指令、尚未视为完成：**

1. 保留冻结源审查及原表，另存D08修订：已知公开/修订取最晚时间，只有日期保守延后，不能机械把旧aux当成08:00。交付逐来源、逐日原→修订差异和反例；时间过滤修正与历史版本未证实分开记录。
2. 不执行执行方建议的7次事件训练。用户未授权放宽“不能偷看未来”；不得把允许历史研究理解为来源严格准入已经通过。补全剩余财务、同类基金、基金属性等实际冻结入口/摘要/日期/是否评估和缺口，区分“尚未查清”和“证据确认不可用”，不补采。
3. 仅复用已核验EVERY20三套方法的概率，先冻结LR+HGB、LR+RF、HGB+RF、三者全部的4个等权组合，再评分。新增监督fit预算0，不扫描权重、改阈值、改更新时间或按单日错误选成员；保留2025共同243日及四组全部结果，2026仍禁止新评分。所有开发结果继续标记为已看历史研究。

这项组合研究后，若没有新的有证据支持且符合冻结边界的可执行假设，保留结果等待后续协调，不为刷分无限扩表。阶段结束不等于已实现用户最终准确率目标，也不等于数学全局最优。

**复核入口：**

- [R006独立结果](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/review-20261001-0108.json)、[只读审查脚本](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/audit_updates_r006.py)、[覆盖错误与反例](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/source-coverage-correction-r006.json)、[快照与后续指令](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/check-20261001-010849.json)。使用现有Python项目虚拟环境执行审查脚本，不fit、不联网。
- [阶段完整结果](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/update-frequency-development/20261001-v1/result.md)、[逐来源表（覆盖时点待修订）](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/update-frequency-development/20261001-v1/source-admission.md)、[执行报告](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/update-frequency-development/20261001-v1/execution-report.md)。
- [事前协议](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/update-frequency-development/20261001-v1/protocol.json)、[更新日历和逐日模型映射](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/update-frequency-development/20261001-v1/update-calendar.json)、[全部候选](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/update-frequency-development/20261001-v1/candidate-results.json)、[优胜逐日预测](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/update-frequency-development/20261001-v1/development-predictions/RF_D4__EVERY20.jsonl)、[实际fit账本](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/update-frequency-development/20261001-v1/fit-ledger.jsonl)。
- [最终产物与源码摘要](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/update-frequency-development/20261001-v1/final-verification.json)、[源码及输入冻结](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/update-frequency-development/20261001-v1/freeze.json)、[来源审查清单](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/update-frequency-development/20261001-v1/event-audit-source-manifest.json)。

### R007 固定组合复核、来源覆盖更正与剩余路线

**本轮实际动作及结论（北京时间01:38—01:49）：**使用R006保存的游标取得一次紧凑快照，执行会话已结束，因此读取这一轮报告、协议、源码和产物。协调者只在自己的目录新增只读复核脚本，没有训练或修改执行方冻结文件。四组合没有提高准确率，原RF每20会话方案仍为当前可复算的开发研究优胜；这不等于已实现严格无泄漏、独立未来验证下的最佳目标。

**真实比较结果：**预测契约继续为D日08:00预测下一交易日U，答案比较NAV(U)与NAV(D)。源输入仍为N8+NE7，484行历史；评分固定2025-01-02至2025-12-31的243个目标日，100%覆盖，UP128、DOWN115、FLAT0。组合仅使用上阶段EVERY20三个固定方法已保存的概率；先冻结四个组合、类别顺序和等权规则，之后计算，未扫描权重、阈值或成员。输入SHA256为1bd32a7053f7d9dee098cc87e5e13baf8f155d1e1098bd65a0a9649f30b141a4。

| 固定组合 | 正确/243 | 准确率 | 三段正确/117、66、60 | 上涨正确/128 | 下跌正确/115 | 相比RF130 |
| --- | ---: | ---: | --- | ---: | ---: | ---: |
| LR＋HGB | 122 | 50.21% | 61、32、29 | 61 | 61 | -8天 |
| LR＋RF | 124 | 51.03% | 63、30、31 | 59 | 65 | -6天 |
| HGB＋RF | 124 | 51.03% | 64、32、28 | 67 | 57 | -6天 |
| LR＋HGB＋RF | 127 | 52.26% | 64、33、30 | 62 | 65 | -3天 |

相同日期对照为净值基线124、固定三段NNE129、RF每20会话130、始终上涨128。四组合全部未胜出，因此停止这一组合分支，不继续加权试分。最好的三者组合与RF单模型27天方向不同，组合独自正确12天、RF独自正确15天；相对RF的5会话分块、2000次、种子0的95%描述区间为-4.64至+1.66个百分点。16组候选对照的分歧、单独正确数及区间均独立复算。数据已经多轮看过，区间没有校正多轮筛选，不能作为稳定或未来提升的证明。

**已完成与证据级别：**

- 协调者独立重算972条组合概率和方向，最大概率差1.11×10⁻¹⁶；逐一检查729条源预测的模型ID、更新点、标签成熟时点和预测时点，组合与模型映射一致。上阶段训练内预处理证据仍由R006审查及未变摘要承接，本轮没有重复fit。
- 本阶段组合台账恰好4条，每条监督fit为0，fit账本为空；协议与输入冻结时间早于组合执行/评分。累计实际fit仍为494，不因概率组合增加次数。
- 24个组合冻结文件、1,247个覆盖来源文件、21个盘点来源、32个本阶段产物、5份源码及上阶段172个产物摘要一致。执行方报告41项检查和Ruff通过；协调者完成上述独立审查，未重复运行全部41项检查。
- 执行方首次覆盖生成因父实验快照定位错误在出结果前失败，改用Frozen真实父目录后成功，原执行记录保留。协调者复核脚本也先因路径参数类型、评分字典包含accuracy字段差异两次中止，修正接口适配后完整通过；这两次属于复核程序问题，没有训练、改分或源数据变动。

**对R006来源覆盖错误的追加更正：**

新规则从原件引用中取得公布和已知修订的最晚约束；只有日期则保守延后至次日00:00，再确定第一个不早于它的交易日08:00。明确时刻晚于08:00继续顺延；不以旧main/aux直接决定准入。协调者直接按原始时间约束与窗口边界计算，重建29,996事件和3,388条来源日期比较，与新产物一致。

| 来源 | 2025向量改变天数 | 非零参考覆盖：原→修订 | 有效正文：原→修订 |
| --- | ---: | ---: | ---: |
| 政策栏目104 | 77 | 232→233 | 0→0 |
| 媒体栏目46 | 131 | 225→226 | 0→0 |
| 完整新闻快照14 | 237 | 243→243 | 0→0 |
| materials基金材料 | 243 | 243→243 | 0→0 |
| 旧中断14、public、historical | 各0 | 各0→0 | 各0→0 |

时间后移也改变窗口退出日，非零覆盖增加不表示补了数据；来源相互重叠，不可相加。2024参考覆盖亦已核对，全部7来源年度汇总一致。R006的531/24/53条来源引用及234个不同来源日是特定错误的检出范围，与这里所有约束下的完整窗口差异口径不同。

**关闭的是覆盖算法错误，未关闭历史版本问题。**全部事件strict_training_admitted仍为false；独立栏目并不等于历史同版本已经证明。没有执行7次事件训练或任何新事件fit。当前130/243模型不含事件，分数不受此次覆盖修订影响。R006原表、旧代码和成绩原样保留。

**剩余资料：核实了存在，尚未证明可以训练。**

- 冻结包含002112及另外10只基金的净值和报告。协调者逐基金核对行数、日期、ann_date缺失和报告数量：多数同行974行，017493为509行，全部截至2024-12-31，本包无2025同行净值。它阻止直接构造2025同期同行信号，但不能据此否定历史训练迁移；份额/分红、成员选择、共同字段和时点/版本仍待审查。
- 6,167条公司/财务事件的ID、公司、类型、日期和旧training_eligible=false已逐条核对。2017—2023的事实引用不能等同2025有效正文或逐字段财务准入。部分引用未在冻结登记表中，本轮只作为清单元数据，不读取其当前字节补充事实。
- F10整体隔离并不能证明静态成立日等事实永久无用；15份报告同版本和8条经理公告有已知时间阻断。静态属性独立早期证据、单基金常量/时间趋势与真实状态变化尚未分开审查。
- 广度证券范围、事件版本链及没有未见最终检验区间的限制继续保留。本轮没有新增材料解决这些限制。

**01:45:57已发指令，尚未视为执行完成：**在新目录预登记并用不超过约25分钟审查上述10只同行及目标基金、15份旧报告、8条经理公告和已冻结直接引用；监督fit预算0。优先核对跨基金训练可比性、标签成熟、历史成员选择、共同N+NE输入和静态属性的早期来源。保持002112既定答案，禁止把后来选择的同行当作早期已知风格，禁止把ann_date等同完整版本证据。合格时提交至多6候选/80次fit的下一阶段提案，实际训练等待下轮协调核验；不合格则明确阻断证据及仍未审查项，不刷历史分数。未新增采集、LLM请求、2026评分或模型采用。

**证据与复现：**

- [R007协调者结果](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/review-20261001-0138.json)、[协调者只读审查脚本](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/audit_combinations_r007.py)、[本轮快照与完整后续指令](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/check-20261001-013850.json)。以C:/pythonProject/workSpace06/.venv/Scripts/python.exe运行审查脚本，仅回算并写协调目录。
- [阶段结果](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/event-time-combination-review/20261001-v1/result.md)、[执行报告](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/event-time-combination-review/20261001-v1/execution-report.md)、[交接](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/event-time-combination-review/20261001-v1/handoff.json)、[源码和最终产物摘要](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/event-time-combination-review/20261001-v1/final-verification.json)。
- [组合事前协议](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/event-time-combination-review/20261001-v1/combination-protocol.json)、[源概率与代码冻结](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/event-time-combination-review/20261001-v1/combination-freeze.json)、[零fit账本](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/event-time-combination-review/20261001-v1/fit-ledger.jsonl)、[4条组合执行账本](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/event-time-combination-review/20261001-v1/combination-ledger.jsonl)、[全部组合评分](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/event-time-combination-review/20261001-v1/combination-results.json)、[三者组合逐日预测](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/event-time-combination-review/20261001-v1/combination-predictions/LR_HGB_RF.jsonl)。其余逐日预测路径以同目录各组合ID命名。
- [覆盖追加更正](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/event-time-combination-review/20261001-v1/coverage-correction.md)、[源清单](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/event-time-combination-review/20261001-v1/coverage-source-manifest.json)、[逐事件时间约束](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/event-time-combination-review/20261001-v1/event-time-boundaries.jsonl)、[逐来源日期差异](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/event-time-combination-review/20261001-v1/source-daily-differences.jsonl)。
- [剩余资料说明](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/event-time-combination-review/20261001-v1/remaining-information.md)、[冻结入口清单](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/event-time-combination-review/20261001-v1/remaining-information-inventory.json)、[财务事实引用清单](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/event-time-combination-review/20261001-v1/financial-frozen-entries.jsonl)、[保留的验证记录](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/event-time-combination-review/20261001-v1/validation-record.json)。

### R008 剩余资料准入复核与阶段收束

**实际动作（北京时间02:08—02:19）：**按R007游标取得一次快照；执行会话已完成，随后读取本轮报告、协议、源清单及代码。协调者在自己的目录新增并执行只读复核脚本，没有训练、新候选评分或修改执行方冻结文件。

**当前结论：**本次指定范围审查完成，没有新增符合严格边界的训练路线。当前最好仍为N+NE 15项净值特征、RF_D4每20交易会话更新，D日08:00预测下一交易日U，比较NAV(U)与NAV(D)。2025共同243日判对130天（53.50%），对照净值124、固定三段129、始终上涨128。上涨67/128、下跌63/115、持平0，分期65/117、33/66、32/60，覆盖243/243。这是此前已核验且产物未变的开发成绩，本轮没有重新选模；累计fit仍494，新增fit0、候选0、现用系统采用0。

**同行资料的存在与准入分别核实：**

| 本轮核实项 | 实际结果 |
| --- | --- |
| 指定冻结范围 | 002112及10只同行，11,510行单位净值；包内288条报告元数据，目标53、同行235 |
| 按元数据可构建N+NE | 同行8,500行，含目标10,658行，共159,870个特征值；目标日截至2024-12-31 |
| 不能构建的行 | 64行非交易日、777行不满足61个连续交易日窗口、11行缺下一会话净值；没有缺失填零 |
| 首个2025预测时点前成熟的同行行数 | 按ann_date推算8,480行，只是元数据推算，不能写成严格准入 |
| 新增严格准入 | 0行；净值历史版本/首发、成员选择时刻及份额分红可比性未闭合 |
| 本包没有2025同行净值 | 阻止2025同期同行信号，不足以否定2025之前历史用于训练迁移的可能性 |

逐行使用D08前按元数据已知、最多滞后20会话的61日窗口；标签成熟取NAV(D)、NAV(U)可得时间的最晚值。协调者独立重建窗口、值、成熟时间及排除原因，最大特征差7.63×10⁻¹⁷，低于10⁻¹³容差。没有生成同行方向分数或按未来表现筛选基金。ann_date和source_hash不等于完整原始接收与修订链，共同组别也不是当时同一风格或持仓的证明。各基金用自己的单位净值，未用主代码/A类替代，002112答案未改为复权或总回报。

**属性原文：**15份报告均有合同生效日2015-06-19和C类代码002112；12份有增加C类的2015-11-16表述，另3份是投资者自2015-11-18持有C类，不能从后者断言申购开始日。开发期成立天数3483—3847是日期减常量，不是新增市场信息，未做单独效果试验。C类净资产与经理确有状态变化，但历史版本证据仍不足；11组经理存储记录不等于11名经理。

8份经理公告均有基金名，6份命中目标/主代码，另2份不能称完成精确代码核验；已有可得时间均晚于2025。保存正文中的早年日期不证明该版本当时已公开，也不能反过来断言首次公开在2026。范围外早期合同、逐条原始接收/分红记录和未绑定财务引用仍属未审查，不能说不存在。

**独立核验与执行方自报的区别：**

- 协调者核验37来源、29读取记录、29阶段产物/2源码摘要，协议冻结早于分析读取；上阶段32产物/5源码保持一致。独立回算10,658行/159,870值，并核对288报告元数据。
- 逐页读回15份指定报告中的60条引句，另核对8份经理PDF文字，共23份。这里证明冻结内容和计算一致，不证明历史首次公开或版本链。
- 执行方两次审查异常是未知日期排序、JSON键类型比较；保留未知值、前版代码及部分结果后修复。验证器首次4处行长问题作格式修正并保留前版。两份脚本Ruff通过属于执行方检查记录，不能称为训练或线上验证。

**范围偏差保留：**执行方维护旧汇总、定位插入位置时读取前65行，意外展示了已有2026汇总成绩。scope-deviation.json记录未读逐日答案、未新增评分/拟合或据此选候选。协调者查到本阶段源清单和空fit账本，不能将“分析器未读答案”扩大成整个对话未见旧汇总。2026从R003起已属已看历史，本轮继续登记，不恢复盲测资格；130/243是未变的2025开发成绩。

**目标纠偏：**执行方结尾将“可靠理解事件对基金持仓的实际影响”称为目标，这是旧任务的表述。用户最新总目标是用现有全部信息尽可能提高下一交易日预测准确率；事件语义、持仓关联、量价和模型组合都是候选方法，解释真实价格因果不是额外的总体验收门槛。这里明确追加更正，避免被旧文档带偏。

**02:12:34已发指令，尚未视为完成：**执行方仅另建coordination-addendum.md，保留封存文件，追加总目标更正、当前最佳的冻结输入/13次更新模型/预测入口，以及各路线状态。后续避免读取包含2026旧成绩的汇总片段。本轮不扩大资料范围或训练；无新合格假设则保留状态，继续定时检查，不宣称严格目标完成、绝对最优或所有本地路线穷尽。这是文档纠偏和交接，不是新实验，也无需用户再批准。

**02:17:40追加核验已完成：**coordination-addendum.md已落盘，明确承认旧目标表述不准确并按最新要求更正；独立核对其摘要、30份原文件、58份引用及13次更新模型的应用日数/截止时刻/训练行数，覆盖243日。没有覆盖旧结果或追加fit。当前最佳包含RF200棵树、深度4、叶子最少10样本的既定配置；首个模型复用旧阶段，其余12个为后续更新，U240重放不算第14个业务更新。后续只保留定时检查，无新合理且合格假设时不反复发指令。

[目标更正及最佳方案完整交接](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/remaining-admission-review/20261001-v1/coordination-addendum.md)、[独立摘要和13模型索引](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/remaining-admission-review/20261001-v1/coordination-addendum-manifest.json)、[协调者追加核验](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/review-addendum-r008.json)。

| 路线 | 当前结论与决定 |
| --- | --- |
| 已登记净值/量价、窗口、衰减、更新频率 | 已完成，研究优胜130/243；无稳定提升证明，保留模型，不无限扫描 |
| 四个固定概率组合 | 全部低于130，淘汰，不扩大权重或成员 |
| 事件语义、历史持仓与报告状态 | 时间/版本或选择证据不足，2025有效正文为0；不倒灌、不补采 |
| 同行迁移、静态属性 | 本次指定包内审查完成，未获新增严格准入，没有训练提案 |
| 全市场广度、财务字段 | 完整历史证券范围、字段事实与版本仍有缺口；未绑定引用不读当前字节补事实 |
| 真正未见的最终检验 | 未确认有可用区间，不能靠改名恢复盲测 |

有限审查完成不等于所有方法已被证明穷尽。当前没有合格的下一项训练假设，保持现状等待后续检查。

**证据及复现：**

- [协调者R008结果](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/review-20261001-0208.json)、[只读复核脚本](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/audit_admission_r008.py)、[快照与完整后续指令](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/check-20261001-020850.json)。用C:/pythonProject/workSpace06/.venv/Scripts/python.exe运行复核脚本，不训练。
- [阶段结果](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/remaining-admission-review/20261001-v1/result.md)、[执行报告](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/remaining-admission-review/20261001-v1/execution-report.md)、[协议](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/remaining-admission-review/20261001-v1/protocol.json)、[来源冻结](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/remaining-admission-review/20261001-v1/source-freeze.json)、[读取台账](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/remaining-admission-review/20261001-v1/actual-read-ledger.json)、[源码及最终摘要](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/remaining-admission-review/20261001-v1/final-verification.json)。
- [同行说明](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/remaining-admission-review/20261001-v1/peer-admission.md)、[逐行特征证据](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/remaining-admission-review/20261001-v1/peer-metadata-feature-audit.jsonl)、[报告元数据](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/remaining-admission-review/20261001-v1/embedded-report-version-audit.jsonl)、[属性说明](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/remaining-admission-review/20261001-v1/attribute-admission.md)、[原文引句](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/remaining-admission-review/20261001-v1/static-original-evidence.json)、[经理公告](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/remaining-admission-review/20261001-v1/manager-notice-admission.json)。
- [意外曝光记录](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/remaining-admission-review/20261001-v1/scope-deviation.json)、[原文字段更正](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/remaining-admission-review/20261001-v1/interpretation-corrections.json)、[首次失败](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/remaining-admission-review/20261001-v1/validation-failures.json)、[第二次失败](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/remaining-admission-review/20261001-v1/validation-failures-02.json)、[空fit账本](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/remaining-admission-review/20261001-v1/fit-ledger.jsonl)。

### R009 无新研究结果检查

检查时间：2026-10-01 02:39:35（北京时间）。沿用R008游标取得一次快照，执行会话空闲，本次新回执仅确认coordination-addendum.md完成。该说明及13模型交接已在R008核验；本轮只核对其SHA256仍为55b491b76873ece1753b01558c70401f39a0a1fadd0d2a63ed70907ce41249c2，没有重复read_thread、重新训练或重复发送任务。

当前研究优胜仍为130/243（53.50%），对照和日期覆盖沿用R008，未重新评分；历史来源版本证据及独立未见验证仍未通过，未采用。累计494次拟合为此前核验值，本轮协调者新增fit0，执行会话没有报告新实验。当前没有新的合格假设，继续等待定时检查，不补数据、不宣称总体目标完成。

证据：[本轮紧凑快照与检查记录](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/check-20261001-023850.json)、[已核验交接摘要](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/review-addendum-r008.json)。

### R010 无变化检查

2026-10-01 03:09:17（北京时间）：复用游标取得一次紧凑快照，changed=false，执行会话仍空闲，没有新结果、失败或需要处理的请求。本轮未调用read_thread、未发送重复指令、未重跑审查或训练；只追加检查记录并保存相同游标。

当前最佳仍沿用已核验开发研究130/243（53.50%），累计494次fit为此前记录；本轮没有重新评分。来源历史版本/首发与独立未见验证的限制不变，未采用现用模型；当前无新的合格实验假设，保留状态等待，不补数据，不宣称总体优化完成。

证据：[本轮快照与检查记录](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/check-20261001-030851.json)。

### R011 无变化检查

2026-10-01 03:39:13（北京时间）：快照changed=false，执行会话仍空闲。没有新结果、失败或待处理请求，未再次读取会话、重跑审查、发送任务或拟合。130/243研究成绩、累计494次fit及历史版本/未见验证限制均沿用旧核验，本轮未重新评分或采用模型。保持现状继续检查，不补数据，也不宣布总体优化完成。[本轮快照与动作记录](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/check-20261001-033851.json)。

### R012 无变化检查

2026-10-01 04:09:20（北京时间）：紧凑快照changed=false，执行会话空闲，没有新结果、失败或待处理请求。本轮只写检查记录和接续状态，未read_thread、未重复审查、未发任务、未训练或采用模型。研究130/243、累计494次fit及来源版本/未见验证限制均沿用既有核验，本轮未重新评分。当前无新合格假设，保持定时检查，不补数据，不宣布总体目标完成。[本轮快照与动作记录](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/check-20261001-040852.json)。

### R013 无变化检查

2026-10-01 04:39:18（北京时间）：快照changed=false，执行会话仍空闲。没有新结果、失败或待处理请求，本轮只更新复核记录和状态；未read_thread、未重复审查或发任务、未训练、未采用模型。130/243研究成绩、累计494次fit及历史版本/独立未见验证限制沿用此前证据，本轮未重新评分。保持定时检查，不补数据，不宣称总体目标完成。[本轮快照与动作记录](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/check-20261001-043852.json)。

### R014 无变化检查

2026-10-01 05:09:17（北京时间）：紧凑快照changed=false，执行会话空闲，没有新结果、失败或待处理请求。只更新本文和接续状态，未read_thread、未重跑审查、未发任务或训练。130/243研究成绩、累计494次fit及历史来源版本/独立未见验证的限制沿用此前核验，本轮未评分、未采用模型。无新合格假设，继续检查，不补数据，不宣称总体优化完成。[本轮快照与动作记录](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/check-20261001-050853.json)。

### R015 无变化检查

2026-10-01 05:39:21（北京时间）：快照changed=false，执行会话仍空闲，无新结果、失败或待处理请求。只更新复核记录与状态，未read_thread、未重复审查、未发任务或拟合。130/243研究成绩、累计494次fit及历史版本/独立未见验证的限制沿用此前核验，本轮未评分或采用模型。当前无新合格假设，继续检查，不补数据，不宣称总体目标完成。[本轮快照与动作记录](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/check-20261001-053853.json)。

### R016 用户纠偏及停止定时任务

核对时间：2026-10-01 06:13:38（北京时间）。本次由用户直接纠偏触发，不是新的定时调起。

- **已发指令：**向原执行会话发送一次有界纠偏，先复核CMS/原文日期/历史披露证据，再用已有标题、可用正文及当时已披露持仓进入实际训练比较。最多6候选/80次实际fit；同一2025开发243日全覆盖；不得新增资料、访问新2026成绩或替换现用模型。执行方在自己的新实验目录维护协议、来源清单、全部候选、失败、fit台账、逐日预测和execution-report.md。
- **已执行到哪里：**会话新轮次01a0f45d-8d1b-7ef2-b518-a5a4bacb709b于06:09:26开始，快照确认active/inProgress。执行方报告旧研究代码误把CMS publishDate作为正文版本最晚时间，原接入代码未这样定义；此发现尚未独立核验，不能提前宣布所有报告或事件均可用。
- **对旧结论的追加修订：**把资料准入不确定整体变成排除，并在纯净值结果后持续空闲，没有完成用户要求。缺当年首见留痕、晚抓取或CMS晚日期本身不能替代具体未来信息证据，也不能直接默认旧正文完全无修订。按事实复核和保守延后；旧97/180等成绩不自动恢复合格资格。R000—R015保留，不改写历史。
- **实际结果边界：**本批尚无新训练成绩或改善结论。旧130/243仅作纯净值对照；2025标题解析诚实单列，不能以次数、全零列或历史正文名义代替实际内容使用。训练完成、准确率改善、系统采用分别验收。
- **停止定时任务：**用户明确说“不要再弄定时任务了，我刚已经手动把定时任务停止了”。只读配置确认002112为PAUSED，updated_at=1790805785184。协调者未调用更新工具改动配置，不恢复、不新建，接续状态移除“每30分钟继续检查”的行动项。已经启动的这一次纠偏实验继续。
- **下一步：**等待本次执行的真实阶段产物，再做独立核验。协调者不重复启动训练、不改正在使用的冻结文件；没有证据的数字不填。

证据：[完整指令、发送回执、运行快照与停止记录](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/correction-20261001-061338.json)、[接续状态](C:/WebStormProject/workSpace05/.local-runs/coordination/002112-existing-data-optimization/review-state.json)。

## 后续每轮必须补充的内容

有实际进展时，在对应记录下写清以下信息；没有进展时，写检查时间、仍在进行的阶段和未启动重复工作即可。

- **做了什么：**真实动作、修改文件、实验编号、输入版本、运行或拟合次数，区分计划、发出指令、已经执行。
- **为什么这样做：**上一轮发现的问题或可验证假设，为什么选择继续、调整或淘汰某条路线。
- **实际结果：**基线和候选使用的日期范围、样本数、预测覆盖率、判对天数、准确率及差异；方向和分期表现有结果后补充。
- **防泄漏核验：**时间边界、资料版本、持仓披露、训练内预处理、模型选择及最终检验隔离的证据；未通过项单独列出。
- **证据位置：**源码/差异、冻结配置、数据清单、训练日志、逐日预测、评分结果、模型文件和必要复现命令。不要写入密钥、密码或完整敏感请求。
- **结论及下一步：**已证实的事实、仍未验证的推断、失败或作废原因、当前最佳以及下一步动作。
- **事实修订：**后续发现原成绩或核验有误，追加纠错，保留原记录并明确新的有效结论。

每轮结束前更新顶部“当前结论”和复核表。即使聊天保持安静，文档仍须记录实际检查。跨到10月1日继续维护本文件，方便用户通过同一个入口检查完整过程。
