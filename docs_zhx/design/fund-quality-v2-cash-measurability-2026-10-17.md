# 基金质量V2：公开现金约束可测量性与真实反例

> 本文为已拒收的V1研究：未知保证金条件下的5%缺口封顶不成立。正确结果见[净缓冲边界修正](fund-quality-v2-cash-measurability-corrected-2026-10-17.md)；未改动的原始文档快照见[冻结副本](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/cash-basket-measurability/attempt1/rejected-v1-report-original.md)。以下仅供复查旧错误，不得作为计分依据。


生成时间：2026-10-17T06:31:24.533099+08:00。

## 本次结论

- 对既有22份历史年度输入、11个产品执行实际原件回放。6份提取出同报告完整现金合计约束、活期本金和数学边界；16份未匹配本研究要求的完整同报告条款。
- 6份均只能得到披露日缺口区间[0,0.05]，真实缺口点值仍未知；没有将区间端点或未知保证金当作0入分。新候选不能直接替换RAW4的纯现金目标字段。
- 独立pdfplumber/pdfminer重读三份2025年原PDF的活期本金、利息、坏账准备及5%条款，金额一致。004605日期表头在35页、活期总额及明细在36页；首轮失败保留，修复后按原表列边界取实际单元格，未用预期金额定位。
- 另取得159629真实年报并从物理37/38页网格核验：有165手IM2601，合约市值250,126,800.00元，抵销后净额仍为0。因此会计零净额不能代替无持仓或所需保证金为0的证明。这是搜索后选取的会计反例，不计入校准产品或新的盲法验证。
- 382项工程回归及Ruff通过，其中12项新增测试覆盖未知保证金、未知政府债期限、区间与点值、非原文标志及十进制精度。测试数据不进入真实资料集。
- 原始V2主输入仍是当前198字段、历史79字段。RAW4公式、权重、旧原件和既有批次未改；新增合格完整校准/验证产品为0，八维完整包为0。
- 2026-10-17T06:30:13.401629+08:00只读回查49条正式结果一致；00:30任务未改、未新建任务、未激活V2。

## 研究口径及为什么不能悄悄替换

RAW4现金字段要求真实现金目标上下界。现存较多合同实际规定现金或一年内政府债券在扣除股指期货所需保证金后，不低于产品净资产5%；这不是纯现金目标，更不证明现金越多越优。

新模块fund_quality_v2_cash_constraints只研究另一种候选：同一完整报告日，现金加合格政府债减实际所需保证金相对合同下限的缺口。优先从同报告基本情况读取条款，避免把后来招募书倒用为历史生效合同；从货币资金附注读活期本金并核本金加利息减准备等于活期余额。资产负债表仍逐项对账，净资产仍取当前年度列。

未知政府债剩余期限时，实际政府债金额保持未知，仅取0至全部债券账面余额的数学边界。受限金额只有同源、同观察日和全资产范围原句齐全时用于保守扣减全部受限金额，不假定现金的受限份额为0。股指期货所需保证金没有独立明文时保持未知，不能由资产负债表零余额、泛称未持有衍生金融资产/负债或布尔状态补0。

区间不是对未知输入填零；只有所有符合来源边界的可能输入均给出同一缺口，才可识别披露日点值。即使识别了点值，也只说明披露日有限口径，不证明每个交易日合规、完整流动性、实际可变现天数或基金综合质量。本研究全部结果未接入RAW4、评分或校准。

## 三份原PDF独立读表

| 份额 | 披露日 | 活期本金（元） | 应计利息（元） | 合同合计下限 | 点值 |
| --- | --- | ---: | ---: | ---: | --- |
| 013275 | 2025-12-31 | 145747945.93 | 59990.89 | 0.05 | 未识别；保证金仍待核 |
| 013330 | 2025-12-31 | 48642136.77 | 5279.07 | 0.05 | 未识别；保证金仍待核 |
| 004605 | 2025-12-31 | 118237112.34 | 7507.53 | 0.05 | 未识别；保证金仍待核 |

## 真实会计反例

[159629管理人2025年年度报告](https://www.fullgoal.com.cn/wbs-file/fund_report/20260331/CN_50100000_159629_FB010010_20260002.pdf)；公开送出日2026-03-31，本次实际取得时间2026-10-17T06:25:59.098238+08:00。

- 第37页当前年度衍生品表：股指期货名义金额239,249,880.00元，公允价值资产与负债列均为横杠。
- 第38页期货持仓表：IM2601，持仓165.00手，合约市值250,126,800.00元；公允价值变动与可抵销暂收款各10,876,920.00元，净额横杠。
- 名义金额与合约市值是不同字段，未强行对账为相等。反例证明不能由净额反推无持仓，但没有提供实际所需保证金数值。

## 逐基金、逐报告的精确缺口

“条款未匹配”只表示此研究尚未从该同报告解析出完整规则，不等于该基金没有规则、全网未披露或账号权限不足。需要继续核当期生效合同及相关原件；不能拿另一只基金条款补齐。“保证金待核”应取实际期货保证金/合约或托管估值证据，不能拿净额替代。以下均为已存在的11产品，不扩充虚构样本。

| 份额及名称 | 考察日/报告日 | 实际状态 | 仍缺内容和来源 | 冻结原件 |
| --- | --- | --- | --- | --- |
| 002112 德邦鑫星价值灵活配置混合-C | 2025-04-30/2024-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 该报告完整合计现金条款尚未匹配；需核原件版式或当时生效合同。不能认定基金没有此约束。 | [实际年报](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/rating-inputs/sources/7c119b15d297b2f9627942d7827fa66a1cc68396466a4792585449623cb68abc.pdf) |
| 002170 东吴移动互联灵活配置混合-C | 2025-04-30/2024-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 该报告完整合计现金条款尚未匹配；需核原件版式或当时生效合同。不能认定基金没有此约束。 | [实际年报](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/rating-inputs/sources/ec5614f19ce821af2ac40607999e03642b6e4beeec07c5eb7cee614f1ba7a83f.json) |
| 004605 富国新活力灵活配置混合-C | 2025-04-30/2024-12-31 | 披露日区间[0,0.05]；点值未知 | 实际所需股指期货保证金或明确无合约原文；合格政府债剩余期限/可用现金边界。未证明资料权限不足。 | [实际年报](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/rating-inputs/sources/e5784a8a3c0d84d768dcc7b38156d5c53cf2aa6875727325b048d201717cba6e.json) |
| 005312 万家经济新动能混合-C | 2025-04-30/2024-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 该报告完整合计现金条款尚未匹配；需核原件版式或当时生效合同。不能认定基金没有此约束。 | [实际年报](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/rating-inputs/sources/06e6c08810fefa065ea4d28ef958ef5881679a10ddc2fa7e11a715dc6bbee1c4.json) |
| 006730 万家中证500指数增强-C | 2025-04-30/2024-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 该报告完整合计现金条款尚未匹配；需核原件版式或当时生效合同。不能认定基金没有此约束。 | [实际年报](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/rating-inputs/sources/52b50aa751d8377321f43cff2e42ad3d89a9feac3cf639b0eddc6c4aa650ca55.json) |
| 012835 招商景气精选股票-A | 2025-04-30/2024-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 该报告完整合计现金条款尚未匹配；需核原件版式或当时生效合同。不能认定基金没有此约束。 | [实际年报](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/rating-inputs/sources/f9f7e9bd6473ca31485e90fc61088becf6b138f46f1b4afad6c5c14979eaa335.pdf) |
| 013275 富国中证煤炭指数(LOF)-C | 2025-04-30/2024-12-31 | 披露日区间[0,0.05]；点值未知 | 实际所需股指期货保证金或明确无合约原文；合格政府债剩余期限/可用现金边界。未证明资料权限不足。 | [实际年报](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/rating-inputs/sources/6e8c212a7d3d1c55287ab59fa9cbb6cea37cc011a92f2f50f00d89649bbcbd57.json) |
| 013330 富国中证银行指数-C | 2025-04-30/2024-12-31 | 披露日区间[0,0.05]；点值未知 | 实际所需股指期货保证金或明确无合约原文；合格政府债剩余期限/可用现金边界。未证明资料权限不足。 | [实际年报](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/rating-inputs/sources/f99e498cafdd889755d8e0f36fdb74cf02605eb736a97cac9f22909dda8e2021.json) |
| 017960 招商趋势领航混合-A | 2025-04-30/2024-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 该报告完整合计现金条款尚未匹配；需核原件版式或当时生效合同。不能认定基金没有此约束。 | [实际年报](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/rating-inputs/sources/587836d2871ff14b102faa4987baa045d21c984ed3b09c4420c824d597732f1d.pdf) |
| 018125 永赢先进制造智选混合-C | 2025-04-30/2024-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 该报告完整合计现金条款尚未匹配；需核原件版式或当时生效合同。不能认定基金没有此约束。 | [实际年报](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/rating-inputs/sources/79defe408c9b88a892d9b3727f4f5822ddd5b26e4f3ef05f8c403b4dd4bfd01c.json) |
| 018590 银华体育文化灵活配置混合-C | 2025-04-30/2024-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 该报告完整合计现金条款尚未匹配；需核原件版式或当时生效合同。不能认定基金没有此约束。 | [实际年报](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/rating-inputs/sources/cb0d84bf9fe05f084d1e89d945a60c2e5ac3aef52cc6954a1b9777b57c8a2d8f.json) |
| 002112 德邦鑫星价值灵活配置混合-C | 2026-04-30/2025-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 该报告完整合计现金条款尚未匹配；需核原件版式或当时生效合同。不能认定基金没有此约束。 | [实际年报](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/rating-inputs/sources/6d8853f58caf4cfe115dd50a003263e35a1e800b2dbdd0b1db28591d354d5f60.pdf) |
| 002170 东吴移动互联灵活配置混合-C | 2026-04-30/2025-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 该报告完整合计现金条款尚未匹配；需核原件版式或当时生效合同。不能认定基金没有此约束。 | [实际年报](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/rating-inputs/sources/c9ab72fd1e97355dab2d6a22752d19305c5c16423c227873a2250861b54ad216.json) |
| 004605 富国新活力灵活配置混合-C | 2026-04-30/2025-12-31 | 披露日区间[0,0.05]；点值未知 | 实际所需股指期货保证金或明确无合约原文；合格政府债剩余期限/可用现金边界。未证明资料权限不足。 | [实际年报](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/rating-inputs/sources/6a86116eed88de01d562642f9afc5871b3b68e2be1dc5dbc0c90f3acb4b67a42.json) |
| 005312 万家经济新动能混合-C | 2026-04-30/2025-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 该报告完整合计现金条款尚未匹配；需核原件版式或当时生效合同。不能认定基金没有此约束。 | [实际年报](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/rating-inputs/sources/5cc72fe50966beeb02a0be0dbd3f5cb6b6da9b226090dba54cb22428f4d30bad.json) |
| 006730 万家中证500指数增强-C | 2026-04-30/2025-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 该报告完整合计现金条款尚未匹配；需核原件版式或当时生效合同。不能认定基金没有此约束。 | [实际年报](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/rating-inputs/sources/e65fa59ecbbcdabdede670f6a2bc78b8e432f5c2a2cec8e3ee3a60814c3ea52a.json) |
| 012835 招商景气精选股票-A | 2026-04-30/2025-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 该报告完整合计现金条款尚未匹配；需核原件版式或当时生效合同。不能认定基金没有此约束。 | [实际年报](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/rating-inputs/sources/1cfd02918f462d726923407a2cb1c0914dc154eb8489e2240881f3de6270999e.pdf) |
| 013275 富国中证煤炭指数(LOF)-C | 2026-04-30/2025-12-31 | 披露日区间[0,0.05]；点值未知 | 实际所需股指期货保证金或明确无合约原文；合格政府债剩余期限/可用现金边界。未证明资料权限不足。 | [实际年报](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/rating-inputs/sources/a75af2c5a78bc53cf8549f0a4a58568994c26be39b31b3cc1ddb0717b9769a37.pdf) |
| 013330 富国中证银行指数-C | 2026-04-30/2025-12-31 | 披露日区间[0,0.05]；点值未知 | 实际所需股指期货保证金或明确无合约原文；合格政府债剩余期限/可用现金边界。未证明资料权限不足。 | [实际年报](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/rating-inputs/sources/db48c4b8567c4b96b4474da3a27b10c9df728c715fa0199a9638802f9e2f123d.pdf) |
| 017960 招商趋势领航混合-A | 2026-04-30/2025-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 该报告完整合计现金条款尚未匹配；需核原件版式或当时生效合同。不能认定基金没有此约束。 | [实际年报](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/rating-inputs/sources/fb5c071960066dbece4a54180f13f90532bf11edcd2a73bf99f9bd16cd5d9e0d.pdf) |
| 018125 永赢先进制造智选混合-C | 2026-04-30/2025-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 该报告完整合计现金条款尚未匹配；需核原件版式或当时生效合同。不能认定基金没有此约束。 | [实际年报](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/rating-inputs/sources/1b47f8dc2c4c234cc6f0f24d5c3833146e5a3b80f1b176f7078f2872dfe87618.json) |
| 018590 银华体育文化灵活配置混合-C | 2026-04-30/2025-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 该报告完整合计现金条款尚未匹配；需核原件版式或当时生效合同。不能认定基金没有此约束。 | [实际年报](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/run15/historical-primary/rating-inputs/sources/9b1c43e2cd18cee8054149601ce787faf8f608b810c180ea78c5ffb49647a96e.json) |

## 对完整方法的影响

这次验证否定了“把5%篮子条件直接换名后即可补齐现金评分”的捷径。若另选只能反映公开现金账簿结构的指标，须重新命名并明确未覆盖实际保证金和逐日流动性，再验证它与目标执行、受限资产、规模容量的重复贡献、方向及权重。不能把较弱代理写成已测得实际容量，或通过删项、补零、重分权制造完整评级。

策略容量边界、完整治理适用性/整改复核、全资产发行人映射及独立产品样本仍须继续推进。全部当前基金其他资料缺口见[年度原件验收记录](fund-quality-v2-annual-originals-validation-2026-10-17.md)。

## 可复查冻结文件

- [预先冻结规则和22报告选择](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/cash-basket-measurability/attempt1/protocol.json)
- [实际回放结果](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/cash-basket-measurability/attempt1/result.json)
- [三份原PDF独立表格](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/cash-basket-measurability/attempt1/independent-bank-grid-repaired.json)
- [真实期货反例网格](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/cash-basket-measurability/futures-counterexample/actual-grid-evidence.json)
- [382项工程检查](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/cash-basket-measurability/attempt1/engineering-checks.json)
- [正式评分只读回查](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/cash-basket-measurability/attempt1/formal-readback.json)
