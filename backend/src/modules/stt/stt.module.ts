import { Module } from "@nestjs/common";

import { UsageModule } from "../usage/usage.module";
import { VoiceCallsModule } from "../voice-calls/voice-calls.module";
import { SttController } from "./stt.controller";
import { SttService } from "./stt.service";

@Module({
  imports: [VoiceCallsModule, UsageModule],
  controllers: [SttController],
  providers: [SttService],
  exports: [SttService]
})
export class SttModule {}
