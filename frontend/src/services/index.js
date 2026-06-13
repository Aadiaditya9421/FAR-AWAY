// src/services/index.js
// Typed calls for every backend route group. Each resource call requires auth.
// Views can call these and fall back to mock data on error during migration.

import { api, setTokens, clearTokens, getRefreshToken } from '../lib/apiClient';

/* ─────────────── Auth ─────────────── */
export async function loginRequest({ email, password }) {
  const data = await api.post('/auth/login', { email, password });
  setTokens(data);
  return data.user;
}

export async function registerRequest({ firstName, lastName, email, password, role = 'student' }) {
  const data = await api.post('/auth/register', { firstName, lastName, email, password, role });
  setTokens(data);
  return data.user;
}

export async function googleAuthRequest({ credential, role = 'student' }) {
  const data = await api.post('/auth/google', { credential, role });
  setTokens(data);
  return data.user;
}

export async function forgotPasswordRequest({ email }) {
  return api.post('/auth/forgot-password', { email });
}

export async function resetPasswordRequest({ token, password }) {
  return api.post('/auth/reset-password', { token, password });
}

export async function fetchMe() {
  return api.get('/auth/me', { auth: true });
}

export async function logoutRequest() {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) await api.post('/auth/logout', { refreshToken }, { auth: true });
  } finally {
    clearTokens();
  }
}

/* ─────────────── Assessments ─────────────── */
export const AssessmentService = {
  list: (query = '') => api.get(`/assessments${query}`, { auth: true }),
  classrooms: () => api.get('/assessments/classrooms', { auth: true }),
  submissions: (query = '') => api.get(`/assessments/submissions${query}`, { auth: true }),
  details: (id) => api.get(`/assessments/${id}`, { auth: true }),
  assignmentReport: (id) => api.get(`/assessments/${id}/assignment-report`, { auth: true }),
  questions: (id) => api.get(`/assessments/${id}/questions`, { auth: true }),
  submit: (id, answers, timeTaken) => {
    const normalizedAnswers = Array.isArray(answers)
      ? answers
      : Object.entries(answers || {}).map(([questionId, userAnswer]) => ({ questionId, userAnswer }));

    return api.post(`/assessments/${id}/submit`, { answers: normalizedAnswers, timeTaken }, { auth: true });
  },
  create: (payload) => api.post('/assessments', payload, { auth: true }),
  saveFeedback: (submissionId, feedback) =>
    api.put(`/assessments/submissions/${submissionId}/feedback`, { feedback }, { auth: true }),
};

/* ─────────────── Competitions ─────────────── */
export const CompetitionService = {
  list: (query = '') => api.get(`/competitions${query}`, { auth: true }),
  join: (id) => api.post(`/competitions/${id}/join`, {}, { auth: true }),
  standings: (id) => api.get(`/competitions/${id}/standings`, { auth: true }),
};

/* ─────────────── Leaderboard ─────────────── */
export const LeaderboardService = {
  byTopic: (topic, query = '') => api.get(`/leaderboard/${encodeURIComponent(topic)}${query}`, { auth: true }),
  userRankings: (userId) => api.get(`/leaderboard/user/${userId}`, { auth: true }),
};

/* ─────────────── SkillSwap ─────────────── */
export const SkillSwapService = {
  requests: (query = '') => api.get(`/skillswap/requests${query}`, { auth: true }),
  recommended: (query = '') => api.get(`/skillswap/recommended${query}`, { auth: true }),
  post: ({ teachSkill, learnSkill, receiverId, message, scheduledAt, verificationProof }) =>
    api.post('/skillswap/request', { teachSkill, learnSkill, receiverId, message, scheduledAt, verificationProof }, { auth: true }),
  accept: (id) => api.put(`/skillswap/accept/${id}`, {}, { auth: true }),
  decline: (id) => api.put(`/skillswap/decline/${id}`, {}, { auth: true }),
  cancel: (id) => api.put(`/skillswap/cancel/${id}`, {}, { auth: true }),
  complete: (id) => api.put(`/skillswap/complete/${id}`, {}, { auth: true }),
  sendMessage: (id, message) => api.post(`/skillswap/message/${id}`, { message }, { auth: true }),
  saveMeeting: (id, meetingUrl) => api.put(`/skillswap/meeting/${id}`, { meetingUrl }, { auth: true }),
};

/* ─────────────── Coins ─────────────── */
export const ProblemService = {
  list: (query = '') => api.get(`/problems${query}`, { auth: true }),
  details: (id) => api.get(`/problems/${id}`, { auth: true }),
  create: (payload) => api.post('/problems', payload, { auth: true }),
  run: (id, { language, sourceCode }) =>
    api.post(`/problems/${id}/run`, { language, sourceCode }, { auth: true }),
  submit: (id, { language, sourceCode }) =>
    api.post(`/problems/${id}/submit`, { language, sourceCode }, { auth: true }),
  review: (id, { language, sourceCode }) =>
    api.post(`/problems/${id}/review`, { language, sourceCode }, { auth: true }),
};

export const CoinService = {
  balance: () => api.get('/coins/balance', { auth: true }),
  transactions: (query = '') => api.get(`/coins/transactions${query}`, { auth: true }),
  claimDailyBonus: () => api.post('/coins/daily-bonus', {}, { auth: true }),
};

/* ─────────────── Users ─────────────── */
export const UserService = {
  get: (id) => api.get(`/users/${id}`, { auth: true }),
  update: (id, payload) => api.put(`/users/${id}`, payload, { auth: true }),
};

/* ─────────────── Analytics ─────────────── */
export const AnalyticsService = {
  progress: () => api.get('/analytics/progress', { auth: true }),
  practiceSet: () => api.get('/analytics/practice-set', { auth: true }),
  insights: () => api.get('/analytics/insights', { auth: true }),
  explain: (submissionId, questionId) => api.post('/analytics/explain', { submissionId, questionId }, { auth: true }),
  hint: ({ assessmentId, questionId, studentAnswer, hintLevel }) =>
    api.post('/analytics/hint', { assessmentId, questionId, studentAnswer, hintLevel }, { auth: true }),
  studyNote: (submissionId) => api.post('/analytics/study-note', { submissionId }, { auth: true }),
};
