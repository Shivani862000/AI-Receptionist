import { Injectable } from "@nestjs/common";

import { ResourceNotFoundException } from "../../common/exceptions/app.exception";
import type { CurrentUserType } from "../../common/types/current-user.type";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getClientTimeline(currentUser: CurrentUserType, clientId: string) {
    const client = await this.prisma.client.findFirst({
      where: {
        id: clientId,
        businessId: currentUser.businessId,
        deletedAt: null
      }
    });

    if (!client) throw new ResourceNotFoundException("Client not found");

    const [calls, messages] = await this.prisma.$transaction([
      this.prisma.voiceCall.findMany({
        where: {
          businessId: currentUser.businessId,
          clientId
        },
        orderBy: { createdAt: "asc" }
      }),
      this.prisma.message.findMany({
        where: {
          businessId: currentUser.businessId,
          clientId
        },
        orderBy: { createdAt: "asc" }
      })
    ]);

    const timeline = [
      ...calls.map((call) => ({
        id: call.id,
        type: "call",
        channel: "voice",
        direction: call.direction,
        status: call.status,
        title: call.customerName ?? client.fullName,
        content: call.callType.replace(/_/g, " "),
        sentiment: call.sentiment,
        occurredAt: call.startedAt ?? call.createdAt,
        durationSeconds: call.durationSeconds
      })),
      ...messages.map((message) => ({
        id: message.id,
        type: "message",
        channel: message.channel,
        direction: message.direction === "inbound" ? "incoming" : "outgoing",
        status: message.status === "received" ? "delivered" : message.status,
        title: message.subject ?? `${message.channel.toUpperCase()} message`,
        content: message.bodyText ?? message.bodyHtml ?? "",
        occurredAt: message.sentAt ?? message.receivedAt ?? message.createdAt
      }))
    ].sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());

    return {
      data: {
        client: {
          id: client.id,
          fullName: client.fullName,
          phone: client.phone,
          email: client.email,
          whatsapp: client.whatsapp
        },
        items: timeline
      }
    };
  }
}
