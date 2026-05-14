import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PaginationQueryDto } from "../../common/dto/pagination.dto";
import { ResourceNotFoundException } from "../../common/exceptions/app.exception";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { buildPaginationMeta } from "../../common/utils/pagination";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateBusinessDto } from "./dto/create-business.dto";
import { UpdateBusinessDto } from "./dto/update-business.dto";

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  async create(currentUser: CurrentUserType, dto: CreateBusinessDto) {
    const business = await this.prisma.business.create({
      data: {
        businessName: dto.businessName,
        ownerName: dto.ownerName,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        logoUrl: dto.logoUrl,
        slug: `${dto.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
        timezone: "Asia/Kolkata",
        memberships: {
          create: {
            userId: currentUser.userId,
            role: "business_admin",
            isPrimary: false
          }
        }
      }
    });

    return {
      message: "Business created",
      data: business
    };
  }

  async findAll(currentUser: CurrentUserType, query: PaginationQueryDto) {
    const where: Prisma.BusinessWhereInput = {
      memberships: {
        some: {
          userId: currentUser.userId
        }
      }
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.business.findMany({
        where,
        skip: (query.page! - 1) * query.limit!,
        take: query.limit,
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.business.count({ where })
    ]);

    return {
      data: {
        items,
        meta: buildPaginationMeta(total, query.page, query.limit)
      }
    };
  }

  async findOne(currentUser: CurrentUserType, id: string) {
    const business = await this.prisma.business.findFirst({
      where: {
        id,
        memberships: {
          some: {
            userId: currentUser.userId
          }
        }
      }
    });

    if (!business) {
      throw new ResourceNotFoundException("Business not found");
    }

    return { data: business };
  }

  async update(currentUser: CurrentUserType, id: string, dto: UpdateBusinessDto) {
    await this.findOne(currentUser, id);
    const business = await this.prisma.business.update({
      where: { id },
      data: dto
    });

    return {
      message: "Business updated",
      data: business
    };
  }

  async remove(currentUser: CurrentUserType, id: string) {
    await this.findOne(currentUser, id);
    await this.prisma.business.delete({ where: { id } });
    return {
      message: "Business deleted",
      data: null
    };
  }
}
