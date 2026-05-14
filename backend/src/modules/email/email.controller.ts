import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { ListMessagesDto } from "../messages/dto/list-messages.dto";
import { EmailWebhookIncomingDto } from "./dto/email-webhook-incoming.dto";
import { SendEmailDto } from "./dto/send-email.dto";
import { EmailService } from "./email.service";

@ApiTags("Email")
@Controller("email")
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post("send")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Send email" })
  send(@CurrentUser() currentUser: CurrentUserType, @Body() dto: SendEmailDto) {
    return this.emailService.send(currentUser, dto);
  }

  @Get("history")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List email history" })
  history(@CurrentUser() currentUser: CurrentUserType, @Query() query: ListMessagesDto) {
    return this.emailService.history(currentUser, query);
  }

  @Public()
  @Post("webhook/incoming")
  @ApiOperation({ summary: "Simulate incoming email reply webhook" })
  incoming(@Body() payload: EmailWebhookIncomingDto) {
    return this.emailService.handleIncoming(payload);
  }
}
