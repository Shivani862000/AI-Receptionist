import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { TenantGuard } from "../tenant/tenant.guard";
import { UpgradeSubscriptionDto } from "./dto/upgrade-subscription.dto";
import { SubscriptionsService } from "./subscriptions.service";

@ApiTags("Subscriptions")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller("subscriptions")
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get("current")
  @ApiOperation({ summary: "Get current subscription" })
  current(@CurrentUser() currentUser: CurrentUserType) {
    return this.subscriptionsService.current(currentUser);
  }

  @Post("upgrade")
  @Permissions("manage_subscriptions")
  @ApiOperation({ summary: "Upgrade subscription plan" })
  upgrade(@CurrentUser() currentUser: CurrentUserType, @Body() dto: UpgradeSubscriptionDto) {
    return this.subscriptionsService.upgrade(currentUser, dto);
  }
}
