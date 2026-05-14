import { Injectable } from "@nestjs/common";
import { NotificationChannelType, NotificationStatus, NotificationType } from "@prisma/client";

import { ResourceNotFoundException } from "../../common/exceptions/app.exception";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { PrismaService } from "../../prisma/prisma.service";
import { UsageService } from "../usage/usage.service";
import { UpgradeSubscriptionDto } from "./dto/upgrade-subscription.dto";

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usageService: UsageService,
  ) {}

  async upgrade(currentUser: CurrentUserType, dto: UpgradeSubscriptionDto) {
    const plan = await this.prisma.saaSPlan.findUnique({
      where: { name: dto.planName },
    });

    if (!plan) {
      throw new ResourceNotFoundException("Plan not found");
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setUTCMonth(periodEnd.getUTCMonth() + 1);

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.businessSubscription.updateMany({
        where: {
          businessId: currentUser.businessId,
          isCurrent: true,
        },
        data: {
          isCurrent: false,
          canceledAt: now,
          status: "canceled",
        },
      });

      const subscription = await tx.businessSubscription.create({
        data: {
          businessId: currentUser.businessId,
          planId: plan.id,
          planName: plan.name,
          status: "active",
          monthlyPrice: plan.monthlyPrice,
          includedMinutes: plan.includedMinutes,
          includedMessages: plan.includedMessages,
          includedAIRequests: plan.includedAIRequests,
          includedStorageMb: plan.includedStorageMb,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          metadata: dto.note ? { note: dto.note } : undefined,
        },
        include: {
          plan: true,
        },
      });

      const invoice = await tx.invoice.create({
        data: {
          businessId: currentUser.businessId,
          subscriptionId: subscription.id,
          invoiceNumber: `INV-${Date.now()}`,
          status: "issued",
          subtotal: plan.monthlyPrice,
          overageAmount: 0,
          totalAmount: plan.monthlyPrice,
          issuedAt: now,
          dueDate: periodEnd,
          metadata: {
            source: "subscription_upgrade",
            planName: plan.name,
          },
        },
      });

      await tx.dashboardNotification.create({
        data: {
          businessId: currentUser.businessId,
          type: NotificationType.plan_upgraded,
          channel: NotificationChannelType.dashboard,
          status: NotificationStatus.unread,
          title: "Subscription updated",
          message: `Your workspace is now on the ${plan.displayName} plan.`,
          metadata: {
            invoiceId: invoice.id,
            planName: plan.name,
          },
        },
      });

      await tx.auditLogEntry.create({
        data: {
          businessId: currentUser.businessId,
          actorUserId: currentUser.userId,
          action: "subscription.upgraded",
          entityType: "BusinessSubscription",
          entityId: subscription.id,
          summary: `Subscription upgraded to ${plan.displayName}`,
          payload: {
            previousRole: currentUser.role,
            planName: plan.name,
            note: dto.note ?? null,
          },
        },
      });

      return subscription;
    });

    return {
      message: "Subscription upgraded",
      data: {
        subscription: result,
        usageSnapshot: await this.usageService.getBusinessUsageSummary(currentUser.businessId),
      },
    };
  }

  async current(currentUser: CurrentUserType) {
    const subscription = await this.usageService.getCurrentSubscription(currentUser.businessId);
    return { data: subscription };
  }
}
