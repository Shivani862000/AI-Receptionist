import { Module } from "@nestjs/common";

import { PrismaModule } from "../../prisma/prisma.module";
import { TenantModule } from "../tenant/tenant.module";
import { UsageController } from "./usage.controller";
import { UsageService } from "./usage.service";

@Module({
  imports: [PrismaModule, TenantModule],
  controllers: [UsageController],
  providers: [UsageService],
  exports: [UsageService],
})
export class UsageModule {}
