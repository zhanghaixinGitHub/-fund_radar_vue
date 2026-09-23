# 主三周期三分类：本轮实施与验收证据

日期：2026-09-23。本文件配套[实施方案与进度](fund-three-state-prediction-plan-2026-09-23.md)，记录本机运行结果，不代表远端生产或长期预测效果。实施范围为五日、二十日、半年主预测；旧独立一日、二十日实验保留明确的旧版二分类标识。

## 1. 交付结果与模型数量

主预测已分别输出UP、FLAT、DOWN。周期总回报在五日±0.3%、二十日±1%、半年±3%内（含边界）归为持平。持平不是缺资料、失败或信心不足；预测得分未校准，不包装为可靠概率或预期收益率。

本次升级2类方法、覆盖3个周期，登记6份新包：三分类逻辑回归学习法3份、三态近期走势基础法3份。多周期登记24→30，旧一日登记仍3，共33份登记版本；不是33种算法。主路由只引用3份，五日与半年使用新基础法，二十日使用新学习法。其余2份新学习包已训练并参加比较，没有因“新训练”而强制采用。主方案第2.4节列明全部6份ID。

基础法的历史回看窗口阈值独立：五日/二十日看20段总回报±1%，半年看60段±2%；这是走势规则假设，不是把历史收益声称为未来收益。

方向目标：`NEXT_EXECUTABLE_CASH_REINVESTED_THREE_STATE_V2`。方向规则：`RETURN_BAND_V1`。完整方向hash：`82abb3ff890e193486f38a0ac23e54aac3aec2729006acacecee0d9dfff04e6a`。Python和Java的v2资源字节一致。

## 2. 真实数据、训练、发布和采用

证据入口：[脱敏运行快照](three-state-evidence-2026-09-23/runtime.json)、[开发段阈值分布](three-state-evidence-2026-09-23/threshold-analysis.json)。快照只包含公开基金、模型和工程身份，不包含凭据、用户持仓、资金快照。

| 项目 | 本轮真实结果 |
| --- | --- |
| 自动周期 | ac003850-ab01-4b5c-95e9-2d8b747c6407，COMPLETED |
| 研究训练 | 15d05d97-432c-40fd-b569-c7d6de44c232，三个周期均训练成功 |
| 输入范围 | 44只既有范围内基金；训练2023-09-22至2025-09-22，验证截至2026-03-22，选择截至2026-09-22 |
| 五日实际训练三类数量 | UP1536 / FLAT337 / DOWN1164；恢复最大误差5.551115e-17 |
| 二十日实际训练三类数量 | UP1525 / FLAT419 / DOWN982；恢复最大误差1.110223e-16 |
| 半年实际训练三类数量 | UP1468 / FLAT345 / DOWN336；恢复最大误差2.220446e-16 |
| 完整Java策略回放 | 44只计划基金，37只成功、7只失败；失败分母保留 |
| 获选组合 | MODEL_2f72ca2db111163c；ACTIVATE二十日学习包，五日/半年保持基础法 |
| 完整发布 | e2e651c8-c014-4c59-91c3-401d026f6cfc；三周期revision=2 |
| Python本轮协议hash | 5ff2372be7970f6dc1069e5214b6120a3f472017effc1f650db73c2087ade567 |
| Java实际加载引擎hash | 4cb9faceaf7cadb5de8855e756bae0544b651b3aa56421d5b314f24a82211f85 |
| 首批真实生成任务 | 5dba8610-8298-4252-957e-bfe149c3c93b；北京时间17:19:58至17:20:33 |
| 主预测 | 44只计划、132周期项；37只三个周期成功，111条主预测；7只共21项失败 |
| 三类方向 | UP69 / FLAT13 / DOWN29；五日22/7/8，二十日37/0/0，半年10/6/21（顺序UP/FLAT/DOWN） |
| 真实推理回退 | 0次；主结果中74条用当前配置的基础法，不能把基础法配置等同故障回退 |
| 影子预测 | 111条独立角色记录，不纳入主成绩；其中二十日包同时被引用为主/影子，不是新增37只基金 |
| Java建议引用 | 004605报告14ae5479-540e-418e-959c-d2990ebd0bab，HOLDING_ADVICE_V3_THREE_STATE；三周期实际引用同一新发布，保存后HTTP读回一致 |
| 实际采用回执 | ACTUAL_USE 1份；apiReadback=true、adviceReferenced=true；日常调度完成确认，不以提名/路由冒充采用 |

阈值分布表在进入全部特征资格筛选前计算成熟标签，实际拟合还要通过特征和可知时间检查，因此两表数量不同。样本是开发段，阈值是首版产品幅度，未使用独立评价答案寻优，也没有证明对各类基金都最佳。

候选组合必须先通过三类方向评价，再比较共同范围的净收益、费用和回撤。本轮二十日替换组合开发回放净收益约-0.1148%，当前基础组合约-1.8426%；五日和半年候选未通过方向不劣门槛。这是历史实验比较，不能推断未来收益提高。具体完整门槛结果保存在runtime.json的decision和trainingResults中。

7只失败基金为006476、008764、014978、017145、018156、018853、019449，均因`CALENDAR_POLICY_MISSING`。未新增外部日历接入，也未填补或猜测跨境估值日；失败应继续如实保留。

## 3. 改动落点与关键边界

| 层次 | 已完成内容 | 核心位置 |
| --- | --- | --- |
| Python规则 | Decimal闭区间、完整方向快照/hash、旧规则读取、ContextVar冻结上下文 | prediction_direction.py、prediction_contract.py、prediction_policy_v2.json |
| Python训练/推理 | 三类标签、每类至少5、完整系数/类别导出与恢复、三态基础法、兼容目标回退 | prediction_research.py、prediction_models.py、prediction_selection.py |
| Python生成/核验 | 新规则唯一身份、同规则首次原文保留、当前PRIMARY筛选、原阈值到期核验、追加修订 | prediction_generation.py |
| Python冻结/自动选择 | 实时/手动来源冻结、旧周期协议拒绝、完整组合发布、真实采用及分规则效果统计 | prediction_task_inputs.py、auto_model_contract/selection/store/summary.py、prediction_replay_inputs/models.py |
| Java建议 | 严格跨端规则校验，UP+1/FLAT0/DOWN-1，FLAT保留权重，持仓零分HOLD，中性单列 | PredictionDirectionContract.java、DecisionPolicyV2.java、DecisionServiceV2.java |
| Java旧新回放 | 新策略在线/回放共用；旧建议按原动作和原策略比例，当前校验不阻挡旧动作读取 | StrategyResearchService.java、StrategyReplayEngine.java、IssuedAdviceEffectService.java |
| Java引擎 | 新方向契约类及两版资源纳入实际类加载指纹 | AutoModelService.java |
| Vue | 共用三态/旧态/未知文字；新旧预测历史、建议版本、中性因素、分规则效果、管理路由及旧入口说明 | predictionDirection.ts、MultiPredictionPanel/History、DecisionPanelV2、AutomaticEffectsPanel、ModelRoutesPanel等 |

没有逐份改写旧19份学习包，没有新增树/其他算法，没有把旧二分类分数加区间伪装为三分类。初始化脚本继续调用升级后的bootstrap_models，旧模型导入仍显式使用LEGACY目标；脚本无需机械修改。已撤下的独立运行状态卡保持撤下。

## 4. 实际执行的工程检查

Python在既有`.venv`执行，64项通过、1条既有依赖警告。范围同时包含单位测试、故障替身和隔离PostgreSQL schema测试；隔离schema在测试后清理，不清理业务库。

```powershell
# C:/pythonProject/workSpace06
.venv\Scripts\python.exe -X utf8 -B -m pytest tests/test_prediction_three_state.py tests/test_three_state_database.py tests/test_prediction_contract.py tests/test_prediction_models.py tests/test_prediction_database.py tests/test_prediction_time_boundaries.py tests/test_prediction_replay_models.py tests/test_auto_model_selection.py tests/test_auto_model_database.py -q --disable-warnings
```

覆盖：阈值边界/非法值、缺类、全类别恢复和并列结果、旧包拒绝、同规则回退/隔离、strictModel、并发首份保存、同起点规则切换、保存阈值核验、修订去重、成功/失败输入冻结、原规则重试、自动检查点/租约、完整发布与回执、新旧成绩隔离。相关修改文件Ruff检查通过。

Java使用项目内JDK17，21项通过（6＋5＋4＋4＋2），0失败、0错误、0跳过；打包通过。真实Spring数据库测试以事务回滚，外部行情使用测试替身；不声称它们等同真实市场回放。实际市场回放另见第2节。

```powershell
# C:/ideaProject/workSpace12
$env:JAVA_HOME='C:/ideaProject/workSpace12/.tools/jdk17/jdk-17.0.20.1+1'
C:/maven-3.9.11/bin/mvn.cmd -q '-Dtest=DecisionPolicyV2Tests,StrategyReplayEngineTests,StrategyModelComparisonTests,DecisionServiceV2IntegrationTests,MultiPrediction*Tests,AutoModel*Tests' test
C:/maven-3.9.11/bin/mvn.cmd -q -DskipTests package
```

实际找到并运行的类为DecisionPolicyV2Tests、StrategyReplayEngineTests、StrategyModelComparisonTests、DecisionServiceV2IntegrationTests、MultiPredictionClientTests；AutoModel通配符本次没有单独增加测试类。结果从Surefire XML核对，不以日志中预期的负例异常判断测试失败。

Vue最后一次`npm run lint`及`npm run build`成功，build包含`vue-tsc --noEmit`。方向映射8个Node断言通过，包含UP/FLAT/DOWN/NON_UP/未知/空值和范围、版本标签。未搭建无关新测试框架。三仓`git diff --check`通过。

交付源码身份见[三仓变更文件指纹清单](three-state-evidence-2026-09-23/source-manifest.json)，包含Vue12、Python23、Java13个源码/配置/迁移/测试文件，不含本文档及README；baseHead为本轮实施前快照；用户随后授权的提交身份见主方案第14节。文档28步/24项/7阶段数量、表格列数、UTF-8、尾随空白和本地链接已核对。

## 5. 浏览器与真实接口验收

在本机8000/8080/5173实际服务下，使用既有本地验收账号登录；未增加权限或创建账号。该账号原关注为空，临时增加004605、006730、001021、006476四个既有总范围内的基金，验收后仅删除这些临时关注，读回恢复为空。没有改变其他账号关注，也未创建/修改持仓或交易。生成的真实预测和建议保留原文。

| 场景 | 真实观察 | 保存证据 |
| --- | --- | --- |
| 004605主卡 | 五日上涨、二十日上涨、半年下跌，范围与后台reason一致 | [主卡截图](three-state-evidence-2026-09-23/main-004605.jpg)、runtime.json |
| 001021持平 | 五日及半年持平，二十日上涨；真实模型推理结果 | [390px窄屏截图](three-state-evidence-2026-09-23/flat-mobile.jpg) |
| 窄屏 | 390px视口，document.clientWidth=375、scrollWidth=375，无横向溢出；结束后恢复默认视口 | 同上；本轮浏览器测量 |
| 预测历史 | 新三分类阈值与旧二分类原文并列，旧NON_UP明确旧版标注；未到期不计对错 | [历史页面验收摘录](three-state-evidence-2026-09-23/history-ui.txt) |
| 综合建议中性 | 001021五日/半年列在中性因素，二十日上涨及走势仍可支持买入；没有真实下单 | [中性建议页面验收摘录](three-state-evidence-2026-09-23/neutral-advice-ui.txt) |
| 真实效果 | 新旧规则分组；各类0/0明确暂无样本，未到期独立计数 | [效果页面验收摘录](three-state-evidence-2026-09-23/effects-ui.txt) |
| 管理员模型页 | 当前仅3周期新规则路由，旧目标折叠；新周期COMPLETED；包记录数说明包含影子 | [模型页面验收摘录](three-state-evidence-2026-09-23/models-ui.txt) |
| 失败及重试 | 006476三个周期日历缺失；点“仅重试失败周期”后3项仍明确失败，未生成假方向 | [失败重试页面验收摘录](three-state-evidence-2026-09-23/failure-retry-ui.txt) |
| 服务端范围 | 验收账号未关注004605时读取返回403；临时关注后读取成功；Java集成测试校验跨用户访问 | HTTP调用及DecisionServiceV2IntegrationTests |

页面证据包括截图及根据当时可见辅助树整理的验收摘录；文本文件不是完整原始辅助树导出。不向文档复制认证会话或私人资金。旧实验保留可生成入口，但明确“旧版二分类”，其结果不会进入新三态主路由或混合成绩。

## 6. 数据迁移、运行恢复与历史保护

Python本地Alembic实际已升级`20260923_28`，只新增不可变`prediction_task_input`，generation_task_id/research_run_id互斥，保存成功来源或明确失败；旧自动冻结表复用。Java Flyway保持22，无额外结构迁移。

切换前独立保存身份快照，完成后逐条核对：706份旧预测、24份旧多周期模型、607份旧建议原content_hash全部一致；全部当前预测payload重新计算hash一致，30份多周期登记包均经加载校验。旧独立一日模型3份保留。本轮没有清表、回填伪造历史或执行破坏性downgrade。

本地切换期间Java曾以延迟自动调度参数启动验收实例。恢复原启动方式时工具自动审批拒绝重启动作，用户随后在IDEA完成重启。最终8080进程18036不带临时PT24H或simulation.enabled=false参数，实际运行引擎hash与新包一致；正常调度产生ACTUAL_USE回执，原阻塞已解除。PID仅是本次现场记录，不应作为未来固定配置。

Python当前8000服务使用既有`.venv`，Java8080由用户IDEA启动，Vue5173沿用既有开发进程。没有改动用户长期启动脚本，没有停止无关18000服务，没有新增Windows计划任务。临时浏览器标签已关闭。

早期本地命令行训练辅助脚本返回过早，进程退出时触发`can't register atexit after shutdown`，不是三类训练数据不足；通过持久Python服务恢复同一冻结周期后完成三周期训练，没有另造历史输入或放宽样本要求。

回退时优先使用同目标/同规则兼容包或三态基础包。若要回退业务版本，需使用能读取已产生新旧记录的配套代码、规则及完整组合，不能只恢复旧二分类程序或删除迁移28证据表；本轮验证了故障回退与规则隔离，**未对业务库实际执行破坏性降级演练**。

## 7. 尚需时间的真实效果

本轮主目标工程已完成。长期观察不是额外未实现功能，也不能现在伪造结论：首批观察起点为2026-09-24，五日目标2026-10-09，二十日2026-10-30，半年名义2027-03-24（待官方日历确认）。到期后还需净值/分红资料齐备，才能按每条原规则核对对错。

后续利用现有调度及效果页持续记录方向分布、失败、回退、实际采用和三类识别。当前本轮自然成熟答案为0，因此未宣称三分类准确率提高或投资收益改善。工程验收当时尚未提交、推送；后续Git交付见主方案第14节。未部署远端生产。
