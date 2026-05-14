export default () => ({
  app: {
    name: process.env.APP_NAME || "AI Receptionist API",
    nodeEnv: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT || 4000),
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
    backendBaseUrl: process.env.BACKEND_BASE_URL || `http://localhost:${Number(process.env.PORT || 4000)}`,
    corsOrigins: (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || "http://localhost:3000")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    enableSwagger: process.env.ENABLE_SWAGGER !== "false",
    trustProxy: process.env.TRUST_PROXY === "true",
    realtimeSessionTimeoutMs: Number(process.env.REALTIME_SESSION_TIMEOUT_MS || 30000)
  },
  database: {
    url: process.env.DATABASE_URL
  },
  jwt: {
    secret: process.env.JWT_SECRET || "super-secret-local-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    issuer: process.env.JWT_ISSUER || "ai-receptionist",
    audience: process.env.JWT_AUDIENCE || "ai-receptionist-users"
  },
  security: {
    rateLimitTtlMs: Number(process.env.RATE_LIMIT_TTL_MS || 60000),
    rateLimitLimit: Number(process.env.RATE_LIMIT_LIMIT || 60),
    logLevel: process.env.LOG_LEVEL || "info"
  },
  storage: {
    uploadMaxFileSizeMb: Number(process.env.UPLOAD_MAX_FILE_SIZE_MB || 15),
    tempFileTtlHours: Number(process.env.TEMP_FILE_TTL_HOURS || 24)
  },
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash-preview",
    requestTimeoutMs: Number(process.env.AI_REQUEST_TIMEOUT_MS || 15000)
  },
  deepgram: {
    apiKey: process.env.DEEPGRAM_API_KEY,
    sttModel: process.env.DEEPGRAM_STT_MODEL || "nova-3",
    ttsModel: process.env.DEEPGRAM_TTS_MODEL || "aura-asteria-en",
    requestTimeoutMs: Number(process.env.DEEPGRAM_REQUEST_TIMEOUT_MS || 20000)
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
