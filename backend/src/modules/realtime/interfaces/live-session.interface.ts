export type LiveSessionStatus = "connecting" | "active" | "processing" | "completed" | "disconnected" | "error";
export type ActiveSpeaker = "caller" | "agent" | "system" | "idle";

export type SessionTranscriptItem = {
  id: string;
  speaker: "caller" | "agent" | "system";
  text: string;
  isFinal: boolean;
  createdAt: string;
};

export type SessionMemoryItem = {
  role: "user" | "model" | "system";
  text: string;
  createdAt: string;
};

export type SessionLatencyMetrics = {
  sttMs: number | null;
  aiMs: number | null;
  ttsMs: number | null;
  roundtripMs: number | null;
};

export type LiveSession = {
  sessionId: string;
  clientId: string | null;
  businessId: string | null;
  startedAt: string;
  endedAt: string | null;
  status: LiveSessionStatus;
  activeSpeaker: ActiveSpeaker;
  transcriptState: {
    partial: string;
    final: string;
  };
  channel: "browser" | "twilio";
  language: string;
  voice: string | null;
  callId: string | null;
  socketIds: string[];
  transcriptTimeline: SessionTranscriptItem[];
  memory: SessionMemoryItem[];
  aiResponseText: string;
  metrics: SessionLatencyMetrics;
  audioChunkCount: number;
  lastActivityAt: string;
  reconnectDeadlineAt: string | null;
  twilioStreamSid: string | null;
  metadata: Record<string, unknown>;
};
