import { Module } from "@nestjs/common";

import { VoiceCallsModule } from "../voice-calls/voice-calls.module";
import { RecordingsController } from "./recordings.controller";
import { RecordingsService } from "./recordings.service";

@Module({
  imports: [VoiceCallsModule],
  controllers: [RecordingsController],
  providers: [RecordingsService],
  exports: [RecordingsService]
})
export class RecordingsModule {}
