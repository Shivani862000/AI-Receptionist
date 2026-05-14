import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { DashboardService } from "./dashboard.service";

@ApiTags("Dashboard")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("stats")
  @ApiOperation({ summary: "Get dashboard stats" })
  stats(@CurrentUser() currentUser: CurrentUserType) {
    return this.dashboardService.stats(currentUser);
  }

  @Get("recent-activity")
  @ApiOperation({ summary: "Get recent activity" })
  recentActivity(@CurrentUser() currentUser: CurrentUserType) {
    return this.dashboardService.recentActivity(currentUser);
  }

  @Get("recent-activities")
  @ApiOperation({ summary: "Get recent activities" })
  recentActivities(@CurrentUser() currentUser: CurrentUserType) {
    return this.dashboardService.recentActivity(currentUser);
  }

  @Get("ai-insights")
  @ApiOperation({ summary: "Get AI insights" })
  aiInsights(@CurrentUser() currentUser: CurrentUserType) {
    return this.dashboardService.aiInsights(currentUser);
  }

  @Get("quick-insights")
  @ApiOperation({ summary: "Get quick dashboard insights" })
  quickInsights(@CurrentUser() currentUser: CurrentUserType) {
    return this.dashboardService.quickInsights(currentUser);
  }
}
