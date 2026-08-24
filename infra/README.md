# 本地基础设施

此目录只启动 PostgreSQL 16 和 Redis 7；Vue、Java、FastAPI、Celery 均在各自工程内启动。PostgreSQL 首次初始化时会创建互相隔离的 `fund_core`、`fund_ai` 数据库和最小权限应用账号。

## 启动

```powershell
docker compose --env-file .env -f docker-compose.yml config
docker compose --env-file .env -f docker-compose.yml up -d
docker compose --env-file .env -f docker-compose.yml ps
```

首次启动后可用以下命令检查：

```powershell
docker compose --env-file .env -f docker-compose.yml logs --tail 100 postgres redis
```

`postgres` 数据卷仅在首次初始化时执行 `postgres/init/01-create-service-databases.sh`。如果日后需要修改数据库账号或重跑初始化，先停止并评估现有数据；不能用删除数据卷作为日常修复手段。

## 服务配置对应关系

| 服务 | 已配置的本地环境变量 |
| --- | --- |
| Java | `FUND_CORE_DB_*`、`AI_SERVICE_*`；M0 尚不连数据库 |
| FastAPI | `AI_DATABASE_URL`，格式中的账号、密码与端口必须来自本目录 `.env` |
| Celery | `CELERY_BROKER_URL`、`CELERY_RESULT_BACKEND`，使用 Redis 的不同 DB：`/1`、`/2` |

Java 缓存预留 Redis DB `/0`，Celery 消息队列和任务结果分别使用 `/1`、`/2`；进入 M1 时必须沿用此前缀隔离规则。
