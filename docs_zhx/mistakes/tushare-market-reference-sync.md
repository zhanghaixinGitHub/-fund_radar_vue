# Tushare 市场参考数据同步错误记录

### 2026-09-02｜来源字段格式不能按文档示例假定

场景：管理员手动执行“当前 2000 积分免费数据补齐”，读取 `fund_daily` 和 `index_classify`。

现象：首次任务在场内基金日线阶段因负数涨跌值失败；修复后，第二次任务在指数分类阶段因层级 `L1` 失败。

根因：适配器将 `fund_daily.change`、`fund_daily.pct_chg` 误按非负数解析；同时将 `index_classify.level` 误限定为纯数字。真实来源允许负数涨跌，并返回 `L1` 这类带层级前缀的值。

正确做法：涨跌字段使用有限有符号十进制；分类层级仅接受 `1` 或 `L1`（不区分大小写）并规范为整数。未知文本如 `LEVEL_ONE` 必须失败，不能静默写入。每次来源字段适配都要保留真实格式回归样例，并让失败任务正确收口、不推进成功水位。

关联代码：`C:\pythonProject\workSpace06\app\integrations\tushare.py`、`C:\pythonProject\workSpace06\app\integrations\tushare_market_reference.py`、`C:\pythonProject\workSpace06\tests\test_tushare_market_reference.py`。

关联技术点：第三方接口契约、数据规范化、幂等同步、失败游标、脱敏错误处理。

标签：⚠️ 反复
