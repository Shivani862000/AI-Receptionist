import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { AnalyticsQueryDto } from "./dto/analytics-query.dto";
import { AnalyticsService } from "./analytics.service";

@ApiTags("Analytics")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("call-trends")
  @ApiOperation({ summary: "Get call trend analytics" })
  callTrends(@CurrentUser() currentUser: CurrentUserType, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.callTrends(currentUser, query);
  }

  @Get("message-trends")
  @ApiOperation({ summary: "Get message trend analytics" })
  messageTrends(@CurrentUser() currentUser: CurrentUserType, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.messageTrends(currentUser, query);
  }

  @Get("automation-trends")
  @ApiOperation({ summary: "Get automation trend analytics" })
  automationTrends(@CurrentUser() currentUser: CurrentUserType, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.automationTrends(currentUser, query);
  }

  @Get("sentiment-trends")
  @ApiOperation({ summary: "Get sentiment trend analytics" })
  sentimentTrends(@CurrentUser() currentUser: CurrentUserType, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.sentimentTrends(currentUser, query);
  }

  @Get("channel-performance")
  @ApiOperation({ summary: "Get channel performance analytics" })
  channelPerformance(@CurrentUser() currentUser: CurrentUserType) {
    return this.analyticsService.channelPerformance(currentUser);
  }
}
