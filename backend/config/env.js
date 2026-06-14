import dotenv from "dotenv";

dotenv.config();

// Secrets that ship in the repo for local dev. They must never be used in production.
const DEV_SECRET_DEFAULTS = new Set([
  "dev-access-secret-change-me",
  "dev-refresh-secret-change-me",
  "replace-with-a-long-access-secret",
  "replace-with-a-long-refresh-secret",
]);

function parseOrigins(value, fallback) {
  return (value || fallback || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  corsOrigins: parseOrigins(
    process.env.CORS_ORIGINS,
    process.env.CLIENT_URL || "http://localhost:5173"
  ),
  trustProxy:
    process.env.TRUST_PROXY ||
    (process.env.NODE_ENV === "production" ? 1 : false),
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/skillpath",
  mongoMaxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 100),
  mongoMinPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE || 10),
  mongoConnectTimeoutMS: Number(process.env.MONGO_CONNECT_TIMEOUT_MS || 10000),
  mongoSocketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS || 45000),
  mongoServerSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 5000),
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  redisEnabled: (process.env.REDIS_ENABLED || "true") !== "false",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "dev-access-secret-change-me",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-me",
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || "15m",
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || "7d",
  judge0Url: process.env.JUDGE0_URL || "",
  judge0ApiKey: process.env.JUDGE0_API_KEY || "",
  localCompilerEnabled: process.env.LOCAL_COMPILER_ENABLED === "true",
  pistonUrl: process.env.PISTON_URL || "",
  pistonEnabled: (process.env.PISTON_ENABLED || "false") === "true",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || "SkillPath <no-reply@skillpath.local>",
  },
};

export const isProduction = env.nodeEnv === "production";

function hasPlaceholder(value = "") {
  return /your-|xxxxx|USER:PASSWORD|PASSWORD@|change-this|example\.com/i.test(value);
}

/**
 * Refuse to boot in production with an insecure or incomplete configuration.
 */
export function assertProductionEnv() {
  if (!isProduction) return;

  const problems = [];

  if (!process.env.MONGO_URI) {
    problems.push("MONGO_URI is required in production.");
  } else if (process.env.MONGO_URI.includes("localhost") || process.env.MONGO_URI.includes("127.0.0.1")) {
    problems.push("MONGO_URI points at localhost. Use an in-stack service host such as mongo, or a managed MongoDB URI.");
  } else if (hasPlaceholder(process.env.MONGO_URI)) {
    problems.push("MONGO_URI still contains placeholder values.");
  }

  const checkSecret = (name) => {
    const val = process.env[name];
    if (!val || DEV_SECRET_DEFAULTS.has(val)) {
      problems.push(`${name} must be set to a strong, unique value (not the dev default).`);
    } else if (val.length < 32) {
      problems.push(`${name} should be at least 32 characters. Generate one with: openssl rand -base64 48`);
    }
  };
  checkSecret("JWT_ACCESS_SECRET");
  checkSecret("JWT_REFRESH_SECRET");

  const configuredOrigins = [process.env.CLIENT_URL, process.env.CORS_ORIGINS].filter(Boolean).join(",");
  if (!configuredOrigins) {
    problems.push("CLIENT_URL or CORS_ORIGINS must be set so the browser can call the API.");
  } else if (hasPlaceholder(configuredOrigins)) {
    problems.push("CLIENT_URL/CORS_ORIGINS still contain placeholder frontend domains.");
  }

  if (env.redisEnabled && (!process.env.REDIS_URL || process.env.REDIS_URL.includes("localhost"))) {
    problems.push("REDIS_URL points at localhost (or is missing). Use an in-stack service host such as redis, a managed Redis URL, or set REDIS_ENABLED=false.");
  } else if (env.redisEnabled && hasPlaceholder(process.env.REDIS_URL)) {
    problems.push("REDIS_URL still contains placeholder values.");
  }

  if (process.env.GOOGLE_CLIENT_ID && hasPlaceholder(process.env.GOOGLE_CLIENT_ID)) {
    problems.push("GOOGLE_CLIENT_ID still contains a placeholder value.");
  }

  if (process.env.GEMINI_API_KEY && hasPlaceholder(process.env.GEMINI_API_KEY)) {
    problems.push("GEMINI_API_KEY still contains a placeholder value.");
  }

  if (process.env.GEMINI_MODEL && hasPlaceholder(process.env.GEMINI_MODEL)) {
    problems.push("GEMINI_MODEL still contains a placeholder value.");
  }

  if (problems.length) {
    console.error("\nInvalid production configuration:");
    for (const problem of problems) console.error(`  - ${problem}`);
    throw new Error("Refusing to start in production with invalid configuration (see errors above).");
  }
}
