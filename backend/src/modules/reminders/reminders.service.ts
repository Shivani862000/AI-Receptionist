import { Injectable, Logger } from "@nestjs/common";
import {
  ActivityType,
  Automation,
  AutomationActionType,
  AutomationChannel,
  AutomationExecutionStatus,
  AutomationScheduleType,
  Prisma
} from "@prisma/client";

import { ResourceNotFoundException } from "../../common/exceptions/app.exception";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { PrismaService } from "../../prisma/prisma.service";
import { EmailService } from "../email/email.service";
import { SmsService } from "../sms/sms.service";
import { TemplatesService } from "../templates/templates.service";
import { VoiceCallsService } from "../voice-calls/voice-calls.service";
import { WhatsappService } from "../whatsapp/whatsapp.service";
import { TestReminderDto } from "./dto/test-reminder.dto";

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);
  private readonly defaultRetryMinutes = 5;
  private readonly defaultMaxRetries = 3;

  constructor(
    private readonly prisma: PrismaService,
    private readonly templatesService: TemplatesService,
    private readonly whatsappService: WhatsappService,
    private readonly smsService: SmsService,
    private readonly emailService: EmailService,
    private readonly voiceCallsService: VoiceCallsService
  ) {}

  async test(currentUser: CurrentUserType, dto: TestReminderDto) {
    const automation = await this.getAutomationForBusiness(currentUser.businessId, dto.automationId);
    const client = await this.getClientForBusiness(currentUser.businessId, dto.clientId);

    const execution = await this.createExecution(automation, client.id, {
      source: "manual-test",
      variables: dto.variables ?? {}
    });

    const result = await this.executeScheduledExecution(execution.id, {
      client,
      variables: dto.variables ?? {}
    });

    return {
      message: "Reminder test executed",
      data: result
    };
  }

  async queueExecution(automation: Automation, clientId: string, payload?: Record<string, unknown>) {
    const scheduledFor = this.resolveScheduledTime(automation.scheduleType, automation.scheduleValue);
    return this.createExecution(automation, clientId, payload, scheduledFor);
  }

  async processDueExecutions() {
    const dueExecutions = await this.prisma.automationExecution.findMany({
      where: {
        status: { in: [AutomationExecutionStatus.pending, AutomationExecutionStatus.retrying] },
        scheduledFor: { lte: new Date() }
      },
      include: {
        automation: true,
        client: true
      },
      orderBy: { scheduledFor: "asc" },
      take: 50
    });

    for (const execution of dueExecutions) {
      if (!execution.client) {
        await this.failExecution(execution.id, "Client not found for scheduled automation", execution.retryCount);
        continue;
      }

      await this.executeScheduledExecution(execution.id, {
        automation: execution.automation,
        client: execution.client
      });
    }

    return dueExecutions.length;
  }

  async retryFailedExecutions() {
    const failedExecutions = await this.prisma.automationExecution.findMany({
      where: {
        status: AutomationExecutionStatus.failed,
        scheduledFor: { lte: new Date() },
        automation: {
          isActive: true
        }
      },
      include: {
        automation: true,
        client: true
      },
      take: 50
    });

    for (const execution of failedExecutions) {
      const maxRetryCount = this.getMaxRetryCount(execution.automation.executionRules);
      if (execution.retryCount >= maxRetryCount) {
        continue;
      }

      await this.prisma.automationExecution.update({
        where: { id: execution.id },
        data: {
          status: AutomationExecutionStatus.retrying,
          scheduledFor: new Date()
        }
      });
    }

    return failedExecutions.length;
  }

  async scanBirthdays() {
    const automations = await this.prisma.automation.findMany({
      where: { isActive: true, triggerType: "birthday" },
      include: { template: true }
    });

    const today = new Date();
    let queued = 0;

    for (const automation of automations) {
      const clients = await this.prisma.client.findMany({
        where: {
          businessId: automation.businessId,
          deletedAt: null,
          birthday: { not: null }
        }
      });

      for (const client of clients) {
        if (!client.birthday) continue;
        const matchesToday =
          client.birthday.getUTCDate() === today.getUTCDate() &&
          client.birthday.getUTCMonth() === today.getUTCMonth();

        if (!matchesToday) continue;
        const alreadyExecuted = await this.hasSuccessfulExecutionToday(automation.id, client.id);
        if (alreadyExecuted) continue;

        await this.queueExecution(automation, client.id, { source: "birthday-scan" });
        queued += 1;
      }
    }

    return queued;
  }

  async scanFollowUps() {
    const automations = await this.prisma.automation.findMany({
      where: { isActive: true, triggerType: "follow_up" }
    });
    let queued = 0;

    for (const automation of automations) {
      const delayDays = this.resolveDelayDays(automation.scheduleValue, automation.triggerConfig);
      const threshold = new Date(Date.now() - delayDays * 24 * 60 * 60 * 1000);

      const clients = await this.prisma.client.findMany({
        where: {
          businessId: automation.businessId,
          deletedAt: null,
          OR: [{ lastInteractionAt: null }, { lastInteractionAt: { lte: threshold } }]
        },
        take: 50
      });

      for (const client of clients) {
        const alreadyExecuted = await this.hasSuccessfulExecutionToday(automation.id, client.id);
        if (alreadyExecuted) continue;
        await this.queueExecution(automation, client.id, { source: "follow-up-scan" });
        queued += 1;
      }
    }

    return queued;
  }

  async scanAppointmentReminders() {
    const automations = await this.prisma.automation.findMany({
      where: { isActive: true, triggerType: "appointment_reminder" }
    });
    let queued = 0;

    for (const automation of automations) {
      const clients = await this.prisma.client.findMany({
        where: {
          businessId: automation.businessId,
          deletedAt: null,
          preferredContactTime: { not: null }
        },
        take: 50
      });

      for (const client of clients) {
        const alreadyExecuted = await this.hasSuccessfulExecutionToday(automation.id, client.id);
        if (alreadyExecuted) continue;
        await this.queueExecution(automation, client.id, { source: "appointment-reminder-scan" });
        queued += 1;
      }
    }

    return queued;
  }

  async scanFeedbackPending() {
    const automations = await this.prisma.automation.findMany({
      where: { isActive: true, triggerType: "feedback_request" }
    });
    let queued = 0;

    for (const automation of automations) {
      const recentCalls = await this.prisma.voiceCall.findMany({
        where: {
          businessId: automation.businessId,
          status: "completed",
          clientId: { not: null }
        },
        orderBy: { createdAt: "desc" },
        take: 50
      });

      for (const call of recentCalls) {
        if (!call.clientId) continue;
        const alreadyExecuted = await this.hasSuccessfulExecutionToday(automation.id, call.clientId);
        if (alreadyExecuted) continue;
        await this.queueExecution(automation, call.clientId, {
          source: "feedback-scan",
          voiceCallId: call.id
        });
        queued += 1;
      }
    }

    return queued;
  }

  async scanMissedCalls() {
    const automations = await this.prisma.automation.findMany({
      where: { isActive: true, triggerType: "missed_call" }
    });
    let queued = 0;

    for (const automation of automations) {
      const missedCalls = await this.prisma.voiceCall.findMany({
        where: {
          businessId: automation.businessId,
          status: "missed"
        },
        orderBy: { createdAt: "desc" },
        take: 50
      });

      for (const call of missedCalls) {
        const clientId =
          call.clientId ??
          (
            await this.prisma.client.findFirst({
              where: {
                businessId: automation.businessId,
                OR: [{ phone: call.customerPhone ?? "" }, { whatsapp: call.customerPhone ?? "" }]
              }
            })
          )?.id;

        if (!clientId) continue;
        const existing = await this.prisma.automationExecution.findFirst({
          where: {
            automationId: automation.id,
            voiceCallId: call.id
          }
        });

        if (existing) continue;
        await this.queueExecution(automation, clientId, {
          source: "missed-call-scan",
          voiceCallId: call.id
        });
        queued += 1;
      }
    }

    return queued;
  }

  async executeScheduledExecution(
    executionId: string,
    options?: {
      automation?: Automation;
      client?: { id: string; fullName: string; phone: string; whatsapp: string | null; email: string | null };
      variables?: Record<string, string | number>;
    }
  ) {
    const execution = await this.prisma.automationExecution.findUnique({
      where: { id: executionId },
      include: {
        automation: true,
        client: true
      }
    });

    if (!execution) throw new ResourceNotFoundException("Automation execution not found");
    if (!execution.client && !options?.client) throw new ResourceNotFoundException("Client not found for execution");

    const automation = options?.automation ?? execution.automation;
    const client = options?.client ?? execution.client!;

    await this.prisma.automationExecution.update({
      where: { id: execution.id },
      data: {
        status: AutomationExecutionStatus.running,
        startedAt: new Date()
      }
    });

    try {
      const dispatchResult = await this.dispatchAutomation(automation, client, options?.variables ?? {}, execution);
      const metadata = this.mergeMetadata(execution.metadata, {
        lastResult: dispatchResult,
        retryHistory: this.extractRetryHistory(execution.metadata)
      });

      const updated = await this.prisma.automationExecution.update({
        where: { id: execution.id },
        data: {
          status: AutomationExecutionStatus.success,
          messageId: dispatchResult.messageId,
          voiceCallId: dispatchResult.voiceCallId,
          executedAt: new Date(),
          completedAt: new Date(),
          errorMessage: null,
          metadata: metadata as Prisma.InputJsonValue
        }
      });

      await this.prisma.automation.update({
        where: { id: automation.id },
        data: {
          lastRunAt: new Date(),
          nextRunAt: this.calculateNextRun(automation)
        }
      });

      await this.logAutomationActivity(automation.businessId, automation.id, client.id, "Automation executed");
      return updated;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown automation failure";
      return this.failExecution(execution.id, message, execution.retryCount);
    }
  }

  private async dispatchAutomation(
    automation: Automation,
    client: { id: string; fullName: string; phone: string; whatsapp: string | null; email: string | null },
    variables: Record<string, string | number>,
    execution: { id: string; metadata: Prisma.JsonValue | null }
  ) {
    const mergedVariables = {
      name: client.fullName,
      phone: client.phone,
      email: client.email ?? "",
      whatsapp: client.whatsapp ?? "",
      ...variables
    };

    const rendered = await this.renderAutomationContent(automation, mergedVariables);

    if (automation.channel === AutomationChannel.whatsapp) {
      const phone = client.whatsapp ?? client.phone;
      const sent = await this.whatsappService.sendAutomationMessage(automation.businessId, {
        clientId: client.id,
        phone,
        message: rendered.content
      });

      return {
        kind: "message",
        messageId: sent.id,
        voiceCallId: null
      };
    }

    if (automation.channel === AutomationChannel.sms || automation.actionType === AutomationActionType.send_sms) {
      const sent = await this.smsService.sendAutomationMessage(automation.businessId, {
        clientId: client.id,
        phone: client.phone,
        message: rendered.content
      });

      return {
        kind: "message",
        messageId: sent.id,
        voiceCallId: null
      };
    }

    if (automation.channel === AutomationChannel.email || automation.actionType === AutomationActionType.send_email) {
      if (!client.email) throw new Error("Client email is missing");
      const sent = await this.emailService.sendAutomationMessage(automation.businessId, {
        clientId: client.id,
        to: client.email,
        subject: rendered.subject ?? automation.name,
        body: rendered.content
      });

      return {
        kind: "message",
        messageId: sent.id,
        voiceCallId: null
      };
    }

    const call = await this.voiceCallsService.createAutomationCall({
      businessId: automation.businessId,
      clientId: client.id,
      customerName: client.fullName,
      customerPhone: client.phone,
      metadata: {
        automationId: automation.id,
        executionId: execution.id
      } as Prisma.InputJsonValue
    });

    return {
      kind: "voice_call",
      messageId: null,
      voiceCallId: call.id
    };
  }

  private async renderAutomationContent(
    automation: Automation,
    variables: Record<string, string | number>
  ): Promise<{ subject?: string; content: string }> {
    if (!automation.templateId) {
      return {
        subject: automation.name,
        content: `${automation.name} for ${variables.name ?? "client"}`
      };
    }

    const template = await this.templatesService.findByBusinessId(automation.businessId, automation.templateId);
    const content = this.templatesService.renderTemplate(template.content, variables);
    return {
      subject: template.name,
      content
    };
  }

  private async createExecution(
    automation: Automation,
    clientId: string,
    payload?: Record<string, unknown>,
    scheduledFor?: Date
  ) {
    return this.prisma.automationExecution.create({
      data: {
        automationId: automation.id,
        businessId: automation.businessId,
        clientId,
        status: AutomationExecutionStatus.pending,
        scheduledFor: scheduledFor ?? new Date(),
        executionPayload: payload as Prisma.InputJsonValue | undefined,
        metadata: {
          source: payload?.source ?? "automation",
          retryHistory: []
        } as Prisma.InputJsonValue
      }
    });
  }

  private async failExecution(executionId: string, errorMessage: string, retryCount: number) {
    const execution = await this.prisma.automationExecution.findUnique({
      where: { id: executionId },
      include: { automation: true }
    });

    if (!execution) throw new ResourceNotFoundException("Automation execution not found");

    const nextRetryCount = retryCount + 1;
    const maxRetryCount = this.getMaxRetryCount(execution.automation.executionRules);
    const retryHistory = this.extractRetryHistory(execution.metadata);
    retryHistory.push({
      attempt: nextRetryCount,
      error: errorMessage,
      at: new Date().toISOString()
    });

    const shouldRetry = nextRetryCount <= maxRetryCount;
    const retryAt = shouldRetry ? new Date(Date.now() + this.defaultRetryMinutes * 60 * 1000) : execution.scheduledFor;

    const updated = await this.prisma.automationExecution.update({
      where: { id: executionId },
      data: {
        status: shouldRetry ? AutomationExecutionStatus.retrying : AutomationExecutionStatus.failed,
        retryCount: nextRetryCount,
        errorMessage,
        executedAt: new Date(),
        completedAt: new Date(),
        scheduledFor: retryAt ?? undefined,
        metadata: {
          ...(this.asRecord(execution.metadata) ?? {}),
          retryHistory
        } as Prisma.InputJsonValue
      }
    });

    this.logger.warn(`Automation execution ${executionId} failed: ${errorMessage}`);
    return updated;
  }

  private async getAutomationForBusiness(businessId: string, automationId: string) {
    const automation = await this.prisma.automation.findFirst({
      where: { id: automationId, businessId, isActive: true }
    });

    if (!automation) throw new ResourceNotFoundException("Automation not found");
    return automation;
  }

  private async getClientForBusiness(businessId: string, clientId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id: clientId, businessId, deletedAt: null }
    });

    if (!client) throw new ResourceNotFoundException("Client not found");
    return client;
  }

  private async hasSuccessfulExecutionToday(automationId: string, clientId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const existing = await this.prisma.automationExecution.findFirst({
      where: {
        automationId,
        clientId,
        status: AutomationExecutionStatus.success,
        executedAt: {
          gte: start,
          lte: end
        }
      }
    });

    return Boolean(existing);
  }

  private resolveScheduledTime(scheduleType: AutomationScheduleType, scheduleValue?: string | null) {
    if (scheduleType === AutomationScheduleType.instant || !scheduleValue) {
      return new Date();
    }

    const now = new Date();
    if (scheduleValue.endsWith("m")) {
      return new Date(now.getTime() + Number(scheduleValue.slice(0, -1)) * 60 * 1000);
    }

    if (scheduleValue.endsWith("h")) {
      return new Date(now.getTime() + Number(scheduleValue.slice(0, -1)) * 60 * 60 * 1000);
    }

    if (scheduleValue.endsWith("d")) {
      return new Date(now.getTime() + Number(scheduleValue.slice(0, -1)) * 24 * 60 * 60 * 1000);
    }

    return now;
  }

  private resolveDelayDays(scheduleValue?: string | null, triggerConfig?: Prisma.JsonValue | null) {
    if (scheduleValue?.endsWith("d")) {
      return Number(scheduleValue.slice(0, -1)) || 2;
    }

    const config = this.asRecord(triggerConfig);
    return Number(config?.delayDays ?? 2);
  }

  private calculateNextRun(automation: Automation) {
    if (automation.scheduleType !== AutomationScheduleType.recurring) return null;
    if (automation.scheduleValue?.includes(":")) {
      const [hours, minutes] = automation.scheduleValue.split(":").map((value) => Number(value));
      const next = new Date();
      next.setDate(next.getDate() + 1);
      next.setHours(hours || 9, minutes || 0, 0, 0);
      return next;
    }

    return new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  private getMaxRetryCount(executionRules: Prisma.JsonValue | null) {
    const rules = this.asRecord(executionRules);
    return Number(rules?.maxRetryCount ?? this.defaultMaxRetries);
  }

  private extractRetryHistory(metadata: Prisma.JsonValue | null) {
    const record = this.asRecord(metadata);
    const history = record?.retryHistory;
    return Array.isArray(history) ? [...history] : [];
  }

  private mergeMetadata(current: Prisma.JsonValue | null, next: Record<string, unknown>) {
    return {
      ...(this.asRecord(current) ?? {}),
      ...next
    };
  }

  private asRecord(value: Prisma.JsonValue | null | undefined) {
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  }

  private async logAutomationActivity(businessId: string, automationId: string, clientId: string, title: string) {
    await this.prisma.activityLog.create({
      data: {
        businessId,
        automationId,
        clientId,
        entityType: "automation",
        entityId: automationId,
        activityType: ActivityType.automation_executed,
        title
      }
    });
  }
}
