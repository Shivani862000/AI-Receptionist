# AI Receptionist Monorepo

This workspace is now split cleanly into two apps:

- `frontend/` - Next.js frontend POC
- `backend/` - NestJS Phase 1 backend
- `deployment/` - Docker, Nginx, PM2, backup, and VPS deployment assets

## Local development

```bash
cd backend
cp .env.development .env
corepack pnpm install
corepack pnpm start:dev
```

```bash
cd frontend
cp .env.development .env.local
corepack pnpm install
corepack pnpm dev
```

Frontend now uses a fixed local port:

- Frontend: `http://localhost:3001`
- Backend: `http://localhost:4000`
- Swagger: `http://localhost:4000/api/docs`

## Demo day commands

From the repo root:

```bash
npm run demo:start
```

Starts backend and frontend on their fixed ports and writes logs to `.demo/logs/`.

```bash
npm run demo:verify
```

Runs the API smoke test, realtime websocket smoke test, and the full Step 12 demo-readiness suite against the fixed local URLs.

```bash
npm run demo:ready
```

Runs the automated start-and-verify flow for demo day.

```bash
npm run demo:mode
```

Seeds realistic demo data, starts backend and frontend, then runs the full verification suite.

```bash
npm run demo:stop
```

Stops the backend and frontend started by the demo scripts.

## Docker development

```bash
docker compose up --build
```

Optional local helpers:

```bash
docker compose --profile optional up --build
```

## Production prep

- Health endpoint: `http://localhost:4000/health`
- Swagger: `http://localhost:4000/api/docs`
- Deployment guide: `deployment/README.md`
- Backend production architecture notes: `backend/docs/production-architecture-phase1.md`
- Realtime conversation guide: `backend/docs/realtime-conversation-phase1-testing.md`
- Demo runbook: `backend/docs/local-demo-runbook-step12.md`
- Frontend QA scenarios: `frontend/tests/frontend-qa-scenarios.md`
