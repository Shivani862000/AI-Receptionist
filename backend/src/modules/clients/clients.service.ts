import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { ResourceNotFoundException } from "../../common/exceptions/app.exception";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { buildPaginationMeta } from "../../common/utils/pagination";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { ListClientsDto } from "./dto/list-clients.dto";
import { UpdateClientDto } from "./dto/update-client.dto";

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(currentUser: CurrentUserType, dto: CreateClientDto) {
    const client = await this.prisma.client.create({
      data: {
        businessId: currentUser.businessId,
        fullName: dto.fullName,
        gender: dto.gender,
        phone: dto.phone,
        whatsapp: dto.whatsapp,
        email: dto.email,
        preferredContactMode: dto.preferredContactMode,
        preferredContactTime: dto.preferredContactTime,
        notes: dto.notes,
        birthday: dto.birthday ? new Date(dto.birthday) : undefined,
        anniversary: dto.anniversary ? new Date(dto.anniversary) : undefined,
        clientServices: dto.serviceIds?.length
          ? {
              create: dto.serviceIds.map((serviceId) => ({ serviceId }))
            }
          : undefined
      },
      include: {
        clientServices: {
          include: { service: true }
        }
      }
    });

    return {
      message: "Client created",
      data: client
    };
  }

  async findAll(currentUser: CurrentUserType, query: ListClientsDto) {
    const where: Prisma.ClientWhereInput = {
      businessId: currentUser.businessId,
      deletedAt: null,
      ...(query.search
        ? {
            OR: [
              { fullName: { contains: query.search, mode: "insensitive" } },
              { phone: { contains: query.search } },
              { email: { contains: query.search, mode: "insensitive" } }
            ]
          }
        : {}),
      ...(query.preferredContactMode ? { preferredContactMode: query.preferredContactMode } : {}),
      ...(query.serviceId
        ? {
            clientServices: {
              some: {
                serviceId: query.serviceId
              }
            }
          }
        : {})
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.client.findMany({
        where,
        skip: (query.page! - 1) * query.limit!,
        take: query.limit,
        orderBy: { createdAt: "desc" },
        include: {
          clientServices: {
            include: { service: true }
          }
        }
      }),
      this.prisma.client.count({ where })
    ]);

    return {
      data: {
        items,
        meta: buildPaginationMeta(total, query.page, query.limit)
      }
    };
  }

  async findOne(currentUser: CurrentUserType, id: string) {
    const client = await this.prisma.client.findFirst({
      where: {
        id,
        businessId: currentUser.businessId,
        deletedAt: null
      },
      include: {
        clientServices: {
          include: { service: true }
        }
      }
    });

    if (!client) throw new ResourceNotFoundException("Client not found");
    return { data: client };
  }

  async update(currentUser: CurrentUserType, id: string, dto: UpdateClientDto) {
    await this.findOne(currentUser, id);

    const client = await this.prisma.client.update({
      where: { id },
      data: {
        fullName: dto.fullName,
        gender: dto.gender,
        phone: dto.phone,
        whatsapp: dto.whatsapp,
        email: dto.email,
        preferredContactMode: dto.preferredContactMode,
        preferredContactTime: dto.preferredContactTime,
        notes: dto.notes,
        birthday: dto.birthday ? new Date(dto.birthday) : undefined,
        anniversary: dto.anniversary ? new Date(dto.anniversary) : undefined,
        ...(dto.serviceIds
          ? {
              clientServices: {
                deleteMany: {},
                create: dto.serviceIds.map((serviceId) => ({ serviceId }))
              }
            }
          : {})
      },
      include: {
        clientServices: {
          include: { service: true }
        }
      }
    });

    return {
      message: "Client updated",
      data: client
    };
  }

  async remove(currentUser: CurrentUserType, id: string) {
    await this.findOne(currentUser, id);
    await this.prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    return {
      message: "Client deleted",
      data: null
    };
  }
}
