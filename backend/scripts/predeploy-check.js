import dotenv from "dotenv";

dotenv.config();

const args = new Set(process.argv.slice(2));
const strict = args.has("--strict") || process.env.PREDEPLOY_STRICT === "true";
const requireGoogle = args.has("--require-google") || process.env.REQUIRE_GOOGLE_AUTH === "true";
const requireGemini = args.has("--require-gemini") || process.env.REQUIRE_GEMINI === "true";

const DEV_SECRET_DEFAULTS = new Set([
  "dev-access-secret-change-me",
  "dev-refresh-secret-change-me",
  "replace-with-a-long-access-secret",
  "replace-with-a-long-refresh-secret",
]);

const blockers = [];
const warnings = [];
const passes = [];

function hasPlaceholder(value = "") {
  return /your-|xxxxx|USER:PASSWORD|PASSWORD@|change-this|example\.com|yourdomain\.com/i.test(value);
}

function isLocalUrl(value = "") {
  return /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(value);
}

function envValue(name) {
  return process.env[name] || "";
}

function addPass(message) {
  passes.push(message);
}

function addWarn(message) {
  warnings.push(message);
}

function addBlocker(message) {
  blockers.push(message);
}

function checkPresent(name, { secret = false, minLength = 1, allowPlaceholder = false } = {}) {
  const value = envValue(name);
  if (!value) {
    addBlocker(`${name} is missing.`);
    return;
  }

  if (!allowPlaceholder && hasPlaceholder(value)) {
    addBlocker(`${name} still contains placeholder text.`);
    return;
  }

  if (secret && DEV_SECRET_DEFAULTS.has(value)) {
    addBlocker(`${name} is still using a development default.`);
    return;
  }

  if (value.length < minLength) {
    addBlocker(`${name} should be at least ${minLength} characters.`);
    return;
  }

  addPass(`${name} is configured.`);
}

function checkNodeEnv() {
  const nodeEnv = envValue("NODE_ENV") || "development";
  if (nodeEnv !== "production") {
    addWarn("NODE_ENV is not production. Set NODE_ENV=production for the deployed backend.");
    return;
  }
  addPass("NODE_ENV is production.");
}

function checkMongo() {
  const mongoUri = envValue("MONGO_URI");
  if (!mongoUri) {
    addBlocker("MONGO_URI is missing.");
    return;
  }

  if (hasPlaceholder(mongoUri)) {
    addBlocker("MONGO_URI still contains placeholder text.");
    return;
  }

  if (isLocalUrl(mongoUri)) {
    addBlocker("MONGO_URI points to localhost. Use a managed URI or the in-stack Docker host `mongo`.");
    return;
  }

  addPass("MONGO_URI is configured without obvious local/placeholder values.");
}

function checkRedis() {
  const enabled = (envValue("REDIS_ENABLED") || "true") !== "false";
  if (!enabled) {
    addWarn("REDIS_ENABLED=false. Realtime scaling and cache-backed features will run without Redis.");
    return;
  }

  const redisUrl = envValue("REDIS_URL");
  if (!redisUrl) {
    addBlocker("REDIS_URL is missing while Redis is enabled.");
    return;
  }

  if (hasPlaceholder(redisUrl)) {
    addBlocker("REDIS_URL still contains placeholder text.");
    return;
  }

  if (isLocalUrl(redisUrl)) {
    addBlocker("REDIS_URL points to localhost. Use a managed URL or the in-stack Docker host `redis`.");
    return;
  }

  addPass("REDIS_URL is configured.");
}

function checkOrigins() {
  const clientUrl = envValue("CLIENT_URL");
  const corsOrigins = envValue("CORS_ORIGINS");

  if (!clientUrl && !corsOrigins) {
    addBlocker("CLIENT_URL or CORS_ORIGINS must be configured.");
    return;
  }

  const combined = [clientUrl, corsOrigins].filter(Boolean).join(",");
  if (hasPlaceholder(combined)) {
    addBlocker("CLIENT_URL/CORS_ORIGINS still contain placeholder text.");
    return;
  }

  if (isLocalUrl(combined)) {
    addBlocker("CLIENT_URL/CORS_ORIGINS point to localhost. Use the deployed HTTPS frontend origin.");
    return;
  }

  const origins = combined.split(",").map((origin) => origin.trim()).filter(Boolean);
  const nonHttps = origins.filter((origin) => !origin.startsWith("https://"));
  if (nonHttps.length) {
    addWarn("One or more frontend origins are not HTTPS.");
  } else {
    addPass("Frontend origins are HTTPS.");
  }
}

function checkSmtp() {
  const fields = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"];
  const missing = fields.filter((name) => !envValue(name));

  if (missing.length) {
    addBlocker(`SMTP is incomplete: missing ${missing.join(", ")}.`);
    return;
  }

  if (fields.some((name) => hasPlaceholder(envValue(name)))) {
    addBlocker("SMTP config still contains placeholder text.");
    return;
  }

  addPass("SMTP reset-email configuration is present.");
}

function checkOptionalAiAndOAuth() {
  if (!envValue("GOOGLE_CLIENT_ID")) {
    const message = "GOOGLE_CLIENT_ID is missing. Google sign-in will remain disabled.";
    requireGoogle ? addBlocker(message) : addWarn(message);
  } else if (hasPlaceholder(envValue("GOOGLE_CLIENT_ID"))) {
    addBlocker("GOOGLE_CLIENT_ID still contains placeholder text.");
  } else {
    addPass("GOOGLE_CLIENT_ID is configured.");
  }

  if (!envValue("GEMINI_API_KEY")) {
    const message = "GEMINI_API_KEY is missing. AI tutor features will use deterministic fallbacks.";
    requireGemini ? addBlocker(message) : addWarn(message);
  } else if (hasPlaceholder(envValue("GEMINI_API_KEY"))) {
    addBlocker("GEMINI_API_KEY still contains placeholder text.");
  } else {
    addPass("GEMINI_API_KEY is configured.");
  }

  if (!envValue("GEMINI_MODEL")) {
    addWarn("GEMINI_MODEL is missing; backend will default to gemini-2.5-flash.");
  } else {
    addPass("GEMINI_MODEL is configured.");
  }
}

function printSection(label, items) {
  if (!items.length) return;
  console.log(`\n${label}`);
  for (const item of items) console.log(`- ${item}`);
}

checkNodeEnv();
checkMongo();
checkRedis();
checkPresent("JWT_ACCESS_SECRET", { secret: true, minLength: 32 });
checkPresent("JWT_REFRESH_SECRET", { secret: true, minLength: 32 });
checkOrigins();
checkSmtp();
checkOptionalAiAndOAuth();

console.log("SkillPath backend predeploy check");
console.log(`Mode: ${strict ? "strict" : "report-only"}`);
printSection("Passes", passes);
printSection("Warnings", warnings);
printSection("Blockers", blockers);

if (blockers.length) {
  console.log(`\nResult: ${strict ? "failed" : "report has blockers"}`);
  process.exit(strict ? 1 : 0);
}

console.log("\nResult: passed");
