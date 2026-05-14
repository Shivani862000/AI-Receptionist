import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { AutomationsService } from "./automations.service";
import { CreateAutomationDto } from "./dto/create-automation.dto";
import { ListAutomationsDto } from "./dto/list-automations.dto";
import { ToggleAutomationDto } from "./dto/toggle-automation.dto";
import { UpdateAutomationDto } from "./dto/update-automation.dto";

@ApiTags("Automations")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("automations")
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  @Post()
  @ApiOperation({ summary: "Create automation" })
  create(@CurrentUser() currentUser: CurrentUserType, @Body() dto: CreateAutomationDto) {
    return this.automationsService.create(currentUser, dto);
  }

  @Get()
  @ApiOperation({ summary: "List automations" })
  findAll(@CurrentUser() currentUser: CurrentUserType, @Query() query: ListAutomationsDto) {
    return this.automationsService.findAll(currentUser, query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get automation details" })
  findOne(@CurrentUser() currentUser: CurrentUserType, @Param("id") id: string) {
    return this.automationsService.findOne(currentUser, id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update automation" })
  update(@CurrentUser() currentUser: CurrentUserType, @Param("id") id: string, @Body() dto: UpdateAutomationDto) {
    return this.automationsService.update(currentUser, id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete automation" })
  remove(@CurrentUser() currentUser: CurrentUserType, @Param("id") id: string) {
    return this.automationsService.remove(currentUser, id);
  }

  @Patch(":id/toggle")
  @ApiOperation({ summary: "Toggle automation active state" })
  toggle(@CurrentUser() currentUser: CurrentUserType, @Param("id") id: string, @Body() dto: ToggleAutomationDto) {
    return this.automationsService.toggle(currentUser, id, dto);
  }

  @Get(":id/logs")
  @ApiOperation({ summary: "Get automation logs" })
  logs(@CurrentUser() currentUser: CurrentUserType, @Param("id") id: string) {
    return this.automationsService.logs(currentUser, id);
  }
}
