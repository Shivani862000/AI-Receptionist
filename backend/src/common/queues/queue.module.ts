import { Global, Module } from "@nestjs/common";

import { InMemoryQueueDispatcherService } from "./in-memory-queue-dispatcher.service";
import { QUEUE_DISPATCHER } from "./queue-dispatcher.interface";

@Global()
@Module({
  providers: [
    InMemoryQueueDispatcherService,
    {
      provide: QUEUE_DISPATCHER,
      useExisting: InMemoryQueueDispatcherService
    }
  ],
  exports: [QUEUE_DISPATCHER, InMemoryQueueDispatcherService]
})
export class QueueModule {}
