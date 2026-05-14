import { Injectable } from "@nestjs/common";
import { Prisma, UsageMetricType } from "@prisma/client";

import type { CurrentUserType } from "../../common/types/current-user.type";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class UsageService {
  constructor(private readonly prisma: PrismaService) {}

  getMonthKey(date = new Date()) {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
  }

  async increment(businessId: string, metricType: UsageMetricType, quantity: number, unit: string, metadata?: Record<string, unknown>) {
    const monthKey = this.getMonthKey();

    return this.prisma.usageRecord.upsert({
      where: {
        businessId_metricType_monthKey: {
          businessId,
          metricType,
          monthKey,
        },
      },
      create: {
        businessId,
        metricType,
        monthKey,
        quantity,
        unit,
        metadata: metadata as Prisma.InputJsonValue | undefined,
      },
      update: {
        quantity: {
          increment: quantity,
        },
        metadata: metadata as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async getCurrentSubscription(businessId: string) {
    return this.prisma.businessSubscription.findFirst({
      where: {
        businessId,
        isCurrent: true,
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getBusinessUsageSummary(businessId: string) {
    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);

    const monthKey = this.getMonthKey();

    const subscription = await this.getCurrentSubscription(businessId);

    const [
      callAggregate,
      whatsappCount,
      smsCount,
      emailCount,
      aiUsage,
      sttUsage,
      ttsUsage,
      storageUsage,
    ] = await this.prisma.$transaction([
      this.prisma.voiceCall.aggregate({
        where: {
          businessId,
          createdAt: { gte: startOfMonth },
        },
        _sum: { durationSeconds: true },
        _count: { _all: true },
      }),
      this.prisma.message.count({
        where: { businessId, channel: "whatsapp", createdAt: { gte: startOfMonth } },
      }),
      this.prisma.message.count({
        where: { businessId, channel: "sms", createdAt: { gte: startOfMonth } },
      }),
      this.prisma.message.count({
        where: { businessId, channel: "email", createdAt: { gte: startOfMonth } },
      }),
      this.prisma.usageRecord.findUnique({
        where: {
          businessId_metricType_monthKey: {
            businessId,
            metricType: UsageMetricType.ai_requests,
            monthKey,
          },
        },
      }),
      this.prisma.usageRecord.findUnique({
        where: {
          businessId_metricType_monthKey: {
            businessId,
            metricType: UsageMetricType.stt_minutes,
            monthKey,
          },
        },
      }),
      this.prisma.usageRecord.findUnique({
        where: {
          businessId_metricType_monthKey: {
            businessId,
            metricType: UsageMetricType.tts_characters,
            monthKey,
          },
        },
      }),
      this.prisma.usageRecord.findUnique({
        where: {
          businessId_metricType_monthKey: {
            businessId,
            metricType: UsageMetricType.storage_mb,
            monthKey,
          },
        },
      }),
    ]);

    const callMinutes = Number((((callAggregate._sum.durationSeconds ?? 0) as number) / 60).toFixed(2));
    const totalMessages = whatsappCount + smsCount + emailCount;
    const aiRequests = aiUsage?.quantity ?? 0;
    const sttMinutes = sttUsage?.quantity ?? 0;
    const ttsCharacters = ttsUsage?.quantity ?? 0;
    const storageMb = storageUsage?.quantity ?? 0;

    const includedMinutes = subscription?.includedMinutes ?? 0;
    const includedMessages = subscription?.includedMessages ?? 0;
    const includedAIRequests = subscription?.includedAIRequests ?? 0;
    const includedStorageMb = subscription?.includedStorageMb ?? 0;

    const warnings = [
      callMinutes > includedMinutes && includedMinutes > 0
        ? `Call minutes exceeded plan by ${Number((callMinutes - includedMinutes).toFixed(2))}`
        : null,
      totalMessages > includedMessages && includedMessages > 0
        ? `Messages exceeded plan by ${totalMessages - includedMessages}`
        : null,
      aiRequests > includedAIRequests && includedAIRequests > 0
        ? `AI requests exceeded plan by ${aiRequests - includedAIRequests}`
        : null,
      storageMb > includedStorageMb && includedStorageMb > 0
        ? `Storage exceeded plan by ${Number((storageMb - includedStorageMb).toFixed(2))} MB`
        : null,
    ].filter(Boolean);

    return {
      subscription,
      usage: {
        monthKey,
        totalCalls: callAggregate._count._all,
        callMinutes,
        whatsappCount,
        smsCount,
        emailCount,
        totalMessages,
        aiRequests,
        sttMinutes,
        ttsCharacters,
        storageMb,
      },
      limits: {
        includedMinutes,
        includedMessages,
        includedAIRequests,
        includedStorageMb,
      },
      warnings,
      overages: {
        minutes: Math.max(0, callMinutes - includedMinutes),
        messages: Math.max(0, totalMessages - includedMessages),
        aiRequests: Math.max(0, aiRequests - includedAIRequests),
        storageMb: Math.max(0, storageMb - includedStorageMb),
      },
    };
  }

  async getCurrentUsage(currentUser: CurrentUserType) {
    return {
      data: await this.getBusinessUsageSummary(currentUser.businessId),
    };
  }
}
