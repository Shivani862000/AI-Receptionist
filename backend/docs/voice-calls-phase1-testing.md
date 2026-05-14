# Voice Calls Phase 1 Testing

## Run locally

```bash
cd backend
corepack pnpm prisma:generate
./node_modules/.bin/prisma db push
corepack pnpm prisma:seed
corepack pnpm dev
```

API docs:

- `http://localhost:4000/api/docs`

## Login first

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@clinic.com",
    "password": "password123"
  }'
```

Use the returned bearer token for protected routes.

## Create outgoing call

```bash
curl -X POST http://localhost:4000/api/v1/voice-calls/outgoing \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Rohit Arora",
    "customerPhone": "+919999000111"
  }'
```

## Simulate incoming webhook

```bash
curl -X POST http://localhost:4000/api/v1/webhooks/call/incoming \
  -H "Content-Type: application/json" \
  -d '{
    "callSid": "CALL123",
    "from": "+919999999999",
    "to": "+911140001122",
    "customerName": "Neha Shah",
    "status": "ringing"
  }'
```

## Simulate status webhook

```bash
curl -X POST http://localhost:4000/api/v1/webhooks/call/status \
  -H "Content-Type: application/json" \
  -d '{
    "callSid": "CALL123",
    "from": "+919999999999",
    "to": "+911140001122",
    "status": "in_progress",
    "duration": 45
  }'
```

## Simulate completed webhook

This triggers:

1. voice call update
2. transcript generation
3. AI summary generation
4. recording metadata save

```bash
curl -X POST http://localhost:4000/api/v1/webhooks/call/completed \
  -H "Content-Type: application/json" \
  -d '{
    "callSid": "CALL123",
    "from": "+919999999999",
    "to": "+911140001122",
    "status": "completed",
    "duration": 120
  }'
```

## Check generated call data

```bash
curl -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:4000/api/v1/voice-calls?page=1&limit=10"
```

```bash
curl -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:4000/api/v1/transcripts/<CALL_ID>"
```

```bash
curl -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:4000/api/v1/ai-summary/<CALL_ID>"
```

```bash
curl -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:4000/api/v1/recordings/<CALL_ID>"
```

## Suggested Postman flow

1. Login
2. Create outgoing call
3. Trigger incoming or completed webhook
4. Open voice call detail
5. Open transcript
6. Open AI summary
7. Open recording metadata
8. Check dashboard stats
