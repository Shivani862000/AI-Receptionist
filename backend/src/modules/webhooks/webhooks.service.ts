import { Injectable } from "@nestjs/common";
import { CallDirection, CallStatus, Prisma } from "@prisma/client";

import { ResourceNotFoundException } from "../../common/exceptions/app.exception";
import { PrismaService } from "../../prisma/prisma.service";
import { AiSummaryService } from "../ai-summary/ai-summary.service";
import { RecordingsService } from "../recordings/recordings.service";
import { TranscriptsService } from "../transcripts/transcripts.service";
import { VoiceCallsService } from "../voice-calls/voice-calls.service";
import { BaseCallWebhookDto } from "./dto/base-call-webhook.dto";

@Injectable()
export class WebhooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly voiceCallsService: VoiceCallsService,
    private readonly transcriptsService: TranscriptsService,
    private readonly aiSummaryService: AiSummaryService,
    private readonly recordingsService: RecordingsService
  ) {}

  async handleIncoming(payload: BaseCallWebhookDto) {
    const business = await this.resolveBusiness(payload);

    const webhookEvent = await this.logWebhookEvent(business.id, "call.incoming", payload);
    const call = await this.voiceCallsService.createOrUpdateFromWebhook({
      businessId: business.id,
      callSid: payload.callSid,
      from: payload.from,
      to: payload.to,
      status: payload.status ?? CallStatus.ringing,
      duration: payload.duration,
      customerName: payload.customerName,
      direction: CallDirection.incoming,
      rawPayload: payload
    });

    return {
      message: "Incoming call webhook processed",
      data: {
        webhookEventId: webhookEvent.id,
        call
      }
    };
  }

  async handleStatus(payload: BaseCallWebhookDto) {
    const business = await this.resolveBusiness(payload);

    const webhookEvent = await this.logWebhookEvent(business.id, "call.status", payload);
    const call = await this.voiceCallsService.createOrUpdateFromWebhook({
      businessId: business.id,
      callSid: payload.callSid,
      from: payload.from,
      to: payload.to,
      status: payload.status ?? CallStatus.in_progress,
      duration: payload.duration,
      customerName: payload.customerName,
      rawPayload: payload
    });

    return {
      message: "Call status webhook processed",
      data: {
        webhookEventId: webhookEvent.id,
        call
      }
    };
  }

  async handleCompleted(payload: BaseCallWebhookDto) {
    const business = await this.resolveBusiness(payload);

    const webhookEvent = await this.logWebhookEvent(business.id, "call.completed", payload);
    const call = await this.voiceCallsService.createOrUpdateFromWebhook({
      businessId: business.id,
      callSid: payload.callSid,
      from: payload.from,
      to: payload.to,
      status: payload.status ?? CallStatus.completed,
      duration: payload.duration,
      customerName: payload.customerName,
      rawPayload: payload
    });

    const transcript = await this.transcriptsService.generate(call.id, {
      provider: "mock-transcriber",
      language: "en",
      confidence: 0.92
    });
    const summary = await this.aiSummaryService.generate(call.id, {
      modelName: "mock-gpt-summary"
    });
    const recording = await this.recordingsService.create(call.id, {
      provider: "mock-storage",
      duration: payload.duration ?? call.durationSeconds
    });

    return {
      message: "Completed call webhook processed",
      data: {
        webhookEventId: webhookEvent.id,
        callId: call.id,
        transcript: transcript.data,
        summary: summary.data,
        recording: recording.data
      }
    };
  }

  private async resolveBusiness(payload: BaseCallWebhookDto) {
    if (payload.businessId) {
      const business = await this.prisma.business.findUnique({ where: { id: payload.businessId } });
      if (!business) throw new ResourceNotFoundException("Business not found for webhook");
      return business;
    }

    const business = await this.prisma.business.findFirst({
      where: {
        OR: [{ phone: payload.to }, { phone: payload.from }]
      }
    });

    if (business) {
      return business;
    }

    const fallbackBusiness = await this.prisma.business.findFirst({
      orderBy: { createdAt: "asc" }
    });

    if (!fallbackBusiness) {
      throw new ResourceNotFoundException("No business found for webhook processing");
    }

    return fallbackBusiness;
  }

  private logWebhookEvent(businessId: string, eventType: string, payload: BaseCallWebhookDto) {
    return this.prisma.webhookEvent.create({
      data: {
        businessId,
        eventType,
        provider: "mock-provider",
        callSid: payload.callSid,
        payload: payload as unknown as Prisma.InputJsonValue
      }
    });
  }
}
