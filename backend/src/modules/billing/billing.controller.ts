import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { TenantGuard } from "../tenant/tenant.guard";
import { BillingService } from "./billing.service";

@ApiTags("Billing")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller("billing")
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get("overview")
  @Permissions("manage_billing")
  @ApiOperation({ summary: "Get billing overview, invoices, and payments" })
  overview(@CurrentUser() currentUser: CurrentUserType, @Query() query: PaginationQueryDto) {
    return this.billingService.overview(currentUser, query);
  }
}
