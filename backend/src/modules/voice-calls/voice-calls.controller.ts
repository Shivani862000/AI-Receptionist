import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { CreateVoiceCallDto } from "./dto/create-voice-call.dto";
import { ListVoiceCallsDto } from "./dto/list-voice-calls.dto";
import { UpdateVoiceCallDto } from "./dto/update-voice-call.dto";
import { UpdateVoiceCallStatusDto } from "./dto/update-voice-call-status.dto";
import { VoiceCallsService } from "./voice-calls.service";

@ApiTags("Voice Calls")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("voice-calls")
export class VoiceCallsController {
  constructor(private readonly voiceCallsService: VoiceCallsService) {}

  @Post("outgoing")
  @ApiOperation({ summary: "Create a mock outgoing voice call" })
  createOutgoing(@CurrentUser() currentUser: CurrentUserType, @Body() dto: CreateVoiceCallDto) {
    return this.voiceCallsService.createOutgoing(currentUser, dto);
  }

  @Get()
  @ApiOperation({ summary: "List voice calls with pagination and filters" })
  findAll(@CurrentUser() currentUser: CurrentUserType, @Query() query: ListVoiceCallsDto) {
    return this.voiceCallsService.findAll(currentUser, query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get voice call details" })
  findOne(@CurrentUser() currentUser: CurrentUserType, @Param("id") id: string) {
    return this.voiceCallsService.findOne(currentUser, id);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Update voice call status" })
  updateStatus(@CurrentUser() currentUser: CurrentUserType, @Param("id") id: string, @Body() dto: UpdateVoiceCallStatusDto) {
    return this.voiceCallsService.updateStatus(currentUser, id, dto.status);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update voice call fields" })
  update(@CurrentUser() currentUser: CurrentUserType, @Param("id") id: string, @Body() dto: UpdateVoiceCallDto) {
    return this.voiceCallsService.update(currentUser, id, dto);
  }

  @Get(":id/transcript")
  @ApiOperation({ summary: "Get transcript for a voice call" })
  transcript(@CurrentUser() currentUser: CurrentUserType, @Param("id") id: string) {
    return this.voiceCallsService.getTranscript(currentUser, id);
  }

  @Get(":id/summary")
  @ApiOperation({ summary: "Get AI summary for a voice call" })
  summary(@CurrentUser() currentUser: CurrentUserType, @Param("id") id: string) {
    return this.voiceCallsService.getSummary(currentUser, id);
  }
}
