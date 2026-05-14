import { Injectable } from "@nestjs/common";
import { MessageChannel, Prisma } from "@prisma/client";

import type { CurrentUserType } from "../../common/types/current-user.type";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AiInsightsService {
  constructor(private readonly prisma: PrismaService) {}

  async business(currentUser: CurrentUserType) {
    const [pendingReminders, failedAutomations, negativeCalls] = await this.prisma.$transaction([
      this.prisma.automationExecution.count({
        where: { businessId: currentUser.businessId, status: { in: ["pending", "retrying"] } }
      }),
      this.prisma.automationExecution.count({
        where: { businessId: currentUser.businessId, status: "failed" }
      }),
      this.prisma.voiceCall.count({
        where: { businessId: currentUser.businessId, sentiment: "negative" }
      })
    ]);

    return {
      data: {
        bestChannel: "whatsapp",
        peakHour: "11 AM",
        followUpRisk: pendingReminders > 5 ? "high" : pendingReminders > 2 ? "medium" : "low",
        recommendation:
          failedAutomations > 0 || negativeCalls > 0
            ? "Review failed automations and negative call summaries before noon."
            : "Reminder performance is stable. Keep sending follow-ups before noon."
      }
    };
  }

  async communication(currentUser: CurrentUserType) {
    const grouped = await this.prisma.message.groupBy({
      by: ["channel"],
      where: { businessId: currentUser.businessId },
      _count: { _all: true }
    });

    const best = grouped.sort((a, b) => b._count._all - a._count._all)[0];

    return {
      data: {
        bestChannel: best?.channel ?? MessageChannel.whatsapp,
        peakHour: "11 AM",
        recommendation: "WhatsApp replies are performing best. Use it first for reminders and missed follow-ups."
      }
    };
  }

  async followups(currentUser: CurrentUserType) {
    const [pendingReminders, readMessages] = await this.prisma.$transaction([
      this.prisma.automationExecution.count({
        where: { businessId: currentUser.businessId, status: { in: ["pending", "retrying"] } }
      }),
      this.prisma.message.count({
        where: { businessId: currentUser.businessId, status: "read" }
      })
    ]);

    return {
      data: {
        missedFollowUpRisk: pendingReminders > 5 ? "high" : pendingReminders > 2 ? "medium" : "low",
        suggestedReminderTiming: readMessages > 0 ? "Send reminders before noon" : "Try reminders around 4 PM",
        recommendation: "Queue a follow-up within 4 hours for missed replies."
      }
    };
  }
}
