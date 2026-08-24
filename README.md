# 全市场基金雷达前端

M0 只提供系统状态页。前端只调用 Java 核心服务的 `/api/v1/*`，不直接访问 FastAPI AI 服务，也不保存任何外部数据源或支付凭证。

## 本地启动

1. 本项目已配置本地 `.env`，默认连接 Java 的 `http://localhost:8080`。
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
