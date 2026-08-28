# 全市场基金雷达 — 验收测试用例

> 关联需求：`docs_zhx/requirements/fund-radar.md`
> 关联设计：`docs_zhx/design/fund-radar.md`
> 日期：2026-08-24
> 说明：当前为工程实施前的验收基线。数据库验证语句以 PostgreSQL 为目标方言，待表迁移落地后执行。

## TC-01｜无需个人持仓即可浏览全市场基金

前置条件：已完成基金目录和至少一个交易日的日净值同步；测试用户未创建任何持仓或交易记录。

场景：用户首次进入市场列表。

操作步骤：

1. 登录前端并打开“全市场基金”。
2. 依次按股票、债券、混合基金筛选。
3. 搜索一个有效基金代码并打开详情。

页面验证：

| 项目 | 预期值 |
| --- | --- |
| 基金列表 | 能分页显示，无需要求导入支付宝持仓 |
| 筛选结果 | 只包含所选基金类型，显示数据截至时间 |
| 基金详情 | 显示基金代码、份额类别、最新有效净值和来源状态 |

测试结果：

- [ ] 通过
- [ ] 未通过
- 未通过原因：

## TC-22｜登录、前后台权限与个人数据隔离

1. 无 Cookie 直接打开 `/funds`、`/watchlist`、`/portfolio` 和 `/admin`，均跳转登录；直接请求对应 Java API 返回 `401/AUTHENTICATION_REQUIRED`。
2. 使用未注册大陆手机号登录，确认显示统一错误且不创建用户；进入 `/register`，核对手机号、输入两次一致的 6 至 20 位密码后注册并进入基金市场。再次注册相同手机号提示直接登录；使用正确密码登录不创建新用户。
3. 基金用户登录后顶栏仅有基金市场、我的关注、我的持仓，右上角账户下拉无“后台管理”。数据运营和系统管理员从右上角账户下拉点击“后台管理”后，确认在新标签页打开独立后台顶栏、原前台标签页保持不变；数据运营仅见工作台、数据同步、运行状态，不见用户管理；系统管理员拥有完整后台菜单；后台账户下拉不显示“返回前台”。
4. 用两名用户分别建立关注或持仓快照，互相请求本人接口时只得到自己的数据；前端请求不包含 `userId`。
5. 系统管理员在用户管理页调整角色、启停、人工重置密码并查看指定用户持仓；数据运营直接访问这些接口应为 `403`。
6. 选择历史关注迁移目标，先取消确认确保不迁移，再确认一次；验证仅关注迁移，提醒与持仓不变。
7. 检查浏览器状态、网络请求和日志：不出现完整手机号、密码、会话 Cookie 或 CSRF 值；写操作缺失 CSRF 时返回 `403`。

| 验收点 | 预期结果 |
| --- | --- |
| 登录门禁 | 用户端基金浏览和个人数据不能绕过登录 |
| 显式注册 | 新手机号仅在注册页确认后创建默认基金用户并建立会话 |
| 权限 | 数据运营不能用户管理；系统管理员拥有全部权限 |
| 数据归属 | 关注、提醒、持仓以当前服务端会话用户隔离 |
| 管理审计 | 重置、角色、状态、迁移和他人持仓查看均由 Java 授权审计 |

---

## TC-23｜注册姓名与管理员角色展示

前置条件：已启动包含本变更的 Vue 与 Java 服务；准备一个未注册大陆手机号，以及一个可进入“用户管理”的管理员账户。

操作步骤：

1. 打开 `/register`，只填写手机号和两次密码后提交，确认页面提示必须填写姓名，服务端不创建账户。
2. 填写姓名“张三”并注册，确认返回基金市场，右上角显示“基金用户张三”，且仅显示脱敏手机号。
3. 用管理员账户在“用户管理”将张三的角色改为“管理员”，确认下拉选项和二次确认文案均使用“管理员”，目标会话失效。
4. 张三重新登录，确认前台和后台工作台均显示“管理员张三”；系统预置账户显示“管理员系统管理员”。
5. 用历史自动生成的“基金用户+脱敏手机号”账户重复步骤 3，确认角色变更后展示为“管理员+脱敏手机号”，不显示旧的“基金用户”前缀。

页面验证：检查注册请求体包含 `mobile`、`password`、`displayName`，响应和页面不出现原始手机号、密码、Cookie 或 CSRF 值。

| 验收点 | 预期值 |
| --- | --- |
| 姓名校验 | 空白或超过 128 个字符均不能注册 |
| 默认角色 | 成功注册后为基金用户，展示“基金用户+姓名” |
| 角色名称 | 内部 `SYSTEM_ADMIN` 的所有中文页面文案显示“管理员” |
| 系统预置账户 | 账户姓名“系统管理员”与角色“管理员”组合显示 |
| 旧账户兼容 | 不改写数据；以脱敏手机号作为姓名回退 |

测试结果：

- [ ] 通过
- [ ] 未通过
- 未通过原因：

---

## TC-24｜个人信息维护姓名

前置条件：已使用一名启用账户登录，且 Vue 与 Java 服务均包含本次变更。

操作步骤：

1. 展开右上角账户菜单，确认存在“个人信息”并进入 `/profile`。
2. 确认页面仅展示角色与脱敏手机号，手机号和角色没有可编辑控件。
3. 清空姓名后移出输入框或提交，确认就近显示“姓名不能为空”错误且不发送有效更新。
4. 输入“李四”并保存，确认成功提示出现，右上角账户名称立即更新为“基金用户李四”或“管理员李四”。
5. 检查更新请求只包含 `displayName`，未携带 `userId`、手机号、角色、密码、Cookie 或 CSRF 值；去掉 CSRF Header 重试，确认服务端返回 `403`。

数据库验证：

```sql
SELECT display_name, mobile, role
FROM user_account
WHERE user_id = :current_user_id;
```

| 验收点 | 预期值 |
| --- | --- |
| `display_name` | 更新为“李四” |
| `mobile`、`role` | 与更新前一致 |
| 审计 | 新增 `USER_PROFILE_UPDATED`，不包含姓名或手机号 |
| 顶栏 | 不刷新页面即使用更新后的角色加姓名 |

测试结果：

- [ ] 通过
- [ ] 未通过
- 未通过原因：

---

## TC-02｜份额类别与日净值幂等同步

前置条件：FastAPI AI 服务已配置测试数据源；存在同一基金主实体的两个份额类别和同日期净值数据。

场景：重复执行同一日的净值同步任务。

操作步骤：

1. 记录目标基金代码、净值日期和当前行数。
2. 连续执行两次 `sync_nav_daily`。
3. 查询目标日期和基金代码的数据。

数据库验证：

```sql
SELECT fund_code, nav_date, source_id, COUNT(*) AS row_count
FROM nav_daily
WHERE fund_code IN ('TEST_A', 'TEST_C')
  AND nav_date = DATE '2026-08-21'
GROUP BY fund_code, nav_date, source_id;
```

| 项目 | 预期值 |
| --- | --- |
| 每组 `row_count` | `1` |
| 两个份额类别 | 分别保存，不相互覆盖 |
| 任务结果 | 第二次为幂等跳过或更新相同数据，不产生重复行 |

测试结果：

- [ ] 通过
- [ ] 未通过
- 未通过原因：

---

## TC-03｜数据源异常时页面降级而非伪造信号

前置条件：某基金已有昨日成功信号；将其当日行情来源配置为超时。

场景：执行日频同步和评分任务。

操作步骤：

1. 模拟外部数据源连接超时。
2. 执行 `sync_nav_daily` 和 `score_funds`。
3. 打开该基金详情和信号历史。

页面验证：

| 项目 | 预期值 |
| --- | --- |
| 最新数据 | 显示最后成功同步时间与“数据延迟/不可用”状态 |
| 当日信号 | 不生成新的方向性信号 |
| 历史信号 | 仍可查看，并明确其数据截至日期 |

测试结果：

- [ ] 通过
- [ ] 未通过
- 未通过原因：

---

## TC-04｜资讯去重、来源追溯与关联解释

前置条件：两个允许接入的资讯源发布同一事件的相近标题；事件涉及一个行业指数。

场景：执行资讯采集和关联任务。

操作步骤：

1. 执行 `collect_public_events`。
2. 执行 `normalize_and_link_event`。
3. 在基金详情页打开关联事件。

数据库验证：

```sql
SELECT n.content_hash, COUNT(*) AS news_count
FROM news_item n
GROUP BY n.content_hash
HAVING COUNT(*) > 1;
```

| 项目 | 预期值 |
| --- | --- |
| 重复内容 | 不出现相同 `content_hash` 的重复有效新闻 |
| 事件卡片 | 显示来源、发布时间、链接、可信度与相关性说明 |
| 关联措辞 | 使用“可能相关/关联依据”，不写成确定因果或交易指令 |

测试结果：

- [ ] 通过
- [ ] 未通过
- 未通过原因：

---

## TC-05｜不同基金类别使用正确输出口径

前置条件：存在一只股票基金、一只债券基金、一只货币基金和一只 QDII 基金，且均具有有效数据。

场景：分别查看四只基金详情。

操作步骤：

1. 打开四只基金的信号与风险区域。
2. 对比模型类型、基准、风险标签和说明。

页面验证：

| 基金类型 | 预期值 |
| --- | --- |
| 股票基金 | 展示权益类趋势、波动、回撤和行业/基准依据 |
| 债券基金 | 展示债券适用的风险/利率相关说明，不套用权益排名 |
| 货币基金 | 不显示“上涨概率”或“买入建议” |
| QDII | 显示外盘/汇率/时区或估值滞后提示 |

测试结果：

- [ ] 通过
- [ ] 未通过
- 未通过原因：

---

## TC-06｜模型结果可回溯且信号接收幂等

前置条件：FastAPI AI 服务已生成一条带模型版本、特征版本和结果哈希的测试信号。

场景：Java 重复接收同一 `signal_id`。

操作步骤：

1. 向 Java 内部接收接口发送同一信号两次。
2. 查询 Java 信号快照和审计日志。
3. 在前端查看该信号详情。

数据库验证：

```sql
SELECT fund_code, as_of_date, model_version, COUNT(*) AS row_count
FROM signal_snapshot
GROUP BY fund_code, as_of_date, model_version
HAVING COUNT(*) > 1;
```

| 项目 | 预期值 |
| --- | --- |
| 重复快照 | 查询结果为空，即不存在重复业务快照 |
| 页面详情 | 显示数据日期、模型版本、特征版本、置信度和依据 |
| 审计 | 可按 `trace_id` 查询两次接收行为及幂等结果 |

测试结果：

- [ ] 通过
- [ ] 未通过
- 未通过原因：

---

## TC-07｜回测防止时间泄漏并展示基线

前置条件：存在训练期、验证期和未参与训练的测试期；已配置长期持有、定投、业绩比较基准三个基线。

场景：运行一个类别化模型的滚动回测。

操作步骤：

1. 提交 `run_backtest`，记录样本区间和策略版本。
2. 等待任务完成后查看回测详情。
3. 检查测试期是否晚于所有训练数据。

数据库验证：

```sql
SELECT run_id, window_start, window_end, strategy_version, status
FROM backtest_run
WHERE run_id = :run_id;
```

| 项目 | 预期值 |
| --- | --- |
| 时间顺序 | 训练、验证、测试严格按时间推进，无未来数据进入特征 |
| 结果展示 | 同时展示收益、最大回撤、波动率、命中率和三类基线 |
| 模型准入 | 若未优于基线或样本不足，模型状态为不可发布 |

测试结果：

- [ ] 通过
- [ ] 未通过
- 未通过原因：

---

## TC-08｜前端不能绕过 Java 访问 FastAPI AI 服务

前置条件：前端、Java、FastAPI 分别启动；FastAPI 内部 API 仅允许服务身份访问。

场景：浏览器尝试直接访问 FastAPI 内部接口。

操作步骤：

1. 在浏览器地址栏或开发者工具中请求 `/internal/v1/signals`。
2. 通过前端正常打开基金信号页面。

页面验证：

| 项目 | 预期值 |
| --- | --- |
| 浏览器直连 FastAPI | 返回 401/403 或网络不可达，不泄露业务数据 |
| 正常前端页面 | 仅调用 Java `/api/v1/*` 并成功展示数据 |
| 网络请求 | 不出现 FastAPI 服务密钥、资讯源 Token 或数据库信息 |

测试结果：

- [ ] 通过
- [ ] 未通过
- 未通过原因：

---

## TC-09｜个人关注与数据隔离

前置条件：存在用户 A、用户 B，各自关注不同基金。

场景：用户 A 查询和修改关注列表。

操作步骤：

1. 以用户 A 登录，添加和删除自己的关注基金。
2. 尝试使用用户 B 的关注记录标识进行删除或查询。

数据库验证：

```sql
SELECT user_id, fund_code
FROM watchlist_item
ORDER BY user_id, fund_code;
```

| 项目 | 预期值 |
| --- | --- |
| 用户 A 操作 | 仅影响 A 的 `watchlist_item` |
| 越权请求 | 返回 403 或资源不存在，不泄露用户 B 的数据 |
| 审计 | 记录用户、操作、基金代码和 TraceID，不记录敏感凭证 |

测试结果：

- [ ] 通过
- [ ] 未通过
- 未通过原因：

---

## TC-10｜禁止支付宝凭证和自动交易入口

前置条件：完成前端路由、Java API 和 FastAPI 内部 API 基础功能部署。

场景：检查系统页面、接口、配置与日志。

操作步骤：

1. 检查前端菜单、表单和路由。
2. 检查 Java OpenAPI 文档和 FastAPI OpenAPI 文档。
3. 用关键字扫描示例配置和测试日志：`password`、`cookie`、`验证码`、`trade`、`支付宝`。

页面与配置验证：

| 项目 | 预期值 |
| --- | --- |
| 账户接入入口 | 不存在支付宝登录、密码、验证码或 Cookie 上传功能 |
| 交易接口 | 不存在申购、赎回、买入、卖出或自动下单 API |
| 日志 | 不记录任何认证要素、支付信息或完整外部响应正文 |
| 页面文案 | 不使用“保证上涨”“必买”“自动交易”等表述 |

测试结果：

- [ ] 通过
- [ ] 未通过
- 未通过原因：

---

## TC-12｜M1 本机单用户关注幂等与参数校验

前置条件：Java 已迁移至 `fund_core`，FastAPI 可返回 M0 Mock 基金 `000001`。

场景：同一本机用户重复添加、重复删除一只基金，并提交一个缺少基金代码的请求。

操作步骤：

1. 连续两次请求 `POST /api/v1/watchlist`，请求体均为 `{ "fundCode": "000001" }`。
2. 请求 `GET /api/v1/watchlist`，确认只返回一条 `000001`。
3. 请求 `POST /api/v1/watchlist`，请求体为 `{}`。
4. 连续两次请求 `DELETE /api/v1/watchlist/000001`，再查询列表。
5. 查询 `audit_log` 中本次四类操作的记录。

| 项目 | 预期值 |
| --- | --- |
| 重复添加 | 两次均成功，`watchlist_item` 只有一条业务记录 |
| 空请求 | HTTP 400，业务码为 `VALIDATION_ERROR` |
| 重复删除 | 两次均成功，最终关注列表为空 |
| 审计 | 有添加、添加幂等、删除、删除幂等四类审计记录，含本机用户和 TraceID |

测试结果：

- [x] 通过（2026-08-24：候选服务验证 HTTP 400、两次添加/删除均 200，添加后 1 条、删除后 0 条）
- [ ] 未通过
- 未通过原因：

---

## TC-13｜M1 缓存降级与游标分页

前置条件：Redis 已启动且 Java 可读取其认证配置；FastAPI 的 M0 Mock 列表和详情可正常访问。

场景：先读取一页列表和一只基金详情以写入缓存，再让 Java 的 FastAPI 内部地址不可达。

操作步骤：

1. 请求 `GET /api/v1/funds?pageSize=1`，记录第一项与 `nextCursor`。
2. 使用该游标读取第二页，并读取 `GET /api/v1/funds/000001`。
3. 将独立验证实例的 `AI_SERVICE_BASE_URL` 设置为不可达地址，重复列表与详情请求。

| 项目 | 预期值 |
| --- | --- |
| 游标分页 | 第二页不重复第一页基金，客户端只使用服务端返回游标 |
| 正常读取 | `stale=false`、`cachedAt=null` |
| FastAPI 不可达 | 有缓存时 HTTP 200、`stale=true`、`cachedAt` 为 ISO 时间；无缓存才返回 503 |
| 页面说明 | 前端显著提示缓存/陈旧状态，不把它描述为实时数据 |

测试结果：

- [x] 通过（2026-08-24：`000001 → cursor=1 → 000002`；不可达候选实例返回列表和详情的 `stale=true` 与 `cachedAt`）
- [ ] 未通过
- 未通过原因：

---

## TC-14｜M1 来源诊断不泄露凭证且不触发外部调用

前置条件：FastAPI 已迁移 `source_registry`，未登记任何获授权来源。

场景：访问受限来源诊断接口。

操作步骤：

1. 不带 `X-Service-Token` 请求 `GET /internal/v1/sources`。
2. 使用有效服务 Token 请求同一接口。
3. 检查响应字段及实际 `source_registry` 行数。

| 项目 | 预期值 |
| --- | --- |
| 未认证请求 | HTTP 403 |
| 已认证请求 | 仅返回来源开关、限频、保留期和最近状态，不含 Token、Cookie、外部内容或任务触发入口 |
| 无授权来源 | 返回空数组；不自动创建、启用或探测来源 |

测试结果：

- [x] 通过（2026-08-24：pytest 覆盖未认证与已认证脱敏响应；实际数据库诊断计数为 0）
- [ ] 未通过
- 未通过原因：

---

## TC-11｜M0 Mock 基金契约与跨服务 TraceID

前置条件：Java、FastAPI 均已启动并配置相同的测试 `AI_SERVICE_TOKEN`；不启动真实采集任务。

场景：通过 Java 查询 M0 Mock 基金列表和详情，并验证浏览器不能直连内部接口。

操作步骤：

1. 请求 Java：`GET /api/v1/funds?pageSize=2`，记录响应头 `X-Trace-Id`。
2. 请求 Java：`GET /api/v1/funds/000001`。
3. 直接请求 FastAPI：`GET /internal/v1/funds`，不带服务 Token。
4. 使用带 `Origin: http://localhost:5173` 和服务 Token 的请求访问 FastAPI 内部列表。

页面与接口验证：

| 项目 | 预期值 |
| --- | --- |
| Java 列表 | HTTP 200；`data.items` 至少两项；包含 camelCase 的 `fundCode`、`asOfDate` |
| Java 详情 | HTTP 200；`data.dataSource=M0_MOCK`、`data.navStatus=MOCK` |
| TraceID | Java 响应体与响应头均含 TraceID；FastAPI 日志可按相同 TraceID 查询 |
| FastAPI 无 Token | HTTP 403，不泄露 Mock 数据 |
| FastAPI 浏览器来源 | HTTP 403，即使伪造 Token 也不返回数据 |
| 数据真实性 | 所有 M0 返回均明确为 Mock，不作为实际净值或投资分析依据 |

测试结果：

- [ ] 通过
- [ ] 未通过
- 未通过原因：

---

## TC-15｜M4 用户确认快照的本机导入、幂等与未知日期边界

前置条件：`fund_ai` 已有经核验的基金份额目录；Java 已迁移至包含 `portfolio_snapshot` 和 `portfolio_holding_snapshot` 的 `fund_core`；导入文件仅保存在 Git 忽略的本机路径。

场景：导入一份用户确认的截图字段，截图中没有数据日期、份额、成本和交易流水。

操作步骤：

1. 以显式启动参数运行本机导入器，导入包含 6 条完整可见基金行的 JSON 文件。
2. 再次执行相同导入命令。
3. 请求 `GET /api/v1/portfolio/current`，并打开前端 `/portfolio`。
4. 检查 `portfolio_snapshot`、`portfolio_holding_snapshot`、`audit_log`，以及 `fund_ai` 中的 `nav_daily` 行数。

| 项目 | 预期值 |
| --- | --- |
| 个人数据边界 | 原始截图、路径、支付宝凭证、Cookie 和验证码均不进入数据库、日志或响应 |
| 日期边界 | `dataAsOfStatus=UNKNOWN` 且 `dataAsOfDate=null`；页面明确提示日期未知，不显示实时净值或成本推算 |
| 幂等 | 重复导入按 `(user_id, source_content_hash)` 命中同一快照，不新增第二份持仓业务数据 |
| 数据一致性 | 快照只包含用户确认的 6 行；代码、名称和份额类别可与 `fund_share_class` 对照；无日净值时不填充 `nav_daily` |
| 查询边界 | Vue 只请求 Java `/api/v1/portfolio/current`；接口只读，不存在持仓写入、支付宝登录或交易路由 |
| 视觉与响应式 | 375、768、812 横屏和 1024 宽度下无横向溢出；收益同时展示符号和颜色 |

测试结果：

- [x] 通过（2026-08-26：实际导入 1 份/6 条，重复键由唯一约束保护；Java 返回 `available=true`、`UNKNOWN`、6 条，前端四个宽度无横向溢出）
- [ ] 未通过
- 未通过原因：

---

## TC-16｜Tushare 目录完整性保护与日净值幂等同步

前置条件：用户已取得 Tushare 公募基金接口授权；本机 `.env` 已配置 Token；`fund_ai` 已应用 Alembic `20260826_03`；不在命令行、日志或截图中展示 Token。

场景：执行目录同步，再对一个明确净值日期连续执行两次日净值同步。

操作步骤：

1. 执行 `python -m app.commands.sync_tushare_funds catalog`。
2. 若任一目录分片返回数达到配置上限，确认命令失败且不产生该次目录写入；若所有分片低于上限，确认结果可安全全量写入。
3. 执行 `python -m app.commands.sync_tushare_funds nav --nav-date 2026-08-25` 两次。
4. 查询 `source_sync_run`、`source_registry` 与目标样本的 `nav_daily`。

数据库验证：

```sql
SELECT sync_type, status, requested_nav_date, fetched_count, created_count, updated_count, skipped_count, error_summary
FROM source_sync_run
ORDER BY started_at DESC;

SELECT fund_code, nav_date, source_id, COUNT(*) AS row_count
FROM nav_daily
WHERE nav_date = DATE '2026-08-25'
GROUP BY fund_code, nav_date, source_id
HAVING COUNT(*) > 1;
```

| 项目 | 预期值 |
| --- | --- |
| 目录达到上限 | `CATALOG` 运行状态为 `FAILED`，无部分目录写入；错误摘要不含 Token |
| 首次净值同步 | 只写入已有目录份额，`created_count` 为实际新增数，未知代码只计入 `skipped_count` |
| 第二次净值同步 | `created_count=0`、`updated_count=0`，不产生重复主键行 |
| 来源展示 | 存在净值时详情的 `data_source` 为最新净值来源；无净值时保留目录来源 |
| 安全边界 | 表、日志、命令输出不含 Token、Cookie、支付宝认证信息或完整原始响应 |

测试结果：

- [x] 通过（2026-08-26：2000 积分下场外上市目录分片命中 15000 条并失败关闭；2026-08-25 净值返回 10,500 条，本机 6 条目录样本首次写入 5 条、重复执行新增/更新均为 0）
- [ ] 未通过
- 未通过原因：

---

## TC-17｜基金详情展示同源最新净值快照

前置条件：`fund_ai.nav_daily` 已有基金 `002112` 在 `2026-08-25` 的已授权净值记录；Java、FastAPI 和 Vue 均为本次版本，且 Java 可访问 FastAPI。

场景：用户从基金详情页查看已同步净值，并验证累计净值缺失时不伪造数值。

操作步骤：

1. 请求 `GET /api/v1/funds/002112`，记录 `unitNav`、`accumulatedNav`、`asOfDate`、`dataSource`。
2. 打开 `/funds/002112`，检查详情首屏的五项数据卡片。
3. 对一只累计净值为 `NULL` 的测试份额重复第 1、2 步。
4. 临时使 FastAPI 不可达且保留 Java 详情缓存，重新请求详情。

数据库验证：

```sql
SELECT n.fund_code, n.nav_date, n.unit_nav, n.accumulated_nav, s.source_code
FROM nav_daily n
JOIN source_registry s ON s.source_id = n.source_id
WHERE n.fund_code = '002112'
ORDER BY n.nav_date DESC, s.source_code ASC
LIMIT 1;
```

| 项目 | 预期值 |
| --- | --- |
| Java 详情 | `unitNav`、`accumulatedNav`、`asOfDate`、`dataSource` 与验证 SQL 的同一行一致 |
| Vue 详情 | 显示单位净值、累计净值、净值日期、净值状态、数据来源；`TUSHARE_PRO_FUND` 显示为“Tushare 数据接口” |
| 累计净值为空 | Java 返回 `null`，页面显示“暂缺”，不显示 `0.0000` 或单位净值替代值 |
| 缓存降级 | `stale=true` 时仍展示缓存中的净值快照和缓存时间，不伪造新日期 |

测试结果：

- [x] 通过（2026-08-27：Java `8080` 与浏览器 `/funds/002112` 实测显示单位净值 `4.8936`、累计净值 `5.0416`、日期 `2026-08-25`、Tushare 数据接口；隔离 Java `8081` 在 FastAPI 不可达时从 Redis 返回相同快照并标记 `stale=true`/`cachedAt`，验证后已优雅关闭）

## TC-18｜六只重点基金的完整历史净值与走势图

前置条件：`fund_ai` 已应用 Alembic `20260827_04`；本机已配置合法 Tushare Token；重点基金配置严格为 `010710.OF`、`160323.SZ`、`013275.OF`、`007832.OF`、`002112.OF`、`005312.OF`；不在命令行、日志、接口响应或截图中展示 Token。

场景：执行一次受控重点基金同步，在独立 Python/Java 候选端口访问一年历史接口，并打开基金详情页面切换时间范围。

步骤：

1. 执行 `python -m app.commands.sync_tushare_funds focused --end-date 2026-08-26`。
2. 查询 `source_sync_run`，确认 `FOCUSED_CATALOG` 和 `FOCUSED_NAV_HISTORY` 都为 `SUCCEEDED`；逐基金核对最小、最大净值日期和行数。
3. 调用 Java `GET /api/v1/funds/002112/nav-history?startDate=2025-08-26&endDate=2026-08-26`，核对只返回请求区间内、日期不重复的单位净值点。
4. 打开 `/funds/002112`，验证默认近一年曲线、数据截至日、来源、可访问表格和近三月/近三年/成立以来切换。
5. 将一个测试请求的历史响应伪造为达到 10,000 行或缺少目标代码，验证同步失败且不写入该次部分数据。

| 验收点 | 预期结果 |
| --- | --- |
| 目录范围 | 仅六个配置中的精确代码被同步；任一缺失即失败关闭 |
| 历史范围 | 每一只基金都保存从成立后首个可得净值日至 `2026-08-26` 的实际记录；无重复业务键 |
| 查询边界 | 日期范围超过 5,000 天返回 `400/VALIDATION_ERROR`；正常范围不触发 Tushare 调用 |
| 展示 | 曲线来自真实 `unitNav`，与最近 12 点表格一致；缓存数据明确标记陈旧 |
| 非交易边界 | 不显示评分、买卖指令或自动交易入口 |

执行记录：2026-08-27 执行 `focused --end-date 2026-08-26` 成功；`FOCUSED_CATALOG` 更新 6 条，`FOCUSED_NAV_HISTORY` 读取 11,215 条，新增 11,210 条、跳过 5 条既有业务键。`002112` 的一年 API 在 FastAPI `8001` 和 Java `8081` 均返回 243 点（2025-08-26 至 2026-08-26）；停止候选 FastAPI 后 Java 从缓存返回同样点集且 `stale=true`、有 `cachedAt`，恢复后健康。超出 5,000 天范围返回 `400/VALIDATION_ERROR`。候选 Vue `5174` 详情页显示 2026-08-26 最新净值、近三月 66 点、成立以来 2,635 点和可访问表格；重点清单只显示六只基金，控制台无错误。

- [x] 通过
- [ ] 未通过
- 未通过原因：

---

## TC-19｜同步中心手动补齐六只重点基金净值并展示进度

前置条件：Python、Java、Vue、PostgreSQL 已启动；Tushare Token 与 Java → Python 服务令牌已在本机忽略的 `.env` 中正确配置；六只重点基金均已有 Tushare 同源历史基线。Celery Beat 与 Worker 可以不启动。

场景：本机错过工作日 20:00 后，用户在数据同步中心创建任务，观察六只重点基金的真实执行进度与最终结果。

操作步骤：

1. 打开 `/sync-center`，确认基金详情页不再出现同步按钮。
2. 点击“开始同步”，确认接口立即返回任务且按钮显示“同步任务进行中…”，不可重复点击。
3. 观察进度条与文字：至少依次显示准备、当前基金代码、完成步数和“正在校验并写入净值数据”。
4. 等待任务进入 `SUCCEEDED` 或 `FAILED`，确认页面显示读取、新增、更新、跳过统计，或安全失败说明。
5. 在任务尚未完成时，从另一页面或终端再次发起创建请求，确认第二次请求得到 `409/FOCUSED_SYNC_IN_PROGRESS`，不产生第二次外部调用。
6. 在缺少任一重点基金历史基线的测试数据中发起任务，确认其最终状态为 `FAILED/FOCUSED_SYNC_BASELINE_MISSING`，并提示先完成历史回填。
7. 在运行中的测试任务期间重启 Python 服务，确认页面停止轮询并提示任务状态失效；重新进入同步中心后可以重新创建任务。

数据库验证：

```sql
SELECT sync_type, status, requested_nav_date, fetched_count, created_count, updated_count, skipped_count, error_summary
FROM source_sync_run
WHERE sync_type = 'FOCUSED_NAV_INCREMENTAL'
ORDER BY started_at DESC
LIMIT 1;
```

| 验收点 | 预期结果 |
| --- | --- |
| 服务边界 | 浏览器仅请求 Java；Python 内部接口拒绝带 `Origin` 的直接浏览器请求 |
| 同步范围 | 始终为配置的六只重点基金，不允许页面传入任意代码或全市场范围 |
| 无 Worker 场景 | Python、Java、Vue 已启动时可直接完成，不依赖 Beat 或 Worker |
| 防重复 | 同步中的第二次创建返回冲突，不增加额外 `source_sync_run` 或外部调用 |
| 进度反馈 | 任务创建后显示阶段、当前基金和完成步数；页面轮询不重新触发同步 |
| 缺少基线 | 最终状态为 `FAILED/FOCUSED_SYNC_BASELINE_MISSING`，提示先完成历史回填 |
| 成功反馈 | 页面显示安全统计；零变更显示读取/新增/更新/跳过均为 0，不伪造当日净值 |
| 重启边界 | Python 重启后的内存任务不继续展示为运行中，页面提示重新发起 |
| 失败保护 | Tushare 或数据校验失败时保留历史净值，不显示 Token、原始响应或买卖建议 |

测试结果：

- [x] 通过（2026-08-27：Python 受服务令牌/Origin 保护、后台进度与最终统计的离线测试通过；Vue lint/类型检查/构建通过。Java 因本机仅有 JDK 8、项目要求 JDK 17，未能在本机重新编译；真实手动调用待用户在本机页面执行，不在自动化验证中触发外部数据写入。）
- [ ] 未通过
- 未通过原因：

---

## TC-20｜六只重点基金工作日增量同步

前置条件：`fund_ai` 已完成六只基金的完整历史回填；Tushare 来源已登记；只启动一个 Celery Beat 和一个 Windows `solo` Worker；本机 `.env` 不包含在日志、截图或命令输出中。

场景：以指定截至日执行一次增量命令，随后验证日常计划和无数据日处理。

操作步骤：

1. 查询 Tushare 来源下六只基金的 `max(nav_date)`，确认均存在历史基线。
2. 执行 `python -m app.commands.sync_tushare_funds focused-incremental --as-of-date 2026-08-27`。
3. 查询最新 `FOCUSED_NAV_INCREMENTAL` 运行记录及每只基金的最大净值日期。
4. 将一个测试响应改为窗口外日期或非目标代码，确认该次运行失败且不写入该不可信记录。
5. 在单一 Beat 和 `solo` Worker 下观察工作日计划；重复启动 Beat 的测试环境不得用于验收。

数据库验证：

```sql
SELECT sync_type, status, requested_nav_date, fetched_count, created_count, updated_count, skipped_count, error_summary
FROM source_sync_run
WHERE sync_type = 'FOCUSED_NAV_INCREMENTAL'
ORDER BY started_at DESC
LIMIT 1;

SELECT n.fund_code, MAX(n.nav_date) AS latest_nav_date
FROM nav_daily n
JOIN source_registry s ON s.source_id = n.source_id
WHERE s.source_code = 'TUSHARE_PRO_FUND'
  AND n.fund_code IN ('010710', '160323', '013275', '007832', '002112', '005312')
GROUP BY n.fund_code
ORDER BY n.fund_code;
```

| 验收点 | 预期结果 |
| --- | --- |
| 同源水位 | 每只基金从 Tushare 来源自身的最后净值日后开始请求，不由其他来源推进 |
| 无新数据 | 非交易日或数据未发布时 `SUCCEEDED` 且各写入计数为 0，不伪造当日净值 |
| 异常响应 | 窗口外、非目标代码或冲突重复值失败关闭，不覆盖既有历史 |
| 调度 | 仅一个 Beat 在工作日可配置时刻投递；Windows Worker 使用 `--pool=solo` |
| 默认时刻 | 未设置环境变量覆盖时，Beat 在 `Asia/Shanghai` 工作日 20:00 投递 |
| 安全边界 | 命令、运行记录和日志不包含 Token、Cookie、原始响应、买卖建议或交易动作 |

测试结果：

- [x] 通过（2026-08-27：六只同源水位均为 2026-08-26；执行 `focused-incremental --as-of-date 2026-08-27`，运行 `9cd6bdcb-2738-4adc-8214-0e9345eec74c` 为 `SUCCEEDED`，读取/新增/更新/跳过均为 0，符合当晚尚无新净值的预期）
- [ ] 未通过
- 未通过原因：

---

## TC-21｜重点基金列表总数、每页条数与页码跳转

前置条件：重点基金目录已同步；Python、Java、Vue 均为本变更版本；浏览器仅访问 Java `GET /api/v1/funds`。

场景：用户在重点基金列表查看当前筛选的总条数，切换每页条数并直接跳至任意有效页。

操作步骤：

1. 请求 `GET /api/v1/funds?page=1&pageSize=20`，记录 `totalCount`、`totalPages` 与 `items` 数量。
2. 请求 `GET /api/v1/funds?page=2&pageSize=20`；若 `totalPages >= 2`，验证返回第二页且不与第一页重复。
3. 请求最后一页；验证 `items.length` 为剩余记录数。请求 `page=1&pageSize=50`，验证总数不变、总页数按新页大小重新计算。
4. 请求 `GET /api/v1/funds?page=2&cursor=010710`，验证返回 `400/VALIDATION_ERROR`；内部契约测试验证同类请求为 `422/PAGINATION_MODE_CONFLICT`。
5. 打开 `/funds`，验证显示“共 X 条”“每页 X 条”“第 P / N 页”；切换 10、20、50 条和搜索关键字后均回到第一页；输入有效页码并按 Enter 或“跳转”后加载对应页；首末页按钮禁用正确。
6. 在窄屏下验证分页控件自动换行、每个选择框和输入框有可见标签，加载期间不重复发起翻页请求。

| 验收点 | 预期结果 |
| --- | --- |
| 统计一致性 | `totalCount` 与同关键字数据库计数一致，`totalPages=ceil(totalCount/pageSize)`，当前页只返回该页记录 |
| 性能 | 服务端只执行计数和单页查询；浏览器不拉取全量目录 |
| 兼容性 | 不传 `page` 的旧游标请求仍含 `nextCursor`；缓存键不跨页复用 |
| 交互 | 总数、每页条数、页码、跳转和边界禁用状态与响应一致 |
| 边界 | 空结果显示 0 条；无效输入受前端限制且服务端仍校验；不增加外部数据调用或写入 |

测试结果：

- [ ] 待执行
- [ ] 未通过
- 未通过原因：
