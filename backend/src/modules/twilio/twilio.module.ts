import { Module } from "@nestjs/common";

import { AiModule } from "../ai/ai.module";
import { AiSummaryModule } from "../ai-summary/ai-summary.module";
import { RecordingsModule } from "../recordings/recordings.module";
import { SttModule } from "../stt/stt.module";
import { TtsModule } from "../tts/tts.module";
import { VoiceCallsModule } from "../voice-calls/voice-calls.module";
import { TwilioController } from "./twilio.controller";
import { TwilioService } from "./twilio.service";

@Module({
  imports: [VoiceCallsModule, SttModule, AiSummaryModule, RecordingsModule, AiModule, TtsModule],
  controllers: [TwilioController],
  providers: [TwilioService],
  exports: [TwilioService]
})
export class TwilioModule {}
