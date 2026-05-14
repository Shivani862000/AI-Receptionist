import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { WebSocket } from "ws";

import { AppLoggerService } from "../../../common/logger/app-logger.service";
import { LiveSessionManagerService } from "./live-session-manager.service";

type SttCallback = {
  onPartialTranscript: (text: string) => void;
  onFinalTranscript: (text: string) => void;
  onError: (message: string) => void;
};

@Injectable()
export class RealtimeSttService {
  private readonly apiKey?: string;
  private readonly model: string;
  private readonly sessions = new Map<string, { socket: WebSocket; callbacks: SttCallback }>();

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService,
    private readonly liveSessionManagerService: LiveSessionManagerService
  ) {
    this.apiKey = this.configService.get<string>("deepgram.apiKey") || undefined;
    this.model = this.configService.get<string>("deepgram.sttModel") || "nova-3";
  }

  startStreaming(sessionId: string, callbacks: SttCallback, options?: { language?: string; transport?: string }) {
    if (!this.apiKey || options?.transport !== "twilio") {
      return;
    }

    const socketUrl = new URL("wss://api.deepgram.com/v1/listen");
    socketUrl.searchParams.set("model", this.model);
    socketUrl.searchParams.set("interim_results", "true");
    socketUrl.searchParams.set("punctuate", "true");
    socketUrl.searchParams.set("smart_format", "true");
    socketUrl.searchParams.set("encoding", "mulaw");
    socketUrl.searchParams.set("sample_rate", "8000");
    if (options?.language) {
      socketUrl.searchParams.set("language", options.language);
    }

    const ws = new WebSocket(socketUrl, {
      headers: {
        Authorization: `Token ${this.apiKey}`
      }
    });

    ws.on("message", (raw: Buffer) => {
      try {
        const parsed = JSON.parse(raw.toString()) as {
          is_final?: boolean;
          speech_final?: boolean;
          channel?: {
            alternatives?: Array<{
              transcript?: string;
            }>;
          };
        };

        const text = parsed.channel?.alternatives?.[0]?.transcript?.trim();
        if (!text) {
          return;
        }

        if (parsed.is_final || parsed.speech_final) {
          callbacks.onFinalTranscript(text);
        } else {
          callbacks.onPartialTranscript(text);
        }
      } catch (error) {
        callbacks.onError(error instanceof Error ? error.message : String(error));
      }
    });

    ws.on("error", (error: Error) => {
      callbacks.onError(error instanceof Error ? error.message : String(error));
    });

    ws.on("close", () => {
      this.sessions.delete(sessionId);
    });

    this.sessions.set(sessionId, {
      socket: ws,
      callbacks
    });
  }

  ingestChunk(sessionId: string, payload: { audioBuffer?: Buffer; textHint?: string; transport?: string }) {
    const startedAt = Date.now();

    if (payload.textHint?.trim()) {
      const partial = payload.textHint.trim();
      this.liveSessionManagerService.setPartialTranscript(sessionId, partial);
      this.liveSessionManagerService.setMetrics(sessionId, {
        sttMs: Date.now() - startedAt
      });
      return {
        mode: "text-hint" as const,
        partialTranscript: partial
      };
    }

    const liveSocket = this.sessions.get(sessionId);
    if (liveSocket && liveSocket.socket.readyState === WebSocket.OPEN && payload.audioBuffer) {
      liveSocket.socket.send(payload.audioBuffer);
      this.liveSessionManagerService.setMetrics(sessionId, {
        sttMs: Date.now() - startedAt
      });

      return {
        mode: "deepgram-stream" as const
      };
    }

    const fallbackText = `Listening live... ${this.liveSessionManagerService.getRequired(sessionId).audioChunkCount} chunks received`;
    this.liveSessionManagerService.setPartialTranscript(sessionId, fallbackText);
    this.liveSessionManagerService.setMetrics(sessionId, {
      sttMs: Date.now() - startedAt
    });

    return {
      mode: "mock-stream" as const,
      partialTranscript: fallbackText
    };
  }

  finalize(sessionId: string, payload?: { finalText?: string }) {
    const liveSocket = this.sessions.get(sessionId);
    if (liveSocket && liveSocket.socket.readyState === WebSocket.OPEN) {
      liveSocket.socket.send(JSON.stringify({ type: "CloseStream" }));
      liveSocket.socket.close();
    }

    const finalText =
      payload?.finalText?.trim() ||
      this.liveSessionManagerService.getRequired(sessionId).transcriptState.partial ||
      "Hello, I need help with an appointment.";

    this.liveSessionManagerService.appendTranscript(sessionId, {
      speaker: "caller",
      text: finalText,
      isFinal: true
    });

    return finalText;
  }
}
