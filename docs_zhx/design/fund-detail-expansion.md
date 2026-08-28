# 基金雷达 — 市场基础信息与关注后完整详情设计

> 关联需求：`docs_zhx/requirements/fund-detail-expansion.md`
> 关联测试：`docs_zhx/testcase/fund-detail-expansion.md`
> 关联实施看板：`docs_zhx/implementation/fund-radar.md` 的 M1-05
> 版本：v1.0
> 日期：2026-08-28
> 变更等级：L2

## 1. 链路与权限

```text
Vue 市场基础详情
  -> Java GET /api/v1/funds/{fundCode}
  -> FastAPI GET /internal/v1/funds/{fundCode}

Vue 我的关注完整详情
  -> Java GET /api/v1/watchlist/{fundCode}/detail
  -> 当前会话 + watchlist_item 本人关系校验
  -> FastAPI GET /internal/v1/funds/{fundCode}/watchlist-detail
  -> fund_ai 本地读模型

管理员受控基线同步
  -> Python TushareFundSyncService.sync_market_details()
  -> Tushare（只在同步任务中调用）
  -> fund_ai 扩展资料表 + source_sync_run
```

Java 是唯一对浏览器暴露完整详情的边界。Python 内部接口只验证服务令牌、不感知用户；因此 Java 必须在调用 Python 前完成本人关注关系校验。市场基础详情可继续缓存不含用户态的资料快照；本期完整详情不写共享 Redis，避免 `isWatched`、用户标识或授权结论进入缓存。

## 2. 数据模型与粒度

| 表/对象 | 粒度与业务键 | 内容 |
| --- | --- | --- |
| `fund_profile` | `fund_code + source_id` 当前资料快照 | `fund_basic` 的产品资料与内容哈希 |
| `nav_daily` 扩展 | `fund_code + nav_date + source_id` | 原净值字段加公告、分红、资产、复权净值 |
| `fund_manager_assignment` | `fund_code + source_id + source_record_key` | 经理姓名与任职历史 |
| `fund_share_snapshot` | `fund_code + trade_date + source_id` | 基金份额（万份）历史 |
| `fund_dividend` | `fund_code + source_id + source_event_key` | 分红事件及其实施状态 |

所有快照或历史记录均保存 `content_hash`。首次出现为新增、哈希变化为更新、哈希相同为跳过；任何字段缺失保持 `NULL`。同步运行通过既有 `source_sync_run.sync_type` 分别记录 `MARKET_DETAIL_PROFILE`、`MARKET_DETAIL_NAV`、`MARKET_DETAIL_MANAGER`、`MARKET_DETAIL_SHARE`、`MARKET_DETAIL_DIVIDEND`，不记录 Token 或原始响应。

## 3. 接口契约

| 接口 | 权限与用途 |
| --- | --- |
| `GET /api/v1/funds/{fundCode}` | `FUND_READ`；市场基础详情，携带基础资料、基础净值和来源状态 |
| `GET /api/v1/watchlist/{fundCode}/detail` | `FUND_READ` 且本人关注关系存在；完整详情 |
| `GET /internal/v1/funds/{fundCode}/watchlist-detail` | 仅 Java 服务令牌；不含用户态 |

完整详情以 `basic`、`managers`、`latestShare`、`dividends` 四个区块返回；`basic` 内含最新净值快照及扩展净值字段。每个区块都附带来源、业务日期和同步状态；列表限制为基金经理最多 50 条、分红最多 100 条，均按业务日期倒序。不存在基金返回 `404/FUND_NOT_FOUND`，基金存在但当前用户未关注返回 `403/WATCHLIST_REQUIRED`。

## 4. 同步与稳定性

首次同步仅由管理员触发，对当前 43 只市场基金分批执行；先读取来源精确代码，再按接口和代码批量/分页拉取，单个接口失败时整类运行标为失败且不标记成功。同步不从页面、普通读接口或用户关注动作中发起。

本期不新增自动调度。人工基线同步和字段完整性验收完成后，才在后续变更中单独登记目录/经理、净值/规模和分红的刷新计划。

## 5. 回滚

数据库迁移仅新增表和可空列，回滚时先确认新增历史表数据已归档，再删除表和列。Java/Vue 保留市场基础详情的兼容接口；完整详情接口与路由可独立下线，不影响市场浏览或既有关注关系。
