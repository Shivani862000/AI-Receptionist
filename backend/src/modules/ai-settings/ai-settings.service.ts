import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import type { CurrentUserType } from "../../common/types/current-user.type";
import { PrismaService } from "../../prisma/prisma.service";
import { UpdateAiSettingsDto } from "./dto/update-ai-settings.dto";

@Injectable()
export class AiSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(currentUser: CurrentUserType) {
    const settings = await this.prisma.businessAISettings.upsert({
      where: { businessId: currentUser.businessId },
      create: { businessId: currentUser.businessId },
      update: {},
    });

    return { data: settings };
  }

  async update(currentUser: CurrentUserType, dto: UpdateAiSettingsDto) {
    const settings = await this.prisma.businessAISettings.upsert({
      where: { businessId: currentUser.businessId },
      create: {
        businessId: currentUser.businessId,
        tone: dto.tone,
        language: dto.language,
        greetingMessage: dto.greetingMessage,
        voiceSelection: dto.voiceSelection,
        businessInstructions: dto.businessInstructions,
        fallbackRules: dto.fallbackRules as Prisma.InputJsonValue | undefined,
      },
      update: {
        tone: dto.tone,
        language: dto.language,
        greetingMessage: dto.greetingMessage,
        voiceSelection: dto.voiceSelection,
        businessInstructions: dto.businessInstructions,
        fallbackRules: dto.fallbackRules as Prisma.InputJsonValue | undefined,
      },
    });

    await this.prisma.auditLogEntry.create({
      data: {
        businessId: currentUser.businessId,
        actorUserId: currentUser.userId,
        action: "ai_settings.updated",
        entityType: "BusinessAISettings",
        entityId: settings.id,
        summary: "AI settings updated",
        payload: dto as unknown as Prisma.InputJsonValue,
      },
    });

    return {
      message: "AI settings updated",
      data: settings,
    };
  }
}
