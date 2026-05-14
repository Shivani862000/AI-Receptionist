import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { TenantGuard } from "../tenant/tenant.guard";
import { UsageService } from "./usage.service";

@ApiTags("Usage")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller("usage")
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Get("current")
  @ApiOperation({ summary: "Get current month usage for the active business" })
  current(@CurrentUser() currentUser: CurrentUserType) {
    return this.usageService.getCurrentUsage(currentUser);
  }
}
