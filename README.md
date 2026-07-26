# 光迹学习健康中心

基于 Next.js App Router、React、MySQL 的学习与健康管理应用。页面使用 Server Component 读取数据，任务、计划与番茄钟通过 Route Handler API 更新。

## 本地运行

无需数据库也可以使用演示数据启动：

```powershell
npm install
npm run dev
```

访问 `http://localhost:3000`，根路由会跳转到 `/dashboard`。

## 连接 MySQL

1. 复制 `.env.example` 为 `.env.local`。
2. 使用已有 MySQL 执行 `database/schema.sql` 和 `database/seed.sql`，或者启动 Docker：

```powershell
docker compose up -d mysql
```

3. 重新启动 `npm run dev`。
4. 访问 `http://localhost:3000/api/healthz`，`database` 为 `connected` 即连接成功。

数据库连接集中在 `src/lib/db.ts`。可修改 `DATABASE_URL`，也可以使用 `DB_HOST`、`DB_PORT`、`DB_USER`、`DB_PASSWORD`、`DB_NAME` 分项配置。

## 页面路由

- `/login`：登录与注册界面
- `/dashboard`：综合总览
- `/study-records`：学习时长和计划完成度
- `/health-trends`：健康指标与异常事件
- `/goals`：学习计划与番茄钟

## 后端接口

- `GET /api/study/summary`
- `GET /api/plans/active`
- `PUT /api/plans/:id`
- `PATCH /api/tasks/:id`
- `GET /api/health/overview`
- `POST /api/pomodoro/sessions`
- `PATCH /api/pomodoro/sessions/:id`
- `GET /api/healthz`
- `GET /api/desk-light?userId=1`
- `GET /api/monitoring/readings?userId=1`
- `POST /api/monitoring/readings` (single reading object or `{ userId, records: [...] }` batch payload)
- `POST /api/monitoring/readings?user_id=1&posture_status=1&seat_status=0&ambient_light_lux=800` (device compatibility; accepts all monitoring fields in `snake_case`)

## 验证与生产运行

```powershell
npm run lint
npm run build
npm run start
```

当前使用演示用户 `id = 1` 关联页面数据。正式部署前应接入真实认证，并从服务端会话中获取用户 ID。
