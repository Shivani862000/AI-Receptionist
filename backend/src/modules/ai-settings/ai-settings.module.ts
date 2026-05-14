import { Module } from "@nestjs/common";

import { PrismaModule } from "../../prisma/prisma.module";
import { TenantModule } from "../tenant/tenant.module";
import { AiSettingsController } from "./ai-settings.controller";
import { AiSettingsService } from "./ai-settings.service";

@Module({
  imports: [PrismaModule, TenantModule],
  controllers: [AiSettingsController],
  providers: [AiSettingsService],
})
export class AiSettingsModule {}
