import { Module } from "@nestjs/common";

import { PrismaModule } from "../../prisma/prisma.module";
import { TenantModule } from "../tenant/tenant.module";
import { OnboardingController } from "./onboarding.controller";
import { OnboardingService } from "./onboarding.service";

@Module({
  imports: [PrismaModule, TenantModule],
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule {}
