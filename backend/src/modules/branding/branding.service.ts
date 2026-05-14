import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import type { CurrentUserType } from "../../common/types/current-user.type";
import { PrismaService } from "../../prisma/prisma.service";
import { UpdateBrandingDto } from "./dto/update-branding.dto";

@Injectable()
export class BrandingService {
  constructor(private readonly prisma: PrismaService) {}

  async get(currentUser: CurrentUserType) {
    const branding = await this.prisma.businessBranding.upsert({
      where: { businessId: currentUser.businessId },
      create: { businessId: currentUser.businessId },
      update: {},
    });

    return { data: branding };
  }

  async update(currentUser: CurrentUserType, dto: UpdateBrandingDto) {
    const branding = await this.prisma.businessBranding.upsert({
      where: { businessId: currentUser.businessId },
      create: {
        businessId: currentUser.businessId,
        logoUrl: dto.logoUrl,
        brandColor: dto.brandColor,
        businessName: dto.businessName,
        emailFooter: dto.emailFooter,
        pdfBranding: dto.pdfBranding as Prisma.InputJsonValue | undefined,
        customDomain: dto.customDomain,
      },
      update: {
        logoUrl: dto.logoUrl,
        brandColor: dto.brandColor,
        businessName: dto.businessName,
        emailFooter: dto.emailFooter,
        pdfBranding: dto.pdfBranding as Prisma.InputJsonValue | undefined,
        customDomain: dto.customDomain,
      },
    });

    return {
      message: "Branding settings updated",
      data: branding,
    };
  }
}
