import { Body, Controller, Header, HttpCode, Post, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { CreateTwilioCallDto } from "./dto/create-twilio-call.dto";
import { TwilioVoiceWebhookDto } from "./dto/twilio-voice-webhook.dto";
import { TwilioService } from "./twilio.service";

@ApiTags("Twilio")
@Controller("twilio")
export class TwilioController {
  constructor(private readonly twilioService: TwilioService) {}

  @Post("outgoing-call")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a Twilio outgoing call" })
  outgoingCall(@CurrentUser() currentUser: CurrentUserType, @Body() dto: CreateTwilioCallDto) {
    return this.twilioService.createOutgoingCall(currentUser, dto);
  }

  @Public()
  @Post("webhook/voice")
  @Header("Content-Type", "text/xml")
  @ApiOperation({ summary: "Handle Twilio voice webhook and return TwiML" })
  async voice(@Body() payload: TwilioVoiceWebhookDto, @Res() response: Response) {
    const result = await this.twilioService.handleVoiceWebhook(payload);
    return response.status(200).send(result.xml);
  }

  @Public()
  @Post("webhook/status")
  @ApiOperation({ summary: "Handle Twilio call status webhook" })
  status(@Body() payload: TwilioVoiceWebhookDto) {
    return this.twilioService.handleStatusWebhook(payload);
  }

  @Public()
  @Post("webhook/media-stream")
  @HttpCode(200)
  @Header("Content-Type", "text/xml")
  @ApiOperation({ summary: "Return TwiML that connects a call to the realtime media stream websocket" })
  mediaStream(@Res() response: Response) {
    return response.send(this.twilioService.buildMediaStreamTwiml());
  }
}
