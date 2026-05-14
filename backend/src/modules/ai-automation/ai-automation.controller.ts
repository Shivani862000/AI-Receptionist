import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AiAutomationService } from "./ai-automation.service";

@ApiTags("AI Automation")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("ai-automation")
export class AiAutomationController {
  constructor(private readonly aiAutomationService: AiAutomationService) {}

  @Get("suggestions")
  @ApiOperation({ summary: "Get mock AI automation suggestions" })
  suggestions() {
    return this.aiAutomationService.suggestions();
  }
}
