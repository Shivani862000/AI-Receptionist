import { Injectable } from "@nestjs/common";

import type { CurrentUserType } from "../../common/types/current-user.type";
import { buildPaginationMeta } from "../../common/utils/pagination";
import { PrismaService } from "../../prisma/prisma.service";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(currentUser: CurrentUserType, query: PaginationQueryDto) {
    const where = { businessId: currentUser.businessId };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.dashboardNotification.findMany({
        where,
        skip: (query.page! - 1) * query.limit!,
        take: query.limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.dashboardNotification.count({ where }),
    ]);

    return {
      data: {
        items,
        meta: buildPaginationMeta(total, query.page, query.limit),
      },
    };
  }

  async markRead(currentUser: CurrentUserType, id: string) {
    const notification = await this.prisma.dashboardNotification.updateMany({
      where: {
        id,
        businessId: currentUser.businessId,
      },
      data: {
        status: "read",
        readAt: new Date(),
      },
    });

    return {
      message: "Notification marked as read",
      data: notification,
    };
  }
}
