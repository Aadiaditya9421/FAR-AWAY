import vm from "node:vm";
import { spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { env } from "../config/env.js";
import { ERROR_CODES } from "../utils/errorCodes.js";
import { AppError } from "../utils/responseHandler.js";

const JUDGE0_LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  cpp: 54,
  java: 62,
};

const PISTON_LANGUAGE_ALIASES = {
  javascript: ["javascript", "node", "nodejs"],
  python: ["python", "python3"],
  cpp: ["cpp", "c++", "gcc"],
  java: ["java"],
};

const PISTON_FILENAMES = {
  javascript: "main.js",
  python: "main.py",
  cpp: "main.cpp",
  java: "Main.java",
};

let pistonRuntimeCache = null;

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

function pistonBaseUrl() {
  return env.pistonUrl.replace(/\/$/, "");
}

async function getPistonRuntimes() {
  if (pistonRuntimeCache) return pistonRuntimeCache;

  const response = await fetch(`${pistonBaseUrl()}/runtimes`);
  if (!response.ok) {
    throw new AppError("Piston runtime discovery failed", 502, ERROR_CODES.INTERNAL_ERROR);
  }
  pistonRuntimeCache = await response.json();
  return pistonRuntimeCache;
}

async function getPistonRuntime(language) {
  const aliases = PISTON_LANGUAGE_ALIASES[language] || [language];
  const runtimes = await getPistonRuntimes();
  const runtime = runtimes.find((item) => {
    const names = [item.language, ...(item.aliases || [])].map((value) => String(value).toLowerCase());
    return aliases.some((alias) => names.includes(alias));
  });

  if (!runtime) {
    throw new AppError(`Piston runtime is unavailable for ${language}`, 503, ERROR_CODES.INTERNAL_ERROR);
  }

  return runtime;
}

function mapPistonStatus(body = {}) {
  const compile = body.compile || {};
  const run = body.run || {};
  if (compile.code && compile.code !== 0) return "CE";
  if (run.signal && String(run.signal).toUpperCase().includes("KILL")) return "TLE";
  if (run.code && run.code !== 0) return "RE";
  return "AC";
}

async function executeWithPiston({ language, sourceCode, stdin, timeLimitMs, memoryLimitMb }) {
  const runtime = await getPistonRuntime(language);
  const response = await fetch(`${pistonBaseUrl()}/execute`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      language: runtime.language,
      version: runtime.version,
      files: [{ name: PISTON_FILENAMES[language] || "main.txt", content: sourceCode }],
      stdin,
      compile_timeout: timeLimitMs,
      run_timeout: timeLimitMs,
      compile_memory_limit: memoryLimitMb * 1024 * 1024,
      run_memory_limit: memoryLimitMb * 1024 * 1024,
    }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new AppError("Piston execution failed", 502, ERROR_CODES.INTERNAL_ERROR, body);
  }

  return {
    stdout: body?.run?.stdout || "",
    stderr: body?.compile?.stderr || body?.compile?.output || body?.run?.stderr || "",
    exitCode: body?.run?.code || 0,
    timeMs: 0,
    memoryKb: 0,
    status: mapPistonStatus(body),
    provider: "piston",
  };
}

function executeLocalJavaScript({ sourceCode, stdin, timeLimitMs }) {
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
      name: "skillpath-local-js-runner",
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

function runProcess(command, args, { stdin = "", cwd, timeoutMs }) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const child = spawn(command, args, {
      cwd,
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr,
        code,
        timedOut,
        timeMs: Date.now() - startedAt,
      });
    });

    child.stdin.end(stdin);
  });
}

async function withTempDir(work) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), `skillpath-judge-${crypto.randomUUID()}-`));
  try {
    return await work(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

function localCompilerMissing(language, err) {
  if (err?.code !== "ENOENT") return err;
  return new AppError(
    `Execution runtime for ${language} is not installed on the server worker`,
    503,
    ERROR_CODES.INTERNAL_ERROR,
  );
}

async function executeLocalPython({ sourceCode, stdin, timeLimitMs }) {
  return withTempDir(async (dir) => {
    await fs.writeFile(path.join(dir, "main.py"), sourceCode);
    const command = process.platform === "win32" ? "python" : "python3";
    const run = await runProcess(command, ["main.py"], { stdin, cwd: dir, timeoutMs: timeLimitMs })
      .catch((err) => { throw localCompilerMissing("python", err); });
    return {
      stdout: run.stdout,
      stderr: run.stderr,
      exitCode: run.code,
      timeMs: run.timeMs,
      memoryKb: 0,
      status: run.timedOut ? "TLE" : run.code === 0 ? "AC" : "RE",
      provider: "local-compiler",
    };
  });
}

async function executeLocalCpp({ sourceCode, stdin, timeLimitMs, memoryLimitMb }) {
  return withTempDir(async (dir) => {
    const sourcePath = path.join(dir, "main.cpp");
    const outputName = process.platform === "win32" ? "main.exe" : "main";
    const outputPath = path.join(dir, outputName);
    await fs.writeFile(sourcePath, sourceCode);

    const compile = await runProcess("g++", ["-std=c++17", "-O2", sourcePath, "-o", outputPath], {
      cwd: dir,
      timeoutMs: Math.max(timeLimitMs, 15000),
    }).catch((err) => { throw localCompilerMissing("cpp", err); });
    if (compile.timedOut || compile.code !== 0) {
      return {
        stdout: "",
        stderr: compile.stderr || compile.stdout,
        exitCode: compile.code,
        timeMs: compile.timeMs,
        memoryKb: memoryLimitMb * 1024,
        status: compile.timedOut ? "TLE" : "CE",
        provider: "local-compiler",
      };
    }

    const runCommand = process.platform === "win32" ? outputPath : `./${outputName}`;
    const run = await runProcess(runCommand, [], { stdin, cwd: dir, timeoutMs: timeLimitMs });
    return {
      stdout: run.stdout,
      stderr: run.stderr,
      exitCode: run.code,
      timeMs: run.timeMs,
      memoryKb: 0,
      status: run.timedOut ? "TLE" : run.code === 0 ? "AC" : "RE",
      provider: "local-compiler",
    };
  });
}

async function executeLocalJava({ sourceCode, stdin, timeLimitMs, memoryLimitMb }) {
  return withTempDir(async (dir) => {
    await fs.writeFile(path.join(dir, "Main.java"), sourceCode);
    const compile = await runProcess("javac", ["Main.java"], {
      cwd: dir,
      timeoutMs: Math.max(timeLimitMs, 15000),
    }).catch((err) => { throw localCompilerMissing("java", err); });
    if (compile.timedOut || compile.code !== 0) {
      return {
        stdout: "",
        stderr: compile.stderr || compile.stdout,
        exitCode: compile.code,
        timeMs: compile.timeMs,
        memoryKb: memoryLimitMb * 1024,
        status: compile.timedOut ? "TLE" : "CE",
        provider: "local-compiler",
      };
    }

    const run = await runProcess("java", ["Main"], { stdin, cwd: dir, timeoutMs: timeLimitMs })
      .catch((err) => { throw localCompilerMissing("java", err); });
    return {
      stdout: run.stdout,
      stderr: run.stderr,
      exitCode: run.code,
      timeMs: run.timeMs,
      memoryKb: 0,
      status: run.timedOut ? "TLE" : run.code === 0 ? "AC" : "RE",
      provider: "local-compiler",
    };
  });
}

async function executeWithLocalCompiler(payload) {
  const language = payload.language;
  if (language === "javascript") return executeLocalJavaScript(payload);
  if (language === "python") return executeLocalPython(payload);
  if (language === "cpp") return executeLocalCpp(payload);
  if (language === "java") return executeLocalJava(payload);
  throw new AppError(`Server execution runtime does not support ${language}`, 400, ERROR_CODES.BAD_REQUEST);
}

export async function executeCode(payload) {
  const language = (payload.language || "").toLowerCase();

  if (env.judge0Url) {
    return executeWithJudge0({ ...payload, language });
  }

  if (env.localCompilerEnabled) {
    return executeWithLocalCompiler({ ...payload, language });
  }

  if (env.pistonEnabled && env.pistonUrl) {
    return executeWithPiston({ ...payload, language });
  }

  if (language === "javascript") {
    return executeLocalJavaScript({ ...payload, language });
  }

  throw new AppError(
    "Only JavaScript is available without a Judge0, Piston, or local execution runtime configured",
    503,
    ERROR_CODES.INTERNAL_ERROR,
  );
}
