# 全市场基金雷达 — v1 接口契约

> 关联需求：`docs_zhx/requirements/fund-radar.md`
> 总体设计：`docs_zhx/design/fund-radar.md`
> 实施进度：`docs_zhx/implementation/fund-radar.md`
> 版本：v0.6 / M1-M4（手工核验目录样本与本机确认快照）

本文件是 M0 的可版本化契约来源。Java 暂未引入 OpenAPI UI，FastAPI 明确关闭 OpenAPI/UI；接口发生不兼容变更时必须先提升本文件版本，再实现代码。

## 1. 通用规则

| 范围 | 基址 | 调用者 | 认证与边界 |
| --- | --- | --- | --- |
| 公开业务 API | Java：`/api/v1` | Vue 浏览器 | M0 仅限本地单用户；M1 起由 Java 执行认证、授权和数据范围控制 |
| 内部 AI API | FastAPI：`/internal/v1` | 仅 Java 服务 | 必须带 `X-Service-Token`；携带 `Origin` 的请求一律拒绝；FastAPI 不暴露浏览器 CORS 或 API 文档 |

- 前端发出 `X-Request-Id`；Java 优先复用 `X-Trace-Id`，否则生成 TraceID，并在每个公开响应中返回 `traceId` 和响应头 `X-Trace-Id`。
- Java 调用 FastAPI 时透传 `X-Trace-Id`，并使用 `X-Service-Token`。Token 只来自环境变量，不出现在前端、日志或响应中。
- 所有时间使用 ISO 8601；日期用 `YYYY-MM-DD`。公开 API 使用 camelCase，内部 API 使用 snake_case；Java Service 层必须转换内部 DTO，不能把 FastAPI DTO 直接返回给浏览器。
- 列表参数 `pageSize` 的范围为 1–100。`cursor` 是不透明、仅短期有效的游标，客户端不得解析或构造。
- 将来触发补数或重算任务时，必须提供 `Idempotency-Key`；任务只返回 `202 + taskId`，不得同步等待采集、训练或回测。
- 基金列表与详情的实时读取均返回 `stale=false`、`cachedAt=null`。仅当 FastAPI 不可用且 Java Redis 中存在未过期的最后成功读模型时，Java 返回 HTTP 200、`stale=true` 与 `cachedAt`；页面必须显著显示陈旧状态，不能把缓存数据称为实时净值或当日信号。

## 2. Java 公开 API（M0-M3）

### `GET /api/v1/funds`

查询参数：`keyword`（可选，最多 50 字符）、`pageSize`（默认 20）、`cursor`（可选）。

```json
{
  "success": true,
  "code": "OK",
  "message": "success",
  "data": {
    "items": [
      {
        "fundCode": "000001",
        "fundName": "M0 示例权益混合基金",
        "fundType": "MIXED",
        "status": "ACTIVE",
        "asOfDate": "2026-08-21"
      }
    ],
    "nextCursor": null,
    "stale": false,
    "cachedAt": null
  },
  "traceId": "uuid",
  "timestamp": "2026-08-24T00:00:00Z"
}
```

### `GET /api/v1/funds/{fundCode}`

`fundCode` 必须是 6 位数字。成功时 `data` 比列表项多出 `navStatus`、`dataSource`、`stale`、`cachedAt`。当前样本目录使用 `dataSource=MANUAL_PUBLISHER_VERIFIED_SAMPLE`；`navStatus=NOT_SYNCED` 与 `asOfDate=null` 表示尚未获得合规日净值，不能被解释为实时行情。

| HTTP | 业务码 | 条件 |
| --- | --- | --- |
| 200 | `OK` | 返回持久化目录详情；无净值时显式返回 `NOT_SYNCED` |
| 404 | `FUND_NOT_FOUND` | 基金代码不存在 |
| 503 | `AI_SERVICE_UNAVAILABLE` | Java 无法访问 FastAPI；M0 无缓存，因此不伪造历史数据 |

### `GET /api/v1/watchlist`（M1 本机单用户）

返回当前本机用户的关注列表。M1 使用固定的本机用户标识，仅适用于未开启登录的个人部署；它不是多用户认证或数据隔离的替代方案。

### `POST /api/v1/watchlist`（M1 本机单用户）

请求体：

```json
{
  "fundCode": "000001"
}
```

`fundCode` 必须为 6 位数字，且必须能通过 Java → FastAPI 的基金查询校验。重复添加返回成功但不产生重复行；添加及幂等命中都写入审计日志。

### `DELETE /api/v1/watchlist/{fundCode}`（M1 本机单用户）

只删除当前本机用户的对应关注项。重复删除同样返回成功并写入审计日志。请求体或路径参数不合法时返回 HTTP 400 和 `VALIDATION_ERROR`。

### `GET /api/v1/portfolio/current`（M4 本机确认快照）

返回当前本机用户最新的确认快照。该接口只读，不提供截图上传、支付宝登录、份额交易或买卖操作。无快照时返回 `available=false` 与空 `holdings`；有快照时，`dataAsOfStatus=UNKNOWN` 必须同时满足 `dataAsOfDate=null`。

```json
{
  "success": true,
  "code": "OK",
  "data": {
    "available": true,
    "sourceKind": "USER_CONFIRMED_SCREENSHOT",
    "dataAsOfStatus": "UNKNOWN",
    "dataAsOfDate": null,
    "importedAt": "2026-08-26T10:01:13Z",
    "holdings": [
      {
        "fundCode": "010710",
        "fundName": "安信医药健康主题股票C",
        "reportedAmount": 100.00,
        "reportedWeightPct": 1.00,
        "reportedDailyGainAmount": 1.00,
        "reportedHoldingGainAmount": 2.00,
        "reportedHoldingGainPct": 2.00,
        "reportedCumulativeGainAmount": 10.00
      }
    ]
  }
}
```

这些字段是用户确认的截图展示值，不是基金份额、成本、累计净值或实时行情；页面必须同时展示日期状态和非实时说明。

### `GET /api/v1/funds/{fundCode}/events`（M2 部分）

返回与该基金代码关联、已审核且仍在授权保留期内的事件游标页。每项包含来源名称、原始链接、发布时间、可信度、相关性与关联依据；关联依据仅说明可能相关，不宣称因果。AI 服务不可用但 Redis 存在最后成功页时，返回 `stale=true` 与 `cachedAt`；无缓存时返回 `503/AI_SERVICE_UNAVAILABLE`。当前未登记授权来源时正常返回空 `items`，不回退到 Mock 事件。

### `GET /api/v1/funds/{fundCode}/signals`（M3 部分）

返回可回放的评分结果游标页，包括数据截至日期、模型/特征版本、状态、解释、风险与可用时的方向/概率/置信度。`DATA_INSUFFICIENT`、`NOT_APPLICABLE`、`MODEL_REJECTED` 三种状态的方向、概率和置信度必须为 `null`。当前无真实数据和模型结果时正常返回空 `items`，不生成方向性结论。

### `GET/PUT /api/v1/alert-rules`（M3 本机单用户）

返回或幂等保存当前本机用户的站内信息提醒规则。请求体为：

```json
{
  "fundCode": "000001",
  "ruleType": "RISK_LEVEL",
  "threshold": 0.5,
  "enabled": true
}
```

`ruleType` 仅允许 `RISK_LEVEL`、`SIGNAL_CHANGE`、`EVENT`；仅 `RISK_LEVEL` 必须携带 0–1 的阈值，其他类型阈值必须为 `null`。保存操作写审计，但不发送外部消息、不会创建交易或支付入口。

## 3. FastAPI 内部 API（M0-M3）

所有端点还必须带正确的 `X-Service-Token`；无 Token、错误 Token 或含 `Origin` 的浏览器请求返回 403，未配置 Token 返回 503。

| 方法 | 路径 | 状态 | 说明 |
| --- | --- | --- | --- |
| GET | `/internal/v1/health` | 已实现 | 返回受保护的服务存活状态 |
| GET | `/internal/v1/funds` | 已实现 | `keyword`、`pageSize`、`cursor` 的已持久化目录样本列表；未同步净值时 `as_of_date=null` |
| GET | `/internal/v1/funds/{fund_code}` | 已实现 | 单只已持久化目录详情；`NOT_SYNCED` 不得视为实时净值 |
| GET | `/internal/v1/sources` | M1（部分） | 仅服务身份可读的来源开关、限频、保留期与最近状态；不返回凭证、原始内容或任务触发能力 |
| GET | `/internal/v1/signals` | M3（部分） | 本地已持久化评分结果的游标读取；不在读取时运行模型 |
| GET | `/internal/v1/events` | M2（部分） | 已审核、未过保留期且按基金关联的只读读取 |
| POST | `/internal/v1/tasks/rebuild` | 冻结 | 带幂等键的异步补数/重算任务；未获来源授权前不实现 |

内部列表响应示例：

```json
{
  "items": [
    {
      "fund_code": "000001",
      "fund_name": "M0 示例权益混合基金",
      "fund_type": "MIXED",
      "status": "ACTIVE",
      "as_of_date": "2026-08-21"
    }
  ],
  "next_cursor": null
}
```

`GET /internal/v1/sources` 在没有获授权来源时返回空数组；它不会据此创建来源、发起探测或绕过外部服务的访问规则。

## 4. 尚未实现的运行能力

以下能力保持禁用，不返回伪数据：

| 能力 | 恢复条件 | 约束 |
| --- | --- | --- |
| 来源同步、资讯采集和事件审核 | 每个来源已确认书面授权范围、访问方式、限频和保留期限 | 未确认不得登记、探测或访问第三方 |
| 特征构建、评分、滚动回测和提醒生成 | 有合规的类别化历史数据、模型准入标准和基线 | 不足数据不产生方向性信号；提醒不含交易指令 |
| M4 完整持仓分析与多人数据隔离 | 已有登录认证、本人授权、删除/导出策略，以及用户确认的日期/份额/成本 | 当前仅支持本机确认快照；禁止支付宝登录、凭证采集或未确认 OCR 入库 |

禁止出现支付宝登录、持仓抓取、申购、赎回、买入、卖出或自动交易接口。
