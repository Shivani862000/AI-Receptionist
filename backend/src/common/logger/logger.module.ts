import { Global, Module } from "@nestjs/common";

import { MetricsService } from "../monitoring/metrics.service";
import { AppLoggerService } from "./app-logger.service";

@Global()
@Module({
  providers: [AppLoggerService, MetricsService],
  exports: [AppLoggerService, MetricsService]
})
export class LoggerModule {}
