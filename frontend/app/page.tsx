"use client";

import type { ComponentType, ReactNode } from "react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileBarChart2,
  HeartPulse,
  Hospital,
  Mail,
  MessageCircleMore,
  Mic,
  PhoneCall,
  Radio,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Store,
  UserRoundSearch,
  Users2,
  Waves,
  Workflow,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const HeroScene = dynamic(() => import("@/components/landing/hero-scene").then((mod) => mod.HeroScene), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.26),transparent_30%),radial-gradient(circle_at_center,rgba(34,211,238,0.18),transparent_48%)]" />,
});

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Demo", href: "#live-demo" },
  { label: "Pricing", href: "#pricing" },
];

const painPoints = [
  { title: "Missed customer calls", text: "Leads arrive after hours, during rush times, or when front-desk staff are busy.", icon: PhoneCall },
  { title: "Delayed follow-ups", text: "Reminder calls and report updates slip when teams rely on manual lists.", icon: CalendarClock },
  { title: "Repetitive questions", text: "Staff keep answering the same status, timing, and booking questions all day.", icon: MessageCircleMore },
  { title: "Staff overload", text: "Reception teams juggle calls, messages, CRM updates, and daily exceptions together.", icon: Users2 },
  { title: "Scattered communication", text: "Calls, WhatsApp, SMS, email, and CRM notes rarely stay in one clean timeline.", icon: Workflow },
];

const flowSteps = [
  { step: "01", title: "Customer calls or messages", text: "Voice, WhatsApp, SMS, and email requests enter the same AI front desk.", icon: Radio },
  { step: "02", title: "AI understands intent", text: "The assistant detects booking, report, reminder, pricing, and support intent in real time.", icon: BrainCircuit },
  { step: "03", title: "AI responds on the right channel", text: "Voice replies, chat responses, follow-up messages, and reminders are handled automatically.", icon: Sparkles },
  { step: "04", title: "CRM and reports update", text: "Transcripts, summaries, reminders, CRM notes, and dashboards stay in sync for the team.", icon: ClipboardList },
];

const featureCards = [
  { title: "AI Voice Agent", text: "Handle incoming calls, reminders, feedback calls, and realtime voice conversations.", icon: Mic },
  { title: "WhatsApp Automation", text: "Send confirmations, reminders, and follow-ups with a clean customer timeline.", icon: MessageCircleMore },
  { title: "SMS & Email", text: "Cover every important touchpoint without forcing the team into manual sends.", icon: Mail },
  { title: "Client CRM", text: "Keep notes, services, preferred contact times, and communication history in one place.", icon: UserRoundSearch },
  { title: "Smart Automations", text: "Trigger reminders, birthday wishes, report-ready notifications, and follow-up sequences.", icon: Workflow },
  { title: "Live Transcript", text: "See conversations appear live with searchable voice and messaging history.", icon: ScanLine },
  { title: "AI Summary", text: "Capture intent, follow-up suggestions, sentiment, and key points after every interaction.", icon: Bot },
  { title: "Reports & Analytics", text: "Track call trends, message performance, automation health, and service-team activity.", icon: FileBarChart2 },
];

const industries = [
  { title: "Clinics", icon: Stethoscope },
  { title: "Path Labs", icon: ScanLine },
  { title: "Hospitals", icon: Hospital },
  { title: "Salons", icon: Sparkles },
  { title: "Coaching Institutes", icon: Building2 },
  { title: "Real Estate", icon: Building2 },
  { title: "Restaurants", icon: Store },
  { title: "Service Businesses", icon: ShieldCheck },
];

const benefits = [
  "Never miss a lead",
  "Save staff time",
  "Improve customer experience",
  "Automate reminders",
  "Increase follow-ups",
  "Get AI insights",
];

const trustLogos = [
  "Gemini AI",
  "Deepgram STT/TTS",
  "Twilio Voice",
  "WhatsApp",
  "Secure CRM",
  "Reports",
];

const pricingCards = [
  { name: "Starter", note: "Coming Soon", details: "For lean teams that want AI call handling and reminders." },
  { name: "Professional", note: "Custom Pricing", details: "For growing businesses managing calls, CRM, and multichannel communication." },
  { name: "Enterprise", note: "Custom Pricing", details: "For high-volume teams that want white-label, advanced routing, and dedicated workflows." },
];

const demoTranscript = [
  { speaker: "Customer", text: "Is my report ready?" },
  { speaker: "AI", text: "Yes, your report is ready. Would you like to visit tomorrow?" },
  { speaker: "System", text: "AI summary generated: Customer confirmed a report pickup for tomorrow." },
  { speaker: "WhatsApp", text: "Reminder sent: We have reserved your report pickup window for tomorrow." },
];

export default function HomePage() {
  const [typedLines, setTypedLines] = useState<string[]>(demoTranscript.map(() => ""));
  const [activeDemoIndex, setActiveDemoIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let lineIndex = 0;
    let charIndex = 0;
    const timeouts = new Set<ReturnType<typeof setTimeout>>();

    const schedule = (callback: () => void, delay: number) => {
      const timeoutId = setTimeout(() => {
        timeouts.delete(timeoutId);
        callback();
      }, delay);

      timeouts.add(timeoutId);
    };

    // This loops the fake conversation so the demo panel always feels active on first view.
    const tick = () => {
      if (cancelled) {
        return;
      }

      const currentLine = demoTranscript[lineIndex];
      if (!currentLine) {
        lineIndex = 0;
        charIndex = 0;
        setTypedLines(demoTranscript.map(() => ""));
        setActiveDemoIndex(0);
        schedule(tick, 550);
        return;
      }

      setTypedLines((current) => {
        const next = [...current];
        next[lineIndex] = currentLine.text.slice(0, charIndex + 1);
        return next;
      });

      charIndex += 1;

      if (charIndex >= currentLine.text.length) {
        setActiveDemoIndex(lineIndex);
        lineIndex += 1;
        charIndex = 0;

        if (lineIndex >= demoTranscript.length) {
          schedule(() => {
            if (!cancelled) {
              setTypedLines(demoTranscript.map(() => ""));
              setActiveDemoIndex(0);
              lineIndex = 0;
              charIndex = 0;
              schedule(tick, 550);
            }
          }, 1500);
          return;
        }

        schedule(tick, 450);
        return;
      }

      schedule(tick, 28);
    };

    schedule(tick, 600);

    return () => {
      cancelled = true;
      for (const timeoutId of timeouts) {
        clearTimeout(timeoutId);
      }
      timeouts.clear();
    };
  }, []);

  return (
    <main className="overflow-x-hidden bg-[#050816] text-white">
      <div className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-slate-950/55 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#hero" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 shadow-[0_16px_38px_rgba(124,58,237,0.35)]">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-white">AI Receptionist</p>
              <p className="text-xs text-white/55">Calls, chats, follow-ups</p>
            </div>
          </a>

          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-white/70 transition hover:text-white">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 md:inline-flex">
              <Link href="/auth?mode=signup">Login / Signup</Link>
            </Button>
            <Button asChild variant="ghost" className="hidden rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 md:inline-flex">
              <a href="mailto:hello@aireceptionist.demo">Contact Us</a>
            </Button>
            <Button asChild className="rounded-full bg-white text-slate-950 shadow-[0_16px_36px_rgba(255,255,255,0.15)] hover:bg-white/90">
              <Link href="/auth">Book Demo</Link>
            </Button>
          </div>
        </div>
      </div>

      <section id="hero" className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.16),transparent_18%),radial-gradient(circle_at_82%_18%,rgba(139,92,246,0.18),transparent_22%),linear-gradient(180deg,#050816_0%,#081122_45%,#0b1330_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.03),transparent_35%,rgba(255,255,255,0.05),transparent_72%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <Reveal className="space-y-7">
            <Badge className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.18)]">
              Premium AI Front Desk for modern businesses
            </Badge>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Your AI Receptionist for Calls, Chats &amp; Follow-ups
              </h1>
              <p className="max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
                Answer customer calls, send WhatsApp reminders, manage CRM, and automate follow-ups 24/7 with an intelligent AI receptionist.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 rounded-full bg-white px-6 text-sm font-semibold text-slate-950 hover:bg-white/90">
                <Link href="/auth">
                  Book a Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" className="h-12 rounded-full border border-white/10 bg-white/5 px-6 text-sm text-white hover:bg-white/10">
                <Link href="/workspace">Try Live Demo</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <MetricTile label="Calls answered" value="24/7" />
              <MetricTile label="Channels synced" value="Voice + chat" />
              <MetricTile label="CRM updates" value="Instant" />
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="relative mx-auto w-full max-w-[640px] rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-[0_30px_120px_rgba(76,29,149,0.35)] backdrop-blur-2xl">
              <div className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#050816]">
                <div className="relative h-[540px] sm:h-[620px]">
                  <HeroScene />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_34%,rgba(5,8,22,0.46)_74%,rgba(5,8,22,0.88)_100%)]" />

                  <FloatingCard className="left-3 top-4 w-[180px] sm:left-6 sm:top-6 sm:w-[220px]" delay={0.2}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Realtime call</p>
                        <h3 className="mt-2 text-sm font-semibold text-white sm:text-base">Incoming report query</h3>
                      </div>
                      <PhoneCall className="h-4 w-4 text-cyan-300" />
                    </div>
                    <div className="mt-4 flex items-end gap-1.5">
                      {Array.from({ length: 12 }).map((_, index) => (
                        <motion.span
                          key={index}
                          className="voice-bar w-1.5 rounded-full bg-gradient-to-t from-cyan-400 to-violet-400"
                          animate={{ height: [12, 28 + (index % 4) * 8, 12] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.08 }}
                        />
                      ))}
                    </div>
                  </FloatingCard>

                  <FloatingCard className="right-3 top-8 w-[160px] sm:right-6 sm:w-[200px]" delay={0.3}>
                    <p className="text-xs uppercase tracking-[0.24em] text-fuchsia-200/70">WhatsApp</p>
                    <p className="mt-3 text-sm text-white/80">Reminder sent for tomorrow&apos;s 11:00 AM pickup.</p>
                    <div className="mt-4 rounded-2xl bg-emerald-400/15 px-3 py-2 text-xs text-emerald-200">
                      Delivered in 12 sec
                    </div>
                  </FloatingCard>

                  <FloatingCard className="bottom-6 left-3 w-[170px] sm:left-6 sm:w-[210px]" delay={0.4}>
                    <p className="text-xs uppercase tracking-[0.24em] text-violet-200/70">CRM memory</p>
                    <p className="mt-3 text-sm text-white">Preferred contact: WhatsApp after 5 PM</p>
                    <p className="mt-2 text-xs text-white/55">Client note saved automatically</p>
                  </FloatingCard>

                  <FloatingCard className="bottom-6 right-3 w-[190px] sm:right-6 sm:w-[240px]" delay={0.5}>
                    <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">AI transcript</p>
                    <p className="mt-3 text-sm leading-6 text-white/80">
                      “Yes, your report is ready. Would you like to visit tomorrow?”
                    </p>
                  </FloatingCard>

                  <motion.div
                    animate={{ y: [0, -10, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[25%] left-1/2 z-20 w-[180px] -translate-x-1/2 rounded-[2rem] border border-white/15 bg-slate-950/65 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.65)] backdrop-blur-xl sm:w-[220px]"
                  >
                    <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-b from-slate-600 to-slate-600 p-2 text-slate-900">
                      <div className="rounded-[1.25rem] bg-[#0b1020] p-3 text-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500" />
                            <div>
                              <p className="text-xs text-white/55">AI Receptionist</p>
                              <p className="text-sm font-medium">Live conversation</p>
                            </div>
                          </div>
                          <HeartPulse className="h-4 w-4 text-cyan-300" />
                        </div>
                        <div className="mt-4 rounded-2xl bg-white/8 p-3 text-xs text-white/70">
                          Transcript and call summary updating in real time.
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <SectionShell id="problem" eyebrow="The problem" title="Customer communication breaks when teams depend on manual handoffs.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {painPoints.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.05}>
              <Card className="h-full rounded-[1.75rem] !border-white/12 !bg-[linear-gradient(180deg,rgba(17,24,39,0.88),rgba(10,14,28,0.78))] text-white shadow-[0_18px_60px_rgba(2,6,23,0.42)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:!border-fuchsia-300/30 hover:!bg-[linear-gradient(180deg,rgba(24,32,53,0.92),rgba(12,17,33,0.82))]">
                <CardContent className="space-y-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-fuchsia-300/12 bg-gradient-to-br from-fuchsia-500/20 to-violet-500/14 shadow-[0_10px_30px_rgba(168,85,247,0.18)]">
                    <item.icon className="h-5 w-5 text-fuchsia-100/95" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <p className="text-sm leading-6 text-slate-300">{item.text}</p>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="how-it-works" eyebrow="How it works" title="A simple communication loop that feels effortless to the customer and clean to the team.">
        <div className="grid gap-4 lg:grid-cols-4">
          {flowSteps.map((item, index) => (
            <Reveal key={item.step} delay={index * 0.08}>
              <div className="relative h-full rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-6 backdrop-blur-xl">
                {index < flowSteps.length - 1 && (
                  <div className="absolute -right-2 top-12 hidden h-px w-8 bg-gradient-to-r from-violet-400/70 to-transparent lg:block" />
                )}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">{item.step}</span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/8">
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                  <p className="text-sm leading-6 text-white/65">{item.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="features" eyebrow="Features" title="Everything the team needs to run communication ops from one intelligent workspace.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.05}>
              <div className="group relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-white/8">
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-cyan-400/12 via-violet-500/0 to-fuchsia-500/12 opacity-0 transition duration-300 group-hover:opacity-100" />
                <div className="relative space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 text-cyan-50">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <p className="text-sm leading-6 text-white/64">{item.text}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-cyan-200/80">
                    Explore capability
                    <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="live-demo" eyebrow="Live demo simulation" title="See one conversation turn into transcript, summary, reminder, and CRM context automatically.">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <Reveal>
            <div className="rounded-[2rem] border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(7,17,35,0.98),rgba(9,16,34,0.9))] p-6 shadow-[0_24px_90px_rgba(8,145,178,0.18)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">Conversation feed</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">AI receptionist in action</h3>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs text-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  Live simulation
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {demoTranscript.map((line, index) => (
                  <motion.div
                    key={line.speaker}
                    animate={{ opacity: typedLines[index] ? 1 : 0.55, scale: activeDemoIndex === index ? 1.01 : 1 }}
                    className={cn(
                      "rounded-[1.6rem] border px-4 py-4 transition",
                      line.speaker === "Customer" && "border-white/10 bg-white/6",
                      line.speaker === "AI" && "border-cyan-300/20 bg-cyan-400/10",
                      line.speaker === "System" && "border-violet-300/20 bg-violet-500/10",
                      line.speaker === "WhatsApp" && "border-emerald-300/20 bg-emerald-400/10",
                    )}
                  >
                    <p className="text-xs uppercase tracking-[0.24em] text-white/45">{line.speaker}</p>
                    <p className="mt-3 min-h-10 text-sm leading-6 text-white/86">{typedLines[index] || "..."}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <div className="grid gap-4">
              <GlassInsightCard
                title="AI summary"
                icon={Bot}
                text="Customer checked report status and agreed to pick it up tomorrow."
              />
              <GlassInsightCard
                title="CRM update"
                icon={ClipboardList}
                text="Pickup preference saved. Follow-up reminder scheduled for 9:30 AM."
              />
              <GlassInsightCard
                title="WhatsApp action"
                icon={MessageCircleMore}
                text="Reminder message created and delivered with report collection instructions."
              />
            </div>
          </Reveal>
        </div>
      </SectionShell>

      <SectionShell id="industries" eyebrow="Industries" title="Designed for service teams that live on customer communication.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {industries.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.04}>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/6 p-5 text-white backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/8">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
              </div>
            </Reveal>
          ))}
        </div>
      </SectionShell>

      <section className="relative px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2.2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 backdrop-blur-2xl lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <Reveal>
              <div className="space-y-4">
                <Badge className="rounded-full border border-violet-300/20 bg-violet-400/10 text-violet-100">Business benefits</Badge>
                <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  A calmer front desk, faster follow-ups, and better customer communication.
                </h2>
                <p className="max-w-xl text-sm leading-7 text-white/68 sm:text-base">
                  AI Receptionist helps teams respond faster, stay consistent, and turn every interaction into a useful record.
                </p>
              </div>
            </Reveal>

            <div className="grid gap-3 sm:grid-cols-2">
              {benefits.map((item, index) => (
                <Reveal key={item} delay={index * 0.05}>
                  <div className="flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/6 px-4 py-4">
                    <CheckCircle2 className="h-5 w-5 text-cyan-300" />
                    <span className="text-sm font-medium text-white">{item}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionShell id="trust" eyebrow="Tech stack" title="Built on modern AI and communication infrastructure your team can trust.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trustLogos.map((item, index) => (
            <Reveal key={item} delay={index * 0.04}>
              <div className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/6 px-5 py-4 backdrop-blur-xl">
                <span className="text-sm font-medium text-white">{item}</span>
                <ShieldCheck className="h-4 w-4 text-cyan-300" />
              </div>
            </Reveal>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="pricing" eyebrow="Pricing preview" title="Choose the rollout path that fits your team and communication volume.">
        <div className="grid gap-4 lg:grid-cols-3">
          {pricingCards.map((item, index) => (
            <Reveal key={item.name} delay={index * 0.05}>
              <div className={cn("rounded-[2rem] border p-6 backdrop-blur-xl", index === 1 ? "border-cyan-300/30 bg-cyan-400/10" : "border-white/10 bg-white/6")}>
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-white">{item.name}</h3>
                  <Badge className="rounded-full border border-white/10 bg-white/8 text-white/86">{item.note}</Badge>
                </div>
                <p className="mt-4 text-sm leading-6 text-white/66">{item.details}</p>
                <div className="mt-8 rounded-[1.4rem] border border-dashed border-white/10 bg-black/15 p-4 text-sm text-white/60">
                  Pricing, limits, and onboarding support can be customized for your rollout.
                </div>
                <Button asChild className="mt-6 h-11 w-full rounded-full bg-white text-slate-950 hover:bg-white/90">
                  <Link href="/auth">Talk to Sales</Link>
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </SectionShell>

      <section className="relative px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(124,58,237,0.22),rgba(255,255,255,0.08))] p-8 shadow-[0_30px_120px_rgba(14,165,233,0.15)] backdrop-blur-2xl sm:p-10 lg:p-14">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-5">
                <Badge className="rounded-full border border-white/15 bg-white/10 text-white">Final CTA</Badge>
                <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                  Ready to give your business a 24/7 AI receptionist?
                </h2>
                <p className="max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
                  Launch a smarter front desk for calls, WhatsApp, reminders, CRM updates, and realtime customer conversations.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild className="h-12 rounded-full bg-white px-6 text-slate-950 hover:bg-white/90">
                    <Link href="/auth">
                      Book Demo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="h-12 rounded-full border border-white/15 bg-white/8 px-6 text-white hover:bg-white/12">
                    <a href="mailto:hello@aireceptionist.demo">Contact Us</a>
                  </Button>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-4 text-white/82">
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/65">Realtime voice</p>
                  <p className="mt-2 text-sm">Streaming transcription, AI reply, and voice response in one live call flow.</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-4 text-white/82">
                  <p className="text-xs uppercase tracking-[0.28em] text-violet-200/65">Automation engine</p>
                  <p className="mt-2 text-sm">Reminders, report-ready alerts, feedback requests, and follow-ups built into the same platform.</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionShell({
  children,
  eyebrow,
  id,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  id: string;
  title: string;
}) {
  return (
    <section id={id} className="relative px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <Reveal className="space-y-4">
          <Badge className="rounded-full border border-white/10 bg-white/6 text-white/85">{eyebrow}</Badge>
          <h2 className="max-w-4xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
        </Reveal>
        {children}
      </div>
    </section>
  );
}

function FloatingCard({
  children,
  className,
  delay,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: [0, -8, 0] }}
      transition={{
        opacity: { duration: 0.6, delay },
        y: { duration: 4 + (delay ?? 0), repeat: Infinity, ease: "easeInOut", delay },
      }}
      className={cn("absolute z-20 rounded-[1.6rem] border border-white/10 bg-slate-950/55 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.55)] backdrop-blur-xl", className)}
    >
      {children}
    </motion.div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.55rem] border border-white/10 bg-white/6 p-4 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.24em] text-white/45">{label}</p>
      <p className="mt-3 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function GlassInsightCard({
  icon: Icon,
  title,
  text,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[1.8rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/66">{text}</p>
    </div>
  );
}
