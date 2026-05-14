import { Injectable } from "@nestjs/common";
import type { IncomingMessage, Server as HttpServer } from "http";
import { WebSocket, WebSocketServer } from "ws";

import { AppLoggerService } from "../../../common/logger/app-logger.service";
import { RealtimeService } from "../realtime.service";

@Injectable()
export class TwilioMediaStreamBridgeService {
  private wsServer?: WebSocketServer;
  private bound = false;

  constructor(
    private readonly realtimeService: RealtimeService,
    private readonly logger: AppLoggerService
  ) {}

  bind(httpServer: HttpServer) {
    if (this.bound) {
      return;
    }

    this.wsServer = new WebSocketServer({
      noServer: true
    });

    httpServer.on("upgrade", (request, socket, head) => {
      const url = new URL(request.url || "/", "http://localhost");
      if (url.pathname !== "/twilio-media-stream") {
        return;
      }

      this.wsServer?.handleUpgrade(request, socket, head, (ws: WebSocket) => {
        this.wsServer?.emit("connection", ws, request);
      });
    });

    this.wsServer.on("connection", (socket: WebSocket, request: IncomingMessage) => {
      this.handleConnection(socket, request);
    });

    this.bound = true;
    this.logger.log("Twilio media stream bridge ready at /twilio-media-stream", TwilioMediaStreamBridgeService.name);
  }

  private handleConnection(socket: WebSocket, _request: IncomingMessage) {
    let sessionId: string | null = null;

    socket.on("message", async (raw: Buffer) => {
      try {
        const payload = JSON.parse(raw.toString()) as {
          event: string;
          streamSid?: string;
          start?: {
            streamSid?: string;
            callSid?: string;
            customParameters?: Record<string, string>;
          };
          media?: {
            payload?: string;
          };
        };

        if (payload.event === "start") {
          const created = await this.realtimeService.startExternalSession({
            channel: "twilio",
            callId: payload.start?.callSid ?? null,
            twilioStreamSid: payload.start?.streamSid ?? payload.streamSid ?? null,
            businessId: payload.start?.customParameters?.businessId ?? null,
            clientId: payload.start?.customParameters?.clientId ?? null,
            language: payload.start?.customParameters?.language ?? "en",
            voice: payload.start?.customParameters?.voice ?? null,
            metadata: {
              twilioCallSid: payload.start?.callSid ?? null
            }
          });
          sessionId = created.sessionId;
          return;
        }

        if (!sessionId) {
          return;
        }

        if (payload.event === "media" && payload.media?.payload) {
          await this.realtimeService.handleIncomingChunk(
            sessionId,
            {
              audioBase64: payload.media.payload,
              transport: "twilio",
              mimeType: "audio/x-mulaw",
              sampleRate: 8000
            },
            undefined
          );
          return;
        }

        if (payload.event === "stop") {
          await this.realtimeService.stopSession(
            sessionId,
            {
              sessionId,
              reason: "twilio-stop"
            },
            undefined
          );
        }
      } catch (error) {
        this.logger.error(
          "Twilio media stream message failed",
          error instanceof Error ? error.stack : String(error),
          TwilioMediaStreamBridgeService.name
        );
      }
    });

    socket.on("close", async () => {
      if (sessionId) {
        await this.realtimeService.stopSession(
          sessionId,
          {
            sessionId,
            reason: "twilio-websocket-close"
          },
          undefined
        );
      }
    });
  }
}
