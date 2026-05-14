import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { AutomationLogsService } from "./automation-logs.service";
import { ListAutomationLogsDto } from "./dto/list-automation-logs.dto";

@ApiTags("Automation Logs")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("automation-logs")
export class AutomationLogsController {
  constructor(private readonly automationLogsService: AutomationLogsService) {}

  @Get()
  @ApiOperation({ summary: "List automation execution logs" })
  findAll(@CurrentUser() currentUser: CurrentUserType, @Query() query: ListAutomationLogsDto) {
    return this.automationLogsService.findAll(currentUser, query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get automation execution log" })
  findOne(@CurrentUser() currentUser: CurrentUserType, @Param("id") id: string) {
    return this.automationLogsService.findOne(currentUser, id);
  }
}
