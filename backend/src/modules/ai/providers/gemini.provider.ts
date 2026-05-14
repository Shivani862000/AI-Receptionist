import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";

import { ExternalProviderException } from "../../../common/exceptions/app.exception";
import type {
  AiProvider,
  AiUsage,
  KeyPointResult,
  ProviderResult,
  ReplyResult,
  SentimentResult,
  SummaryResult
} from "./ai-provider.interface";

@Injectable()
export class GeminiProvider implements AiProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly apiKey?: string;
  private readonly model: string;
  private readonly timeoutMs: number;
  private readonly client?: GoogleGenAI;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>("ai.geminiApiKey") || undefined;
    this.model = this.configService.get<string>("ai.geminiModel") || "gemini-2.5-flash-preview";
    this.timeoutMs = this.configService.get<number>("ai.requestTimeoutMs") || 15000;

    if (this.apiKey) {
      this.client = new GoogleGenAI({ apiKey: this.apiKey });
    }
  }

  isConfigured() {
    return Boolean(this.client);
  }

  async generateSummary(input: {
    transcript: string;
    customerName?: string | null;
    businessName?: string | null;
  }): Promise<ProviderResult<SummaryResult>> {
    const fallback = this.buildFallbackSummary(input.transcript);

    return this.generateStructuredJson<SummaryResult>({
      prompt: [
        "You are an AI receptionist assistant for a business.",
        "Generate a clean JSON object with keys: summary, sentiment, keyPoints, followUpRequired, followUpSuggestion.",
        "Keep summary under 30 words. Keep keyPoints short and factual.",
        `Customer name: ${input.customerName ?? "Unknown"}`,
        `Business name: ${input.businessName ?? "Unknown"}`,
        `Transcript:\n${input.transcript}`
      ].join("\n"),
      fallback
    });
  }

  async generateReply(input: { message: string; channel: string }): Promise<ProviderResult<ReplyResult>> {
    const fallback = this.buildFallbackReply(input.message, input.channel);

    return this.generateStructuredJson<ReplyResult>({
      prompt: [
        "You are an AI receptionist.",
        "Generate a business-friendly JSON object with keys: reply, sentiment, intent.",
        "Intent must be one of: inquiry, complaint, appointment, feedback.",
        "Sentiment must be one of: positive, neutral, negative.",
        `Channel: ${input.channel}`,
        `Customer message: ${input.message}`
      ].join("\n"),
      fallback
    });
  }

  async extractKeyPoints(input: { text: string }): Promise<ProviderResult<KeyPointResult>> {
    const fallback = {
      keyPoints: input.text
        .split(/[.?!]/)
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 3)
    };

    return this.generateStructuredJson<KeyPointResult>({
      prompt: [
        "Extract the most relevant business key points from the text.",
        "Return JSON with a single key: keyPoints.",
        "Limit to 3 concise points.",
        input.text
      ].join("\n"),
      fallback
    });
  }

  async analyzeSentiment(input: { text: string }): Promise<ProviderResult<SentimentResult>> {
    const fallback = this.buildFallbackSentiment(input.text);

    return this.generateStructuredJson<SentimentResult>({
      prompt: [
        "Analyze the sentiment of the customer message.",
        "Return JSON with keys: sentiment and confidence.",
        "Sentiment must be one of: positive, neutral, negative.",
        `Text: ${input.text}`
      ].join("\n"),
      fallback
    });
  }

  private async generateStructuredJson<T>({
    prompt,
    fallback
  }: {
    prompt: string;
    fallback: T;
  }): Promise<ProviderResult<T>> {
    if (!this.client) {
      return {
        provider: "mock-gemini-fallback",
        model: "mock-ai",
        data: fallback,
        usage: {
          promptTokens: null,
          completionTokens: null,
          totalTokens: null
        },
        usedFallback: true
      };
    }

    try {
      const response = await this.withTimeout(
        this.client.models.generateContent({
          model: this.model,
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        }),
        this.timeoutMs
      );

      const text = response.text?.trim();
      if (!text) {
        throw new ExternalProviderException("Gemini returned an empty response");
      }

      const data = JSON.parse(text) as T;
      const usage = this.mapUsage(response.usageMetadata as unknown as Record<string, unknown> | undefined);

      this.logger.log(
        `Gemini request completed model=${this.model} totalTokens=${usage.totalTokens ?? "n/a"}`
      );

      return {
        provider: "gemini",
        model: this.model,
        data,
        rawResponse: response,
        usage
      };
    } catch (error) {
      this.logger.error("Gemini request failed", error instanceof Error ? error.stack : String(error));
      return {
        provider: "mock-gemini-fallback",
        model: "mock-ai",
        data: fallback,
        usage: {
          promptTokens: null,
          completionTokens: null,
          totalTokens: null
        },
        rawResponse: {
          error: error instanceof Error ? error.message : String(error)
        },
        usedFallback: true
      };
    }
  }

  private mapUsage(usageMetadata: Record<string, unknown> | undefined): AiUsage {
    return {
      promptTokens: typeof usageMetadata?.promptTokenCount === "number" ? usageMetadata.promptTokenCount : null,
      completionTokens:
        typeof usageMetadata?.candidatesTokenCount === "number" ? usageMetadata.candidatesTokenCount : null,
      totalTokens: typeof usageMetadata?.totalTokenCount === "number" ? usageMetadata.totalTokenCount : null
    };
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
    return Promise.race<T>([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new ExternalProviderException("Gemini request timed out")), timeoutMs)
      )
    ]);
  }

  private buildFallbackSummary(transcript: string): SummaryResult {
    const cleaned = transcript.trim();
    const sentence = cleaned.split(/[.?!]/).find(Boolean)?.trim() || "Customer shared an update.";
    const sentiment = this.buildFallbackSentiment(cleaned).sentiment;

    return {
      summary: sentence.slice(0, 160),
      sentiment,
      keyPoints: cleaned
        .split(/[.?!]/)
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 3),
      followUpRequired: cleaned.toLowerCase().includes("call back") || cleaned.toLowerCase().includes("tomorrow"),
      followUpSuggestion: "Follow up with the customer during the next business window."
    };
  }

  private buildFallbackReply(message: string, channel: string): ReplyResult {
    const text = message.toLowerCase();
    const sentiment = this.buildFallbackSentiment(text).sentiment;
    let intent: ReplyResult["intent"] = "inquiry";

    if (text.includes("appointment") || text.includes("book") || text.includes("reschedule")) {
      intent = "appointment";
    } else if (text.includes("issue") || text.includes("problem") || text.includes("complaint")) {
      intent = "complaint";
    } else if (text.includes("feedback") || text.includes("review")) {
      intent = "feedback";
    }

    return {
      reply:
        intent === "appointment"
          ? `Thanks for your ${channel} message. We can help with the appointment request and will confirm the next slot shortly.`
          : intent === "complaint"
            ? "Thank you for letting us know. We are reviewing the concern and a team member will get back to you soon."
            : intent === "feedback"
              ? "Thank you for your feedback. We appreciate you sharing your experience with us."
              : "Thank you for your message. Our team has received it and will reply shortly.",
      sentiment,
      intent
    };
  }

  private buildFallbackSentiment(text: string): SentimentResult {
    const normalized = text.toLowerCase();

    if (/(bad|angry|issue|problem|complaint|upset)/.test(normalized)) {
      return { sentiment: "negative", confidence: 0.73 };
    }

    if (/(thank|great|good|helpful|perfect)/.test(normalized)) {
      return { sentiment: "positive", confidence: 0.71 };
    }

    return { sentiment: "neutral", confidence: 0.6 };
  }
}
