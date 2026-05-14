import { Module } from "@nestjs/common";

import { AiAutomationController } from "./ai-automation.controller";
import { AiAutomationService } from "./ai-automation.service";

@Module({
  controllers: [AiAutomationController],
  providers: [AiAutomationService]
})
export class AiAutomationModule {}
