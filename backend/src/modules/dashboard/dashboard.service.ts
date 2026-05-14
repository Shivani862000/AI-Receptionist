import { Injectable } from "@nestjs/common";
import { MessageChannel } from "@prisma/client";

import type { CurrentUserType } from "../../common/types/current-user.type";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async stats(currentUser: CurrentUserType) {
    const [
      totalClients,
      totalCalls,
      incomingCalls,
      outgoingCalls,
      completedCalls,
      missedCalls,
      positiveSentimentCalls,
      negativeSentimentCalls,
      totalMessages,
      whatsappCount,
      smsCount,
      emailCount,
      deliveredMessages,
      readMessages,
      totalAutomations,
      successfulAutomations,
      failedAutomations,
      pendingReminders,
      todayScheduledTasks,
      callsToday,
      messagesToday
    ] = await this.prisma.$transaction([
      this.prisma.client.count({ where: { businessId: currentUser.businessId, deletedAt: null } }),
      this.prisma.voiceCall.count({ where: { businessId: currentUser.businessId } }),
      this.prisma.voiceCall.count({ where: { businessId: currentUser.businessId, direction: "incoming" } }),
      this.prisma.voiceCall.count({ where: { businessId: currentUser.businessId, direction: "outgoing" } }),
      this.prisma.voiceCall.count({ where: { businessId: currentUser.businessId, status: "completed" } }),
      this.prisma.voiceCall.count({ where: { businessId: currentUser.businessId, status: "missed" } }),
      this.prisma.voiceCall.count({ where: { businessId: currentUser.businessId, sentiment: "positive" } }),
      this.prisma.voiceCall.count({ where: { businessId: currentUser.businessId, sentiment: "negative" } }),
      this.prisma.message.count({ where: { businessId: currentUser.businessId } }),
      this.prisma.message.count({ where: { businessId: currentUser.businessId, channel: "whatsapp" } }),
      this.prisma.message.count({ where: { businessId: currentUser.businessId, channel: "sms" } }),
      this.prisma.message.count({ where: { businessId: currentUser.businessId, channel: "email" } }),
      this.prisma.message.count({
        where: { businessId: currentUser.businessId, status: { in: ["delivered", "read"] } }
      }),
      this.prisma.message.count({
        where: { businessId: currentUser.businessId, status: "read" }
      }),
      this.prisma.automation.count({ where: { businessId: currentUser.businessId } }),
      this.prisma.automationExecution.count({
        where: { businessId: currentUser.businessId, status: "success" }
      }),
      this.prisma.automationExecution.count({
        where: { businessId: currentUser.businessId, status: "failed" }
      }),
      this.prisma.automationExecution.count({
        where: { businessId: currentUser.businessId, status: { in: ["pending", "retrying"] } }
      }),
      this.prisma.automationExecution.count({
        where: {
          businessId: currentUser.businessId,
          scheduledFor: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }),
      this.prisma.voiceCall.count({
        where: {
          businessId: currentUser.businessId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      this.prisma.message.count({
        where: {
          businessId: currentUser.businessId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);

    const deliveryRate = totalMessages ? Number(((deliveredMessages / totalMessages) * 100).toFixed(2)) : 0;
    const readRate = totalMessages ? Number(((readMessages / totalMessages) * 100).toFixed(2)) : 0;
    const positiveSentimentRate = totalCalls
      ? Number(((positiveSentimentCalls / totalCalls) * 100).toFixed(2))
      : 0;

    return {
      data: {
        totalClients,
        totalCalls,
        incomingCalls,
        outgoingCalls,
        completedCalls,
        missedCalls,
        callsToday,
        messagesToday,
        positiveSentimentCalls,
        negativeSentimentCalls,
        positiveSentimentRate,
        totalMessages,
        whatsappCount,
        smsCount,
        emailCount,
        deliveryRate,
        readRate,
        totalAutomations,
        successfulAutomations,
        failedAutomations,
        pendingReminders,
        todayScheduledTasks
      }
    };
  }

  async recentActivity(currentUser: CurrentUserType) {
    const [activities, calls, automations] = await this.prisma.$transaction([
      this.prisma.activityLog.findMany({
        where: { businessId: currentUser.businessId },
        orderBy: { createdAt: "desc" },
        take: 6
      }),
      this.prisma.voiceCall.findMany({
        where: { businessId: currentUser.businessId },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { aiSummary: true }
      }),
      this.prisma.automationExecution.findMany({
        where: { businessId: currentUser.businessId },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { automation: true }
      })
    ]);

    return {
      data: {
        activities,
        recentCalls: calls,
        recentAutomations: automations
      }
    };
  }

  async aiInsights(currentUser: CurrentUserType) {
    const [negativeCalls, whatsappMessages] = await this.prisma.$transaction([
      this.prisma.voiceCall.count({
        where: { businessId: currentUser.businessId, sentiment: "negative" }
      }),
      this.prisma.message.count({
        where: { businessId: currentUser.businessId, channel: MessageChannel.whatsapp }
      })
    ]);

    return {
      data: {
        summary: "WhatsApp remains the strongest engagement channel in the current workspace.",
        negativeCalls,
        whatsappMessages,
        suggestions: [
          "Review negative sentiment calls for follow-up",
          "Promote WhatsApp reminders for high-response clients"
        ]
      }
    };
  }

  async quickInsights(currentUser: CurrentUserType) {
    const [todayCalls, todayMessages, pendingReminders, completedAutomations, failedAutomations, positiveCalls, totalCallsToday] =
      await this.prisma.$transaction([
        this.prisma.voiceCall.count({
          where: {
            businessId: currentUser.businessId,
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }),
        this.prisma.message.count({
          where: {
            businessId: currentUser.businessId,
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }),
        this.prisma.automationExecution.count({
          where: { businessId: currentUser.businessId, status: { in: ["pending", "retrying"] } }
        }),
        this.prisma.automationExecution.count({
          where: { businessId: currentUser.businessId, status: "success" }
        }),
        this.prisma.automationExecution.count({
          where: { businessId: currentUser.businessId, status: "failed" }
        }),
        this.prisma.voiceCall.count({
          where: { businessId: currentUser.businessId, sentiment: "positive" }
        }),
        this.prisma.voiceCall.count({
          where: { businessId: currentUser.businessId }
        })
      ]);

    return {
      data: {
        callsToday: todayCalls,
        messagesToday: todayMessages,
        pendingReminders,
        completedAutomations,
        failedAutomations,
        positiveSentimentRate: totalCallsToday
          ? Number(((positiveCalls / totalCallsToday) * 100).toFixed(2))
          : 0
      }
    };
  }
}
