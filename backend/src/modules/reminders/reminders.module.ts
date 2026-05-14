import { Module } from "@nestjs/common";

import { AutomationsModule } from "../automations/automations.module";
import { EmailModule } from "../email/email.module";
import { SmsModule } from "../sms/sms.module";
import { TemplatesModule } from "../templates/templates.module";
import { VoiceCallsModule } from "../voice-calls/voice-calls.module";
import { WhatsappModule } from "../whatsapp/whatsapp.module";
import { RemindersController } from "./reminders.controller";
import { RemindersService } from "./reminders.service";

@Module({
  imports: [AutomationsModule, TemplatesModule, WhatsappModule, SmsModule, EmailModule, VoiceCallsModule],
  controllers: [RemindersController],
  providers: [RemindersService],
  exports: [RemindersService]
})
export class RemindersModule {}
