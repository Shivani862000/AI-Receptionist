import { Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";

import { MetricsService } from "../monitoring/metrics.service";
import { AppLoggerService } from "./app-logger.service";

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly metricsService: MetricsService
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startedAt = Date.now();

    res.on("finish", () => {
      const durationMs = Date.now() - startedAt;

      this.metricsService.recordRequest({
        durationMs,
        statusCode: res.statusCode
      });

      this.logger.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`, "HTTP", {
        ip: req.ip,
        userAgent: req.get("user-agent")
      });
    });

    next();
  }
}
