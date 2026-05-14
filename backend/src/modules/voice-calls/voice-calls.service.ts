import { Injectable } from "@nestjs/common";
import { ActivityType, CallDirection, CallStatus, CallType, Prisma, SentimentLabel, VoiceCall } from "@prisma/client";

import { ResourceNotFoundException } from "../../common/exceptions/app.exception";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { buildPaginationMeta } from "../../common/utils/pagination";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateVoiceCallDto } from "./dto/create-voice-call.dto";
import { ListVoiceCallsDto } from "./dto/list-voice-calls.dto";
import { UpdateVoiceCallDto } from "./dto/update-voice-call.dto";
import { generateMockCallSid } from "./helpers/mock-call-content.helper";

type WebhookCallInput = {
  businessId: string;
  callSid: string;
  from: string;
  to: string;
  status?: CallStatus;
  duration?: number;
  customerName?: string;
  direction?: CallDirection;
  rawPayload: unknown;
};

@Injectable()
export class VoiceCallsService {
  constructor(private readonly prisma: PrismaService) {}

  async createOutgoing(currentUser: CurrentUserType, dto: CreateVoiceCallDto) {
    const business = await this.resolveBusiness(currentUser.businessId, dto.businessId);
    const callSid = dto.callSid ?? generateMockCallSid();

    const call = await this.prisma.voiceCall.create({
      data: {
        businessId: business.id,
        clientId: dto.clientId,
        callSid,
        providerCallId: callSid,
        direction: dto.direction ?? CallDirection.outgoing,
        callType: CallType.outgoing_call,
        status: CallStatus.initiated,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        fromNumber: dto.fromNumber ?? business.phone ?? "+910000000000",
        toNumber: dto.toNumber ?? dto.customerPhone,
        startedAt: new Date(),
        metadata: {
          source: "manual-outgoing",
          mockProvider: "mock-twilio"
        }
      }
    });

    await this.logCallActivity(business.id, call.id, ActivityType.call_created, "Outgoing call created");

    return {
      message: "Outgoing call created",
      data: call
    };
  }

  async createAutomationCall(input: {
    businessId: string;
    clientId?: string | null;
    customerName?: string | null;
    customerPhone: string;
    fromNumber?: string;
    toNumber?: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    const business = await this.resolveBusiness(input.businessId);
    const callSid = generateMockCallSid();

    const call = await this.prisma.voiceCall.create({
      data: {
        businessId: business.id,
        clientId: input.clientId ?? undefined,
        callSid,
        providerCallId: callSid,
        direction: CallDirection.outgoing,
        callType: CallType.reminder_call,
        status: CallStatus.initiated,
        customerName: input.customerName ?? undefined,
        customerPhone: input.customerPhone,
        fromNumber: input.fromNumber ?? business.phone ?? "+910000000000",
        toNumber: input.toNumber ?? input.customerPhone,
        startedAt: new Date(),
        metadata: {
          source: "automation-reminder",
          mockProvider: "mock-twilio",
          ...(input.metadata && typeof input.metadata === "object" ? (input.metadata as Record<string, unknown>) : {})
        }
      }
    });

    await this.logCallActivity(business.id, call.id, ActivityType.call_created, "Automation reminder call created");

    return call;
  }

  async findAll(currentUser: CurrentUserType, query: ListVoiceCallsDto) {
    const where: Prisma.VoiceCallWhereInput = {
      businessId: currentUser.businessId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.direction ? { direction: query.direction } : {}),
      ...(query.phone
        ? {
            OR: [
              { customerPhone: { contains: query.phone, mode: "insensitive" } },
              { fromNumber: { contains: query.phone, mode: "insensitive" } },
              { toNumber: { contains: query.phone, mode: "insensitive" } }
            ]
          }
        : {})
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.voiceCall.findMany({
        where,
        skip: (query.page! - 1) * query.limit!,
        take: query.limit,
        orderBy: { createdAt: "desc" },
        include: {
          transcript: true,
          recording: true,
          aiSummary: true
        }
      }),
      this.prisma.voiceCall.count({ where })
    ]);

    return { data, meta: buildPaginationMeta(total, query.page, query.limit) };
  }

  async findOne(currentUser: CurrentUserType, id: string) {
    const call = await this.findCallForBusinessOrThrow(currentUser.businessId, id);
    return { data: call };
  }

  async updateStatus(currentUser: CurrentUserType, id: string, status: CallStatus) {
    await this.findCallForBusinessOrThrow(currentUser.businessId, id);

    const data: Prisma.VoiceCallUpdateInput = {
      status,
      ...(status === CallStatus.in_progress ? { startedAt: new Date() } : {}),
      ...(this.isFinalStatus(status) ? { endedAt: new Date() } : {})
    };

    const call = await this.prisma.voiceCall.update({
      where: { id },
      data
    });

    await this.logCallActivity(currentUser.businessId, id, ActivityType.call_updated, `Call status updated to ${status}`);

    return {
      message: "Call status updated",
      data: call
    };
  }

  async update(currentUser: CurrentUserType, id: string, dto: UpdateVoiceCallDto) {
    await this.findCallForBusinessOrThrow(currentUser.businessId, id);

    const call = await this.prisma.voiceCall.update({
      where: { id },
      data: {
        status: dto.status,
        recordingUrl: dto.recordingUrl,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        durationSeconds: dto.duration
      }
    });

    await this.logCallActivity(currentUser.businessId, id, ActivityType.call_updated, "Call details updated");

    return {
      message: "Voice call updated",
      data: call
    };
  }

  async getTranscript(currentUser: CurrentUserType, id: string) {
    await this.findCallForBusinessOrThrow(currentUser.businessId, id);
    const transcript = await this.prisma.voiceCallTranscript.findUnique({
      where: { voiceCallId: id }
    });

    if (!transcript) {
      throw new ResourceNotFoundException("Transcript not found");
    }

    return { data: transcript };
  }

  async getSummary(currentUser: CurrentUserType, id: string) {
    await this.findCallForBusinessOrThrow(currentUser.businessId, id);
    const summary = await this.prisma.aICallSummary.findUnique({
      where: { callId: id }
    });

    if (!summary) {
      throw new ResourceNotFoundException("AI summary not found");
    }

    return { data: summary };
  }

  async findCallForBusinessOrThrow(businessId: string, id: string) {
    const call = await this.prisma.voiceCall.findFirst({
      where: { id, businessId },
      include: {
        transcript: true,
        recording: true,
        aiSummary: true
      }
    });

    if (!call) {
      throw new ResourceNotFoundException("Voice call not found");
    }

    return call;
  }

  async findByCallSid(businessId: string, callSid: string) {
    return this.prisma.voiceCall.findFirst({
      where: {
        businessId,
        OR: [{ callSid }, { providerCallId: callSid }]
      }
    });
  }

  async createOrUpdateFromWebhook(input: WebhookCallInput) {
    const existing = await this.findByCallSid(input.businessId, input.callSid);
    const direction = input.direction ?? this.inferDirection(input);
    const callType = direction === CallDirection.incoming ? CallType.incoming_call : CallType.outgoing_call;
    const endedAt = this.isFinalStatus(input.status) ? new Date() : undefined;
    const startedAt = input.status === CallStatus.in_progress || input.status === CallStatus.completed ? new Date() : undefined;

    if (existing) {
      return this.prisma.voiceCall.update({
        where: { id: existing.id },
        data: {
          status: input.status ?? existing.status,
          durationSeconds: input.duration ?? existing.durationSeconds,
          customerName: input.customerName ?? existing.customerName,
          customerPhone: existing.customerPhone ?? input.from,
          webhookPayload: input.rawPayload as Prisma.InputJsonValue,
          startedAt: existing.startedAt ?? startedAt,
          endedAt: endedAt ?? existing.endedAt
        }
      });
    }

    return this.prisma.voiceCall.create({
      data: {
        businessId: input.businessId,
        callSid: input.callSid,
        providerCallId: input.callSid,
        direction,
        callType,
        status: input.status ?? CallStatus.initiated,
        customerName: input.customerName,
        customerPhone: input.from,
        fromNumber: input.from,
        toNumber: input.to,
        startedAt,
        endedAt,
        durationSeconds: input.duration ?? 0,
        webhookPayload: input.rawPayload as Prisma.InputJsonValue,
        metadata: {
          source: "webhook",
          mockProvider: "mock-twilio"
        }
      }
    });
  }

  async markPipelineGenerated(callId: string, payload: { transcriptId?: string; aiSummaryId?: string; recordingUrl?: string; sentiment?: SentimentLabel }) {
    return this.prisma.voiceCall.update({
      where: { id: callId },
      data: {
        transcriptId: payload.transcriptId,
        aiSummaryId: payload.aiSummaryId,
        recordingUrl: payload.recordingUrl,
        transcriptStatus: payload.transcriptId ? "generated" : undefined,
        summaryStatus: payload.aiSummaryId ? "generated" : undefined,
        sentiment: payload.sentiment
      }
    });
  }

  private async resolveBusiness(currentBusinessId: string, overrideBusinessId?: string) {
    if (!overrideBusinessId || overrideBusinessId === currentBusinessId) {
      const business = await this.prisma.business.findUnique({ where: { id: currentBusinessId } });
      if (!business) throw new ResourceNotFoundException("Business not found");
      return business;
    }

    const business = await this.prisma.business.findUnique({ where: { id: overrideBusinessId } });
    if (!business) throw new ResourceNotFoundException("Business not found");
    return business;
  }

  private inferDirection(input: Pick<WebhookCallInput, "from" | "to">) {
    return input.to.startsWith("+91") ? CallDirection.incoming : CallDirection.outgoing;
  }

  private isFinalStatus(status?: CallStatus) {
    return status === CallStatus.completed || status === CallStatus.failed || status === CallStatus.missed;
  }

  private async logCallActivity(businessId: string, voiceCallId: string, activityType: ActivityType, title: string) {
    await this.prisma.activityLog.create({
      data: {
        businessId,
        voiceCallId,
        entityType: "voice_call",
        entityId: voiceCallId,
        activityType,
        title
      }
    });
  }
}
