import { Module } from "@nestjs/common";

import { AiModule } from "../ai/ai.module";
import { VoiceCallsModule } from "../voice-calls/voice-calls.module";
import { AiSummaryController } from "./ai-summary.controller";
import { AiSummaryService } from "./ai-summary.service";

@Module({
  imports: [VoiceCallsModule, AiModule],
  controllers: [AiSummaryController],
  providers: [AiSummaryService],
  exports: [AiSummaryService]
})
export class AiSummaryModule {}
