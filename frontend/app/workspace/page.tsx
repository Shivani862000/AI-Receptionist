"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  BellRing,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  Mail,
  MessageCircleMore,
  MessagesSquare,
  Mic,
  Package2,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Plus,
  Receipt,
  ScanText,
  Settings2,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserPlus,
  Users2,
  WandSparkles,
  Workflow,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ONBOARDING_STORAGE_KEY = "ai-receptionist-demo-auth";

type NavKey = "dashboard" | "ai-agent" | "clients" | "services" | "reports" | "business";

type ServiceItem = {
  id: string;
  name: string;
  uuid: string;
  price: string;
  availability: string;
  purpose: string;
  logic: string;
  customers: string[];
};

type ReportItem = {
  id: string;
  title: string;
  description: string;
  stats: string;
  status: string;
};

const sidebarItems: Array<{ key: NavKey; label: string; icon: typeof BarChart3 }> = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "ai-agent", label: "AI Agent", icon: Bot },
  { key: "clients", label: "Clients", icon: Users2 },
  { key: "services", label: "Services", icon: Package2 },
  { key: "reports", label: "Reports", icon: ClipboardList },
  { key: "business", label: "Business", icon: BriefcaseBusiness },
];

const kpiCards = [
  { label: "Total Calls", value: "2,841", detail: "This month", tone: "from-indigo-500 via-violet-500 to-fuchsia-500", icon: PhoneCall },
  { label: "Incoming Calls", value: "1,964", detail: "92% answered", tone: "from-violet-500 via-indigo-500 to-blue-500", icon: PhoneIncoming },
  { label: "Outgoing Calls", value: "877", detail: "Reminders + follow-ups", tone: "from-sky-500 via-cyan-500 to-blue-500", icon: PhoneOutgoing },
  { label: "WhatsApp Messages", value: "4,392", detail: "81% read rate", tone: "from-emerald-500 via-teal-500 to-cyan-500", icon: MessageCircleMore },
  { label: "SMS", value: "618", detail: "Delivery healthy", tone: "from-amber-500 via-orange-500 to-rose-500", icon: MessagesSquare },
  { label: "Emails", value: "274", detail: "Open rate 63%", tone: "from-cyan-500 via-blue-500 to-indigo-500", icon: Mail },
  { label: "Pending Follow-ups", value: "146", detail: "Needs scheduling", tone: "from-rose-500 via-orange-500 to-amber-500", icon: BellRing },
];

const voiceAgentCards = [
  { title: "Incoming Calls", status: "Active", description: "Handles front-desk queries and lead screening 24/7.", icon: PhoneIncoming, cta: "View queue" },
  { title: "Outgoing Calls", status: "Scheduled", description: "Callback and lead recovery calls queued by urgency.", icon: PhoneOutgoing, cta: "Open batch" },
  { title: "Feedback", status: "Running", description: "Post-visit quality calls with issue tagging and sentiment.", icon: ScanText, cta: "Review feedback" },
  { title: "Reminder", status: "Healthy", description: "Appointment, annual checkup, and payment reminder calls.", icon: BellRing, cta: "Manage reminders" },
  { title: "Report Status", status: "Live", description: "Automated report-ready status calls with pickup routing.", icon: FileText, cta: "See transcripts" },
];

const textAgentCards = [
  { title: "WhatsApp", status: "Connected", description: "Templates, reminders, and reply handling for active clients.", icon: MessageCircleMore, cta: "Open WhatsApp" },
  { title: "SMS", status: "Connected", description: "Short transactional updates for reminders and payment nudges.", icon: MessagesSquare, cta: "Send SMS" },
  { title: "Email", status: "Connected", description: "Long-form follow-ups, reports, and newsletter communication.", icon: Mail, cta: "Open email" },
];

const clients = [
  {
    name: "Anika Sharma",
    age: 34,
    gender: "Female",
    email: "anika.sharma@example.com",
    whatsapp: "+91 98765 12001",
    phone: "+91 98765 12001",
    guardian: "Not required",
    preferredTime: "6 PM - 8 PM",
    preferredMode: "WhatsApp",
    services: ["Skin Consultation", "Annual Package"],
    occasion: "Birthday · Jun 14",
  },
  {
    name: "Rahul Bedi",
    age: 49,
    gender: "Male",
    email: "rahul.bedi@example.com",
    whatsapp: "+91 98111 88221",
    phone: "+91 98111 88221",
    guardian: "Spouse: Naina Bedi",
    preferredTime: "10 AM - 12 PM",
    preferredMode: "Call",
    services: ["Diagnostics", "Report Follow-up"],
    occasion: "Anniversary · Nov 03",
  },
  {
    name: "Noor Diagnostics",
    age: 0,
    gender: "Business",
    email: "ops@noordiagnostics.com",
    whatsapp: "+91 98200 78091",
    phone: "+91 98200 78091",
    guardian: "Manager: Ali Khan",
    preferredTime: "2 PM - 4 PM",
    preferredMode: "Email",
    services: ["Report Delivery", "Feedback Program"],
    occasion: "Client since 2024",
  },
];

const services: ServiceItem[] = [
  {
    id: "svc-001",
    name: "Skin Consultation",
    uuid: "2ee8b6db-a2f7-43d8-986c-91f2dce7a012",
    price: "₹2,500",
    availability: "18 slots today",
    purpose: "Initial doctor consultation and AI-led pre-screening.",
    logic: "Offer appointment slots, collect symptoms, and route priority cases.",
    customers: ["Anika Sharma", "Ritika Jain", "Lead queue"],
  },
  {
    id: "svc-002",
    name: "Diagnostics Report Pickup",
    uuid: "0e8b1b80-7d62-477e-bd2e-683a4fd8f6b1",
    price: "₹600",
    availability: "Available",
    purpose: "Automates report-ready updates and pickup coordination.",
    logic: "Notify by call, WhatsApp, and email until acknowledged.",
    customers: ["Rahul Bedi", "Noor Diagnostics", "Path lab clients"],
  },
  {
    id: "svc-003",
    name: "Dental Follow-up",
    uuid: "9abdb1f1-fb75-483b-a810-c7580dfab09f",
    price: "₹1,800",
    availability: "12 open follow-ups",
    purpose: "Post-treatment follow-up, reminder, and satisfaction outreach.",
    logic: "Run reminder 24 hours before visit and feedback request 4 hours after.",
    customers: ["Neha Vora", "Family plans"],
  },
];

const features = [
  { code: "F1", name: "Feedback", purpose: "Collect after-service feedback", logic: "Ask satisfaction score, tag complaints, alert team", target: "Recent visitors" },
  { code: "F2", name: "Annual Reminder", purpose: "Bring clients back on schedule", logic: "Send reminder by preferred channel 7 days before due date", target: "Annual plan clients" },
  { code: "F3", name: "Discount Announcement", purpose: "Promote seasonal campaigns", logic: "Send campaign to opted-in contact groups", target: "Dormant and price-sensitive leads" },
  { code: "F4", name: "Newsletter", purpose: "Share updates and offers", logic: "Monthly digest with segment-based content", target: "Email and WhatsApp subscribers" },
];

const integrations = [
  { code: "S1", name: "Voice Integration", purpose: "Route and log AI voice calls", logic: "Incoming and outgoing call automation with transcripts", customers: "All voice clients" },
  { code: "S2", name: "WhatsApp Integration", purpose: "Send reminders and updates", logic: "Template-based outreach and read tracking", customers: "Opted-in WhatsApp users" },
];

const reports: ReportItem[] = [
  { id: "rep-001", title: "Call Summary", description: "Daily voice activity, duration, and sentiment overview.", stats: "2,841 total calls", status: "Updated 10 mins ago" },
  { id: "rep-002", title: "Client Follow-up Status", description: "Pending, completed, and missed follow-up actions.", stats: "146 pending", status: "Needs review" },
  { id: "rep-003", title: "Feedback Analysis", description: "Themes, sentiment, and complaint categories.", stats: "71% positive", status: "Fresh insights" },
  { id: "rep-004", title: "Reminder Performance", description: "Reminder conversion by channel and service type.", stats: "34% booked after reminder", status: "Strong performance" },
];

const payments = [
  { month: "May 2026", plan: "Professional", amount: "₹12,000", status: "Paid" },
  { month: "Apr 2026", plan: "Professional", amount: "₹12,000", status: "Paid" },
  { month: "Mar 2026", plan: "Setup fee", amount: "₹5,000", status: "Paid" },
];

export default function WorkspacePage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [activeNav, setActiveNav] = useState<NavKey>("dashboard");
  const [newCallOpen, setNewCallOpen] = useState(false);
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (stored !== "complete") {
      router.replace("/auth?next=/workspace");
      return;
    }
    setAllowed(true);
  }, [router]);

  const quickActions = useMemo(
    () => [
      { label: "New Call", icon: PhoneCall, onClick: () => setNewCallOpen(true) },
      { label: "Add Client", icon: UserPlus, onClick: () => setAddClientOpen(true) },
      { label: "Add Service", icon: Package2, onClick: () => setSelectedService(services[0]) },
      { label: "Send Message", icon: MessageCircleMore, onClick: () => setActiveNav("ai-agent") },
    ],
    [],
  );

  if (!allowed) {
    return <main className="min-h-screen bg-[linear-gradient(180deg,#eef4ff_0%,#f7f9ff_45%,#eef3ff_100%)]" />;
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4f7ff_0%,#f8faff_48%,#eff4ff_100%)] pb-24 text-slate-950 lg:pb-8">
      <div className="mx-auto flex max-w-[1550px] gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <aside className="hidden w-[272px] shrink-0 rounded-[2rem] border border-slate-200/75 bg-white/88 p-4 shadow-[0_18px_70px_rgba(122,146,186,0.16)] backdrop-blur-xl lg:block">
          <div className="flex items-center gap-3 rounded-[1.6rem] px-3 py-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#070b22]">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">AI Receptionist POC</p>
              <p className="text-xs text-slate-500">Admin workspace</p>
            </div>
          </div>

          <nav className="mt-5 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveNav(item.key)}
                className={
                  activeNav === item.key
                    ? "flex w-full items-center gap-3 rounded-full bg-[#070b22] px-4 py-4 text-left text-white shadow-[0_14px_36px_rgba(15,23,42,0.14)]"
                    : "flex w-full items-center gap-3 rounded-full px-4 py-4 text-left text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                }
              >
                <item.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 rounded-[1.8rem] bg-[linear-gradient(180deg,#1d2143_0%,#153a66_100%)] p-5 text-white shadow-[0_22px_50px_rgba(30,64,175,0.2)]">
            <p className="text-lg font-semibold">Daily summary</p>
            <p className="mt-3 text-sm leading-7 text-white/70">View tasks, exports, and items that need attention.</p>
            <Button className="mt-6 h-11 w-full rounded-full bg-white text-slate-950 hover:bg-white/90">View summary</Button>
          </div>
        </aside>

        <section className="min-w-0 flex-1 space-y-5">
          <header className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-[1.55fr_0.75fr]">
              <Card className="overflow-hidden rounded-[2rem] border border-slate-200/70 !bg-[linear-gradient(120deg,#1d2045_0%,#1f244f_58%,#1f5f8e_100%)] text-white shadow-[0_22px_80px_rgba(38,66,136,0.24)]">
                <CardContent className="flex flex-wrap items-start justify-between gap-5 p-5 sm:p-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.36em] text-cyan-100/62">Realtime workspace</p>
                    <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">Aira Health Concierge</h1>
                    <p className="mt-2 text-sm text-white/66">Clinic Support · Mumbai, India · Business plan</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-white/88">12 agents live</Badge>
                    <Badge className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-white/88">Coverage 24/7</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border border-slate-200/75 bg-white/92 shadow-[0_18px_70px_rgba(122,146,186,0.16)]">
                <CardContent className="flex items-start justify-between gap-4 p-5 sm:p-6">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">Today&apos;s focus</p>
                    <p className="mt-3 max-w-xs text-sm leading-7 text-slate-500">Clear pending reminders and respond to missed enquiries faster.</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 text-sm font-semibold text-white">SV</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className="flex items-center justify-between rounded-[1.5rem] border border-slate-200/75 bg-white/92 px-4 py-4 text-left shadow-[0_18px_50px_rgba(122,146,186,0.12)] transition hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                      <action.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{action.label}</span>
                  </div>
                  <Plus className="h-4 w-4 text-slate-400" />
                </button>
              ))}
            </div>
          </header>

          <Tabs value={activeNav} onValueChange={(value) => setActiveNav(value as NavKey)}>
            {/* <div className="overflow-auto pb-1">
              <TabsList className="w-max min-w-full justify-start rounded-[1.4rem] bg-white/86 p-1 shadow-[0_12px_40px_rgba(122,146,186,0.1)]">
                {sidebarItems.map((item) => (
                  <TabsTrigger key={item.key} value={item.key} className="min-w-[112px] rounded-[1rem] px-4 py-2.5 data-[state=active]:bg-slate-950 data-[state=active]:text-white">
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div> */}

            <TabsContent value="dashboard" className="space-y-5">
            

              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {kpiCards.map((item) => (
                  <Card key={item.label} className="rounded-[1.8rem] border border-slate-200/75 bg-white/92 shadow-[0_18px_70px_rgba(122,146,186,0.14)]">
                    <CardContent className="p-5">
                      <div className={`h-1.5 w-full rounded-full bg-gradient-to-r ${item.tone}`} />
                      <div className="mt-4 flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-slate-500">{item.label}</p>
                          <p className="mt-3 text-4xl font-semibold leading-none text-slate-950 sm:text-5xl">{item.value}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                          <item.icon className="h-5 w-5" />
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-slate-500">{item.detail}</p>
                    </CardContent>
                  </Card>
                ))}
              </section>
            </TabsContent>

            <TabsContent value="ai-agent" className="space-y-5">
              <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
                <Card className="rounded-[1.9rem] border border-slate-200/75 bg-white/92">
                  <CardContent className="p-5 sm:p-6">
                    <PanelHeader icon={Bot} title="AI Receptionist Flow" subtitle="Voice agent and text agent modules with action-ready cards." />
                    <div className="mt-5">
                      <Tabs defaultValue="voice">
                        <TabsList className="grid w-full grid-cols-2 rounded-[1.4rem] bg-slate-100 p-1">
                          <TabsTrigger value="voice" className="rounded-[1rem] data-[state=active]:bg-white">Voice Agent</TabsTrigger>
                          <TabsTrigger value="text" className="rounded-[1rem] data-[state=active]:bg-white">Text Agent</TabsTrigger>
                        </TabsList>
                        <TabsContent value="voice">
                          <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            {voiceAgentCards.map((item) => (
                              <AgentCard key={item.title} {...item} />
                            ))}
                          </div>
                        </TabsContent>
                        <TabsContent value="text">
                          <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            {textAgentCards.map((item) => (
                              <AgentCard key={item.title} {...item} />
                            ))}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[1.9rem] border border-slate-200/75 bg-white/92">
                  <CardContent className="p-5 sm:p-6">
                    <PanelHeader icon={Workflow} title="Automation Snapshot" subtitle="Short mobile-first cards instead of a large flow diagram." />
                    <div className="mt-5 space-y-4">
                      {[
                        { title: "Follow-up Rescue", copy: "Missed call -> WhatsApp -> callback reminder", status: "Running" },
                        { title: "Feedback Loop", copy: "After service -> feedback message -> complaint tag", status: "Healthy" },
                        { title: "Report Notification", copy: "Report ready -> call + message + email", status: "Live" },
                      ].map((item) => (
                        <div key={item.title} className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                              <p className="mt-2 text-sm leading-7 text-slate-500">{item.copy}</p>
                            </div>
                            <Badge className="rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">{item.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="clients" className="space-y-5">
              <Card className="rounded-[1.9rem] border border-slate-200/75 bg-white/92">
                <CardContent className="p-5 sm:p-6">
                  <PanelHeader icon={Users2} title="Client Management" subtitle="Preferred contact details, optional guardian fields, and services taken." />
                  <div className="mt-5 grid gap-4 xl:grid-cols-2">
                    {clients.map((client) => (
                      <div key={client.email} className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold text-slate-900">{client.name}</p>
                            <p className="mt-1 text-xs text-slate-400">{client.age} · {client.gender}</p>
                          </div>
                          <Badge className="rounded-full border border-slate-200 bg-white text-slate-700">{client.preferredMode}</Badge>
                        </div>
                        <div className="mt-4 grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
                          <p>Email: {client.email}</p>
                          <p>Phone: {client.phone}</p>
                          <p>WhatsApp: {client.whatsapp}</p>
                          <p>Guardian: {client.guardian}</p>
                          <p>Preferred time: {client.preferredTime}</p>
                          <p>{client.occasion}</p>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {client.services.map((service) => (
                            <span key={service} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">{service}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="space-y-5">
              <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
                <Card className="rounded-[1.9rem] border border-slate-200/75 bg-white/92">
                  <CardContent className="p-5 sm:p-6">
                    <PanelHeader icon={Package2} title="Services" subtitle="Track service price, UUID, and stock or availability." />
                    <div className="mt-5 grid gap-4">
                      {services.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => setSelectedService(service)}
                          className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-4 text-left transition hover:-translate-y-0.5"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-base font-semibold text-slate-900">{service.name}</p>
                              <p className="mt-1 text-xs text-slate-400">{service.uuid}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                          </div>
                          <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                            <span>Price: {service.price}</span>
                            <span>Availability: {service.availability}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[1.9rem] border border-slate-200/75 bg-white/92">
                  <CardContent className="p-5 sm:p-6">
                    <PanelHeader icon={Settings2} title="Features & Integrations" subtitle="Simple SaaS cards for logic and target audience." />
                    <div className="mt-5 space-y-4">
                      <SectionLabel title="Features" />
                      {features.map((feature) => (
                        <ListCard key={feature.code} title={`${feature.code} ${feature.name}`} meta={feature.target} description={`${feature.purpose}. ${feature.logic}.`} />
                      ))}
                      <SectionLabel title="Service Integrations" />
                      {integrations.map((item) => (
                        <ListCard key={item.code} title={`${item.code} ${item.name}`} meta={item.customers} description={`${item.purpose}. ${item.logic}.`} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-5">
              <Card className="rounded-[1.9rem] border border-slate-200/75 bg-white/92">
                <CardContent className="p-5 sm:p-6">
                  <PanelHeader icon={ClipboardList} title="Reports Page" subtitle="Call summary, follow-up status, feedback analysis, and reminder performance." />
                  <div className="mt-5 grid gap-4 xl:grid-cols-2">
                    {reports.map((report) => (
                      <div key={report.id} className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-base font-semibold text-slate-900">{report.title}</p>
                            <p className="mt-2 text-sm leading-7 text-slate-500">{report.description}</p>
                          </div>
                          <Badge className="rounded-full border border-slate-200 bg-white text-slate-700">{report.status}</Badge>
                        </div>
                        <p className="mt-4 text-sm font-medium text-slate-800">{report.stats}</p>
                        <div className="mt-5 flex flex-wrap gap-2">
                          <Button size="sm" className="rounded-full bg-[#070b22] text-white hover:bg-[#111a37]" onClick={() => setSelectedReport(report)}>
                            Analysis
                          </Button>
                          <Button size="sm" variant="ghost" className="rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                            Export PDF
                          </Button>
                          <Button size="sm" variant="ghost" className="rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                            Transcript
                          </Button>
                          <Button size="sm" variant="ghost" className="rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                            Recording
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="business" className="space-y-5">
              <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                <Card className="rounded-[1.9rem] border border-slate-200/75 bg-white/92">
                  <CardContent className="p-5 sm:p-6">
                    <PanelHeader icon={BriefcaseBusiness} title="Business Profile" subtitle="Business info, in-charge contact, features, and billing details." />
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <InfoTile icon={Stethoscope} label="Business name" value="Aira Health Concierge" />
                      <InfoTile icon={ShieldCheck} label="In-charge person" value="Shivani Verma" />
                      <InfoTile icon={PhoneCall} label="Contact details" value="+91 98765 76124 · ops@airahealth.com" />
                      <InfoTile icon={CreditCard} label="Billing details" value="Professional Plan · Auto-debit enabled" />
                    </div>
                    <details className="mt-5 rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-4">
                      <summary className="cursor-pointer text-sm font-semibold text-slate-900">Features & services</summary>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {["Voice AI", "WhatsApp", "SMS", "Email", "CRM", "Reports", "Realtime transcript"].map((item) => (
                          <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">{item}</span>
                        ))}
                      </div>
                    </details>
                  </CardContent>
                </Card>

                <Card className="rounded-[1.9rem] border border-slate-200/75 bg-white/92">
                  <CardContent className="p-5 sm:p-6">
                    <PanelHeader icon={Receipt} title="Payment History" subtitle="Simple SaaS billing history for the POC." />
                    <div className="mt-5 space-y-4">
                      {payments.map((payment) => (
                        <div key={payment.month} className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{payment.month}</p>
                              <p className="mt-1 text-sm text-slate-500">{payment.plan}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-slate-900">{payment.amount}</p>
                              <p className="mt-1 text-xs text-emerald-700">{payment.status}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 px-3 py-2 shadow-[0_-12px_40px_rgba(148,163,184,0.12)] backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-6 gap-2">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveNav(item.key)}
              className="flex flex-col items-center gap-1 rounded-[1rem] px-2 py-2 text-[11px] font-medium"
            >
              <div className={activeNav === item.key ? "flex h-10 w-10 items-center justify-center rounded-2xl bg-[#070b22] text-white" : "flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"}>
                <item.icon className="h-4 w-4" />
              </div>
              <span className={activeNav === item.key ? "text-slate-950" : "text-slate-500"}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={newCallOpen} onOpenChange={setNewCallOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start a new AI call</DialogTitle>
            <DialogDescription>Create an outgoing call for reminder, report status, or feedback follow-up.</DialogDescription>
          </DialogHeader>
          <div className="mt-5 space-y-4">
            <Input placeholder="Client or phone number" />
            <Input placeholder="Call purpose" />
            <Input placeholder="Preferred time slot" />
            <Button className="h-11 w-full rounded-full bg-[#5b49e8] text-white hover:bg-[#5341de]">Create call</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={addClientOpen} onOpenChange={setAddClientOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add new client</DialogTitle>
            <DialogDescription>Capture contact details, guardian info, and preferred communication choices.</DialogDescription>
          </DialogHeader>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Input placeholder="Full name" />
            <Input placeholder="Age" />
            <Input placeholder="Gender" />
            <Input placeholder="Email" />
            <Input placeholder="WhatsApp" />
            <Input placeholder="Phone" />
            <Input placeholder="Guardian details (optional)" className="sm:col-span-2" />
            <Input placeholder="Preferred contact time" />
            <Input placeholder="Preferred contact mode" />
            <Input placeholder="Services taken" className="sm:col-span-2" />
            <Input placeholder="Birthday / anniversary" className="sm:col-span-2" />
            <Button className="h-11 rounded-full bg-[#5b49e8] text-white hover:bg-[#5341de] sm:col-span-2">Save client</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedReport)} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
            <DialogDescription>{selectedReport?.description}</DialogDescription>
          </DialogHeader>
          <div className="mt-5 space-y-4">
            <ReportInsight label="Key metric" value={selectedReport?.stats || "-"} />
            <ReportInsight label="AI analysis" value="Follow-up reminders are performing best over WhatsApp between 5 PM and 8 PM." />
            <ReportInsight label="Recommended next step" value="Reschedule low-response reminders and move complaint outreach to voice + human review." />
          </div>
        </DialogContent>
      </Dialog>

      {selectedService && (
        <div className="fixed inset-0 z-50">
          <button type="button" aria-label="Close service drawer" className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm" onClick={() => setSelectedService(null)} />
          <aside className="absolute inset-x-0 bottom-0 max-h-[84vh] rounded-t-[2rem] border border-slate-200 bg-white p-5 shadow-[0_-20px_60px_rgba(15,23,42,0.18)] lg:inset-y-0 lg:right-0 lg:left-auto lg:w-[420px] lg:rounded-none lg:rounded-l-[2rem]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Service details</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">{selectedService.name}</h3>
              </div>
              <button type="button" onClick={() => setSelectedService(null)} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <DrawerMetric label="UUID" value={selectedService.uuid} />
              <DrawerMetric label="Price" value={selectedService.price} />
              <DrawerMetric label="Availability" value={selectedService.availability} />
              <DrawerMetric label="Purpose" value={selectedService.purpose} />
              <DrawerMetric label="Logic" value={selectedService.logic} />
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Customers</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedService.customers.map((customer) => (
                    <span key={customer} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">{customer}</span>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

function PanelHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof BarChart3;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function AgentCard({
  title,
  status,
  description,
  icon: Icon,
  cta,
}: {
  title: string;
  status: string;
  description: string;
  icon: typeof PhoneCall;
  cta: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <Badge className="rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">{status}</Badge>
      </div>
      <p className="mt-4 text-base font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-7 text-slate-500">{description}</p>
      <Button size="sm" className="mt-4 rounded-full bg-[#070b22] text-white hover:bg-[#111a37]">{cta}</Button>
    </div>
  );
}

function SectionLabel({ title }: { title: string }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">{title}</p>;
}

function ListCard({
  title,
  meta,
  description,
}: {
  title: string;
  meta: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-2 text-sm leading-7 text-slate-500">{description}</p>
        </div>
        <Badge className="rounded-full border border-slate-200 bg-white text-slate-700">{meta}</Badge>
      </div>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BriefcaseBusiness;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-7 text-slate-900">{value}</p>
    </div>
  );
}

function ReportInsight({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-7 text-slate-900">{value}</p>
    </div>
  );
}

function DrawerMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-7 text-slate-900">{value}</p>
    </div>
  );
}
