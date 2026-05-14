import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { GenerateTranscriptDto } from "./dto/generate-transcript.dto";
import { TranscriptsService } from "./transcripts.service";

@ApiTags("Transcripts")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("transcripts")
export class TranscriptsController {
  constructor(private readonly transcriptsService: TranscriptsService) {}

  @Post("generate/:callId")
  @ApiOperation({ summary: "Generate a mock transcript for a call" })
  generate(@Param("callId") callId: string, @Body() dto: GenerateTranscriptDto) {
    return this.transcriptsService.generate(callId, dto);
  }

  @Get(":callId")
  @ApiOperation({ summary: "Get transcript by call id" })
  findByCallId(@Param("callId") callId: string) {
    return this.transcriptsService.findByCallId(callId);
  }
}
