import Assessment from "../models/Assessment.js";
import Submission from "../models/Submission.js";
import QuestionBank from "../models/QuestionBank.js";
import User from "../models/User.js";
import { creditCoins } from "./coinService.js";
import { updateProgressAfterSubmission } from "./adaptiveService.js";
import { updateLeaderboardForSubmission } from "./leaderboardService.js";
import { recordMetric } from "./analyticsService.js";
import { EMPTY_INTEGRITY_SUMMARY, summarizeIntegrityEventsForSubmissions } from "./integrityService.js";
import { ERROR_CODES } from "../utils/errorCodes.js";
import { buildPaginationMeta, parsePagination, scoreSubmission } from "../utils/helpers.js";
import { AppError } from "../utils/responseHandler.js";

function normalizeClassValue(value = "") {
  return String(value || "").trim();
}

function isStaff(user = {}) {
  return user.role === "teacher" || user.role === "admin";
}

function getAvailabilityStatus(assessment, now = new Date()) {
  const availableFrom = assessment.availableFrom ? new Date(assessment.availableFrom) : null;
  const availableTo = assessment.availableTo ? new Date(assessment.availableTo) : null;

  if (availableFrom && now < availableFrom) return "upcoming";
  if (availableTo && now > availableTo) return "closed";
  return "open";
}

function isAssignedToStudent(assessment, user) {
  const assignment = assessment.assignment || {};
  const mode = assignment.mode || "all";

  if (mode === "all") return true;
  if (mode === "class") {
    return (
      normalizeClassValue(assignment.batch) === normalizeClassValue(user.batch)
      && normalizeClassValue(assignment.branch) === normalizeClassValue(user.branch)
    );
  }
  if (mode === "students" || mode === "defaulters") {
    const userId = user._id?.toString?.() || user.id?.toString?.();
    return (assignment.studentIds || []).some((studentId) => studentId.toString() === userId);
  }

  return true;
}

function assertCanViewAssessment(assessment, user) {
  if (!user) return;
  if (user.role === "admin") return;
  if (user.role === "teacher") {
    const creatorId = assessment.createdBy?._id?.toString?.() || assessment.createdBy?.toString?.();
    if (creatorId === user._id.toString()) return;
    throw new AppError("You do not have permission to view this assessment", 403, ERROR_CODES.FORBIDDEN);
  }
  if (isAssignedToStudent(assessment, user)) return;
  throw new AppError("This assessment is not assigned to your class", 403, ERROR_CODES.FORBIDDEN);
}

function assertCanStartAssessment(assessment, user) {
  assertCanViewAssessment(assessment, user);
  if (isStaff(user)) return;

  const status = getAvailabilityStatus(assessment);
  if (status === "upcoming") {
    throw new AppError("This assessment is not open yet", 403, ERROR_CODES.FORBIDDEN);
  }
  if (status === "closed") {
    throw new AppError("This assessment window has closed", 403, ERROR_CODES.FORBIDDEN);
  }
}

export function assertAssessmentCanStart(assessment, user) {
  assertCanStartAssessment(assessment, user);
}

function studentAssignmentFilter(user) {
  const clauses = [
    { "assignment.mode": { $exists: false } },
    { "assignment.mode": "all" },
  ];

  const batch = normalizeClassValue(user.batch);
  const branch = normalizeClassValue(user.branch);
  clauses.push({
    "assignment.mode": "class",
    "assignment.batch": batch,
    "assignment.branch": branch,
  });

  clauses.push({
    "assignment.mode": { $in: ["students", "defaulters"] },
    "assignment.studentIds": user._id,
  });

  return { $or: clauses };
}

function decorateAssessment(assessment, user) {
  const raw = assessment.toObject ? assessment.toObject() : assessment;
  return {
    ...raw,
    availabilityStatus: getAvailabilityStatus(raw),
    assignedToCurrentUser: user?.role === "student" ? isAssignedToStudent(raw, user) : true,
  };
}

export async function listAssessments(query, user) {
  const { page, limit, skip } = parsePagination(query);
  const filter = { isActive: true };
  if (query.topic) filter.topic = query.topic;
  if (query.difficulty) filter.difficulty = query.difficulty;
  if (query.classBatch) filter["assignment.batch"] = normalizeClassValue(query.classBatch);
  if (query.classBranch) filter["assignment.branch"] = normalizeClassValue(query.classBranch);

  if (user?.role === "teacher") {
    filter.createdBy = user._id;
  } else if (user?.role === "student") {
    Object.assign(filter, studentAssignmentFilter(user));
  }

  const [items, total] = await Promise.all([
    Assessment.find(filter).select("-questions.correctAnswer").sort({ availableFrom: -1, createdAt: -1 }).skip(skip).limit(limit),
    Assessment.countDocuments(filter),
  ]);

  return { items: items.map((item) => decorateAssessment(item, user)), meta: buildPaginationMeta(total, page, limit) };
}

export async function getAssessmentById(id, includeAnswers = false, user = null) {
  const query = Assessment.findById(id);
  if (includeAnswers) query.select("+questions.correctAnswer");
  const assessment = await query;
  if (!assessment) throw new AppError("Assessment not found", 404, ERROR_CODES.NOT_FOUND);
  assertCanViewAssessment(assessment, user);
  return assessment;
}

async function getAssignedStudents(assessment) {
  const assignment = assessment.assignment || {};
  const mode = assignment.mode || "all";

  const filter = { role: "student" };
  if (mode === "class") {
    filter.batch = normalizeClassValue(assignment.batch);
    filter.branch = normalizeClassValue(assignment.branch);
  } else if (mode === "students" || mode === "defaulters") {
    filter._id = { $in: assignment.studentIds || [] };
  }

  return User.find(filter).select("firstName lastName email batch branch");
}

async function buildAssignment(payload = {}, creator) {
  const incoming = payload.assignment || {};
  const mode = incoming.mode || "all";
  const assignment = {
    mode,
    batch: normalizeClassValue(incoming.batch),
    branch: normalizeClassValue(incoming.branch),
    studentIds: incoming.studentIds || [],
    sourceAssessmentId: incoming.sourceAssessmentId || null,
  };

  if (mode === "defaulters") {
    if (!assignment.sourceAssessmentId) {
      throw new AppError("Select a source assessment to assign defaulters", 400, ERROR_CODES.VALIDATION_ERROR);
    }
    const sourceAssessment = await Assessment.findById(assignment.sourceAssessmentId);
    if (!sourceAssessment) throw new AppError("Source assessment not found", 404, ERROR_CODES.NOT_FOUND);
    const sourceCreatorId = sourceAssessment.createdBy?.toString();
    if (creator?.role === "teacher" && sourceCreatorId !== creator._id.toString()) {
      throw new AppError("You can only assign defaulters from your own assessments", 403, ERROR_CODES.FORBIDDEN);
    }

    const assignedStudents = await getAssignedStudents(sourceAssessment);
    const assignedIds = assignedStudents.map((student) => student._id);
    const submittedIds = await Submission.find({
      assessmentId: sourceAssessment._id,
      userId: { $in: assignedIds },
    }).distinct("userId");
    const submittedSet = new Set(submittedIds.map((id) => id.toString()));
    assignment.studentIds = assignedIds.filter((id) => !submittedSet.has(id.toString()));
  }

  if (mode !== "students" && mode !== "defaulters") {
    assignment.studentIds = [];
  }

  return assignment;
}

export async function createAssessment(payload, creator) {
  const assignment = await buildAssignment(payload, creator);
  return Assessment.create({
    ...payload,
    description: payload.description || payload.desc || "",
    availableFrom: payload.availableFrom || null,
    availableTo: payload.availableTo || null,
    assignment,
    createdBy: creator._id,
    totalQuestions: payload.questions?.length || 0,
  });
}

export async function listClassrooms() {
  const students = await User.find({ role: "student" })
    .select("firstName lastName email batch branch")
    .sort({ branch: 1, batch: 1, firstName: 1 });

  const groups = new Map();
  students.forEach((student) => {
    const batch = normalizeClassValue(student.batch);
    const branch = normalizeClassValue(student.branch);
    const batchLabel = batch || "Unassigned";
    const branchLabel = branch || "General";
    const key = `${batch}::${branch}`;
    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        batch,
        branch,
        name: `${branchLabel} ${batchLabel}`,
        students: [],
        studentCount: 0,
      });
    }

    const group = groups.get(key);
    group.students.push(student);
    group.studentCount = group.students.length;
  });

  return [...groups.values()];
}

export async function getAssessmentAssignmentReport(assessmentId, requester) {
  const assessment = await getAssessmentById(assessmentId, false, requester);
  const assignedStudents = await getAssignedStudents(assessment);
  const assignedIds = assignedStudents.map((student) => student._id);
  const submissions = assignedIds.length
    ? await Submission.find({ assessmentId, userId: { $in: assignedIds } }).select("userId score createdAt")
    : [];
  const submittedSet = new Set(submissions.map((submission) => submission.userId.toString()));

  return {
    assessment: decorateAssessment(assessment, requester),
    assignedStudents,
    submitted: submissions,
    defaulters: assignedStudents.filter((student) => !submittedSet.has(student._id.toString())),
    counts: {
      assigned: assignedStudents.length,
      submitted: submittedSet.size,
      defaulters: Math.max(assignedStudents.length - submittedSet.size, 0),
    },
  };
}

export async function listAssignedStudentsForAssessment(assessmentId) {
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) return [];
  return getAssignedStudents(assessment);
}

function canReviewSubmission(submission, reviewer) {
  if (reviewer.role === "admin") return true;
  const createdBy = submission.assessmentId?.createdBy;
  return Boolean(createdBy && createdBy.toString() === reviewer._id.toString());
}

function decorateSubmissionForReview(submission, questionTextById = new Map(), integritySummaryByAttempt = new Map()) {
  const raw = submission.toObject();
  const assessmentQuestions = raw.assessmentId?.questions || [];
  const assessmentQuestionTextById = new Map(
    assessmentQuestions
      .filter((question) => question._id)
      .map((question) => [question._id.toString(), question.title]),
  );

  return {
    ...raw,
    integritySummary: integritySummaryByAttempt.get(raw.attemptId) || EMPTY_INTEGRITY_SUMMARY,
    reviewQuestions: raw.answers.map((answer, index) => {
      const questionId = answer.questionId?.toString();
      return {
        ...answer,
        text:
          assessmentQuestionTextById.get(questionId)
          || questionTextById.get(questionId)
          || `Question ${index + 1}`,
      };
    }),
  };
}

export async function listSubmissionsForReview(query, reviewer) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};

  if (reviewer.role === "teacher") {
    const assessmentIds = await Assessment.find({ createdBy: reviewer._id }).distinct("_id");
    filter.assessmentId = { $in: assessmentIds };
  }

  const [items, total] = await Promise.all([
    Submission.find(filter)
      .populate("userId", "firstName lastName email batch branch")
      .populate("assessmentId", "title topic difficulty createdBy questions.title availableFrom availableTo assignment")
      .populate("reviewedBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Submission.countDocuments(filter),
  ]);

  const questionIds = [
    ...new Set(items.flatMap((item) => item.answers.map((answer) => answer.questionId?.toString()).filter(Boolean))),
  ];
  const questionBankItems = questionIds.length
    ? await QuestionBank.find({ _id: { $in: questionIds } }).select("title")
    : [];
  const questionTextById = new Map(questionBankItems.map((question) => [question._id.toString(), question.title]));
  const integritySummaryByAttempt = await summarizeIntegrityEventsForSubmissions(items);

  return {
    items: items.map((item) => decorateSubmissionForReview(item, questionTextById, integritySummaryByAttempt)),
    meta: buildPaginationMeta(total, page, limit),
  };
}

export async function updateSubmissionFeedback({ submissionId, reviewer, feedback }) {
  const submission = await Submission.findById(submissionId)
    .populate("assessmentId", "title topic difficulty createdBy questions.title")
    .populate("userId", "firstName lastName email batch branch");

  if (!submission) throw new AppError("Submission not found", 404, ERROR_CODES.NOT_FOUND);
  if (!canReviewSubmission(submission, reviewer)) {
    throw new AppError("You do not have permission to review this submission", 403, ERROR_CODES.FORBIDDEN);
  }

  submission.feedback = feedback;
  submission.reviewedBy = reviewer._id;
  submission.reviewedAt = new Date();
  await submission.save();

  await submission.populate("reviewedBy", "firstName lastName email");

  const questionIds = submission.answers.map((answer) => answer.questionId?.toString()).filter(Boolean);
  const questionBankItems = questionIds.length
    ? await QuestionBank.find({ _id: { $in: questionIds } }).select("title")
    : [];
  const questionTextById = new Map(questionBankItems.map((question) => [question._id.toString(), question.title]));
  const integritySummaryByAttempt = await summarizeIntegrityEventsForSubmissions([submission]);

  return decorateSubmissionForReview(submission, questionTextById, integritySummaryByAttempt);
}

export async function submitAssessment({ assessmentId, userId, answers, timeTaken, attemptId = "" }) {
  const user = await User.findById(userId).select("role batch branch");
  if (!user) throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND);
  const assessment = await getAssessmentById(assessmentId, true, user);
  assertCanStartAssessment(assessment, user);
  
  let gradingQuestions = [];
  if (assessment.questionConfig?.isDynamic) {
    const questionIds = answers.map((a) => a.questionId);
    gradingQuestions = await QuestionBank.find({ _id: { $in: questionIds } }).select("+correctAnswer");
  } else {
    gradingQuestions = assessment.questions;
  }

  const { score, correctCount, incorrectCount, checkedAnswers } = scoreSubmission(gradingQuestions, answers);
  const coinsEarned = score >= 80
    ? assessment.coinsReward
    : Math.round(assessment.coinsReward / 2);

  const submission = await Submission.create({
    userId,
    assessmentId,
    attemptId,
    answers: checkedAnswers,
    score,
    correctCount,
    incorrectCount,
    timeTaken,
    coinsEarned,
    questionsShown: gradingQuestions.map((q) => q._id),
  });

  await Promise.all([
    creditCoins(userId, coinsEarned, `Completed assessment: ${assessment.title}`, "assessment", assessment._id),
    updateProgressAfterSubmission({
      userId,
      topic: assessment.topic,
      score,
      correctCount,
      incorrectCount,
      answers: checkedAnswers,
    }),
    updateLeaderboardForSubmission({
      userId,
      topic: assessment.topic,
      score,
      coinsEarned,
    }),
    recordMetric({
      userId,
      topic: assessment.topic,
      metric: "assessment_score",
      value: score,
      metadata: { assessmentId: assessment._id, submissionId: submission._id },
    }),
  ]);

  return submission;
}
