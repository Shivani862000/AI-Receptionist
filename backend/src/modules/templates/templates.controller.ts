import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { CreateTemplateDto } from "./dto/create-template.dto";
import { UpdateTemplateDto } from "./dto/update-template.dto";
import { TemplatesService } from "./templates.service";

@ApiTags("Templates")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("templates")
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @ApiOperation({ summary: "Create message template" })
  create(@CurrentUser() currentUser: CurrentUserType, @Body() dto: CreateTemplateDto) {
    return this.templatesService.create(currentUser, dto);
  }

  @Get()
  @ApiOperation({ summary: "List message templates" })
  findAll(@CurrentUser() currentUser: CurrentUserType) {
    return this.templatesService.findAll(currentUser);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update message template" })
  update(@CurrentUser() currentUser: CurrentUserType, @Param("id") id: string, @Body() dto: UpdateTemplateDto) {
    return this.templatesService.update(currentUser, id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete message template" })
  remove(@CurrentUser() currentUser: CurrentUserType, @Param("id") id: string) {
    return this.templatesService.remove(currentUser, id);
  }
}
