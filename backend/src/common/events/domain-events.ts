export const DomainEvents = {
  clientCreated: "crm.client.created",
  clientBirthdayDue: "crm.client.birthday.due",
  callCompleted: "communication.call.completed",
  messageReceived: "communication.message.received",
  transcriptGenerated: "ai.transcript.generated",
  summaryGenerated: "ai.summary.generated",
  reminderDue: "automation.reminder.due",
  reportExportRequested: "report.export.requested"
} as const;

export type DomainEventName = (typeof DomainEvents)[keyof typeof DomainEvents];
