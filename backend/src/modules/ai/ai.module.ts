import { Module } from "@nestjs/common";

import { UsageModule } from "../usage/usage.module";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { GeminiProvider } from "./providers/gemini.provider";
import { AiProviderService } from "./services/ai-provider.service";

@Module({
  imports: [UsageModule],
  controllers: [AiController],
  providers: [GeminiProvider, AiProviderService, AiService],
  exports: [AiProviderService, AiService]
})
export class AiModule {}
