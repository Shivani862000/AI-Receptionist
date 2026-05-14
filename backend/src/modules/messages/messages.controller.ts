import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { ListMessagesDto } from "./dto/list-messages.dto";
import { MessagesService } from "./messages.service";

@ApiTags("Messages")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("messages")
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  @ApiOperation({ summary: "List messages" })
  findAll(@CurrentUser() currentUser: CurrentUserType, @Query() query: ListMessagesDto) {
    return this.messagesService.findAll(currentUser, query);
  }

  @Get("client/:clientId")
  @ApiOperation({ summary: "List messages for a client" })
  findByClient(
    @CurrentUser() currentUser: CurrentUserType,
    @Param("clientId") clientId: string,
    @Query() query: ListMessagesDto
  ) {
    return this.messagesService.findByClient(currentUser, clientId, query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get message details" })
  findOne(@CurrentUser() currentUser: CurrentUserType, @Param("id") id: string) {
    return this.messagesService.findOne(currentUser, id);
  }
}
