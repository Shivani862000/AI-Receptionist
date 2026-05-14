import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { TenantGuard } from "../tenant/tenant.guard";
import { UpdateOnboardingDto } from "./dto/update-onboarding.dto";
import { OnboardingService } from "./onboarding.service";

@ApiTags("Onboarding")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller("onboarding")
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get()
  @ApiOperation({ summary: "Get onboarding progress" })
  getProgress(@CurrentUser() currentUser: CurrentUserType) {
    return this.onboardingService.getProgress(currentUser);
  }

  @Patch()
  @Permissions("manage_ai_settings")
  @ApiOperation({ summary: "Update onboarding progress" })
  update(@CurrentUser() currentUser: CurrentUserType, @Body() dto: UpdateOnboardingDto) {
    return this.onboardingService.update(currentUser, dto);
  }
}
