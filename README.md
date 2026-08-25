# 全市场基金雷达前端

当前已提供 M1 基础市场列表、基金详情和本机单用户关注页。前端只调用 Java 核心服务的 `/api/v1/*`，不直接访问 FastAPI AI 服务，也不保存任何外部数据源或支付凭证。基金数据仍为明确标识的 M0 Mock，未接入真实行情。

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
