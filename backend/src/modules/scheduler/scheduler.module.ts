import { Module } from "@nestjs/common";

import { RemindersModule } from "../reminders/reminders.module";
import { SchedulerService } from "./scheduler.service";

@Module({
  imports: [RemindersModule],
  providers: [SchedulerService]
})
export class SchedulerModule {}
