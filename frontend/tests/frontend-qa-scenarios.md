# Frontend QA Scenarios

## Login flow

- login screen loads correctly
- primary CTA is visible and readable
- OTP screen appears after continue
- onboarding step appears after OTP
- entering the app lands on dashboard

## Dashboard

- summary cards render without overlap
- recent activity and AI summary widget load
- charts render on desktop and mobile
- no unreadable text on gradients or dark cards

## CRM

- client cards render with phone, WhatsApp, email, and notes
- new client modal opens and closes
- client badges and service tags wrap correctly on small screens

## Calls

- voice call list renders
- selecting a call updates detail panel
- recording drawer opens
- AI summary drawer opens
- transcript preview renders in the right order

## Messages

- text agent cards render for WhatsApp, SMS, and email
- status badges show correctly
- no broken text overflow in longer previews

## Reports

- charts render without empty states
- analytics cards align properly
- transcript/report panel surfaces are readable

## Live AI agent screen

- realtime panel is visible in the voice tab
- `Start session` works
- typed turn triggers transcript and AI response
- `Start mic` requests microphone permission
- stop button works cleanly
- latency badges update
- session status badge changes during the flow

## Responsive pass

- check `375px` width
- check `768px` width
- check desktop width
- confirm no clipped cards or hidden buttons
