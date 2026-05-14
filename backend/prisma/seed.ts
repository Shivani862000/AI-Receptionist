import {
  PrismaClient,
  ActivityType,
  AutomationActionType,
  AutomationChannel,
  AutomationExecutionStatus,
  AutomationScheduleType,
  AutomationTriggerType,
  CallDirection,
  CallStatus,
  CallType,
  ClientStatus,
  ContactMode,
  Gender,
  MembershipStatus,
  MessageChannel,
  MessageDirection,
  MessageStatus,
  MessageTemplateType,
  NotificationChannelType,
  NotificationStatus,
  NotificationType,
  OnboardingStep,
  ReportStatus,
  ReportType,
  SentimentLabel,
  SubscriptionPlanName,
  SubscriptionStatus,
  UserRole
} from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const now = new Date();

const serviceCatalog = [
  { serviceName: "Dermatology Consultation", serviceCode: "DERM-001", description: "Initial skin consultation", duration: 30, price: 1500 },
  { serviceName: "Laser Hair Removal", serviceCode: "LASER-002", description: "Laser treatment session", duration: 45, price: 3200 },
  { serviceName: "Chemical Peel", serviceCode: "PEEL-003", description: "Glow and pigmentation peel", duration: 40, price: 2800 },
  { serviceName: "Acne Follow-up", serviceCode: "ACNE-004", description: "Follow-up for acne treatment", duration: 20, price: 900 },
  { serviceName: "Skin Report Review", serviceCode: "REPORT-005", description: "Diagnostic report review and next steps", duration: 25, price: 1100 }
];

const demoClients = [
  { fullName: "Priya Mehra", gender: Gender.female, phone: "+919876511220", whatsapp: "+919876511220", email: "priya@example.com", preferredContactMode: ContactMode.whatsapp, preferredContactTime: "18:00-20:00", notes: "Prefers concise updates after work.", birthday: "1994-08-15", anniversary: "2020-02-10", status: ClientStatus.active },
  { fullName: "Rohan Mehta", gender: Gender.male, phone: "+919812345670", whatsapp: "+919812345670", email: "rohan@example.com", preferredContactMode: ContactMode.call, preferredContactTime: "10:00-12:00", notes: "Usually calls back quickly if voicemail is left.", birthday: "1990-04-12", anniversary: null, status: ClientStatus.active },
  { fullName: "Ananya Kapoor", gender: Gender.female, phone: "+919845667701", whatsapp: "+919845667701", email: "ananya@example.com", preferredContactMode: ContactMode.email, preferredContactTime: "14:00-16:00", notes: "Wants invoices and reports by email.", birthday: "1989-01-22", anniversary: "2018-11-30", status: ClientStatus.active },
  { fullName: "Kabir Khanna", gender: Gender.male, phone: "+919899001122", whatsapp: "+919899001122", email: "kabir@example.com", preferredContactMode: ContactMode.sms, preferredContactTime: "09:00-11:00", notes: "Short SMS reminders work best.", birthday: "1992-07-09", anniversary: null, status: ClientStatus.active },
  { fullName: "Sneha Arora", gender: Gender.female, phone: "+919811223344", whatsapp: "+919811223344", email: "sneha@example.com", preferredContactMode: ContactMode.whatsapp, preferredContactTime: "17:00-19:00", notes: "Often asks for reschedules one day before visit.", birthday: "1996-12-04", anniversary: "2021-03-14", status: ClientStatus.active },
  { fullName: "Arjun Batra", gender: Gender.male, phone: "+919833445566", whatsapp: "+919833445566", email: "arjun@example.com", preferredContactMode: ContactMode.call, preferredContactTime: "12:00-14:00", notes: "Interested in package pricing.", birthday: "1988-09-18", anniversary: null, status: ClientStatus.active },
  { fullName: "Neha Sethi", gender: Gender.female, phone: "+919822334455", whatsapp: "+919822334455", email: "neha@example.com", preferredContactMode: ContactMode.email, preferredContactTime: "11:00-13:00", notes: "Reviews every transcript and summary carefully.", birthday: "1995-05-26", anniversary: null, status: ClientStatus.active },
  { fullName: "Dev Malhotra", gender: Gender.male, phone: "+919855667788", whatsapp: "+919855667788", email: "dev@example.com", preferredContactMode: ContactMode.whatsapp, preferredContactTime: "19:00-21:00", notes: "Late-evening WhatsApp is ideal.", birthday: "1993-06-11", anniversary: "2019-08-08", status: ClientStatus.active },
  { fullName: "Isha Nanda", gender: Gender.female, phone: "+919877665544", whatsapp: "+919877665544", email: "isha@example.com", preferredContactMode: ContactMode.sms, preferredContactTime: "08:00-10:00", notes: "Morning updates before office commute.", birthday: "1997-10-03", anniversary: null, status: ClientStatus.active },
  { fullName: "Vikram Suri", gender: Gender.male, phone: "+919866554433", whatsapp: "+919866554433", email: "vikram@example.com", preferredContactMode: ContactMode.call, preferredContactTime: "16:00-18:00", notes: "Needs operator escalation for billing questions.", birthday: "1987-02-19", anniversary: "2015-12-21", status: ClientStatus.active }
];

const transcriptSnippets = [
  {
    caller: "I want to confirm whether my report is ready for pickup tomorrow.",
    agent: "Yes, the report is ready. Please visit between 10 AM and 6 PM tomorrow."
  },
  {
    caller: "Can you move my consultation to Saturday morning?",
    agent: "I have noted your reschedule request for Saturday morning and the team will confirm the slot shortly."
  },
  {
    caller: "Please remind me about the acne follow-up after 5 PM.",
    agent: "Sure, I will note that evening reminders work best for you."
  },
  {
    caller: "I need pricing details for the laser package.",
    agent: "I can help with that. I will ask the clinic team to share the package options today."
  }
];

const outboundMessages = [
  "Your appointment is confirmed for tomorrow at 6 PM.",
  "Your report is ready for pickup between 10 AM and 6 PM.",
  "Reminder: please share your feedback after the visit.",
  "We have noted your reschedule request and will confirm shortly.",
  "Our team will call you back regarding package pricing."
];

async function main() {
  await prisma.activityLog.deleteMany();
  await prisma.auditLogEntry.deleteMany();
  await prisma.dashboardNotification.deleteMany();
  await prisma.webhookEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.usageRecord.deleteMany();
  await prisma.businessSubscription.deleteMany();
  await prisma.saaSPlan.deleteMany();
  await prisma.businessAISettings.deleteMany();
  await prisma.businessBranding.deleteMany();
  await prisma.businessOnboarding.deleteMany();
  await prisma.automationExecution.deleteMany();
  await prisma.automation.deleteMany();
  await prisma.messageTemplate.deleteMany();
  await prisma.aICallSummary.deleteMany();
  await prisma.callRecording.deleteMany();
  await prisma.voiceCallTranscript.deleteMany();
  await prisma.callTranscriptSegment.deleteMany();
  await prisma.voiceCall.deleteMany();
  await prisma.message.deleteMany();
  await prisma.clientService.deleteMany();
  await prisma.client.deleteMany();
  await prisma.service.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.otpRequest.deleteMany();
  await prisma.businessMembership.deleteMany();
  await prisma.reportExport.deleteMany();
  await prisma.user.deleteMany();
  await prisma.business.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const superAdmin = await prisma.user.create({
    data: {
      fullName: "Platform Admin",
      email: "admin@aireceptionist.com",
      phone: "+919900000001",
      passwordHash
    }
  });

  const user = await prisma.user.create({
    data: {
      fullName: "Riya Sharma",
      email: "owner@clinic.com",
      phone: "+919876543210",
      passwordHash
    }
  });

  const business = await prisma.business.create({
    data: {
      businessName: "Nova Skin Studio",
      ownerName: "Riya Sharma",
      slug: "nova-skin-studio",
      industry: "Dermatology Clinic",
      teamSize: "11-25",
      phone: "+911140001122",
      email: "hello@novaskin.com",
      address: "Greater Kailash, New Delhi",
      timezone: "Asia/Kolkata",
      website: "https://novaskin.example.com",
      primaryColor: "#4f46e5",
      logoUrl: "https://cdn.example.com/nova-skin-logo.png"
    }
  });

  await prisma.businessMembership.create({
    data: {
      businessId: business.id,
      userId: user.id,
      role: UserRole.business_admin,
      status: MembershipStatus.active,
      isPrimary: true
    }
  });

  const managerUser = await prisma.user.create({
    data: {
      fullName: "Meera Singh",
      email: "manager@clinic.com",
      phone: "+919900000002",
      passwordHash,
    }
  });

  const receptionistUser = await prisma.user.create({
    data: {
      fullName: "Aman Verma",
      email: "reception@clinic.com",
      phone: "+919900000003",
      passwordHash,
    }
  });

  const viewerUser = await prisma.user.create({
    data: {
      fullName: "Finance Viewer",
      email: "viewer@clinic.com",
      phone: "+919900000004",
      passwordHash,
    }
  });

  await prisma.businessMembership.createMany({
    data: [
      {
        businessId: business.id,
        userId: managerUser.id,
        role: UserRole.manager,
        status: MembershipStatus.active,
        isPrimary: false,
      },
      {
        businessId: business.id,
        userId: receptionistUser.id,
        role: UserRole.receptionist,
        status: MembershipStatus.active,
        isPrimary: false,
      },
      {
        businessId: business.id,
        userId: viewerUser.id,
        role: UserRole.viewer,
        status: MembershipStatus.active,
        isPrimary: false,
      },
    ],
  });

  const plans = {
    starter: await prisma.saaSPlan.create({
      data: {
        name: SubscriptionPlanName.starter,
        displayName: "Starter",
        monthlyPrice: 4999,
        includedMinutes: 250,
        includedMessages: 1500,
        includedAIRequests: 1200,
        includedStorageMb: 2048,
        description: "For solo clinics getting started with AI reception.",
      },
    }),
    professional: await prisma.saaSPlan.create({
      data: {
        name: SubscriptionPlanName.professional,
        displayName: "Professional",
        monthlyPrice: 12999,
        includedMinutes: 1200,
        includedMessages: 8000,
        includedAIRequests: 6000,
        includedStorageMb: 8192,
        description: "For growing multi-agent customer support teams.",
      },
    }),
    enterprise: await prisma.saaSPlan.create({
      data: {
        name: SubscriptionPlanName.enterprise,
        displayName: "Enterprise",
        monthlyPrice: 29999,
        includedMinutes: 5000,
        includedMessages: 30000,
        includedAIRequests: 25000,
        includedStorageMb: 51200,
        description: "For high-volume healthcare and service operators.",
      },
    }),
  };

  const currentPeriodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const currentPeriodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const primarySubscription = await prisma.businessSubscription.create({
    data: {
      businessId: business.id,
      planId: plans.professional.id,
      planName: plans.professional.name,
      status: SubscriptionStatus.active,
      monthlyPrice: plans.professional.monthlyPrice,
      includedMinutes: plans.professional.includedMinutes,
      includedMessages: plans.professional.includedMessages,
      includedAIRequests: plans.professional.includedAIRequests,
      includedStorageMb: plans.professional.includedStorageMb,
      currentPeriodStart,
      currentPeriodEnd,
      isCurrent: true,
    },
  });

  await prisma.businessOnboarding.create({
    data: {
      businessId: business.id,
      currentStep: OnboardingStep.test_ai_call,
      completedSteps: Object.values(OnboardingStep),
      skippedSteps: [],
      isCompleted: true,
      businessInfoUploaded: true,
      twilioConnected: true,
      whatsappConfigured: true,
      testCallCompleted: true,
      lastCompletedAt: now,
    },
  });

  await prisma.businessAISettings.create({
    data: {
      businessId: business.id,
      tone: "friendly-professional",
      language: "en",
      greetingMessage: "Hello, thank you for calling Nova Skin Studio. How can I help you today?",
      voiceSelection: "aura-asteria-en",
      businessInstructions: "Focus on booking consults, confirming reports, and capturing follow-up needs clearly.",
      fallbackRules: {
        escalateForPricing: true,
        requireHumanForComplaints: true,
      },
    },
  });

  await prisma.businessBranding.create({
    data: {
      businessId: business.id,
      logoUrl: business.logoUrl,
      brandColor: "#4f46e5",
      businessName: business.businessName,
      emailFooter: "Nova Skin Studio | Greater Kailash, New Delhi",
      pdfBranding: {
        showLogo: true,
        footer: "Confidential client communication",
      },
    },
  });

  const services = [];
  for (const item of serviceCatalog) {
    const service = await prisma.service.create({
      data: {
        businessId: business.id,
        ...item,
        isActive: true
      }
    });
    services.push(service);
  }

  const clients = [];
  for (let index = 0; index < demoClients.length; index += 1) {
    const item = demoClients[index];
    const client = await prisma.client.create({
      data: {
        businessId: business.id,
        fullName: item.fullName,
        gender: item.gender,
        phone: item.phone,
        whatsapp: item.whatsapp,
        email: item.email,
        preferredContactMode: item.preferredContactMode,
        preferredContactTime: item.preferredContactTime,
        notes: item.notes,
        birthday: item.birthday ? new Date(`${item.birthday}T00:00:00.000Z`) : null,
        anniversary: item.anniversary ? new Date(`${item.anniversary}T00:00:00.000Z`) : null,
        status: item.status,
        lastInteractionAt: new Date(now.getTime() - index * 6 * 60 * 60 * 1000),
        clientServices: {
          create: [
            { serviceId: services[index % services.length].id },
            { serviceId: services[(index + 1) % services.length].id }
          ]
        }
      }
    });

    clients.push(client);
  }

  const templates = {
    reportReady: await prisma.messageTemplate.create({
      data: {
        businessId: business.id,
        name: "Report Ready WhatsApp",
        channel: MessageChannel.whatsapp,
        templateType: MessageTemplateType.report_ready,
        content: "Hello {{name}}, your report is ready. Please visit between 10 AM and 6 PM.",
        variables: ["name"]
      }
    }),
    feedback: await prisma.messageTemplate.create({
      data: {
        businessId: business.id,
        name: "Feedback SMS",
        channel: MessageChannel.sms,
        templateType: MessageTemplateType.feedback,
        content: "Hi {{name}}, thank you for visiting us. Please share your feedback.",
        variables: ["name"]
      }
    }),
    birthday: await prisma.messageTemplate.create({
      data: {
        businessId: business.id,
        name: "Birthday Greeting",
        channel: MessageChannel.whatsapp,
        templateType: MessageTemplateType.birthday,
        content: "Hello {{name}}, wishing you a very happy birthday from Nova Skin Studio.",
        variables: ["name"]
      }
    }),
    followUp: await prisma.messageTemplate.create({
      data: {
        businessId: business.id,
        name: "Follow-up Email",
        channel: MessageChannel.email,
        templateType: MessageTemplateType.follow_up,
        content: "Hello {{name}}, we are checking in after your consultation. Please let us know if you need anything else.",
        variables: ["name"]
      }
    }),
    reminder: await prisma.messageTemplate.create({
      data: {
        businessId: business.id,
        name: "Appointment Reminder",
        channel: MessageChannel.whatsapp,
        templateType: MessageTemplateType.reminder,
        content: "Hello {{name}}, this is your reminder for tomorrow's appointment at {{time}}.",
        variables: ["name", "time"]
      }
    })
  };

  const automations = [
    await prisma.automation.create({
      data: {
        businessId: business.id,
        name: "Birthday Wishes",
        description: "Send a WhatsApp birthday greeting to active clients every morning.",
        triggerType: AutomationTriggerType.birthday,
        channel: AutomationChannel.whatsapp,
        actionType: AutomationActionType.send_message,
        templateId: templates.birthday.id,
        scheduleType: AutomationScheduleType.recurring,
        scheduleValue: "09:00",
        isActive: true,
        triggerConfig: { daysOffset: 0 },
        executionRules: { maxRetryCount: 3 }
      }
    }),
    await prisma.automation.create({
      data: {
        businessId: business.id,
        name: "Appointment Reminder",
        description: "Send reminder messages one day before the visit.",
        triggerType: AutomationTriggerType.appointment_reminder,
        channel: AutomationChannel.whatsapp,
        actionType: AutomationActionType.send_message,
        templateId: templates.reminder.id,
        scheduleType: AutomationScheduleType.delayed,
        scheduleValue: "1d",
        isActive: true,
        triggerConfig: { delayDays: 1 },
        executionRules: { maxRetryCount: 3 }
      }
    }),
    await prisma.automation.create({
      data: {
        businessId: business.id,
        name: "Feedback SMS",
        description: "Request feedback after completed visits.",
        triggerType: AutomationTriggerType.feedback_request,
        channel: AutomationChannel.sms,
        actionType: AutomationActionType.send_sms,
        templateId: templates.feedback.id,
        scheduleType: AutomationScheduleType.delayed,
        scheduleValue: "4h",
        isActive: true,
        executionRules: { maxRetryCount: 3 }
      }
    }),
    await prisma.automation.create({
      data: {
        businessId: business.id,
        name: "Report Ready Reminder",
        description: "Send report-ready notifications when diagnostics are complete.",
        triggerType: AutomationTriggerType.report_ready,
        channel: AutomationChannel.whatsapp,
        actionType: AutomationActionType.send_message,
        templateId: templates.reportReady.id,
        scheduleType: AutomationScheduleType.instant,
        scheduleValue: "0",
        isActive: true,
        executionRules: { maxRetryCount: 3 }
      }
    }),
    await prisma.automation.create({
      data: {
        businessId: business.id,
        name: "Follow-up Email",
        description: "Send check-in emails after consultations.",
        triggerType: AutomationTriggerType.follow_up,
        channel: AutomationChannel.email,
        actionType: AutomationActionType.send_email,
        templateId: templates.followUp.id,
        scheduleType: AutomationScheduleType.delayed,
        scheduleValue: "2d",
        isActive: true,
        triggerConfig: { delayDays: 2 },
        executionRules: { maxRetryCount: 3 }
      }
    })
  ];

  const allMessages = [];
  for (let index = 0; index < 20; index += 1) {
    const client = clients[index % clients.length];
    const channel = [MessageChannel.whatsapp, MessageChannel.sms, MessageChannel.email][index % 3];
    const direction = index % 4 === 0 ? MessageDirection.inbound : MessageDirection.outbound;
    const status = [MessageStatus.delivered, MessageStatus.read, MessageStatus.sent, MessageStatus.received, MessageStatus.failed][index % 5];
    const createdAt = new Date(now.getTime() - index * 3 * 60 * 60 * 1000);
    const text = outboundMessages[index % outboundMessages.length];

    const message = await prisma.message.create({
      data: {
        businessId: business.id,
        clientId: client.id,
        providerMessageId: `MSG-SEED-${String(index + 1).padStart(3, "0")}`,
        channel,
        direction,
        status,
        fromAddress: direction === MessageDirection.outbound ? business.phone ?? "Nova Skin Studio" : client.phone,
        toAddress: direction === MessageDirection.outbound ? client.phone : business.phone ?? "Nova Skin Studio",
        subject: channel === MessageChannel.email ? `Nova Skin update ${index + 1}` : null,
        bodyText: direction === MessageDirection.inbound ? `Client reply ${index + 1}: ${text}` : text,
        previewText: direction === MessageDirection.inbound ? `Client reply ${index + 1}: ${text}` : text,
        sentAt: direction === MessageDirection.outbound ? createdAt : null,
        deliveredAt: [MessageStatus.delivered, MessageStatus.read].includes(status) ? new Date(createdAt.getTime() + 3 * 60 * 1000) : null,
        receivedAt: direction === MessageDirection.inbound ? createdAt : null,
        readAt: status === MessageStatus.read ? new Date(createdAt.getTime() + 8 * 60 * 1000) : null,
        errorMessage: status === MessageStatus.failed ? "Mock provider timeout" : null,
        metadata: {
          demoSeed: true,
          channelLabel: channel
        },
        createdAt
      }
    });

    allMessages.push(message);
  }

  const allCalls = [];
  for (let index = 0; index < 20; index += 1) {
    const client = clients[index % clients.length];
    const direction = index % 2 === 0 ? CallDirection.incoming : CallDirection.outgoing;
    const callType = [
      CallType.incoming_call,
      CallType.outgoing_call,
      CallType.feedback_call,
      CallType.reminder_call,
      CallType.report_status_call
    ][index % 5];
    const status = [CallStatus.completed, CallStatus.completed, CallStatus.completed, CallStatus.missed, CallStatus.failed][index % 5];
    const startedAt = new Date(now.getTime() - index * 5 * 60 * 60 * 1000);
    const endedAt = status === CallStatus.completed ? new Date(startedAt.getTime() + (120 + index * 6) * 1000) : null;
    const sentiment = [SentimentLabel.positive, SentimentLabel.neutral, SentimentLabel.negative, SentimentLabel.mixed][index % 4];

    const call = await prisma.voiceCall.create({
      data: {
        businessId: business.id,
        clientId: client.id,
        callSid: `CALL-SEED-${String(index + 1).padStart(3, "0")}`,
        providerCallId: `CALL-SEED-${String(index + 1).padStart(3, "0")}`,
        direction,
        callType,
        status,
        customerName: client.fullName,
        customerPhone: client.phone,
        fromNumber: direction === CallDirection.incoming ? client.phone : business.phone ?? "+911140001122",
        toNumber: direction === CallDirection.incoming ? business.phone ?? "+911140001122" : client.phone,
        startedAt,
        endedAt,
        durationSeconds: endedAt ? Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000) : 0,
        sentiment,
        sentimentScore: [0.91, 0.65, 0.38, 0.54][index % 4],
        transcriptStatus: status === CallStatus.completed ? "generated" : "pending",
        summaryStatus: status === CallStatus.completed ? "generated" : "pending",
        recordingUrl: status === CallStatus.completed ? `https://mock-storage.local/recordings/demo-call-${index + 1}.mp3` : null,
        webhookPayload: {
          provider: "seed"
        }
      }
    });

    allCalls.push(call);

    if (status === CallStatus.completed) {
      const snippet = transcriptSnippets[index % transcriptSnippets.length];
      const transcript = await prisma.voiceCallTranscript.create({
        data: {
          voiceCallId: call.id,
          transcriptText: `${snippet.caller} ${snippet.agent}`,
          language: "en",
          confidence: 0.82 + (index % 3) * 0.04,
          provider: "mock-transcriber"
        }
      });

      await prisma.callTranscriptSegment.createMany({
        data: [
          {
            callId: call.id,
            sequenceNumber: 1,
            speaker: "client",
            text: snippet.caller
          },
          {
            callId: call.id,
            sequenceNumber: 2,
            speaker: "ai",
            text: snippet.agent
          }
        ]
      });

      await prisma.callRecording.create({
        data: {
          callId: call.id,
          recordingUrl: `https://mock-storage.local/recordings/demo-call-${index + 1}.mp3`,
          provider: "mock-storage",
          publicUrl: `https://cdn.example.com/recordings/demo-call-${index + 1}.mp3`,
          durationSeconds: call.durationSeconds
        }
      });

      const aiSummary = await prisma.aICallSummary.create({
        data: {
          callId: call.id,
          summary: snippet.agent,
          summaryText: snippet.agent,
          keyPoints: [snippet.caller, snippet.agent],
          followUpRequired: index % 2 === 0,
          followUpSuggestion: index % 2 === 0 ? "Send a WhatsApp confirmation and reminder." : "No additional follow-up required.",
          sentiment,
          sentimentScore: call.sentimentScore,
          modelName: "gemini-2.5-flash-preview"
        }
      });

      await prisma.voiceCall.update({
        where: { id: call.id },
        data: {
          transcriptId: transcript.id,
          aiSummaryId: aiSummary.id
        }
      });
    }
  }

  const automationExecutions = [];
  for (let index = 0; index < 8; index += 1) {
    const execution = await prisma.automationExecution.create({
      data: {
        automationId: automations[index % automations.length].id,
        businessId: business.id,
        clientId: clients[index % clients.length].id,
        messageId: allMessages[index]?.id ?? null,
        voiceCallId: allCalls[index]?.id ?? null,
        status: [AutomationExecutionStatus.success, AutomationExecutionStatus.pending, AutomationExecutionStatus.failed, AutomationExecutionStatus.retrying][index % 4],
        scheduledFor: new Date(now.getTime() - index * 2 * 60 * 60 * 1000),
        startedAt: new Date(now.getTime() - index * 2 * 60 * 60 * 1000 + 2 * 60 * 1000),
        executedAt: new Date(now.getTime() - index * 2 * 60 * 60 * 1000 + 4 * 60 * 1000),
        completedAt: index % 4 === 0 ? new Date(now.getTime() - index * 2 * 60 * 60 * 1000 + 5 * 60 * 1000) : null,
        retryCount: index % 4 === 2 ? 1 : index % 4 === 3 ? 2 : 0,
        errorMessage: index % 4 === 2 ? "Mock provider timeout" : index % 4 === 3 ? "Retry in progress after temporary SMTP failure" : null,
        metadata: {
          demoSeed: true,
          channel: automations[index % automations.length].channel
        }
      }
    });
    automationExecutions.push(execution);
  }

  const reportExports = [
    { reportType: ReportType.call_analytics, status: ReportStatus.completed, fileUrl: "/uploads/reports/call_summary-1778481913888.pdf" },
    { reportType: ReportType.sentiment_analytics, status: ReportStatus.completed, fileUrl: "/uploads/reports/daily_summary-1778481914100.pdf" },
    { reportType: ReportType.daily_summary, status: ReportStatus.completed, fileUrl: "/uploads/reports/transcript-1778481914147.pdf" },
    { reportType: ReportType.client_follow_up, status: ReportStatus.completed, fileUrl: "/uploads/reports/client_report-1778481914067.pdf" },
    { reportType: ReportType.call_analytics, status: ReportStatus.processing, fileUrl: null }
  ];

  for (let index = 0; index < reportExports.length; index += 1) {
    const item = reportExports[index];
    await prisma.reportExport.create({
      data: {
        businessId: business.id,
        requestedByUserId: user.id,
        reportType: item.reportType,
        status: item.status,
        dateFrom: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        dateTo: now,
        filters: {
          range: "last_7_days"
        },
        fileUrl: item.fileUrl,
        storagePath: item.fileUrl,
        requestedAt: new Date(now.getTime() - index * 60 * 60 * 1000),
        completedAt: item.status === ReportStatus.completed ? new Date(now.getTime() - index * 60 * 60 * 1000 + 10 * 60 * 1000) : null
      }
    });
  }

  await prisma.usageRecord.createMany({
    data: [
      {
        businessId: business.id,
        metricType: "ai_requests",
        monthKey: `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`,
        quantity: 348,
        unit: "requests",
      },
      {
        businessId: business.id,
        metricType: "stt_minutes",
        monthKey: `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`,
        quantity: 122.5,
        unit: "minutes",
      },
      {
        businessId: business.id,
        metricType: "tts_characters",
        monthKey: `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`,
        quantity: 14220,
        unit: "characters",
      },
      {
        businessId: business.id,
        metricType: "storage_mb",
        monthKey: `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`,
        quantity: 618.4,
        unit: "mb",
      },
    ],
  });

  const issuedInvoice = await prisma.invoice.create({
    data: {
      businessId: business.id,
      subscriptionId: primarySubscription.id,
      invoiceNumber: "INV-DEMO-001",
      status: "issued",
      subtotal: 12999,
      overageAmount: 799,
      totalAmount: 13798,
      dueDate: currentPeriodEnd,
      issuedAt: now,
      metadata: {
        planName: "professional",
      },
    },
  });

  await prisma.payment.create({
    data: {
      businessId: business.id,
      invoiceId: issuedInvoice.id,
      amount: 13798,
      status: "succeeded",
      provider: "manual-demo",
      providerReference: "PAY-DEMO-001",
      paidAt: now,
    },
  });

  await prisma.dashboardNotification.createMany({
    data: [
      {
        businessId: business.id,
        type: NotificationType.usage_limit_reached,
        channel: NotificationChannelType.dashboard,
        status: NotificationStatus.unread,
        title: "Call usage nearing limit",
        message: "You have used 82% of your included monthly call minutes.",
      },
      {
        businessId: business.id,
        type: NotificationType.payment_reminder,
        channel: NotificationChannelType.email,
        status: NotificationStatus.sent,
        title: "Invoice reminder",
        message: "Your next invoice will be due in 5 days.",
        sentAt: now,
      },
    ],
  });

  await prisma.auditLogEntry.create({
    data: {
      businessId: business.id,
      actorUserId: user.id,
      action: "seed.initialized",
      entityType: "Business",
      entityId: business.id,
      summary: "Primary SaaS workspace seeded",
      payload: {
        plan: "professional",
      },
    },
  });

  const secondBusiness = await prisma.business.create({
    data: {
      businessName: "Peak Dental Care",
      ownerName: "Dr. Karan Malhotra",
      slug: "peak-dental-care",
      industry: "Dental Clinic",
      teamSize: "6-10",
      phone: "+911140009900",
      email: "hello@peakdental.com",
      address: "Bandra West, Mumbai",
      timezone: "Asia/Kolkata",
      primaryColor: "#0ea5e9",
    },
  });

  const thirdBusiness = await prisma.business.create({
    data: {
      businessName: "Silverline Diagnostics",
      ownerName: "Anita Rao",
      slug: "silverline-diagnostics",
      industry: "Diagnostics Lab",
      teamSize: "26-50",
      phone: "+911140008877",
      email: "ops@silverline.com",
      address: "Whitefield, Bengaluru",
      timezone: "Asia/Kolkata",
      primaryColor: "#14b8a6",
    },
  });

  await prisma.businessMembership.createMany({
    data: [
      {
        businessId: secondBusiness.id,
        userId: managerUser.id,
        role: UserRole.business_admin,
        status: MembershipStatus.active,
        isPrimary: true,
      },
      {
        businessId: thirdBusiness.id,
        userId: viewerUser.id,
        role: UserRole.viewer,
        status: MembershipStatus.active,
        isPrimary: true,
      },
    ],
  });

  await prisma.businessSubscription.createMany({
    data: [
      {
        businessId: secondBusiness.id,
        planId: plans.starter.id,
        planName: plans.starter.name,
        status: SubscriptionStatus.trialing,
        monthlyPrice: plans.starter.monthlyPrice,
        includedMinutes: plans.starter.includedMinutes,
        includedMessages: plans.starter.includedMessages,
        includedAIRequests: plans.starter.includedAIRequests,
        includedStorageMb: plans.starter.includedStorageMb,
        currentPeriodStart,
        currentPeriodEnd,
        trialEndsAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        isCurrent: true,
      },
      {
        businessId: thirdBusiness.id,
        planId: plans.enterprise.id,
        planName: plans.enterprise.name,
        status: SubscriptionStatus.active,
        monthlyPrice: plans.enterprise.monthlyPrice,
        includedMinutes: plans.enterprise.includedMinutes,
        includedMessages: plans.enterprise.includedMessages,
        includedAIRequests: plans.enterprise.includedAIRequests,
        includedStorageMb: plans.enterprise.includedStorageMb,
        currentPeriodStart,
        currentPeriodEnd,
        isCurrent: true,
      },
    ],
  });

  await prisma.businessOnboarding.createMany({
    data: [
      {
        businessId: secondBusiness.id,
        currentStep: OnboardingStep.configure_whatsapp,
        completedSteps: [OnboardingStep.create_business, OnboardingStep.select_plan, OnboardingStep.configure_ai, OnboardingStep.connect_twilio],
        skippedSteps: [],
        isCompleted: false,
        businessInfoUploaded: false,
        twilioConnected: true,
        whatsappConfigured: false,
        testCallCompleted: false,
      },
      {
        businessId: thirdBusiness.id,
        currentStep: OnboardingStep.test_ai_call,
        completedSteps: Object.values(OnboardingStep),
        skippedSteps: [],
        isCompleted: true,
        businessInfoUploaded: true,
        twilioConnected: true,
        whatsappConfigured: true,
        testCallCompleted: true,
      },
    ],
  });

  await prisma.usageRecord.createMany({
    data: [
      {
        businessId: secondBusiness.id,
        metricType: "ai_requests",
        monthKey: `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`,
        quantity: 42,
        unit: "requests",
      },
      {
        businessId: thirdBusiness.id,
        metricType: "ai_requests",
        monthKey: `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`,
        quantity: 2280,
        unit: "requests",
      },
    ],
  });

  await prisma.webhookEvent.createMany({
    data: [
      {
        businessId: business.id,
        eventType: "twilio.voice.completed",
        provider: "twilio",
        callSid: allCalls[0]?.callSid ?? "CALL-SEED-001",
        payload: { demoSeed: true }
      },
      {
        businessId: business.id,
        eventType: "whatsapp.incoming",
        provider: "twilio-whatsapp",
        payload: { demoSeed: true }
      }
    ]
  });

  const activityEntries = [];

  for (let index = 0; index < clients.length; index += 1) {
    activityEntries.push({
      businessId: business.id,
      actorUserId: user.id,
      clientId: clients[index].id,
      entityType: "client",
      entityId: clients[index].id,
      activityType: index % 2 === 0 ? ActivityType.client_created : ActivityType.client_updated,
      title: index % 2 === 0 ? "Client created" : "Client profile updated",
      description: clients[index].fullName,
      createdAt: new Date(now.getTime() - index * 60 * 60 * 1000)
    });
  }

  for (let index = 0; index < allCalls.length; index += 1) {
    activityEntries.push({
      businessId: business.id,
      actorUserId: user.id,
      clientId: allCalls[index].clientId,
      voiceCallId: allCalls[index].id,
      entityType: "voice_call",
      entityId: allCalls[index].id,
      activityType: index % 3 === 0 ? ActivityType.ai_summary_generated : ActivityType.call_updated,
      title: index % 3 === 0 ? "AI summary generated" : "Call updated",
      description: allCalls[index].customerName,
      createdAt: new Date(now.getTime() - index * 45 * 60 * 1000)
    });
  }

  for (let index = 0; index < allMessages.length; index += 1) {
    activityEntries.push({
      businessId: business.id,
      actorUserId: user.id,
      clientId: allMessages[index].clientId,
      messageId: allMessages[index].id,
      entityType: "message",
      entityId: allMessages[index].id,
      activityType: allMessages[index].direction === MessageDirection.inbound ? ActivityType.message_received : ActivityType.message_sent,
      title: allMessages[index].direction === MessageDirection.inbound ? "Message received" : "Message sent",
      description: allMessages[index].previewText ?? undefined,
      createdAt: new Date(now.getTime() - index * 30 * 60 * 1000)
    });
  }

  for (let index = 0; index < automations.length; index += 1) {
    activityEntries.push({
      businessId: business.id,
      actorUserId: user.id,
      automationId: automations[index].id,
      entityType: "automation",
      entityId: automations[index].id,
      activityType: ActivityType.automation_created,
      title: "Automation configured",
      description: automations[index].name,
      createdAt: new Date(now.getTime() - index * 90 * 60 * 1000)
    });
  }

  await prisma.activityLog.createMany({
    data: activityEntries
  });

  console.log(
    JSON.stringify(
      {
        seededBusiness: business.businessName,
        totalBusinesses: 3,
        plans: 3,
        clients: clients.length,
        calls: allCalls.length,
        messages: allMessages.length,
        automations: automations.length,
        reports: reportExports.length
      },
      null,
      2
    )
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
