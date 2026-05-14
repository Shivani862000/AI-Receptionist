import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

import { AppLoggerService } from "../../common/logger/app-logger.service";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { PrismaService } from "../../prisma/prisma.service";
import { AudioChunkDto } from "./dto/audio-chunk.dto";
import { ListLiveSessionsDto } from "./dto/list-live-sessions.dto";
import { StartSessionDto } from "./dto/start-session.dto";
import { StopSessionDto } from "./dto/stop-session.dto";
import { RealtimeAiService } from "./services/realtime-ai.service";
import { RealtimeSttService } from "./services/realtime-stt.service";
import { RealtimeTtsService } from "./services/realtime-tts.service";
import { LiveSessionManagerService } from "./services/live-session-manager.service";

@Injectable()
export class RealtimeService {
  constructor(
    private readonly liveSessionManagerService: LiveSessionManagerService,
    private readonly realtimeSttService: RealtimeSttService,
    private readonly realtimeAiService: RealtimeAiService,
    private readonly realtimeTtsService: RealtimeTtsService,
    private readonly prisma: PrismaService,
    private readonly logger: AppLoggerService
  ) {}

  async startSession(
    currentUser: CurrentUserType | null,
    socketId: string | undefined,
    dto: StartSessionDto
  ) {
    const session = this.liveSessionManagerService.createOrResumeSession({
      sessionId: dto.sessionId,
      socketId,
      clientId: dto.clientId ?? null,
      businessId: currentUser?.businessId ?? dto.businessId ?? null,
      callId: dto.callId ?? null,
      channel: dto.channel ?? "browser",
      language: dto.language ?? "en",
      voice: dto.voice ?? null,
      metadata: {
        userId: currentUser?.userId ?? null,
        customerName: dto.customerName ?? null
      }
    });

    this.realtimeSttService.startStreaming(
      session.sessionId,
      {
        onPartialTranscript: (text) => {
          this.liveSessionManagerService.setPartialTranscript(session.sessionId, text);
        },
        onFinalTranscript: (text) => {
          this.liveSessionManagerService.appendTranscript(session.sessionId, {
            speaker: "caller",
            text,
            isFinal: true
          });
        },
        onError: (message) => {
          this.liveSessionManagerService.setStatus(session.sessionId, "error", "system");
          this.logger.warn(message, RealtimeService.name, {
            sessionId: session.sessionId
          });
        }
      },
      {
        language: session.language,
        transport: session.channel === "twilio" ? "twilio" : "browser"
      }
    );

    return session;
  }

  async startExternalSession(input: {
    channel: "twilio";
    callId?: string | null;
    twilioStreamSid?: string | null;
    businessId?: string | null;
    clientId?: string | null;
    language?: string;
    voice?: string | null;
    metadata?: Record<string, unknown>;
  }) {
    const session = await this.startSession(
      null,
      undefined,
      {
        channel: input.channel,
        callId: input.callId ?? undefined,
        businessId: input.businessId ?? undefined,
        clientId: input.clientId ?? undefined,
        language: input.language ?? "en",
        voice: input.voice ?? undefined,
        customerName: typeof input.metadata?.customerName === "string" ? input.metadata.customerName : undefined
      }
    );

    const existing = this.liveSessionManagerService.getRequired(session.sessionId);
    existing.twilioStreamSid = input.twilioStreamSid ?? null;
    existing.metadata = {
      ...existing.metadata,
      ...(input.metadata ?? {})
    };

    return existing;
  }

  async handleIncomingChunk(
    sessionId: string,
    dto: Omit<AudioChunkDto, "sessionId">,
    emitter?: {
      partialTranscript?: (text: string) => void;
      finalTranscript?: (text: string) => void;
      sessionStatus?: (payload: Record<string, unknown>) => void;
      aiResponseChunk?: (payload: Record<string, unknown>) => void;
      ttsAudioChunk?: (payload: Record<string, unknown>) => void;
    }
  ) {
    const startedAt = Date.now();
    this.liveSessionManagerService.incrementAudioChunkCount(sessionId);
    const audioBuffer = dto.audioBase64 ? Buffer.from(dto.audioBase64, "base64") : undefined;

    const sttResult = this.realtimeSttService.ingestChunk(sessionId, {
      audioBuffer,
      textHint: dto.textHint,
      transport: dto.transport
    });

    if (sttResult.partialTranscript) {
      emitter?.partialTranscript?.(sttResult.partialTranscript);
    }

    if (dto.isFinal) {
      const finalText = this.realtimeSttService.finalize(sessionId, {
        finalText: dto.textHint
      });
      emitter?.finalTranscript?.(finalText);
      await this.streamAgentReply(sessionId, finalText, emitter, startedAt);
    }
  }

  async stopSession(
    sessionId: string,
    dto: StopSessionDto,
    emitter?: { sessionStatus?: (payload: Record<string, unknown>) => void }
  ) {
    const session = this.liveSessionManagerService.getRequired(sessionId);

    if (session.transcriptState.partial.trim()) {
      await this.streamAgentReply(sessionId, this.realtimeSttService.finalize(sessionId), undefined, Date.now());
    }

    await this.liveSessionManagerService.completeSession(sessionId, {
      reason: dto.reason ?? "manual-stop"
    });

    emitter?.sessionStatus?.({
      sessionId,
      status: "completed"
    });

    return this.liveSessionManagerService.getOne(sessionId);
  }

  listSessions(currentUser: CurrentUserType, query: ListLiveSessionsDto) {
    return {
      data: this.liveSessionManagerService.list(query.scope ?? "active", query.businessId ?? currentUser.businessId)
    };
  }

  getSession(currentUser: CurrentUserType, sessionId: string) {
    const session = this.liveSessionManagerService.getOne(sessionId);
    if (!session || (session.businessId && session.businessId !== currentUser.businessId)) {
      return {
        data: null
      };
    }

    return {
      data: session
    };
  }

  activeSessions(currentUser: CurrentUserType) {
    return {
      data: this.liveSessionManagerService.list("active", currentUser.businessId)
    };
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  cleanupSessions() {
    this.liveSessionManagerService.cleanupExpiredDisconnectedSessions();
  }

  private async streamAgentReply(
    sessionId: string,
    callerText: string,
    emitter:
      | {
          aiResponseChunk?: (payload: Record<string, unknown>) => void;
          ttsAudioChunk?: (payload: Record<string, unknown>) => void;
          sessionStatus?: (payload: Record<string, unknown>) => void;
        }
      | undefined,
    callerStartedAt: number
  ) {
    const session = this.liveSessionManagerService.getRequired(sessionId);
    const businessName = session.businessId
      ? (await this.prisma.business.findUnique({
          where: {
            id: session.businessId
          }
        }))?.businessName ?? null
      : null;

    let sequence = 0;
    const replyText = await this.realtimeAiService.streamReply(
      sessionId,
      {
        callerText,
        businessName
      },
      async (chunk, isFinal) => {
        sequence += 1;
        emitter?.aiResponseChunk?.({
          sessionId,
          chunk,
          sequence,
          isFinal
        });
      }
    );

    await this.realtimeTtsService.streamAudio(sessionId, replyText, session.voice, async (payload) => {
      emitter?.ttsAudioChunk?.({
        sessionId,
        ...payload
      });
    });

    this.liveSessionManagerService.setMetrics(sessionId, {
      roundtripMs: Date.now() - callerStartedAt
    });
    emitter?.sessionStatus?.({
      sessionId,
      status: "active",
      activeSpeaker: "agent"
    });
  }
}
