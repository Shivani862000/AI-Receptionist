import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { ServicesService } from "./services.service";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";

@ApiTags("Services")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("services")
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiOperation({ summary: "Create service" })
  create(@CurrentUser() currentUser: CurrentUserType, @Body() dto: CreateServiceDto) {
    return this.servicesService.create(currentUser, dto);
  }

  @Get()
  @ApiOperation({ summary: "List services" })
  findAll(@CurrentUser() currentUser: CurrentUserType, @Query() query: PaginationQueryDto) {
    return this.servicesService.findAll(currentUser, query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get service details" })
  findOne(@CurrentUser() currentUser: CurrentUserType, @Param("id") id: string) {
    return this.servicesService.findOne(currentUser, id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update service" })
  update(@CurrentUser() currentUser: CurrentUserType, @Param("id") id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(currentUser, id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete service" })
  remove(@CurrentUser() currentUser: CurrentUserType, @Param("id") id: string) {
    return this.servicesService.remove(currentUser, id);
  }
}
