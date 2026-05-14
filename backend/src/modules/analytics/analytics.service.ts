import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import type { CurrentUserType } from "../../common/types/current-user.type";
import { PrismaService } from "../../prisma/prisma.service";
import { AnalyticsQueryDto } from "./dto/analytics-query.dto";

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  callTrends(currentUser: CurrentUserType, query: AnalyticsQueryDto) {
    return this.runTrendQuery("VoiceCall", currentUser.businessId, query);
  }

  messageTrends(currentUser: CurrentUserType, query: AnalyticsQueryDto) {
    return this.runTrendQuery("Message", currentUser.businessId, query);
  }

  automationTrends(currentUser: CurrentUserType, query: AnalyticsQueryDto) {
    return this.runTrendQuery("AutomationExecution", currentUser.businessId, query);
  }

  async sentimentTrends(currentUser: CurrentUserType, query: AnalyticsQueryDto) {
    const trunc = this.dateTrunc(query.groupBy);
    const conditions = this.dateConditions(query, Prisma.sql`"createdAt"`);

    const data = await this.prisma.$queryRaw<
      Array<{ date: Date; positive: bigint | number; negative: bigint | number; neutral: bigint | number }>
    >(Prisma.sql`
      SELECT
        date_trunc(${trunc}, "createdAt") AS "date",
        COUNT(*) FILTER (WHERE "sentiment" = 'positive') AS "positive",
        COUNT(*) FILTER (WHERE "sentiment" = 'negative') AS "negative",
        COUNT(*) FILTER (WHERE "sentiment" = 'neutral') AS "neutral"
      FROM "VoiceCall"
      WHERE "businessId" = ${currentUser.businessId}
      ${conditions}
      GROUP BY 1
      ORDER BY 1 ASC
    `);

    return {
      data: data.map((item) => ({
        date: this.toDateLabel(item.date),
        positive: Number(item.positive),
        negative: Number(item.negative),
        neutral: Number(item.neutral)
      }))
    };
  }

  async channelPerformance(currentUser: CurrentUserType) {
    const [messages, calls] = await Promise.all([
      this.prisma.message.groupBy({
        by: ["channel"],
        where: { businessId: currentUser.businessId },
        _count: { _all: true }
      }),
      this.prisma.voiceCall.count({
        where: { businessId: currentUser.businessId }
      })
    ]);

    const messageCounts = Object.fromEntries(messages.map((item) => [item.channel, item._count._all]));

    return {
      data: [
        { channel: "whatsapp", count: messageCounts.whatsapp ?? 0 },
        { channel: "sms", count: messageCounts.sms ?? 0 },
        { channel: "email", count: messageCounts.email ?? 0 },
        { channel: "voice_call", count: calls }
      ]
    };
  }

  private async runTrendQuery(table: "VoiceCall" | "Message" | "AutomationExecution", businessId: string, query: AnalyticsQueryDto) {
    const trunc = this.dateTrunc(query.groupBy);
    const conditions = this.dateConditions(query, Prisma.sql`"createdAt"`);

    const data = await this.prisma.$queryRaw<Array<{ date: Date; count: bigint | number }>>(Prisma.sql`
      SELECT
        date_trunc(${trunc}, "createdAt") AS "date",
        COUNT(*) AS "count"
      FROM ${Prisma.raw(`"${table}"`)}
      WHERE "businessId" = ${businessId}
      ${conditions}
      GROUP BY 1
      ORDER BY 1 ASC
    `);

    return {
      data: data.map((item) => ({
        date: this.toDateLabel(item.date),
        count: Number(item.count)
      }))
    };
  }

  private dateTrunc(groupBy: "day" | "week" | "month" = "day") {
    return groupBy;
  }

  private dateConditions(query: AnalyticsQueryDto, fieldSql: Prisma.Sql) {
    const clauses: Prisma.Sql[] = [];

    if (query.dateFrom) {
      clauses.push(Prisma.sql`AND ${fieldSql} >= ${new Date(query.dateFrom)}`);
    }

    if (query.dateTo) {
      clauses.push(Prisma.sql`AND ${fieldSql} <= ${new Date(query.dateTo)}`);
    }

    if (!clauses.length) {
      return Prisma.empty;
    }

    return Prisma.sql`${Prisma.join(clauses, " ")}`;
  }

  private toDateLabel(value: Date) {
    return value.toISOString().slice(0, 10);
  }
}
