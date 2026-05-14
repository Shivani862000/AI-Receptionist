import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";

import { AppLoggerService } from "../../../common/logger/app-logger.service";
import { ConversationMemoryService } from "./conversation-memory.service";
import { LiveSessionManagerService } from "./live-session-manager.service";

@Injectable()
export class RealtimeAiService {
  private readonly apiKey?: string;
  private readonly model: string;
  private readonly timeoutMs: number;
  private readonly client?: GoogleGenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService,
    private readonly memoryService: ConversationMemoryService,
    private readonly liveSessionManagerService: LiveSessionManagerService
  ) {
    this.apiKey = this.configService.get<string>("ai.geminiApiKey") || undefined;
    this.model = this.configService.get<string>("ai.geminiModel") || "gemini-2.5-flash-preview";
    this.timeoutMs = this.configService.get<number>("ai.requestTimeoutMs") || 15000;

    if (this.apiKey) {
      this.client = new GoogleGenAI({ apiKey: this.apiKey });
    }
  }

  async streamReply(
    sessionId: string,
    input: { callerText: string; businessName?: string | null },
    onChunk: (chunk: string, isFinal: boolean) => Promise<void> | void
  ) {
    const startedAt = Date.now();
    const session = this.liveSessionManagerService.getRequired(sessionId);
    const nextMemory = this.memoryService.append(session.memory, {
      role: "user",
      text: input.callerText,
      createdAt: new Date().toISOString()
    });
    this.liveSessionManagerService.updateMemory(sessionId, nextMemory);
    this.liveSessionManagerService.setStatus(sessionId, "processing", "agent");

    const prompt = this.memoryService.buildPrompt(nextMemory, input.callerText, input.businessName);

    let fullText = "";

    if (this.client) {
      try {
        const stream = await Promise.race([
          this.client.models.generateContentStream({
            model: this.model,
            contents: prompt
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Gemini streaming timed out")), this.timeoutMs)
          )
        ]);

        for await (const chunk of stream) {
          const text = chunk.text?.trim();
          if (!text) {
            continue;
          }

          fullText += text;
          await onChunk(text, false);
        }
      } catch (error) {
        this.logger.warn("Gemini realtime streaming fell back to local reply", RealtimeAiService.name, {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    if (!fullText.trim()) {
      const fallback = this.buildFallbackReply(input.callerText);
      for (const chunk of this.chunkText(fallback, 26)) {
        fullText += `${chunk} `;
        await onChunk(chunk, false);
        await this.sleep(80);
      }
    }

    const finalText = fullText.trim();
    await onChunk("", true);

    const finalMemory = this.memoryService.append(nextMemory, {
      role: "model",
      text: finalText,
      createdAt: new Date().toISOString()
    });
    this.liveSessionManagerService.updateMemory(sessionId, finalMemory);
    this.liveSessionManagerService.appendTranscript(sessionId, {
      speaker: "agent",
      text: finalText,
      isFinal: true
    });
    this.liveSessionManagerService.setMetrics(sessionId, {
      aiMs: Date.now() - startedAt
    });
    this.liveSessionManagerService.setStatus(sessionId, "active", "agent");

    return finalText;
  }

  private buildFallbackReply(text: string) {
    const normalized = text.toLowerCase();

    if (normalized.includes("appointment") || normalized.includes("book")) {
      return "I can help with that appointment. Please share the date or time you prefer, and I will note it for the team.";
    }

    if (normalized.includes("report")) {
      return "I can help check the report status. Please confirm the patient name or phone number so I can continue.";
    }

    if (normalized.includes("price") || normalized.includes("cost")) {
      return "I can help with pricing details. Please tell me which service you want to ask about.";
    }

    return "Thanks for calling. I can help with appointments, report updates, reminders, and general questions. How can I help you today?";
  }

  private chunkText(text: string, wordsPerChunk: number) {
    const words = text.split(/\s+/).filter(Boolean);
    const chunks: string[] = [];

    for (let index = 0; index < words.length; index += wordsPerChunk) {
      chunks.push(words.slice(index, index + wordsPerChunk).join(" "));
    }

    return chunks;
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
