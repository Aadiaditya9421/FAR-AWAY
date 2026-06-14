import fs from "node:fs";
import path from "node:path";

const args = new Set(process.argv.slice(2));
const strict = args.has("--strict") || process.env.PREDEPLOY_STRICT === "true";
const requireGoogle = args.has("--require-google") || process.env.REQUIRE_GOOGLE_AUTH === "true";
const probeApi = args.has("--probe-api") || process.env.PREDEPLOY_PROBE_API === "true";
const isVercel = process.env.VERCEL === "1";
const root = process.cwd();

const blockers = [];
const warnings = [];
const passes = [];

function parseEnvFile(fileName) {
  const filePath = path.join(root, fileName);
  if (!fs.existsSync(filePath)) return {};

  return Object.fromEntries(
    fs.readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        const key = line.slice(0, index).trim();
        const value = line.slice(index + 1).trim().replace(/^["']|["']$/g, "");
        return [key, value];
      }),
  );
}

const fileEnv = {
  ...parseEnvFile(".env.production.example"),
  ...parseEnvFile(".env.production"),
  ...parseEnvFile(".env"),
};

function value(name) {
  return process.env[name] || fileEnv[name] || "";
}

function hasPlaceholder(input = "") {
  return /your-|example\.com|your-backend-domain|your-google-oauth/i.test(input);
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

function getApiUrl() {
  return value("VITE_API_URL");
}

function normalizeApiUrlForChecks(apiUrl) {
  const trimmed = String(apiUrl || "").trim().replace(/\/+$/, "");
  if (!trimmed || trimmed.startsWith("/")) return trimmed;

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withProtocol.endsWith("/api") ? withProtocol : `${withProtocol}/api`;
}

function checkApiUrl() {
  const apiUrl = getApiUrl();
  if (!apiUrl) {
    addBlocker("VITE_API_URL is missing.");
    return;
  }

  if (hasPlaceholder(apiUrl)) {
    addBlocker("VITE_API_URL still contains placeholder text.");
    return;
  }

  if (apiUrl === "/api") {
    if (isVercel && process.env.SKILLPATH_ALLOW_VERCEL_API_PROXY !== "true") {
      const message =
        "VITE_API_URL=/api only works on Vercel when a real /api proxy is configured. For Vercel + Railway, set VITE_API_URL to the Railway backend URL ending in /api.";
      strict ? addBlocker(message) : addWarn(message);
      return;
    }
    addPass("VITE_API_URL uses same-origin /api proxy.");
    return;
  }

  if (apiUrl.startsWith("/")) {
    const message = "VITE_API_URL is a relative path other than /api. Use /api or an HTTPS backend URL.";
    strict ? addBlocker(message) : addWarn(message);
    return;
  }

  const normalizedApiUrl = normalizeApiUrlForChecks(apiUrl);

  if (!/^https?:\/\//i.test(apiUrl)) {
    addWarn(`VITE_API_URL is missing https:// and will be normalized to ${normalizedApiUrl}.`);
  }

  if (/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::|\/|$)/i.test(normalizedApiUrl)) {
    const message = "VITE_API_URL points to localhost. Deployed browsers cannot reach your local backend.";
    strict ? addBlocker(message) : addWarn(message);
    return;
  }

  if (!normalizedApiUrl.startsWith("https://")) {
    const message = "VITE_API_URL is not HTTPS. Use HTTPS for global deployment.";
    strict ? addBlocker(message) : addWarn(message);
  } else {
    addPass("VITE_API_URL is HTTPS.");
  }

  if (!normalizedApiUrl.endsWith("/api")) {
    const message = "VITE_API_URL must include the /api suffix for this frontend.";
    strict ? addBlocker(message) : addWarn(message);
  }
}

async function probeApiHealth() {
  if (!probeApi) return;

  const apiUrl = normalizeApiUrlForChecks(getApiUrl());
  if (!apiUrl || hasPlaceholder(apiUrl) || apiUrl.startsWith("/")) return;

  const healthUrl = `${apiUrl.replace(/\/+$/, "")}/health`;
  let controller;
  let timeout;

  if (typeof AbortController !== "undefined") {
    controller = new AbortController();
    timeout = setTimeout(() => controller.abort(), 10000);
  }

  try {
    const response = await fetch(healthUrl, { signal: controller?.signal });
    if (!response.ok) {
      const message = `VITE_API_URL health probe returned HTTP ${response.status}: ${healthUrl}`;
      strict ? addBlocker(message) : addWarn(message);
      return;
    }

    addPass("VITE_API_URL health probe responded successfully.");
  } catch (error) {
    const message = `VITE_API_URL health probe failed: ${healthUrl} (${error.message})`;
    strict ? addBlocker(message) : addWarn(message);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function checkGoogleClient() {
  const clientId = value("VITE_GOOGLE_CLIENT_ID");
  if (!clientId) {
    const message = "VITE_GOOGLE_CLIENT_ID is missing. Google button should remain disabled.";
    requireGoogle ? addBlocker(message) : addWarn(message);
    return;
  }

  if (hasPlaceholder(clientId)) {
    addBlocker("VITE_GOOGLE_CLIENT_ID still contains placeholder text.");
    return;
  }

  addPass("VITE_GOOGLE_CLIENT_ID is configured.");
}

function printSection(label, items) {
  if (!items.length) return;
  console.log(`\n${label}`);
  for (const item of items) console.log(`- ${item}`);
}

async function main() {
  checkApiUrl();
  checkGoogleClient();
  await probeApiHealth();

  console.log("SkillPath frontend predeploy check");
  console.log(`Mode: ${strict ? "strict" : "report-only"}`);
  printSection("Passes", passes);
  printSection("Warnings", warnings);
  printSection("Blockers", blockers);

  if (blockers.length) {
    console.log(`\nResult: ${strict ? "failed" : "report has blockers"}`);
    process.exit(strict ? 1 : 0);
  }

  console.log("\nResult: passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
