# Local QA Checklist

Use this checklist before demos, handoff, or backend changes that affect the local Phase 1 POC.

## Start Services

- Start PostgreSQL or confirm the local database is reachable.
- Start backend: `cd backend && corepack pnpm dev`
- Start frontend: `cd frontend && corepack pnpm dev`
- Open frontend: `http://localhost:3001`
- Open Swagger: `http://localhost:4000/api/docs`

## Automated Smoke Test

- Run `cd backend && npm run smoke:test`
- Run `cd backend && npm run smoke:realtime`
- Run `cd backend && npm run qa:demo` before an important client demo
- Confirm the script finishes with `[smoke] All checks passed.`
- If login fails for the seeded user, retry with `SMOKE_TEST_AUTO_REGISTER=true npm run smoke:test`

## Frontend QA

- Login screen loads with readable text and working CTA.
- Demo login succeeds and lands on dashboard.
- Mobile bottom navigation is visible on small screens.
- Desktop sidebar is visible on large screens.
- Dashboard cards show realistic counts and no broken layout.
- Voice Calls list renders without missing transcript or summary states.
- CRM client list and client detail card render without overlap.
- Automations page cards align correctly and status labels are readable.
- Reports page charts and summary widgets render without empty blocks.
- Realtime AI live-agent card starts a session and shows transcript plus AI response updates.

## Auth QA

- `POST /api/v1/auth/login` returns an access token.
- `GET /api/v1/auth/me` returns the authenticated user profile.
- Protected routes reject requests without a bearer token.

## CRUD QA

- Business: create, list, get, update, delete
- Clients: create, list, get, update, delete
- Services: create, list, get, update, delete
- Text messages: create, list, get, update
- Messages: list, get, filter, list by client
- Templates: create, list, update, delete
- Automations: create, list, get, update, toggle, delete, logs

## Text Communication QA

- `POST /api/v1/whatsapp/send` creates an outgoing WhatsApp message with a fake provider id
- If Twilio credentials are configured, `POST /api/v1/whatsapp/send` returns a real Twilio SID
- `POST /api/v1/whatsapp/webhook/status` updates delivered or read status
- `POST /api/v1/whatsapp/webhook` accepts the unified webhook alias
- `POST /api/v1/whatsapp/webhook/incoming` stores an inbound client message
- `POST /api/v1/sms/send` creates an outgoing SMS message
- `POST /api/v1/sms/webhook/status` updates SMS delivery state
- `POST /api/v1/sms/webhook/incoming` stores an inbound SMS reply
- `POST /api/v1/email/send` stores email history and returns a local provider response
- `GET /api/v1/email/history` returns only email messages
- `POST /api/v1/email/webhook/incoming` stores an inbound email reply
- `GET /api/v1/conversations/client/:clientId` returns calls plus messages in order
- `POST /api/v1/ai-reply/generate` returns a reply, sentiment, and intent
- Check at least one incoming webhook with `autoReply: true` and confirm the outbound AI reply is stored

## Automation Engine QA

- `POST /api/v1/automations` accepts the Step 7 contract with `triggerType`, `channel`, `actionType`, and `scheduleType`
- `PATCH /api/v1/automations/:id/toggle` flips active state
- `POST /api/v1/reminders/test` creates an execution log and sends through the correct communication pipeline
- `GET /api/v1/automation-logs` returns execution history with retry counts and metadata
- `GET /api/v1/ai-automation/suggestions` returns mock recommendation data
- Confirm at least one seeded failed execution can move into retry flow
- Confirm one seeded pending execution can be processed successfully
- If you shorten cron expressions locally, confirm scan logs appear in backend console

## Voice Pipeline QA

- Create an outgoing call with `POST /api/v1/voice-calls/outgoing`
- Create a provider-backed outgoing call with `POST /api/v1/twilio/outgoing-call`
- Confirm call appears in `GET /api/v1/voice-calls`
- Generate transcript with `POST /api/v1/transcripts/generate/:callId`
- Test raw STT with `POST /api/v1/stt/transcribe`
- Generate AI summary with `POST /api/v1/ai-summary/generate/:callId`
- Test Gemini endpoints:
  - `POST /api/v1/ai/generate-summary`
  - `POST /api/v1/ai/generate-reply`
  - `POST /api/v1/ai/extract-keypoints`
  - `POST /api/v1/ai/analyze-sentiment`
- Test TTS with `POST /api/v1/tts/generate`
- Save recording metadata with `POST /api/v1/recordings/:callId`
- Verify linked resources through:
  - `GET /api/v1/voice-calls/:id/transcript`
  - `GET /api/v1/voice-calls/:id/summary`
- Open one generated file from:
  - `/uploads/tts-audio`
  - `/uploads/transcripts`
  - `/uploads/recordings`

## Webhook Pipeline QA

- Send `POST /api/v1/webhooks/call/incoming` with a mock payload
- Send `POST /api/v1/webhooks/call/status` for the same `callSid`
- Send `POST /api/v1/webhooks/call/completed`
- Send `POST /api/v1/twilio/webhook/voice`
- Send `POST /api/v1/twilio/webhook/status`
- Confirm the call is marked `completed`
- Confirm transcript, AI summary, and recording metadata exist after completion

## Dashboard And Reports QA

- `GET /api/v1/dashboard/stats` returns call totals plus message channel counts, delivery rate, and read rate
- `GET /api/v1/dashboard/stats` also returns total automations, successful automations, failed automations, pending reminders, and today scheduled tasks
- `GET /api/v1/dashboard/stats` includes `callsToday`, `messagesToday`, and `positiveSentimentRate`
- `GET /api/v1/dashboard/recent-activity` returns recent events
- `GET /api/v1/dashboard/recent-activities` returns the plural alias for mobile/dashboard consumers
- `GET /api/v1/dashboard/ai-insights` returns AI widget content
- `GET /api/v1/dashboard/quick-insights` returns KPI-friendly numbers for cards
- `GET /api/v1/analytics/call-trends` returns Recharts-friendly date buckets
- `GET /api/v1/analytics/message-trends` returns message volume buckets
- `GET /api/v1/analytics/automation-trends` returns automation execution buckets
- `GET /api/v1/analytics/sentiment-trends` returns positive, neutral, and negative series
- `GET /api/v1/analytics/channel-performance` returns WhatsApp, SMS, Email, and voice counts
- `GET /api/v1/ai-insights/business` returns channel and follow-up recommendations
- `GET /api/v1/ai-insights/communication` returns peak-hour and best-channel guidance
- `GET /api/v1/ai-insights/followups` returns reminder timing guidance
- `GET /api/v1/reports/calls` returns paginated call records plus summary totals
- `GET /api/v1/reports/messages` returns paginated message records plus delivery and read rates
- `GET /api/v1/reports/automations` returns execution history plus success and failure totals
- `GET /api/v1/reports/clients` returns paginated client rows
- `GET /api/v1/reports/overview` returns cross-module totals for KPI cards
- `GET /api/v1/reports/call-analytics` returns chart data
- `GET /api/v1/reports/sentiment` returns sentiment breakdown
- `GET /api/v1/reports/daily-summary` returns the daily summary block
- `POST /api/v1/reports/export-pdf` returns a successful export response
- `POST /api/v1/reports/export/call-summary` generates a downloadable PDF
- `POST /api/v1/reports/export/client-report` generates a downloadable PDF
- `POST /api/v1/reports/export/daily-summary` generates a downloadable PDF
- `POST /api/v1/reports/export/transcript` generates a downloadable PDF
- Open one returned report file under `/uploads/reports` and confirm it downloads
- `GET /api/v1/report-history` lists the generated exports with file URLs

## Regression Notes

- Check `PATCH /api/v1/text-messages/:id` with `status` in the payload. This was previously failing validation and should now succeed.
- Check voice webhook callbacks without auth. These routes should stay public.
- Check message webhook callbacks without auth for WhatsApp, SMS, and email.
- Check scheduler cron logs after backend restart when testing automation scans.
- Check frontend cards and text contrast after any styling changes.
