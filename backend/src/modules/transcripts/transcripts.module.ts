import { Module } from "@nestjs/common";

import { SttModule } from "../stt/stt.module";
import { VoiceCallsModule } from "../voice-calls/voice-calls.module";
import { TranscriptsController } from "./transcripts.controller";
import { TranscriptsService } from "./transcripts.service";

@Module({
  imports: [VoiceCallsModule, SttModule],
  controllers: [TranscriptsController],
  providers: [TranscriptsService],
  exports: [TranscriptsService]
})
export class TranscriptsModule {}
