export type AiUsage = {
  promptTokens?: number | null;
  completionTokens?: number | null;
  totalTokens?: number | null;
};

export type SummaryResult = {
  summary: string;
  sentiment: "positive" | "neutral" | "negative";
  keyPoints: string[];
  followUpRequired: boolean;
  followUpSuggestion: string;
};

export type ReplyResult = {
  reply: string;
  sentiment: "positive" | "neutral" | "negative";
  intent: "inquiry" | "complaint" | "appointment" | "feedback";
};

export type KeyPointResult = {
  keyPoints: string[];
};

export type SentimentResult = {
  sentiment: "positive" | "neutral" | "negative";
  confidence: number;
};

export type ProviderResult<T> = {
  provider: string;
  model: string;
  data: T;
  rawResponse?: unknown;
  usage?: AiUsage;
  usedFallback?: boolean;
};

export interface AiProvider {
  isConfigured(): boolean;
  generateSummary(input: {
    transcript: string;
    customerName?: string | null;
    businessName?: string | null;
  }): Promise<ProviderResult<SummaryResult>>;
  generateReply(input: {
    message: string;
    channel: string;
  }): Promise<ProviderResult<ReplyResult>>;
  extractKeyPoints(input: {
    text: string;
  }): Promise<ProviderResult<KeyPointResult>>;
  analyzeSentiment(input: {
    text: string;
  }): Promise<ProviderResult<SentimentResult>>;
}
