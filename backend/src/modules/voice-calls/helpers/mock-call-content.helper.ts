import { SentimentLabel, VoiceCall } from "@prisma/client";

type SummaryPayload = {
  summary: string;
  sentiment: SentimentLabel;
  keyPoints: string[];
  followUpRequired: boolean;
  followUpSuggestion: string | null;
};

const TRANSCRIPT_LIBRARY = [
  "Hello ma'am, your report is ready. Would you like to visit tomorrow?",
  "Hello, this is a reminder for your appointment tomorrow at 6 PM. Please reply if you need to reschedule.",
  "Hi, we are calling to confirm your consultation timing and share the clinic address."
];

const SUMMARY_LIBRARY: SummaryPayload[] = [
  {
    summary: "Customer confirmed the visit for tomorrow.",
    sentiment: SentimentLabel.positive,
    keyPoints: ["Appointment discussed", "Customer confirmed timing", "No changes requested"],
    followUpRequired: false,
    followUpSuggestion: null
  },
  {
    summary: "Customer asked for a callback later in the day.",
    sentiment: SentimentLabel.neutral,
    keyPoints: ["Call answered", "Requested callback", "Timing not finalized"],
    followUpRequired: true,
    followUpSuggestion: "Call the customer again after 6 PM."
  },
  {
    summary: "Customer wants to reschedule and needs a manual follow-up.",
    sentiment: SentimentLabel.negative,
    keyPoints: ["Reschedule requested", "Customer sounded unhappy", "Manual callback needed"],
    followUpRequired: true,
    followUpSuggestion: "Ask a team member to call and offer a new time slot."
  }
];

export function generateMockCallSid() {
  return `CALL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function generateMockTranscript(call: Pick<VoiceCall, "direction" | "status" | "customerName">) {
  if (call.status === "missed") {
    return "Call was missed. No conversation was recorded.";
  }

  if (call.direction === "incoming") {
    return TRANSCRIPT_LIBRARY[0];
  }

  if (call.customerName) {
    return `Hello ${call.customerName}, this is a follow-up call from the clinic. We are calling to confirm your appointment and answer any questions.`;
  }

  return TRANSCRIPT_LIBRARY[1];
}

export function generateMockSummary(call: Pick<VoiceCall, "status" | "durationSeconds">): SummaryPayload {
  if (call.status === "missed") {
    return {
      summary: "The call was missed and needs a callback.",
      sentiment: SentimentLabel.neutral,
      keyPoints: ["Missed call", "No conversation available", "Callback required"],
      followUpRequired: true,
      followUpSuggestion: "Send a WhatsApp message and schedule a callback."
    };
  }

  if ((call.durationSeconds ?? 0) >= 180) {
    return SUMMARY_LIBRARY[0];
  }

  if ((call.durationSeconds ?? 0) >= 60) {
    return SUMMARY_LIBRARY[1];
  }

  return SUMMARY_LIBRARY[2];
}

export function generateMockRecordingUrl(callId: string) {
  return `https://mock-storage.local/recordings/${callId}.mp3`;
}
