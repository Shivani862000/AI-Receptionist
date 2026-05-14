import { Module } from "@nestjs/common";

import { AiModule } from "../ai/ai.module";
import { AiReplyController } from "./ai-reply.controller";
import { AiReplyService } from "./ai-reply.service";

@Module({
  imports: [AiModule],
  controllers: [AiReplyController],
  providers: [AiReplyService],
  exports: [AiReplyService]
})
export class AiReplyModule {}
