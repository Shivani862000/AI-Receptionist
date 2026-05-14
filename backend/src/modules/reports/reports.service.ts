import { Injectable } from "@nestjs/common";
import { ReportStatus, Prisma } from "@prisma/client";
import * as fs from "fs";
import * as fsp from "fs/promises";
import * as path from "path";

import type { CurrentUserType } from "../../common/types/current-user.type";
import { buildPaginationMeta } from "../../common/utils/pagination";
import { PrismaService } from "../../prisma/prisma.service";
import { ExportPdfDto } from "./dto/export-pdf.dto";
import { ExportReportDto } from "./dto/export-report.dto";
import { ReportQueryDto } from "./dto/report-query.dto";

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async calls(currentUser: CurrentUserType, query: ReportQueryDto) {
    const businessId = this.resolveBusinessId(currentUser, query.businessId);
    const where: Prisma.VoiceCallWhereInput = {
      businessId,
      ...this.buildDateWhere("createdAt", query)
    };

    const [items, total, avgDuration, positiveCount, negativeCount] = await this.prisma.$transaction([
      this.prisma.voiceCall.findMany({
        where,
        skip: (query.page! - 1) * query.limit!,
        take: query.limit,
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.voiceCall.count({ where }),
      this.prisma.voiceCall.aggregate({ where, _avg: { durationSeconds: true } }),
      this.prisma.voiceCall.count({ where: { ...where, sentiment: "positive" } }),
      this.prisma.voiceCall.count({ where: { ...where, sentiment: "negative" } })
    ]);

    return {
      data: {
        items,
        summary: {
          totalCalls: total,
          averageCallDuration: Number(avgDuration._avg.durationSeconds ?? 0),
          positiveSentimentPercentage: total ? Number(((positiveCount / total) * 100).toFixed(2)) : 0,
          negativeSentimentPercentage: total ? Number(((negativeCount / total) * 100).toFixed(2)) : 0
        },
        meta: buildPaginationMeta(total, query.page, query.limit)
      }
    };
  }

  async messages(currentUser: CurrentUserType, query: ReportQueryDto) {
    const businessId = this.resolveBusinessId(currentUser, query.businessId);
    const where: Prisma.MessageWhereInput = {
      businessId,
      ...this.buildDateWhere("createdAt", query)
    };

    const [items, total, whatsapp, sms, email, delivered, read] = await this.prisma.$transaction([
      this.prisma.message.findMany({
        where,
        skip: (query.page! - 1) * query.limit!,
        take: query.limit,
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.message.count({ where }),
      this.prisma.message.count({ where: { ...where, channel: "whatsapp" } }),
      this.prisma.message.count({ where: { ...where, channel: "sms" } }),
      this.prisma.message.count({ where: { ...where, channel: "email" } }),
      this.prisma.message.count({ where: { ...where, status: { in: ["delivered", "read"] } } }),
      this.prisma.message.count({ where: { ...where, status: "read" } })
    ]);

    return {
      data: {
        items,
        summary: {
          totalMessages: total,
          whatsappCount: whatsapp,
          smsCount: sms,
          emailCount: email,
          deliveryRate: total ? Number(((delivered / total) * 100).toFixed(2)) : 0,
          readRate: total ? Number(((read / total) * 100).toFixed(2)) : 0
        },
        meta: buildPaginationMeta(total, query.page, query.limit)
      }
    };
  }

  async automations(currentUser: CurrentUserType, query: ReportQueryDto) {
    const businessId = this.resolveBusinessId(currentUser, query.businessId);
    const where: Prisma.AutomationExecutionWhereInput = {
      businessId,
      ...this.buildDateWhere("createdAt", query)
    };

    const [items, total, success, failed, pending] = await this.prisma.$transaction([
      this.prisma.automationExecution.findMany({
        where,
        skip: (query.page! - 1) * query.limit!,
        take: query.limit,
        orderBy: { createdAt: "desc" },
        include: {
          automation: true,
          client: {
            select: { id: true, fullName: true, phone: true }
          }
        }
      }),
      this.prisma.automationExecution.count({ where }),
      this.prisma.automationExecution.count({ where: { ...where, status: "success" } }),
      this.prisma.automationExecution.count({ where: { ...where, status: "failed" } }),
      this.prisma.automationExecution.count({ where: { ...where, status: { in: ["pending", "retrying"] } } })
    ]);

    return {
      data: {
        items,
        summary: {
          totalReminders: total,
          successfulAutomations: success,
          failedAutomations: failed,
          pendingReminders: pending
        },
        meta: buildPaginationMeta(total, query.page, query.limit)
      }
    };
  }

  async clients(currentUser: CurrentUserType, query: ReportQueryDto) {
    const businessId = this.resolveBusinessId(currentUser, query.businessId);
    const where: Prisma.ClientWhereInput = {
      businessId,
      deletedAt: null,
      ...this.buildDateWhere("createdAt", query)
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.client.findMany({
        where,
        skip: (query.page! - 1) * query.limit!,
        take: query.limit,
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.client.count({ where })
    ]);

    return {
      data: {
        items,
        summary: {
          totalClients: total
        },
        meta: buildPaginationMeta(total, query.page, query.limit)
      }
    };
  }

  async overview(currentUser: CurrentUserType, query: ReportQueryDto) {
    const businessId = this.resolveBusinessId(currentUser, query.businessId);
    const callWhere: Prisma.VoiceCallWhereInput = {
      businessId,
      ...this.buildDateWhere("createdAt", query)
    };
    const messageWhere: Prisma.MessageWhereInput = {
      businessId,
      ...this.buildDateWhere("createdAt", query)
    };
    const automationWhere: Prisma.AutomationExecutionWhereInput = {
      businessId,
      ...this.buildDateWhere("createdAt", query)
    };
    const clientWhere: Prisma.ClientWhereInput = {
      businessId,
      deletedAt: null,
      ...this.buildDateWhere("createdAt", query)
    };

    const [
      totalCalls,
      totalMessages,
      totalReminders,
      totalClients,
      successfulAutomations,
      failedAutomations,
      averageCallDuration,
      positiveCount,
      negativeCount
    ] = await this.prisma.$transaction([
      this.prisma.voiceCall.count({ where: callWhere }),
      this.prisma.message.count({ where: messageWhere }),
      this.prisma.automationExecution.count({ where: automationWhere }),
      this.prisma.client.count({ where: clientWhere }),
      this.prisma.automationExecution.count({ where: { ...automationWhere, status: "success" } }),
      this.prisma.automationExecution.count({ where: { ...automationWhere, status: "failed" } }),
      this.prisma.voiceCall.aggregate({ where: callWhere, _avg: { durationSeconds: true } }),
      this.prisma.voiceCall.count({ where: { ...callWhere, sentiment: "positive" } }),
      this.prisma.voiceCall.count({ where: { ...callWhere, sentiment: "negative" } })
    ]);

    return {
      data: {
        totalCalls,
        totalMessages,
        totalReminders,
        totalClients,
        successfulAutomations,
        failedAutomations,
        averageCallDuration: Number(averageCallDuration._avg.durationSeconds ?? 0),
        positiveSentimentPercentage: totalCalls ? Number(((positiveCount / totalCalls) * 100).toFixed(2)) : 0,
        negativeSentimentPercentage: totalCalls ? Number(((negativeCount / totalCalls) * 100).toFixed(2)) : 0
      }
    };
  }

  async callAnalytics(currentUser: CurrentUserType) {
    const report = await this.calls(currentUser, { page: 1, limit: 20 });
    const completed = await this.prisma.voiceCall.count({
      where: { businessId: currentUser.businessId, status: "completed" }
    });
    const missed = await this.prisma.voiceCall.count({
      where: { businessId: currentUser.businessId, status: "missed" }
    });

    return {
      data: [
        { label: "total", value: report.data.summary.totalCalls },
        { label: "completed", value: completed },
        { label: "missed", value: missed }
      ]
    };
  }

  async sentiment(currentUser: CurrentUserType) {
    return {
      data: [
        { label: "positive", value: await this.prisma.voiceCall.count({ where: { businessId: currentUser.businessId, sentiment: "positive" } }) },
        { label: "neutral", value: await this.prisma.voiceCall.count({ where: { businessId: currentUser.businessId, sentiment: "neutral" } }) },
        { label: "negative", value: await this.prisma.voiceCall.count({ where: { businessId: currentUser.businessId, sentiment: "negative" } }) }
      ]
    };
  }

  async dailySummary(currentUser: CurrentUserType) {
    const overview = await this.overview(currentUser, { page: 1, limit: 20 });
    return {
      data: {
        totalCalls: overview.data.totalCalls,
        totalMessages: overview.data.totalMessages,
        automationExecutions: overview.data.totalReminders,
        summary: "Phase 1 report summary generated from transactional data."
      }
    };
  }

  async exportPdf(currentUser: CurrentUserType, dto: ExportPdfDto) {
    const report = await this.prisma.reportExport.create({
      data: {
        businessId: currentUser.businessId,
        requestedByUserId: currentUser.userId,
        reportType: dto.reportType,
        status: ReportStatus.processing,
        dateFrom: dto.dateFrom ? new Date(dto.dateFrom) : null,
        dateTo: dto.dateTo ? new Date(dto.dateTo) : null
      }
    });

    return {
      message: "PDF export queued",
      data: report
    };
  }

  async exportCallSummary(currentUser: CurrentUserType, dto: ExportReportDto) {
    const call = dto.callId
      ? await this.prisma.voiceCall.findFirst({
          where: { id: dto.callId, businessId: currentUser.businessId },
          include: { transcript: true, aiSummary: true }
        })
      : null;

    return this.generatePdfReport(currentUser, {
      reportType: "call_summary",
      title: "Call Summary Report",
      lines: [
        `Call ID: ${call?.id ?? "N/A"}`,
        `Customer: ${call?.customerName ?? "N/A"}`,
        `Duration: ${call?.durationSeconds ?? 0} sec`,
        `AI Summary: ${call?.aiSummary?.summaryText ?? "No AI summary available"}`,
        `Transcript: ${call?.transcript?.transcriptText ?? "No transcript available"}`
      ],
      filters: this.toFilterRecord(dto)
    });
  }

  async exportClientReport(currentUser: CurrentUserType, dto: ExportReportDto) {
    const client = dto.clientId
      ? await this.prisma.client.findFirst({
          where: { id: dto.clientId, businessId: currentUser.businessId }
        })
      : null;

    return this.generatePdfReport(currentUser, {
      reportType: "client_report",
      title: "Client Report",
      lines: [
        `Client: ${client?.fullName ?? "N/A"}`,
        `Phone: ${client?.phone ?? "N/A"}`,
        `Email: ${client?.email ?? "N/A"}`,
        `Preferred contact: ${client?.preferredContactMode ?? "N/A"}`,
        `Notes: ${client?.notes ?? "N/A"}`
      ],
      filters: this.toFilterRecord(dto)
    });
  }

  async exportDailySummary(currentUser: CurrentUserType, dto: ExportReportDto) {
    const overview = await this.overview(currentUser, {
      page: 1,
      limit: 20,
      dateFrom: dto.dateFrom,
      dateTo: dto.dateTo
    });

    return this.generatePdfReport(currentUser, {
      reportType: "daily_summary",
      title: "Daily Summary Report",
      lines: [
        `Total calls: ${overview.data.totalCalls}`,
        `Total messages: ${overview.data.totalMessages}`,
        `Total reminders: ${overview.data.totalReminders}`,
        `Successful automations: ${overview.data.successfulAutomations}`,
        `Failed automations: ${overview.data.failedAutomations}`,
        `Average call duration: ${overview.data.averageCallDuration}`
      ],
      filters: this.toFilterRecord(dto)
    });
  }

  async exportTranscript(currentUser: CurrentUserType, dto: ExportReportDto) {
    const transcript = dto.callId
      ? await this.prisma.voiceCallTranscript.findFirst({
          where: {
            voiceCallId: dto.callId,
            voiceCall: { businessId: currentUser.businessId }
          }
        })
      : null;

    return this.generatePdfReport(currentUser, {
      reportType: "transcript",
      title: "Transcript Report",
      lines: [`Call ID: ${dto.callId ?? "N/A"}`, transcript?.transcriptText ?? "No transcript found"],
      filters: this.toFilterRecord(dto)
    });
  }

  private async generatePdfReport(
    currentUser: CurrentUserType,
    input: {
      reportType: string;
      title: string;
      lines: string[];
      filters?: Record<string, unknown>;
    }
  ) {
    const PDFDocument = require("pdfkit");
    const directory = path.join(process.cwd(), "uploads", "reports");
    await fsp.mkdir(directory, { recursive: true });

    const filename = `${input.reportType}-${Date.now()}.pdf`;
    const filePath = path.join(directory, filename);
    const fileUrl = `/uploads/reports/${filename}`;
    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(filePath);

    await new Promise<void>((resolve, reject) => {
      doc.pipe(stream);
      doc.fontSize(20).text("AI Receptionist");
      doc.moveDown(0.5);
      doc.fontSize(16).text(input.title);
      doc.moveDown();
      for (const line of input.lines) {
        doc.fontSize(11).text(line);
        doc.moveDown(0.4);
      }
      doc.end();
      stream.on("finish", () => resolve());
      stream.on("error", (error: Error) => reject(error));
    });

    const report = await this.prisma.reportExport.create({
      data: {
        businessId: currentUser.businessId,
        requestedByUserId: currentUser.userId,
        reportType: this.mapReportType(input.reportType),
        status: ReportStatus.completed,
        fileUrl,
        storagePath: filePath,
        filters: input.filters as Prisma.InputJsonValue | undefined,
        completedAt: new Date()
      }
    });

    return {
      message: "PDF report generated",
      data: {
        id: report.id,
        fileUrl,
        downloadUrl: `http://localhost:4000${fileUrl}`,
        reportType: input.reportType
      }
    };
  }

  private buildDateWhere(
    field: "createdAt" | "requestedAt",
    query: { dateFrom?: string; dateTo?: string }
  ): Record<string, Prisma.DateTimeFilter> {
    if (!query.dateFrom && !query.dateTo) return {};
    return {
      [field]: {
        ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
        ...(query.dateTo ? { lte: new Date(query.dateTo) } : {})
      }
    };
  }

  private resolveBusinessId(currentUser: CurrentUserType, requestedBusinessId?: string) {
    return requestedBusinessId && requestedBusinessId === currentUser.businessId
      ? requestedBusinessId
      : currentUser.businessId;
  }

  private mapReportType(value: string) {
    if (value === "daily_summary") return "daily_summary";
    if (value === "client_report") return "client_follow_up";
    if (value === "call_summary") return "call_analytics";
    if (value === "transcript") return "call_analytics";
    return "sentiment_analytics";
  }

  private toFilterRecord(dto: ExportReportDto): Record<string, unknown> {
    return Object.fromEntries(Object.entries(dto).filter(([, value]) => value !== undefined));
  }
}
