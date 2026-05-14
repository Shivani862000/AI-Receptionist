import { Module } from "@nestjs/common";

import { AiReplyModule } from "../ai-reply/ai-reply.module";
import { MessagesModule } from "../messages/messages.module";
import { WhatsappController } from "./whatsapp.controller";
import { WhatsappService } from "./whatsapp.service";

@Module({
  imports: [MessagesModule, AiReplyModule],
  controllers: [WhatsappController],
  providers: [WhatsappService],
  exports: [WhatsappService]
})
export class WhatsappModule {}
