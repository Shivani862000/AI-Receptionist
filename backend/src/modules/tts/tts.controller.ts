import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { GenerateTtsDto } from "./dto/generate-tts.dto";
import { TtsService } from "./tts.service";

@ApiTags("TTS")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("tts")
export class TtsController {
  constructor(private readonly ttsService: TtsService) {}

  @Post("generate")
  @ApiOperation({ summary: "Generate voice audio with Deepgram TTS" })
  generate(@CurrentUser() currentUser: CurrentUserType, @Body() dto: GenerateTtsDto) {
    return this.ttsService.generate(currentUser, dto);
  }
}
