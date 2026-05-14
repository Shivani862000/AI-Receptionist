import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { MetricsService } from "../../common/monitoring/metrics.service";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class HealthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly metricsService: MetricsService,
    private readonly configService: ConfigService
  ) {}

  async getHealth() {
    let databaseStatus: "up" | "down" = "up";

    try {
      await this.prismaService.$queryRawUnsafe("SELECT 1");
    } catch {
      databaseStatus = "down";
    }

    return {
      status: databaseStatus === "up" ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      environment: this.configService.get<string>("app.nodeEnv") || "development",
      database: databaseStatus,
      metrics: this.metricsService.getSnapshot(),
      memory: process.memoryUsage()
    };
  }
}
