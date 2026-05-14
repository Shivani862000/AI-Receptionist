"use client";

import type { ComponentType, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { Activity, AudioLines, Mic, MicOff, Radio, Square, Volume2, Waves } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type TranscriptRow = {
  id: string;
  speaker: "caller" | "agent" | "system";
  text: string;
  isFinal: boolean;
};

type SessionStatusPayload = {
  sessionId?: string;
  status?: string;
  activeSpeaker?: string;
  authenticated?: boolean;
  metrics?: {
    sttMs?: number | null;
    aiMs?: number | null;
    ttsMs?: number | null;
    roundtripMs?: number | null;
  };
};

export function RealtimeLiveAgent() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState("idle");
  const [activeSpeaker, setActiveSpeaker] = useState("idle");
  const [partialTranscript, setPartialTranscript] = useState("");
  const [transcriptRows, setTranscriptRows] = useState<TranscriptRow[]>([]);
  const [aiPreview, setAiPreview] = useState("");
  const [demoPrompt, setDemoPrompt] = useState("I want to book an appointment for tomorrow morning.");
  const [jwtToken, setJwtToken] = useState("");
  const [businessId, setBusinessId] = useState("demo-business");
  const [clientId, setClientId] = useState("demo-client");
  const [metrics, setMetrics] = useState({
    sttMs: null as number | null,
    aiMs: null as number | null,
    ttsMs: null as number | null,
    roundtripMs: null as number | null
  });
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<string[]>([]);

  const wsBaseUrl = useMemo(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";
    try {
      const parsed = new URL(apiBase);
      return parsed.origin;
    } catch {
      return "http://localhost:4000";
    }
  }, []);

  useEffect(() => {
    const client = io(`${wsBaseUrl}/realtime`, {
      transports: ["websocket"],
      auth: jwtToken ? { token: jwtToken } : undefined
    });

    client.on("connect", () => {
      setConnected(true);
    });

    client.on("disconnect", () => {
      setConnected(false);
    });

    client.on("session_status", (payload: SessionStatusPayload) => {
      if (payload.sessionId) {
        setSessionId(payload.sessionId);
      }
      if (payload.status) {
        setSessionStatus(payload.status);
      }
      if (payload.activeSpeaker) {
        setActiveSpeaker(payload.activeSpeaker);
      }
      if (typeof payload.authenticated === "boolean") {
        setAuthenticated(payload.authenticated);
      }
      if (payload.metrics) {
        setMetrics((current) => ({
          ...current,
          ...payload.metrics
        }));
      }
    });

    client.on("partial_transcript", (payload: { text: string }) => {
      setPartialTranscript(payload.text);
    });

    client.on("final_transcript", (payload: { text: string }) => {
      setPartialTranscript("");
      setTranscriptRows((current) => [
        ...current,
        {
          id: `caller-${Date.now()}`,
          speaker: "caller",
          text: payload.text,
          isFinal: true
        }
      ]);
    });

    client.on("ai_response_chunk", (payload: { chunk: string; isFinal: boolean }) => {
      if (payload.isFinal) {
        setTranscriptRows((current) =>
          aiPreview.trim()
            ? [
                ...current,
                {
                  id: `agent-${Date.now()}`,
                  speaker: "agent",
                  text: aiPreview.trim(),
                  isFinal: true
                }
              ]
            : current
        );
        setAiPreview("");
        return;
      }

      if (payload.chunk) {
        setAiPreview((current) => `${current}${payload.chunk}`);
      }
    });

    client.on("tts_audio_chunk", async (payload: { chunkBase64: string; isLast: boolean; mimeType: string }) => {
      audioChunksRef.current.push(payload.chunkBase64);

      if (payload.isLast) {
        const buffers = audioChunksRef.current.map((item) => Uint8Array.from(atob(item), (char) => char.charCodeAt(0)));
        const blob = new Blob(buffers, {
          type: payload.mimeType
        });
        audioChunksRef.current = [];

        const objectUrl = URL.createObjectURL(blob);
        const audio = new Audio(objectUrl);
        void audio.play().catch(() => undefined);
        audio.onended = () => URL.revokeObjectURL(objectUrl);
      }
    });

    client.on("latency_metrics", (payload: { metrics: typeof metrics }) => {
      setMetrics((current) => ({
        ...current,
        ...payload.metrics
      }));
    });

    setSocket(client);

    return () => {
      client.disconnect();
    };
  }, [jwtToken, wsBaseUrl]);

  const beginSession = () => {
    if (!socket) {
      return;
    }

    setTranscriptRows([]);
    setAiPreview("");
    setPartialTranscript("");

    socket.emit("start_session", {
      businessId,
      clientId,
      language: "en",
      voice: "aura-asteria-en",
      channel: "browser"
    });
  };

  const endSession = () => {
    if (!socket || !sessionId) {
      return;
    }

    stopMicrophoneCapture();
    socket.emit("stop_session", {
      sessionId,
      reason: "frontend-stop"
    });
  };

  const sendDemoPrompt = () => {
    if (!socket || !sessionId || !demoPrompt.trim()) {
      return;
    }

    socket.emit("audio_chunk", {
      sessionId,
      textHint: demoPrompt.trim(),
      isFinal: true,
      transport: "browser"
    });
  };

  const startMicrophoneCapture = async () => {
    if (!socket || !sessionId || isRecording) {
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });
    mediaStreamRef.current = stream;

    const recorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : undefined
    });

    recorder.ondataavailable = async (event) => {
      if (!event.data.size || !sessionId) {
        return;
      }

      const chunkBase64 = await blobToBase64(event.data);
      socket.emit("audio_chunk", {
        sessionId,
        audioBase64: chunkBase64,
        mimeType: event.data.type,
        transport: "browser"
      });
    };

    recorder.onstop = async () => {
      if (sessionId) {
        socket.emit("audio_chunk", {
          sessionId,
          audioBase64: "",
          transport: "browser",
          textHint: demoPrompt.trim() || undefined,
          isFinal: true
        });
      }
    };

    recorder.start(500);
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  const stopMicrophoneCapture = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    setIsRecording(false);
  };

  return (
    <Card className="overflow-hidden border-primary/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.97),rgba(17,24,39,0.94))] text-white shadow-float">
      <CardHeader className="border-b border-white/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <Radio className="h-4 w-4 text-cyan-300" />
              Realtime AI live agent
            </CardTitle>
            <CardDescription className="mt-1 text-white/65">
              Local POC for live transcript streaming, Gemini response chunks, and streamed TTS playback.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn("rounded-full px-3 py-1", connected ? "bg-emerald-400/15 text-emerald-200" : "bg-rose-400/15 text-rose-200")}>
              {connected ? "Socket connected" : "Socket offline"}
            </Badge>
            <Badge className="rounded-full bg-white/10 px-3 py-1 text-white/85">
              {authenticated ? "JWT auth enabled" : "Demo guest mode"}
            </Badge>
            <Badge className="rounded-full bg-cyan-400/15 px-3 py-1 text-cyan-200">{sessionStatus}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        <div className="grid gap-4 xl:grid-cols-[1.15fr,0.85fr]">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricPill label="STT latency" value={formatMetric(metrics.sttMs)} icon={Activity} />
              <MetricPill label="AI latency" value={formatMetric(metrics.aiMs)} icon={Waves} />
              <MetricPill label="TTS latency" value={formatMetric(metrics.ttsMs)} icon={Volume2} />
              <MetricPill label="Roundtrip" value={formatMetric(metrics.roundtripMs)} icon={AudioLines} />
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-white/6 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Session controls</p>
                  <p className="text-sm text-white/60">Start a local browser session or use typed prompts while refining the realtime pipeline.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button className="rounded-2xl bg-white text-slate-950 hover:bg-white/90" onClick={beginSession}>
                    Start session
                  </Button>
                  <Button variant="outline" className="rounded-2xl border-white/20 bg-transparent text-white hover:bg-white/10" onClick={endSession} disabled={!sessionId}>
                    <Square className="mr-2 h-4 w-4" />
                    Stop
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Input value={businessId} onChange={(event) => setBusinessId(event.target.value)} className="h-11 rounded-2xl border-white/15 bg-white/8 text-white" placeholder="Business ID" />
                <Input value={clientId} onChange={(event) => setClientId(event.target.value)} className="h-11 rounded-2xl border-white/15 bg-white/8 text-white" placeholder="Client ID" />
                <Input value={jwtToken} onChange={(event) => setJwtToken(event.target.value)} className="h-11 rounded-2xl border-white/15 bg-white/8 text-white sm:col-span-2" placeholder="Optional JWT bearer token for authenticated socket sessions" />
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-white/6 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Browser microphone + prompt test</p>
                  <p className="text-sm text-white/60">Mic chunks are streamed live. For local testing, the typed prompt also acts as a reliable STT fallback.</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="rounded-2xl border-white/20 bg-transparent text-white hover:bg-white/10"
                    onClick={isRecording ? stopMicrophoneCapture : startMicrophoneCapture}
                    disabled={!sessionId}
                  >
                    {isRecording ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                    {isRecording ? "Stop mic" : "Start mic"}
                  </Button>
                  <Button className="rounded-2xl bg-primary text-white" onClick={sendDemoPrompt} disabled={!sessionId}>
                    Send typed turn
                  </Button>
                </div>
              </div>
              <Textarea
                value={demoPrompt}
                onChange={(event) => setDemoPrompt(event.target.value)}
                className="mt-4 min-h-[112px] rounded-[1.4rem] border-white/15 bg-white/8 text-white placeholder:text-white/35"
                placeholder="Example: I need to reschedule my appointment to tomorrow afternoon."
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <LivePanel title="Live transcript" subtitle={partialTranscript ? "Partial transcript updating live" : "Final caller turns appear here"}>
                <div className="space-y-3">
                  {transcriptRows.filter((item) => item.speaker === "caller").map((item) => (
                    <TranscriptBubble key={item.id} speaker="caller" text={item.text} />
                  ))}
                  {partialTranscript ? <TranscriptBubble speaker="system" text={partialTranscript} pending /> : null}
                </div>
              </LivePanel>
              <LivePanel title="AI response" subtitle={aiPreview ? "Gemini response chunks in progress" : "Spoken reply preview"}>
                <div className="space-y-3">
                  {transcriptRows.filter((item) => item.speaker === "agent").map((item) => (
                    <TranscriptBubble key={item.id} speaker="agent" text={item.text} />
                  ))}
                  {aiPreview ? <TranscriptBubble speaker="agent" text={aiPreview} pending /> : null}
                </div>
              </LivePanel>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.6rem] border border-cyan-300/20 bg-cyan-300/8 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">Realtime monitoring</p>
                  <p className="text-sm text-white/60">Monitor session health, active speaker, and current transport state.</p>
                </div>
                <div className={cn("h-3 w-3 rounded-full", activeSpeaker === "agent" ? "bg-cyan-300" : activeSpeaker === "caller" ? "bg-emerald-300" : "bg-white/30")} />
              </div>
              <div className="mt-4 grid gap-3">
                <StatusRow label="Session ID" value={sessionId ?? "Not started"} />
                <StatusRow label="Active speaker" value={activeSpeaker} />
                <StatusRow label="Session state" value={sessionStatus} />
                <StatusRow label="Transport" value={isRecording ? "Browser mic stream" : "Typed/local fallback"} />
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-white/6 p-4">
              <p className="text-sm font-medium text-white">POC coverage</p>
              <div className="mt-4 space-y-3 text-sm text-white/70">
                <p>Web browser sessions use `socket.io` on `/realtime`.</p>
                <p>Twilio media streams can connect through `/twilio-media-stream`.</p>
                <p>Deepgram live STT is wired for Twilio-style `mulaw` audio, while browser sessions use a typed fallback path for local testing.</p>
                <p>Gemini replies stream back as text chunks, and TTS audio is returned in playable chunk batches.</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LivePanel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/6 p-4">
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="mt-1 text-sm text-white/55">{subtitle}</p>
      <div className="mt-4 max-h-[280px] space-y-3 overflow-y-auto pr-1">{children}</div>
    </div>
  );
}

function TranscriptBubble({
  speaker,
  text,
  pending = false
}: {
  speaker: "caller" | "agent" | "system";
  text: string;
  pending?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.3rem] px-4 py-3 text-sm",
        speaker === "caller" && "bg-white/10 text-white",
        speaker === "agent" && "bg-cyan-400/12 text-cyan-50",
        speaker === "system" && "border border-dashed border-white/15 bg-white/5 text-white/75",
        pending && "animate-pulse"
      )}
    >
      <p className="mb-1 text-[11px] uppercase tracking-[0.24em] text-white/45">{speaker}</p>
      <p>{text}</p>
    </div>
  );
}

function MetricPill({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/6 px-4 py-3">
      <div className="flex items-center gap-2 text-white/55">
        <Icon className="h-4 w-4" />
        <span className="text-xs uppercase tracking-[0.24em]">{label}</span>
      </div>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/6 px-4 py-3 text-sm">
      <span className="text-white/55">{label}</span>
      <span className="max-w-[58%] truncate text-right text-white">{value}</span>
    </div>
  );
}

function formatMetric(value: number | null) {
  return value == null ? "Waiting" : `${value} ms`;
}

async function blobToBase64(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(arrayBuffer);
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}
