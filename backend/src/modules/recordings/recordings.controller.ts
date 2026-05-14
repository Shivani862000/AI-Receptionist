import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CreateRecordingDto } from "./dto/create-recording.dto";
import { RecordingsService } from "./recordings.service";

@ApiTags("Recordings")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("recordings")
export class RecordingsController {
  constructor(private readonly recordingsService: RecordingsService) {}

  @Post(":callId")
  @ApiOperation({ summary: "Create mock recording metadata for a call" })
  create(@Param("callId") callId: string, @Body() dto: CreateRecordingDto) {
    return this.recordingsService.create(callId, dto);
  }

  @Get(":callId")
  @ApiOperation({ summary: "Get recording metadata by call id" })
  findByCallId(@Param("callId") callId: string) {
    return this.recordingsService.findByCallId(callId);
  }
}
