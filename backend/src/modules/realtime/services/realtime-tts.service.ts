import * as fs from "fs/promises";

import { Injectable } from "@nestjs/common";

import { TtsService } from "../../tts/tts.service";
import { LiveSessionManagerService } from "./live-session-manager.service";

@Injectable()
export class RealtimeTtsService {
  constructor(
    private readonly ttsService: TtsService,
    private readonly liveSessionManagerService: LiveSessionManagerService
  ) {}

  async streamAudio(
    sessionId: string,
    text: string,
    voice: string | null,
    onChunk: (payload: { chunkBase64: string; sequence: number; isLast: boolean; mimeType: string; audioUrl?: string }) => Promise<void> | void
  ) {
    const startedAt = Date.now();
    const audio = await this.ttsService.generateAudioFile(text, voice ?? undefined);
    const buffer = await fs.readFile(audio.filePath);
    const chunkSize = 8 * 1024;
    const mimeType = audio.audioUrl.endsWith(".mp3") ? "audio/mpeg" : "audio/wav";

    let sequence = 0;
    for (let offset = 0; offset < buffer.length; offset += chunkSize) {
      const chunk = buffer.subarray(offset, offset + chunkSize);
      sequence += 1;
      await onChunk({
        chunkBase64: chunk.toString("base64"),
        sequence,
        isLast: offset + chunkSize >= buffer.length,
        mimeType,
        audioUrl: audio.audioUrl
      });
    }

    this.liveSessionManagerService.setMetrics(sessionId, {
      ttsMs: Date.now() - startedAt
    });

    return audio;
  }
}
