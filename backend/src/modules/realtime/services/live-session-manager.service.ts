import * as fs from "fs/promises";
import * as path from "path";

import { Injectable } from "@nestjs/common";

import { FileStorageService } from "../../../common/storage/file-storage.service";
import type {
  LiveSession,
  SessionLatencyMetrics,
  SessionMemoryItem,
  SessionTranscriptItem
} from "../interfaces/live-session.interface";

type CreateSessionInput = {
  sessionId?: string;
  clientId?: string | null;
  businessId?: string | null;
  callId?: string | null;
  socketId?: string;
  channel?: "browser" | "twilio";
  language?: string;
  voice?: string | null;
  metadata?: Record<string, unknown>;
  twilioStreamSid?: string | null;
};

type RealtimeEventPayload = {
  sessionId: string;
  session: ReturnType<LiveSessionManagerService["serializeSession"]>;
};

@Injectable()
export class LiveSessionManagerService {
  private readonly activeSessions = new Map<string, LiveSession>();
  private readonly archivedSessions = new Map<string, LiveSession>();
  private readonly listeners = new Map<string, Array<(payload: RealtimeEventPayload) => void>>();

  constructor(private readonly fileStorageService: FileStorageService) {}

  on(eventName: string, listener: (payload: RealtimeEventPayload) => void) {
    const listeners = this.listeners.get(eventName) ?? [];
    listeners.push(listener);
    this.listeners.set(eventName, listeners);
  }

  emit(eventName: string, session: LiveSession) {
    const listeners = this.listeners.get(eventName) ?? [];
    const payload = {
      sessionId: session.sessionId,
      session: this.serializeSession(session)
    };

    listeners.forEach((listener) => listener(payload));
  }

  createOrResumeSession(input: CreateSessionInput) {
    const existing = input.sessionId ? this.activeSessions.get(input.sessionId) ?? this.archivedSessions.get(input.sessionId) : null;
    if (existing && existing.status !== "completed") {
      existing.status = "active";
      existing.reconnectDeadlineAt = null;
      existing.lastActivityAt = new Date().toISOString();
      if (input.socketId && !existing.socketIds.includes(input.socketId)) {
        existing.socketIds.push(input.socketId);
      }
      this.activeSessions.set(existing.sessionId, existing);
      this.emit("session_status", existing);
      return existing;
    }

    const sessionId = input.sessionId || `live_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const session: LiveSession = {
      sessionId,
      clientId: input.clientId ?? null,
      businessId: input.businessId ?? null,
      startedAt: now,
      endedAt: null,
      status: "active",
      activeSpeaker: "idle",
      transcriptState: {
        partial: "",
        final: ""
      },
      channel: input.channel ?? "browser",
      language: input.language ?? "en",
      voice: input.voice ?? null,
      callId: input.callId ?? null,
      socketIds: input.socketId ? [input.socketId] : [],
      transcriptTimeline: [],
      memory: [],
      aiResponseText: "",
      metrics: {
        sttMs: null,
        aiMs: null,
        ttsMs: null,
        roundtripMs: null
      },
      audioChunkCount: 0,
      lastActivityAt: now,
      reconnectDeadlineAt: null,
      twilioStreamSid: input.twilioStreamSid ?? null,
      metadata: input.metadata ?? {}
    };

    this.activeSessions.set(sessionId, session);
    this.emit("session_status", session);
    return session;
  }

  touch(sessionId: string) {
    const session = this.getRequired(sessionId);
    session.lastActivityAt = new Date().toISOString();
    return session;
  }

  registerSocket(sessionId: string, socketId: string) {
    const session = this.getRequired(sessionId);
    if (!session.socketIds.includes(socketId)) {
      session.socketIds.push(socketId);
    }
    session.reconnectDeadlineAt = null;
    session.status = "active";
    this.touch(sessionId);
    this.emit("session_status", session);
    return session;
  }

  markDisconnected(sessionId: string, socketId: string) {
    const session = this.getRequired(sessionId);
    session.socketIds = session.socketIds.filter((item) => item !== socketId);
    session.status = "disconnected";
    session.reconnectDeadlineAt = new Date(Date.now() + 30_000).toISOString();
    this.touch(sessionId);
    this.emit("session_status", session);
    return session;
  }

  incrementAudioChunkCount(sessionId: string) {
    const session = this.getRequired(sessionId);
    session.audioChunkCount += 1;
    this.touch(sessionId);
    return session;
  }

  setPartialTranscript(sessionId: string, text: string) {
    const session = this.getRequired(sessionId);
    session.transcriptState.partial = text;
    session.activeSpeaker = "caller";
    this.touch(sessionId);
    this.emit("transcript_update", session);
    return session;
  }

  appendTranscript(sessionId: string, item: Omit<SessionTranscriptItem, "id" | "createdAt">) {
    const session = this.getRequired(sessionId);
    const transcriptItem: SessionTranscriptItem = {
      id: `${sessionId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      ...item
    };

    session.transcriptTimeline.push(transcriptItem);

    if (item.speaker === "caller" && item.isFinal) {
      session.transcriptState.final = `${session.transcriptState.final} ${item.text}`.trim();
      session.transcriptState.partial = "";
    }

    if (item.speaker === "agent" && item.isFinal) {
      session.aiResponseText = `${session.aiResponseText} ${item.text}`.trim();
    }

    this.touch(sessionId);
    this.emit("transcript_update", session);
    return transcriptItem;
  }

  updateMemory(sessionId: string, memory: SessionMemoryItem[]) {
    const session = this.getRequired(sessionId);
    session.memory = memory;
    this.touch(sessionId);
    return session;
  }

  setMetrics(sessionId: string, metrics: Partial<SessionLatencyMetrics>) {
    const session = this.getRequired(sessionId);
    session.metrics = {
      ...session.metrics,
      ...metrics
    };
    this.touch(sessionId);
    this.emit("metrics_update", session);
    return session;
  }

  setStatus(sessionId: string, status: LiveSession["status"], activeSpeaker?: LiveSession["activeSpeaker"]) {
    const session = this.getRequired(sessionId);
    session.status = status;
    if (activeSpeaker) {
      session.activeSpeaker = activeSpeaker;
    }
    this.touch(sessionId);
    this.emit("session_status", session);
    return session;
  }

  async completeSession(sessionId: string, metadata?: Record<string, unknown>) {
    const session = this.getRequired(sessionId);
    session.status = "completed";
    session.activeSpeaker = "idle";
    session.endedAt = new Date().toISOString();
    session.reconnectDeadlineAt = null;
    session.metadata = {
      ...session.metadata,
      ...(metadata ?? {})
    };
    this.emit("session_status", session);
    await this.persistArchive(session);
    this.activeSessions.delete(sessionId);
    this.archivedSessions.set(sessionId, {
      ...session,
      socketIds: []
    });
    return session;
  }

  list(scope: "active" | "completed" | "all" = "active", businessId?: string) {
    const active = [...this.activeSessions.values()];
    const completed = [...this.archivedSessions.values()];
    const sessions =
      scope === "active" ? active : scope === "completed" ? completed : [...active, ...completed].sort((a, b) => b.startedAt.localeCompare(a.startedAt));

    return sessions
      .filter((session) => (businessId ? session.businessId === businessId : true))
      .map((session) => this.serializeSession(session));
  }

  getOne(sessionId: string) {
    const session = this.activeSessions.get(sessionId) ?? this.archivedSessions.get(sessionId);
    return session ? this.serializeSession(session) : null;
  }

  cleanupExpiredDisconnectedSessions() {
    const now = Date.now();

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.reconnectDeadlineAt && new Date(session.reconnectDeadlineAt).getTime() < now) {
        void this.completeSession(sessionId, {
          completedBy: "reconnect-timeout"
        });
      }
    }
  }

  getRequired(sessionId: string) {
    const session = this.activeSessions.get(sessionId) ?? this.archivedSessions.get(sessionId);
    if (!session) {
      throw new Error(`Live session ${sessionId} not found`);
    }
    return session;
  }

  serializeSession(session: LiveSession) {
    return {
      ...session,
      socketIds: [...session.socketIds],
      transcriptTimeline: [...session.transcriptTimeline],
      memory: [...session.memory]
    };
  }

  private async persistArchive(session: LiveSession) {
    const directory = this.fileStorageService.getDirectory("transcripts");
    const filename = this.fileStorageService.buildSafeFilename(`live-session-${session.sessionId}`, "json");
    const filePath = path.join(directory, filename);

    await fs.writeFile(filePath, JSON.stringify(this.serializeSession(session), null, 2), "utf8");
  }
}
