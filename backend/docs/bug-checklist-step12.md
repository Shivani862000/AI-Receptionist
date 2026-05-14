# Bug Checklist

## API and backend

- auth login rejects invalid credentials cleanly
- protected routes reject missing bearer tokens
- validation errors return usable messages
- empty list endpoints still return stable `items` and `meta`
- failed provider calls fall back gracefully
- report export errors are visible in response and logs
- webhook routes remain public and safe

## Frontend and UI

- login CTA works
- empty cards do not collapse layouts
- loading states appear during transitions
- no broken text contrast on cards, drawers, or charts
- mobile bottom navigation stays usable
- desktop sidebar does not overlap content

## Realtime and websocket

- socket connects on page load
- start session works
- partial transcript updates arrive
- final transcript rows append correctly
- AI response chunks stream in order
- TTS chunk playback completes
- disconnect and reconnect do not break the page
- stop session closes cleanly

## Forms and validation

- invalid phone number inputs are rejected
- invalid email inputs are rejected
- required fields block submission
- optional fields do not crash the backend when omitted

## Demo risk checks

- Twilio unavailable
- Deepgram unavailable
- Gemini unavailable
- SMTP unavailable
- browser mic denied
- PDF export delayed
