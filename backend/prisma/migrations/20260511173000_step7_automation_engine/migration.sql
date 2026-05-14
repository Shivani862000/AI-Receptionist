CREATE TYPE "AutomationTriggerType" AS ENUM ('birthday', 'appointment_reminder', 'follow_up', 'feedback_request', 'report_ready', 'missed_call', 'manual');
CREATE TYPE "AutomationChannel" AS ENUM ('whatsapp', 'sms', 'email', 'voice_call');
CREATE TYPE "AutomationActionType" AS ENUM ('send_message', 'make_call', 'send_email', 'send_sms');
CREATE TYPE "AutomationScheduleType" AS ENUM ('instant', 'delayed', 'recurring');

ALTER TYPE "AutomationExecutionStatus" ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE "AutomationExecutionStatus" ADD VALUE IF NOT EXISTS 'retrying';

ALTER TABLE "MessageTemplate"
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Automation"
ADD COLUMN "description" TEXT,
ADD COLUMN "triggerType" "AutomationTriggerType",
ADD COLUMN "actionType" "AutomationActionType",
ADD COLUMN "templateId" TEXT,
ADD COLUMN "scheduleType" "AutomationScheduleType" NOT NULL DEFAULT 'instant',
ADD COLUMN "scheduleValue" TEXT,
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "nextRunAt" TIMESTAMP(3);

ALTER TABLE "Automation" ALTER COLUMN "type" DROP NOT NULL;
ALTER TABLE "Automation" ALTER COLUMN "status" DROP NOT NULL;

CREATE TEMP TABLE "_automation_channel_migration" AS
SELECT "id",
       CASE
         WHEN "channel"::text = 'whatsapp' THEN 'whatsapp'
         WHEN "channel"::text = 'sms' THEN 'sms'
         WHEN "channel"::text = 'email' THEN 'email'
         ELSE 'whatsapp'
       END AS "channelValue"
FROM "Automation";

ALTER TABLE "Automation" ALTER COLUMN "triggerConfig" DROP NOT NULL;
ALTER TABLE "Automation" ALTER COLUMN "channel" TYPE TEXT;
ALTER TABLE "Automation" ALTER COLUMN "channel" DROP NOT NULL;
ALTER TABLE "Automation" ADD COLUMN "channel_new" "AutomationChannel";

UPDATE "Automation" a
SET "channel_new" = m."channelValue"::"AutomationChannel"
FROM "_automation_channel_migration" m
WHERE a."id" = m."id";

UPDATE "Automation"
SET
  "triggerType" = CASE
    WHEN "type" = 'birthday_wishes' THEN 'birthday'::"AutomationTriggerType"
    WHEN "type" = 'follow_up_reminder' THEN 'follow_up'::"AutomationTriggerType"
    WHEN "type" = 'feedback_reminder' THEN 'feedback_request'::"AutomationTriggerType"
    WHEN "type" = 'report_notification' THEN 'report_ready'::"AutomationTriggerType"
    ELSE 'manual'::"AutomationTriggerType"
  END,
  "actionType" = CASE
    WHEN "channel_new" = 'email' THEN 'send_email'::"AutomationActionType"
    WHEN "channel_new" = 'sms' THEN 'send_sms'::"AutomationActionType"
    ELSE 'send_message'::"AutomationActionType"
  END,
  "scheduleValue" = COALESCE("templateRef", '0'),
  "isActive" = CASE WHEN "status" = 'enabled' THEN true ELSE false END,
  "templateId" = NULL;

UPDATE "Automation"
SET "channel_new" = 'whatsapp'::"AutomationChannel"
WHERE "channel_new" IS NULL;

ALTER TABLE "Automation" DROP COLUMN "channel";
ALTER TABLE "Automation" RENAME COLUMN "channel_new" TO "channel";

ALTER TABLE "Automation"
ALTER COLUMN "triggerType" SET NOT NULL,
ALTER COLUMN "actionType" SET NOT NULL,
ALTER COLUMN "channel" SET NOT NULL;

ALTER TABLE "Automation"
ADD CONSTRAINT "Automation_templateId_fkey"
FOREIGN KEY ("templateId") REFERENCES "MessageTemplate"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Automation_businessId_isActive_idx" ON "Automation"("businessId", "isActive");
CREATE INDEX "Automation_businessId_triggerType_idx" ON "Automation"("businessId", "triggerType");
CREATE INDEX "Automation_businessId_channel_actionType_idx" ON "Automation"("businessId", "channel", "actionType");
CREATE INDEX "Automation_templateId_idx" ON "Automation"("templateId");

ALTER TABLE "AutomationExecution"
ADD COLUMN IF NOT EXISTS "executedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "retryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "metadata" JSONB;

CREATE INDEX "AutomationExecution_businessId_status_scheduledFor_idx"
ON "AutomationExecution"("businessId", "status", "scheduledFor");

DROP TABLE IF EXISTS "_automation_channel_migration";
