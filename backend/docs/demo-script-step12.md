# 10-Minute Client Demo Script

## 1. Login and setup

- Open `http://localhost:3001`
- Show the clean login screen
- Mention that the platform supports AI calls, CRM, reminders, and reports in one place
- Enter the demo flow and reach the main app

## 2. Dashboard overview

- Open `Dashboard`
- Show total calls, messages, reminders, and AI insights
- Highlight recent activity and the AI summary widget
- Explain that the data is seeded from realistic clinic operations

## 3. Client CRM

- Open `Clients`
- Pick one seeded client like `Priya Mehra`
- Show phone, WhatsApp, email, preferred contact time, services, and notes
- Open the `New client` dialog and add a sample client to show the CRUD flow

## 4. Voice call workflow

- Open `AI Agent` -> `Voice agent`
- Select a completed seeded call
- Show transcript preview
- Open the recording drawer
- Open the AI summary drawer
- Explain that call summaries, sentiment, and follow-up suggestions are AI-generated

## 5. Realtime live agent

- Stay in `AI Agent`
- Use the `Realtime AI live agent` panel
- Click `Start session`
- Use `Send typed turn` with:
  - `I want to reschedule my appointment to tomorrow evening.`
- Show:
  - partial transcript
  - final transcript
  - AI response chunks
  - returned audio playback
  - latency metrics

## 6. WhatsApp or text communication

- Explain that the platform supports WhatsApp, SMS, and email
- Show the text agent cards
- Mention that outgoing/incoming message history is stored in the conversation timeline

## 7. Automations

- Open `Automations`
- Show birthday, follow-up, feedback, and report-ready flows
- Highlight that reminders and retries are tracked through execution logs

## 8. Reports and analytics

- Open `Reports`
- Show analytics charts
- Explain call trends, sentiment trends, and export history
- Trigger or mention a generated PDF report

## 9. Close with architecture confidence

- Mention:
  - NestJS backend
  - PostgreSQL + Prisma
  - Gemini AI
  - Deepgram STT/TTS
  - Twilio voice and WhatsApp
  - realtime websocket conversation layer

## 10. Final message

- Position the product as Phase 1 demo-ready today
- Mention that provider fallbacks are already built in so demos remain stable even if an external service is slow
