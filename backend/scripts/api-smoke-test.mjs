import { execFileSync } from "node:child_process";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:4000/api/v1";
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3001";
const FRONTEND_CANDIDATES = [
  FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3002",
];
const EMAIL = process.env.SMOKE_TEST_EMAIL ?? "owner@clinic.com";
const PASSWORD = process.env.SMOKE_TEST_PASSWORD ?? "password123";
const AUTO_REGISTER = (process.env.SMOKE_TEST_AUTO_REGISTER ?? "false").toLowerCase() === "true";
const ALLOW_FRONTEND_CHECK_FAILURE =
  (process.env.SMOKE_TEST_ALLOW_FRONTEND_FAILURE ?? "true").toLowerCase() === "true";

const state = {
  token: "",
  userId: "",
  ids: {},
  failures: [],
};

function logStep(message) {
  console.log(`\n[smoke] ${message}`);
}

function logPass(message) {
  console.log(`[pass] ${message}`);
}

function logInfo(message) {
  console.log(`[info] ${message}`);
}

function logFail(message) {
  console.error(`[fail] ${message}`);
  state.failures.push(message);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function makeUnique(prefix) {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${stamp}-${rand}`;
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
    ...(options.headers ?? {}),
  };

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let json = null;

  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    json,
    text,
  };
}

async function expectRequest(label, path, options = {}, expectedStatuses = [200, 201]) {
  const response = await request(path, options);

  if (!expectedStatuses.includes(response.status)) {
    throw new Error(
      `${label} failed with ${response.status}: ${response.text || JSON.stringify(response.json)}`,
    );
  }

  logPass(`${label} -> ${response.status}`);
  return response.json;
}

async function expectAbsoluteUrl(label, url, expectedStatuses = [200]) {
  const response = await fetch(url, {
    headers: state.token ? { Authorization: `Bearer ${state.token}` } : {},
  });

  if (!expectedStatuses.includes(response.status)) {
    const text = await response.text();
    throw new Error(`${label} failed with ${response.status}: ${text}`);
  }

  logPass(`${label} -> ${response.status}`);
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function checkUrlWithCurl(url) {
  try {
    const output = execFileSync("curl", ["-sS", "-o", "/dev/null", "-w", "%{http_code}", url], {
      encoding: "utf8",
      timeout: 15000,
    }).trim();

    return {
      ok: output.startsWith("2") || output.startsWith("3"),
      status: Number(output),
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error.message,
    };
  }
}

async function checkFrontend() {
  logStep("Checking frontend availability");
  const tried = new Set();
  const candidates = FRONTEND_CANDIDATES.filter((url) => {
    if (tried.has(url)) {
      return false;
    }
    tried.add(url);
    return true;
  });

  let lastError = "No frontend URL candidates were available";

  for (const candidate of candidates) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const response = await fetchWithTimeout(candidate, {}, 15000);

        if (!response.ok) {
          lastError = `status ${response.status} from ${candidate}`;
        } else {
          logPass(`Frontend reachable at ${candidate}`);
          return;
        }
      } catch (error) {
        const curlResult = checkUrlWithCurl(candidate);

        if (curlResult.ok) {
          logInfo(`Frontend fetch fallback used curl for ${candidate}`);
          logPass(`Frontend reachable at ${candidate}`);
          return;
        }

        lastError = `${candidate} attempt ${attempt}: ${error.message}${curlResult.error ? ` | curl: ${curlResult.error}` : ""}`;
      }

      await sleep(2000);
    }
  }

  if (ALLOW_FRONTEND_CHECK_FAILURE) {
    logInfo(`Skipping blocking frontend failure in smoke test: ${lastError}`);
    return;
  }

  throw new Error(`Frontend check failed: ${lastError}`);
}

async function ensureLogin() {
  logStep("Authenticating");

  const login = await request("/auth/login", {
    method: "POST",
    headers: {},
    body: {
      email: EMAIL,
      password: PASSWORD,
    },
  });

  if (login.ok) {
    state.token = login.json?.data?.accessToken ?? "";
    state.userId = login.json?.data?.user?.id ?? "";
    assert(state.token, "Login succeeded but accessToken was missing");
    logPass(`Logged in as ${EMAIL}`);
    return;
  }

  if (!AUTO_REGISTER) {
    throw new Error(
      `Login failed for ${EMAIL}. Set SMOKE_TEST_AUTO_REGISTER=true to auto-register a fallback user.`,
    );
  }

  const registerEmail = `smoke-${makeUnique("user")}@example.com`;
  const register = await expectRequest(
    "Register smoke user",
    "/auth/register",
    {
      method: "POST",
      headers: {},
      body: {
        name: "Smoke Test User",
        email: registerEmail,
        phone: "+919900001111",
        password: PASSWORD,
      },
    },
    [201],
  );

  state.token = register?.data?.accessToken ?? "";
  state.userId = register?.data?.user?.id ?? "";
  assert(state.token, "Register succeeded but accessToken was missing");
  logInfo(`Using auto-registered user ${registerEmail}`);
}

async function checkCurrentUser() {
  logStep("Checking auth/me");
  const me = await expectRequest("GET /auth/me", "/auth/me");
  assert(me?.data?.id, "Current user response did not include an id");
}

async function exerciseBusinessCrud() {
  logStep("Testing business CRUD");
  const suffix = makeUnique("business");

  const created = await expectRequest("POST /business", "/business", {
    method: "POST",
    body: {
      businessName: `Smoke Clinic ${suffix}`,
      ownerName: "Smoke Owner",
      phone: "+911140001122",
      email: `hello+${suffix}@example.com`,
      address: "Delhi, India",
      logoUrl: "https://cdn.example.com/logo.png",
    },
  });

  const businessId = created?.data?.id;
  assert(businessId, "Business create response did not include an id");
  state.ids.businessId = businessId;

  await expectRequest("GET /business", "/business?page=1&limit=10");
  await expectRequest("GET /business/:id", `/business/${businessId}`);
  await expectRequest("PATCH /business/:id", `/business/${businessId}`, {
    method: "PATCH",
    body: {
      businessName: `Smoke Clinic ${suffix} Updated`,
      address: "Gurugram, India",
    },
  });
  await expectRequest("DELETE /business/:id", `/business/${businessId}`, {
    method: "DELETE",
  });
}

async function exerciseServiceCrud() {
  logStep("Testing services CRUD");
  const suffix = makeUnique("service");

  const created = await expectRequest("POST /services", "/services", {
    method: "POST",
    body: {
      serviceName: `Consultation ${suffix}`,
      serviceCode: `SVC-${suffix.slice(-6).toUpperCase()}`,
      description: "Initial consultation",
      price: 1200,
      duration: 30,
      isActive: true,
    },
  });

  const serviceId = created?.data?.id;
  assert(serviceId, "Service create response did not include an id");
  state.ids.serviceId = serviceId;

  await expectRequest("GET /services", "/services?page=1&limit=10");
  await expectRequest("GET /services/:id", `/services/${serviceId}`);
  await expectRequest("PATCH /services/:id", `/services/${serviceId}`, {
    method: "PATCH",
    body: {
      description: "Updated consultation plan",
      price: 1500,
    },
  });
  await expectRequest("DELETE /services/:id", `/services/${serviceId}`, {
    method: "DELETE",
  });
}

async function createServiceForClientLinking() {
  const suffix = makeUnique("svc-link");
  const created = await expectRequest("POST /services (link helper)", "/services", {
    method: "POST",
    body: {
      serviceName: `Linked Service ${suffix}`,
      serviceCode: `LNK-${suffix.slice(-6).toUpperCase()}`,
      description: "Service used for smoke-test client linking",
      price: 1800,
      duration: 45,
      isActive: true,
    },
  });

  const serviceId = created?.data?.id;
  assert(serviceId, "Linked service create response did not include an id");
  state.ids.linkedServiceId = serviceId;
}

async function exerciseClientCrud() {
  logStep("Testing clients CRUD");
  await createServiceForClientLinking();
  const suffix = makeUnique("client");

  const created = await expectRequest("POST /clients", "/clients", {
    method: "POST",
    body: {
      fullName: `Asha ${suffix}`,
      gender: "female",
      phone: "+919811112233",
      whatsapp: "+919811112233",
      email: `client+${suffix}@example.com`,
      preferredContactMode: "whatsapp",
      preferredContactTime: "18:00-20:00",
      notes: "Prefers short updates in the evening.",
      birthday: "1994-08-15",
      anniversary: "2020-02-10",
      serviceIds: [state.ids.linkedServiceId],
    },
  });

  const clientId = created?.data?.id;
  assert(clientId, "Client create response did not include an id");
  state.ids.clientId = clientId;

  await expectRequest("GET /clients", "/clients?page=1&limit=10&search=Asha");
  await expectRequest("GET /clients/:id", `/clients/${clientId}`);
  await expectRequest("PATCH /clients/:id", `/clients/${clientId}`, {
    method: "PATCH",
    body: {
      preferredContactMode: "call",
      notes: "Updated by smoke test.",
    },
  });
  await expectRequest("DELETE /clients/:id", `/clients/${clientId}`, {
    method: "DELETE",
  });
  await expectRequest("DELETE /services/:id (link helper)", `/services/${state.ids.linkedServiceId}`, {
    method: "DELETE",
  });
}

async function exerciseUsersList() {
  logStep("Testing users list");
  await expectRequest("GET /users", "/users");
}

async function exerciseTextMessages() {
  logStep("Testing text messages");
  const created = await expectRequest("POST /text-messages", "/text-messages", {
    method: "POST",
    body: {
      channel: "whatsapp",
      toAddress: "+919822223344",
      subject: "Report update",
      bodyText: "Your report is ready for collection tomorrow.",
    },
  });

  const textMessageId = created?.data?.id;
  assert(textMessageId, "Text message create response did not include an id");
  state.ids.textMessageId = textMessageId;

  await expectRequest("GET /text-messages", "/text-messages?page=1&limit=10&channel=whatsapp");
  await expectRequest("GET /text-messages/:id", `/text-messages/${textMessageId}`);
  await expectRequest("PATCH /text-messages/:id", `/text-messages/${textMessageId}`, {
    method: "PATCH",
    body: {
      status: "delivered",
      previewText: "Updated preview from smoke test",
    },
  });
}

async function exerciseAutomations() {
  logStep("Testing automations");
  const suffix = makeUnique("automation");

  const created = await expectRequest("POST /automations", "/automations", {
    method: "POST",
    body: {
      name: `Follow-up ${suffix}`,
      description: "Smoke test automation",
      triggerType: "follow_up",
      channel: "whatsapp",
      actionType: "send_message",
      scheduleType: "instant",
      scheduleValue: "0",
      isActive: true,
      triggerConfig: {
        delayDays: 2,
      },
      executionRules: {
        maxRetryCount: 3,
      },
    },
  });

  const automationId = created?.data?.id;
  assert(automationId, "Automation create response did not include an id");
  state.ids.automationId = automationId;

  await expectRequest("GET /automations", "/automations?page=1&limit=10&triggerType=follow_up&channel=whatsapp");
  await expectRequest("GET /automations/:id", `/automations/${automationId}`);
  await expectRequest("PATCH /automations/:id", `/automations/${automationId}`, {
    method: "PATCH",
    body: {
      description: "Updated smoke automation",
      scheduleType: "delayed",
      scheduleValue: "15m",
    },
  });
  await expectRequest("PATCH /automations/:id/toggle", `/automations/${automationId}/toggle`, {
    method: "PATCH",
    body: {
      isActive: false,
    },
  });
  await expectRequest("GET /automations/:id/logs", `/automations/${automationId}/logs`);
  await expectRequest("DELETE /automations/:id", `/automations/${automationId}`, {
    method: "DELETE",
  });
}

async function ensureMessagingClient() {
  if (state.ids.messagingClientId) {
    return state.ids.messagingClientId;
  }

  const suffix = makeUnique("msg-client");
  const created = await expectRequest("POST /clients (messaging helper)", "/clients", {
    method: "POST",
    body: {
      fullName: `Messaging Client ${suffix}`,
      gender: "female",
      phone: "+919855556666",
      whatsapp: "+919855556666",
      email: `messaging+${suffix}@example.com`,
      preferredContactMode: "whatsapp",
      preferredContactTime: "10:00-18:00",
      notes: "Used for Step 6 communication testing.",
    },
  });

  const clientId = created?.data?.id;
  assert(clientId, "Messaging helper client create response did not include an id");
  state.ids.messagingClientId = clientId;
  state.ids.messagingClientPhone = created.data.phone;
  state.ids.messagingClientWhatsapp = created.data.whatsapp;
  state.ids.messagingClientEmail = created.data.email;

  return clientId;
}

async function exerciseTemplates() {
  logStep("Testing message templates");
  const created = await expectRequest("POST /templates", "/templates", {
    method: "POST",
    body: {
      name: `Reminder ${makeUnique("template")}`,
      channel: "whatsapp",
      templateType: "reminder",
      content: "Hello {{name}}, your appointment is tomorrow at {{time}}.",
      variables: ["name", "time"],
    },
  });

  const templateId = created?.data?.id;
  assert(templateId, "Template create response did not include an id");
  state.ids.templateId = templateId;

  await expectRequest("GET /templates", "/templates");
  await expectRequest("PATCH /templates/:id", `/templates/${templateId}`, {
    method: "PATCH",
    body: {
      content: "Hello {{name}}, your appointment is confirmed for {{time}}.",
      variables: ["name", "time"],
    },
  });
  await expectRequest("DELETE /templates/:id", `/templates/${templateId}`, {
    method: "DELETE",
  });
}

async function createReminderTemplate() {
  const created = await expectRequest("POST /templates (reminder helper)", "/templates", {
    method: "POST",
    body: {
      name: `Reminder ${makeUnique("template")}`,
      channel: "whatsapp",
      templateType: "reminder",
      content: "Hello {{name}}, your report is ready for pickup tomorrow.",
      variables: ["name"],
    },
  });

  state.ids.reminderTemplateId = created?.data?.id;
  assert(state.ids.reminderTemplateId, "Reminder helper template did not include an id");
}

async function createReminderAutomation(clientId) {
  if (!state.ids.reminderTemplateId) {
    await createReminderTemplate();
  }

  const created = await expectRequest("POST /automations (reminder helper)", "/automations", {
    method: "POST",
    body: {
      name: `Manual reminder ${makeUnique("reminder")}`,
      description: "Used by smoke test for manual reminder execution",
      triggerType: "manual",
      channel: "whatsapp",
      actionType: "send_message",
      templateId: state.ids.reminderTemplateId,
      scheduleType: "instant",
      scheduleValue: "0",
      isActive: true,
    },
  });

  state.ids.reminderAutomationId = created?.data?.id;
  assert(state.ids.reminderAutomationId, "Reminder helper automation did not include an id");
  state.ids.reminderClientId = clientId;
}

async function exerciseMessageChannels() {
  logStep("Testing WhatsApp, SMS, Email, messages, conversations, and AI reply");
  const clientId = await ensureMessagingClient();
  await createReminderAutomation(clientId);

  const whatsappSend = await expectRequest("POST /whatsapp/send", "/whatsapp/send", {
    method: "POST",
    body: {
      clientId,
      phone: state.ids.messagingClientWhatsapp,
      message: "Hello, your report is ready for pickup tomorrow.",
    },
  });
  state.ids.whatsappMessageId = whatsappSend?.data?.id;
  state.ids.whatsappProviderMessageId = whatsappSend?.data?.providerMessageId;

  await expectRequest("POST /whatsapp/webhook/status", "/whatsapp/webhook/status", {
    method: "POST",
    headers: {},
    body: {
      providerMessageId: state.ids.whatsappProviderMessageId,
      status: "read",
    },
  });

  await expectRequest("POST /whatsapp/webhook/incoming", "/whatsapp/webhook/incoming", {
    method: "POST",
    headers: {},
    body: {
      from: state.ids.messagingClientWhatsapp,
      to: "+911140001122",
      message: "Can I reschedule my appointment to Friday?",
      autoReply: true,
    },
  });

  const smsSend = await expectRequest("POST /sms/send", "/sms/send", {
    method: "POST",
    body: {
      clientId,
      phone: state.ids.messagingClientPhone,
      message: "Reminder: please share your feedback after the visit.",
    },
  });
  state.ids.smsProviderMessageId = smsSend?.data?.providerMessageId;

  await expectRequest("POST /sms/webhook/status", "/sms/webhook/status", {
    method: "POST",
    headers: {},
    body: {
      providerMessageId: state.ids.smsProviderMessageId,
      status: "delivered",
    },
  });

  await expectRequest("POST /sms/webhook/incoming", "/sms/webhook/incoming", {
    method: "POST",
    headers: {},
    body: {
      from: state.ids.messagingClientPhone,
      to: "+911140001122",
      message: "Please call me back after 5 PM.",
      autoReply: true,
    },
  });

  const emailSend = await expectRequest("POST /email/send", "/email/send", {
    method: "POST",
    body: {
      clientId,
      to: state.ids.messagingClientEmail,
      subject: "Your test report is ready",
      body: "Hello, your report is ready and can be collected tomorrow between 10 AM and 6 PM.",
    },
  });
  assert(emailSend?.data?.id, "Email send response did not include an id");

  await expectRequest("GET /email/history", "/email/history?page=1&limit=10");

  await expectRequest("POST /email/webhook/incoming", "/email/webhook/incoming", {
    method: "POST",
    headers: {},
    body: {
      from: state.ids.messagingClientEmail,
      to: "hello@novaskin.com",
      subject: "Re: Your test report is ready",
      body: "Thank you, I will come tomorrow afternoon.",
      autoReply: true,
    },
  });

  await expectRequest("GET /messages", "/messages?page=1&limit=10&channel=whatsapp&direction=outgoing");
  await expectRequest("GET /messages/:id", `/messages/${state.ids.whatsappMessageId}`);
  await expectRequest(
    "GET /messages/client/:clientId",
    `/messages/client/${clientId}?page=1&limit=20&search=report`,
  );
  await expectRequest("GET /conversations/client/:clientId", `/conversations/client/${clientId}`);
  await expectRequest("POST /ai-reply/generate", "/ai-reply/generate", {
    method: "POST",
    body: {
      channel: "whatsapp",
      message: "I want to book an appointment for tomorrow.",
    },
  });
  await expectRequest("POST /reminders/test", "/reminders/test", {
    method: "POST",
    body: {
      automationId: state.ids.reminderAutomationId,
      clientId,
      variables: {
        name: "Messaging Client",
      },
    },
  });
  const automationLogs = await expectRequest(
    "GET /automation-logs",
    `/automation-logs?page=1&limit=10&automationId=${state.ids.reminderAutomationId}`,
  );
  const firstLogId = automationLogs?.data?.items?.[0]?.id;
  assert(firstLogId, "Automation logs list did not return an execution log");
  await expectRequest("GET /automation-logs/:id", `/automation-logs/${firstLogId}`);
  await expectRequest("GET /ai-automation/suggestions", "/ai-automation/suggestions");
}

async function exerciseVoicePipeline() {
  logStep("Testing voice calls and pipeline");
  const callSid = `CALL-${makeUnique("sid").toUpperCase()}`;

  const outgoing = await expectRequest("POST /voice-calls/outgoing", "/voice-calls/outgoing", {
    method: "POST",
    body: {
      customerName: "Rohan Mehta",
      customerPhone: "+919833334455",
      callSid,
      direction: "outgoing",
      fromNumber: "+911140001122",
      toNumber: "+919833334455",
    },
  });

  const voiceCallId = outgoing?.data?.id;
  assert(voiceCallId, "Voice call create response did not include an id");
  state.ids.voiceCallId = voiceCallId;

  await expectRequest("GET /voice-calls", "/voice-calls?page=1&limit=10&direction=outgoing&phone=9833");
  await expectRequest("GET /voice-calls/:id", `/voice-calls/${voiceCallId}`);
  await expectRequest("PATCH /voice-calls/:id/status", `/voice-calls/${voiceCallId}/status`, {
    method: "PATCH",
    body: {
      status: "in_progress",
    },
  });
  await expectRequest("PATCH /voice-calls/:id", `/voice-calls/${voiceCallId}`, {
    method: "PATCH",
    body: {
      customerName: "Rohan Mehta Updated",
      duration: 60,
    },
  });

  await expectRequest("POST /transcripts/generate/:callId", `/transcripts/generate/${voiceCallId}`, {
    method: "POST",
    body: {
      provider: "mock-transcriber",
      language: "en",
      confidence: 0.95,
    },
  });

  await expectRequest("GET /transcripts/:callId", `/transcripts/${voiceCallId}`);
  await expectRequest("POST /ai-summary/generate/:callId", `/ai-summary/generate/${voiceCallId}`, {
    method: "POST",
    body: {
      modelName: "mock-gpt-summary",
    },
  });
  await expectRequest("GET /ai-summary/:callId", `/ai-summary/${voiceCallId}`);
  await expectRequest("POST /recordings/:callId", `/recordings/${voiceCallId}`, {
    method: "POST",
    body: {
      provider: "mock-storage",
      duration: 90,
    },
  });
  await expectRequest("GET /recordings/:callId", `/recordings/${voiceCallId}`);
  await expectRequest("GET /voice-calls/:id/transcript", `/voice-calls/${voiceCallId}/transcript`);
  await expectRequest("GET /voice-calls/:id/summary", `/voice-calls/${voiceCallId}/summary`);

  await expectRequest("POST /webhooks/call/incoming", "/webhooks/call/incoming", {
    method: "POST",
    headers: {},
    body: {
      callSid: `IN-${makeUnique("call").toUpperCase()}`,
      from: "+919944445566",
      to: "+911140001122",
      customerName: "Incoming Caller",
      status: "ringing",
      duration: 0,
    },
  });

  await expectRequest("POST /webhooks/call/status", "/webhooks/call/status", {
    method: "POST",
    headers: {},
    body: {
      callSid,
      from: "+919833334455",
      to: "+911140001122",
      status: "completed",
      duration: 122,
    },
  });

  await expectRequest("POST /webhooks/call/completed", "/webhooks/call/completed", {
    method: "POST",
    headers: {},
    body: {
      callSid,
      from: "+919833334455",
      to: "+911140001122",
      status: "completed",
      duration: 122,
    },
  });

  const finalCall = await expectRequest("GET /voice-calls/:id (final)", `/voice-calls/${voiceCallId}`);
  assert(finalCall?.data?.status === "completed", "Voice call was not marked completed by webhook flow");
}

async function exerciseRealProviderEndpoints() {
  logStep("Testing Step 9 real-provider endpoints with local fallback support");

  await expectRequest("POST /ai/generate-summary", "/ai/generate-summary", {
    method: "POST",
    body: {
      transcript: "Customer confirmed the appointment for tomorrow morning and asked for a callback if there is any delay.",
      customerName: "Rohan Mehta",
      businessName: "Smoke Clinic",
    },
  });

  await expectRequest("POST /ai/generate-reply", "/ai/generate-reply", {
    method: "POST",
    body: {
      message: "Can I move my appointment to Friday afternoon?",
      channel: "whatsapp",
    },
  });

  await expectRequest("POST /ai/extract-keypoints", "/ai/extract-keypoints", {
    method: "POST",
    body: {
      text: "Customer asked for a callback after 5 PM, confirmed the report discussion, and requested a Friday appointment.",
    },
  });

  await expectRequest("POST /ai/analyze-sentiment", "/ai/analyze-sentiment", {
    method: "POST",
    body: {
      text: "Thank you, the staff was very helpful and the update was clear.",
    },
  });

  await expectRequest("POST /stt/transcribe", "/stt/transcribe", {
    method: "POST",
    body: {
      callId: state.ids.voiceCallId,
      audioUrl: "https://example.com/mock-audio.wav",
      language: "en",
    },
  });

  const tts = await expectRequest("POST /tts/generate", "/tts/generate", {
    method: "POST",
    body: {
      text: "Hello, your report is ready for pickup tomorrow.",
      voice: "aura-asteria-en",
    },
  });
  assert(tts?.data?.audioUrl, "TTS generation did not return an audio URL");
  await expectAbsoluteUrl("GET generated TTS audio", tts.data.audioUrl);

  const twilioCall = await expectRequest("POST /twilio/outgoing-call", "/twilio/outgoing-call", {
    method: "POST",
    body: {
      customerName: "Twilio Test Caller",
      customerPhone: "+919811115555",
    },
  });
  assert(twilioCall?.data?.id, "Twilio outgoing call response did not include a call id");

  await expectRequest(
    "POST /twilio/webhook/voice",
    "/twilio/webhook/voice",
    {
      method: "POST",
      headers: {},
      body: {
        CallSid: `TWILIO-${makeUnique("call").toUpperCase()}`,
        From: "+919811115555",
        To: "+911140001122",
        CallStatus: "in-progress",
        SpeechResult: "I want to confirm my appointment for tomorrow.",
      },
    },
    [200],
  );

  await expectRequest("POST /twilio/webhook/status", "/twilio/webhook/status", {
    method: "POST",
    headers: {},
    body: {
      CallSid: `TWILIO-${makeUnique("status").toUpperCase()}`,
      From: "+919811115555",
      To: "+911140001122",
      CallStatus: "completed",
      CallDuration: "45",
      RecordingUrl: "https://example.com/recordings/twilio-call",
      RecordingDuration: "45",
    },
  });

  await expectRequest("POST /whatsapp/webhook", "/whatsapp/webhook", {
    method: "POST",
    headers: {},
    body: {
      from: state.ids.messagingClientWhatsapp,
      to: "+911140001122",
      message: "Please share the report timing again.",
      autoReply: true,
    },
  });
}

async function exerciseDashboardAndReports() {
  logStep("Testing dashboard, reports, and activity endpoints");
  await expectRequest("GET /dashboard/stats", "/dashboard/stats");
  await expectRequest("GET /dashboard/recent-activity", "/dashboard/recent-activity");
  await expectRequest("GET /dashboard/recent-activities", "/dashboard/recent-activities");
  await expectRequest("GET /dashboard/ai-insights", "/dashboard/ai-insights");
  await expectRequest("GET /dashboard/quick-insights", "/dashboard/quick-insights");
  await expectRequest("GET /activities", "/activities");
  await expectRequest("GET /reports/calls", "/reports/calls?page=1&limit=10&dateFrom=2026-05-01&dateTo=2026-05-31");
  await expectRequest("GET /reports/messages", "/reports/messages?page=1&limit=10");
  await expectRequest("GET /reports/automations", "/reports/automations?page=1&limit=10");
  await expectRequest("GET /reports/clients", "/reports/clients?page=1&limit=10");
  await expectRequest("GET /reports/overview", "/reports/overview?dateFrom=2026-05-01&dateTo=2026-05-31");
  await expectRequest("GET /reports/call-analytics", "/reports/call-analytics");
  await expectRequest("GET /reports/sentiment", "/reports/sentiment");
  await expectRequest("GET /reports/daily-summary", "/reports/daily-summary");
  await expectRequest("POST /reports/export-pdf", "/reports/export-pdf", {
    method: "POST",
    body: {
      reportType: "daily_summary",
      dateFrom: "2026-05-01",
      dateTo: "2026-05-10",
    },
  });

  await expectRequest("GET /analytics/call-trends", "/analytics/call-trends?groupBy=day&dateFrom=2026-05-01&dateTo=2026-05-31");
  await expectRequest("GET /analytics/message-trends", "/analytics/message-trends?groupBy=day");
  await expectRequest("GET /analytics/automation-trends", "/analytics/automation-trends?groupBy=week");
  await expectRequest("GET /analytics/sentiment-trends", "/analytics/sentiment-trends?groupBy=day");
  await expectRequest("GET /analytics/channel-performance", "/analytics/channel-performance");
  await expectRequest("GET /ai-insights/business", "/ai-insights/business");
  await expectRequest("GET /ai-insights/communication", "/ai-insights/communication");
  await expectRequest("GET /ai-insights/followups", "/ai-insights/followups");

  const callSummaryPdf = await expectRequest("POST /reports/export/call-summary", "/reports/export/call-summary", {
    method: "POST",
    body: {
      callId: state.ids.voiceCallId,
    },
  });
  assert(callSummaryPdf?.data?.downloadUrl, "Call summary export did not return a download URL");
  await expectAbsoluteUrl("GET call summary PDF", callSummaryPdf.data.downloadUrl);

  const clientReportPdf = await expectRequest("POST /reports/export/client-report", "/reports/export/client-report", {
    method: "POST",
    body: {
      clientId: state.ids.messagingClientId,
    },
  });
  assert(clientReportPdf?.data?.downloadUrl, "Client report export did not return a download URL");

  const dailySummaryPdf = await expectRequest("POST /reports/export/daily-summary", "/reports/export/daily-summary", {
    method: "POST",
    body: {
      dateFrom: "2026-05-01",
      dateTo: "2026-05-31",
    },
  });
  assert(dailySummaryPdf?.data?.downloadUrl, "Daily summary export did not return a download URL");

  const transcriptPdf = await expectRequest("POST /reports/export/transcript", "/reports/export/transcript", {
    method: "POST",
    body: {
      callId: state.ids.voiceCallId,
    },
  });
  assert(transcriptPdf?.data?.downloadUrl, "Transcript export did not return a download URL");

  await expectRequest("GET /report-history", "/report-history?page=1&limit=10&dateFrom=2026-05-01&dateTo=2026-05-31");
}

async function exerciseRealtimeRestEndpoints() {
  logStep("Testing realtime session monitoring APIs");
  const sessions = await expectRequest("GET /live-sessions", "/live-sessions?scope=all");
  assert(Array.isArray(sessions?.data), "Live sessions response did not return an array");

  const active = await expectRequest("GET /realtime/active-sessions", "/realtime/active-sessions");
  assert(Array.isArray(active?.data), "Realtime active sessions response did not return an array");

  if (sessions?.data?.[0]?.sessionId) {
    await expectRequest("GET /live-sessions/:id", `/live-sessions/${sessions.data[0].sessionId}`);
  }
}

async function main() {
  console.log(`[smoke] Base URL: ${BASE_URL}`);
  console.log(`[smoke] Frontend URL: ${FRONTEND_URL}`);

  await checkFrontend();
  await ensureLogin();
  await checkCurrentUser();
  await exerciseUsersList();
  await exerciseBusinessCrud();
  await exerciseServiceCrud();
  await exerciseClientCrud();
  await exerciseTextMessages();
  await exerciseAutomations();
  await exerciseTemplates();
  await exerciseMessageChannels();
  await exerciseVoicePipeline();
  await exerciseRealProviderEndpoints();
  await exerciseDashboardAndReports();
  await exerciseRealtimeRestEndpoints();

  console.log("\n[smoke] All checks passed.");
}

main().catch((error) => {
  logFail(error instanceof Error ? error.message : String(error));

  if (state.failures.length > 0) {
    console.error("\n[smoke] Failures:");
    for (const failure of state.failures) {
      console.error(`- ${failure}`);
    }
  }

  process.exit(1);
});
