import vm from "node:vm";
import { env, isProduction } from "../config/env.js";
import { ERROR_CODES } from "../utils/errorCodes.js";
import { AppError } from "../utils/responseHandler.js";

const JUDGE0_LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  cpp: 54,
  java: 62,
};

function mapJudge0Status(status = {}) {
  const id = status.id;
  if (id === 3) return "AC";
  if (id === 4) return "WA";
  if (id === 5) return "TLE";
  if (id === 6) return "CE";
  return "RE";
}

async function executeWithJudge0({ language, sourceCode, stdin, timeLimitMs, memoryLimitMb }) {
  const languageId = JUDGE0_LANGUAGE_IDS[language];
  if (!languageId) {
    throw new AppError(`Language is not supported by Judge0 adapter: ${language}`, 400, ERROR_CODES.BAD_REQUEST);
  }

  const headers = { "content-type": "application/json" };
  if (env.judge0ApiKey) headers["x-auth-token"] = env.judge0ApiKey;

  const response = await fetch(`${env.judge0Url.replace(/\/$/, "")}/submissions?base64_encoded=false&wait=true`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      source_code: sourceCode,
      language_id: languageId,
      stdin,
      cpu_time_limit: Math.max(1, Math.ceil(timeLimitMs / 1000)),
      memory_limit: memoryLimitMb * 1024,
    }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new AppError("Judge0 execution failed", 502, ERROR_CODES.INTERNAL_ERROR, body);
  }

  return {
    stdout: body.stdout || "",
    stderr: body.stderr || body.compile_output || "",
    exitCode: body.status?.id === 3 ? 0 : 1,
    timeMs: Number(body.time || 0) * 1000,
    memoryKb: body.memory || 0,
    status: mapJudge0Status(body.status),
    provider: "judge0",
  };
}

function executeLocalJavaScript({ sourceCode, stdin, timeLimitMs }) {
  if (isProduction) {
    throw new AppError("Code execution provider is not configured", 503, ERROR_CODES.INTERNAL_ERROR);
  }

  const output = [];
  const errorOutput = [];
  const lines = String(stdin || "").replace(/\r\n/g, "\n").split("\n");
  let lineIndex = 0;
  const startedAt = Date.now();

  const sandbox = {
    input: String(stdin || ""),
    readline: () => lines[lineIndex++] ?? "",
    console: {
      log: (...args) => output.push(args.join(" ")),
      error: (...args) => errorOutput.push(args.join(" ")),
    },
    Math,
    Number,
    String,
    Boolean,
    Array,
    Object,
    JSON,
    Set,
    Map,
  };

  try {
    const context = vm.createContext(sandbox, {
      name: "far-away-local-js-runner",
      codeGeneration: { strings: false, wasm: false },
    });
    const script = new vm.Script(sourceCode, { filename: "submission.js" });
    script.runInContext(context, { timeout: timeLimitMs });

    return {
      stdout: output.join("\n"),
      stderr: errorOutput.join("\n"),
      exitCode: 0,
      timeMs: Date.now() - startedAt,
      memoryKb: 0,
      status: "AC",
      provider: "local-js-preview",
    };
  } catch (err) {
    const message = err?.message || "Runtime error";
    const timedOut = message.toLowerCase().includes("script execution timed out");

    return {
      stdout: output.join("\n"),
      stderr: message,
      exitCode: 1,
      timeMs: Date.now() - startedAt,
      memoryKb: 0,
      status: timedOut ? "TLE" : err?.name === "SyntaxError" ? "CE" : "RE",
      provider: "local-js-preview",
    };
  }
}

export async function executeCode(payload) {
  const language = (payload.language || "").toLowerCase();

  if (env.judge0Url) {
    return executeWithJudge0({ ...payload, language });
  }

  if (language === "javascript") {
    return executeLocalJavaScript({ ...payload, language });
  }

  throw new AppError(
    "Only JavaScript is available without a Judge0 provider configured",
    503,
    ERROR_CODES.INTERNAL_ERROR,
  );
}
