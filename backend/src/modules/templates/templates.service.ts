import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { ResourceNotFoundException } from "../../common/exceptions/app.exception";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateTemplateDto } from "./dto/create-template.dto";
import { UpdateTemplateDto } from "./dto/update-template.dto";

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(currentUser: CurrentUserType, dto: CreateTemplateDto) {
    const template = await this.prisma.messageTemplate.create({
      data: {
        businessId: currentUser.businessId,
        name: dto.name,
        channel: dto.channel,
        templateType: dto.templateType,
        content: dto.content,
        variables: dto.variables as Prisma.InputJsonValue | undefined
      }
    });

    return {
      message: "Template created",
      data: template
    };
  }

  async findAll(currentUser: CurrentUserType) {
    const data = await this.prisma.messageTemplate.findMany({
      where: { businessId: currentUser.businessId },
      orderBy: { createdAt: "desc" }
    });

    return { data };
  }

  async findByBusinessId(businessId: string, id: string) {
    const template = await this.prisma.messageTemplate.findFirst({
      where: { id, businessId }
    });

    if (!template) throw new ResourceNotFoundException("Template not found");
    return template;
  }

  async update(currentUser: CurrentUserType, id: string, dto: UpdateTemplateDto) {
    await this.findOne(currentUser, id);

    const template = await this.prisma.messageTemplate.update({
      where: { id },
      data: {
        name: dto.name,
        channel: dto.channel,
        templateType: dto.templateType,
        content: dto.content,
        variables: dto.variables as Prisma.InputJsonValue | undefined
      }
    });

    return {
      message: "Template updated",
      data: template
    };
  }

  async remove(currentUser: CurrentUserType, id: string) {
    await this.findOne(currentUser, id);
    await this.prisma.messageTemplate.delete({
      where: { id }
    });

    return {
      message: "Template deleted",
      data: null
    };
  }

  renderTemplate(content: string, variables: Record<string, string | number>) {
    return content.replace(/\{\{(.*?)\}\}/g, (_, key: string) => {
      const value = variables[key.trim()];
      return value === undefined || value === null ? "" : String(value);
    });
  }

  private async findOne(currentUser: CurrentUserType, id: string) {
    return this.findByBusinessId(currentUser.businessId, id);
  }
}
