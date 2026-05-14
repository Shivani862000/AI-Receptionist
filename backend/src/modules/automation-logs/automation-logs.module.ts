import { Module } from "@nestjs/common";

import { AutomationLogsController } from "./automation-logs.controller";
import { AutomationLogsService } from "./automation-logs.service";

@Module({
  controllers: [AutomationLogsController],
  providers: [AutomationLogsService],
  exports: [AutomationLogsService]
})
export class AutomationLogsModule {}
