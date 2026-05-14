import { Injectable } from "@nestjs/common";
import { MessageChannel, Prisma } from "@prisma/client";

import type { CurrentUserType } from "../../common/types/current-user.type";
import { PrismaService } from "../../prisma/prisma.service";
import { AiReplyService } from "../ai-reply/ai-reply.service";
import { MessagesService } from "../messages/messages.service";
import { SendSmsDto } from "./dto/send-sms.dto";
import { SmsWebhookIncomingDto } from "./dto/sms-webhook-incoming.dto";
import { SmsWebhookStatusDto } from "./dto/sms-webhook-status.dto";

@Injectable()
export class SmsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messagesService: MessagesService,
    private readonly aiReplyService: AiReplyService
  ) {}

  async send(currentUser: CurrentUserType, dto: SendSmsDto) {
    const result = await this.sendAutomationMessage(currentUser.businessId, {
      clientId: dto.clientId,
      phone: dto.phone,
      message: dto.message
    });

    return {
      message: "SMS sent",
      data: result
    };
  }

  async sendAutomationMessage(businessId: string, input: { clientId?: string; phone: string; message: string }) {
    const client = await this.messagesService.resolveClientForBusiness(businessId, {
      clientId: input.clientId,
      phone: input.phone
    });
    const fromAddress = await this.messagesService.getBusinessContact(businessId, MessageChannel.sms);
    const providerMessageId = this.generateProviderMessageId("SMS");

    const message = await this.messagesService.createOutgoing({
      businessId,
      clientId: client?.id ?? null,
      channel: MessageChannel.sms,
      fromAddress,
      toAddress: input.phone,
      content: input.message,
      providerMessageId,
      metadata: {
        provider: "mock-sms"
      } as Prisma.InputJsonValue
    });

    return {
      ...this.messagesService.serializeMessage({ ...message, client: client ?? null }),
      provider: "mock-sms"
    };
  }

  async handleStatus(payload: SmsWebhookStatusDto) {
    await this.prisma.webhookEvent.create({
      data: {
        businessId: payload.businessId,
        eventType: "sms.status",
        provider: "mock-sms",
        payload: payload as unknown as Prisma.InputJsonValue
      }
    });

    const message = await this.messagesService.updateStatusByProviderMessageId(
      payload.providerMessageId,
      payload.status,
      payload as unknown as Prisma.InputJsonValue
    );

    return {
      message: "SMS status webhook processed",
      data: this.messagesService.serializeMessage({ ...message, client: null })
    };
  }

  async handleIncoming(payload: SmsWebhookIncomingDto) {
    const business = await this.messagesService.resolveBusinessForIncomingAddress({
      businessId: payload.businessId,
      toAddress: payload.to,
      fromAddress: payload.from
    });
    const client = await this.messagesService.resolveClientForBusiness(business.id, {
      phone: payload.from
    });

    await this.prisma.webhookEvent.create({
      data: {
        businessId: business.id,
        eventType: "sms.incoming",
        provider: "mock-sms",
        payload: payload as unknown as Prisma.InputJsonValue
      }
    });

    const incomingMessage = await this.messagesService.createIncoming({
      businessId: business.id,
      clientId: client?.id ?? null,
      channel: MessageChannel.sms,
      fromAddress: payload.from,
      toAddress: payload.to,
      content: payload.message,
      providerMessageId: payload.providerMessageId ?? this.generateProviderMessageId("SMS-IN"),
      metadata: {
        provider: "mock-sms"
      } as Prisma.InputJsonValue,
      webhookPayload: payload as unknown as Prisma.InputJsonValue
    });

    let autoReply: unknown = null;
    if (payload.autoReply) {
      const aiReply = await this.aiReplyService.generateReply({
        channel: MessageChannel.sms,
        message: payload.message
      });

      autoReply = await this.messagesService.createOutgoing({
        businessId: business.id,
        clientId: client?.id ?? null,
        channel: MessageChannel.sms,
        fromAddress: payload.to,
        toAddress: payload.from,
        content: aiReply.reply,
        providerMessageId: this.generateProviderMessageId("SMS-AI"),
        metadata: {
          provider: "mock-sms",
          autoReply: true,
          intent: aiReply.intent,
          sentiment: aiReply.sentiment
        } as Prisma.InputJsonValue
      });
    }

    return {
      message: "Incoming SMS webhook processed",
      data: {
        message: this.messagesService.serializeMessage({ ...incomingMessage, client: client ?? null }),
        autoReply: autoReply
          ? this.messagesService.serializeMessage({ ...(autoReply as typeof incomingMessage), client: client ?? null })
          : null
      }
    };
  }

  private generateProviderMessageId(prefix: string) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }
}
