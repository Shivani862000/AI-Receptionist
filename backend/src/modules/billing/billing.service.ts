import { Injectable } from "@nestjs/common";

import type { CurrentUserType } from "../../common/types/current-user.type";
import { buildPaginationMeta } from "../../common/utils/pagination";
import { PrismaService } from "../../prisma/prisma.service";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";
import { UsageService } from "../usage/usage.service";

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usageService: UsageService,
  ) {}

  async overview(currentUser: CurrentUserType, query: PaginationQueryDto) {
    const where = { businessId: currentUser.businessId };

    const [subscription, usageSummary, invoices, invoiceTotal, payments, paymentTotal] = await Promise.all([
      this.usageService.getCurrentSubscription(currentUser.businessId),
      this.usageService.getBusinessUsageSummary(currentUser.businessId),
      this.prisma.invoice.findMany({
        where,
        skip: (query.page! - 1) * query.limit!,
        take: query.limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.invoice.count({ where }),
      this.prisma.payment.findMany({
        where,
        skip: (query.page! - 1) * query.limit!,
        take: query.limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: {
        subscription,
        usageSummary,
        invoices: {
          items: invoices,
          meta: buildPaginationMeta(invoiceTotal, query.page, query.limit),
        },
        payments: {
          items: payments,
          meta: buildPaginationMeta(paymentTotal, query.page, query.limit),
        },
      },
    };
  }
}
