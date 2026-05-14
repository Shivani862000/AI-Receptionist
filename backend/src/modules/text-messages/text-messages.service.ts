import { Injectable } from "@nestjs/common";
import { MessageDirection, MessageStatus, Prisma } from "@prisma/client";

import { ResourceNotFoundException } from "../../common/exceptions/app.exception";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { buildPaginationMeta } from "../../common/utils/pagination";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateTextMessageDto } from "./dto/create-text-message.dto";
import { ListTextMessagesDto } from "./dto/list-text-messages.dto";
import { UpdateTextMessageDto } from "./dto/update-text-message.dto";

@Injectable()
export class TextMessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(currentUser: CurrentUserType, dto: CreateTextMessageDto) {
    const message = await this.prisma.message.create({
      data: {
        businessId: currentUser.businessId,
        clientId: dto.clientId,
        channel: dto.channel,
        direction: MessageDirection.outbound,
        status: MessageStatus.queued,
        fromAddress: currentUser.email,
        toAddress: dto.toAddress,
        subject: dto.subject,
        bodyText: dto.bodyText,
        bodyHtml: dto.bodyHtml,
        previewText: dto.bodyText?.slice(0, 140) || dto.subject || null
      }
    });

    return { message: "Text message queued", data: message };
  }

  async findAll(currentUser: CurrentUserType, query: ListTextMessagesDto) {
    const where: Prisma.MessageWhereInput = {
      businessId: currentUser.businessId,
      ...(query.channel ? { channel: query.channel } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.clientId ? { clientId: query.clientId } : {})
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.message.findMany({
        where,
        skip: (query.page! - 1) * query.limit!,
        take: query.limit,
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.message.count({ where })
    ]);

    return { data, meta: buildPaginationMeta(total, query.page, query.limit) };
  }

  async findOne(currentUser: CurrentUserType, id: string) {
    const message = await this.prisma.message.findFirst({
      where: { id, businessId: currentUser.businessId }
    });
    if (!message) throw new ResourceNotFoundException("Text message not found");
    return { data: message };
  }

  async update(currentUser: CurrentUserType, id: string, dto: UpdateTextMessageDto) {
    await this.findOne(currentUser, id);
    const message = await this.prisma.message.update({
      where: { id },
      data: {
        clientId: dto.clientId,
        channel: dto.channel,
        status: dto.status,
        toAddress: dto.toAddress,
        subject: dto.subject,
        bodyText: dto.bodyText,
        bodyHtml: dto.bodyHtml,
        previewText: dto.previewText ?? dto.bodyText?.slice(0, 140) ?? dto.subject ?? undefined
      }
    });
    return { message: "Text message updated", data: message };
  }
}
