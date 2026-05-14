import { Injectable } from "@nestjs/common";
import { ActivityType } from "@prisma/client";

import { ResourceNotFoundException } from "../../common/exceptions/app.exception";
import { PrismaService } from "../../prisma/prisma.service";
import { AiProviderService } from "../ai/services/ai-provider.service";
import { VoiceCallsService } from "../voice-calls/voice-calls.service";
import { generateMockSummary } from "../voice-calls/helpers/mock-call-content.helper";
import { GenerateAiSummaryDto } from "./dto/generate-ai-summary.dto";

@Injectable()
export class AiSummaryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly voiceCallsService: VoiceCallsService,
    private readonly aiProviderService: AiProviderService
  ) {}

  async generate(callId: string, dto?: GenerateAiSummaryDto) {
    const call = await this.prisma.voiceCall.findUnique({ where: { id: callId } });

    if (!call) {
      throw new ResourceNotFoundException("Voice call not found");
    }

    const transcript = await this.prisma.voiceCallTranscript.findUnique({
      where: { voiceCallId: callId }
    });

    const providerResult = transcript?.transcriptText
      ? await this.aiProviderService.generateSummary({
          transcript: transcript.transcriptText,
          customerName: call.customerName,
          businessName: null
        })
      : null;

    const summaryPayload = providerResult?.data ?? generateMockSummary(call);

    const summary = await this.prisma.aICallSummary.upsert({
      where: { callId },
      update: {
        summary: summaryPayload.summary,
        summaryText: summaryPayload.summary,
        keyPoints: summaryPayload.keyPoints,
        followUpRequired: summaryPayload.followUpRequired,
        followUpSuggestion: summaryPayload.followUpSuggestion,
        sentiment: summaryPayload.sentiment,
        modelName: dto?.modelName ?? providerResult?.model ?? "mock-gpt-summary",
        rawResponse: (providerResult?.rawResponse as never) ?? undefined
      },
      create: {
        callId,
        summary: summaryPayload.summary,
        summaryText: summaryPayload.summary,
        keyPoints: summaryPayload.keyPoints,
        followUpRequired: summaryPayload.followUpRequired,
        followUpSuggestion: summaryPayload.followUpSuggestion,
        sentiment: summaryPayload.sentiment,
        modelName: dto?.modelName ?? providerResult?.model ?? "mock-gpt-summary",
        rawResponse: (providerResult?.rawResponse as never) ?? undefined
      }
    });

    await this.voiceCallsService.markPipelineGenerated(callId, {
      aiSummaryId: summary.id,
      sentiment: summary.sentiment ?? undefined
    });

    await this.prisma.activityLog.create({
      data: {
        businessId: call.businessId,
        voiceCallId: call.id,
        entityType: "ai_summary",
        entityId: summary.id,
        activityType: ActivityType.ai_summary_generated,
        title: "AI summary generated"
      }
    });

    return {
      message: "AI summary generated",
      data: summary
    };
  }

  async findByCallId(callId: string) {
    const summary = await this.prisma.aICallSummary.findUnique({
      where: { callId }
    });

    if (!summary) {
      throw new ResourceNotFoundException("AI summary not found");
    }

    return { data: summary };
  }
}
