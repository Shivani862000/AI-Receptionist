import { Injectable } from "@nestjs/common";

import { buildPaginationMeta } from "../../common/utils/pagination";
import { PrismaService } from "../../prisma/prisma.service";
import { ListAdminBusinessesDto } from "./dto/list-admin-businesses.dto";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async stats() {
    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);

    const [
      totalBusinesses,
      activeSubscriptions,
      activeRealtimeSessions,
      failedAutomations,
      totalAiRequests,
      currentPayments,
      topBusinesses,
    ] = await this.prisma.$transaction([
      this.prisma.business.count(),
      this.prisma.businessSubscription.count({
        where: { isCurrent: true, status: { in: ["active", "trialing"] } },
      }),
      this.prisma.voiceCall.count({
        where: { status: { in: ["initiated", "ringing", "in_progress"] } },
      }),
      this.prisma.automationExecution.count({
        where: { status: "failed" },
      }),
      this.prisma.usageRecord.aggregate({
        where: {
          metricType: "ai_requests",
          monthKey: `${startOfMonth.getUTCFullYear()}-${String(startOfMonth.getUTCMonth() + 1).padStart(2, "0")}`,
        },
        _sum: { quantity: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          createdAt: { gte: startOfMonth },
          status: "succeeded",
        },
        _sum: { amount: true },
      }),
      this.prisma.business.findMany({
        take: 5,
        orderBy: {
          messages: {
            _count: "desc",
          },
        },
        include: {
          _count: {
            select: {
              messages: true,
              voiceCalls: true,
              clients: true,
            },
          },
          subscriptions: {
            where: { isCurrent: true },
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
      }),
    ]);

    const aiUsageCost = Number(((totalAiRequests._sum.quantity ?? 0) * 0.002).toFixed(2));

    return {
      data: {
        totalBusinesses,
        activeSubscriptions,
        activeRealtimeSessions,
        failedAutomations,
        aiUsageCost,
        monthlyCollectedPayments: currentPayments._sum.amount ?? 0,
        topBusinessesByUsage: topBusinesses.map((business) => ({
          id: business.id,
          businessName: business.businessName,
          planName: business.subscriptions[0]?.planName ?? null,
          messageCount: business._count.messages,
          callCount: business._count.voiceCalls,
          clientCount: business._count.clients,
        })),
      },
    };
  }

  async businesses(query: ListAdminBusinessesDto) {
    const where = {
      ...(query.search
        ? {
            OR: [
              { businessName: { contains: query.search, mode: "insensitive" as const } },
              { slug: { contains: query.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(query.planName
        ? {
            subscriptions: {
              some: {
                isCurrent: true,
                planName: query.planName,
              },
            },
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.business.findMany({
        where,
        skip: (query.page! - 1) * query.limit!,
        take: query.limit,
        orderBy: { createdAt: "desc" },
        include: {
          subscriptions: {
            where: { isCurrent: true },
            take: 1,
            orderBy: { createdAt: "desc" },
          },
          onboardingProgress: true,
          _count: {
            select: {
              clients: true,
              voiceCalls: true,
              messages: true,
            },
          },
        },
      }),
      this.prisma.business.count({ where }),
    ]);

    return {
      data: {
        items,
        meta: buildPaginationMeta(total, query.page, query.limit),
      },
    };
  }
}
