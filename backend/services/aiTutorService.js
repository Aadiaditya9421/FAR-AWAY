import { GoogleGenerativeAI } from "@google/generative-ai";
import Assessment from "../models/Assessment.js";
import Problem from "../models/Problem.js";
import QuestionBank from "../models/QuestionBank.js";
import Submission from "../models/Submission.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { ERROR_CODES } from "../utils/errorCodes.js";
import { AppError } from "../utils/responseHandler.js";

let genAI = null;
if (env.geminiApiKey) {
  genAI = new GoogleGenerativeAI(env.geminiApiKey);
}

function clampHintLevel(level) {
  const parsed = Number(level) || 1;
  return Math.max(1, Math.min(3, parsed));
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function redactCorrectAnswer(text, correctAnswer) {
  const answer = String(correctAnswer || "").trim();
  if (!answer || answer.length < 2) return text;
  return text.replace(new RegExp(escapeRegExp(answer), "gi"), "the best-supported choice");
}

function getQuestionTitle(question) {
  return question.title || question.text || "this question";
}

function getQuestionConcept(question, assessment) {
  return question.subtopic || question.topic || assessment.topic || "the core concept";
}

function deterministicHint(question, assessment, studentAnswer, hintLevel) {
  const title = getQuestionTitle(question);
  const concept = getQuestionConcept(question, assessment);
  const answerText = String(studentAnswer || "").trim();
  const options = question.options?.length
    ? ` The available choices are: ${question.options.join(", ")}.`
    : "";

  if (hintLevel === 1) {
    return `Focus on the rule behind ${concept}. Restate the question in your own words first, then look for the option or answer that directly matches that rule.`;
  }

  if (hintLevel === 2) {
    const currentChoice = answerText
      ? ` Treat your current answer, "${answerText}", as a hypothesis and test whether it explains every word in the prompt.`
      : " Pick a likely answer, then challenge it against the exact wording of the prompt.";
    return `The key clue is in: "${title}".${currentChoice}${options} Eliminate any choice that describes a related idea but does not answer the specific question.`;
  }

  return `Work it through in three steps: identify the concept being tested (${concept}), map the prompt to the definition or behavior of that concept, then choose the response with no extra assumptions. If two answers feel close, prefer the one that matches the exact wording of the question.`;
}

async function resolveQuestionForHint({ assessmentId, questionId }) {
  const assessment = await Assessment.findById(assessmentId).select("+questions.correctAnswer");
  if (!assessment) {
    throw new AppError("Assessment not found", 404, ERROR_CODES.NOT_FOUND);
  }

  const staticQuestion = assessment.questions.id(questionId);
  if (staticQuestion) {
    return {
      assessment,
      question: staticQuestion.toObject(),
    };
  }

  const bankQuestion = await QuestionBank.findById(questionId).select("+correctAnswer");
  if (!bankQuestion) {
    throw new AppError("Question not found", 404, ERROR_CODES.NOT_FOUND);
  }

  return {
    assessment,
    question: bankQuestion.toObject(),
  };
}

async function generateGeminiHint({ question, assessment, studentAnswer, hintLevel }) {
  const prompt = `
You are an AI Tutor on Far Away.
Create one short hint for a student currently taking a quiz.

Assessment topic: ${assessment.topic}
Question: ${getQuestionTitle(question)}
Description: ${question.description || ""}
Options: ${JSON.stringify(question.options || [])}
Student's current answer: ${studentAnswer || "No answer selected yet"}
Correct answer, for your private reasoning only: ${question.correctAnswer || ""}
Hint level: ${hintLevel} of 3

Rules:
- Do not reveal the correct answer.
- Do not say whether the student's current answer is correct.
- Level 1 should be a gentle concept nudge.
- Level 2 may point to a key clue or elimination strategy.
- Level 3 may give a step-by-step solving approach, still without revealing the final answer.
- Return plain text only, 1-2 sentences.
`;

  const model = genAI.getGenerativeModel({ model: env.geminiModel });
  const result = await model.generateContent(prompt);
  return redactCorrectAnswer(result.response.text().trim(), question.correctAnswer);
}

export async function generateQuizHint({ assessmentId, questionId, studentAnswer = "", hintLevel = 1 }) {
  const level = clampHintLevel(hintLevel);
  const { assessment, question } = await resolveQuestionForHint({ assessmentId, questionId });

  if (!genAI) {
    return {
      hint: deterministicHint(question, assessment, studentAnswer, level),
      hintLevel: level,
      source: "deterministic",
    };
  }

  try {
    return {
      hint: await generateGeminiHint({ question, assessment, studentAnswer, hintLevel: level }),
      hintLevel: level,
      source: "gemini",
    };
  } catch (err) {
    logger.warn("Gemini API call failed for quiz hint; using fallback.", {
      error: err.message,
    });
    return {
      hint: deterministicHint(question, assessment, studentAnswer, level),
      hintLevel: level,
      source: "deterministic",
    };
  }
}

function canReviewSubmission(submission, reviewer) {
  if (reviewer.role === "admin") return true;
  const createdBy = submission.assessmentId?.createdBy;
  return Boolean(createdBy && createdBy.toString() === reviewer._id.toString());
}

function getDisplayName(user) {
  if (!user || typeof user === "string") return "Student";
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email || "Student";
}

function truncate(value, max = 90) {
  const text = String(value || "").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3)}...`;
}

function deterministicStudyNote({ submission, answerRows }) {
  const studentName = getDisplayName(submission.userId);
  const firstName = studentName.split(" ")[0] || "there";
  const assessmentTitle = submission.assessmentId?.title || "the assessment";
  const wrongRows = answerRows.filter((answer) => !answer.isCorrect);
  const score = Math.round(submission.score || 0);

  if (wrongRows.length === 0) {
    return `Hi ${firstName},

Fantastic work on ${assessmentTitle}. You scored ${score}% and showed strong command of every checked concept. For the next step, try a harder assessment in the same topic or help a peer explain one of these ideas in SkillSwap.

Keep the momentum going.`;
  }

  const reviewList = wrongRows
    .slice(0, 4)
    .map((answer, index) => {
      const userAnswer = answer.userAnswer || "blank";
      const correctAnswer = answer.correctAnswer || "review the answer key";
      return `${index + 1}. ${truncate(answer.text)}
   Your answer: ${userAnswer}
   Correct concept: ${correctAnswer}`;
    })
    .join("\n");

  return `Hi ${firstName},

Good effort on ${assessmentTitle}. Your score is ${score}%, and the main opportunity is to revisit the concepts behind these responses:
${reviewList}

Study tips:
- Rework these questions slowly and write the rule each one is testing before choosing an answer.
- Make a two-column note: "my misconception" and "correct rule" for each missed item.
- After reviewing, retake a short quiz in this topic to confirm the pattern has clicked.

You are closer than the score may feel. A focused review pass should make the next attempt much stronger.`;
}

async function resolveAnswerRows(submission) {
  const assessmentQuestions = submission.assessmentId?.questions || [];
  const assessmentQuestionTextById = new Map(
    assessmentQuestions
      .filter((question) => question._id)
      .map((question) => [question._id.toString(), question.title]),
  );

  const questionIds = submission.answers
    .map((answer) => answer.questionId?.toString())
    .filter(Boolean);

  const bankQuestions = questionIds.length
    ? await QuestionBank.find({ _id: { $in: questionIds } }).select("title topic subtopic")
    : [];

  const bankQuestionTextById = new Map(
    bankQuestions.map((question) => [
      question._id.toString(),
      [question.title, question.subtopic || question.topic].filter(Boolean).join(" - "),
    ]),
  );

  return submission.answers.map((answer, index) => {
    const id = answer.questionId?.toString();
    return {
      questionId: id,
      text: assessmentQuestionTextById.get(id) || bankQuestionTextById.get(id) || `Question ${index + 1}`,
      userAnswer: answer.userAnswer,
      correctAnswer: answer.correctAnswer,
      isCorrect: Boolean(answer.isCorrect),
    };
  });
}

async function generateGeminiStudyNote({ submission, answerRows }) {
  const studentName = getDisplayName(submission.userId);
  const assessmentTitle = submission.assessmentId?.title || "the assessment";
  const wrongRows = answerRows.filter((answer) => !answer.isCorrect);

  const prompt = `
You are an AI Tutor helping a teacher write a study note for a student.

Student: ${studentName}
Assessment: ${assessmentTitle}
Topic: ${submission.assessmentId?.topic || "General"}
Score: ${Math.round(submission.score || 0)}%
Correct answers: ${submission.correctCount}
Incorrect answers: ${submission.incorrectCount}

Missed questions:
${wrongRows.length ? wrongRows.map((answer, index) => `${index + 1}. ${answer.text}
Student answer: ${answer.userAnswer || "blank"}
Correct answer: ${answer.correctAnswer || "not provided"}`).join("\n") : "None. The student answered every checked question correctly."}

Write a warm teacher-facing feedback note that can be sent directly to the student.
Keep it under 180 words. Include 2-3 concrete study tips. Do not mention database IDs or internal scoring systems.
Return plain text only.
`;

  const model = genAI.getGenerativeModel({ model: env.geminiModel });
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

export async function generateStudyNoteForSubmission({ submissionId, reviewer }) {
  const submission = await Submission.findById(submissionId)
    .populate("userId", "firstName lastName email")
    .populate("assessmentId", "title topic difficulty createdBy questions.title");

  if (!submission) {
    throw new AppError("Submission not found", 404, ERROR_CODES.NOT_FOUND);
  }

  if (!canReviewSubmission(submission, reviewer)) {
    throw new AppError("You do not have permission to review this submission", 403, ERROR_CODES.FORBIDDEN);
  }

  const answerRows = await resolveAnswerRows(submission);

  if (!genAI) {
    return {
      note: deterministicStudyNote({ submission, answerRows }),
      source: "deterministic",
    };
  }

  try {
    return {
      note: await generateGeminiStudyNote({ submission, answerRows }),
      source: "gemini",
    };
  } catch (err) {
    logger.warn("Gemini API call failed for study note; using fallback.", {
      error: err.message,
    });
    return {
      note: deterministicStudyNote({ submission, answerRows }),
      source: "deterministic",
    };
  }
}

function publicSampleTests(problem) {
  return (problem.testCases || [])
    .filter((testCase) => !testCase.isHidden)
    .map((testCase) => ({
      name: testCase.name,
      stdin: testCase.stdin,
      expectedOutput: testCase.expectedOutput,
    }));
}

function hasNestedLoops(sourceCode) {
  const compact = sourceCode.replace(/\s+/g, " ");
  return /(for|while)\s*\([^)]*\)\s*{[^{}]*(for|while)\s*\(/.test(compact);
}

function deterministicCodeReview({ problem, language, sourceCode }) {
  const lowerCode = sourceCode.toLowerCase();
  const strengths = [];
  const issues = [];
  const suggestions = [];
  const nextSteps = [];
  const tags = problem.tags || [];
  const constraints = (problem.constraints || []).join(" ");

  if (sourceCode.length > 80) {
    strengths.push("Your solution has enough structure to review meaningfully instead of being only a stub.");
  }

  if (language === "javascript" && /\binput\b/.test(sourceCode)) {
    strengths.push("The code reads from the platform-provided standard input variable.");
  } else if (language === "javascript") {
    issues.push("The solution does not appear to read from `input`, so it may ignore the judge's test data.");
    suggestions.push("Parse values from `input` before computing the answer.");
  }

  if (/eval\s*\(|new Function\s*\(/.test(sourceCode)) {
    issues.push("Avoid dynamic code execution such as `eval` or `new Function`; it is unsafe and unnecessary for these problems.");
  }

  if (tags.includes("stack") && !/\.push\s*\(|\.pop\s*\(|stack/.test(lowerCode)) {
    issues.push("This problem is tagged as a stack problem, but the solution does not show a clear stack operation.");
    suggestions.push("Use an array as a stack with `push` for opening symbols and `pop` when matching closing symbols.");
  }

  if (tags.includes("math") && !/[+\-*/%]/.test(sourceCode)) {
    issues.push("This math warmup likely needs a direct arithmetic operation, but the code does not show one.");
  }

  if (/100000|10\^5|1e5/i.test(constraints) && hasNestedLoops(sourceCode)) {
    issues.push("The constraints look large, and nested loops may time out on hidden cases.");
    suggestions.push("Look for an O(n) or O(n log n) approach before submitting.");
  }

  if (!/console\.log|print|system\.out|cout/.test(lowerCode)) {
    issues.push("The code may not print a final answer in the format expected by the judge.");
    suggestions.push("Make sure exactly the required output is written, without extra debugging text.");
  }

  if (!issues.length) {
    strengths.push("The solution shape is aligned with the problem statement and avoids obvious judge-integration mistakes.");
    suggestions.push("Run the sample tests, then add one edge case of your own before submitting hidden tests.");
  }

  if (!suggestions.length) {
    suggestions.push("Keep the implementation small, then verify input parsing and output formatting against each public sample.");
  }

  nextSteps.push("Run samples and compare the exact expected output, including capitalization and whitespace.");
  if (problem.difficulty !== "easy") {
    nextSteps.push("Add one stress or edge case locally that matches the largest constraint.");
  }

  return {
    summary: issues.length
      ? "The solution is close enough to iterate, but there are a few judge-readiness issues to fix before submission."
      : "The solution looks ready for sample testing, with no obvious structural issues from static review.",
    strengths: strengths.slice(0, 3),
    issues: issues.slice(0, 4),
    suggestions: suggestions.slice(0, 4),
    nextSteps,
  };
}

async function generateGeminiCodeReview({ problem, language, sourceCode }) {
  const prompt = `
You are an AI coding tutor on Far Away.
Review this student's solution for the given programming problem.

Problem title: ${problem.title}
Difficulty: ${problem.difficulty}
Tags: ${(problem.tags || []).join(", ")}
Statement: ${problem.statement}
Input format: ${problem.inputFormat || ""}
Output format: ${problem.outputFormat || ""}
Constraints: ${(problem.constraints || []).join("; ")}
Public sample tests: ${JSON.stringify(publicSampleTests(problem))}
Language: ${language}
Student code:
\`\`\`${language}
${sourceCode}
\`\`\`

Rules:
- Do not provide a complete replacement solution.
- Do not mention or invent hidden test cases.
- Focus on correctness, edge cases, complexity, and input/output formatting.
- Return a single valid JSON object only, no markdown wrapper, matching this schema:
{
  "summary": "1-2 sentence high-level review",
  "strengths": ["what is working"],
  "issues": ["specific risk or bug"],
  "suggestions": ["concrete improvement"],
  "nextSteps": ["what the student should do next"]
}
`;

  const model = genAI.getGenerativeModel({ model: env.geminiModel });
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleanText = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  return JSON.parse(cleanText);
}

export async function reviewCodeForProblem({ problemId, language, sourceCode }) {
  const problem = await Problem.findById(problemId).select("-solutionCode");
  if (!problem || !problem.isActive) {
    throw new AppError("Problem not found", 404, ERROR_CODES.NOT_FOUND);
  }

  const normalizedLanguage = language.toLowerCase();
  if (!problem.supportedLanguages.includes(normalizedLanguage)) {
    throw new AppError(`Unsupported language for this problem: ${language}`, 400, ERROR_CODES.BAD_REQUEST);
  }

  if (!genAI) {
    return {
      ...deterministicCodeReview({ problem, language: normalizedLanguage, sourceCode }),
      source: "deterministic",
    };
  }

  try {
    return {
      ...(await generateGeminiCodeReview({ problem, language: normalizedLanguage, sourceCode })),
      source: "gemini",
    };
  } catch (err) {
    logger.warn("Gemini API call failed for code review; using fallback.", {
      error: err.message,
    });
    return {
      ...deterministicCodeReview({ problem, language: normalizedLanguage, sourceCode }),
      source: "deterministic",
    };
  }
}
