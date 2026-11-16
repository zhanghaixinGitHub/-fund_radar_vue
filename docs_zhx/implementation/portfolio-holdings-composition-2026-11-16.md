# 持仓构成实施记录：实际资产、股票行业与主题分布

记录日期：2026-11-16。

需求见[持仓构成需求与设计](../requirements/portfolio-holdings-composition-2026-11-16.md)。本记录区分已编码、隔离测试与真实账户验收，不用测试数据冒充本人页面结果。

## 实现范围

- Python新增 `/internal/v1/funds/composition` 公共只读批量接口，只接收基金代码，不接收用户、账户或金额。分别选择最近可核验的资产配置、行业和个股报告；保留报告来源、日期和披露范围。
- Java新增本人 `GET /api/v1/sim-portfolios/current/composition`，沿用 `PORTFOLIO_SELF_READ`。当前正份额模拟持仓与总览已纳入的确认金额在Java内合并加权，待确认订单和零金额清仓不纳入。
- 实际资产按账户持有金额统计，缺资产配置进入“待补充”；行业仅以可确定股票金额为统计基数，不使用总资产权重代替净资产行业权重。
- 主题按已披露个股权重独立汇总，允许多主题和合计超过100%；不把未映射股票归为零主题。ETF联接仅使用已核验 `exposure_chain`、目标名称匹配和有效持有比例展开，避免直接与底层重复计算。
- 前端在总览增加一个“持仓构成”区块，包含“实际资产、股票行业、主题分布”三个文字页签。图表均有文字金额和比例，分类可打开右侧来源抽屉；行业默认前五项，其余可展开。
- 主题首版登记芯片、通信、石油、食品、游戏五类，证券对应来源、方法和核验日期保存在 `03-python/app/data/fund_security_themes_v1.json`。未登记证券明确保留为未映射，后续可继续补充，不宣称已覆盖全部主题或全部股票。

## 主要文件

- `03-python/app/services/fund_composition.py`：公共报告选择、资产归并、主题映射和已核验底层展开。
- `03-python/app/data/fund_security_themes_v1.json`：主题定义与逐证券来源。
- `02-java/src/main/java/com/fundradar/core/simulation/SimulationCompositionService.java`：本人金额、覆盖率和三项汇总。
- `02-java/src/main/java/com/fundradar/core/simulation/SimulationCompositionController.java`：本人只读入口。
- `01-vue/src/components/PortfolioComposition.vue`：三视图、覆盖率、待补充和页签。
- `01-vue/src/components/CompositionSourceDrawer.vue`：分类来源、主题依据和逐基金报告。
- `01-vue/src/styles/portfolio-composition.css`：公共图表变量、响应式条形图与抽屉样式。

## 隔离验证

- Python `tests/test_fund_composition.py`：6项通过，覆盖最近可用报告、不同分母、无效资产合计、ETF有效权重、证券身份、重复代码和服务令牌。
- Python相邻 `tests/test_fund_materials.py` 与新增检查合计：15项通过。仅有测试客户端依赖的既有弃用提醒。
- Java `SimulationCompositionServiceTests`：3项通过，覆盖本人及确认金额合并、零份额排除、未知金额、行业分母、主题重叠、来源贡献合并、空账户、未登录和无权限。
- 前端 `tests/portfolioComposition.test.mjs`：3项通过，覆盖三视图、待补充、行业展开、主题重叠、来源入口和页签条件保留。
- 前端相邻 `portfolioList`、`holdingManagementDrawer` 与新增检查合计：12项通过。
- 前端定向 ESLint 和 `vue-tsc --noEmit` 通过；统一入口 `dev.ps1 Build` 的Java打包与前端生产构建通过。
- Python定向 Ruff 检查在修正测试文件换行和导入顺序后通过。

## 真实服务验收

- 三端通过统一入口构建并重启，运行与健康检查通过。真实公共批量接口对当前29只正份额基金逐只读取均返回200；接口只返回公共资料，不接收账户金额。
- 首次真实账户汇总发现29只基金冷读取超过Java默认5秒。已将账户级批量读取改用项目已有的60秒批量通道，重新构建部署后通过；没有把超时降级成空图或假数据。
- 使用真实数据库、真实Python接口和只读事务完成Java汇总检查。当前结果：资产配置覆盖账户金额87.803871%，行业资料覆盖68.912685%，有个股明细的账户金额覆盖87.387281%，其中已核验主题对应覆盖33.211805%。返回主题包括芯片、通信、食品、游戏、石油。临时实时检查源码、编译类和报告已删除，不纳入常规测试。
- 使用同一正式Vue组件进行隔离视觉检查：1280桌面下实际资产、股票行业、主题分布和来源抽屉显示正常；390px设备宽度下三种视图无页面横向溢出，文字和条形正常换行。桌面鼠标点击、来源抽屉Esc关闭和页签左右方向键通过。
- 预览使用合成展示数据，不冒充本人登录页面。内置浏览器无现有登录态，因此本人登录后的完整总览尚未验收；设备模拟模式下Vue点击未触发，恢复桌面后同一操作正常，真实触屏手势保留待验收。

P16当前为“功能已实现，真实数据与桌面组件通过；登录整页和真实触屏待验收”，不标记全部完成。

## 2026-11-16 条形图与页签滚动修订

- 按用户反馈，实际资产取消单条堆叠图，改为与行业、主题一致的“每个类型一行”横向条形列表，金额、比例和来源入口保持原口径。
- 定位页签置顶根因为 `useWorkspaceScroll` 把所有查询参数变化都按新页面处理。新增 `isWorkspaceLocalTabTransition`：仅同一路径、同一hash且只有 `composition` 改变时保留右侧工作区滚动位置；栏目切换、其他筛选变化、跨页面和主菜单行为不变。
- `tests/portfolioComposition.test.mjs` 增加逐行条形展示检查；`tests/workspaceScroll.test.mjs` 覆盖局部页签识别；新增 `tests/workspaceLocalTabs.test.mjs` 直接执行全局滚动监听，验证页签切换保持 `scrollTop=640`，切到持仓栏目仍置顶。
- 本轮相关11项前端测试、定向ESLint、`vue-tsc --noEmit` 和统一入口前端生产构建均通过。
