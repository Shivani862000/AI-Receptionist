import { Injectable } from "@nestjs/common";
import { NotificationChannelType, NotificationStatus, NotificationType, OnboardingStep } from "@prisma/client";

import type { CurrentUserType } from "../../common/types/current-user.type";
import { PrismaService } from "../../prisma/prisma.service";
import { UpdateOnboardingDto } from "./dto/update-onboarding.dto";

const FINAL_STEP = OnboardingStep.test_ai_call;

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async getProgress(currentUser: CurrentUserType) {
    const progress = await this.prisma.businessOnboarding.upsert({
      where: { businessId: currentUser.businessId },
      create: {
        businessId: currentUser.businessId,
        currentStep: OnboardingStep.create_business,
        completedSteps: [OnboardingStep.create_business],
      },
      update: {},
    });

    return { data: progress };
  }

  async update(currentUser: CurrentUserType, dto: UpdateOnboardingDto) {
    const completedSteps = Array.from(new Set(dto.completedSteps ?? [dto.currentStep]));
    const skippedSteps = Array.from(new Set(dto.skippedSteps ?? []));
    const isCompleted = completedSteps.includes(FINAL_STEP);

    const progress = await this.prisma.businessOnboarding.upsert({
      where: { businessId: currentUser.businessId },
      create: {
        businessId: currentUser.businessId,
        currentStep: dto.currentStep,
        completedSteps,
        skippedSteps,
        isCompleted,
        twilioConnected: dto.twilioConnected ?? false,
        whatsappConfigured: dto.whatsappConfigured ?? false,
        businessInfoUploaded: dto.businessInfoUploaded ?? false,
        testCallCompleted: dto.testCallCompleted ?? false,
        lastCompletedAt: new Date(),
      },
      update: {
        currentStep: dto.currentStep,
        completedSteps,
        skippedSteps,
        isCompleted,
        twilioConnected: dto.twilioConnected,
        whatsappConfigured: dto.whatsappConfigured,
        businessInfoUploaded: dto.businessInfoUploaded,
        testCallCompleted: dto.testCallCompleted,
        lastCompletedAt: new Date(),
      },
    });

    if (!progress.isCompleted) {
      await this.prisma.dashboardNotification.create({
        data: {
          businessId: currentUser.businessId,
          type: NotificationType.onboarding_incomplete,
          channel: NotificationChannelType.dashboard,
          status: NotificationStatus.unread,
          title: "Onboarding still in progress",
          message: `Resume setup from ${dto.currentStep.replace(/_/g, " ")}.`,
        },
      });
    }

    return {
      message: "Onboarding progress updated",
      data: progress,
    };
  }
}
