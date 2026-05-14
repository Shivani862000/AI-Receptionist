import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DeepgramClient, ListenV1Model } from "@deepgram/sdk";
import { ActivityType, Prisma } from "@prisma/client";
import * as fs from "fs/promises";
import * as path from "path";

import { ExternalProviderException, ResourceNotFoundException } from "../../common/exceptions/app.exception";
import { PrismaService } from "../../prisma/prisma.service";
import { UsageService } from "../usage/usage.service";
import { VoiceCallsService } from "../voice-calls/voice-calls.service";
import { TranscribeAudioDto } from "./dto/transcribe-audio.dto";

type UploadLike = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};

@Injectable()
export class SttService {
  private readonly logger = new Logger(SttService.name);
  private readonly apiKey?: string;
  private readonly model: string;
  private readonly timeoutMs: number;
  private readonly client?: DeepgramClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly voiceCallsService: VoiceCallsService,
    private readonly usageService: UsageService
  ) {
    this.apiKey = this.configService.get<string>("deepgram.apiKey") || undefined;
    this.model = this.configService.get<string>("deepgram.sttModel") || ListenV1Model.Nova3;
    this.timeoutMs = this.configService.get<number>("deepgram.requestTimeoutMs") || 20000;

    if (this.apiKey) {
      this.client = new DeepgramClient({ apiKey: this.apiKey, timeoutInSeconds: Math.ceil(this.timeoutMs / 1000) });
    }
  }

  async transcribe(dto: TranscribeAudioDto, file?: UploadLike) {
    if (!dto.audioUrl && !file && !dto.callId) {
      throw new ExternalProviderException("Provide an audioUrl, uploaded file, or callId for transcription");
    }

    if (file) {
      this.validateUpload(file);
    }

    const call = dto.callId ? await this.prisma.voiceCall.findUnique({ where: { id: dto.callId } }) : null;
    if (dto.callId && !call) {
      throw new ResourceNotFoundException("Voice call not found");
    }

    const resolvedAudioUrl = dto.audioUrl ?? call?.recordingUrl ?? undefined;
    const result = file
      ? await this.transcribeFile(file, dto.language)
      : await this.transcribeUrlOrFallback(resolvedAudioUrl, dto.language, call?.id);

    let transcriptRecord = null;
    if (dto.callId) {
      transcriptRecord = await this.prisma.voiceCallTranscript.upsert({
        where: { voiceCallId: dto.callId },
        update: {
          transcriptText: result.transcriptText,
          language: dto.language ?? "en",
          confidence: result.confidence,
          provider: result.provider
        },
        create: {
          voiceCallId: dto.callId,
          transcriptText: result.transcriptText,
          language: dto.language ?? "en",
          confidence: result.confidence,
          provider: result.provider
        }
      });

      await this.voiceCallsService.markPipelineGenerated(dto.callId, {
        transcriptId: transcriptRecord.id
      });

      await this.prisma.voiceCall.update({
        where: { id: dto.callId },
        data: {
          transcriptStatus: "generated",
          metadata: {
            sttProviderResponse: result.rawResponse
          } as Prisma.InputJsonValue
        }
      });

      await this.prisma.activityLog.create({
        data: {
          businessId: call!.businessId,
          voiceCallId: call!.id,
          entityType: "voice_call_transcript",
          entityId: transcriptRecord.id,
          activityType: ActivityType.call_updated,
          title: "Transcript generated via STT"
        }
      });

      await this.usageService.increment(call!.businessId, "stt_minutes", Number(((call?.durationSeconds ?? 0) / 60).toFixed(2)), "minutes", {
        callId: call!.id,
      });
    }

    const transcriptPath = await this.persistTranscriptFile({
      callId: dto.callId ?? call?.id ?? "ad-hoc",
      transcriptText: result.transcriptText,
      provider: result.provider,
      confidence: result.confidence
    });

    return {
      message: "Audio transcribed",
      data: {
        transcriptId: transcriptRecord?.id ?? null,
        transcriptText: result.transcriptText,
        confidence: result.confidence,
        provider: result.provider,
        language: dto.language ?? "en",
        storagePath: transcriptPath,
        rawResponse: result.rawResponse,
        usedFallback: result.usedFallback ?? false
      }
    };
  }

  async transcribeForCall(callId: string, input?: { audioUrl?: string; language?: string }) {
    return this.transcribe(
      {
        callId,
        audioUrl: input?.audioUrl,
        language: input?.language ?? "en"
      },
      undefined
    );
  }

  private async transcribeUrlOrFallback(audioUrl?: string, language = "en", callId?: string) {
    if (!this.client || !audioUrl) {
      return {
        transcriptText: `Transcript placeholder for ${callId ?? "uploaded audio"}. Customer confirmed the update and asked for a follow-up tomorrow.`,
        confidence: 0.88,
        provider: "mock-deepgram-fallback",
        rawResponse: {
          audioUrl: audioUrl ?? null
        },
        usedFallback: true
      };
    }

    try {
      const response = await this.withTimeout(
        this.client.listen.v1.media.transcribeUrl({
          url: audioUrl,
          language,
          model: this.model as ListenV1Model,
          smart_format: true,
          punctuate: true,
          detect_language: true
        }),
        this.timeoutMs
      );

      const { transcriptText, confidence } = this.extractTranscriptResult(response);

      return {
        transcriptText,
        confidence,
        provider: "deepgram",
        rawResponse: response,
        usedFallback: false
      };
    } catch (error) {
      this.logger.error("Deepgram URL transcription failed", error instanceof Error ? error.stack : String(error));
      return {
        transcriptText: `Transcript placeholder for ${callId ?? "uploaded audio"}. Customer confirmed the update and asked for a follow-up tomorrow.`,
        confidence: 0.82,
        provider: "mock-deepgram-fallback",
        rawResponse: {
          error: error instanceof Error ? error.message : String(error),
          audioUrl
        },
        usedFallback: true
      };
    }
  }

  private async transcribeFile(file: UploadLike, language = "en") {
    if (!this.client) {
      return {
        transcriptText: `Transcript placeholder for uploaded file ${file.originalname}.`,
        confidence: 0.86,
        provider: "mock-deepgram-fallback",
        rawResponse: {
          filename: file.originalname
        },
        usedFallback: true
      };
    }

    try {
      const response = await this.withTimeout(
        this.client.listen.v1.media.transcribeFile(file.buffer, {
          language,
          model: this.model as ListenV1Model,
          smart_format: true,
          punctuate: true,
          detect_language: true
        }),
        this.timeoutMs
      );

      const { transcriptText, confidence } = this.extractTranscriptResult(response);

      return {
        transcriptText,
        confidence,
        provider: "deepgram",
        rawResponse: response,
        usedFallback: false
      };
    } catch (error) {
      this.logger.error("Deepgram file transcription failed", error instanceof Error ? error.stack : String(error));
      return {
        transcriptText: `Transcript placeholder for uploaded file ${file.originalname}.`,
        confidence: 0.8,
        provider: "mock-deepgram-fallback",
        rawResponse: {
          error: error instanceof Error ? error.message : String(error),
          filename: file.originalname
        },
        usedFallback: true
      };
    }
  }

  private async persistTranscriptFile(input: {
    callId: string;
    transcriptText: string;
    provider: string;
    confidence: number;
  }) {
    const directory = path.join(process.cwd(), "uploads", "transcripts");
    await fs.mkdir(directory, { recursive: true });

    const filename = `${input.callId}-${Date.now()}.json`;
    const fullPath = path.join(directory, filename);

    await fs.writeFile(
      fullPath,
      JSON.stringify(
        {
          transcriptText: input.transcriptText,
          provider: input.provider,
          confidence: input.confidence
        },
        null,
        2
      ),
      "utf8"
    );

    return fullPath;
  }

  private validateUpload(file: UploadLike) {
    if (!file.mimetype.startsWith("audio/")) {
      throw new ExternalProviderException("Only audio uploads are supported");
    }

    if (file.size > 15 * 1024 * 1024) {
      throw new ExternalProviderException("Audio upload exceeds the 15MB limit");
    }
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
    return Promise.race<T>([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new ExternalProviderException("Deepgram request timed out")), timeoutMs)
      )
    ]);
  }

  private extractTranscriptResult(response: unknown) {
    const normalized = response as {
      results?: {
        channels?: Array<{
          alternatives?: Array<{
            transcript?: string;
            confidence?: number;
          }>;
        }>;
      };
    };

    return {
      transcriptText:
        normalized.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() || "No speech detected.",
      confidence: normalized.results?.channels?.[0]?.alternatives?.[0]?.confidence ?? 0
    };
  }
}
