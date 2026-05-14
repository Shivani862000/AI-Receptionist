# Phase 1 Database Design

## Overview

This schema is designed for a Phase 1 POC with:

- PostgreSQL
- Prisma ORM
- NestJS backend
- single deployable backend app
- future microservice extraction by domain boundary

It keeps analytics mostly derived from transactional tables instead of over-modeling reporting tables too early.

## Table / Model Guide

### `users`
- Purpose: platform users who log into the SaaS
- PK: `id`
- Key fields: `fullName`, `email`, `phone`, `isActive`, `lastLoginAt`
- Indexes: `email`, `phone`
- Relationships: one-to-many to `business_memberships`, `otp_requests`, `user_sessions`, `activity_logs`

### `businesses`
- Purpose: tenant/business workspace
- PK: `id`
- Key fields: `name`, `slug`, profile/contact/branding fields, `timezone`
- Indexes: `slug`, `name`, `industry`
- Relationships: one-to-many to most operational entities

### `business_memberships`
- Purpose: user-to-business membership with role
- PK: `id`
- FKs: `businessId -> businesses.id`, `userId -> users.id`
- Unique: `(businessId, userId)`
- Supports later multi-tenant teams cleanly

### `otp_requests`
- Purpose: login OTP lifecycle tracking
- PK: `id`
- FKs: optional `userId`, optional `businessId`
- Key fields: `channel`, `otpCodeHash`, `status`, `expiresAt`, `attempts`
- Indexes: `phone + status`, `email + status`, `expiresAt`

### `user_sessions`
- Purpose: refresh-token backed session tracking
- PK: `id`
- FKs: `userId`, optional `businessId`
- Key fields: `refreshTokenHash`, `status`, `expiresAt`, `ipAddress`, `userAgent`

### `clients`
- Purpose: CRM contacts per business
- PK: `id`
- FK: `businessId`
- Key fields: contact channels, preferences, notes, birthday, anniversary, `status`, `deletedAt`
- Indexes: `(businessId, fullName)`, `(businessId, phone)`, `(businessId, email)`, `(businessId, status)`

### `services`
- Purpose: business service catalog
- PK: `id`
- FK: `businessId`
- Key fields: `name`, `description`, `durationMinutes`, `priceAmount`, `currency`, `isActive`
- Unique: `(businessId, name)`

### `client_services`
- Purpose: many-to-many link between clients and services
- PK: `id`
- FKs: `clientId`, `serviceId`
- Unique: `(clientId, serviceId)`

### `voice_calls`
- Purpose: incoming/outgoing AI call records
- PK: `id`
- FKs: `businessId`, optional `clientId`
- Key fields: provider refs, direction, type, status, from/to, timing, duration, sentiment, payloads
- Unique: `(businessId, providerCallId)`
- Indexes: by status, direction/time, client/time

### `call_transcript_segments`
- Purpose: transcript broken into ordered speaker turns
- PK: `id`
- FK: `callId`
- Unique: `(callId, sequenceNumber)`
- Key fields: `speaker`, `text`, timing, `confidence`

### `call_recordings`
- Purpose: audio asset metadata
- PK: `id`
- FK: `callId`
- Unique: `callId`
- Key fields: provider/path/url, duration, mime type, file size, expiry

### `ai_call_summaries`
- Purpose: AI-generated summary and extracted metadata for a call
- PK: `id`
- FK: `callId`
- Unique: `callId`
- Key fields: `summaryText`, `keyPoints`, `followUpSuggestion`, `sentiment`, `rawResponse`

### `messages`
- Purpose: WhatsApp/SMS/Email unified message ledger
- PK: `id`
- FKs: `businessId`, optional `clientId`
- Key fields: `channel`, `direction`, `status`, addresses, body, subject, provider ids, timestamps
- Unique: `(businessId, providerMessageId)`

### `automations`
- Purpose: reusable automation definitions
- PK: `id`
- FK: `businessId`
- Key fields: `type`, `channel`, `status`, `triggerConfig`, `templateRef`, `executionRules`, `lastRunAt`

### `automation_executions`
- Purpose: individual automation run logs
- PK: `id`
- FKs: `automationId`, `businessId`, optional `clientId`, optional `voiceCallId`, optional `messageId`
- Key fields: `status`, scheduling/running/completion timestamps, `executionPayload`, `errorMessage`

### `report_exports`
- Purpose: stored async export jobs for PDF or report generation
- PK: `id`
- FKs: `businessId`, optional `requestedByUserId`
- Key fields: `reportType`, `status`, date range, filters, file location, error state
- Notes: dashboard/report analytics remain derived queries, but exports deserve persistence

### `activity_logs`
- Purpose: activity feed and audit trail
- PK: `id`
- FKs: `businessId`, optional `actorUserId`, optional `clientId`, optional `voiceCallId`, optional `messageId`, optional `automationId`
- Key fields: `entityType`, `entityId`, `activityType`, `title`, `description`, `payload`, request metadata
- Indexes optimized for timeline views and audit queries

## ERD Explanation

At the center is `businesses`, which acts as the tenant root.

- A `user` joins one or more businesses through `business_memberships`
- A business owns:
  - `clients`
  - `services`
  - `voice_calls`
  - `messages`
  - `automations`
  - `report_exports`
  - `activity_logs`
- `clients` connect to `services` via `client_services`
- `voice_calls` can optionally belong to a client and have:
  - many `call_transcript_segments`
  - one `call_recording`
  - one `ai_call_summary`
- `messages` can optionally belong to a client
- `automations` produce many `automation_executions`
- `automation_executions` may reference a generated `message` or `voice_call`
- `activity_logs` can point at users, clients, calls, messages, and automations for auditability

## Seed Data Plan

Phase 1 seed should create:

1. One demo business
2. One owner user
3. One active membership
4. Two to three services
5. Three to five clients
6. A few client-service links
7. A few incoming and outgoing calls
8. Transcript segments for at least one call
9. One recording row
10. One AI summary row
11. A few WhatsApp/SMS/email messages
12. Two automation definitions
13. A few automation execution logs
14. Activity log rows covering login, client creation, message send, call summary generation

## Local Setup Commands

```bash
cd backend
cp .env.example .env
pnpm install
pnpm prisma:generate
pnpm prisma:migrate --name init
```

Optional:

```bash
pnpm prisma:studio
```

## Migration Commands

Create migration during development:

```bash
pnpm prisma:migrate --name add_clients_module
```

Regenerate Prisma client after schema changes:

```bash
pnpm prisma:generate
```

Deploy migrations in non-dev environments:

```bash
pnpm prisma:deploy
```

## Recommended Backend Folder Structure

```text
backend/
  prisma/
    schema.prisma
    seed.ts
  src/
    common/
    config/
    infrastructure/
      prisma/
        prisma.module.ts
        prisma.service.ts
    modules/
      auth/
      business-profile/
      clients/
      services/
      voice-calls/
      messages/
      automations/
      reports/
      ai/
      activity-logs/
  docs/
    database-phase1.md
```

## Future Microservices Split Notes

Natural split boundaries later:

- `identity-service`
  - users
  - memberships
  - otp_requests
  - user_sessions
- `crm-service`
  - businesses
  - clients
  - services
  - client_services
- `communication-service`
  - voice_calls
  - call_transcript_segments
  - call_recordings
  - messages
- `automation-service`
  - automations
  - automation_executions
- `ai-service`
  - ai_call_summaries
- `reporting-service`
  - report_exports
  - warehouse/derived analytics later
- `audit-service`
  - activity_logs

Cross-service guidance:

- Keep business-scoped IDs on every operational table
- Keep provider ids unique only within business scope where practical
- Favor append-only logs for audit/history tables
- Move heavy analytics to derived tables or OLAP later, not in Phase 1
- Keep AI summaries and transcript artifacts isolated from call core state for easier reprocessing
