import { Injectable } from "@nestjs/common";

import type { CurrentUserType } from "../../common/types/current-user.type";
import { UsageService } from "../usage/usage.service";
import { AiAnalyzeSentimentDto } from "./dto/analyze-sentiment.dto";
import { AiExtractKeyPointsDto } from "./dto/extract-keypoints.dto";
import { AiGenerateReplyDto } from "./dto/generate-reply.dto";
import { AiGenerateSummaryDto } from "./dto/generate-summary.dto";
import { AiProviderService } from "./services/ai-provider.service";

@Injectable()
export class AiService {
  constructor(
    private readonly aiProviderService: AiProviderService,
    private readonly usageService: UsageService
  ) {}

  async generateSummary(currentUser: CurrentUserType, dto: AiGenerateSummaryDto) {
    const result = await this.aiProviderService.generateSummary(dto);
    await this.usageService.increment(currentUser.businessId, "ai_requests", 1, "requests", {
      route: "generate-summary"
    });
    return {
      message: "AI summary generated",
      data: result.data,
      meta: {
        provider: result.provider,
        model: result.model,
        usage: result.usage,
        usedFallback: result.usedFallback ?? false
      }
    };
  }

  async generateReply(currentUser: CurrentUserType, dto: AiGenerateReplyDto) {
    const result = await this.aiProviderService.generateReply(dto);
    await this.usageService.increment(currentUser.businessId, "ai_requests", 1, "requests", {
      route: "generate-reply"
    });
    return {
      message: "AI reply generated",
      data: result.data,
      meta: {
        provider: result.provider,
        model: result.model,
        usage: result.usage,
        usedFallback: result.usedFallback ?? false
      }
    };
  }

  async extractKeyPoints(currentUser: CurrentUserType, dto: AiExtractKeyPointsDto) {
    const result = await this.aiProviderService.extractKeyPoints(dto);
    await this.usageService.increment(currentUser.businessId, "ai_requests", 1, "requests", {
      route: "extract-keypoints"
    });
    return {
      message: "Key points extracted",
      data: result.data,
      meta: {
        provider: result.provider,
        model: result.model,
        usage: result.usage,
        usedFallback: result.usedFallback ?? false
      }
    };
  }

  async analyzeSentiment(currentUser: CurrentUserType, dto: AiAnalyzeSentimentDto) {
    const result = await this.aiProviderService.analyzeSentiment(dto);
    await this.usageService.increment(currentUser.businessId, "ai_requests", 1, "requests", {
      route: "analyze-sentiment"
    });
    return {
      message: "Sentiment analyzed",
      data: result.data,
      meta: {
        provider: result.provider,
        model: result.model,
        usage: result.usage,
        usedFallback: result.usedFallback ?? false
      }
    };
  }
}
