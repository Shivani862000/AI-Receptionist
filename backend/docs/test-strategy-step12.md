# Step 12 Test Strategy

## Goal

Make the local AI Receptionist POC stable enough for demos by combining:

- fast automated smoke checks
- realistic seeded data
- focused realtime checks
- manual UI verification

## Test layers

### Unit-style checks

For this POC, unit-style coverage is intentionally lightweight and lives in provider and service fallbacks:

- Gemini fallback behavior
- Deepgram STT fallback behavior
- Deepgram TTS fallback behavior
- Twilio and WhatsApp fallback behavior
- automation retry and pending-path logic

### Integration checks

Primary integration coverage is provided by:

- `backend/scripts/api-smoke-test.mjs`
- `backend/scripts/realtime-smoke-test.mjs`

These validate:

- auth
- CRUD modules
- communication pipelines
- automation flows
- reports and exports
- realtime monitoring routes
- websocket live-agent flow

### E2E checks

The practical E2E path for this POC is:

1. seed the local DB
2. start backend and frontend
3. run API smoke
4. run realtime smoke
5. run manual UI checklist
6. walk through the client demo script

### Manual QA

Manual QA is still required for:

- responsive layouts
- modals, drawers, and charts
- browser microphone permissions
- audio playback
- websocket reconnect behavior
- visual regressions

## Recommended pre-demo gate

Before every client demo:

1. `corepack pnpm prisma:seed`
2. `npm run smoke:test`
3. `npm run smoke:realtime`
4. review `docs/local-qa-checklist.md`
5. review `frontend/tests/frontend-qa-scenarios.md`
6. rehearse `docs/demo-script-step12.md`
