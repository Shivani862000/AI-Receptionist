import { Module } from "@nestjs/common";

import { PrismaModule } from "../../prisma/prisma.module";
import { TenantModule } from "../tenant/tenant.module";
import { BrandingController } from "./branding.controller";
import { BrandingService } from "./branding.service";

@Module({
  imports: [PrismaModule, TenantModule],
  controllers: [BrandingController],
  providers: [BrandingService],
})
export class BrandingModule {}
