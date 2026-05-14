# Local Demo Runbook

## 1. Start the database

If using Docker:

```bash
docker compose up -d postgres
```

If using local PostgreSQL:

- confirm the DB is running on `localhost:5432`

## 2. Run migrations and generate Prisma client

```bash
cd backend
corepack pnpm prisma:generate
corepack pnpm prisma:deploy
```

## 3. Seed realistic demo data

```bash
cd backend
corepack pnpm prisma:seed
```

## 4. Start backend

```bash
cd backend
corepack pnpm start:dev
```

## 5. Start frontend

```bash
cd frontend
corepack pnpm dev
```

Frontend fixed local URL:

`http://localhost:3001`

## 6. Test APIs

```bash
cd backend
npm run smoke:test
```

## 7. Run websocket demo check

```bash
cd backend
npm run smoke:realtime
```

## 8. Run full demo readiness check

```bash
cd backend
npm run qa:demo
```

## 9. Open local URLs

- frontend: `http://localhost:3001`
- backend swagger: `http://localhost:4000/api/docs`
- health: `http://localhost:4000/health`

## 10. If something breaks

- reseed the database
- restart backend
- restart frontend
- switch to the fallback demo plan in `docs/demo-fallback-plan-step12.md`

## 11. Repo root shortcuts

From the repo root:

```bash
npm run demo:start
```

Starts backend and frontend on fixed ports and stores runtime files under `.demo/`.

```bash
npm run demo:verify
```

Runs the automated demo verification flow.

```bash
npm run demo:ready
```

Starts both apps and verifies the full Step 12 suite.

```bash
npm run demo:mode
```

Seeds realistic demo data, starts both apps, and runs all demo checks.

```bash
npm run demo:stop
```

Stops the services started by the demo launcher.
