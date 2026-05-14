ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'business_admin';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'receptionist';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SubscriptionPlanName') THEN
    CREATE TYPE "SubscriptionPlanName" AS ENUM ('starter', 'professional', 'enterprise');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SubscriptionStatus') THEN
    CREATE TYPE "SubscriptionStatus" AS ENUM ('trialing', 'active', 'past_due', 'canceled');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UsageMetricType') THEN
    CREATE TYPE "UsageMetricType" AS ENUM (
      'call_minutes',
      'whatsapp_messages',
      'sms_messages',
      'email_messages',
      'ai_requests',
      'stt_minutes',
      'tts_characters',
      'storage_mb'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OnboardingStep') THEN
    CREATE TYPE "OnboardingStep" AS ENUM (
      'create_business',
      'select_plan',
      'configure_ai',
      'connect_twilio',
      'configure_whatsapp',
      'upload_business_info',
      'test_ai_call'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InvoiceStatus') THEN
    CREATE TYPE "InvoiceStatus" AS ENUM ('draft', 'issued', 'paid', 'overdue', 'canceled');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus') THEN
    CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotificationType') THEN
    CREATE TYPE "NotificationType" AS ENUM (
      'trial_ending',
      'usage_limit_reached',
      'payment_reminder',
      'onboarding_incomplete',
      'plan_upgraded'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotificationChannelType') THEN
    CREATE TYPE "NotificationChannelType" AS ENUM ('email', 'dashboard');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotificationStatus') THEN
    CREATE TYPE "NotificationStatus" AS ENUM ('unread', 'read', 'sent', 'failed');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "SaaSPlan" (
  "id" TEXT NOT NULL,
  "name" "SubscriptionPlanName" NOT NULL,
  "displayName" TEXT NOT NULL,
  "monthlyPrice" DECIMAL(12,2) NOT NULL,
  "includedMinutes" INTEGER NOT NULL DEFAULT 0,
  "includedMessages" INTEGER NOT NULL DEFAULT 0,
  "includedAIRequests" INTEGER NOT NULL DEFAULT 0,
  "includedStorageMb" INTEGER NOT NULL DEFAULT 0,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SaaSPlan_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SaaSPlan_name_key" ON "SaaSPlan"("name");

CREATE TABLE IF NOT EXISTS "BusinessSubscription" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "planName" "SubscriptionPlanName" NOT NULL,
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'trialing',
  "monthlyPrice" DECIMAL(12,2) NOT NULL,
  "includedMinutes" INTEGER NOT NULL DEFAULT 0,
  "includedMessages" INTEGER NOT NULL DEFAULT 0,
  "includedAIRequests" INTEGER NOT NULL DEFAULT 0,
  "includedStorageMb" INTEGER NOT NULL DEFAULT 0,
  "currentPeriodStart" TIMESTAMP(3) NOT NULL,
  "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
  "trialEndsAt" TIMESTAMP(3),
  "canceledAt" TIMESTAMP(3),
  "isCurrent" BOOLEAN NOT NULL DEFAULT true,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BusinessSubscription_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BusinessSubscription_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "BusinessSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SaaSPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "BusinessSubscription_businessId_isCurrent_idx" ON "BusinessSubscription"("businessId", "isCurrent");
CREATE INDEX IF NOT EXISTS "BusinessSubscription_planName_status_idx" ON "BusinessSubscription"("planName", "status");

CREATE TABLE IF NOT EXISTS "UsageRecord" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "metricType" "UsageMetricType" NOT NULL,
  "monthKey" TEXT NOT NULL,
  "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "unit" TEXT NOT NULL,
  "warningThreshold" DOUBLE PRECISION,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UsageRecord_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "UsageRecord_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "UsageRecord_businessId_metricType_monthKey_key" ON "UsageRecord"("businessId", "metricType", "monthKey");
CREATE INDEX IF NOT EXISTS "UsageRecord_businessId_monthKey_idx" ON "UsageRecord"("businessId", "monthKey");

CREATE TABLE IF NOT EXISTS "BusinessOnboarding" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "currentStep" "OnboardingStep" NOT NULL DEFAULT 'create_business',
  "completedSteps" JSONB,
  "skippedSteps" JSONB,
  "isCompleted" BOOLEAN NOT NULL DEFAULT false,
  "businessInfoUploaded" BOOLEAN NOT NULL DEFAULT false,
  "twilioConnected" BOOLEAN NOT NULL DEFAULT false,
  "whatsappConfigured" BOOLEAN NOT NULL DEFAULT false,
  "testCallCompleted" BOOLEAN NOT NULL DEFAULT false,
  "lastCompletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BusinessOnboarding_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BusinessOnboarding_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "BusinessOnboarding_businessId_key" ON "BusinessOnboarding"("businessId");

CREATE TABLE IF NOT EXISTS "BusinessAISettings" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "tone" TEXT NOT NULL DEFAULT 'professional',
  "language" TEXT NOT NULL DEFAULT 'en',
  "greetingMessage" TEXT,
  "voiceSelection" TEXT,
  "businessInstructions" TEXT,
  "fallbackRules" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BusinessAISettings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BusinessAISettings_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "BusinessAISettings_businessId_key" ON "BusinessAISettings"("businessId");

CREATE TABLE IF NOT EXISTS "BusinessBranding" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "logoUrl" TEXT,
  "brandColor" TEXT,
  "businessName" TEXT,
  "emailFooter" TEXT,
  "pdfBranding" JSONB,
  "customDomain" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BusinessBranding_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BusinessBranding_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "BusinessBranding_businessId_key" ON "BusinessBranding"("businessId");

CREATE TABLE IF NOT EXISTS "Invoice" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "subscriptionId" TEXT,
  "invoiceNumber" TEXT NOT NULL,
  "status" "InvoiceStatus" NOT NULL DEFAULT 'draft',
  "subtotal" DECIMAL(12,2) NOT NULL,
  "overageAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "totalAmount" DECIMAL(12,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "dueDate" TIMESTAMP(3),
  "issuedAt" TIMESTAMP(3),
  "paidAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Invoice_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Invoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "BusinessSubscription"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
CREATE INDEX IF NOT EXISTS "Invoice_businessId_status_idx" ON "Invoice"("businessId", "status");

CREATE TABLE IF NOT EXISTS "Payment" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "invoiceId" TEXT,
  "amount" DECIMAL(12,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
  "provider" TEXT,
  "providerReference" TEXT,
  "paidAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Payment_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Payment_businessId_status_idx" ON "Payment"("businessId", "status");

CREATE TABLE IF NOT EXISTS "DashboardNotification" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "channel" "NotificationChannelType" NOT NULL,
  "status" "NotificationStatus" NOT NULL DEFAULT 'unread',
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "sentAt" TIMESTAMP(3),
  "readAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DashboardNotification_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "DashboardNotification_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "DashboardNotification_businessId_status_createdAt_idx" ON "DashboardNotification"("businessId", "status", "createdAt");

CREATE TABLE IF NOT EXISTS "AuditLogEntry" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "actorUserId" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "summary" TEXT NOT NULL,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLogEntry_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AuditLogEntry_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AuditLogEntry_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "AuditLogEntry_businessId_action_createdAt_idx" ON "AuditLogEntry"("businessId", "action", "createdAt");
CREATE INDEX IF NOT EXISTS "AuditLogEntry_actorUserId_createdAt_idx" ON "AuditLogEntry"("actorUserId", "createdAt");
