import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { TtsModule } from "../tts/tts.module";
import { RealtimeController } from "./realtime.controller";
import { RealtimeGateway } from "./realtime.gateway";
import { RealtimeService } from "./realtime.service";
import { ConversationMemoryService } from "./services/conversation-memory.service";
import { LiveSessionManagerService } from "./services/live-session-manager.service";
import { RealtimeAiService } from "./services/realtime-ai.service";
import { RealtimeSttService } from "./services/realtime-stt.service";
import { RealtimeTtsService } from "./services/realtime-tts.service";
import { TwilioMediaStreamBridgeService } from "./services/twilio-media-stream-bridge.service";

@Module({
  imports: [AuthModule, TtsModule],
  controllers: [RealtimeController],
  providers: [
    RealtimeGateway,
    RealtimeService,
    LiveSessionManagerService,
    ConversationMemoryService,
    RealtimeSttService,
    RealtimeAiService,
    RealtimeTtsService,
    TwilioMediaStreamBridgeService
  ],
  exports: [RealtimeService, LiveSessionManagerService]
})
export class RealtimeModule {}
