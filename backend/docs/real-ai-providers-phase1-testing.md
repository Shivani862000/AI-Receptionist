# Real AI Providers Phase 1 Testing

This guide covers local setup and testing for Step 9.

## Required Environment Variables

Add these to `.env` when you want real provider traffic instead of the built-in local fallback behavior:

```env
BACKEND_BASE_URL="http://localhost:4000"

GEMINI_API_KEY=""
GEMINI_MODEL="gemini-2.5-flash-preview"

DEEPGRAM_API_KEY=""
DEEPGRAM_STT_MODEL="nova-3"
DEEPGRAM_TTS_MODEL="aura-asteria-en"

TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""
TWILIO_WHATSAPP_NUMBER=""

SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
```

If a provider key is missing, the backend falls back to local mock-safe behavior so development still works.

## Gemini Setup Guide

1. Create a Gemini API key in Google AI Studio.
2. Set `GEMINI_API_KEY` in `.env`.
3. Restart the backend.
4. Test:

```bash
curl -sS -X POST \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"transcript":"Customer confirmed the appointment for tomorrow.","customerName":"Asha"}' \
  "http://localhost:4000/api/v1/ai/generate-summary"
```

Other Gemini-backed routes:

- `POST /api/v1/ai/generate-reply`
- `POST /api/v1/ai/extract-keypoints`
- `POST /api/v1/ai/analyze-sentiment`

## Deepgram Setup Guide

1. Create a Deepgram API key.
2. Set `DEEPGRAM_API_KEY` in `.env`.
3. Restart the backend.
4. Test STT:

```bash
curl -sS -X POST \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"audioUrl":"https://example.com/audio.wav","language":"en"}' \
  "http://localhost:4000/api/v1/stt/transcribe"
```

5. Test TTS:

```bash
curl -sS -X POST \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello, your report is ready for pickup tomorrow.","voice":"aura-asteria-en"}' \
  "http://localhost:4000/api/v1/tts/generate"
```

Generated local assets are served from:

- `/uploads/transcripts`
- `/uploads/tts-audio`
- `/uploads/recordings`

## Twilio Voice Setup Guide

1. Create a Twilio account and get:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`
2. Set `BACKEND_BASE_URL` to a publicly reachable URL if testing with real Twilio callbacks.
3. Restart the backend.
4. Test outgoing call:

```bash
curl -sS -X POST \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Rohan Mehta","customerPhone":"+919811115555"}' \
  "http://localhost:4000/api/v1/twilio/outgoing-call"
```

Twilio callback routes:

- `POST /api/v1/twilio/webhook/voice`
- `POST /api/v1/twilio/webhook/status`

## Twilio WhatsApp Setup Guide

1. Enable the Twilio WhatsApp sandbox.
2. Set `TWILIO_WHATSAPP_NUMBER`.
3. Restart the backend.
4. Test send:

```bash
curl -sS -X POST \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919811115555","message":"Hello, your report is ready."}' \
  "http://localhost:4000/api/v1/whatsapp/send"
```

Webhook routes:

- `POST /api/v1/whatsapp/webhook`
- `POST /api/v1/whatsapp/webhook/status`

## Gmail SMTP Setup Guide

1. Use a Gmail SMTP account or app password.
2. Set:
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=587`
   - `SMTP_USER=<gmail address>`
   - `SMTP_PASS=<app password>`
3. Restart the backend.
4. Test:

```bash
curl -sS -X POST \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"to":"customer@example.com","subject":"Report Ready","body":"Your report is ready.","html":"<p>Your report is ready.</p>"}' \
  "http://localhost:4000/api/v1/email/send"
```

## Real AI Call Flow

The Step 9 call flow is:

1. `POST /api/v1/twilio/outgoing-call`
2. Twilio voice webhook hits `POST /api/v1/twilio/webhook/voice`
3. TTS response is generated for the caller
4. Twilio status webhook hits `POST /api/v1/twilio/webhook/status`
5. Recording metadata is saved
6. STT runs through `SttService`
7. AI summary runs through Gemini-backed summary generation

## Local Verification Commands

Run the full local verification:

```bash
cd backend
npm run smoke:test
```

The smoke test now covers:

- Gemini-backed AI routes
- STT route
- TTS route
- Twilio outgoing call route
- Twilio voice and status webhooks
- WhatsApp webhook alias
