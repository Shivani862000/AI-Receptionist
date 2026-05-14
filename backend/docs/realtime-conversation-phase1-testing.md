# Step 11: Realtime AI Conversation Streaming

## What this step adds

- Socket.IO realtime gateway at `/realtime`
- live session APIs:
  - `GET /api/v1/live-sessions`
  - `GET /api/v1/live-sessions/:id`
  - `GET /api/v1/realtime/active-sessions`
- browser-facing realtime events:
  - client: `start_session`, `audio_chunk`, `stop_session`
  - server: `partial_transcript`, `final_transcript`, `ai_response_chunk`, `tts_audio_chunk`, `session_status`
- Twilio media stream bridge at websocket path `/twilio-media-stream`
- Twilio TwiML helper route:
  - `POST /api/v1/twilio/webhook/media-stream`

## Local browser flow

1. Start backend:

```bash
cd backend
corepack pnpm start:dev
```

2. Start frontend:

```bash
cd frontend
corepack pnpm dev
```

3. Open the receptionist screen in the frontend.
4. Open the `Voice agent` tab.
5. Use the `Realtime AI live agent` card.
6. Click `Start session`.
7. Either:
   - use `Send typed turn` for the reliable local fallback path
   - or use `Start mic` to stream browser audio chunks
8. Watch:
   - partial transcript updates
   - final transcript rows
   - Gemini response chunks
   - Deepgram TTS playback

## POC behavior notes

- Browser mic chunks are streamed over Socket.IO.
- For local development, typed text is the most reliable STT path.
- Deepgram realtime STT is wired for Twilio-style `mulaw` streaming audio.
- Twilio media streams can feed the same session manager through `/twilio-media-stream`.
- AI replies stream in text chunks first, then TTS audio is streamed back in chunk batches.

## Twilio media stream flow

Use this TwiML endpoint in Twilio voice configuration:

```text
POST /api/v1/twilio/webhook/media-stream
```

It returns TwiML that connects the call to:

```text
wss://<your-backend-host>/twilio-media-stream
```

## Metrics exposed

Each live session tracks:

- `sttMs`
- `aiMs`
- `ttsMs`
- `roundtripMs`

The frontend panel surfaces these metrics live.

## Environment notes

Optional realtime tuning:

- `REALTIME_SESSION_TIMEOUT_MS`

Existing providers used:

- `GEMINI_API_KEY`
- `DEEPGRAM_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`

## Example REST checks

Authenticated routes:

```bash
curl -H "Authorization: Bearer <token>" http://localhost:4000/api/v1/live-sessions
curl -H "Authorization: Bearer <token>" http://localhost:4000/api/v1/realtime/active-sessions
```
