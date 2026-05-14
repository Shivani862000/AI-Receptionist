import { Module } from "@nestjs/common";

import { AiReplyModule } from "../ai-reply/ai-reply.module";
import { MessagesModule } from "../messages/messages.module";
import { EmailController } from "./email.controller";
import { EmailService } from "./email.service";

@Module({
  imports: [MessagesModule, AiReplyModule],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService]
})
export class EmailModule {}
