import { Injectable } from "@nestjs/common";
import { MessageChannel, MessageDirection, MessageStatus, Prisma } from "@prisma/client";

import { ResourceNotFoundException } from "../../common/exceptions/app.exception";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { buildPaginationMeta } from "../../common/utils/pagination";
import { PrismaService } from "../../prisma/prisma.service";
import { ApiMessageDirection, ApiMessageStatus, ListMessagesDto } from "./dto/list-messages.dto";

type OutgoingMessageInput = {
  businessId: string;
  clientId?: string | null;
  channel: MessageChannel;
  fromAddress: string;
  toAddress: string;
  subject?: string | null;
  content: string;
  bodyHtml?: string | null;
  providerMessageId?: string | null;
  metadata?: Prisma.InputJsonValue;
  webhookPayload?: Prisma.InputJsonValue;
  status?: MessageStatus;
  sentAt?: Date;
};

type IncomingMessageInput = {
  businessId: string;
  clientId?: string | null;
  channel: MessageChannel;
  fromAddress: string;
  toAddress: string;
  subject?: string | null;
  content: string;
  providerMessageId?: string | null;
  metadata?: Prisma.InputJsonValue;
  webhookPayload?: Prisma.InputJsonValue;
};

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(currentUser: CurrentUserType, query: ListMessagesDto) {
    const where: Prisma.MessageWhereInput = {
      businessId: currentUser.businessId,
      ...(query.channel ? { channel: query.channel } : {}),
      ...(query.status ? { status: this.mapApiStatusToDb(query.status) } : {}),
      ...(query.direction ? { direction: this.mapApiDirectionToDb(query.direction) } : {}),
      ...(query.clientId ? { clientId: query.clientId } : {}),
      ...(query.search
        ? {
            OR: [
              { subject: { contains: query.search, mode: "insensitive" } },
              { bodyText: { contains: query.search, mode: "insensitive" } },
              { fromAddress: { contains: query.search, mode: "insensitive" } },
              { toAddress: { contains: query.search, mode: "insensitive" } },
              {
                client: {
                  fullName: { contains: query.search, mode: "insensitive" }
                }
              }
            ]
          }
        : {})
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.message.findMany({
        where,
        skip: (query.page! - 1) * query.limit!,
        take: query.limit,
        orderBy: { createdAt: "desc" },
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              whatsapp: true,
              email: true
            }
          }
        }
      }),
      this.prisma.message.count({ where })
    ]);

    return {
      data: {
        items: items.map((item) => this.serializeMessage(item)),
        meta: buildPaginationMeta(total, query.page, query.limit)
      }
    };
  }

  async findOne(currentUser: CurrentUserType, id: string) {
    const message = await this.prisma.message.findFirst({
      where: { id, businessId: currentUser.businessId },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            whatsapp: true,
            email: true
          }
        }
      }
    });

    if (!message) throw new ResourceNotFoundException("Message not found");
    return { data: this.serializeMessage(message) };
  }

  async findByClient(currentUser: CurrentUserType, clientId: string, query: ListMessagesDto) {
    await this.ensureClientBelongsToBusiness(currentUser.businessId, clientId);
    return this.findAll(currentUser, {
      ...query,
      clientId
    });
  }

  async createOutgoing(input: OutgoingMessageInput) {
    const message = await this.prisma.message.create({
      data: {
        businessId: input.businessId,
        clientId: input.clientId ?? undefined,
        providerMessageId: input.providerMessageId ?? undefined,
        channel: input.channel,
        direction: MessageDirection.outbound,
        status: input.status ?? MessageStatus.sent,
        fromAddress: input.fromAddress,
        toAddress: input.toAddress,
        subject: input.subject ?? undefined,
        bodyText: input.content,
        bodyHtml: input.bodyHtml ?? undefined,
        previewText: input.content.slice(0, 140),
        metadata: input.metadata,
        webhookPayload: input.webhookPayload,
        sentAt: input.sentAt ?? new Date()
      }
    });

    await this.createActivity(input.businessId, message.clientId, message.id, "message_sent", "Message sent");
    return message;
  }

  async createIncoming(input: IncomingMessageInput) {
    const message = await this.prisma.message.create({
      data: {
        businessId: input.businessId,
        clientId: input.clientId ?? undefined,
        providerMessageId: input.providerMessageId ?? undefined,
        channel: input.channel,
        direction: MessageDirection.inbound,
        status: MessageStatus.delivered,
        fromAddress: input.fromAddress,
        toAddress: input.toAddress,
        subject: input.subject ?? undefined,
        bodyText: input.content,
        previewText: input.content.slice(0, 140),
        metadata: input.metadata,
        webhookPayload: input.webhookPayload,
        receivedAt: new Date(),
        deliveredAt: new Date()
      }
    });

    await this.createActivity(input.businessId, message.clientId, message.id, "message_received", "Incoming message received");
    return message;
  }

  async updateStatusByProviderMessageId(providerMessageId: string, status: ApiMessageStatus, payload?: Prisma.InputJsonValue) {
    const message = await this.prisma.message.findFirst({
      where: { providerMessageId }
    });

    if (!message) throw new ResourceNotFoundException("Message not found for provider reference");

    const updated = await this.prisma.message.update({
      where: { id: message.id },
      data: {
        status: this.mapApiStatusToDb(status),
        deliveredAt: status === ApiMessageStatus.delivered || status === ApiMessageStatus.read ? new Date() : message.deliveredAt,
        readAt: status === ApiMessageStatus.read ? new Date() : message.readAt,
        webhookPayload: payload ?? undefined
      }
    });

    return updated;
  }

  async listByChannel(currentUser: CurrentUserType, channel: MessageChannel, query: ListMessagesDto) {
    return this.findAll(currentUser, { ...query, channel });
  }

  async resolveClientForBusiness(businessId: string, input: { clientId?: string; phone?: string; email?: string }) {
    if (input.clientId) {
      return this.prisma.client.findFirst({
        where: { id: input.clientId, businessId, deletedAt: null }
      });
    }

    if (input.phone) {
      return this.prisma.client.findFirst({
        where: {
          businessId,
          deletedAt: null,
          OR: [{ phone: input.phone }, { whatsapp: input.phone }]
        }
      });
    }

    if (input.email) {
      return this.prisma.client.findFirst({
        where: {
          businessId,
          deletedAt: null,
          email: input.email
        }
      });
    }

    return null;
  }

  async resolveBusinessForIncomingAddress(input: { businessId?: string; toAddress?: string; fromAddress?: string }) {
    if (input.businessId) {
      const business = await this.prisma.business.findUnique({
        where: { id: input.businessId }
      });

      if (!business) throw new ResourceNotFoundException("Business not found for incoming message");
      return business;
    }

    const business = await this.prisma.business.findFirst({
      where: {
        OR: [
          ...(input.toAddress ? [{ phone: input.toAddress }, { email: input.toAddress }] : []),
          ...(input.fromAddress ? [{ phone: input.fromAddress }, { email: input.fromAddress }] : [])
        ]
      }
    });

    if (business) return business;

    const fallbackBusiness = await this.prisma.business.findFirst({
      orderBy: { createdAt: "asc" }
    });

    if (!fallbackBusiness) throw new ResourceNotFoundException("No business found for incoming message");
    return fallbackBusiness;
  }

  async getBusinessContact(businessId: string, channel: MessageChannel) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) throw new ResourceNotFoundException("Business not found");

    if (channel === MessageChannel.email) {
      return business.email ?? "noreply@local.test";
    }

    return business.phone ?? "+910000000000";
  }

  serializeMessage(message: Prisma.MessageGetPayload<{ include: { client: { select: { id: true; fullName: true; phone: true; whatsapp: true; email: true } } } }>) {
    return {
      id: message.id,
      businessId: message.businessId,
      clientId: message.clientId,
      channel: message.channel,
      direction: this.mapDbDirectionToApi(message.direction),
      status: this.mapDbStatusToApi(message.status),
      subject: message.subject,
      content: message.bodyText ?? message.bodyHtml ?? null,
      providerMessageId: message.providerMessageId,
      metadata: message.metadata,
      sentAt: message.sentAt,
      deliveredAt: message.deliveredAt,
      readAt: message.readAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      fromAddress: message.fromAddress,
      toAddress: message.toAddress,
      client: message.client ?? null
    };
  }

  private async ensureClientBelongsToBusiness(businessId: string, clientId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id: clientId, businessId, deletedAt: null }
    });

    if (!client) throw new ResourceNotFoundException("Client not found");
    return client;
  }

  private mapApiDirectionToDb(direction: ApiMessageDirection) {
    return direction === ApiMessageDirection.incoming ? MessageDirection.inbound : MessageDirection.outbound;
  }

  private mapDbDirectionToApi(direction: MessageDirection) {
    return direction === MessageDirection.inbound ? ApiMessageDirection.incoming : ApiMessageDirection.outgoing;
  }

  private mapApiStatusToDb(status: ApiMessageStatus) {
    switch (status) {
      case ApiMessageStatus.queued:
        return MessageStatus.queued;
      case ApiMessageStatus.sent:
        return MessageStatus.sent;
      case ApiMessageStatus.delivered:
        return MessageStatus.delivered;
      case ApiMessageStatus.read:
        return MessageStatus.read;
      case ApiMessageStatus.failed:
        return MessageStatus.failed;
      default:
        return MessageStatus.queued;
    }
  }

  private mapDbStatusToApi(status: MessageStatus) {
    if (status === MessageStatus.received) {
      return ApiMessageStatus.delivered;
    }

    return status as unknown as ApiMessageStatus;
  }

  private async createActivity(
    businessId: string,
    clientId: string | null,
    messageId: string,
    activityType: "message_sent" | "message_received",
    title: string
  ) {
    await this.prisma.activityLog.create({
      data: {
        businessId,
        clientId: clientId ?? undefined,
        messageId,
        entityType: "message",
        entityId: messageId,
        activityType,
        title
      }
    });
  }
}
