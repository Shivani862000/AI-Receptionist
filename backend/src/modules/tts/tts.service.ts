import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DeepgramClient } from "@deepgram/sdk";
import * as fs from "fs/promises";
import * as path from "path";

import { ExternalProviderException } from "../../common/exceptions/app.exception";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { createSilentWavBuffer } from "../../common/utils/silent-wav";
import { UsageService } from "../usage/usage.service";
import { GenerateTtsDto } from "./dto/generate-tts.dto";

@Injectable()
export class TtsService {
  private readonly logger = new Logger(TtsService.name);
  private readonly apiKey?: string;
  private readonly model: string;
  private readonly timeoutMs: number;
  private readonly client?: DeepgramClient;
  private readonly backendBaseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly usageService: UsageService
  ) {
    this.apiKey = this.configService.get<string>("deepgram.apiKey") || undefined;
    this.model = this.configService.get<string>("deepgram.ttsModel") || "aura-asteria-en";
    this.timeoutMs = this.configService.get<number>("deepgram.requestTimeoutMs") || 20000;
    this.backendBaseUrl = this.configService.get<string>("app.backendBaseUrl") || "http://localhost:4000";

    if (this.apiKey) {
      this.client = new DeepgramClient({ apiKey: this.apiKey, timeoutInSeconds: Math.ceil(this.timeoutMs / 1000) });
    }
  }

  async generate(currentUser: CurrentUserType, dto: GenerateTtsDto) {
    const result = await this.generateAudioFile(dto.text, dto.voice);
    await this.usageService.increment(currentUser.businessId, "tts_characters", dto.text.length, "characters", {
      voice: dto.voice ?? this.model
    });

    return {
      message: "TTS audio generated",
      data: result
    };
  }

  async generateAudioFile(text: string, voice?: string) {
    const directory = path.join(process.cwd(), "uploads", "tts-audio");
    await fs.mkdir(directory, { recursive: true });

    const extension = this.client ? "mp3" : "wav";
    const filename = `tts-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
    const filePath = path.join(directory, filename);

    try {
      let buffer: Buffer;
      let provider = "mock-deepgram-fallback";

      if (this.client) {
        const response = await this.withTimeout(
          this.client.speak.v1.audio.generate({
            text,
            model: voice ?? this.model
          }),
          this.timeoutMs
        );

        buffer = Buffer.from(await response.arrayBuffer());
        provider = "deepgram";
      } else {
        buffer = createSilentWavBuffer(2);
      }

      await fs.writeFile(filePath, buffer);

      return {
        provider,
        voice: voice ?? this.model,
        filePath,
        audioUrl: `${this.backendBaseUrl}/uploads/tts-audio/${filename}`,
        usedFallback: !this.client
      };
    } catch (error) {
      this.logger.error("Deepgram TTS generation failed", error instanceof Error ? error.stack : String(error));
      const buffer = createSilentWavBuffer(2);
      const fallbackFilename = `tts-fallback-${Date.now()}.wav`;
      const fallbackPath = path.join(directory, fallbackFilename);
      await fs.writeFile(fallbackPath, buffer);

      return {
        provider: "mock-deepgram-fallback",
        voice: voice ?? this.model,
        filePath: fallbackPath,
        audioUrl: `${this.backendBaseUrl}/uploads/tts-audio/${fallbackFilename}`,
        usedFallback: true
      };
    }
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
    return Promise.race<T>([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new ExternalProviderException("Deepgram TTS request timed out")), timeoutMs)
      )
    ]);
  }
}
