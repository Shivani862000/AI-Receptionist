import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import type { Server as HttpServer } from "http";
import { JwtService } from "@nestjs/jwt";
import { Server, Socket } from "socket.io";

import { AppLoggerService } from "../../common/logger/app-logger.service";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { AudioChunkDto } from "./dto/audio-chunk.dto";
import { StartSessionDto } from "./dto/start-session.dto";
import { StopSessionDto } from "./dto/stop-session.dto";
import { LiveSessionManagerService } from "./services/live-session-manager.service";
import { TwilioMediaStreamBridgeService } from "./services/twilio-media-stream-bridge.service";
import { RealtimeService } from "./realtime.service";

@WebSocketGateway({
  namespace: "/realtime",
  cors: {
    origin: true,
    credentials: true
  }
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly realtimeService: RealtimeService,
    private readonly liveSessionManagerService: LiveSessionManagerService,
    private readonly twilioMediaStreamBridgeService: TwilioMediaStreamBridgeService,
    private readonly jwtService: JwtService,
    private readonly logger: AppLoggerService
  ) {}

  afterInit(server: Server) {
    const httpServer = (server as Server & { httpServer?: HttpServer }).httpServer;
    if (httpServer) {
      this.twilioMediaStreamBridgeService.bind(httpServer);
    }

    this.liveSessionManagerService.on("session_status", ({ session }) => {
      server.emit("session_status", session);
    });
    this.liveSessionManagerService.on("transcript_update", ({ session }) => {
      server.emit("live_transcript_update", {
        sessionId: session.sessionId,
        transcriptState: session.transcriptState,
        transcriptTimeline: session.transcriptTimeline
      });
    });
    this.liveSessionManagerService.on("metrics_update", ({ session }) => {
      server.emit("latency_metrics", {
        sessionId: session.sessionId,
        metrics: session.metrics
      });
    });
  }

  async handleConnection(client: Socket) {
    client.data.user = this.parseUserFromSocket(client);
    client.emit("session_status", {
      status: "connected",
      socketId: client.id,
      authenticated: Boolean(client.data.user)
    });
  }

  handleDisconnect(client: Socket) {
    const sessionId = typeof client.data.sessionId === "string" ? client.data.sessionId : null;
    if (sessionId) {
      this.liveSessionManagerService.markDisconnected(sessionId, client.id);
    }
  }

  @SubscribeMessage("start_session")
  async handleStartSession(@ConnectedSocket() client: Socket, @MessageBody() dto: StartSessionDto) {
    const session = await this.realtimeService.startSession(client.data.user ?? null, client.id, dto);
    client.data.sessionId = session.sessionId;
    client.join(session.sessionId);

    this.server.to(session.sessionId).emit("session_status", {
      sessionId: session.sessionId,
      status: session.status,
      activeSpeaker: session.activeSpeaker,
      reconnectDeadlineAt: session.reconnectDeadlineAt
    });

    return {
      event: "session_status",
      data: {
        sessionId: session.sessionId,
        status: session.status,
        activeSpeaker: session.activeSpeaker
      }
    };
  }

  @SubscribeMessage("audio_chunk")
  async handleAudioChunk(@ConnectedSocket() client: Socket, @MessageBody() dto: AudioChunkDto) {
    await this.realtimeService.handleIncomingChunk(dto.sessionId, dto, {
      partialTranscript: (text) => {
        this.server.to(dto.sessionId).emit("partial_transcript", {
          sessionId: dto.sessionId,
          text
        });
      },
      finalTranscript: (text) => {
        this.server.to(dto.sessionId).emit("final_transcript", {
          sessionId: dto.sessionId,
          text
        });
      },
      sessionStatus: (payload) => {
        this.server.to(dto.sessionId).emit("session_status", payload);
      },
      aiResponseChunk: (payload) => {
        this.server.to(dto.sessionId).emit("ai_response_chunk", payload);
      },
      ttsAudioChunk: (payload) => {
        this.server.to(dto.sessionId).emit("tts_audio_chunk", payload);
      }
    });

    return {
      event: "session_status",
      data: {
        sessionId: dto.sessionId,
        acknowledged: true,
        socketId: client.id
      }
    };
  }

  @SubscribeMessage("stop_session")
  async handleStopSession(@ConnectedSocket() client: Socket, @MessageBody() dto: StopSessionDto) {
    const session = await this.realtimeService.stopSession(dto.sessionId, dto, {
      sessionStatus: (payload) => {
        this.server.to(dto.sessionId).emit("session_status", payload);
      }
    });
    client.leave(dto.sessionId);
    client.data.sessionId = null;

    return {
      event: "session_status",
      data: session
    };
  }

  private parseUserFromSocket(client: Socket): CurrentUserType | null {
    try {
      const token = this.resolveSocketToken(client);
      if (!token) {
        return null;
      }

      return this.jwtService.verify<CurrentUserType>(token);
    } catch (error) {
      this.logger.warn("Socket auth token was invalid; continuing in demo mode", RealtimeGateway.name, {
        socketId: client.id,
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  private resolveSocketToken(client: Socket) {
    const authToken = client.handshake.auth?.token;
    const queryToken = typeof client.handshake.query.token === "string" ? client.handshake.query.token : null;
    const bearerHeader = client.handshake.headers.authorization;

    if (typeof authToken === "string" && authToken.trim()) {
      return authToken.trim().replace(/^Bearer\s+/i, "");
    }

    if (queryToken?.trim()) {
      return queryToken.trim();
    }

    if (typeof bearerHeader === "string" && bearerHeader.startsWith("Bearer ")) {
      return bearerHeader.slice("Bearer ".length);
    }

    return null;
  }
}
