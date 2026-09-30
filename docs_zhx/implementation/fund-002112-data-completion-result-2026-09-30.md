# 002112 数据补齐结果与验收记录（2026-09-30）

实际执行：北京时间 10:48—15:06。沿用原实施方案和冻结清单；本文记录结果，不是新计划。最终逐项验收时间为 2026-09-30T15:02:57.669878+08:00。

**46 份缺原件及 55 份当前公告核验已完成；整体数据仍未全部补齐，M02 不勾选完成。** 历史版本、部分公共材料、事实比较口径和历史行业关联仍有具体未完成项。数据取得、身份、版本时间、字段语义及历史准入分开记录；所有资料均未自动进入训练。

[最终验收](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/data-completion/20260930-v1/acceptance-final-v3.json)；[机器可读结果索引](C:/WebStormProject/workSpace05/docs_zhx/implementation/fund-002112-data-completion-result-2026-09-30.json)；[6167 份历史逐项记录](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/data-completion/20260930-v1/historical-acceptance-final-v3.json)；[1475 条公共材料逐项记录](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/data-completion/20260930-v1/public-acceptance-final-v3.json)。

## 已完成的补齐及实际验收

| 范围 | 最终结果与实际时间 | 验证及边界 |
| --- | --- | --- |
| 46 份历史缺原件 | 46/46；原件取得 10:55，身份与目录时间绑定 12:29 | 新请求 45 次，缓存复用 1 份。完整字节、公告编号、代码、附件路径、目录原回执和时间对应；467 页扫描及 427 页乱码完成识别。不是仅凭下载成功验收。 |
| 4 份版本时间证据 | 2 份官方当时替代版本取得，2 份未闭合；11:52 | 金力永磁全文/摘要找到港交所 2023-08-24 原件，全文与发行人官网副本 SHA 一致；内容差异、旧巨潮 9 月元数据冲突都保留，作为独立版本，保守可用日为 8/25。亿纬锂能两份原版本证据仍不足。 |
| 55 份当前公告 | 55/55；11:25，最终回读 15:02 | 身份、公开时点、完整原件及文书性质通过。草案、模拟审计、备考、译文与 ESG 保留性质；备考不等于收购完成。55 份全部排除历史训练，未宣称逐页财务金额全通过。 |
| 历史身份 | 6164/6167；最终回读 15:02 | 全部冻结文书保留；3 份目录/正文性质或年份冲突未消除，见下方具体编号。 |
| 定期报告财务行 | 4358 份复核，3363 份形成 3383 行；14:25 | 3335 份/3355 行通过原 PDF 字符坐标，另 28/28 份通过原单元格复核。金额、单位、期间、比较列、调整前后列及同比算术分列；原 0.015 个百分点核对阈值未放宽。 |
| 预告及快报 | 原 609 份全部保留；15:01 完成最后上下文回放 | 421 份 497 条表格记录：496 条机器坐标回放，1 条原图人工核对；497 条期间均核对。完整行名回放更正 17 条扣非口径，修正前预告列与快报分开。578 份另有 1132 条文字事实，含 259 条引用角色未闭合。最后 6 份逐份补核：3 份归母利润原表，2 份华夏基金子公司业绩，1 份收入预告。不能将后三份当上市母公司利润。 |
| 回购事项 | 1095 份复核；14:02 | 553 份存在实际执行文字事实，149 份具备明确股数、金额、币种和截至日，34 份明确尚未实施；完整事项更正/重复链仍未全闭合。股权激励注销、计划金额、客户回购义务分别保留。 |
| 重大合同 | 41/41 份阶段及范围原文核对；13:25 | 区分签署、中标、附条件生效、履约、延期、终止和退款逾期；估价、可选数量、联合体份额及豁免披露不猜值，合同金额不当收入。 |
| 政策及公共消息 | 1475 条全部复核，1203 条标题/正文/显示刊发日通过；14:32 | 193 份政策/通知、32 份解读、10 份征求意见等分别归类；110 份明确本件文号、39 条明确生效/修订/废止表述、77 条精确文号引用。视频简介不当全文，显示日期不等于历史首次留存证明。 |
| 政策附件及图片 | 134 份附件按真实格式解析，9 个压缩包的 48 个成员另作 CRC/摘要核验 | 包含 1710 页 DRG 附件的定向解析，原页数停止原因保留；空白/短页记录不删除。1116 个图片及 342 个明确正文媒体请求均留回执。1 个必要正文图片仍无法取得；装饰图不冒充正文缺件。解析成功不表示附件中所有数值或法律效力已通过。 |
| 独立行业行情 | 13 条指数有效期内缺日、重复、非交易日均为 0；11:52 | 8 条各 1945 日，4 条于 2016-06-03 停发、各 103 日，1 条于 2019-01-25 停发、749 日。98 次新增逐年读取，6 份旧缓存复用；停发后不延长、不补零。 |
| 历史持仓和行业关联 | 1422 窗口均绑定当时披露持仓；行业完整窗口 1370/1422；13:26 | 23541 条公司公告关联，1737 个独立公告；24 期监管分类及发行文件按当时截止绑定。8 条全期指数生成 1422 行无标签输入，算术与截止通过；供应商历史修订及方法版本未证明，不能直接宣布严格历史准入。 |

财务及预告证据：[财务提取](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/data-completion/20260930-v1/financial-table-result-v5.json)、[原坐标](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/data-completion/20260930-v1/financial-layout-result-v5.json)、[原表格](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/data-completion/20260930-v1/financial-grid-result-v5.json)、[预告完整行名及期间](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/data-completion/20260930-v1/forecast-context-result-v6.json)、[最后六份原文核验](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/data-completion/20260930-v1/forecast-manual-completion-result.json)。合同和回购：[合同阶段](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/data-completion/20260930-v1/contract-scope-review-result.json)、[回购字段](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/data-completion/20260930-v1/buyback-execution-result.json)。政策及行业：[公共材料核验](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/data-completion/20260930-v1/public-audit-result-v10.json)、[政策语义](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/data-completion/20260930-v1/public-semantic-closure-result-v4.json)、[行业覆盖](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/data-completion/20260930-v1/industry/coverage-validated-v2.json)、[历史行业关联](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/data-completion/20260930-v1/historical-industry-relations-result-final.json)。

## 未完成项及具体证据

这些项继续保留为未完成，不补零、不删样本、不降低准入标准，也不笼统称为“公开数据不存在”。

- **2 份旧版本证明**：亿纬锂能 `1218857751`、`1218857919`，当前官方 PDF 元数据为 2024-01-10，与旧目录时间冲突。早期第三方副本与当前官方内容有差异，但不足以证明当时官方版本。金力永磁两份已有替代版本，原文件冲突仍保留。详见 [四份版本逐项记录](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/data-completion/20260930-v1/version-evidence-final.json)。
- **3 份身份/性质冲突**：常熟汽饰 `1216439874` 目录确认意见对应正文独董述职；桐昆 `1216517762` 目录 2021 摘要对应正文 2022；创源 `1217757139` 原目录回购注销与正文限制性股票注销性质不一致，原文另提 2020 回购，不能强行同义合并。
- **995 份未形成合格归母利润行**：其中 876 份当前分类为财务报告、78 份译文、24 份偿付能力报告、15 份确认材料及其他附件。单位、表头列数、调整列和算术核对仍有具体缺口；部分文书本来不披露此指标。这包括本地解析未闭合，不能把它们一概称为原件无法取得。另有 1977 份已提取报告的表内币种未明确，不据“元”自动补人民币。逐份原件、失败页及原因见 [财务未完成明细](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/data-completion/20260930-v1/financial-unresolved-detail.json)。
- **预告、回购及比较语义**：本轮已核对的文字、数值格和期间不等于完整事件链。预告比较值的前次披露、更正角色及币种仍有未闭合；回购的唯一事项、重复/更正链未全闭合。合同未披露的付款、实际收入和各方份额保留未知。旧失败及新版证据并存，最终消费入口以结果索引指定版本为准。
- **272 条公共材料未闭合**：原因可重叠：104 条视频没有完整文字稿、122 条标题未精确绑定、128 条刊发日未证、196 条正文容器/转写未证、68 条正文不可取得、10 条只有更新时间、17 条正文后来编辑、1 条必要正文图缺失。包含站点拒绝访问/DNS 错误及浏览器安全阻断；未绕过阻断。官方替代检索和公开客户端正文协议只绑定冻结网址原 ID，未匹配时保留失败。[逐条证据与缺口](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/data-completion/20260930-v1/public-acceptance-final-v3.json)；[浏览器阻断记录](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/data-completion/20260930-v1/public-browser-blocks.json)。
- **政策法律效力**：171 份政策/通知没有明确生效条款，83 份没有明确本件文号；这些未知不自动意味着文书无效，也不猜日期。94 个被引编号未在冻结范围内精确匹配；不把解读、征求意见、新闻标题或主题词当作生效政策与基金受益。
- **52 个历史行业关联行**：新天绿能 `600956` 的 17 行仅有 D 门类，未证明子行业；德迈仕 `301007` 的 35 行存在业务 C3660 与工艺 C33 口径差异。未用当前分类倒填。行情供应商的历史修订/方法版本、完整持仓行业权重假设仍未通过。[剩余行业理由](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/data-completion/20260930-v1/historical-industry-relations-result-final.json)；[指数输入验收边界](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/data-completion/20260930-v1/independent-sector-input-acceptance.json)。

## 保护、消耗和验证

- 开工保护三仓修改及未跟踪文件，最终回读 160763 个基线文件，无旧文件丢失。冻结 closure、information-research、fit 账、旧原件及封存文件摘要保持；未读取封存答案内容。**不能声称全部文件不变**：217 个运行缓存/索引发生更新，另有指定会话的 2 个页面文件、本轮看板及 2 个消息缓存变化；逐项列在 [保护差异及归属边界](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/data-completion/20260930-v1/protection-reconciliation.json)，未回滚这些并行工作。
- 数据库最后只读快照为 2026-09-30T14:48:04.035154+08:00：6 份模型登记及文件、169 条旧预测及原实际值摘要逐条一致，新预测 0，训练队列和咨询锁为空。002112 净值 2658 条、截至 9/29。此为该时点快照，不推定其他会话之后的运行状态。[运行回读](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/data-completion/20260930-v1/runtime-final.json)。
- 本轮 HTTP 尝试回执 4039 条，失败同样计数。原正文 3523/3523 消耗保留；累计拟合 70、共享剩余 12 不重领，本轮拟合 **0**。缓存读取/解压成员不重复算网络；浏览器导航和来源搜索不混入 HTTP 尝试账。[全部请求账](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/data-completion/20260930-v1/request-ledger-final-v3.json)。
- 最终验收检查 6167 个历史编号、1475 个公共网址、46/55 独立清单及 **48354 份证据文件**的预期摘要；21 项反例测试通过、51 份本轮脚本语法检查通过。先前页数限制、解析失败、布局误判和测试环境错误日志全部保留；后续结果以本索引为准。[文件核验索引](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/data-completion/20260930-v1/verified-files-final-v3.json)；[代码及测试结果](C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/data-completion/20260930-v1/code-validation-final-v2.json)。
- 未训练、登记、换模、倒灌后来消息、部署、自动提交/推送、付费、真实交易或外部通知。个人账户条件继续未知。本轮未改其他会话涉及的同步业务文件，也不依赖其保持 8000 服务运行。

本轮产物根目录：`C:/pythonProject/workSpace06/.local-runs/fund-exposure-002112/data-completion/20260930-v1`。原统一看板保留全部历史状态，并追加本次分层结果；研究及模型准入状态仍为未完成。
