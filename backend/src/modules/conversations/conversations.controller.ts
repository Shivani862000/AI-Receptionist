import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { ConversationsService } from "./conversations.service";

@ApiTags("Conversations")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("conversations")
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get("client/:clientId")
  @ApiOperation({ summary: "Get client communication timeline" })
  clientTimeline(@CurrentUser() currentUser: CurrentUserType, @Param("clientId") clientId: string) {
    return this.conversationsService.getClientTimeline(currentUser, clientId);
  }
}
