# Automation Engine Phase 1 Testing

Use this guide to test the Step 7 automation engine, scheduler scans, reminder execution, retry handling, and execution logs locally.

## Start Services

```bash
cd backend
corepack pnpm dev
```

Optional frontend:

```bash
cd frontend
corepack pnpm dev
```

Run the full smoke test:

```bash
cd backend
npm run smoke:test
```

## Scheduler Setup

The backend uses `@nestjs/schedule` cron jobs.

Default cron behavior:

- birthday scan: every day at 9:00 AM
- follow-up and reminder scans: every hour
- due execution processor: every minute
- failed retry scan: every 5 minutes

Optional local overrides:

```bash
AUTOMATION_BIRTHDAY_CRON="*/2 * * * *" \
AUTOMATION_FOLLOW_UP_CRON="*/2 * * * *" \
AUTOMATION_EXECUTION_CRON="*/1 * * * *" \
AUTOMATION_RETRY_CRON="*/5 * * * *" \
corepack pnpm dev
```

## Seeded Data

After `corepack pnpm prisma:seed`, the local DB includes:

- active birthday automation
- active report-ready automation
- active follow-up automation
- active feedback automation
- sample pending execution logs
- sample failed execution log for retry testing

## Example Automation Create Payload

```json
{
  "name": "Report Ready Reminder",
  "description": "Notify clients when a report is ready.",
  "triggerType": "report_ready",
  "channel": "whatsapp",
  "actionType": "send_message",
  "templateId": "TEMPLATE_ID",
  "scheduleType": "instant",
  "scheduleValue": "0",
  "isActive": true,
  "executionRules": {
    "maxRetryCount": 3
  }
}
```

## Reminder Test Route

`POST /api/v1/reminders/test`

```json
{
  "automationId": "AUTOMATION_ID",
  "clientId": "CLIENT_ID",
  "variables": {
    "name": "Priya"
  }
}
```

Expected flow:

1. create execution log
2. render template
3. send via WhatsApp/SMS/Email or create voice reminder call
4. mark log success or retrying/failed

## Automation Log Routes

- `GET /api/v1/automation-logs`
- `GET /api/v1/automation-logs/:id`
- `GET /api/v1/automations/:id/logs`

Useful filters:

```text
/api/v1/automation-logs?page=1&limit=10&status=failed
/api/v1/automation-logs?page=1&limit=10&automationId=AUTOMATION_ID
```

## Retry Strategy

Current local POC strategy:

- retry after 5 minutes
- max 3 retries
- execution status moves through `pending` -> `running` -> `success`
- failures move to `retrying` when retry is still allowed
- final exhausted state stays `failed`

## AI Automation Suggestion Route

`GET /api/v1/ai-automation/suggestions`

Example response:

```json
{
  "data": {
    "bestChannel": "whatsapp",
    "bestTime": "10:00 AM",
    "suggestedTemplate": "friendly_followup",
    "retryAfter": "5 minutes",
    "confidence": 0.87
  }
}
```

## Example Local Flow

1. Create a template in `POST /api/v1/templates`
2. Create an automation in `POST /api/v1/automations`
3. Create or use an existing client
4. Call `POST /api/v1/reminders/test`
5. Inspect `GET /api/v1/automation-logs`
6. Inspect `GET /api/v1/messages/client/:clientId` or `GET /api/v1/conversations/client/:clientId`
7. Wait for cron scans or shorten cron expressions to observe automatic scheduling
