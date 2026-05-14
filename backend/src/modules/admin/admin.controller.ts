import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { TenantGuard } from "../tenant/tenant.guard";
import { AdminService } from "./admin.service";
import { ListAdminBusinessesDto } from "./dto/list-admin-businesses.dto";

@ApiTags("Admin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles("super_admin")
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("stats")
  @ApiOperation({ summary: "Get SaaS admin stats" })
  stats() {
    return this.adminService.stats();
  }

  @Get("businesses")
  @ApiOperation({ summary: "List businesses for SaaS admin" })
  businesses(@Query() query: ListAdminBusinessesDto) {
    return this.adminService.businesses(query);
  }
}
