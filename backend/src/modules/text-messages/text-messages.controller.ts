import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { CreateTextMessageDto } from "./dto/create-text-message.dto";
import { ListTextMessagesDto } from "./dto/list-text-messages.dto";
import { UpdateTextMessageDto } from "./dto/update-text-message.dto";
import { TextMessagesService } from "./text-messages.service";

@ApiTags("Text Messages")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("text-messages")
export class TextMessagesController {
  constructor(private readonly textMessagesService: TextMessagesService) {}

  @Post()
  @ApiOperation({ summary: "Create/send text message" })
  create(@CurrentUser() currentUser: CurrentUserType, @Body() dto: CreateTextMessageDto) {
    return this.textMessagesService.create(currentUser, dto);
  }

  @Get()
  @ApiOperation({ summary: "List text messages" })
  findAll(@CurrentUser() currentUser: CurrentUserType, @Query() query: ListTextMessagesDto) {
    return this.textMessagesService.findAll(currentUser, query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get text message" })
  findOne(@CurrentUser() currentUser: CurrentUserType, @Param("id") id: string) {
    return this.textMessagesService.findOne(currentUser, id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update text message" })
  update(@CurrentUser() currentUser: CurrentUserType, @Param("id") id: string, @Body() dto: UpdateTextMessageDto) {
    return this.textMessagesService.update(currentUser, id, dto);
  }
}
