import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MessageChannel, Prisma } from "@prisma/client";
import twilio = require("twilio");

import type { CurrentUserType } from "../../common/types/current-user.type";
import { PrismaService } from "../../prisma/prisma.service";
import { AiReplyService } from "../ai-reply/ai-reply.service";
import { MessagesService } from "../messages/messages.service";
import { SendWhatsappDto } from "./dto/send-whatsapp.dto";
import { WhatsappWebhookIncomingDto } from "./dto/whatsapp-webhook-incoming.dto";
import { WhatsappWebhookStatusDto } from "./dto/whatsapp-webhook-status.dto";

@Injectable()
export class WhatsappService {
  private readonly client?: ReturnType<typeof twilio>;
  private readonly whatsappNumber?: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly messagesService: MessagesService,
    private readonly aiReplyService: AiReplyService
  ) {
    const accountSid = this.configService.get<string>("twilio.accountSid");
    const authToken = this.configService.get<string>("twilio.authToken");
    this.whatsappNumber = this.configService.get<string>("twilio.whatsappNumber") || undefined;

    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
    }
  }

  async send(currentUser: CurrentUserType, dto: SendWhatsappDto) {
    const result = await this.sendAutomationMessage(currentUser.businessId, {
      clientId: dto.clientId,
      phone: dto.phone,
      message: dto.message
    });

    return {
      message: "WhatsApp message sent",
      data: result
    };
  }

  async sendAutomationMessage(businessId: string, input: { clientId?: string; phone: string; message: string }) {
    const client = await this.messagesService.resolveClientForBusiness(businessId, {
      clientId: input.clientId,
      phone: input.phone
    });
    const fromAddress = await this.messagesService.getBusinessContact(businessId, MessageChannel.whatsapp);
    const providerMessageId = this.generateProviderMessageId("WA");
    const transport = await this.sendWithTwilioIfConfigured({
      to: input.phone,
      from: fromAddress,
      message: input.message
    });

    const message = await this.messagesService.createOutgoing({
      businessId,
      clientId: client?.id ?? null,
      channel: MessageChannel.whatsapp,
      fromAddress: transport.fromAddress,
      toAddress: input.phone,
      content: input.message,
      providerMessageId: transport.providerMessageId ?? providerMessageId,
      metadata: {
        provider: transport.provider,
        deliveryState: "sent"
      } as Prisma.InputJsonValue
    });

    return {
      ...this.messagesService.serializeMessage({ ...message, client: client ?? null }),
      provider: transport.provider
    };
  }

  async handleIncoming(payload: WhatsappWebhookIncomingDto) {
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
        eventType: "whatsapp.incoming",
        provider: this.client ? "twilio-whatsapp" : "mock-whatsapp",
        payload: payload as unknown as Prisma.InputJsonValue
      }
    });

    const incomingMessage = await this.messagesService.createIncoming({
      businessId: business.id,
      clientId: client?.id ?? null,
      channel: MessageChannel.whatsapp,
      fromAddress: payload.from,
      toAddress: payload.to,
      content: payload.message,
      providerMessageId: payload.providerMessageId ?? this.generateProviderMessageId("WA-IN"),
      metadata: {
        provider: "mock-whatsapp"
      } as Prisma.InputJsonValue,
      webhookPayload: payload as unknown as Prisma.InputJsonValue
    });

    let autoReply: unknown = null;

    if (payload.autoReply) {
      const aiReply = await this.aiReplyService.generateReply({
        channel: MessageChannel.whatsapp,
        message: payload.message
      });

      autoReply = await this.messagesService.createOutgoing({
        businessId: business.id,
        clientId: client?.id ?? null,
        channel: MessageChannel.whatsapp,
        fromAddress: payload.to,
        toAddress: payload.from,
        content: aiReply.reply,
        providerMessageId: this.generateProviderMessageId("WA-AI"),
        metadata: {
          provider: "mock-whatsapp",
          autoReply: true,
          intent: aiReply.intent,
          sentiment: aiReply.sentiment
        } as Prisma.InputJsonValue
      });
    }

    return {
      message: "Incoming WhatsApp webhook processed",
      data: {
        message: this.messagesService.serializeMessage({ ...incomingMessage, client: client ?? null }),
        autoReply: autoReply
          ? this.messagesService.serializeMessage({ ...(autoReply as typeof incomingMessage), client: client ?? null })
          : null
      }
    };
  }

  async handleStatus(payload: WhatsappWebhookStatusDto) {
    await this.prisma.webhookEvent.create({
      data: {
        businessId: payload.businessId,
        eventType: "whatsapp.status",
        provider: this.client ? "twilio-whatsapp" : "mock-whatsapp",
        payload: payload as unknown as Prisma.InputJsonValue
      }
    });

    const message = await this.messagesService.updateStatusByProviderMessageId(
      payload.providerMessageId,
      payload.status,
      payload as unknown as Prisma.InputJsonValue
    );

    return {
      message: "WhatsApp status webhook processed",
      data: this.messagesService.serializeMessage({ ...message, client: null })
    };
  }

  private generateProviderMessageId(prefix: string) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }

  private async sendWithTwilioIfConfigured(input: { to: string; from: string; message: string }) {
    if (!this.client || !this.whatsappNumber) {
      return {
        provider: "mock-whatsapp",
        providerMessageId: this.generateProviderMessageId("WA"),
        fromAddress: input.from
      };
    }

    const result = await this.client.messages.create({
      to: input.to.startsWith("whatsapp:") ? input.to : `whatsapp:${input.to}`,
      from: this.whatsappNumber.startsWith("whatsapp:")
        ? this.whatsappNumber
        : `whatsapp:${this.whatsappNumber}`,
      body: input.message
    });

    return {
      provider: "twilio-whatsapp",
      providerMessageId: result.sid,
      fromAddress: result.from
    };
  }
}
