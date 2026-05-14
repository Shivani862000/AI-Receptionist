import { Injectable } from "@nestjs/common";

type RequestMetric = {
  durationMs: number;
  statusCode: number;
};

@Injectable()
export class MetricsService {
  private readonly startedAt = Date.now();
  private totalRequests = 0;
  private totalErrors = 0;
  private totalDurationMs = 0;
  private readonly recentRequests: RequestMetric[] = [];

  recordRequest(metric: RequestMetric) {
    this.totalRequests += 1;
    this.totalDurationMs += metric.durationMs;

    if (metric.statusCode >= 400) {
      this.totalErrors += 1;
    }

    this.recentRequests.push(metric);
    if (this.recentRequests.length > 200) {
      this.recentRequests.shift();
    }
  }

  getSnapshot() {
    const requestCount = this.recentRequests.length;
    const recentAverageMs = requestCount
      ? Math.round(this.recentRequests.reduce((sum, item) => sum + item.durationMs, 0) / requestCount)
      : 0;

    return {
      uptimeSeconds: Math.round((Date.now() - this.startedAt) / 1000),
      totalRequests: this.totalRequests,
      totalErrors: this.totalErrors,
      averageResponseTimeMs: this.totalRequests ? Math.round(this.totalDurationMs / this.totalRequests) : 0,
      recentAverageResponseTimeMs: recentAverageMs
    };
  }
}
