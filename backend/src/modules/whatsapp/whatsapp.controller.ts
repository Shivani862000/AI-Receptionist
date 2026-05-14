import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { SendWhatsappDto } from "./dto/send-whatsapp.dto";
import { WhatsappWebhookIncomingDto } from "./dto/whatsapp-webhook-incoming.dto";
import { WhatsappWebhookStatusDto } from "./dto/whatsapp-webhook-status.dto";
import { WhatsappService } from "./whatsapp.service";

@ApiTags("WhatsApp")
@Controller("whatsapp")
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post("send")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Send WhatsApp message" })
  send(@CurrentUser() currentUser: CurrentUserType, @Body() dto: SendWhatsappDto) {
    return this.whatsappService.send(currentUser, dto);
  }

  @Public()
  @Post("webhook")
  @ApiOperation({ summary: "Handle WhatsApp webhook payload" })
  webhook(@Body() payload: WhatsappWebhookIncomingDto) {
    return this.whatsappService.handleIncoming(payload);
  }

  @Public()
  @Post("webhook/incoming")
  @ApiOperation({ summary: "Simulate incoming WhatsApp webhook" })
  incoming(@Body() payload: WhatsappWebhookIncomingDto) {
    return this.whatsappService.handleIncoming(payload);
  }

  @Public()
  @Post("webhook/status")
  @ApiOperation({ summary: "Simulate WhatsApp delivery or read status webhook" })
  status(@Body() payload: WhatsappWebhookStatusDto) {
    return this.whatsappService.handleStatus(payload);
  }
}
