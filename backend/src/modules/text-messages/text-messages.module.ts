import { Module } from "@nestjs/common";

import { TextMessagesController } from "./text-messages.controller";
import { TextMessagesService } from "./text-messages.service";

@Module({
  controllers: [TextMessagesController],
  providers: [TextMessagesService]
})
export class TextMessagesModule {}
