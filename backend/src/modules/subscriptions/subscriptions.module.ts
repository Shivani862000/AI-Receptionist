import { Module } from "@nestjs/common";

import { PrismaModule } from "../../prisma/prisma.module";
import { TenantModule } from "../tenant/tenant.module";
import { UsageModule } from "../usage/usage.module";
import { SubscriptionsController } from "./subscriptions.controller";
import { SubscriptionsService } from "./subscriptions.service";

@Module({
  imports: [PrismaModule, UsageModule, TenantModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
