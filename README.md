# 全市场基金雷达前端

当前已提供基金市场、基金详情、本机单用户关注和 `/portfolio` 持仓快照页。前端只调用 Java 核心服务的 `/api/v1/*`，不直接访问 FastAPI AI 服务，也不保存外部数据源或支付凭证。

当前 `fund_ai` 已有 6 条一次性手工核验的真实基金目录/份额样本；它们不是全市场同步，且尚未获权写入日净值。`/portfolio` 只展示用户确认并本机入库的截图字段；若截图未显示日期、份额或成本，页面会显著标注为未知/非实时，且不提供支付宝登录、上传、交易或投资建议。

## 本地启动

1. 本项目已配置本地 `.env`；留空时由 Vite 将 `/api` 代理到 `http://localhost:8080`。部署环境可显式设置 `VITE_API_BASE_URL`。
2. 执行 `npm install`。
3. 执行 `npm run dev`，浏览器打开 Vite 输出的地址。

## 质量检查

```powershell
npm run lint
npm run type-check
npm run build
```

关联文档：

- `docs_zhx/requirements/fund-radar.md`
- `docs_zhx/implementation/fund-radar.md`
