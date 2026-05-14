import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { TenantGuard } from "../tenant/tenant.guard";
import { AiSettingsService } from "./ai-settings.service";
import { UpdateAiSettingsDto } from "./dto/update-ai-settings.dto";

@ApiTags("AI Settings")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller("ai-settings")
export class AiSettingsController {
  constructor(private readonly aiSettingsService: AiSettingsService) {}

  @Get()
  @ApiOperation({ summary: "Get AI settings for the active business" })
  get(@CurrentUser() currentUser: CurrentUserType) {
    return this.aiSettingsService.get(currentUser);
  }

  @Patch()
  @Permissions("manage_ai_settings")
  @ApiOperation({ summary: "Update AI settings for the active business" })
  update(@CurrentUser() currentUser: CurrentUserType, @Body() dto: UpdateAiSettingsDto) {
    return this.aiSettingsService.update(currentUser, dto);
  }
}
