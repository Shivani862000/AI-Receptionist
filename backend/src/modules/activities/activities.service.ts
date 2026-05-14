import { Injectable } from "@nestjs/common";

import { PaginationQueryDto } from "../../common/dto/pagination.dto";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { buildPaginationMeta } from "../../common/utils/pagination";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(currentUser: CurrentUserType, query: PaginationQueryDto) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.activityLog.findMany({
        where: { businessId: currentUser.businessId },
        skip: (query.page! - 1) * query.limit!,
        take: query.limit,
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.activityLog.count({
        where: { businessId: currentUser.businessId }
      })
    ]);

    return { data, meta: buildPaginationMeta(total, query.page, query.limit) };
  }
}
