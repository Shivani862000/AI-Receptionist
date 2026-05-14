import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { ExportPdfDto } from "./dto/export-pdf.dto";
import { ExportReportDto } from "./dto/export-report.dto";
import { ReportQueryDto } from "./dto/report-query.dto";
import { ReportsService } from "./reports.service";

@ApiTags("Reports")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("calls")
  @ApiOperation({ summary: "Get call report" })
  calls(@CurrentUser() currentUser: CurrentUserType, @Query() query: ReportQueryDto) {
    return this.reportsService.calls(currentUser, query);
  }

  @Get("messages")
  @ApiOperation({ summary: "Get message report" })
  messages(@CurrentUser() currentUser: CurrentUserType, @Query() query: ReportQueryDto) {
    return this.reportsService.messages(currentUser, query);
  }

  @Get("automations")
  @ApiOperation({ summary: "Get automation report" })
  automations(@CurrentUser() currentUser: CurrentUserType, @Query() query: ReportQueryDto) {
    return this.reportsService.automations(currentUser, query);
  }

  @Get("clients")
  @ApiOperation({ summary: "Get client report" })
  clients(@CurrentUser() currentUser: CurrentUserType, @Query() query: ReportQueryDto) {
    return this.reportsService.clients(currentUser, query);
  }

  @Get("overview")
  @ApiOperation({ summary: "Get overview report" })
  overview(@CurrentUser() currentUser: CurrentUserType, @Query() query: ReportQueryDto) {
    return this.reportsService.overview(currentUser, query);
  }

  @Get("call-analytics")
  @ApiOperation({ summary: "Get legacy call analytics" })
  callAnalytics(@CurrentUser() currentUser: CurrentUserType) {
    return this.reportsService.callAnalytics(currentUser);
  }

  @Get("sentiment")
  @ApiOperation({ summary: "Get legacy sentiment report" })
  sentiment(@CurrentUser() currentUser: CurrentUserType) {
    return this.reportsService.sentiment(currentUser);
  }

  @Get("daily-summary")
  @ApiOperation({ summary: "Get legacy daily summary" })
  dailySummary(@CurrentUser() currentUser: CurrentUserType) {
    return this.reportsService.dailySummary(currentUser);
  }

  @Post("export-pdf")
  @ApiOperation({ summary: "Queue legacy PDF export" })
  exportPdf(@CurrentUser() currentUser: CurrentUserType, @Body() dto: ExportPdfDto) {
    return this.reportsService.exportPdf(currentUser, dto);
  }

  @Post("export/call-summary")
  @ApiOperation({ summary: "Generate call summary PDF" })
  exportCallSummary(@CurrentUser() currentUser: CurrentUserType, @Body() dto: ExportReportDto) {
    return this.reportsService.exportCallSummary(currentUser, dto);
  }

  @Post("export/client-report")
  @ApiOperation({ summary: "Generate client report PDF" })
  exportClientReport(@CurrentUser() currentUser: CurrentUserType, @Body() dto: ExportReportDto) {
    return this.reportsService.exportClientReport(currentUser, dto);
  }

  @Post("export/daily-summary")
  @ApiOperation({ summary: "Generate daily summary PDF" })
  exportDailySummary(@CurrentUser() currentUser: CurrentUserType, @Body() dto: ExportReportDto) {
    return this.reportsService.exportDailySummary(currentUser, dto);
  }

  @Post("export/transcript")
  @ApiOperation({ summary: "Generate transcript PDF" })
  exportTranscript(@CurrentUser() currentUser: CurrentUserType, @Body() dto: ExportReportDto) {
    return this.reportsService.exportTranscript(currentUser, dto);
  }
}
