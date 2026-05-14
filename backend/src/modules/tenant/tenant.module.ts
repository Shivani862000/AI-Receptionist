import { Module } from "@nestjs/common";

import { PrismaModule } from "../../prisma/prisma.module";
import { TenantContextService } from "./tenant-context.service";
import { TenantGuard } from "./tenant.guard";

@Module({
  imports: [PrismaModule],
  providers: [TenantContextService, TenantGuard],
  exports: [TenantContextService, TenantGuard],
})
export class TenantModule {}
