// src/App.jsx
// ─── Far Away — Main App Orchestrator ───
// All business logic lives here. Feature views are pure presentational components.

import React, { useState, useEffect } from 'react';

// ── Auth ──
import { useAuth } from './context/AuthContext';
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

// ── Teacher Views ──
import ClassProgressView from './features/teacher/ClassProgressView';
import CreateTestView    from './features/teacher/CreateTestView';

// ── Data ──
import {
  INITIAL_USER,
  ASSESSMENTS,
  SUBJECTS,
  LEADERBOARDS,
  INITIAL_SKILLSWAP,
  INITIAL_COMPETITIONS,
} from './data/mockData';

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

export default function App() {
  // ─── Auth ───
  const { isLoggedIn, authUser, logout } = useAuth();

  // Auth page tab: 'login' | 'register' (used when modal redirects to AuthPage)
  const [authView, setAuthView] = useState('login');

  // When guest tries a gated action
  const [authModal, setAuthModal] = useState({ open: false });

  // Whether user chose to browse as guest (hides AuthPage)
  const [guestMode, setGuestMode] = useState(false);

  // ───────────────────────────────────────────
  // APP STATE (with dynamic subjects and role sync)
  // ───────────────────────────────────────────
  const [activeTab, setActiveTab]                 = useState('dashboard');
  const [searchQuery, setSearchQuery]             = useState('');
  const [hasUnread, setHasUnread]                 = useState(true);

  // User
  const [user, setUser]                           = useState(INITIAL_USER);

  // Subjects, submissions and feedback state
  const [subjects, setSubjects]                   = useState(SUBJECTS);
  const [submissions, setSubmissions]             = useState(INITIAL_SUBMISSIONS);

  // Sync authUser info to local state
  useEffect(() => {
    if (isLoggedIn && authUser) {
      setUser(prev => ({
        ...prev,
        name: authUser.name,
        initials: authUser.name.split(' ').map(x => x[0]).join('').toUpperCase(),
        role: authUser.role || 'student'
      }));
      setActiveTab(authUser.role === 'teacher' ? 'class-progress' : 'dashboard');
    } else if (!isLoggedIn) {
      setUser(INITIAL_USER);
      setActiveTab('dashboard');
    }
  }, [isLoggedIn, authUser]);

  // Data
  const [competitions, setCompetitions]           = useState(INITIAL_COMPETITIONS);
  const [skillSwap, setSkillSwap]                 = useState(INITIAL_SKILLSWAP);

  // Quiz engine
  const [quizState, setQuizState] = useState({
    assessment:          null,
    currentQuestionIndex: 0,
    answers:             {},
    flagged:             {},
    timeRemaining:       0,
  });
  const [quizResult, setQuizResult] = useState(null);

  // ─── Toasts ───
  const { toasts, showToast, removeToast } = useToast();

  // ─── Quiz Timer ───
  const { stop: stopTimer } = useQuizTimer(
    !!quizState.assessment && quizState.timeRemaining > 0,
    (updater) => setQuizState(prev => ({ ...prev, timeRemaining: updater(prev.timeRemaining) })),
    () => {
      showToast('Time is up! Auto-submitting…', 'warning');
      handleSubmitQuiz();
    },
  );

  // ───────────────────────────────────────────
  // AUTH GUARD HELPER
  // ───────────────────────────────────────────
  // Wraps any action — if not logged in, shows modal instead.
  const guarded = (fn) => (...args) => {
    if (!isLoggedIn) {
      setAuthModal({ open: true });
      return;
    }
    return fn(...args);
  };

  // ───────────────────────────────────────────
  // HANDLERS (unchanged from original, wrapped with guard where needed)
  // ───────────────────────────────────────────

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
  };

  // Quiz: Start (GATED)
  const handleStartQuiz = guarded((assessment) => {
    setQuizState({
      assessment,
      currentQuestionIndex: 0,
      answers:  {},
      flagged:  {},
      timeRemaining: assessment.duration * 60,
    });
    setActiveTab('quiz');
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

  // Quiz: Submit
  const handleSubmitQuiz = (state = quizState) => {
    stopTimer();

    const { assessment, answers } = state;
    const questions = assessment.questions;
    let correct = 0;

    questions.forEach(q => {
      const userAns = answers[q.id] || '';
      if (q.type === 'mcq') {
        if (userAns.trim().toLowerCase() === q.correct.trim().toLowerCase()) correct++;
      } else {
        if (userAns.includes('grid') || userAns.includes('fr')) correct++;
      }
    });

    const percentage  = Math.round((correct / questions.length) * 100);
    const coinsEarned = percentage >= 80 ? assessment.coinsReward : Math.round(assessment.coinsReward / 2);
    const xpEarned    = percentage * 5;

    setUser(prev => ({
      ...prev,
      coins: prev.coins + coinsEarned,
      xp:    prev.xp + xpEarned,
    }));

    setQuizResult({ percentage, correct, total: questions.length, coinsEarned, xpEarned });

    setQuizState({
      assessment: null, currentQuestionIndex: 0,
      answers: {}, flagged: {}, timeRemaining: 0,
    });

    setActiveTab('dashboard');
  };

  // Coin easter egg (GATED)
  const handleCoinClick = guarded(() => {
    setUser(prev => ({ ...prev, coins: prev.coins + 10 }));
    showToast('+10 bonus coins! Keep exploring.', 'success');
  });

  // Competition register (GATED)
  const handleRegisterComp = guarded((id) => {
    const comp = competitions.find(c => c.id === id);
    if (!comp) return;

    if (user.coins >= comp.fee) {
      setUser(u => ({ ...u, coins: u.coins - comp.fee }));
      showToast(`Joined ${comp.title}! Stakes registered.`, 'success');
      setCompetitions(prev => prev.map(c =>
        c.id === id ? { ...c, registered: true, participants: c.participants + 1 } : c
      ));
    } else {
      showToast(`Not enough coins. Need ${comp.fee - user.coins} more.`, 'error');
    }
  });

  // SkillSwap handlers (GATED)
  const handleRequestSwap = guarded((peerId) => {
    setSkillSwap(prev => ({
      ...prev,
      matches: prev.matches.map(m => m.id === peerId ? { ...m, matched: true } : m),
    }));
    const peer = skillSwap.matches.find(m => m.id === peerId);
    showToast(`Swap request sent to ${peer.name}!`, 'success');
  });

  const handleAcceptRequest = guarded((reqId) => {
    setSkillSwap(prev => {
      const req = prev.requests.find(r => r.id === reqId);
      const newMatch = {
        id:      `peer-${Date.now()}`,
        name:    req.sender,
        give:    req.skill.split(' ⇄ ')[0],
        take:    req.skill.split(' ⇄ ')[1],
        bio:     'Swap approved — sessions connected.',
        avatar:  req.sender.split(' ').map(x => x[0]).join(''),
        matched: true,
      };
      return {
        matches:  [...prev.matches, newMatch],
        requests: prev.requests.map(r => r.id === reqId ? { ...r, status: 'accepted' } : r),
      };
    });
    showToast('Request accepted! Chat channel ready.', 'success');
  });

  const handleIgnoreRequest = guarded((reqId) => {
    setSkillSwap(prev => ({
      ...prev,
      requests: prev.requests.filter(r => r.id !== reqId),
    }));
    showToast('Request declined.', 'warning');
  });

  // Post a swap (GATED)
  const handlePostSwap = guarded(({ teach, learn, msg }) => {
    const newPosting = {
      id:    `post-${Date.now()}`,
      teach,
      learn,
      msg,
    };
    setSkillSwap(prev => ({
      ...prev,
      myPostings: [...(prev.myPostings || []), newPosting],
    }));
    showToast('Your swap is live! Peers can now find you.', 'success');
  });

  // Teacher actions
  const handleCreateTest = (newTest, subjectId) => {
    setSubjects(prev => prev.map(s => {
      if (s.id !== subjectId) return s;
      return {
        ...s,
        assessments: [...s.assessments, newTest]
      };
    }));
    showToast('Adaptive test created and published successfully!', 'success');
  };

  const handleSaveFeedback = (submissionId, feedbackNote) => {
    setSubmissions(prev => prev.map(s => {
      if (s.id !== submissionId) return s;
      return { ...s, feedback: feedbackNote };
    }));
    showToast('Feedback note saved and sent to student!', 'success');
  };

  // ───────────────────────────────────────────
  // AUTH MODAL ACTIONS
  // ───────────────────────────────────────────
  const closeAuthModal = () => setAuthModal({ open: false });

  const goToSignIn = () => {
    closeAuthModal();
    setGuestMode(false);
    setAuthView('login');
  };

  const goToRegister = () => {
    closeAuthModal();
    setGuestMode(false);
    setAuthView('register');
  };

  // ───────────────────────────────────────────
  // LOGOUT
  // ───────────────────────────────────────────
  const handleLogout = () => {
    logout();
    setGuestMode(false);
    setAuthView('login');
  };

  // ───────────────────────────────────────────
  // RENDER — Auth gate
  // ───────────────────────────────────────────

  // Show auth page if:
  // - user is NOT logged in AND hasn't chosen guest mode
  if (!isLoggedIn && !guestMode) {
    return <AuthPage onGuestBrowse={() => setGuestMode(true)} initialTab={authView} />;
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
        onLogin={() => { setGuestMode(false); setAuthView('login'); }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        hasUnread={hasUnread}
        onNotificationClick={() => {
          setHasUnread(false);
          showToast('Welcome back! Solve quizzes to claim ranks.', 'info');
        }}
        onCoinClick={handleCoinClick}
        userRole={user.role}
      />

      {/* Main Content */}
      <div className="flex-grow flex flex-col">

        {/* Page Content */}
        <main className="flex-grow p-8 max-w-[1280px] w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              user={user}
              assessments={ASSESSMENTS}
              skillSwap={skillSwap}
              competitions={competitions}
              onStartQuiz={handleStartQuiz}
              onGoToAssessments={() => handleTabChange('assessments')}
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
              onSubmit={handleSubmitQuiz}
            />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardView
              leaderboards={LEADERBOARDS}
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
