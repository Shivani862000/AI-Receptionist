# Text Communications Phase 1 Testing

Use these examples to test the Step 6 WhatsApp, SMS, Email, Templates, Conversations, and AI reply flow locally.

## Local Commands

Start backend:

```bash
cd backend
corepack pnpm dev
```

Run the reusable smoke test:

```bash
cd backend
npm run smoke:test
```

Open Swagger:

```text
http://localhost:4000/api/docs
```

## Seeded Login

```json
{
  "email": "owner@clinic.com",
  "password": "password123"
}
```

## WhatsApp Examples

Send WhatsApp:

```bash
curl -X POST http://localhost:4000/api/v1/whatsapp/send \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "CLIENT_ID",
    "phone": "+919876511220",
    "message": "Hello, your report is ready for pickup tomorrow."
  }'
```

Incoming webhook:

```json
{
  "from": "+919876511220",
  "to": "+911140001122",
  "message": "Can I reschedule my appointment to Friday?",
  "autoReply": true
}
```

Status webhook:

```json
{
  "providerMessageId": "WA-ABC123",
  "status": "read"
}
```

## SMS Examples

Send SMS:

```json
{
  "clientId": "CLIENT_ID",
  "phone": "+919876511220",
  "message": "Reminder: please share your feedback after the visit."
}
```

Incoming reply webhook:

```json
{
  "from": "+919876511220",
  "to": "+911140001122",
  "message": "Please call me back after 5 PM.",
  "autoReply": true
}
```

Status webhook:

```json
{
  "providerMessageId": "SMS-ABC123",
  "status": "delivered"
}
```

## Email Examples

Send email:

```json
{
  "clientId": "CLIENT_ID",
  "to": "priya@example.com",
  "subject": "Your lab report is ready",
  "body": "Hello Priya, your lab report is ready for pickup tomorrow."
}
```

Incoming email webhook:

```json
{
  "from": "priya@example.com",
  "to": "hello@novaskin.com",
  "subject": "Re: Your lab report is ready",
  "body": "Thank you, I will come tomorrow afternoon.",
  "autoReply": true
}
```

## Templates Examples

Create template:

```json
{
  "name": "Report Ready WhatsApp",
  "channel": "whatsapp",
  "templateType": "report_ready",
  "content": "Hello {{name}}, your report is ready.",
  "variables": ["name"]
}
```

## AI Reply Example

```json
{
  "message": "I want to book an appointment for tomorrow.",
  "channel": "whatsapp"
}
```

## Mock Provider Flow

1. Send an outgoing WhatsApp or SMS message.
2. Copy `providerMessageId` from the response.
3. Call the matching status webhook with `delivered` or `read`.
4. Send an incoming webhook payload to simulate a client reply.
5. If `autoReply` is `true`, the backend creates a mock AI response message automatically.
6. Open `GET /api/v1/messages/client/:clientId` or `GET /api/v1/conversations/client/:clientId` to verify the timeline.

## Email Setup Note

- The backend uses local Nodemailer `jsonTransport` if `nodemailer` is installed.
- If `nodemailer` is not installed yet, the service falls back to a mock email provider automatically.
- For a real local preview later, you can add Mailtrap or Ethereal credentials without changing the module shape.
