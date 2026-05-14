CREATE TYPE "MessageTemplateType" AS ENUM ('reminder', 'feedback', 'birthday', 'report_ready', 'follow_up');

CREATE TABLE "MessageTemplate" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "channel" "MessageChannel" NOT NULL,
  "templateType" "MessageTemplateType" NOT NULL,
  "content" TEXT NOT NULL,
  "variables" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MessageTemplate_businessId_name_key" ON "MessageTemplate"("businessId", "name");
CREATE INDEX "MessageTemplate_businessId_channel_templateType_idx" ON "MessageTemplate"("businessId", "channel", "templateType");

ALTER TABLE "MessageTemplate"
ADD CONSTRAINT "MessageTemplate_businessId_fkey"
FOREIGN KEY ("businessId") REFERENCES "Business"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
