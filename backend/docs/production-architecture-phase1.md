# Step 10: Production Architecture and Deployment

## What this step adds

- Dockerfiles for frontend and backend
- root `docker-compose.yml` with PostgreSQL and optional Redis/pgAdmin
- production hardening in NestJS
- Winston file logging
- `GET /health`
- static uploads folder lifecycle
- future queue and event boundary scaffolding
- VPS deployment assets for Nginx, PM2, backups, and log rotation

## Local development

Backend:

```bash
cd backend
cp .env.development .env
corepack pnpm install
corepack pnpm prisma:generate
corepack pnpm prisma:deploy
corepack pnpm prisma:seed
corepack pnpm start:dev
```

Frontend:

```bash
cd frontend
cp .env.development .env.local
corepack pnpm install
corepack pnpm dev
```

## Docker development

```bash
docker compose up --build
```

Services:

- frontend: `http://localhost:3001`
- backend: `http://localhost:4000`
- health: `http://localhost:4000/health`
- swagger: `http://localhost:4000/api/docs`
- postgres: `localhost:5432`

Optional helpers:

```bash
docker compose --profile optional up --build
```

This also starts:

- redis: `localhost:6379`
- pgAdmin: `http://localhost:5050`

## Production build commands

Backend:

```bash
cd backend
cp .env.production .env
corepack pnpm install --frozen-lockfile
corepack pnpm prisma:generate
corepack pnpm prisma:deploy
corepack pnpm build
corepack pnpm start
```

Frontend:

```bash
cd frontend
cp .env.production .env.local
corepack pnpm install --frozen-lockfile
corepack pnpm build
corepack pnpm start -p 3001
```

## Operational notes

- Logs are written to `backend/logs/app.log` and `backend/logs/error.log`
- uploads live under `backend/uploads/*`
- temp uploads are cleaned daily at 3 AM server time
- health checks report DB status, uptime, request counts, and latency snapshot

## Queue preparation

Code-level queue prep lives under:

- `src/common/queues`
- `src/common/events`

Today it uses an in-memory dispatcher so the monolith stays simple. This keeps the async job contract ready for BullMQ later without forcing Redis right now.
