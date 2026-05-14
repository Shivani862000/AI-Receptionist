import { Injectable, LoggerService } from "@nestjs/common";

import { appWinstonLogger } from "./winston";

@Injectable()
export class AppLoggerService implements LoggerService {
  log(message: string, context?: string, meta?: Record<string, unknown>) {
    appWinstonLogger.info(message, { context, ...meta });
  }

  error(message: string, trace?: string, context?: string, meta?: Record<string, unknown>) {
    appWinstonLogger.error(message, { context, stack: trace, ...meta });
  }

  warn(message: string, context?: string, meta?: Record<string, unknown>) {
    appWinstonLogger.warn(message, { context, ...meta });
  }

  debug(message: string, context?: string, meta?: Record<string, unknown>) {
    appWinstonLogger.debug(message, { context, ...meta });
  }

  verbose(message: string, context?: string, meta?: Record<string, unknown>) {
    appWinstonLogger.verbose(message, { context, ...meta });
  }
}
