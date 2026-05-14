import { Injectable } from "@nestjs/common";
import { ActivityType } from "@prisma/client";

import { ResourceNotFoundException } from "../../common/exceptions/app.exception";
import { PrismaService } from "../../prisma/prisma.service";
import { VoiceCallsService } from "../voice-calls/voice-calls.service";
import { generateMockRecordingUrl } from "../voice-calls/helpers/mock-call-content.helper";
import { CreateRecordingDto } from "./dto/create-recording.dto";

@Injectable()
export class RecordingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly voiceCallsService: VoiceCallsService
  ) {}

  async create(callId: string, dto?: CreateRecordingDto) {
    const call = await this.prisma.voiceCall.findUnique({ where: { id: callId } });

    if (!call) {
      throw new ResourceNotFoundException("Voice call not found");
    }

    const recordingUrl = dto?.recordingUrl ?? generateMockRecordingUrl(callId);

    const recording = await this.prisma.callRecording.upsert({
      where: { callId },
      update: {
        recordingUrl,
        publicUrl: recordingUrl,
        provider: dto?.provider ?? "mock-storage",
        storageProvider: dto?.provider ?? "mock-storage",
        durationSeconds: dto?.duration ?? call.durationSeconds
      },
      create: {
        callId,
        recordingUrl,
        publicUrl: recordingUrl,
        provider: dto?.provider ?? "mock-storage",
        storageProvider: dto?.provider ?? "mock-storage",
        durationSeconds: dto?.duration ?? call.durationSeconds
      }
    });

    await this.voiceCallsService.markPipelineGenerated(callId, {
      recordingUrl
    });

    await this.prisma.activityLog.create({
      data: {
        businessId: call.businessId,
        voiceCallId: call.id,
        entityType: "call_recording",
        entityId: recording.id,
        activityType: ActivityType.call_updated,
        title: "Recording metadata stored"
      }
    });

    return {
      message: "Recording metadata saved",
      data: recording
    };
  }

  async findByCallId(callId: string) {
    const recording = await this.prisma.callRecording.findUnique({
      where: { callId }
    });

    if (!recording) {
      throw new ResourceNotFoundException("Recording not found");
    }

    return { data: recording };
  }
}
