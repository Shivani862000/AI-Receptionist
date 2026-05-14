import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { AiInsightsService } from "./ai-insights.service";

@ApiTags("AI Insights")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("ai-insights")
export class AiInsightsController {
  constructor(private readonly aiInsightsService: AiInsightsService) {}

  @Get("business")
  @ApiOperation({ summary: "Get AI business insights" })
  business(@CurrentUser() currentUser: CurrentUserType) {
    return this.aiInsightsService.business(currentUser);
  }

  @Get("communication")
  @ApiOperation({ summary: "Get AI communication insights" })
  communication(@CurrentUser() currentUser: CurrentUserType) {
    return this.aiInsightsService.communication(currentUser);
  }

  @Get("followups")
  @ApiOperation({ summary: "Get AI follow-up insights" })
  followups(@CurrentUser() currentUser: CurrentUserType) {
    return this.aiInsightsService.followups(currentUser);
  }
}
