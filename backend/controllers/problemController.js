import {
  createProblem,
  getProblem,
  gradeProblem,
  listProblems,
} from "../services/gradingService.js";
import { reviewCodeForProblem } from "../services/aiTutorService.js";
import { emitAppDataChanged, emitUserDataChanged } from "../sockets/notificationSocket.js";
import { sendCreated, sendSuccess } from "../utils/responseHandler.js";

export async function getProblems(req, res) {
  const items = await listProblems(req.query);
  return sendSuccess(res, { message: "Problems retrieved", data: items });
}

export async function getProblemDetails(req, res) {
  const problem = await getProblem(req.params.id);
  return sendSuccess(res, { message: "Problem retrieved", data: problem });
}

export async function createProblemRecord(req, res) {
  const problem = await createProblem(req.body, req.user._id);
  emitAppDataChanged({
    scope: "problems",
    source: "problem:created",
    entityId: problem._id,
  });
  return sendCreated(res, { message: "Problem created", data: problem });
}

export async function runProblem(req, res) {
  const result = await gradeProblem({
    problemId: req.params.id,
    userId: req.user._id,
    language: req.body.language,
    sourceCode: req.body.sourceCode,
    mode: "run",
  });
  return sendSuccess(res, { message: "Code run completed", data: result });
}

export async function submitProblem(req, res) {
  const result = await gradeProblem({
    problemId: req.params.id,
    userId: req.user._id,
    language: req.body.language,
    sourceCode: req.body.sourceCode,
    mode: "submit",
  });
  emitUserDataChanged(req.user._id, {
    scope: "problems",
    source: "problem:submitted",
    entityId: result.submissionId,
  });
  return sendCreated(res, { message: "Code submission graded", data: result });
}

export async function reviewProblemCode(req, res) {
  const result = await reviewCodeForProblem({
    problemId: req.params.id,
    language: req.body.language,
    sourceCode: req.body.sourceCode,
  });

  return sendSuccess(res, { message: "AI code review generated", data: result });
}
