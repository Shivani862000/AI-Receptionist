import { Module } from "@nestjs/common";

import { PrismaModule } from "../../prisma/prisma.module";
import { TenantModule } from "../tenant/tenant.module";
import { UsageModule } from "../usage/usage.module";
import { BillingController } from "./billing.controller";
import { BillingService } from "./billing.service";

@Module({
  imports: [PrismaModule, UsageModule, TenantModule],
  controllers: [BillingController],
  providers: [BillingService],
})
export class BillingModule {}
