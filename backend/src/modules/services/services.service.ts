import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PaginationQueryDto } from "../../common/dto/pagination.dto";
import { ResourceNotFoundException } from "../../common/exceptions/app.exception";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { buildPaginationMeta } from "../../common/utils/pagination";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(currentUser: CurrentUserType, dto: CreateServiceDto) {
    const service = await this.prisma.service.create({
      data: {
        businessId: currentUser.businessId,
        serviceName: dto.serviceName,
        serviceCode: dto.serviceCode,
        description: dto.description,
        price: dto.price,
        duration: dto.duration,
        isActive: dto.isActive ?? true
      }
    });

    return { message: "Service created", data: service };
  }

  async findAll(currentUser: CurrentUserType, query: PaginationQueryDto) {
    const where: Prisma.ServiceWhereInput = {
      businessId: currentUser.businessId,
      ...(query.search
        ? {
            OR: [
              { serviceName: { contains: query.search, mode: "insensitive" } },
              { serviceCode: { contains: query.search, mode: "insensitive" } }
            ]
          }
        : {})
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.service.findMany({
        where,
        skip: (query.page! - 1) * query.limit!,
        take: query.limit,
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.service.count({ where })
    ]);

    return {
      data: {
        items,
        meta: buildPaginationMeta(total, query.page, query.limit)
      }
    };
  }

  async findOne(currentUser: CurrentUserType, id: string) {
    const service = await this.prisma.service.findFirst({
      where: { id, businessId: currentUser.businessId }
    });
    if (!service) throw new ResourceNotFoundException("Service not found");
    return { data: service };
  }

  async update(currentUser: CurrentUserType, id: string, dto: UpdateServiceDto) {
    await this.findOne(currentUser, id);
    const service = await this.prisma.service.update({
      where: { id },
      data: dto
    });
    return { message: "Service updated", data: service };
  }

  async remove(currentUser: CurrentUserType, id: string) {
    await this.findOne(currentUser, id);
    await this.prisma.service.delete({ where: { id } });
    return { message: "Service deleted", data: null };
  }
}
