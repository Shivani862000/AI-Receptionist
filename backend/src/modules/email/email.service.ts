import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MessageChannel, Prisma } from "@prisma/client";
import nodemailer from "nodemailer";

import type { CurrentUserType } from "../../common/types/current-user.type";
import { PrismaService } from "../../prisma/prisma.service";
import { AiReplyService } from "../ai-reply/ai-reply.service";
import { ListMessagesDto } from "../messages/dto/list-messages.dto";
import { MessagesService } from "../messages/messages.service";
import { EmailWebhookIncomingDto } from "./dto/email-webhook-incoming.dto";
import { SendEmailDto } from "./dto/send-email.dto";

@Injectable()
export class EmailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly messagesService: MessagesService,
    private readonly aiReplyService: AiReplyService
  ) {}

  async send(currentUser: CurrentUserType, dto: SendEmailDto) {
    const result = await this.sendAutomationMessage(currentUser.businessId, {
      clientId: dto.clientId,
      to: dto.to,
      subject: dto.subject,
      body: dto.body,
      html: dto.html
    });

    return {
      message: "Email sent",
      data: result
    };
  }

  async sendAutomationMessage(
    businessId: string,
    input: { clientId?: string; to: string; subject: string; body: string; html?: string }
  ) {
    const client = await this.messagesService.resolveClientForBusiness(businessId, {
      clientId: input.clientId,
      email: input.to
    });
    const fromAddress = await this.messagesService.getBusinessContact(businessId, MessageChannel.email);
    const providerMessageId = this.generateProviderMessageId("EMAIL");
    const transportResult = await this.sendWithLocalTransport({
      from: fromAddress,
      to: input.to,
      subject: input.subject,
      text: input.body,
      html: input.html
    });

    const message = await this.messagesService.createOutgoing({
      businessId,
      clientId: client?.id ?? null,
      channel: MessageChannel.email,
      fromAddress,
      toAddress: input.to,
      subject: input.subject,
      content: input.body,
      bodyHtml: input.html,
      providerMessageId: transportResult.providerMessageId ?? providerMessageId,
      metadata: {
        provider: transportResult.provider,
        previewUrl: transportResult.previewUrl
      } as Prisma.InputJsonValue
    });

    return {
      ...this.messagesService.serializeMessage({ ...message, client: client ?? null }),
      provider: transportResult.provider,
      previewUrl: transportResult.previewUrl
    };
  }

  async history(currentUser: CurrentUserType, query: ListMessagesDto) {
    return this.messagesService.listByChannel(currentUser, MessageChannel.email, query);
  }

  async handleIncoming(payload: EmailWebhookIncomingDto) {
    const business = await this.messagesService.resolveBusinessForIncomingAddress({
      businessId: payload.businessId,
      toAddress: payload.to,
      fromAddress: payload.from
    });
    const client = await this.messagesService.resolveClientForBusiness(business.id, {
      email: payload.from
    });

    await this.prisma.webhookEvent.create({
      data: {
        businessId: business.id,
        eventType: "email.incoming",
        provider: "mock-email",
        payload: payload as unknown as Prisma.InputJsonValue
      }
    });

    const incomingMessage = await this.messagesService.createIncoming({
      businessId: business.id,
      clientId: client?.id ?? null,
      channel: MessageChannel.email,
      fromAddress: payload.from,
      toAddress: payload.to,
      subject: payload.subject,
      content: payload.body,
      providerMessageId: payload.providerMessageId ?? this.generateProviderMessageId("EMAIL-IN"),
      metadata: {
        provider: "mock-email"
      } as Prisma.InputJsonValue,
      webhookPayload: payload as unknown as Prisma.InputJsonValue
    });

    let autoReply: unknown = null;
    if (payload.autoReply) {
      const aiReply = await this.aiReplyService.generateReply({
        channel: MessageChannel.email,
        message: payload.body
      });

      autoReply = await this.messagesService.createOutgoing({
        businessId: business.id,
        clientId: client?.id ?? null,
        channel: MessageChannel.email,
        fromAddress: payload.to,
        toAddress: payload.from,
        subject: `Re: ${payload.subject ?? "Your message"}`,
        content: aiReply.reply,
        providerMessageId: this.generateProviderMessageId("EMAIL-AI"),
        metadata: {
          provider: "mock-email",
          autoReply: true,
          intent: aiReply.intent,
          sentiment: aiReply.sentiment
        } as Prisma.InputJsonValue
      });
    }

    return {
      message: "Incoming email webhook processed",
      data: {
        message: this.messagesService.serializeMessage({ ...incomingMessage, client: client ?? null }),
        autoReply: autoReply
          ? this.messagesService.serializeMessage({ ...(autoReply as typeof incomingMessage), client: client ?? null })
          : null
      }
    };
  }

  private async sendWithLocalTransport(input: {
    from: string;
    to: string;
    subject: string;
    text: string;
    html?: string;
  }) {
    try {
      const smtpHost = this.configService.get<string>("smtp.host");
      const smtpUser = this.configService.get<string>("smtp.user");
      const smtpPass = this.configService.get<string>("smtp.pass");
      const smtpPort = this.configService.get<number>("smtp.port") || 587;
      const transport =
        smtpHost && smtpUser && smtpPass
          ? nodemailer.createTransport({
              host: smtpHost,
              port: smtpPort,
              secure: smtpPort === 465,
              auth: {
                user: smtpUser,
                pass: smtpPass
              }
            })
          : nodemailer.createTransport({ jsonTransport: true });
      const info = await transport.sendMail({
        from: input.from,
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html
      });

      return {
        provider: smtpHost && smtpUser && smtpPass ? "gmail-smtp" : "nodemailer-json",
        providerMessageId: info.messageId as string,
        previewUrl: null
      };
    } catch {
      return {
        provider: "mock-email",
        providerMessageId: this.generateProviderMessageId("EMAIL"),
        previewUrl: null
      };
    }
  }

  private generateProviderMessageId(prefix: string) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }
}
