import { Injectable } from "@nestjs/common";

import { PaginationQueryDto } from "../../common/dto/pagination.dto";
import { buildPaginationMeta } from "../../common/utils/pagination";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip: (query.page! - 1) * query.limit!,
        take: query.limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      this.prisma.user.count()
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, query.page, query.limit)
    };
  }
}
