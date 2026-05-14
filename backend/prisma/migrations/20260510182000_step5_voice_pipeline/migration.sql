ALTER TYPE "CallStatus" ADD VALUE IF NOT EXISTS 'initiated';

ALTER TABLE "VoiceCall"
ADD COLUMN "callSid" TEXT,
ADD COLUMN "customerName" TEXT,
ADD COLUMN "customerPhone" TEXT,
ADD COLUMN "recordingUrl" TEXT,
ADD COLUMN "transcriptId" TEXT,
ADD COLUMN "aiSummaryId" TEXT;

ALTER TABLE "CallRecording"
ADD COLUMN "recordingUrl" TEXT,
ADD COLUMN "provider" TEXT;

ALTER TABLE "AICallSummary"
ADD COLUMN "summary" TEXT,
ADD COLUMN "followUpRequired" BOOLEAN NOT NULL DEFAULT false;

UPDATE "AICallSummary"
SET "summary" = "summaryText"
WHERE "summary" IS NULL;

CREATE TABLE "VoiceCallTranscript" (
  "id" TEXT NOT NULL,
  "voiceCallId" TEXT NOT NULL,
  "transcriptText" TEXT NOT NULL,
  "language" TEXT,
  "confidence" DOUBLE PRECISION,
  "provider" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "VoiceCallTranscript_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WebhookEvent" (
  "id" TEXT NOT NULL,
  "businessId" TEXT,
  "eventType" TEXT NOT NULL,
  "provider" TEXT,
  "callSid" TEXT,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VoiceCall_businessId_callSid_key" ON "VoiceCall"("businessId", "callSid");
CREATE INDEX "VoiceCall_businessId_customerPhone_idx" ON "VoiceCall"("businessId", "customerPhone");
CREATE UNIQUE INDEX "VoiceCallTranscript_voiceCallId_key" ON "VoiceCallTranscript"("voiceCallId");
CREATE INDEX "WebhookEvent_businessId_eventType_idx" ON "WebhookEvent"("businessId", "eventType");
CREATE INDEX "WebhookEvent_callSid_idx" ON "WebhookEvent"("callSid");

ALTER TABLE "VoiceCallTranscript"
ADD CONSTRAINT "VoiceCallTranscript_voiceCallId_fkey"
FOREIGN KEY ("voiceCallId") REFERENCES "VoiceCall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WebhookEvent"
ADD CONSTRAINT "WebhookEvent_businessId_fkey"
FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;
