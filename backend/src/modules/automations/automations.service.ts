import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { ResourceNotFoundException } from "../../common/exceptions/app.exception";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { buildPaginationMeta } from "../../common/utils/pagination";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateAutomationDto } from "./dto/create-automation.dto";
import { ListAutomationsDto } from "./dto/list-automations.dto";
import { ToggleAutomationDto } from "./dto/toggle-automation.dto";
import { UpdateAutomationDto } from "./dto/update-automation.dto";

@Injectable()
export class AutomationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(currentUser: CurrentUserType, dto: CreateAutomationDto) {
    if (dto.templateId) {
      await this.ensureTemplateBelongsToBusiness(currentUser.businessId, dto.templateId);
    }

    const automation = await this.prisma.automation.create({
      data: {
        businessId: currentUser.businessId,
        name: dto.name,
        description: dto.description,
        triggerType: dto.triggerType,
        channel: dto.channel,
        actionType: dto.actionType,
        templateId: dto.templateId,
        scheduleType: dto.scheduleType,
        scheduleValue: dto.scheduleValue,
        isActive: dto.isActive ?? true,
        triggerConfig: dto.triggerConfig as Prisma.InputJsonValue | undefined,
        executionRules: dto.executionRules as Prisma.InputJsonValue | undefined
      }
    });
    return { message: "Automation created", data: automation };
  }

  async findAll(currentUser: CurrentUserType, query: ListAutomationsDto) {
    const where: Prisma.AutomationWhereInput = {
      businessId: currentUser.businessId,
      ...(query.triggerType ? { triggerType: query.triggerType } : {}),
      ...(query.channel ? { channel: query.channel } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { description: { contains: query.search, mode: "insensitive" } }
            ]
          }
        : {})
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.automation.findMany({
        where,
        skip: (query.page! - 1) * query.limit!,
        take: query.limit,
        orderBy: { createdAt: "desc" },
        include: {
          template: true
        }
      }),
      this.prisma.automation.count({ where })
    ]);

    return {
      data: {
        items,
        meta: buildPaginationMeta(total, query.page, query.limit)
      }
    };
  }

  async findOne(currentUser: CurrentUserType, id: string) {
    const automation = await this.prisma.automation.findFirst({
      where: { id, businessId: currentUser.businessId },
      include: {
        template: true
      }
    });
    if (!automation) throw new ResourceNotFoundException("Automation not found");
    return { data: automation };
  }

  async update(currentUser: CurrentUserType, id: string, dto: UpdateAutomationDto) {
    await this.findOne(currentUser, id);
    if (dto.templateId) {
      await this.ensureTemplateBelongsToBusiness(currentUser.businessId, dto.templateId);
    }

    const data: Prisma.AutomationUpdateInput = {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.triggerType !== undefined ? { triggerType: dto.triggerType } : {}),
      ...(dto.channel !== undefined ? { channel: dto.channel } : {}),
      ...(dto.actionType !== undefined ? { actionType: dto.actionType } : {}),
      ...(dto.templateId !== undefined ? { templateId: dto.templateId } : {}),
      ...(dto.scheduleType !== undefined ? { scheduleType: dto.scheduleType } : {}),
      ...(dto.scheduleValue !== undefined ? { scheduleValue: dto.scheduleValue } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      ...(dto.triggerConfig !== undefined
        ? { triggerConfig: dto.triggerConfig as Prisma.InputJsonValue }
        : {}),
      ...(dto.executionRules !== undefined
        ? { executionRules: dto.executionRules as Prisma.InputJsonValue }
        : {})
    };

    const automation = await this.prisma.automation.update({
      where: { id },
      data,
      include: {
        template: true
      }
    });
    return { message: "Automation updated", data: automation };
  }

  async remove(currentUser: CurrentUserType, id: string) {
    await this.findOne(currentUser, id);
    await this.prisma.automation.delete({
      where: { id }
    });

    return {
      message: "Automation deleted",
      data: null
    };
  }

  async toggle(currentUser: CurrentUserType, id: string, dto: ToggleAutomationDto) {
    const existing = (await this.findOne(currentUser, id)).data;
    const automation = await this.prisma.automation.update({
      where: { id },
      data: {
        isActive: dto.isActive ?? !existing.isActive
      }
    });

    return {
      message: "Automation toggled",
      data: automation
    };
  }

  async logs(currentUser: CurrentUserType, id: string) {
    await this.findOne(currentUser, id);
    const data = await this.prisma.automationExecution.findMany({
      where: { automationId: id, businessId: currentUser.businessId },
      orderBy: { createdAt: "desc" }
    });
    return { data };
  }

  private async ensureTemplateBelongsToBusiness(businessId: string, templateId: string) {
    const template = await this.prisma.messageTemplate.findFirst({
      where: { id: templateId, businessId }
    });

    if (!template) throw new ResourceNotFoundException("Template not found");
    return template;
  }
}
