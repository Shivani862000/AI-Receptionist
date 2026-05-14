import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { TenantGuard } from "../tenant/tenant.guard";
import { PlansService } from "./plans.service";

@ApiTags("Plans")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller("plans")
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @ApiOperation({ summary: "List active SaaS plans" })
  findAll() {
    return this.plansService.findAll();
  }
}
