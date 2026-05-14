import { Module } from "@nestjs/common";

import { AiReplyModule } from "../ai-reply/ai-reply.module";
import { MessagesModule } from "../messages/messages.module";
import { SmsController } from "./sms.controller";
import { SmsService } from "./sms.service";

@Module({
  imports: [MessagesModule, AiReplyModule],
  controllers: [SmsController],
  providers: [SmsService],
  exports: [SmsService]
})
export class SmsModule {}
