import CodingSubmission from "../models/CodingSubmission.js";
import Problem from "../models/Problem.js";
import { ERROR_CODES } from "../utils/errorCodes.js";
import { AppError } from "../utils/responseHandler.js";
import { executeCode } from "./judgeService.js";

function normalizeOutput(value = "") {
  return String(value)
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

function publicProblem(problem) {
  const raw = problem.toObject();
  return {
    ...raw,
    testCases: raw.testCases
      .filter((testCase) => !testCase.isHidden)
      .map((testCase) => ({
        _id: testCase._id,
        name: testCase.name,
        stdin: testCase.stdin,
        expectedOutput: testCase.expectedOutput,
        isHidden: false,
        points: testCase.points,
      })),
  };
}

function publicResult(result, revealHidden) {
  if (!result.hidden || revealHidden) return result;
  return {
    ...result,
    stdin: undefined,
    stdout: undefined,
    expectedOutput: undefined,
    stderr: result.verdict === "AC" ? "" : result.stderr,
  };
}

function summarizeVerdict(results) {
  if (results.every((item) => item.verdict === "AC")) return "AC";
  const priority = ["CE", "TLE", "RE", "WA"];
  return priority.find((verdict) => results.some((item) => item.verdict === verdict)) || "WA";
}

export async function listProblems(query = {}) {
  const filter = { isActive: true };
  if (query.difficulty) filter.difficulty = query.difficulty;
  if (query.tag) filter.tags = query.tag;

  const items = await Problem.find(filter)
    .select("-solutionCode")
    .sort({ difficulty: 1, createdAt: -1 });

  return items.map(publicProblem);
}

export async function getProblem(id) {
  const problem = await Problem.findById(id).select("-solutionCode");
  if (!problem || !problem.isActive) {
    throw new AppError("Problem not found", 404, ERROR_CODES.NOT_FOUND);
  }
  return publicProblem(problem);
}

export async function createProblem(payload, authorId) {
  return Problem.create({
    ...payload,
    authorId,
  });
}

export async function gradeProblem({ problemId, userId, language, sourceCode, mode = "run" }) {
  const problem = await Problem.findById(problemId);
  if (!problem || !problem.isActive) {
    throw new AppError("Problem not found", 404, ERROR_CODES.NOT_FOUND);
  }

  const normalizedLanguage = language.toLowerCase();
  if (!problem.supportedLanguages.includes(normalizedLanguage)) {
    throw new AppError(`Unsupported language for this problem: ${language}`, 400, ERROR_CODES.BAD_REQUEST);
  }

  const revealHidden = mode === "run";
  const testCases = mode === "run"
    ? problem.testCases.filter((testCase) => !testCase.isHidden)
    : problem.testCases;

  const results = [];
  for (const [index, testCase] of testCases.entries()) {
    const execution = await executeCode({
      language: normalizedLanguage,
      sourceCode,
      stdin: testCase.stdin,
      timeLimitMs: problem.timeLimitMs,
      memoryLimitMb: problem.memoryLimitMb,
    });

    const expected = normalizeOutput(testCase.expectedOutput);
    const actual = normalizeOutput(execution.stdout);
    const verdict = execution.status === "AC"
      ? actual === expected ? "AC" : "WA"
      : execution.status;

    results.push(publicResult({
      name: testCase.name || `Case ${index + 1}`,
      verdict,
      status: execution.provider,
      stdin: testCase.stdin,
      stdout: execution.stdout,
      stderr: execution.stderr,
      expectedOutput: testCase.expectedOutput,
      timeMs: execution.timeMs,
      hidden: Boolean(testCase.isHidden),
    }, revealHidden));
  }

  const verdict = summarizeVerdict(results);
  const passedCount = results.filter((item) => item.verdict === "AC").length;

  const payload = {
    problemId: problem._id,
    language: normalizedLanguage,
    verdict,
    passedCount,
    totalCount: results.length,
    results,
  };

  if (mode === "submit") {
    const submission = await CodingSubmission.create({
      userId,
      sourceCode,
      ...payload,
    });
    return { ...payload, submissionId: submission._id };
  }

  return payload;
}
