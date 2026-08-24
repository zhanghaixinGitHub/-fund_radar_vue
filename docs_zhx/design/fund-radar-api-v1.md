# 全市场基金雷达 — v1 接口契约

> 关联需求：`docs_zhx/requirements/fund-radar.md`
> 总体设计：`docs_zhx/design/fund-radar.md`
> 实施进度：`docs_zhx/implementation/fund-radar.md`
> 版本：v0.1 / M0

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

## 2. Java 公开 API（M0 已实现 Mock 只读接口）

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
    "nextCursor": null
  },
  "traceId": "uuid",
  "timestamp": "2026-08-24T00:00:00Z"
}
```

### `GET /api/v1/funds/{fundCode}`

`fundCode` 必须是 6 位数字。成功时 `data` 比列表项多出 `navStatus`、`dataSource`；M0 固定为 `MOCK`、`M0_MOCK`，不能被解释为真实净值或真实数据源。

| HTTP | 业务码 | 条件 |
| --- | --- | --- |
| 200 | `OK` | 返回 Mock 详情 |
| 404 | `FUND_NOT_FOUND` | 基金代码不存在 |
| 503 | `AI_SERVICE_UNAVAILABLE` | Java 无法访问 FastAPI；M0 无缓存，因此不伪造历史数据 |

## 3. FastAPI 内部 API（M0 已实现）

所有端点还必须带正确的 `X-Service-Token`；无 Token、错误 Token 或含 `Origin` 的浏览器请求返回 403，未配置 Token 返回 503。

| 方法 | 路径 | 状态 | 说明 |
| --- | --- | --- | --- |
| GET | `/internal/v1/health` | 已实现 | 返回受保护的服务存活状态 |
| GET | `/internal/v1/funds` | 已实现 | `keyword`、`pageSize`、`cursor` 的 Mock 基金列表 |
| GET | `/internal/v1/funds/{fund_code}` | 已实现 | 单只 Mock 基金详情 |
| GET | `/internal/v1/signals` | M1 | 已完成信号的游标读取 |
| GET | `/internal/v1/events` | M2 | 已审核事件的只读读取 |
| POST | `/internal/v1/tasks/rebuild` | M1 | 带幂等键的异步补数/重算任务 |

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

## 4. 尚未实现的公开契约

以下仅冻结路径和边界，不在 M0 返回伪数据：

| 方法 | 路径 | 最早阶段 | 约束 |
| --- | --- | --- | --- |
| GET | `/api/v1/funds/{fundCode}/signals` | M3 | 返回方向、概率、置信度、风险、解释、模型/特征版本与数据截至时间；不能输出确定性买卖指令 |
| GET | `/api/v1/funds/{fundCode}/events` | M2 | 返回授权范围内摘要、来源链接、发布时间、可信度和相关性，不声称因果 |
| POST | `/api/v1/watchlist` | M1 | 需 Java 身份和用户范围，重复添加幂等并写审计 |
| DELETE | `/api/v1/watchlist/{fundCode}` | M1 | 仅能删除当前用户自己的关注 |
| GET/PUT | `/api/v1/alert-rules` | M3 | 阈值/频率校验、审计及重复提醒抑制 |

禁止出现支付宝登录、持仓抓取、申购、赎回、买入、卖出或自动交易接口。
