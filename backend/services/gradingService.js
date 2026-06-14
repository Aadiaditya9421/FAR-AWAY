import CodingSubmission from "../models/CodingSubmission.js";
import Problem from "../models/Problem.js";
import { env } from "../config/env.js";
import { ERROR_CODES } from "../utils/errorCodes.js";
import { AppError } from "../utils/responseHandler.js";
import { executeCode } from "./judgeService.js";
import { updateLeaderboardForSubmission } from "./leaderboardService.js";

const BASE_LANGUAGES = ["javascript"];
const JUDGE0_LANGUAGES = ["javascript", "python", "cpp", "java"];

function enabledLanguages() {
  return env.judge0Url || env.localCompilerEnabled || (env.pistonEnabled && env.pistonUrl) ? JUDGE0_LANGUAGES : BASE_LANGUAGES;
}

function compilerProvider() {
  if (env.judge0Url) return "judge0";
  if (env.localCompilerEnabled) return "local-compiler";
  if (env.pistonEnabled && env.pistonUrl) return "piston";
  return "local-js";
}

function starterCodeFor(language) {
  const starters = {
    javascript: "const data = input.trim().split(/\\s+/);\\nconsole.log(data.join(' '));",
    python: "import sys\\n\\ndata = sys.stdin.read().strip().split()\\nprint(' '.join(data))",
    cpp: "#include <bits/stdc++.h>\\nusing namespace std;\\n\\nint main() {\\n    ios::sync_with_stdio(false);\\n    cin.tie(nullptr);\\n\\n    string x;\\n    vector<string> data;\\n    while (cin >> x) data.push_back(x);\\n    for (size_t i = 0; i < data.size(); ++i) {\\n        if (i) cout << ' ';\\n        cout << data[i];\\n    }\\n    return 0;\\n}",
    java: "import java.io.*;\\nimport java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) throws Exception {\\n        Scanner sc = new Scanner(System.in);\\n        List<String> data = new ArrayList<>();\\n        while (sc.hasNext()) data.add(sc.next());\\n        System.out.println(String.join(\" \", data));\\n    }\\n}",
  };
  return starters[language] || "";
}

const DEFAULT_PROBLEM_BANK = [
  {
    title: "Add Two Numbers",
    slug: "add-two-numbers",
    statement: "Read two integers from standard input and print their sum.",
    difficulty: "easy",
    tags: ["warmup", "math", "stdin"],
    inputFormat: "Two integers a and b.",
    outputFormat: "Print a single integer: a + b.",
    constraints: ["-1000000000 <= a, b <= 1000000000"],
    testCases: [
      { name: "Sample 1", stdin: "2 3", expectedOutput: "5", isHidden: false },
      { name: "Sample 2", stdin: "-5 8", expectedOutput: "3", isHidden: false },
      { name: "Hidden 1", stdin: "1000000000 -1", expectedOutput: "999999999", isHidden: true },
    ],
  },
  {
    title: "Maximum in Array",
    slug: "maximum-in-array",
    statement: "Given n integers, print the maximum value in the array.",
    difficulty: "easy",
    tags: ["arrays", "loops"],
    inputFormat: "First line contains n. Second line contains n integers.",
    outputFormat: "Print the maximum integer.",
    constraints: ["1 <= n <= 100000", "-1000000000 <= ai <= 1000000000"],
    testCases: [
      { name: "Sample 1", stdin: "5\n1 9 3 7 2", expectedOutput: "9", isHidden: false },
      { name: "Sample 2", stdin: "4\n-8 -2 -10 -3", expectedOutput: "-2", isHidden: false },
      { name: "Hidden 1", stdin: "1\n42", expectedOutput: "42", isHidden: true },
    ],
  },
  {
    title: "Count Vowels",
    slug: "count-vowels",
    statement: "Read a string and print how many vowels it contains. Count both uppercase and lowercase vowels.",
    difficulty: "easy",
    tags: ["strings"],
    inputFormat: "One line containing a string.",
    outputFormat: "Print the vowel count.",
    constraints: ["1 <= length <= 100000"],
    testCases: [
      { name: "Sample 1", stdin: "SkillPath", expectedOutput: "3", isHidden: false },
      { name: "Sample 2", stdin: "BCDFG", expectedOutput: "0", isHidden: false },
      { name: "Hidden 1", stdin: "Education", expectedOutput: "5", isHidden: true },
    ],
  },
  {
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    statement: "Given a string containing only brackets (), {}, and [], print YES if it is balanced, otherwise print NO.",
    difficulty: "medium",
    tags: ["stack", "strings"],
    inputFormat: "One bracket string.",
    outputFormat: "Print YES or NO.",
    constraints: ["1 <= length <= 100000"],
    testCases: [
      { name: "Sample 1", stdin: "{[()]}", expectedOutput: "YES", isHidden: false },
      { name: "Sample 2", stdin: "{[(])}", expectedOutput: "NO", isHidden: false },
      { name: "Hidden 1", stdin: "(((())))[]{}", expectedOutput: "YES", isHidden: true },
    ],
  },
  {
    title: "Fibonacci Number",
    slug: "fibonacci-number",
    statement: "Given n, print the nth Fibonacci number where F(0)=0 and F(1)=1.",
    difficulty: "medium",
    tags: ["dp", "math"],
    inputFormat: "One integer n.",
    outputFormat: "Print F(n).",
    constraints: ["0 <= n <= 45"],
    testCases: [
      { name: "Sample 1", stdin: "7", expectedOutput: "13", isHidden: false },
      { name: "Sample 2", stdin: "0", expectedOutput: "0", isHidden: false },
      { name: "Hidden 1", stdin: "20", expectedOutput: "6765", isHidden: true },
    ],
  },
];

function withLanguageDefaults(problem) {
  return {
    ...problem,
    supportedLanguages: JUDGE0_LANGUAGES,
    starterCode: JUDGE0_LANGUAGES.map((language) => ({ language, code: starterCodeFor(language) })),
    timeLimitMs: 2000,
    memoryLimitMb: 128,
    isActive: true,
  };
}

async function ensureDefaultProblemBank() {
  const activeCount = await Problem.countDocuments({ isActive: true });
  if (activeCount > 0) return;

  await Promise.all(
    DEFAULT_PROBLEM_BANK.map((problem) =>
      Problem.updateOne(
        { slug: problem.slug },
        { $setOnInsert: withLanguageDefaults(problem) },
        { upsert: true },
      ),
    ),
  );
}

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
  const runtimeLanguages = enabledLanguages();
  const supportedLanguages = [...new Set([...(raw.supportedLanguages || []), ...runtimeLanguages])];
  const starterLanguages = new Set((raw.starterCode || []).map((item) => item.language));
  const starterCode = [
    ...(raw.starterCode || []),
    ...supportedLanguages
      .filter((language) => !starterLanguages.has(language))
      .map((language) => ({ language, code: starterCodeFor(language) })),
  ];

  return {
    ...raw,
    runtimeLanguages,
    supportedLanguages,
    starterCode,
    compilerProvider: compilerProvider(),
    totalTestCases: raw.testCases.length,
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
  await ensureDefaultProblemBank();
  const filter = { isActive: true };
  if (query.difficulty) filter.difficulty = query.difficulty;
  if (query.tag) filter.tags = query.tag;

  const items = await Problem.find(filter)
    .select("-solutionCode")
    .sort({ difficulty: 1, createdAt: -1 });

  return items.map(publicProblem);
}

export async function getProblem(id) {
  await ensureDefaultProblemBank();
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
  const runtimeLanguages = enabledLanguages();
  const declaredLanguages = problem.supportedLanguages?.length ? problem.supportedLanguages : runtimeLanguages;
  if (!declaredLanguages.includes(normalizedLanguage) && !runtimeLanguages.includes(normalizedLanguage)) {
    throw new AppError(`Unsupported language for this problem: ${language}`, 400, ERROR_CODES.BAD_REQUEST);
  }
  if (!runtimeLanguages.includes(normalizedLanguage)) {
    throw new AppError(`Compiler for ${language} is not configured`, 503, ERROR_CODES.INTERNAL_ERROR);
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

    const score = results.length ? Math.round((passedCount / results.length) * 100) : 0;
    await updateLeaderboardForSubmission({
      userId,
      topic: "Coding",
      score,
      coinsEarned: 0,
    });

    return { ...payload, submissionId: submission._id };
  }

  return payload;
}
