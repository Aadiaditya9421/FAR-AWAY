import { GoogleGenerativeAI } from "@google/generative-ai";
import Assessment from "../models/Assessment.js";
import UserProgress from "../models/UserProgress.js";
import Submission from "../models/Submission.js";
import QuestionBank from "../models/QuestionBank.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { ERROR_CODES } from "../utils/errorCodes.js";
import { AppError } from "../utils/responseHandler.js";

let genAI = null;
if (env.geminiApiKey) {
  genAI = new GoogleGenerativeAI(env.geminiApiKey);
}

function nowIso() {
  return new Date().toISOString();
}

function asStringArray(value, fallback = []) {
  if (!Array.isArray(value)) return fallback;
  return value.map((item) => String(item || "").trim()).filter(Boolean);
}

function normalizeInsightPayload(payload, { provider }) {
  const weakAreas = asStringArray(payload.weakAreas);
  const nextTopics = asStringArray(payload.nextTopics);
  const strengths = asStringArray(payload.strengths);

  if (
    typeof payload.reason !== "string" ||
    typeof payload.personalizedRecommendation !== "string" ||
    typeof payload.masterySummary !== "string"
  ) {
    throw new Error("Learning insight payload is missing required text fields.");
  }

  return {
    weakAreas,
    reason: payload.reason.trim(),
    nextTopics,
    personalizedRecommendation: payload.personalizedRecommendation.trim(),
    strengths,
    masterySummary: payload.masterySummary.trim(),
    provider,
    generatedAt: nowIso(),
  };
}

function parseJsonObject(text) {
  const trimmed = String(text || "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Gemini response did not include a JSON object.");
  }

  return JSON.parse(trimmed.slice(start, end + 1));
}

function getFallbackInsights(progressList = []) {
  const activeProgress = progressList.filter((p) => p.attemptCount > 0);

  if (activeProgress.length === 0) {
    return {
      weakAreas: [],
      reason: "No completed assessment attempts yet, so Far Away is waiting for your first real signal before naming weak areas.",
      nextTopics: ["DSA fundamentals", "JavaScript fundamentals", "OOP basics"],
      personalizedRecommendation: "Take one beginner assessment to calibrate your mastery profile and unlock more targeted recommendations.",
      strengths: [],
      masterySummary: "Complete your first assessment to start building a live BKT mastery profile.",
      provider: "fallback",
      generatedAt: nowIso(),
    };
  }

  const sorted = [...activeProgress].sort((a, b) => a.mastery - b.mastery);
  const lowest = sorted[0];
  const highest = sorted[sorted.length - 1];
  const weakTopic = lowest.topic;
  const strongTopic = highest.topic;

  const topicDetails = {
    dsa: {
      weak: {
        reason: "Mastery metrics show the most opportunity in data-structure reasoning, especially when choosing the right traversal or storage pattern.",
        next: ["Stack operations", "Binary search", "Tree traversal"],
        recommendation: `Your BKT mastery in DSA is ${Math.round(lowest.mastery * 100)}%. Do a short DSA drill before moving to medium graph or tree questions.`,
      },
      strong: "Shows solid performance in basic arrays, search, and queue-style reasoning.",
    },
    oops: {
      weak: {
        reason: "The weakest signals are around object-oriented design choices such as inheritance, interfaces, and method behavior.",
        next: ["Abstract classes vs interfaces", "Method overriding", "SOLID basics"],
        recommendation: `Your OOPs mastery is ${Math.round(lowest.mastery * 100)}%. Review inheritance and polymorphism, then attempt an easy OOPs assessment.`,
      },
      strong: "Demonstrates strong understanding of constructors, encapsulation, and class hierarchies.",
    },
    webdev: {
      weak: {
        reason: "Your web development attempts suggest gaps in layout mechanics and browser behavior under responsive constraints.",
        next: ["Flexbox axes", "CSS box model", "CORS basics"],
        recommendation: `Your WebDev mastery is ${Math.round(lowest.mastery * 100)}%. Practice layout and browser API questions before taking a timed WebDev quiz.`,
      },
      strong: "Shows a useful grip on HTML semantics, selectors, and client-side storage.",
    },
    backend: {
      weak: {
        reason: "Backend mastery is currently limited by API lifecycle, database, and authentication concepts.",
        next: ["Express middleware", "MongoDB indexing", "JWT validation"],
        recommendation: `Your Backend mastery is ${Math.round(lowest.mastery * 100)}%. Revisit request flow and auth validation before trying backend scaling questions.`,
      },
      strong: "Demonstrates good understanding of REST endpoints and HTTP status-code behavior.",
    },
    javascript: {
      weak: {
        reason: "JavaScript attempts show room to strengthen runtime behavior such as scope, equality, and asynchronous flow.",
        next: ["Closures", "Event loop", "Strict equality"],
        recommendation: `Your JavaScript mastery is ${Math.round(lowest.mastery * 100)}%. Practice scope and promise-flow questions before moving up in difficulty.`,
      },
      strong: "Shows solid knowledge of functions, block scoping, and array basics.",
    },
    react: {
      weak: {
        reason: "React mastery is weakest around state lifecycles, effect dependencies, and render behavior.",
        next: ["useEffect dependencies", "State updates", "Component keys"],
        recommendation: `Your React mastery is ${Math.round(lowest.mastery * 100)}%. Review hooks and component rendering, then do one focused React assessment.`,
      },
      strong: "Shows clean use of state, event handlers, and simple component composition.",
    },
    python: {
      weak: {
        reason: "Python performance suggests concept gaps around iteration, function behavior, and object basics.",
        next: ["List comprehensions", "Generators", "Class initialization"],
        recommendation: `Your Python mastery is ${Math.round(lowest.mastery * 100)}%. Practice iteration and class questions before trying intermediate Python assessments.`,
      },
      strong: "Demonstrates good command of syntax, loops, and dictionary basics.",
    },
  };

  const weakInfo = topicDetails[weakTopic.toLowerCase()]?.weak || {
    reason: `Your lowest mastery signal is currently in ${weakTopic}.`,
    next: [`${weakTopic} fundamentals`, `Applied ${weakTopic}`],
    recommendation: `Your BKT mastery in ${weakTopic} is ${Math.round(lowest.mastery * 100)}%. Review the basics and complete one focused practice set.`,
  };
  const strongInfo =
    topicDetails[strongTopic.toLowerCase()]?.strong || `Shows dependable performance in ${strongTopic}.`;

  return {
    weakAreas: [weakTopic],
    reason: weakInfo.reason,
    nextTopics: weakInfo.next,
    personalizedRecommendation: weakInfo.recommendation,
    strengths: [strongTopic],
    masterySummary: `Your strongest signal is ${strongTopic}: ${strongInfo} Focus next on ${weakTopic} to lift your overall mastery.`,
    provider: "fallback",
    generatedAt: nowIso(),
  };
}

function getQuestionTitle(question) {
  return question.title || question.text || "this question";
}

function getQuestionConcept(question, assessment) {
  return question.subtopic || question.topic || assessment?.topic || "the core concept";
}

function getFallbackExplanation(question, assessment, userAnswer, correctAnswer) {
  const title = getQuestionTitle(question);
  const normalizedTitle = title.toLowerCase();
  const concept = getQuestionConcept(question, assessment);
  const selected = String(userAnswer || "blank");
  const expected = String(correctAnswer || "the best-supported answer");

  if (normalizedTitle.includes("typeof null")) {
    return `You selected "${selected}", but JavaScript reports typeof null as "object" because of an old language implementation quirk. The key takeaway is to remember that null is its own primitive value even though typeof returns object.`;
  }
  if (normalizedTitle.includes("lifo")) {
    return `You selected "${selected}", but LIFO means the last value added is the first value removed. That behavior belongs to a stack, while a queue follows FIFO order.`;
  }
  if (normalizedTitle.includes("diamond problem")) {
    return `You selected "${selected}", but the diamond problem is about ambiguity when multiple inheritance paths provide the same member. The correct reasoning is to identify the shared ancestor conflict, not just inheritance in general.`;
  }
  if (normalizedTitle.includes("closure")) {
    return `You selected "${selected}", but a closure is a function bundled with access to its lexical environment. The important idea is that the inner function can keep using outer-scope variables after the outer function returns.`;
  }
  if (normalizedTitle.includes("box model")) {
    return `You selected "${selected}", but the CSS box model is ordered from content to padding, border, and margin. Recheck which layer touches the element content and which layer creates outside spacing.`;
  }
  if (normalizedTitle.includes("===")) {
    return `You selected "${selected}", but strict equality checks both value and type without coercion. The misconception is treating === like ==, which may convert values before comparing them.`;
  }

  return `You answered "${selected}", while the expected answer is "${expected}". This usually means the rule behind ${concept} needs another pass: identify the exact concept being tested, eliminate related-but-wrong options, and match the answer to the prompt wording.`;
}

function canExplainSubmission(submission, requester) {
  if (!requester) return false;
  if (requester.role === "admin") return true;

  const requesterId = requester._id?.toString();
  if (submission.userId?.toString() === requesterId) return true;

  const createdBy = submission.assessmentId?.createdBy;
  return requester.role === "teacher" && Boolean(createdBy && createdBy.toString() === requesterId);
}

async function resolveQuestionForSubmission(submission, questionId) {
  const bankQuestion = await QuestionBank.findById(questionId).select("+correctAnswer");
  if (bankQuestion) {
    return {
      assessment: submission.assessmentId,
      question: bankQuestion.toObject(),
      correctAnswer: bankQuestion.correctAnswer,
      source: "question-bank",
    };
  }

  const assessmentId = submission.assessmentId?._id || submission.assessmentId;
  const assessment = await Assessment.findById(assessmentId).select("+questions.correctAnswer");
  const staticQuestion = assessment?.questions?.id(questionId);

  if (staticQuestion) {
    const question = staticQuestion.toObject();
    return {
      assessment,
      question,
      correctAnswer: question.correctAnswer,
      source: "assessment-static",
    };
  }

  return null;
}

export async function analyzeWeaknessesAndRecommend(userId) {
  const progressList = await UserProgress.find({ userId }).sort({ updatedAt: -1 });

  if (!genAI) {
    logger.info("Gemini API key not configured. Using deterministic BKT fallback insights.");
    return getFallbackInsights(progressList);
  }

  try {
    const scoresSummary = progressList
      .map(
        (p) =>
          `- ${p.topic}: BKT Mastery Level = ${Math.round(
            p.mastery * 100,
          )}%, Attempts = ${p.attemptCount}, Correct = ${p.correctAnswers}, Incorrect = ${p.incorrectAnswers}`,
      )
      .join("\n");

    const prompt = `
You are an AI Tutor on Far Away, a gamified learning platform.
Analyze the student's topic mastery profiles based on Bayesian Knowledge Tracing.

${scoresSummary || "No assessments completed yet."}

Return one valid JSON object only. Do not include markdown, comments, or backticks.
The JSON object must match this schema:
{
  "weakAreas": ["TopicName"],
  "reason": "Explain the weakness pattern in 1-2 sentences.",
  "nextTopics": ["Subtopic A", "Subtopic B"],
  "personalizedRecommendation": "Provide one concrete next action.",
  "strengths": ["StrongTopicName"],
  "masterySummary": "Short dashboard summary."
}
`;

    const model = genAI.getGenerativeModel({ model: env.geminiModel });
    const result = await model.generateContent(prompt);
    const payload = parseJsonObject(result.response.text());
    return normalizeInsightPayload(payload, { provider: "gemini" });
  } catch (err) {
    logger.warn("Gemini API call failed for learning insights; using fallback.", {
      error: err.message,
    });
    return getFallbackInsights(progressList);
  }
}

export async function explainMisconception(submissionId, questionId, requester = null) {
  const submission = await Submission.findById(submissionId).populate("assessmentId", "title topic createdBy");
  if (!submission) {
    throw new AppError("Submission not found", 404, ERROR_CODES.NOT_FOUND);
  }

  if (requester && !canExplainSubmission(submission, requester)) {
    throw new AppError("You do not have permission to explain this submission", 403, ERROR_CODES.FORBIDDEN);
  }

  const answer = submission.answers.find((item) => item.questionId?.toString() === questionId.toString());
  if (!answer) {
    throw new AppError("Question not found in this submission's answers", 404, ERROR_CODES.NOT_FOUND);
  }

  const resolved = await resolveQuestionForSubmission(submission, questionId);
  if (!resolved) {
    throw new AppError("Question not found for this submission", 404, ERROR_CODES.NOT_FOUND);
  }

  const { assessment, question } = resolved;
  const userAnswer = answer.userAnswer;
  const correctAnswer = resolved.correctAnswer || answer.correctAnswer;

  if (!genAI) {
    logger.info("Gemini API key not configured. Using deterministic misconception explanation.", {
      questionId,
      source: resolved.source,
    });
    return getFallbackExplanation(question, assessment, userAnswer, correctAnswer);
  }

  try {
    const prompt = `
You are an AI Tutor on Far Away, a gamified learning platform.
Explain the misconception for this quiz answer.

Assessment: "${assessment?.title || "Untitled assessment"}"
Topic: "${assessment?.topic || question.topic || "General"}"
Question: "${getQuestionTitle(question)}"
Description: "${question.description || ""}"
Options: ${JSON.stringify(question.options || [])}
Correct answer: "${correctAnswer || ""}"
Student answer: "${userAnswer || "blank"}"

Explain why the student's answer is incorrect and guide them to the correct reasoning.
Keep it concise, encouraging, and 2-3 sentences max.
Do not mention internal IDs, database schemas, providers, or scoring internals.
`;

    const model = genAI.getGenerativeModel({ model: env.geminiModel });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    logger.warn("Gemini API call failed for explanation; using fallback.", {
      error: err.message,
      questionId,
      source: resolved.source,
    });
    return getFallbackExplanation(question, assessment, userAnswer, correctAnswer);
  }
}
