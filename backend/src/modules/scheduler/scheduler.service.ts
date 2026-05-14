import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

import { RemindersService } from "../reminders/reminders.service";

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly remindersService: RemindersService) {}

  @Cron(process.env.AUTOMATION_BIRTHDAY_CRON || CronExpression.EVERY_DAY_AT_9AM)
  async birthdayScan() {
    const count = await this.remindersService.scanBirthdays();
    this.logger.log(`Birthday scan queued ${count} executions`);
  }

  @Cron(process.env.AUTOMATION_FOLLOW_UP_CRON || CronExpression.EVERY_HOUR)
  async followUpScan() {
    const followUps = await this.remindersService.scanFollowUps();
    const reminders = await this.remindersService.scanAppointmentReminders();
    const feedback = await this.remindersService.scanFeedbackPending();
    const missedCalls = await this.remindersService.scanMissedCalls();

    this.logger.log(
      `Trigger scans queued followUps=${followUps}, reminders=${reminders}, feedback=${feedback}, missedCalls=${missedCalls}`
    );
  }

  @Cron(process.env.AUTOMATION_EXECUTION_CRON || CronExpression.EVERY_MINUTE)
  async executeDueTasks() {
    const processed = await this.remindersService.processDueExecutions();
    this.logger.log(`Processed ${processed} due automation executions`);
  }

  @Cron(process.env.AUTOMATION_RETRY_CRON || CronExpression.EVERY_5_MINUTES)
  async retryFailures() {
    const retryCount = await this.remindersService.retryFailedExecutions();
    this.logger.log(`Retry scan updated ${retryCount} failed executions`);
  }
}
