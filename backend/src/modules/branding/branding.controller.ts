import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { TenantGuard } from "../tenant/tenant.guard";
import { BrandingService } from "./branding.service";
import { UpdateBrandingDto } from "./dto/update-branding.dto";

@ApiTags("Branding")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller("branding")
export class BrandingController {
  constructor(private readonly brandingService: BrandingService) {}

  @Get()
  @ApiOperation({ summary: "Get business branding settings" })
  get(@CurrentUser() currentUser: CurrentUserType) {
    return this.brandingService.get(currentUser);
  }

  @Patch()
  @Permissions("manage_ai_settings")
  @ApiOperation({ summary: "Update business branding settings" })
  update(@CurrentUser() currentUser: CurrentUserType, @Body() dto: UpdateBrandingDto) {
    return this.brandingService.update(currentUser, dto);
  }
}
