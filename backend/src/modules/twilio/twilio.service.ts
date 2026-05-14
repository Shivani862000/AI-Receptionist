import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CallDirection, CallStatus } from "@prisma/client";
import twilio = require("twilio");

import type { CurrentUserType } from "../../common/types/current-user.type";
import { PrismaService } from "../../prisma/prisma.service";
import { AiProviderService } from "../ai/services/ai-provider.service";
import { AiSummaryService } from "../ai-summary/ai-summary.service";
import { RecordingsService } from "../recordings/recordings.service";
import { SttService } from "../stt/stt.service";
import { TtsService } from "../tts/tts.service";
import { VoiceCallsService } from "../voice-calls/voice-calls.service";
import { CreateTwilioCallDto } from "./dto/create-twilio-call.dto";
import { TwilioVoiceWebhookDto } from "./dto/twilio-voice-webhook.dto";

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private readonly accountSid?: string;
  private readonly authToken?: string;
  private readonly phoneNumber?: string;
  private readonly backendBaseUrl: string;
  private readonly client?: ReturnType<typeof twilio>;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly voiceCallsService: VoiceCallsService,
    private readonly sttService: SttService,
    private readonly aiSummaryService: AiSummaryService,
    private readonly recordingsService: RecordingsService,
    private readonly aiProviderService: AiProviderService,
    private readonly ttsService: TtsService
  ) {
    this.accountSid = this.configService.get<string>("twilio.accountSid") || undefined;
    this.authToken = this.configService.get<string>("twilio.authToken") || undefined;
    this.phoneNumber = this.configService.get<string>("twilio.phoneNumber") || undefined;
    this.backendBaseUrl = this.configService.get<string>("app.backendBaseUrl") || "http://localhost:4000";

    if (this.accountSid && this.authToken) {
      this.client = twilio(this.accountSid, this.authToken);
    }
  }

  async createOutgoingCall(currentUser: CurrentUserType, dto: CreateTwilioCallDto) {
    const localCall = await this.voiceCallsService.createOutgoing(currentUser, {
      clientId: dto.clientId,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      fromNumber: this.phoneNumber,
      toNumber: dto.customerPhone,
      direction: CallDirection.outgoing
    });

    if (!this.client || !this.phoneNumber) {
      return {
        message: "Twilio call simulated locally",
        data: {
          ...localCall.data,
          provider: "mock-twilio-fallback",
          usedFallback: true
        }
      };
    }

    const callbackUrl = `${this.backendBaseUrl}/api/v1/twilio/webhook/voice`;
    const statusUrl = `${this.backendBaseUrl}/api/v1/twilio/webhook/status`;

    const call = await this.client.calls.create({
      to: dto.customerPhone,
      from: this.phoneNumber,
      url: callbackUrl,
      statusCallback: statusUrl,
      record: true
    });

    const updated = await this.voiceCallsService.update(
      { businessId: currentUser.businessId } as CurrentUserType,
      localCall.data.id,
      {
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        recordingUrl: undefined,
        duration: undefined,
        status: CallStatus.initiated
      }
    );

    return {
      message: "Twilio outgoing call created",
      data: {
        ...updated.data,
        callSid: call.sid,
        provider: "twilio",
        twilioStatus: call.status
      }
    };
  }

  async handleVoiceWebhook(payload: TwilioVoiceWebhookDto) {
    const businessId = await this.resolveFallbackBusinessId();
    const call = await this.voiceCallsService.createOrUpdateFromWebhook({
      businessId,
      callSid: payload.CallSid ?? `CALL-${Date.now()}`,
      from: payload.From ?? "",
      to: payload.To ?? "",
      status: this.mapTwilioStatus(payload.CallStatus),
      duration: payload.CallDuration ? Number(payload.CallDuration) : undefined,
      direction: CallDirection.incoming,
      rawPayload: payload
    });

    let voicePrompt = "Hello, thank you for calling. Please tell us how we can help you today.";

    if (payload.SpeechResult) {
      const aiReply = await this.aiProviderService.generateReply({
        message: payload.SpeechResult,
        channel: "voice_call"
      });
      voicePrompt = aiReply.data.reply;
    }

    const tts = await this.ttsService.generateAudioFile(voicePrompt);
    const voiceResponse = new twilio.twiml.VoiceResponse();

    if (tts.audioUrl && !tts.usedFallback) {
      voiceResponse.play(tts.audioUrl);
    } else {
      voiceResponse.say({ voice: "alice" }, voicePrompt);
    }

    voiceResponse.gather({
      input: ["speech"],
      action: `${this.backendBaseUrl}/api/v1/twilio/webhook/voice`,
      method: "POST",
      speechTimeout: "auto"
    });

    return {
      xml: voiceResponse.toString(),
      callId: call.id
    };
  }

  async handleStatusWebhook(payload: TwilioVoiceWebhookDto) {
    const businessId = await this.resolveFallbackBusinessId();
    const call = await this.voiceCallsService.createOrUpdateFromWebhook({
      businessId,
      callSid: payload.CallSid ?? `CALL-${Date.now()}`,
      from: payload.From ?? "",
      to: payload.To ?? "",
      status: this.mapTwilioStatus(payload.CallStatus),
      duration: payload.CallDuration ? Number(payload.CallDuration) : undefined,
      direction: CallDirection.incoming,
      rawPayload: payload
    });

    if (payload.RecordingUrl) {
      await this.recordingsService.create(call.id, {
        provider: "twilio",
        duration: payload.RecordingDuration ? Number(payload.RecordingDuration) : call.durationSeconds,
        recordingUrl: `${payload.RecordingUrl}.mp3`
      });
    }

    if (this.mapTwilioStatus(payload.CallStatus) === CallStatus.completed) {
      await this.sttService.transcribeForCall(call.id, {
        audioUrl: payload.RecordingUrl ? `${payload.RecordingUrl}.mp3` : call.recordingUrl ?? undefined
      });
      await this.aiSummaryService.generate(call.id, {
        modelName: "gemini-2.5-flash-preview"
      });
    }

    return {
      message: "Twilio status webhook processed",
      data: call
    };
  }

  buildMediaStreamTwiml() {
    const voiceResponse = new twilio.twiml.VoiceResponse();
    const connect = voiceResponse.connect();
    const streamUrl = `${this.backendBaseUrl.replace(/^http/, "ws")}/twilio-media-stream`;
    connect.stream({
      url: streamUrl,
      name: "ai-receptionist-realtime"
    });

    return voiceResponse.toString();
  }

  private mapTwilioStatus(status?: string) {
    switch (status) {
      case "ringing":
        return CallStatus.ringing;
      case "in-progress":
      case "in_progress":
        return CallStatus.in_progress;
      case "completed":
        return CallStatus.completed;
      case "failed":
      case "busy":
      case "no-answer":
        return CallStatus.failed;
      default:
        return CallStatus.initiated;
    }
  }

  private async resolveFallbackBusinessId() {
    const fallbackBusiness = await this.prisma.business.findFirst({
      orderBy: { createdAt: "asc" }
    });

    if (!fallbackBusiness) {
      throw new Error("No business available for Twilio webhook processing");
    }

    return fallbackBusiness.id;
  }
}
