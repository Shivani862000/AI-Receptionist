import { Injectable } from "@nestjs/common";
import { MessageChannel } from "@prisma/client";

import { AiProviderService } from "../ai/services/ai-provider.service";

export type AiReplyResult = {
  reply: string;
  sentiment: "positive" | "neutral" | "negative";
  intent: "inquiry" | "complaint" | "appointment" | "feedback";
  channel: MessageChannel;
};

@Injectable()
export class AiReplyService {
  constructor(private readonly aiProviderService: AiProviderService) {}

  async generate(dto: { message: string; channel: MessageChannel }) {
    return {
      data: await this.generateReply(dto)
    };
  }

  async generateReply(dto: { message: string; channel: MessageChannel }): Promise<AiReplyResult> {
    const providerResult = await this.aiProviderService.generateReply({
      message: dto.message,
      channel: dto.channel
    });

    if (providerResult.data?.reply) {
      return {
        channel: dto.channel,
        reply: providerResult.data.reply,
        intent: providerResult.data.intent,
        sentiment: providerResult.data.sentiment
      };
    }

    const text = dto.message.toLowerCase();

    const intent = this.detectIntent(text);
    const sentiment = this.detectSentiment(text);

    return {
      channel: dto.channel,
      intent,
      sentiment,
      reply: this.buildReply(intent, sentiment, dto.channel)
    };
  }

  private detectIntent(text: string): AiReplyResult["intent"] {
    if (text.includes("book") || text.includes("appointment") || text.includes("reschedule")) {
      return "appointment";
    }

    if (text.includes("bad") || text.includes("issue") || text.includes("problem") || text.includes("complaint")) {
      return "complaint";
    }

    if (text.includes("feedback") || text.includes("review") || text.includes("experience")) {
      return "feedback";
    }

    return "inquiry";
  }

  private detectSentiment(text: string): AiReplyResult["sentiment"] {
    if (text.includes("bad") || text.includes("angry") || text.includes("upset") || text.includes("complaint")) {
      return "negative";
    }

    if (text.includes("thanks") || text.includes("thank you") || text.includes("great")) {
      return "positive";
    }

    return "neutral";
  }

  private buildReply(intent: AiReplyResult["intent"], sentiment: AiReplyResult["sentiment"], channel: MessageChannel) {
    const channelLabel = channel === MessageChannel.email ? "email" : channel;

    if (intent === "appointment") {
      return `Thank you for your ${channelLabel} message. We can help with your appointment request and our team will confirm the next available slot shortly.`;
    }

    if (intent === "complaint") {
      return `Thank you for sharing this with us. We are sorry for the inconvenience and a team member will review your concern and get back to you soon.`;
    }

    if (intent === "feedback") {
      return `Thank you for your feedback. We appreciate you taking the time to share your experience with us.`;
    }

    if (sentiment === "positive") {
      return `Thank you for your message. We are glad to help and our team will reply with the details shortly.`;
    }

    return `Thank you for your message. Our team has received it and will get back to you shortly.`;
  }
}
