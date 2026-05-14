import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AiSummaryService } from "./ai-summary.service";
import { GenerateAiSummaryDto } from "./dto/generate-ai-summary.dto";

@ApiTags("AI Summary")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("ai-summary")
export class AiSummaryController {
  constructor(private readonly aiSummaryService: AiSummaryService) {}

  @Post("generate/:callId")
  @ApiOperation({ summary: "Generate a mock AI summary for a call" })
  generate(@Param("callId") callId: string, @Body() dto: GenerateAiSummaryDto) {
    return this.aiSummaryService.generate(callId, dto);
  }

  @Get(":callId")
  @ApiOperation({ summary: "Get AI summary by call id" })
  findByCallId(@Param("callId") callId: string) {
    return this.aiSummaryService.findByCallId(callId);
  }
}
