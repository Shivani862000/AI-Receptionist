import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { SendSmsDto } from "./dto/send-sms.dto";
import { SmsWebhookIncomingDto } from "./dto/sms-webhook-incoming.dto";
import { SmsWebhookStatusDto } from "./dto/sms-webhook-status.dto";
import { SmsService } from "./sms.service";

@ApiTags("SMS")
@Controller("sms")
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post("send")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Send SMS message" })
  send(@CurrentUser() currentUser: CurrentUserType, @Body() dto: SendSmsDto) {
    return this.smsService.send(currentUser, dto);
  }

  @Public()
  @Post("webhook/status")
  @ApiOperation({ summary: "Simulate SMS delivery status webhook" })
  status(@Body() payload: SmsWebhookStatusDto) {
    return this.smsService.handleStatus(payload);
  }

  @Public()
  @Post("webhook/incoming")
  @ApiOperation({ summary: "Simulate incoming SMS reply webhook" })
  incoming(@Body() payload: SmsWebhookIncomingDto) {
    return this.smsService.handleIncoming(payload);
  }
}
