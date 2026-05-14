"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Bot, Building2, CheckCircle2, ChevronDown, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authMoments, businessProfile } from "@/lib/mock-data";

const ONBOARDING_STORAGE_KEY = "ai-receptionist-demo-auth";

type StepKey = "login" | "otp" | "onboarding";
type AuthMode = "login" | "signup";

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthContent />
    </Suspense>
  );
}

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<StepKey>("login");
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("ops@airahealth.com");
  const [phone, setPhone] = useState("+91 98765 76124");
  const [otp, setOtp] = useState("2468");
  const [businessName, setBusinessName] = useState(businessProfile.name);
  const [plan, setPlan] = useState("Professional");
  const [instructions, setInstructions] = useState("Send a WhatsApp message after missed calls, keep replies short, and assign unhappy customers to a team member.");
  const [submitting, setSubmitting] = useState(false);
  const nextHref = searchParams?.get("next") || "/workspace";

  useEffect(() => {
    const requestedMode = searchParams?.get("mode");
    if (requestedMode === "signup" || requestedMode === "login") {
      setMode(requestedMode);
    }

    const stored = typeof window !== "undefined" ? window.localStorage.getItem(ONBOARDING_STORAGE_KEY) : null;
    if (stored === "complete") {
      setStep("login");
    }
  }, [searchParams]);

  const continueToOtp = async () => {
    setSubmitting(true);
    await delay(300);
    setStep("otp");
    setSubmitting(false);
  };

  const verifyOtp = async () => {
    setSubmitting(true);
    await delay(300);
    setStep("onboarding");
    setSubmitting(false);
  };

  const completeOnboarding = async () => {
    setSubmitting(true);
    await delay(350);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ONBOARDING_STORAGE_KEY, "complete");
    }
    router.push(nextHref);
  };

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
        <section className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(11,18,37,0.96),rgba(14,24,48,0.92))] p-6 shadow-[0_24px_120px_rgba(8,15,40,0.42)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_24%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.18),transparent_20%),linear-gradient(180deg,transparent,rgba(5,8,22,0.35))]" />
          <div className="relative flex h-full flex-col">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to landing page
            </Link>

            <div className="mt-8 space-y-5">
              <p className="text-sm font-semibold text-white/90">AI Receptionist</p>
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
                One place to manage calls, chats, reminders, and customer details.
              </h1>
              <p className="max-w-xl text-base leading-7 text-white/72">
                Use this demo to review calls, track messages, manage follow-ups, and keep customer notes in one dashboard.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Highlight icon={Bot} title="Voice + text" text="Unified AI agents" />
              <Highlight icon={Building2} title="CRM memory" text="Contact-aware outreach" />
              <Highlight icon={Sparkles} title="Automation engine" text="Trigger-based follow-ups" />
            </div>

            <div className="mt-auto grid gap-3 pt-8 sm:grid-cols-2">
              {authMoments.onboardingChecklist.map((item) => (
                <div key={item} className="rounded-full border border-white/10 bg-transparent px-4 py-3 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                    <span className="text-sm text-white/78">{item}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2.2rem] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,248,255,0.96))] p-5 shadow-[0_24px_120px_rgba(8,15,40,0.18)] sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setStep("login");
                }}
                className={mode === "login" ? "rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm" : "rounded-full px-4 py-2 text-sm text-slate-500"}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setStep("login");
                }}
                className={mode === "signup" ? "rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm" : "rounded-full px-4 py-2 text-sm text-slate-500"}
              >
                Signup
              </button>
            </div>
            <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 sm:block">
              {businessProfile.location}
            </div>
          </div>

          {step === "login" && (
            <Card className="border-slate-200 bg-transparent text-slate-950 shadow-none">
              <CardContent className="space-y-5 p-6">
                <div className="space-y-2">
                  <p className="text-base font-medium text-indigo-500">{mode === "signup" ? "Create account" : "Sign in"}</p>
                  <h2 className="text-3xl font-semibold text-slate-950">
                    {mode === "signup" ? "Create your AI front desk." : "Welcome back to your AI front desk."}
                  </h2>
                  <p className="text-sm leading-7 text-slate-500">
                    {mode === "signup" ? "Set up your demo account to explore the sample workspace." : authMoments.loginHint}
                  </p>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700">Work email</label>
                  <Input value={email} onChange={(event) => setEmail(event.target.value)} />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700">Mobile number</label>
                  <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
                </div>
                <Button className="h-12 w-full rounded-full bg-[#5b49e8] text-white hover:bg-[#5341de]" onClick={continueToOtp} disabled={submitting}>
                  {mode === "signup" ? "Continue to setup" : "Continue to OTP"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                  Demo workspace ready
                  <p className="mt-1 text-sm text-slate-400">This sample account includes calls, CRM, reports, and reminders.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "otp" && (
            <Card className="border-slate-200 bg-transparent text-slate-950 shadow-none">
              <CardContent className="space-y-5 p-6">
                <div className="space-y-2">
                  <p className="text-base font-medium text-indigo-500">OTP verification</p>
                  <h2 className="text-3xl font-semibold text-slate-950">Verify secure access</h2>
                  <p className="text-sm leading-7 text-slate-500">We sent a code to {authMoments.otpChannel}.</p>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {otp.padEnd(6, " ").slice(0, 6).split("").map((digit, index) => (
                    <div key={`${digit}-${index}`} className="flex h-18 items-center justify-center rounded-[1.6rem] border border-slate-200 bg-white px-4 py-5 text-3xl font-semibold text-slate-900 shadow-sm sm:h-16 sm:text-2xl">
                      {digit.trim() || "•"}
                    </div>
                  ))}
                </div>
                <Input value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} className="sr-only" aria-label="OTP" />
                <div className="flex gap-3">
                  <Button variant="ghost" className="h-12 flex-1 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" onClick={() => setStep("login")}>
                    Back
                  </Button>
                  <Button className="h-12 flex-1 rounded-full bg-[#5b49e8] text-white hover:bg-[#5341de]" onClick={verifyOtp} disabled={submitting}>
                    Verify OTP
                  </Button>
                </div>
                <p className="text-sm leading-7 text-slate-500">Session security is mocked for this POC. No backend auth is required.</p>
              </CardContent>
            </Card>
          )}

          {step === "onboarding" && (
            <Card className="border-slate-200 bg-transparent text-slate-950 shadow-none">
              <CardContent className="space-y-5 p-6">
                <div className="space-y-2">
                  <p className="text-base font-medium text-indigo-500">Business onboarding</p>
                  <h2 className="text-3xl font-semibold text-slate-950">Shape your AI receptionist</h2>
                  <p className="text-sm leading-7 text-slate-500">Configure business tone, hours, and automation defaults before entering the workspace.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Input value={businessName} onChange={(event) => setBusinessName(event.target.value)} />
                  </div>
                  <div className="relative">
                    <Input value={plan} onChange={(event) => setPlan(event.target.value)} />
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                  <textarea
                    value={instructions}
                    onChange={(event) => setInstructions(event.target.value)}
                    className="min-h-[144px] w-full rounded-[1.6rem] border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-500 focus:ring-2 focus:ring-ring"
                  />
                </div>

                <Button className="h-12 w-full rounded-full bg-[#5b49e8] text-white hover:bg-[#5341de]" onClick={completeOnboarding} disabled={submitting}>
                  Open dashboard
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </main>
  );
}

function Highlight({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Bot;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/6 p-4 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.28em] text-white/35">{title}</p>
      <p className="mt-3 text-2xl font-semibold leading-10 text-white">{text}</p>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function AuthLoading() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
        <section className="rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(11,18,37,0.96),rgba(14,24,48,0.92))] p-6 sm:p-8">
          <div className="h-full min-h-[420px] animate-pulse rounded-[1.6rem] bg-white/6" />
        </section>
        <section className="rounded-[2.2rem] border border-slate-200/70 bg-white/95 p-5 sm:p-8">
          <div className="h-64 animate-pulse rounded-[1.6rem] bg-slate-100" />
        </section>
      </div>
    </main>
  );
}
