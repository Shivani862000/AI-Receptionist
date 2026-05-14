import { Module } from "@nestjs/common";

import { UsageModule } from "../usage/usage.module";
import { TtsController } from "./tts.controller";
import { TtsService } from "./tts.service";

@Module({
  imports: [UsageModule],
  controllers: [TtsController],
  providers: [TtsService],
  exports: [TtsService]
})
export class TtsModule {}
