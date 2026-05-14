import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { ResourceNotFoundException } from "../../common/exceptions/app.exception";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { buildPaginationMeta } from "../../common/utils/pagination";
import { PrismaService } from "../../prisma/prisma.service";
import { ListAutomationLogsDto } from "./dto/list-automation-logs.dto";

@Injectable()
export class AutomationLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(currentUser: CurrentUserType, query: ListAutomationLogsDto) {
    const where: Prisma.AutomationExecutionWhereInput = {
      businessId: currentUser.businessId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.automationId ? { automationId: query.automationId } : {}),
      ...(query.clientId ? { clientId: query.clientId } : {})
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.automationExecution.findMany({
        where,
        skip: (query.page! - 1) * query.limit!,
        take: query.limit,
        orderBy: { createdAt: "desc" },
        include: {
          automation: true,
          client: {
            select: { id: true, fullName: true, phone: true, email: true }
          },
          message: true,
          voiceCall: true
        }
      }),
      this.prisma.automationExecution.count({ where })
    ]);

    return {
      data: {
        items,
        meta: buildPaginationMeta(total, query.page, query.limit)
      }
    };
  }

  async findOne(currentUser: CurrentUserType, id: string) {
    const log = await this.prisma.automationExecution.findFirst({
      where: { id, businessId: currentUser.businessId },
      include: {
        automation: true,
        client: {
          select: { id: true, fullName: true, phone: true, email: true }
        },
        message: true,
        voiceCall: true
      }
    });

    if (!log) throw new ResourceNotFoundException("Automation log not found");
    return { data: log };
  }
}
