本页为旧现金研究历史记录，后续发现坏账准备及部分债券横杠被第一版读取器置0，已拒收该批研究。最新严格版、6个真实点值及独立原文核对见[可识别性修正研究](fund-quality-v2-real-calibration-progress-2026-10-17.md)。旧结果未进入RAW4或正式评分。

# 基金质量V2：现金净缓冲边界修正及真实核验

生成时间：2026-10-17T06:35:19.841213+08:00。

## 已修正的问题与当前结果

旧现金研究V1错误地把扣除未知保证金后的净缓冲下界截为0，从而将缺口上界封顶为合同5%。实际净缓冲可能为负，当前资料又未给出所需保证金有限上界，因此该有限缺口上界不成立。旧结果、代码、原件和文档全部保留，并由rejection.json明确拒收；没有进入RAW4、校准或正式评分。

修正版V2使用带符号的“现金＋合格政府债－所需保证金”。保证金上界尚未证明时，净缓冲下界和缺口上界均记未知。不会把未知写0，也不把实际保证金说成无穷大。只有证据充分且所有可能值给出相同结果，才可识别披露日点值。

- 重新逐原件核验22份真实历史输入、11产品：6份可读同报告约束和活期本金，但只能得到缺口下界0、上界待核；其余16份同报告完整条款未匹配。
- 6份点值均未知，不能入分。当前研究输出不替代RAW4现金目标字段；不是新校准产品、盲法验证或每天合规证明。
- 三份2025原PDF活期本金、利息和5%合计下限已独立按几何网格复核。该金额核验不受区间公式修正影响。修正版逐项与这些独立金额再次比较一致，没有把旧错误的上界带过来。
- 004605表头在35页，现金总额及本金在36页，独立首轮未找到完整表即失败；按实际表头列坐标跨页读取后通过。首轮读取器和修复后的读取器分别保留，不按预期金额选择单元格。
- 383项相关回归及Ruff通过；新增13项测试不用于校准。当前V2仍为198个当前原始字段、79个历史原始字段，八维完整包、合格完整校准/验证产品均为0；未生成V2锚点、分数、等级或启用记录。
- 2026-10-17T06:35:04.338246+08:00只读回查49条正式结果一致；原日期和历史批次保留，00:30任务未改。

## 原件独立读出的现金本金

| 份额 | 报告观察日 | 活期本金（人民币元） | 应计利息（元） | 合同合计下限 |
| --- | --- | ---: | ---: | ---: |
| 013275 | 2025-12-31 | 145747945.93 | 59990.89 | 0.05 |
| 013330 | 2025-12-31 | 48642136.77 | 5279.07 | 0.05 |
| 004605 | 2025-12-31 | 118237112.34 | 7507.53 | 0.05 |

现金合计规则是现金或一年以内政府债扣除实际保证金后不低于净资产5%；不是纯现金目标区间。未知政府债剩余期限保留实际金额未知，全部债券余额只作保守上界；同源全资产受限金额保守全额扣减。未能证明这些边界时，也不生成确定值。

## 真实会计反例

[159629管理人2025年年度报告](https://www.fullgoal.com.cn/wbs-file/fund_report/20260331/CN_50100000_159629_FB010010_20260002.pdf)，实际取得时间2026-10-17T06:25:59.098238+08:00。

- 物理37页：当前年度股指期货名义金额239,249,880.00元，公允价值资产与负债列均为横杠。
- 物理38页：IM2601持仓165.00手，合约市值250,126,800.00元；公允价值变动与可抵销暂收款均10,876,920.00元，抵销后净额为0。
- 非零持仓和零会计净额可以同时存在；不能据后者证明无持仓或所需保证金为0。名义金额与合约市值是不同字段，未强行相等。
- 该例没有给出实际所需保证金数值，也不证明其他基金有同样持仓。它是搜索后选取的真实会计反例，不增加校准或盲法验证产品。

## 逐基金、逐报告缺口

“条款未匹配”表示本研究尚未读出同报告完整约束，不等于原文未披露、全网不存在或权限不足；需继续核当时生效合同和原件版式。保证金未知需实际合约、保证金或托管估值资料，不能由零会计净额推定。

| 份额及名称 | 考察日 | 报告日 | 原件重建结果 | 精确剩余缺口 |
| --- | --- | --- | --- | --- |
| 002112 德邦鑫星价值灵活配置混合-C | 2025-04-30 | 2024-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 同报告完整条款或当时生效合同；不能从别的基金套用 |
| 002170 东吴移动互联灵活配置混合-C | 2025-04-30 | 2024-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 同报告完整条款或当时生效合同；不能从别的基金套用 |
| 004605 富国新活力灵活配置混合-C | 2025-04-30 | 2024-12-31 | 缺口下界0，上界未能证明；点值未知 | 实际所需股指期货保证金/其有限上界、政府债剩余期限及可用现金核验 |
| 005312 万家经济新动能混合-C | 2025-04-30 | 2024-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 同报告完整条款或当时生效合同；不能从别的基金套用 |
| 006730 万家中证500指数增强-C | 2025-04-30 | 2024-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 同报告完整条款或当时生效合同；不能从别的基金套用 |
| 012835 招商景气精选股票-A | 2025-04-30 | 2024-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 同报告完整条款或当时生效合同；不能从别的基金套用 |
| 013275 富国中证煤炭指数(LOF)-C | 2025-04-30 | 2024-12-31 | 缺口下界0，上界未能证明；点值未知 | 实际所需股指期货保证金/其有限上界、政府债剩余期限及可用现金核验 |
| 013330 富国中证银行指数-C | 2025-04-30 | 2024-12-31 | 缺口下界0，上界未能证明；点值未知 | 实际所需股指期货保证金/其有限上界、政府债剩余期限及可用现金核验 |
| 017960 招商趋势领航混合-A | 2025-04-30 | 2024-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 同报告完整条款或当时生效合同；不能从别的基金套用 |
| 018125 永赢先进制造智选混合-C | 2025-04-30 | 2024-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 同报告完整条款或当时生效合同；不能从别的基金套用 |
| 018590 银华体育文化灵活配置混合-C | 2025-04-30 | 2024-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 同报告完整条款或当时生效合同；不能从别的基金套用 |
| 002112 德邦鑫星价值灵活配置混合-C | 2026-04-30 | 2025-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 同报告完整条款或当时生效合同；不能从别的基金套用 |
| 002170 东吴移动互联灵活配置混合-C | 2026-04-30 | 2025-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 同报告完整条款或当时生效合同；不能从别的基金套用 |
| 004605 富国新活力灵活配置混合-C | 2026-04-30 | 2025-12-31 | 缺口下界0，上界未能证明；点值未知 | 实际所需股指期货保证金/其有限上界、政府债剩余期限及可用现金核验 |
| 005312 万家经济新动能混合-C | 2026-04-30 | 2025-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 同报告完整条款或当时生效合同；不能从别的基金套用 |
| 006730 万家中证500指数增强-C | 2026-04-30 | 2025-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 同报告完整条款或当时生效合同；不能从别的基金套用 |
| 012835 招商景气精选股票-A | 2026-04-30 | 2025-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 同报告完整条款或当时生效合同；不能从别的基金套用 |
| 013275 富国中证煤炭指数(LOF)-C | 2026-04-30 | 2025-12-31 | 缺口下界0，上界未能证明；点值未知 | 实际所需股指期货保证金/其有限上界、政府债剩余期限及可用现金核验 |
| 013330 富国中证银行指数-C | 2026-04-30 | 2025-12-31 | 缺口下界0，上界未能证明；点值未知 | 实际所需股指期货保证金/其有限上界、政府债剩余期限及可用现金核验 |
| 017960 招商趋势领航混合-A | 2026-04-30 | 2025-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 同报告完整条款或当时生效合同；不能从别的基金套用 |
| 018125 永赢先进制造智选混合-C | 2026-04-30 | 2025-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 同报告完整条款或当时生效合同；不能从别的基金套用 |
| 018590 银华体育文化灵活配置混合-C | 2026-04-30 | 2025-12-31 | ValueError:QUALITY_CASH_BASKET_COMPLETE_SAME_REPORT_CONSTRAINT_MISSING | 同报告完整条款或当时生效合同；不能从别的基金套用 |

## 当前方法边界

该研究仍未得到可替换旧字段的完整质量指标。若改为较有限的公开账簿结构指标，必须明确重新定义、命名，再独立验证其质量含义、去重及权重；不能把较弱代理重命名为完整流动性或策略容量。策略容量边界、治理完整适用性/整改复核、全资产发行人映射、独立产品校准与验证仍需继续处理。

当前逐基金其他缺口见[79字段年度原件验收记录](fund-quality-v2-annual-originals-validation-2026-10-17.md)。旧错误现金研究保留为[已拒收V1记录](fund-quality-v2-cash-measurability-2026-10-17.md)，其有限上界不得继续引用。

## 冻结来源和检查

- [V2预先规则及选择](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/cash-basket-measurability/attempt2/protocol.json)
- [V2真实回放](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/cash-basket-measurability/attempt2/result.json)
- [V1错误拒收](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/cash-basket-measurability/attempt1/rejection.json)
- [独立现金原格](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/cash-basket-measurability/attempt1/independent-bank-grid-repaired.json)
- [实际期货反例原格](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/cash-basket-measurability/futures-counterexample/actual-grid-evidence.json)
- [工程回归](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/cash-basket-measurability/attempt2/engineering-checks.json)
- [正式回查](C:/pythonProject/workSpace06/.local-runs/quality-v2-20261017-followup/cash-basket-measurability/attempt2/formal-readback.json)
