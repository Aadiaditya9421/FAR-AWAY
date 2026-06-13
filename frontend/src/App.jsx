// src/App.jsx
// ─── Far Away — Main App Orchestrator ───
// All business logic lives here. Feature views are pure presentational components.

import { useState, useEffect } from 'react';
// ── Auth ──
import { useAuth } from './context/AuthContext';
import LandingPage from './features/auth/LandingPage';
import AuthPage   from './features/auth/AuthPage';
import AuthModal  from './features/auth/AuthModal';

// ── Layout ──
import Header from './components/layout/Header';

// ── UI Primitives ──
import ToastContainer from './components/ui/Toast';

// ── Feature Views ──
import Dashboard      from './features/dashboard/Dashboard';
import AssessmentsView from './features/assessments/AssessmentsView';
import QuizView       from './features/quiz/QuizView';
import ResultsModal   from './features/quiz/ResultsModal';
import LeaderboardView from './features/leaderboard/LeaderboardView';
import CompetitionsView from './features/competitions/CompetitionsView';
import SkillSwapView  from './features/skillswap/SkillSwapView';
import CodingPracticeView from './features/coding/CodingPracticeView';

// ── Teacher Views ──
import ClassProgressView from './features/teacher/ClassProgressView';
import CreateTestView    from './features/teacher/CreateTestView';

// ── Data ──
import {
  INITIAL_USER,
  ASSESSMENTS,
  SUBJECTS,
  INITIAL_SKILLSWAP,
  INITIAL_COMPETITIONS,
} from './data/mockData';

// ── API Services ──
import {
  AssessmentService,
  CompetitionService,
  CoinService,
  SkillSwapService,
  AnalyticsService,
} from './services';

// ── Socket.io Client ──
import { connectSockets, disconnectSockets, getRootSocket } from './lib/socket';

const INITIAL_SUBMISSIONS = [
  {
    id: 'sub-1',
    studentName: 'Alice Wu',
    studentInitials: 'AW',
    testId: 'oops-t1',
    testTitle: 'OOPs Test 1 — Classes & Objects',
    subjectName: 'OOPs Lab',
    score: 98,
    correctCount: 3,
    totalCount: 3,
    date: 'Today · 12:45 PM',
    answers: { oq1: 'Inheritance', oq2: 'Subclass method runs', oq3: 'private' },
    questions: [
      { id: 'oq1', text: 'Which OOP concept allows a class to derive properties from another class?', correct: 'Inheritance', isCorrect: true },
      { id: 'oq2', text: 'What is the output of calling an overridden method on a subclass object via a parent reference?', correct: 'Subclass method runs', isCorrect: true },
      { id: 'oq3', text: 'Which access modifier restricts visibility to the class itself only?', correct: 'private', isCorrect: true }
    ],
    feedback: ''
  },
  {
    id: 'sub-2',
    studentName: 'Michael Chen',
    studentInitials: 'MC',
    testId: 'oops-t1',
    testTitle: 'OOPs Test 1 — Classes & Objects',
    subjectName: 'OOPs Lab',
    score: 66,
    correctCount: 2,
    totalCount: 3,
    date: 'Today · 01:15 PM',
    answers: { oq1: 'Inheritance', oq2: 'Parent method runs', oq3: 'private' },
    questions: [
      { id: 'oq1', text: 'Which OOP concept allows a class to derive properties from another class?', correct: 'Inheritance', isCorrect: true },
      { id: 'oq2', text: 'What is the output of calling an overridden method on a subclass object via a parent reference?', correct: 'Subclass method runs', isCorrect: false, studentAns: 'Parent method runs' },
      { id: 'oq3', text: 'Which access modifier restricts visibility to the class itself only?', correct: 'private', isCorrect: true }
    ],
    feedback: ''
  },
  {
    id: 'sub-3',
    studentName: 'John Doe',
    studentInitials: 'JD',
    testId: 'dsa-t1',
    testTitle: 'DSA Test 1 — Linked Lists',
    subjectName: 'DSA Lab',
    score: 33,
    correctCount: 1,
    totalCount: 3,
    date: 'Yesterday',
    answers: { dq1: 'O(n)', dq2: 'Stack', dq3: 'NULL' },
    questions: [
      { id: 'dq1', text: 'What is the time complexity to insert at the beginning of a Singly Linked List?', correct: 'O(1)', isCorrect: false, studentAns: 'O(n)' },
      { id: 'dq2', text: 'Which data structure uses LIFO ordering?', correct: 'Stack', isCorrect: true },
      { id: 'dq3', text: 'In a circular linked list, the next pointer of the last node points to?', correct: 'Head Node', isCorrect: false, studentAns: 'NULL' }
    ],
    feedback: ''
  }
];

// ── Hooks ──
import useToast from './hooks/useToast';
import useQuizTimer from './hooks/useQuizTimer';

// ── Mapping Helpers for API Data shapes ──
const SUBJECT_MAP = {
  oops: {
    id: 'sub-oops',
    code: 'CS301',
    name: 'Object Oriented Programming',
    shortName: 'OOPs Lab',
    teacher: { name: 'Prof. Anjali Sharma', initials: 'AS', department: 'Computer Science' },
    scheduleLabel: 'Today · 12:00 PM – 2:00 PM',
    availableFrom: '12:00',
    availableTo: '14:00',
    accentColor: '#fa520f',
    icon: 'code',
  },
  dsa: {
    id: 'sub-dsa',
    code: 'CS201',
    name: 'Data Structures & Algorithms',
    shortName: 'DSA Lab',
    teacher: { name: 'Prof. Rajesh Kumar', initials: 'RK', department: 'Computer Science' },
    scheduleLabel: 'Today · 3:00 PM – 5:00 PM',
    availableFrom: '15:00',
    availableTo: '17:00',
    accentColor: '#3b82f6',
    icon: 'database',
  },
  webdev: {
    id: 'sub-webdev',
    code: 'CS401',
    name: 'Web Development',
    shortName: 'WebDev Lab',
    teacher: { name: 'Prof. Sarah Mitchell', initials: 'SM', department: 'Information Technology' },
    scheduleLabel: 'Tomorrow · 10:00 AM – 12:00 PM',
    availableFrom: '10:00',
    availableTo: '12:00',
    accentColor: '#10b981',
    icon: 'globe',
  },
  backend: {
    id: 'sub-backend',
    code: 'CS501',
    name: 'Backend Development',
    shortName: 'Backend Lab',
    teacher: { name: 'Prof. David Menon', initials: 'DM', department: 'Computer Science' },
    scheduleLabel: 'Tomorrow · 2:00 PM – 4:00 PM',
    availableFrom: '14:00',
    availableTo: '16:00',
    accentColor: '#8b5cf6',
    icon: 'server',
  },
  react: {
    id: 'sub-react',
    code: 'CS402',
    name: 'React Fundamentals',
    shortName: 'React Lab',
    teacher: { name: 'Prof. Sarah Mitchell', initials: 'SM', department: 'Information Technology' },
    scheduleLabel: 'Tomorrow · 10:00 AM – 12:00 PM',
    availableFrom: '10:00',
    availableTo: '12:00',
    accentColor: '#06b6d4',
    icon: 'atom',
  },
  python: {
    id: 'sub-python',
    code: 'CS101',
    name: 'Introduction to Python',
    shortName: 'Python Lab',
    teacher: { name: 'Prof. Rajesh Kumar', initials: 'RK', department: 'Computer Science' },
    scheduleLabel: 'Today · 3:00 PM – 5:00 PM',
    availableFrom: '15:00',
    availableTo: '17:00',
    accentColor: '#eab308',
    icon: 'code',
  }
};

function groupAssessmentsIntoSubjects(assessmentsList = []) {
  const grouped = {};
  assessmentsList.forEach(a => {
    const topicKey = (a.topic || 'oops').toLowerCase();
    if (!grouped[topicKey]) {
      grouped[topicKey] = [];
    }
    const questions = (a.questions || []).map(q => ({
      id: q._id || q.id,
      type: q.type || 'mcq',
      text: q.title || q.text,
      options: q.options || [],
      correct: q.correctAnswer || q.correct || '',
    }));

    grouped[topicKey].push({
      id: a._id || a.id,
      title: a.title,
      desc: a.description || a.desc || '',
      difficulty: a.difficulty,
      topic: a.topic,
      duration: a.duration,
      coinsReward: a.coinsReward,
      questions,
      isAdaptive: a.questionConfig?.isAdaptive || false,
      isDynamic: a.questionConfig?.isDynamic || false,
    });
  });

  return Object.keys(SUBJECT_MAP).map(topicKey => {
    const subInfo = SUBJECT_MAP[topicKey];
    return {
      ...subInfo,
      assessments: grouped[topicKey] || [],
    };
  }).filter(s => s.assessments.length > 0);
}

function mapCompetitions(competitionsList = [], authUserId) {
  return competitionsList.map(c => {
    const registered = c.participants?.some(pId => pId === authUserId || pId?._id === authUserId);
    const poolSum = c.prizePool ? (c.prizePool.rank1 + c.prizePool.rank2 + c.prizePool.rank3) : 1000;
    const status = c.status === 'active' ? 'live' : c.status;

    return {
      id: c._id || c.id,
      title: c.title,
      desc: c.description || c.desc || `Dynamic arena challenge for ${c.topic}.`,
      status,
      difficulty: c.difficulty || 'medium',
      time: c.time || '45 min',
      participants: c.participants?.length || 0,
      fee: c.entryFee || 0,
      pool: `${poolSum} coins`,
      registered,
    };
  });
}

function mapSkillSwap(requestsList = [], authUserId, recommendationsList = []) {
  const matches = requestsList
    .filter(r => r.status === 'open' && r.requester?._id !== authUserId && r.requester !== authUserId)
    .map(r => {
      const peerName = r.requester ? `${r.requester.firstName} ${r.requester.lastName}`.trim() : 'Anonymous';
      return {
        id: r._id || r.id,
        requesterId: r.requester?._id || r.requester,
        name: peerName,
        give: r.teachSkill,
        take: r.learnSkill,
        bio: r.message || 'No bio provided.',
        avatar: peerName.split(' ').map(x => x[0]).join('').toUpperCase(),
        matched: false,
      };
    });

  const recommended = recommendationsList.map(item => {
    const request = item.request || {};
    const suggestedPeer = item.peer || {};
    const peerName = suggestedPeer.name || getDisplayName(request.requester);

    return {
      id: request._id || request.id,
      requesterId: request.requester?._id || request.requester || suggestedPeer.id,
      name: peerName,
      give: request.teachSkill,
      take: request.learnSkill,
      bio: request.message || 'No bio provided.',
      avatar: getInitials(peerName),
      matched: false,
      recommended: true,
      targetTopic: item.targetTopic,
      targetMastery: item.targetMastery,
      score: item.score,
      scoreBreakdown: item.scoreBreakdown,
      reasons: item.reasons || [],
    };
  });

  const requests = requestsList
    .filter(r => (r.receiver === authUserId || r.receiver?._id === authUserId) && r.status === 'pending')
    .map(r => {
      const senderName = r.requester ? `${r.requester.firstName} ${r.requester.lastName}`.trim() : 'Anonymous';
      return {
        id: r._id || r.id,
        sender: senderName,
        avatar: senderName.split(' ').map(x => x[0]).join('').toUpperCase(),
        skill: `${r.teachSkill} ⇄ ${r.learnSkill}`,
        msg: r.message,
        status: r.status,
      };
    });

  const myPostings = requestsList
    .filter(r => r.requester === authUserId || r.requester?._id === authUserId)
    .map(r => {
      return {
        id: r._id || r.id,
        teach: r.teachSkill,
        learn: r.learnSkill,
        msg: r.message,
      };
    });

  return {
    matches,
    recommended,
    requests,
    myPostings,
  };
}

function getDisplayName(profile) {
  if (!profile || typeof profile === 'string') return 'Student';
  return (
    profile.fullName
    || [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim()
    || profile.email
    || 'Student'
  );
}

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'ST';
}

function toFiniteNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getInitialAuthScreen() {
  if (typeof window === 'undefined') return { showLanding: true, authView: 'login' };

  const params = new URLSearchParams(window.location.search);
  if (params.has('resetToken')) return { showLanding: false, authView: 'login' };

  const auth = params.get('auth');
  if (auth === 'login' || auth === 'register') {
    return { showLanding: false, authView: auth };
  }

  return { showLanding: true, authView: 'login' };
}

function writeAuthUrl(view, mode = 'push') {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.delete('resetToken');
  url.searchParams.set('auth', view);
  window.history[mode === 'replace' ? 'replaceState' : 'pushState'](
    null,
    '',
    `${url.pathname}${url.search}${url.hash}`,
  );
}

function writeLandingUrl(mode = 'push') {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.delete('auth');
  url.searchParams.delete('resetToken');
  window.history[mode === 'replace' ? 'replaceState' : 'pushState'](
    null,
    '',
    `${url.pathname}${url.search}${url.hash}`,
  );
}

function getInitialThemeMode() {
  if (typeof window === 'undefined') return 'light';
  const saved = window.localStorage.getItem('far-away-theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return 'light';
}

function formatSubmissionDate(dateValue) {
  if (!dateValue) return 'Unknown date';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateValue));
}

function mapTeacherSubmissions(submissionsList = []) {
  return submissionsList.map(submission => {
    const studentName = getDisplayName(submission.userId);
    const assessment = submission.assessmentId || {};
    const reviewQuestions = submission.reviewQuestions?.length
      ? submission.reviewQuestions
      : submission.answers || [];
    const totalCount = submission.correctCount + submission.incorrectCount || reviewQuestions.length;

    return {
      id: submission._id || submission.id,
      studentName,
      studentInitials: getInitials(studentName),
      testId: assessment._id || assessment.id || submission.assessmentId,
      testTitle: assessment.title || 'Assessment',
      subjectName: assessment.topic ? `${assessment.topic} Lab` : 'Assessment',
      score: submission.score || 0,
      correctCount: submission.correctCount || 0,
      totalCount,
      date: formatSubmissionDate(submission.createdAt),
      answers: Object.fromEntries(
        (submission.answers || []).map(answer => [answer.questionId, answer.userAnswer]),
      ),
      questions: reviewQuestions.map((answer, index) => ({
        id: answer.questionId || `${submission._id || submission.id}-${index}`,
        text: answer.text || `Question ${index + 1}`,
        correct: answer.correctAnswer || '',
        isCorrect: Boolean(answer.isCorrect),
        studentAns: answer.userAnswer,
      })),
      feedback: submission.feedback || '',
    };
  });
}

export default function App() {
  // ─── Toasts ───
  const { toasts, showToast, removeToast } = useToast();

  // ─── Auth ───
  const { isLoggedIn, authUser, initializing, logout, refreshUser } = useAuth();

  const initialAuthScreen = getInitialAuthScreen();

  // Auth page tab: 'login' | 'register' (used when modal redirects to AuthPage)
  const [authView, setAuthView] = useState(initialAuthScreen.authView);
  const [showLanding, setShowLanding] = useState(initialAuthScreen.showLanding);
  const [themeMode, setThemeMode] = useState(getInitialThemeMode);

  // When guest tries a gated action
  const [authModal, setAuthModal] = useState({ open: false });

  // Whether user chose to browse as guest (hides AuthPage)
  const [guestMode, setGuestMode] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    window.localStorage.setItem('far-away-theme', themeMode);
  }, [themeMode]);

  useEffect(() => {
    const handlePopState = () => {
      if (isLoggedIn || guestMode) return;
      const next = getInitialAuthScreen();
      setAuthView(next.authView);
      setShowLanding(next.showLanding);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [guestMode, isLoggedIn]);

  // ───────────────────────────────────────────
  // APP STATE (with dynamic subjects and role sync)
  // ───────────────────────────────────────────
  const [activeTab, setActiveTab]                 = useState('dashboard');
  const [searchQuery, setSearchQuery]             = useState('');
  const [hasUnread, setHasUnread]                 = useState(true);

  // User
  const [user, setUser]                           = useState(INITIAL_USER);

  // Subjects, submissions and feedback state
  const [subjects, setSubjects]                   = useState([]);
  const [submissions, setSubmissions]             = useState(INITIAL_SUBMISSIONS);
  const [competitions, setCompetitions]           = useState([]);
  const [skillSwap, setSkillSwap]                 = useState({ matches: [], recommended: [], requests: [], myPostings: [] });
  const [progress, setProgress]                   = useState([]);
  const [insights, setInsights]                   = useState(null);
  const [practiceSet, setPracticeSet]             = useState(null);
  const [appDataLoading, setAppDataLoading]       = useState(false);
  const [appDataError, setAppDataError]           = useState('');

  // Sync authUser info to local state
  useEffect(() => {
    if (initializing) return;

    if (isLoggedIn && authUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-way sync of auth user into local UI state on login
      setUser(prev => ({
        ...prev,
        id: authUser._id || authUser.id,
        name: authUser.name,
        initials: authUser.name.split(' ').map(x => x[0]).join('').toUpperCase(),
        role: authUser.role || 'student',
        coins: toFiniteNumber(authUser.coinsBalance, 0),
        streak: toFiniteNumber(authUser.streak, 0),
        rank: toFiniteNumber(authUser.rank, 0),
        xp: toFiniteNumber(authUser.xp, 0),
        level: toFiniteNumber(authUser.level, 0),
        skillAreas: authUser.skillAreas || [],
      }));
      setActiveTab(authUser.role === 'teacher' ? 'class-progress' : 'dashboard');
    } else if (!isLoggedIn) {
      setUser(INITIAL_USER);
      setActiveTab('dashboard');
    }
  }, [isLoggedIn, authUser, initializing]);

  // Sync dynamic data on login/logout and handle sockets
  useEffect(() => {
    if (initializing) return undefined;

    if (isLoggedIn && authUser) {
      // Connect to Socket.io namespaces
      connectSockets(authUser._id || authUser.id);

      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear guest/demo data before authenticated API responses arrive
      setSubjects([]);
      setSubmissions([]);
      setCompetitions([]);
      setSkillSwap({ matches: [], recommended: [], requests: [], myPostings: [] });
      setProgress([]);
      setInsights(null);
      setPracticeSet(null);
      setAppDataLoading(true);
      setAppDataError('');
      
      const socket = getRootSocket();
      if (socket) {
        socket.on('notification:new', (payload) => {
          showToast(payload.message || 'New notification!', payload.type || 'info');
          setHasUnread(true);
        });
      }

      const fetchData = async () => {
        try {
          const authUserId = authUser._id || authUser.id;
          const role = authUser.role || 'student';

          if (role === 'teacher' || role === 'admin') {
            const [assessmentsData, submissionsData] = await Promise.all([
              AssessmentService.list(),
              AssessmentService.submissions(),
            ]);

            setSubjects(groupAssessmentsIntoSubjects(assessmentsData));
            setSubmissions(mapTeacherSubmissions(submissionsData));
            setCompetitions([]);
            setSkillSwap({ matches: [], recommended: [], requests: [], myPostings: [] });
            setProgress([]);
            setInsights(null);
            setPracticeSet(null);
            return;
          }

          const [coreData, analyticsData] = await Promise.all([
            Promise.all([
              AssessmentService.list(),
              CompetitionService.list(),
              SkillSwapService.requests(),
              SkillSwapService.recommended().catch(() => []),
            ]),
            Promise.allSettled([
              AnalyticsService.progress(),
              AnalyticsService.insights(),
              AnalyticsService.practiceSet(),
            ]),
          ]);

          const [
            assessmentsData,
            competitionsData,
            skillSwapData,
            recommendedPeersData,
          ] = coreData;

          const [progressResult, insightsResult, practiceSetResult] = analyticsData;
          const analyticsFailed = analyticsData.some(result => result.status === 'rejected');

          setSubjects(groupAssessmentsIntoSubjects(assessmentsData));
          setCompetitions(mapCompetitions(competitionsData, authUserId));
          setSkillSwap(mapSkillSwap(skillSwapData, authUserId, recommendedPeersData));
          if (progressResult.status === 'fulfilled' && progressResult.value?.progress) {
            setProgress(progressResult.value.progress);
          }
          if (insightsResult.status === 'fulfilled') {
            setInsights(insightsResult.value);
          }
          if (practiceSetResult.status === 'fulfilled') {
            setPracticeSet(practiceSetResult.value);
          }
          setAppDataError(
            analyticsFailed
              ? 'Live analytics could not be fully loaded. Your quizzes and account data are still using the backend.'
              : '',
          );
        } catch (err) {
          console.error('Failed to fetch app data from API:', err);
          showToast('Could not load live data from server. Please retry or check the backend.', 'error');
          setSubjects(groupAssessmentsIntoSubjects([]));
          setCompetitions([]);
          setSkillSwap({ matches: [], recommended: [], requests: [], myPostings: [] });
          setSubmissions([]);
          setProgress([]);
          setInsights(null);
          setPracticeSet(null);
          setAppDataError(err.message || 'Unable to load live data from server.');
        } finally {
          setAppDataLoading(false);
        }
      };

      fetchData();

      return () => {
        const s = getRootSocket();
        if (s) s.off('notification:new');
      };
    } else {
      disconnectSockets();
      setSubjects(SUBJECTS);
      setCompetitions(INITIAL_COMPETITIONS);
      setSkillSwap(INITIAL_SKILLSWAP);
      setSubmissions(INITIAL_SUBMISSIONS);
      setInsights(null);
      setPracticeSet(null);
      setAppDataLoading(false);
      setAppDataError('');
    }
  }, [isLoggedIn, authUser, showToast, initializing]);

  // Quiz engine
  const [quizState, setQuizState] = useState({
    assessment:          null,
    currentQuestionIndex: 0,
    answers:             {},
    flagged:             {},
    timeRemaining:       0,
  });
  const [quizResult, setQuizResult] = useState(null);

  // ─── Quiz Timer ───
  const { stop: stopTimer } = useQuizTimer(
    !!quizState.assessment && quizState.timeRemaining > 0,
    (updater) => setQuizState(prev => ({ ...prev, timeRemaining: updater(prev.timeRemaining) })),
    () => {
      showToast('Time is up! Auto-submitting…', 'warning');
      // eslint-disable-next-line react-hooks/immutability -- handleSubmitQuiz is declared later in the component; only invoked at runtime on timer expiry
      handleSubmitQuiz();
    },
  );

  // ───────────────────────────────────────────
  // AUTH GUARD HELPER
  // ───────────────────────────────────────────
  const guarded = (fn) => (...args) => {
    if (!isLoggedIn) {
      setAuthModal({ open: true });
      return;
    }
    return fn(...args);
  };

  // ───────────────────────────────────────────
  // HANDLERS
  // ───────────────────────────────────────────

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
  };

  // Quiz: Start (GATED)
  const handleStartQuiz = guarded(async (assessment) => {
    try {
      showToast('Loading quiz questions...', 'info');
      const res = await AssessmentService.questions(assessment.id);
      
      const questions = (res.questions || []).map(q => ({
        id: q._id || q.id,
        type: q.type || 'mcq',
        text: q.title || q.text,
        options: q.options || [],
      }));

      setQuizState({
        assessment: {
          ...assessment,
          questions,
          isAdaptive: res.isAdaptive || false,
        },
        currentQuestionIndex: 0,
        answers:  {},
        flagged:  {},
        timeRemaining: (res.duration || assessment.duration) * 60,
      });
      setActiveTab('quiz');
    } catch (err) {
      console.error('Failed to load quiz questions:', err);
      showToast('Failed to start quiz. Please try again.', 'error');
    }
  });

  // Quiz: Select MCQ option
  const handleSelectOption = (questionId, option) => {
    setQuizState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: option },
    }));
  };

  // Quiz: Code change
  const handleCodeChange = (questionId, val) => {
    setQuizState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: val },
    }));
  };

  // Quiz: Toggle flag
  const handleToggleFlag = () => {
    const qId = quizState.assessment.questions[quizState.currentQuestionIndex].id;
    setQuizState(prev => ({
      ...prev,
      flagged: { ...prev.flagged, [qId]: !prev.flagged[qId] },
    }));
  };

  // Quiz: Navigate (prev/next/jump)
  const handleQuizNav = (indexOrFn) => {
    setQuizState(prev => {
      const totalQ = prev.assessment.questions.length;
      const newIdx = typeof indexOrFn === 'number'
        ? Math.min(totalQ - 1, Math.max(0, indexOrFn))
        : Math.min(totalQ - 1, Math.max(0, prev.currentQuestionIndex + 1));
      return { ...prev, currentQuestionIndex: newIdx };
    });
  };

  const handleQuizPrev = () => {
    setQuizState(prev => ({
      ...prev,
      currentQuestionIndex: Math.max(0, prev.currentQuestionIndex - 1),
    }));
  };

  const handleRequestQuizHint = guarded(async ({ questionId, studentAnswer, hintLevel }) => {
    if (!quizState.assessment) return null;

    return AnalyticsService.hint({
      assessmentId: quizState.assessment.id,
      questionId,
      studentAnswer,
      hintLevel,
    });
  });

  // Quiz: Submit
  const handleSubmitQuiz = async (state = quizState) => {
    stopTimer();

    const actualState = (state && state.assessment) ? state : quizState;
    const { assessment, answers } = actualState;
    if (!assessment) return;

    try {
      showToast('Submitting answers to server...', 'info');
      const timeTaken = assessment.duration * 60 - actualState.timeRemaining;
      
      const res = await AssessmentService.submit(assessment.id, answers, timeTaken);
      
      const percentage = res.score;
      const correct = res.correctCount;
      const coinsEarned = res.coinsEarned;
      const xpEarned = percentage * 5;

      setQuizResult({
        percentage,
        correct,
        total: assessment.questions.length,
        coinsEarned,
        xpEarned,
        submissionId: res._id,
        questions: assessment.questions,
        answers: res.answers,
      });

      await refreshUser();

      try {
        const [progressData, insightsData, practiceSetData] = await Promise.all([
          AnalyticsService.progress().catch(() => null),
          AnalyticsService.insights().catch(() => null),
          AnalyticsService.practiceSet().catch(() => null),
        ]);
        if (progressData && progressData.progress) {
          setProgress(progressData.progress);
        }
        if (insightsData) {
          setInsights(insightsData);
        }
        if (practiceSetData) {
          setPracticeSet(practiceSetData);
        }
      } catch (err) {
        console.error('Failed to refresh progress/insights analytics:', err);
      }
      
      setQuizState({
        assessment: null,
        currentQuestionIndex: 0,
        answers: {},
        flagged: {},
        timeRemaining: 0,
      });

      setActiveTab('dashboard');
      showToast(`Quiz submitted successfully! Earned +${coinsEarned} coins.`, 'success');
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      showToast('Failed to submit quiz score. Please try again.', 'error');
    }
  };

  // Daily coin bonus (GATED)
  const handleCoinClick = guarded(async () => {
    try {
      const data = await CoinService.claimDailyBonus();
      setUser(prev => ({ ...prev, coins: data.coinsBalance }));
      await refreshUser();
      showToast(`+${data.amount} daily bonus coins claimed.`, 'success');
    } catch (err) {
      showToast(
        err.message || 'Daily bonus is not available right now.',
        err.status === 409 ? 'warning' : 'error',
      );
    }
  });

  // Competition register (GATED)
  const handleRegisterComp = guarded(async (id) => {
    const comp = competitions.find(c => c.id === id);
    if (!comp) return;

    if (user.coins >= comp.fee) {
      try {
        await CompetitionService.join(id);
        await refreshUser();
        showToast(`Joined ${comp.title}! Stakes registered.`, 'success');
        setCompetitions(prev => prev.map(c =>
          c.id === id ? { ...c, registered: true, participants: c.participants + 1 } : c
        ));
      } catch (err) {
        console.error('Failed to join competition:', err);
        showToast(err.message || 'Failed to join competition.', 'error');
      }
    } else {
      showToast(`Not enough coins. Need ${comp.fee - user.coins} more.`, 'error');
    }
  });

  const refreshSkillSwapState = async () => {
    const authUserId = authUser._id || authUser.id;
    const [skillSwapData, recommendedPeersData] = await Promise.all([
      SkillSwapService.requests(),
      SkillSwapService.recommended().catch(() => []),
    ]);
    setSkillSwap(mapSkillSwap(skillSwapData, authUserId, recommendedPeersData));
  };

  // SkillSwap handlers (GATED)
  const handleRequestSwap = guarded(async (peerId) => {
    const peer = [...skillSwap.matches, ...(skillSwap.recommended || [])].find(m => m.id === peerId);
    if (!peer) return;

    try {
      await SkillSwapService.accept(peerId);

      await refreshSkillSwapState();

      showToast(`Swap connected with ${peer.name}!`, 'success');
    } catch (err) {
      console.error('Failed to request swap:', err);
      showToast('Failed to send swap request.', 'error');
    }
  });

  const handleAcceptRequest = guarded(async (reqId) => {
    try {
      await SkillSwapService.accept(reqId);
      
      await refreshSkillSwapState();

      showToast('Request accepted! Chat channel ready.', 'success');
    } catch (err) {
      console.error('Failed to accept request:', err);
      showToast('Failed to accept request.', 'error');
    }
  });

  const handleIgnoreRequest = guarded(async (reqId) => {
    try {
      await SkillSwapService.decline(reqId);
      
      await refreshSkillSwapState();

      showToast('Request declined.', 'warning');
    } catch (err) {
      console.error('Failed to decline request:', err);
      showToast('Failed to decline request.', 'error');
    }
  });

  // Post a swap (GATED)
  const handlePostSwap = guarded(async ({ teach, learn, msg }) => {
    try {
      await SkillSwapService.post({
        teachSkill: teach,
        learnSkill: learn,
        message: msg,
      });
      
      await refreshSkillSwapState();
      
      showToast('Your swap is live! Peers can now find you.', 'success');
    } catch (err) {
      console.error('Failed to post swap:', err);
      showToast('Failed to post swap.', 'error');
    }
  });

  // Teacher actions
  const handleCreateTest = async (newTest, subjectId) => {
    try {
      const topic = SUBJECT_MAP[Object.keys(SUBJECT_MAP).find(k => SUBJECT_MAP[k].id === subjectId)]?.shortName.split(' ')[0] || 'OOPs';
      
      const questions = newTest.questions.map(q => ({
        type: q.type,
        title: q.text,
        options: q.options,
        correctAnswer: q.correct,
        points: 1,
      }));

      await AssessmentService.create({
        title: newTest.title,
        topic,
        difficulty: newTest.difficulty,
        duration: newTest.duration,
        coinsReward: newTest.coinsReward || 20,
        questions,
      });

      const assessmentsData = await AssessmentService.list();
      setSubjects(groupAssessmentsIntoSubjects(assessmentsData));

      showToast('Adaptive test created and published successfully!', 'success');
    } catch (err) {
      console.error('Failed to create assessment:', err);
      showToast('Failed to create test on server.', 'error');
    }
  };

  const handleSaveFeedback = async (submissionId, feedbackNote) => {
    const saveLocally = (message = 'Feedback note saved locally.') => {
      setSubmissions(prev => prev.map(s => {
        if (s.id !== submissionId) return s;
        return { ...s, feedback: feedbackNote };
      }));
      showToast(message, 'success');
    };

    const canPersist = isLoggedIn
      && ['teacher', 'admin'].includes(user.role)
      && /^[a-f\d]{24}$/i.test(String(submissionId));

    if (canPersist) {
      try {
        const updated = await AssessmentService.saveFeedback(submissionId, feedbackNote);
        const [mapped] = mapTeacherSubmissions([updated]);
        setSubmissions(prev => prev.map(s => (s.id === submissionId ? mapped : s)));
        showToast('Feedback note saved to the server and sent to the student!', 'success');
        return;
      } catch (err) {
        console.error('Failed to save feedback on server:', err);
        saveLocally('Could not reach the server, so the feedback was kept locally for now.');
        return;
      }
    }

    setSubmissions(prev => prev.map(s => {
      if (s.id !== submissionId) return s;
      return { ...s, feedback: feedbackNote };
    }));
    showToast('Feedback note saved locally.', 'success');
  };

  const handleGenerateStudyNote = async (submissionId) => {
    const canUseServerTutor = isLoggedIn
      && ['teacher', 'admin'].includes(user.role)
      && /^[a-f\d]{24}$/i.test(String(submissionId));

    if (!canUseServerTutor) return null;

    try {
      const data = await AnalyticsService.studyNote(submissionId);
      showToast('AI study note drafted from the submission.', 'success');
      return data.note;
    } catch (err) {
      console.error('Failed to generate study note on server:', err);
      showToast('AI tutor unavailable. Drafted a local note instead.', 'warning');
      throw err;
    }
  };

  // ───────────────────────────────────────────
  // AUTH MODAL ACTIONS
  // ───────────────────────────────────────────
  const closeAuthModal = () => setAuthModal({ open: false });

  const openAuthPage = (view = 'login', mode = 'push') => {
    setGuestMode(false);
    setAuthView(view);
    setShowLanding(false);
    writeAuthUrl(view, mode);
  };

  const openLandingPage = (mode = 'push') => {
    setGuestMode(false);
    setAuthView('login');
    setShowLanding(true);
    writeLandingUrl(mode);
  };

  const goToSignIn = () => {
    closeAuthModal();
    openAuthPage('login');
  };

  const goToRegister = () => {
    closeAuthModal();
    openAuthPage('register');
  };

  // ───────────────────────────────────────────
  // LOGOUT
  // ───────────────────────────────────────────
  const handleLogout = () => {
    logout();
    openLandingPage('replace');
  };

  const liveAssessments = subjects.flatMap(s => s.assessments);
  const dashboardAssessments = isLoggedIn
    ? liveAssessments
    : (liveAssessments.length ? liveAssessments : ASSESSMENTS);

  // ───────────────────────────────────────────
  // RENDER — Auth gate
  // ───────────────────────────────────────────

  // Show auth page if:
  // - user is NOT logged in AND hasn't chosen guest mode
  if (initializing) {
    return (
      <div className="min-h-screen bg-bgPrimary text-textPrimary flex items-center justify-center px-6">
        <div className="card p-6 w-full max-w-sm text-center">
          <div className="w-10 h-10 mx-auto mb-4 rounded-lg bg-accentIndigo/10 border border-accentIndigo/20 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full border-2 border-accentIndigo border-t-transparent animate-spin" />
          </div>
          <p className="font-display font-semibold text-sm text-textPrimary">Restoring your session</p>
          <p className="text-xs text-textMuted mt-1">Loading your live workspace...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn && !guestMode) {
    if (showLanding) {
      return (
        <LandingPage
          onSignIn={() => openAuthPage('login')}
          onGetStarted={() => openAuthPage('register')}
          onGuestBrowse={() => setGuestMode(true)}
          themeMode={themeMode}
          onToggleTheme={() => setThemeMode(mode => mode === 'dark' ? 'light' : 'dark')}
        />
      );
    }
    return (
      <AuthPage
        onGuestBrowse={() => setGuestMode(true)}
        initialTab={authView}
        onBackToLanding={() => openLandingPage()}
        themeMode={themeMode}
        onToggleTheme={() => setThemeMode(mode => mode === 'dark' ? 'light' : 'dark')}
      />
    );
  }

  // ───────────────────────────────────────────
  // RENDER — Main App (guest or authenticated)
  // ───────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-bgPrimary text-textPrimary font-sans relative">

      {/* Header */}
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        user={user}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onLogin={() => openAuthPage('login')}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        hasUnread={hasUnread}
        onNotificationClick={() => {
          setHasUnread(false);
        }}
        onCoinClick={handleCoinClick}
        themeMode={themeMode}
        onToggleTheme={() => setThemeMode(mode => mode === 'dark' ? 'light' : 'dark')}
        userRole={user.role}
      />

      {/* Main Content */}
      <div className="flex-grow flex flex-col">

        {/* Page Content */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-screen-xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              user={user}
              assessments={dashboardAssessments}
              skillSwap={skillSwap}
              competitions={competitions}
              progress={progress}
              insights={insights}
              practiceSet={practiceSet}
              dataLoading={appDataLoading}
              dataError={appDataError}
              isLiveData={isLoggedIn}
              onStartQuiz={handleStartQuiz}
              onGoToAssessments={() => handleTabChange('assessments')}
              onGoToCoding={() => handleTabChange('coding')}
              onGoToSkillSwap={() => handleTabChange('skillswap')}
              onRegisterComp={handleRegisterComp}
              onCoinClick={handleCoinClick}
            />
          )}

          {activeTab === 'assessments' && (
            <AssessmentsView
              subjects={subjects}
              onStart={handleStartQuiz}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'quiz' && quizState.assessment && (
            <QuizView
              quiz={quizState}
              onSelectOption={handleSelectOption}
              onCodeChange={handleCodeChange}
              onToggleFlag={handleToggleFlag}
              onPrev={handleQuizPrev}
              onNext={handleQuizNav}
              onSubmit={() => handleSubmitQuiz()}
              onRequestHint={handleRequestQuizHint}
            />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardView
              currentUserName={user.name}
            />
          )}

          {activeTab === 'competitions' && (
            <CompetitionsView
              competitions={competitions}
              onRegister={handleRegisterComp}
              userCoins={user.coins}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'coding' && (
            <CodingPracticeView
              isLoggedIn={isLoggedIn}
              onRequireAuth={() => setAuthModal({ open: true })}
            />
          )}

          {activeTab === 'skillswap' && (
            <SkillSwapView
              skillSwap={skillSwap}
              onRequestSwap={handleRequestSwap}
              onAccept={handleAcceptRequest}
              onIgnore={handleIgnoreRequest}
              onPostSwap={handlePostSwap}
              searchQuery={searchQuery}
            />
          )}

          {/* Teacher views */}
          {activeTab === 'class-progress' && (
            <ClassProgressView
              submissions={submissions}
              onSaveFeedback={handleSaveFeedback}
              onGenerateStudyNote={handleGenerateStudyNote}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'create-test' && (
            <CreateTestView
              subjects={subjects}
              onCreateTest={handleCreateTest}
            />
          )}
        </main>
      </div>

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Results Modal */}
      {quizResult && (
        <ResultsModal
          result={quizResult}
          onClose={() => setQuizResult(null)}
        />
      )}

      {/* Auth Modal — fires when guest tries a gated action */}
      <AuthModal
        isOpen={authModal.open}
        onClose={closeAuthModal}
        onSignIn={goToSignIn}
        onRegister={goToRegister}
      />
    </div>
  );
}
