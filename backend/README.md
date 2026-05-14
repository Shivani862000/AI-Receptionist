# AI Receptionist Backend

NestJS backend foundation for the AI Receptionist Phase 1 POC.

## Stack

- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT auth
- class-validator
- Swagger / OpenAPI

## Local URLs

- Frontend: `http://localhost:3001`
- Backend: `http://localhost:4000`
- Swagger: `http://localhost:4000/api/docs`

## Project Creation Commands

If you were creating this backend from scratch, the setup flow would be:

```bash
npx @nestjs/cli new backend
cd backend
pnpm add @nestjs/config @nestjs/jwt @nestjs/passport @nestjs/swagger @prisma/client class-validator class-transformer passport passport-jwt bcrypt reflect-metadata rxjs
pnpm add -D prisma ts-node @types/passport-jwt @types/bcrypt
npx prisma init
```

## Folder Structure

```text
src/
  common/
    decorators/
    dto/
    entities/
    exceptions/
    filters/
    guards/
    interceptors/
    types/
    utils/
  config/
  prisma/
  modules/
    auth/
    users/
    business/
    clients/
    services/
    voice-calls/
    text-messages/
    automations/
    reports/
    dashboard/
    activities/
```

## Environment Setup

```bash
cp .env.example .env
```

`.env.example` includes:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `PORT`
- `FRONTEND_URL`
- `CORS_ORIGINS`
- `RATE_LIMIT_TTL_MS`
- `RATE_LIMIT_LIMIT`
- `LOG_LEVEL`
- `UPLOAD_MAX_FILE_SIZE_MB`
- `TEMP_FILE_TTL_HOURS`
- `GEMINI_API_KEY`
- `DEEPGRAM_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `SMTP_HOST`

## Local PostgreSQL

Optional Docker setup:

```bash
docker compose up -d
```

This starts:

- PostgreSQL on `localhost:5432`
- backend on `localhost:4000`
- frontend on `localhost:3001`

## Prisma Commands

Generate Prisma client:

```bash
pnpm prisma:generate
```

Create a local migration:

```bash
pnpm prisma:migrate --name init
```

Deploy migrations:

```bash
pnpm prisma:deploy
```

Run seed:

```bash
pnpm prisma:seed
```

Open Prisma Studio:

```bash
pnpm prisma:studio
```

## Run Backend

Install dependencies:

```bash
pnpm install
```

Generate Prisma client and run migrations:

```bash
pnpm prisma:generate
pnpm prisma:migrate --name init
pnpm prisma:seed
```

Run dev server:

```bash
pnpm start:dev
```

Build:

```bash
pnpm build
```

Start production build:

```bash
pnpm start
```

## Smoke Testing

Run the reusable local API smoke test:

```bash
npm run smoke:test
```

Run the realtime websocket smoke test:

```bash
npm run smoke:realtime
```

Run the full demo-readiness suite:

```bash
npm run qa:demo
```

Optional overrides:

```bash
BASE_URL=http://localhost:4000/api/v1 \
FRONTEND_URL=http://localhost:3001 \
SMOKE_TEST_EMAIL=owner@clinic.com \
SMOKE_TEST_PASSWORD=password123 \
npm run smoke:test
```

If the seeded user is unavailable, auto-register a fallback smoke user:

```bash
SMOKE_TEST_AUTO_REGISTER=true npm run smoke:test
```

Related local testing assets:

- Postman collection: `postman/ai-receptionist-local.postman_collection.json`
- Demo-readiness Postman collection: `postman/ai-receptionist-demo-readiness.postman_collection.json`
- QA checklist: `docs/local-qa-checklist.md`
- Voice pipeline examples: `docs/voice-calls-phase1-testing.md`
- Text communication examples: `docs/text-communications-phase1-testing.md`
- Automation engine examples: `docs/automation-engine-phase1-testing.md`
- Reports and analytics examples: `docs/reports-analytics-phase1-testing.md`
- Real AI provider examples: `docs/real-ai-providers-phase1-testing.md`
- Production architecture and deployment: `docs/production-architecture-phase1.md`
- Realtime conversation streaming: `docs/realtime-conversation-phase1-testing.md`
- Step 12 test strategy: `docs/test-strategy-step12.md`
- Step 12 demo script: `docs/demo-script-step12.md`
- Step 12 fallback plan: `docs/demo-fallback-plan-step12.md`
- Step 12 local runbook: `docs/local-demo-runbook-step12.md`
- Step 12 bug checklist: `docs/bug-checklist-step12.md`

## Auth Notes

Implemented for local POC:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

JWT bearer auth is enabled for protected routes.

## Implemented Modules

- Auth
- Users
- Business
- Clients
- Services
- Messages
- WhatsApp
- SMS
- Email
- Templates
- Conversations
- AI Reply
- AI
- STT
- TTS
- Twilio
- Automation Logs
- Reminders
- Scheduler
- AI Automation
- Voice Calls
- Text Messages
- Automations
- Dashboard
- Reports
- Activities

## Architectural Notes

- Global API prefix: `/api/v1`
- Health endpoint: `/health`
- Swagger is mounted at `/api/docs`
- ValidationPipe is global
- CORS is environment-driven and production-safe
- Helmet, compression, request sanitization, and rate limiting are enabled
- Winston logs are written to `logs/app.log` and `logs/error.log`
- Prisma is isolated in `src/prisma`
- Common layer is separated for later microservice extraction
- Step 7 automation scans run with `@nestjs/schedule` cron jobs for local reminder processing and retry handling
- Step 8 report exports are written to `uploads/reports` and served locally from `/uploads`
- Step 9 adds Gemini, Deepgram, Twilio, and SMTP-capable provider abstractions with local fallback behavior when credentials are not configured
- Step 10 adds Dockerfiles, compose setup, VPS deployment assets, upload lifecycle management, and queue/event abstractions for future BullMQ extraction
- Step 11 adds a Socket.IO live conversation gateway, browser live-agent UI, Twilio media stream bridge, in-memory session management, and realtime transcript plus TTS streaming
- Step 12 adds richer demo seed data, realtime smoke coverage, client demo assets, QA docs, and a demo-readiness command flow

## Step 4 Modules

Fully implemented with Prisma-backed CRUD and JWT auth:

- Auth
- Business
- Clients
- Services

Auth routes:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

Business routes:

- `POST /api/v1/business`
- `GET /api/v1/business`
- `GET /api/v1/business/:id`
- `PATCH /api/v1/business/:id`
- `DELETE /api/v1/business/:id`

Client routes:

- `POST /api/v1/clients`
- `GET /api/v1/clients`
- `GET /api/v1/clients/:id`
- `PATCH /api/v1/clients/:id`
- `DELETE /api/v1/clients/:id`

Service routes:

- `POST /api/v1/services`
- `GET /api/v1/services`
- `GET /api/v1/services/:id`
- `PATCH /api/v1/services/:id`
- `DELETE /api/v1/services/:id`

## JWT Flow

1. Register a user:

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Riya Sharma",
    "email": "owner@clinic.com",
    "phone": "+919876543210",
    "password": "password123"
  }'
```

2. Login:

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@clinic.com",
    "password": "password123"
  }'
```

3. Copy `data.accessToken` from the login response and call protected APIs:

```bash
curl http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Example Requests

Create business:

```bash
curl -X POST http://localhost:4000/api/v1/business \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Nova Skin Studio",
    "ownerName": "Riya Sharma",
    "phone": "+911140001122",
    "email": "hello@novaskin.com",
    "address": "Delhi, India",
    "logoUrl": "https://cdn.example.com/logo.png"
  }'
```

Create client:

```bash
curl -X POST http://localhost:4000/api/v1/clients \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Priya Mehra",
    "gender": "female",
    "phone": "+919876511220",
    "whatsapp": "+919876511220",
    "email": "priya@example.com",
    "preferredContactMode": "whatsapp",
    "preferredContactTime": "18:00-20:00",
    "notes": "Prefers concise updates"
  }'
```

Create service:

```bash
curl -X POST http://localhost:4000/api/v1/services \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "Dermatology Consultation",
    "serviceCode": "DERM-001",
    "description": "Initial consultation",
    "price": 1500,
    "duration": 30,
    "isActive": true
  }'
```

## Example Responses

Login response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clx123",
      "fullName": "Riya Sharma",
      "email": "owner@clinic.com",
      "phone": "+919876543210",
      "businessId": "biz123",
      "role": "owner"
    }
  }
}
```

Paginated clients response:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "items": [
      {
        "id": "clt123",
        "fullName": "Priya Mehra",
        "phone": "+919876511220",
        "email": "priya@example.com"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

## Future Split Guidance

Likely service boundaries later:

- auth-service
- crm-service
- communications-service
- automation-service
- reporting-service
- activity-service
