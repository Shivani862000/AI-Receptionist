import { Injectable } from "@nestjs/common";
import { ActivityType } from "@prisma/client";

import { ResourceNotFoundException } from "../../common/exceptions/app.exception";
import { PrismaService } from "../../prisma/prisma.service";
import { SttService } from "../stt/stt.service";
import { VoiceCallsService } from "../voice-calls/voice-calls.service";
import { GenerateTranscriptDto } from "./dto/generate-transcript.dto";
import { generateMockTranscript } from "../voice-calls/helpers/mock-call-content.helper";

@Injectable()
export class TranscriptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly voiceCallsService: VoiceCallsService,
    private readonly sttService: SttService
  ) {}

  async generate(callId: string, dto?: GenerateTranscriptDto) {
    const call = await this.prisma.voiceCall.findUnique({ where: { id: callId } });

    if (!call) {
      throw new ResourceNotFoundException("Voice call not found");
    }

    if (dto?.audioUrl || call.recordingUrl) {
      return this.sttService.transcribeForCall(callId, {
        audioUrl: dto?.audioUrl ?? call.recordingUrl ?? undefined,
        language: dto?.language ?? "en"
      });
    }

    const transcriptText = generateMockTranscript(call);

    const transcript = await this.prisma.voiceCallTranscript.upsert({
      where: { voiceCallId: callId },
      update: {
        transcriptText,
        language: dto?.language ?? "en",
        confidence: dto?.confidence ?? 0.92,
        provider: dto?.provider ?? "mock-transcriber"
      },
      create: {
        voiceCallId: callId,
        transcriptText,
        language: dto?.language ?? "en",
        confidence: dto?.confidence ?? 0.92,
        provider: dto?.provider ?? "mock-transcriber"
      }
    });

    await this.voiceCallsService.markPipelineGenerated(callId, {
      transcriptId: transcript.id
    });

    await this.prisma.voiceCall.update({
      where: { id: callId },
      data: {
        transcriptStatus: "generated"
      }
    });

    await this.prisma.activityLog.create({
      data: {
        businessId: call.businessId,
        voiceCallId: call.id,
        entityType: "voice_call_transcript",
        entityId: transcript.id,
        activityType: ActivityType.call_updated,
        title: "Transcript generated"
      }
    });

    return {
      message: "Transcript generated",
      data: transcript
    };
  }

  async findByCallId(callId: string) {
    const transcript = await this.prisma.voiceCallTranscript.findUnique({
      where: { voiceCallId: callId }
    });

    if (!transcript) {
      throw new ResourceNotFoundException("Transcript not found");
    }

    return { data: transcript };
  }
}
