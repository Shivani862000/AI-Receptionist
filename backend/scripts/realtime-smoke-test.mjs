import { io } from "socket.io-client";

const WS_BASE_URL = process.env.REALTIME_BASE_URL ?? "http://localhost:4000";
const SAMPLE_TEXT = process.env.REALTIME_SAMPLE_TEXT ?? "I need to book an appointment for tomorrow morning.";

function log(message) {
  console.log(`[realtime] ${message}`);
}

async function main() {
  const socket = io(`${WS_BASE_URL}/realtime`, {
    transports: ["websocket"],
    timeout: 8000,
    reconnection: false
  });

  let sessionId = null;
  let sawFinalTranscript = false;
  let sawAiChunk = false;
  let sawTtsChunk = false;

  const timeout = setTimeout(() => {
    console.error("[realtime] Timed out waiting for realtime flow to complete");
    socket.close();
    process.exit(1);
  }, 20000);

  socket.on("connect", () => {
    log(`Connected socket ${socket.id}`);
    socket.emit("start_session", {
      businessId: "demo-business",
      clientId: "demo-client",
      channel: "browser",
      language: "en"
    });
  });

  socket.on("connect_error", (error) => {
    clearTimeout(timeout);
    console.error(`[realtime] Connection failed: ${error.message}`);
    process.exit(1);
  });

  socket.on("session_status", (payload) => {
    log(`session_status ${JSON.stringify(payload)}`);

    if (payload.sessionId && !sessionId) {
      sessionId = payload.sessionId;
      socket.emit("audio_chunk", {
        sessionId,
        textHint: SAMPLE_TEXT,
        isFinal: true,
        transport: "browser"
      });
    }

    if (payload.status === "completed") {
      clearTimeout(timeout);
      socket.close();

      if (!sawFinalTranscript || !sawAiChunk || !sawTtsChunk) {
        console.error("[realtime] Realtime flow completed but not all stages were observed");
        process.exit(1);
      }

      log("Realtime flow completed successfully");
      process.exit(0);
    }
  });

  socket.on("partial_transcript", (payload) => {
    log(`partial_transcript ${JSON.stringify(payload)}`);
  });

  socket.on("final_transcript", (payload) => {
    sawFinalTranscript = true;
    log(`final_transcript ${JSON.stringify(payload)}`);
  });

  socket.on("ai_response_chunk", (payload) => {
    if (payload.chunk) {
      sawAiChunk = true;
    }
    log(`ai_response_chunk ${JSON.stringify(payload)}`);
  });

  socket.on("tts_audio_chunk", (payload) => {
    sawTtsChunk = true;
    log(`tts_audio_chunk ${JSON.stringify({ sequence: payload.sequence, isLast: payload.isLast, mimeType: payload.mimeType })}`);

    if (payload.isLast && sessionId) {
      socket.emit("stop_session", {
        sessionId,
        reason: "realtime-smoke"
      });
    }
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
