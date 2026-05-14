import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { AiAnalyzeSentimentDto } from "./dto/analyze-sentiment.dto";
import { AiExtractKeyPointsDto } from "./dto/extract-keypoints.dto";
import { AiGenerateReplyDto } from "./dto/generate-reply.dto";
import { AiGenerateSummaryDto } from "./dto/generate-summary.dto";
import { AiService } from "./ai.service";

@ApiTags("AI")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("ai")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("generate-summary")
  @ApiOperation({ summary: "Generate AI summary using Gemini" })
  generateSummary(@CurrentUser() currentUser: CurrentUserType, @Body() dto: AiGenerateSummaryDto) {
    return this.aiService.generateSummary(currentUser, dto);
  }

  @Post("generate-reply")
  @ApiOperation({ summary: "Generate AI reply using Gemini" })
  generateReply(@CurrentUser() currentUser: CurrentUserType, @Body() dto: AiGenerateReplyDto) {
    return this.aiService.generateReply(currentUser, dto);
  }

  @Post("extract-keypoints")
  @ApiOperation({ summary: "Extract key points using Gemini" })
  extractKeyPoints(@CurrentUser() currentUser: CurrentUserType, @Body() dto: AiExtractKeyPointsDto) {
    return this.aiService.extractKeyPoints(currentUser, dto);
  }

  @Post("analyze-sentiment")
  @ApiOperation({ summary: "Analyze sentiment using Gemini" })
  analyzeSentiment(@CurrentUser() currentUser: CurrentUserType, @Body() dto: AiAnalyzeSentimentDto) {
    return this.aiService.analyzeSentiment(currentUser, dto);
  }
}
