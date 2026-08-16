# 在线简历平台

按 PRD v1.5 初始化的 MVP 工程。用户可以创建、编辑、发布并分享专业简历，每份简历拥有唯一 URL。

仓库：https://github.com/TyrionXu-016/online-resume

## 技术栈

- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase PostgreSQL + Drizzle
- Supabase Auth
- Cloudflare R2
- Vitest + Playwright

## 本地开发

```bash
cp .env.example .env.local
npm install
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

## 常用命令

```bash
npm run lint
npm run test
npm run build
npm run db:generate
npm run db:migrate
```

## 目录

```
src/
  app/         路由：营销页、认证、工作台、编辑器、公开页、API
  modules/     业务服务
  db/          Drizzle schema
  lib/         Supabase / R2 / 校验 / 错误码
  components/  共享 UI
```

当前是工程基线：路由、数据模型和 API 契约已铺好，认证、编辑器和发布流程尚未实现。
