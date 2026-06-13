import mongoose from "mongoose";

export function normalizeEmail(email = "") {
  return email.trim().toLowerCase();
}

export function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

export function parsePagination(query = {}) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildPaginationMeta(total, page, limit) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export function pick(object, allowedKeys) {
  return allowedKeys.reduce((acc, key) => {
    if (object[key] !== undefined) acc[key] = object[key];
    return acc;
  }, {});
}

export function scoreSubmission(questions, answers) {
  const answerMap = new Map(answers.map((answer) => [answer.questionId.toString(), answer.userAnswer]));
  let correctCount = 0;

  const checkedAnswers = questions.map((question) => {
    const userAnswer = answerMap.get(question._id?.toString() || question.questionId?.toString() || question.id) || "";
    const expected = String(question.correctAnswer || question.correct || "").trim().toLowerCase();
    const actual = String(userAnswer).trim().toLowerCase();
    const isCorrect = expected ? actual === expected : actual.length > 0;
    if (isCorrect) correctCount += 1;

    return {
      questionId: question._id || question.questionId,
      userAnswer,
      correctAnswer: question.correctAnswer || question.correct,
      isCorrect,
      pointsEarned: isCorrect ? question.points || 1 : 0,
    };
  });

  const totalQuestions = questions.length;
  const score = totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return { score, correctCount, incorrectCount: totalQuestions - correctCount, checkedAnswers };
}
