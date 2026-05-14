import { Module } from "@nestjs/common";

import { AiSummaryModule } from "../ai-summary/ai-summary.module";
import { RecordingsModule } from "../recordings/recordings.module";
import { TranscriptsModule } from "../transcripts/transcripts.module";
import { VoiceCallsModule } from "../voice-calls/voice-calls.module";
import { WebhooksController } from "./webhooks.controller";
import { WebhooksService } from "./webhooks.service";

@Module({
  imports: [VoiceCallsModule, TranscriptsModule, RecordingsModule, AiSummaryModule],
  controllers: [WebhooksController],
  providers: [WebhooksService]
})
export class WebhooksModule {}
