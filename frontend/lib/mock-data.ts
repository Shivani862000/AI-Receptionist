export const businessProfile = {
  name: "Aira Health Concierge",
  category: "Clinic Support",
  location: "Mumbai, India",
  teamSize: "18 operators",
  plan: "Business plan",
  aiCoverage: "24/7"
};

export const authMoments = {
  loginHint: "Use these demo details to view the sample account.",
  otpChannel: "+91 98XXX 76124",
  onboardingChecklist: [
    "Business profile imported",
    "Call settings updated",
    "WhatsApp connected",
    "Reminders ready"
  ]
};

export const metrics = [
  { label: "Total calls", value: "2,841", delta: "+18%", helper: "vs last 30 days", tone: "from-blue-600 via-indigo-500 to-violet-500" },
  { label: "Incoming calls", value: "1,964", delta: "+12%", helper: "92% answered by AI", tone: "from-indigo-600 via-violet-500 to-purple-500" },
  { label: "Outgoing calls", value: "877", delta: "+26%", helper: "follow-ups and reminders", tone: "from-cyan-500 via-sky-500 to-blue-500" },
  { label: "WhatsApp messages", value: "4,392", delta: "+31%", helper: "81% read rate", tone: "from-emerald-500 via-teal-500 to-cyan-500" },
  { label: "Pending reminders", value: "146", delta: "-9%", helper: "needs scheduling", tone: "from-amber-500 via-orange-500 to-rose-500" },
  { label: "AI insights", value: "28", delta: "+6 new", helper: "conversion and churn signals", tone: "from-fuchsia-500 via-violet-500 to-indigo-500" }
];

export const channelPerformance = [
  { label: "Answer rate", value: "96%", detail: "Voice AI picked up in 2.1 rings" },
  { label: "Avg response", value: "46 sec", detail: "Across WhatsApp, SMS, and email" },
  { label: "Booking conversion", value: "34%", detail: "Lead-to-appointment this week" },
  { label: "Sentiment health", value: "87/100", detail: "Weighted across all conversations" }
];

export const activity = [
  {
    title: "Missed call followed up",
    detail: "A WhatsApp message was sent after a missed call and the customer booked a callback.",
    time: "2 min ago",
    channel: "Calls"
  },
  {
    title: "Feedback reminders sent",
    detail: "12 feedback requests were sent after appointments and 9 replies were received.",
    time: "14 min ago",
    channel: "Automation"
  },
  {
    title: "Report follow-up delayed",
    detail: "Several report notifications were delayed in the South Mumbai queue.",
    time: "28 min ago",
    channel: "Reports"
  },
  {
    title: "Client note added",
    detail: "Priya Mehra asked for package pricing and a follow-up was scheduled.",
    time: "54 min ago",
    channel: "CRM"
  }
];

export const quickActions = [
  {
    title: "Launch reminder batch",
    description: "Trigger tonight's report-ready and appointment reminders.",
    action: "Run now"
  },
  {
    title: "Review missed follow-ups",
    description: "Open calls and messages that still need a reply.",
    action: "Review"
  },
  {
    title: "Add client note",
    description: "Save call notes or a contact preference in the CRM.",
    action: "Add note"
  },
  {
    title: "Export daily summary",
    description: "Download a summary of calls, messages, and reminders.",
    action: "Export"
  }
];

export const aiSummary = {
  headline: "Evening callbacks are getting better response rates this week.",
  body:
    "Most customers are replying faster when a WhatsApp message is sent soon after a missed call, followed by a callback later if there is no response.",
  focus: ["Send WhatsApp first", "Call back after 20 minutes", "Keep the first reply short"]
};

export const voiceCalls = [
  {
    id: "call-001",
    customer: "Anika Sharma",
    company: "Nova Skin Studio",
    type: "Incoming calls",
    duration: "04:32",
    sentiment: "Positive",
    score: 91,
    preview: "Asked about treatment pricing and requested a callback tomorrow evening.",
    phone: "+91 98765 12121",
    timestamp: "Today, 6:12 PM",
    language: "English + Hindi",
    tags: ["New enquiry", "Pricing", "Callback"],
    agent: "Aira Front Desk",
    summary:
      "Customer asked about pricing, recovery time, and parking. A brochure was sent and a callback was scheduled for tomorrow evening.",
    transcriptPreview: [
      "Customer asked about laser package pricing.",
      "AI clarified recovery time and package options.",
      "Callback preferred for tomorrow evening."
    ]
  },
  {
    id: "call-002",
    customer: "Rahul Bedi",
    company: "Aira Health Concierge",
    type: "Feedback calls",
    duration: "03:09",
    sentiment: "Neutral",
    score: 68,
    preview: "Mentioned a long wait time but said the call was helpful.",
    phone: "+91 98111 88221",
    timestamp: "Today, 4:48 PM",
    language: "English",
    tags: ["Feedback", "Wait time", "Resolved"],
    agent: "NPS Pulse Agent",
    summary:
      "Customer shared feedback about waiting time. The issue was noted and a priority slot was offered for the next visit.",
    transcriptPreview: [
      "Client reported a longer-than-expected wait.",
      "AI acknowledged the concern and logged it.",
      "Priority slot offer was accepted."
    ]
  },
  {
    id: "call-003",
    customer: "Maya Clinic",
    company: "Referrals Desk",
    type: "Report status calls",
    duration: "05:16",
    sentiment: "Positive",
    score: 88,
    preview: "Report-ready update was delivered and a pickup was scheduled.",
    phone: "+91 99200 88771",
    timestamp: "Today, 2:15 PM",
    language: "English",
    tags: ["Report ready", "Pickup", "Update"],
    agent: "Results Concierge",
    summary:
      "The clinic confirmed the update and booked a same-day pickup for the report.",
    transcriptPreview: [
      "AI informed the clinic that reports were ready.",
      "Pickup time confirmed for 5 PM.",
      "Courier option discussed for next cycle."
    ]
  },
  {
    id: "call-004",
    customer: "Vikram Nair",
    company: "Wellness Care",
    type: "Reminder calls",
    duration: "02:41",
    sentiment: "Needs follow-up",
    score: 42,
    preview: "Requested another reschedule and asked for a call next week.",
    phone: "+91 99876 77654",
    timestamp: "Today, 11:08 AM",
    language: "English",
    tags: ["Reschedule", "Follow-up", "Manual call"],
    agent: "Reminder Desk",
    summary:
      "Customer postponed again because of travel and asked for a manual callback next week.",
    transcriptPreview: [
      "Client asked to move the appointment to next week.",
      "Tone indicated uncertainty about the package.",
      "AI escalated to manual retention flow."
    ]
  }
];

export const textThreads = [
  {
    id: "thread-001",
    channel: "WhatsApp",
    customer: "Rhea Sethi",
    message: "Can I move my consultation to Saturday morning and still keep the same doctor?",
    status: "Reply needed",
    priority: "High",
    lastUpdated: "3 min ago",
    tone: "Warm"
  },
  {
    id: "thread-002",
    channel: "SMS",
    customer: "Kabir Arora",
    message: "Reminder delivered for payment due on May 12. No reply yet.",
    status: "Delivered",
    priority: "Medium",
    lastUpdated: "17 min ago",
    tone: "Transactional"
  },
  {
    id: "thread-003",
    channel: "Email",
    customer: "Noor Diagnostics",
    message: "Report summary emailed with aftercare instructions and attachment link.",
    status: "Opened",
    priority: "Low",
    lastUpdated: "42 min ago",
    tone: "Professional"
  }
];

export const clients = [
  {
    name: "Priya Mehra",
    stage: "Follow-up pending",
    phone: "+91 98765 11220",
    whatsapp: "+91 98765 11220",
    email: "priya@samplemail.com",
    preferredMode: "WhatsApp",
    preferredTime: "6:00 PM - 8:00 PM",
    services: ["Dermatology", "Annual package"],
    notes: "Prefers short updates on WhatsApp and asked for package pricing after the last call.",
    celebration: "Birthday · Jun 14",
    ltv: "₹1.8L",
    lastContact: "Today, 5:42 PM",
    assignedTo: "Aira Front Desk"
  },
  {
    name: "Aarav Khanna",
    stage: "Active care",
    phone: "+91 98111 44321",
    whatsapp: "+91 98111 44321",
    email: "aarav.k@example.com",
    preferredMode: "Call",
    preferredTime: "9:00 AM - 11:00 AM",
    services: ["Pathology reports"],
    notes: "Often asks for report-status calls in Hindi and prefers human escalation if delayed.",
    celebration: "Anniversary · Nov 03",
    ltv: "₹62K",
    lastContact: "Yesterday, 10:12 AM",
    assignedTo: "Results Concierge"
  },
  {
    name: "Neha Vora",
    stage: "Feedback pending",
    phone: "+91 99200 77881",
    whatsapp: "+91 99200 77881",
    email: "neha.vora@example.com",
    preferredMode: "Email",
    preferredTime: "1:00 PM - 3:00 PM",
    services: ["Dental follow-up", "Feedback program"],
    notes: "Usually replies by email and asked for a written summary after the last appointment.",
    celebration: "Birthday · Jan 29",
    ltv: "₹94K",
    lastContact: "Today, 1:26 PM",
    assignedTo: "NPS Pulse Agent"
  },
  {
    name: "Sameer Kulkarni",
    stage: "Needs callback",
    phone: "+91 98989 11003",
    whatsapp: "+91 98989 11003",
    email: "sameer.k@example.com",
    preferredMode: "SMS",
    preferredTime: "7:30 PM - 9:00 PM",
    services: ["Health plan", "Quarterly reminders"],
    notes: "Travel-heavy schedule. Responds better to a short SMS first, then a callback if needed.",
    celebration: "Anniversary · Sep 11",
    ltv: "₹2.4L",
    lastContact: "Today, 11:08 AM",
    assignedTo: "Reminder Desk"
  }
];

export const automations = [
  {
    title: "Birthday wishes",
    description: "Send birthday messages on WhatsApp, email, or voice.",
    active: 182,
    health: "Healthy",
    trigger: "Runs daily at 8:30 AM",
    conversion: "22% coupon use",
    accent: "from-pink-500 to-rose-500"
  },
  {
    title: "Follow-up reminders",
    description: "Send reminders for enquiries, appointments, and missed calls.",
    active: 96,
    health: "Running",
    trigger: "Lead inactivity for 8 minutes",
    conversion: "34% callback booked",
    accent: "from-indigo-500 to-violet-500"
  },
  {
    title: "Feedback reminders",
    description: "Ask for feedback after service and flag issues for review.",
    active: 47,
    health: "Check",
    trigger: "4 hours after service",
    conversion: "71% response rate",
    accent: "from-cyan-500 to-sky-500"
  },
  {
    title: "Report notifications",
    description: "Multichannel alerts the moment diagnostics or reports are ready.",
    active: 64,
    health: "Healthy",
    trigger: "Status changes to report-ready",
    conversion: "58% same-day pickup",
    accent: "from-emerald-500 to-teal-500"
  }
];

export const analytics = {
  activityChart: [
    { day: "Mon", calls: 340, messages: 480, sentiment: 82 },
    { day: "Tue", calls: 390, messages: 520, sentiment: 80 },
    { day: "Wed", calls: 420, messages: 610, sentiment: 88 },
    { day: "Thu", calls: 376, messages: 580, sentiment: 84 },
    { day: "Fri", calls: 461, messages: 720, sentiment: 91 },
    { day: "Sat", calls: 298, messages: 430, sentiment: 86 },
    { day: "Sun", calls: 243, messages: 310, sentiment: 89 }
  ],
  sentimentBreakdown: [
    { label: "Positive", value: 62 },
    { label: "Neutral", value: 24 },
    { label: "Needs follow-up", value: 14 }
  ],
  reportCards: [
    { label: "PDF exports", value: "128", helper: "generated this month" },
    { label: "Avg talk time", value: "03:58", helper: "voice AI interactions" },
    { label: "Transcripts reviewed", value: "312", helper: "quality assurance" }
  ]
};

export const transcript = [
  ["AI", "Good evening, this is Aira from Nova Skin Studio. I'm calling to confirm your consultation for tomorrow at 6 PM."],
  ["Client", "Yes, please confirm it. Can I also ask about parking availability?"],
  ["AI", "Absolutely. Basement valet is available after 4 PM, and I've added the parking note to your visit summary."],
  ["Client", "Perfect, thank you. Also send me the package comparison if possible."],
  ["AI", "Done. I've sent the brochure on WhatsApp and marked you for an evening callback to discuss pricing."]
];
