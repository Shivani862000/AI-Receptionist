import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { GenerateAiReplyDto } from "./dto/generate-ai-reply.dto";
import { AiReplyService } from "./ai-reply.service";

@ApiTags("AI Reply")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("ai-reply")
export class AiReplyController {
  constructor(private readonly aiReplyService: AiReplyService) {}

  @Post("generate")
  @ApiOperation({ summary: "Generate a mock AI auto-reply" })
  generate(@Body() dto: GenerateAiReplyDto) {
    return this.aiReplyService.generate(dto);
  }
}
