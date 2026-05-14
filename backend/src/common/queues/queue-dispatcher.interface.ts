import type { QueueJob } from "./queue-job.interface";

export const QUEUE_DISPATCHER = Symbol("QUEUE_DISPATCHER");

export interface QueueDispatcher {
  dispatch<TPayload = Record<string, unknown>>(job: QueueJob<TPayload>): Promise<{ accepted: boolean; jobId: string }>;
}
