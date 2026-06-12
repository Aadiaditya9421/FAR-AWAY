import fs from "node:fs";
import path from "node:path";

const args = new Set(process.argv.slice(2));
const strict = args.has("--strict") || process.env.PREDEPLOY_STRICT === "true";
const requireGoogle = args.has("--require-google") || process.env.REQUIRE_GOOGLE_AUTH === "true";
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

function checkApiUrl() {
  const apiUrl = value("VITE_API_URL");
  if (!apiUrl) {
    addBlocker("VITE_API_URL is missing.");
    return;
  }

  if (hasPlaceholder(apiUrl)) {
    addBlocker("VITE_API_URL still contains placeholder text.");
    return;
  }

  if (apiUrl === "/api") {
    addPass("VITE_API_URL uses same-origin /api proxy.");
    return;
  }

  if (!apiUrl.startsWith("https://")) {
    addWarn("VITE_API_URL is not HTTPS. Use HTTPS for global deployment.");
  } else {
    addPass("VITE_API_URL is HTTPS.");
  }

  if (!apiUrl.endsWith("/api")) {
    addWarn("VITE_API_URL should usually include the /api suffix.");
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

checkApiUrl();
checkGoogleClient();

console.log("Far Away frontend predeploy check");
console.log(`Mode: ${strict ? "strict" : "report-only"}`);
printSection("Passes", passes);
printSection("Warnings", warnings);
printSection("Blockers", blockers);

if (blockers.length) {
  console.log(`\nResult: ${strict ? "failed" : "report has blockers"}`);
  process.exit(strict ? 1 : 0);
}

console.log("\nResult: passed");
