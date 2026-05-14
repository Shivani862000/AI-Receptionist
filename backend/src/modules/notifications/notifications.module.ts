import { Module } from "@nestjs/common";

import { PrismaModule } from "../../prisma/prisma.module";
import { TenantModule } from "../tenant/tenant.module";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";

@Module({
  imports: [PrismaModule, TenantModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
