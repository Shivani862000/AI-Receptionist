import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import type { CurrentUserType } from "../../common/types/current-user.type";
import { buildPaginationMeta } from "../../common/utils/pagination";
import { PrismaService } from "../../prisma/prisma.service";
import { ReportQueryDto } from "../reports/dto/report-query.dto";

@Injectable()
export class ReportHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(currentUser: CurrentUserType, query: ReportQueryDto) {
    const where: Prisma.ReportExportWhereInput = {
      businessId: currentUser.businessId,
      ...(query.dateFrom || query.dateTo
        ? {
            createdAt: {
              ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
              ...(query.dateTo ? { lte: new Date(query.dateTo) } : {})
            }
          }
        : {})
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.reportExport.findMany({
        where,
        skip: (query.page! - 1) * query.limit!,
        take: query.limit,
        orderBy: { createdAt: "desc" },
        include: {
          requestedByUser: {
            select: { id: true, fullName: true, email: true }
          }
        }
      }),
      this.prisma.reportExport.count({ where })
    ]);

    return {
      data: {
        items: items.map((item) => ({
          id: item.id,
          businessId: item.businessId,
          reportType: item.reportType,
          fileUrl: item.fileUrl,
          generatedBy: item.requestedByUser?.fullName ?? null,
          createdAt: item.createdAt
        })),
        meta: buildPaginationMeta(total, query.page, query.limit)
      }
    };
  }
}
