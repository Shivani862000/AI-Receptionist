export type QueueName = "ai" | "communication" | "automation" | "reporting";

export interface QueueJob<TPayload = Record<string, unknown>> {
  name: string;
  queue: QueueName;
  payload: TPayload;
  runAt?: Date;
  attempts?: number;
}
