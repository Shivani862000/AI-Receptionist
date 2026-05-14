export function validateEnv(config: Record<string, unknown>) {
  const required = ["DATABASE_URL", "JWT_SECRET"];

  for (const key of required) {
    if (!config[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  const numericKeys = [
    "PORT",
    "SMTP_PORT",
    "AI_REQUEST_TIMEOUT_MS",
    "DEEPGRAM_REQUEST_TIMEOUT_MS",
    "RATE_LIMIT_TTL_MS",
    "RATE_LIMIT_LIMIT",
    "UPLOAD_MAX_FILE_SIZE_MB",
    "TEMP_FILE_TTL_HOURS",
    "REALTIME_SESSION_TIMEOUT_MS"
  ];
  for (const key of numericKeys) {
    if (config[key] && Number.isNaN(Number(config[key]))) {
      throw new Error(`Environment variable ${key} must be a number`);
    }
  }

  if (config.NODE_ENV && !["development", "test", "production"].includes(String(config.NODE_ENV))) {
    throw new Error("NODE_ENV must be one of: development, test, production");
  }

  return config;
}
