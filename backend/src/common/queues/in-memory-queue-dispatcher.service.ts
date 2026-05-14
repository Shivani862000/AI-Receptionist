import { Injectable } from "@nestjs/common";

import { AppLoggerService } from "../logger/app-logger.service";
import type { QueueDispatcher } from "./queue-dispatcher.interface";
import type { QueueJob } from "./queue-job.interface";

@Injectable()
export class InMemoryQueueDispatcherService implements QueueDispatcher {
  constructor(private readonly logger: AppLoggerService) {}

  async dispatch<TPayload = Record<string, unknown>>(job: QueueJob<TPayload>) {
    const jobId = `${job.queue}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    this.logger.log(`Queued in-memory job ${job.name}`, "Queue", {
      jobId,
      queue: job.queue,
      runAt: job.runAt?.toISOString() || null
    });

    return {
      accepted: true,
      jobId
    };
  }
}
