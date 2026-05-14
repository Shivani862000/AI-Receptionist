"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, BarChart3, BriefcaseBusiness, ChevronRight, ClipboardList, MessageCircleMore, Mic, PhoneCall, Sparkles, Users2, WandSparkles, Workflow } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { activity, aiSummary, businessProfile, channelPerformance, clients, metrics, quickActions, textThreads, voiceCalls, automations } from "@/lib/mock-data";

const ONBOARDING_STORAGE_KEY = "ai-receptionist-demo-auth";

const navItems = [
  { label: "Dashboard", icon: BarChart3, active: true },
  { label: "AI Agent", icon: Sparkles, active: false },
  { label: "Clients", icon: Users2, active: false },
  { label: "Flows", icon: WandSparkles, active: false },
  { label: "Reports", icon: ClipboardList, active: false },
];

export default function WorkspacePage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (stored !== "complete") {
      router.replace("/auth?next=/workspace");
      return;
    }
    setAllowed(true);
  }, [router]);

  if (!allowed) {
    return <main className="min-h-screen bg-[linear-gradient(180deg,#eef4ff_0%,#f7f9ff_45%,#eef3ff_100%)]" />;
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef4ff_0%,#f7f9ff_45%,#eef3ff_100%)] px-4 py-5 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1500px] gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-slate-200/70 bg-white/88 p-4 shadow-[0_18px_70px_rgba(122,146,186,0.18)] backdrop-blur-xl">
          <div className="flex items-center gap-3 rounded-[1.6rem] px-3 py-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#060b1f] shadow-[0_14px_34px_rgba(15,23,42,0.18)]">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{businessProfile.name}</p>
              <p className="text-xs text-slate-500">Customer communication</p>
            </div>
          </div>

          <nav className="mt-5 space-y-2">
            {navItems.map((item) => (
              <div
                key={item.label}
                className={item.active
                  ? "flex items-center gap-3 rounded-full bg-[#060b1f] px-4 py-4 text-white shadow-[0_14px_36px_rgba(15,23,42,0.14)]"
                  : "flex items-center gap-3 rounded-full px-4 py-4 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"}
              >
                <item.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </nav>

          <div className="mt-8 rounded-[1.8rem] bg-[linear-gradient(180deg,#1d2143_0%,#153a66_100%)] p-5 text-white shadow-[0_22px_50px_rgba(30,64,175,0.2)]">
            <p className="text-lg font-semibold">Daily summary</p>
            <p className="mt-3 text-sm leading-7 text-white/70">View key updates, exports, and items that need attention.</p>
            <Button className="mt-6 h-11 w-full rounded-full bg-white text-slate-950 hover:bg-white/90">
              View summary
            </Button>
          </div>
        </aside>

        <section className="space-y-5">
          <div className="grid gap-4 xl:grid-cols-[1.55fr_0.75fr]">
            <Card className="overflow-hidden rounded-[2rem] border border-slate-200/70 !bg-[linear-gradient(120deg,#1d2045_0%,#1f244f_58%,#1f5f8e_100%)] text-white shadow-[0_22px_80px_rgba(38,66,136,0.24)]">
              <CardContent className="flex flex-wrap items-start justify-between gap-5 p-5 sm:p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.36em] text-cyan-100/62">Realtime workspace</p>
                  <h1 className="mt-3 text-3xl font-semibold">{businessProfile.name}</h1>
                  <p className="mt-2 text-sm text-white/66">
                    {businessProfile.category} · {businessProfile.location} · {businessProfile.plan}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-white/88">12 agents live</Badge>
                  <Badge className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-white/88">Coverage {businessProfile.aiCoverage}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border border-slate-200/70 bg-white/90 shadow-[0_18px_70px_rgba(122,146,186,0.18)]">
              <CardContent className="flex items-start justify-between gap-4 p-5 sm:p-6">
                <div>
                  <p className="text-lg font-semibold text-slate-900">Today&apos;s focus</p>
                  <p className="mt-3 max-w-xs text-sm leading-7 text-slate-500">Clear pending reminders and reply to missed enquiries faster.</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(79,70,229,0.22)]">
                  SV
                </div>
              </CardContent>
            </Card>
          </div>

          <section className="rounded-[2rem] bg-[linear-gradient(145deg,#25285b_0%,#151a41_45%,#16375d_100%)] p-5 text-white shadow-[0_26px_90px_rgba(15,23,42,0.26)] sm:p-6">
            <div className="grid gap-6 xl:grid-cols-[1fr_0.74fr]">
              <div>
                <p className="text-sm font-semibold text-white/92">Overview</p>
                <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight">
                  Manage customer calls, messages, reminders, and reports from one workspace.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/68">
                  This demo shows how a small support team can handle daily communication and follow-ups in one app.
                </p>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {channelPerformance.slice(0, 3).map((item) => (
                    <div key={item.label} className="rounded-[1.7rem] border border-white/8 bg-white/7 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
                      <p className="text-xs uppercase tracking-[0.34em] text-white/36">{item.label}</p>
                      <p className="mt-4 text-4xl font-semibold">{item.value}</p>
                      <p className="mt-2 text-sm leading-6 text-white/45">{item.detail}</p>
                    </div>
                  ))}

                  <div className="rounded-[1.7rem] border border-white/8 bg-white/7 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl md:max-w-[285px]">
                    <p className="text-xs uppercase tracking-[0.34em] text-white/36">{channelPerformance[3]?.label}</p>
                    <p className="mt-4 text-4xl font-semibold">{channelPerformance[3]?.value}</p>
                    <p className="mt-2 text-sm leading-6 text-white/45">{channelPerformance[3]?.detail}</p>
                  </div>
                </div>
              </div>

              <aside className="rounded-[1.9rem] border border-white/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.08))] p-5 shadow-[0_20px_80px_rgba(10,20,60,0.18)] backdrop-blur-2xl">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-cyan-200" />
                  <p className="text-2xl font-semibold">AI summary widget</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/62">Simple suggestions based on recent calls and messages.</p>

                <div className="mt-6 rounded-[1.6rem] border border-white/25 bg-white/6 p-4">
                  <p className="text-2xl leading-10 text-white">{aiSummary.headline}</p>
                  <p className="mt-4 text-sm leading-7 text-white/62">{aiSummary.body}</p>
                </div>

                <div className="mt-5 space-y-3">
                  {aiSummary.focus.map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-full border border-white/28 bg-white/5 px-4 py-3 text-sm text-white/88">
                      <Sparkles className="h-4 w-4 text-cyan-200" />
                      {item}
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {metrics.map((item) => (
              <Card key={item.label} className="rounded-[1.8rem] border border-slate-200/75 bg-white/92 shadow-[0_18px_70px_rgba(122,146,186,0.16)]">
                <CardContent className="p-5">
                  <div className={`h-1.5 w-full rounded-full bg-gradient-to-r ${item.tone}`} />
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500">{item.label}</p>
                      <p className="mt-3 text-5xl font-semibold leading-none text-slate-950">{item.value}</p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-700">{item.delta}</span>
                  </div>
                  <p className="mt-4 text-sm text-slate-500">{item.helper}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-[1.9rem] border border-slate-200/75 bg-white/92 shadow-[0_18px_70px_rgba(122,146,186,0.16)]">
              <CardContent className="p-5 sm:p-6">
                <PanelHeader icon={Activity} title="Recent activity" action="Open timeline" />
                <div className="mt-5 space-y-4">
                  {activity.map((item) => (
                    <div key={item.title} className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                          <p className="mt-2 text-sm leading-7 text-slate-500">{item.detail}</p>
                        </div>
                        <span className="text-xs text-slate-400">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[1.9rem] border border-slate-200/75 bg-white/92 shadow-[0_18px_70px_rgba(122,146,186,0.16)]">
              <CardContent className="p-5 sm:p-6">
                <PanelHeader icon={Workflow} title="Quick actions" action="Manage all" />
                <div className="mt-5 space-y-4">
                  {quickActions.map((item) => (
                    <div key={item.title} className="flex items-start justify-between gap-4 rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 p-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-2 text-sm leading-7 text-slate-500">{item.description}</p>
                      </div>
                      <Button size="sm" className="rounded-full bg-[#060b1f] text-white hover:bg-[#111a37]">
                        {item.action}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
            <Card className="rounded-[1.9rem] border border-slate-200/75 bg-white/92 shadow-[0_18px_70px_rgba(122,146,186,0.16)]">
              <CardContent className="p-5 sm:p-6">
                <PanelHeader icon={PhoneCall} title="Voice calls" action="See calls" />
                <div className="mt-5 space-y-4">
                  {voiceCalls.slice(0, 3).map((call) => (
                    <div key={call.id} className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{call.customer}</p>
                          <p className="mt-1 text-xs text-slate-400">{call.type} · {call.timestamp}</p>
                        </div>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">{call.duration}</span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-500">{call.preview}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[1.9rem] border border-slate-200/75 bg-white/92 shadow-[0_18px_70px_rgba(122,146,186,0.16)]">
              <CardContent className="p-5 sm:p-6">
                <PanelHeader icon={MessageCircleMore} title="Messages" action="Open inbox" />
                <div className="mt-5 space-y-4">
                  {textThreads.map((thread) => (
                    <div key={thread.id} className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{thread.customer}</p>
                          <p className="mt-1 text-xs text-slate-400">{thread.channel} · {thread.lastUpdated}</p>
                        </div>
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">{thread.status}</span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-500">{thread.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
            <Card className="rounded-[1.9rem] border border-slate-200/75 bg-white/92 shadow-[0_18px_70px_rgba(122,146,186,0.16)]">
              <CardContent className="p-5 sm:p-6">
                <PanelHeader icon={BriefcaseBusiness} title="Client CRM" action="View clients" />
                <div className="mt-5 space-y-4">
                  {clients.slice(0, 3).map((client) => (
                    <div key={client.email} className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{client.name}</p>
                          <p className="mt-1 text-xs text-slate-400">{client.stage} · {client.preferredMode}</p>
                        </div>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">{client.lastContact}</span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-500">{client.notes}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[1.9rem] border border-slate-200/75 bg-white/92 shadow-[0_18px_70px_rgba(122,146,186,0.16)]">
              <CardContent className="p-5 sm:p-6">
                <PanelHeader icon={Sparkles} title="Automations" action="Open flows" />
                <div className="mt-5 grid gap-4">
                  {automations.map((automation) => (
                    <div key={automation.title} className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{automation.title}</p>
                          <p className="mt-1 text-sm text-slate-500">{automation.description}</p>
                        </div>
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">{automation.health}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}

function PanelHeader({
  icon: Icon,
  title,
  action,
}: {
  icon: typeof Activity;
  title: string;
  action: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      </div>
      <Button variant="ghost" className="rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
        {action}
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}
