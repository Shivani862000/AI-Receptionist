# Demo Fallback Plan

## If Gemini fails

- use the built-in fallback reply and summary mode
- show previously seeded AI summaries on completed calls
- use the seeded call summary drawer for the presentation

## If Deepgram STT fails

- use typed prompt mode inside the realtime live-agent panel
- use stored seeded transcripts from completed calls
- use `POST /api/v1/transcripts/generate/:callId` in fallback mode

## If Deepgram TTS fails

- the backend falls back to generated silent WAV placeholders
- narrate the returned reply text from the live AI panel
- show the AI chunk stream and transcript as the core proof point

## If Twilio voice fails

- demo the seeded call list and transcript flow
- use the realtime browser session instead of a phone call
- show Twilio webhook simulation routes in Swagger or Postman

## If WhatsApp fails

- use mock-provider mode already built into the backend
- show stored message history and conversation timeline
- call the webhook simulation route to demonstrate inbound flow

## If email fails

- rely on Nodemailer mock or JSON transport mode
- show the saved email history in the API and UI flow

## If websocket networking is unstable

- reload the live-agent panel
- use typed-turn mode instead of microphone mode
- fall back to a seeded completed call and AI summary demo

## Safe backup sequence

If multiple providers fail during a live demo:

1. show dashboard metrics
2. show CRM client data
3. show seeded completed calls
4. show stored transcript
5. show stored AI summary
6. show automations
7. export a seeded PDF report
