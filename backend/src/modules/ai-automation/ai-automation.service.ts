import { Injectable } from "@nestjs/common";
import { AutomationChannel } from "@prisma/client";

@Injectable()
export class AiAutomationService {
  suggestions() {
    return {
      data: {
        bestChannel: AutomationChannel.whatsapp,
        bestTime: "10:00 AM",
        suggestedTemplate: "friendly_followup",
        retryAfter: "5 minutes",
        confidence: 0.87
      }
    };
  }
}
