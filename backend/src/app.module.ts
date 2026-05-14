import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";

import { LoggerModule } from "./common/logger/logger.module";
import { RequestLoggingMiddleware } from "./common/logger/request-logging.middleware";
import { QueueModule } from "./common/queues/queue.module";
import { StorageModule } from "./common/storage/storage.module";
import configuration from "./config/configuration";
import { validateEnv } from "./config/env.validation";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { BusinessModule } from "./modules/business/business.module";
import { ClientsModule } from "./modules/clients/clients.module";
import { ServicesModule } from "./modules/services/services.module";
import { VoiceCallsModule } from "./modules/voice-calls/voice-calls.module";
import { TextMessagesModule } from "./modules/text-messages/text-messages.module";
import { AutomationsModule } from "./modules/automations/automations.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { ActivitiesModule } from "./modules/activities/activities.module";
import { TranscriptsModule } from "./modules/transcripts/transcripts.module";
import { RecordingsModule } from "./modules/recordings/recordings.module";
import { AiSummaryModule } from "./modules/ai-summary/ai-summary.module";
import { WebhooksModule } from "./modules/webhooks/webhooks.module";
import { MessagesModule } from "./modules/messages/messages.module";
import { WhatsappModule } from "./modules/whatsapp/whatsapp.module";
import { SmsModule } from "./modules/sms/sms.module";
import { EmailModule } from "./modules/email/email.module";
import { TemplatesModule } from "./modules/templates/templates.module";
import { ConversationsModule } from "./modules/conversations/conversations.module";
import { AiReplyModule } from "./modules/ai-reply/ai-reply.module";
import { AutomationLogsModule } from "./modules/automation-logs/automation-logs.module";
import { RemindersModule } from "./modules/reminders/reminders.module";
import { SchedulerModule } from "./modules/scheduler/scheduler.module";
import { AiAutomationModule } from "./modules/ai-automation/ai-automation.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { AiInsightsModule } from "./modules/ai-insights/ai-insights.module";
import { ReportHistoryModule } from "./modules/report-history/report-history.module";
import { AiModule } from "./modules/ai/ai.module";
import { SttModule } from "./modules/stt/stt.module";
import { TtsModule } from "./modules/tts/tts.module";
import { TwilioModule } from "./modules/twilio/twilio.module";
import { HealthModule } from "./modules/health/health.module";
import { RealtimeModule } from "./modules/realtime/realtime.module";
import { TenantModule } from "./modules/tenant/tenant.module";
import { TenantMiddleware } from "./modules/tenant/tenant.middleware";
import { PlansModule } from "./modules/plans/plans.module";
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module";
import { UsageModule } from "./modules/usage/usage.module";
import { OnboardingModule } from "./modules/onboarding/onboarding.module";
import { AiSettingsModule } from "./modules/ai-settings/ai-settings.module";
import { BrandingModule } from "./modules/branding/branding.module";
import { AdminModule } from "./modules/admin/admin.module";
import { BillingModule } from "./modules/billing/billing.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.RATE_LIMIT_TTL_MS || 60000),
        limit: Number(process.env.RATE_LIMIT_LIMIT || 60)
      }
    ]),
    LoggerModule,
    StorageModule,
    QueueModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    BusinessModule,
    ClientsModule,
    ServicesModule,
    VoiceCallsModule,
    TextMessagesModule,
    AutomationsModule,
    ReportsModule,
    DashboardModule,
    ActivitiesModule,
    TranscriptsModule,
    RecordingsModule,
    AiSummaryModule,
    WebhooksModule,
    MessagesModule,
    WhatsappModule,
    SmsModule,
    EmailModule,
    TemplatesModule,
    ConversationsModule,
    AiReplyModule,
    AutomationLogsModule,
    RemindersModule,
    SchedulerModule,
    AiAutomationModule,
    AnalyticsModule,
    AiInsightsModule,
    ReportHistoryModule,
    AiModule,
    SttModule,
    TtsModule,
    TwilioModule,
    HealthModule,
    RealtimeModule,
    TenantModule,
    PlansModule,
    SubscriptionsModule,
    UsageModule,
    OnboardingModule,
    AiSettingsModule,
    BrandingModule,
    AdminModule,
    BillingModule,
    NotificationsModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggingMiddleware, TenantMiddleware).forRoutes("*");
  }
}
