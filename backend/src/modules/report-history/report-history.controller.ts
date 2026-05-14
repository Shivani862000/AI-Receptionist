import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { ReportQueryDto } from "../reports/dto/report-query.dto";
import { ReportHistoryService } from "./report-history.service";

@ApiTags("Report History")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("report-history")
export class ReportHistoryController {
  constructor(private readonly reportHistoryService: ReportHistoryService) {}

  @Get()
  @ApiOperation({ summary: "List exported report history" })
  findAll(@CurrentUser() currentUser: CurrentUserType, @Query() query: ReportQueryDto) {
    return this.reportHistoryService.findAll(currentUser, query);
  }
}
