import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { ActivitiesService } from "./activities.service";

@ApiTags("Activities")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("activities")
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @ApiOperation({ summary: "List activity logs" })
  findAll(@CurrentUser() currentUser: CurrentUserType, @Query() query: PaginationQueryDto) {
    return this.activitiesService.findAll(currentUser, query);
  }
}
