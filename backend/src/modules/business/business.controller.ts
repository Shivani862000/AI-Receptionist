import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { BusinessService } from "./business.service";
import { CreateBusinessDto } from "./dto/create-business.dto";
import { UpdateBusinessDto } from "./dto/update-business.dto";

@ApiTags("Business")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("business")
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  @ApiOperation({ summary: "Create business" })
  create(@CurrentUser() currentUser: CurrentUserType, @Body() dto: CreateBusinessDto) {
    return this.businessService.create(currentUser, dto);
  }

  @Get()
  @ApiOperation({ summary: "List businesses" })
  findAll(@CurrentUser() currentUser: CurrentUserType, @Query() query: PaginationQueryDto) {
    return this.businessService.findAll(currentUser, query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get business by id" })
  findOne(@CurrentUser() currentUser: CurrentUserType, @Param("id") id: string) {
    return this.businessService.findOne(currentUser, id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update business by id" })
  update(@CurrentUser() currentUser: CurrentUserType, @Param("id") id: string, @Body() dto: UpdateBusinessDto) {
    return this.businessService.update(currentUser, id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete business by id" })
  remove(@CurrentUser() currentUser: CurrentUserType, @Param("id") id: string) {
    return this.businessService.remove(currentUser, id);
  }
}
