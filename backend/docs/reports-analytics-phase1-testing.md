# Reports And Analytics Phase 1 Testing

Use these examples to test the Step 8 reporting stack locally.

## Prerequisites

- Backend running at `http://localhost:4000`
- Seed data loaded with `corepack pnpm prisma:seed`
- Auth token from `POST /api/v1/auth/login`

## Core Report APIs

Overview report:

```bash
curl -sS -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:4000/api/v1/reports/overview?dateFrom=2026-05-01&dateTo=2026-05-31"
```

Calls report:

```bash
curl -sS -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:4000/api/v1/reports/calls?page=1&limit=10&dateFrom=2026-05-01&dateTo=2026-05-31"
```

Messages report:

```bash
curl -sS -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:4000/api/v1/reports/messages?page=1&limit=10"
```

Automations report:

```bash
curl -sS -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:4000/api/v1/reports/automations?page=1&limit=10"
```

Clients report:

```bash
curl -sS -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:4000/api/v1/reports/clients?page=1&limit=10"
```

## Analytics APIs

Call trends:

```bash
curl -sS -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:4000/api/v1/analytics/call-trends?groupBy=day&dateFrom=2026-05-01&dateTo=2026-05-31"
```

Message trends:

```bash
curl -sS -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:4000/api/v1/analytics/message-trends?groupBy=day"
```

Automation trends:

```bash
curl -sS -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:4000/api/v1/analytics/automation-trends?groupBy=week"
```

Sentiment trends:

```bash
curl -sS -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:4000/api/v1/analytics/sentiment-trends?groupBy=day"
```

Channel performance:

```bash
curl -sS -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:4000/api/v1/analytics/channel-performance"
```

## AI Insights APIs

```bash
curl -sS -H "Authorization: Bearer <TOKEN>" "http://localhost:4000/api/v1/ai-insights/business"
curl -sS -H "Authorization: Bearer <TOKEN>" "http://localhost:4000/api/v1/ai-insights/communication"
curl -sS -H "Authorization: Bearer <TOKEN>" "http://localhost:4000/api/v1/ai-insights/followups"
```

## PDF Export APIs

Call summary export:

```bash
curl -sS -X POST \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"callId":"<VOICE_CALL_ID>"}' \
  "http://localhost:4000/api/v1/reports/export/call-summary"
```

Client report export:

```bash
curl -sS -X POST \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"clientId":"<CLIENT_ID>"}' \
  "http://localhost:4000/api/v1/reports/export/client-report"
```

Daily summary export:

```bash
curl -sS -X POST \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"dateFrom":"2026-05-01","dateTo":"2026-05-31"}' \
  "http://localhost:4000/api/v1/reports/export/daily-summary"
```

Transcript export:

```bash
curl -sS -X POST \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"callId":"<VOICE_CALL_ID>"}' \
  "http://localhost:4000/api/v1/reports/export/transcript"
```

Generated PDFs are stored in:

- `backend/uploads/reports`
- served at `http://localhost:4000/uploads/reports/<filename>.pdf`

## Report History

```bash
curl -sS -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:4000/api/v1/report-history?page=1&limit=10"
```

## Recommended Local Flow

1. Run `npm run smoke:test`
2. Open Swagger at `http://localhost:4000/api/docs`
3. Generate one PDF from each export route
4. Open one returned `downloadUrl` in the browser
5. Confirm `GET /api/v1/report-history` shows the generated exports
