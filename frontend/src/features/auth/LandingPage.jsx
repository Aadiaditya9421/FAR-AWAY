import { useState } from 'react';
import {
  LogoMark,
  IconArrowsSwap,
  IconAward,
  IconCheck,
  IconCode,
  IconCoin,
  IconMoon,
  IconSun,
  IconTarget,
  IconTrophy,
  IconUser,
  IconZap,
} from '../../components/ui/Icons';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1800&q=80';

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Create your account',
    body: 'Join as a student or faculty member and keep your learning progress, coins, and streaks live.',
  },
  {
    step: '02',
    title: 'Take adaptive assessments',
    body: 'Solve question-bank driven quizzes that adjust by topic, difficulty, and mastery signals.',
  },
  {
    step: '03',
    title: 'Improve with insights',
    body: 'Use AI summaries, practice sets, competitions, and peer swaps to keep moving forward.',
  },
];

const LEARNING_FEATURES = [
  {
    Icon: IconTarget,
    problem: 'Struggling with one-size-fits-all learning?',
    solution: 'Adaptive Assessments',
    description:
      'Questions respond to your topic history, mastery, and difficulty level while the core scoring stays deterministic.',
    benefits: ['Real-time difficulty signals', 'Bayesian mastery tracking', 'Anti-repeat question selection'],
  },
  {
    Icon: IconTrophy,
    problem: 'Learning feels low-energy without competition?',
    solution: 'Live Competitions and Leaderboards',
    description:
      'Compete with peers in live arenas, climb ranked boards, and use coin pools to make practice feel active.',
    benefits: ['Live scoring updates', 'Individual and class contests', 'Coin-based prize pools'],
  },
  {
    Icon: IconZap,
    problem: 'Not sure what to focus on next?',
    solution: 'AI Learning Insights',
    description:
      'Get personalized weakness summaries, misconception explanations, targeted practice, and study notes.',
    benefits: ['Topic recommendations', 'Misconception mapping', 'AI-generated study notes'],
  },
  {
    Icon: IconArrowsSwap,
    problem: 'Need help from people learning beside you?',
    solution: 'SkillSwap Peer Learning',
    description:
      'Connect with classmates and friends to exchange skills. Teach what you know and learn from students who understand your weak topics.',
    benefits: ['Student-to-student swaps', 'Friend and classmate learning', 'No role hierarchy'],
  },
  {
    Icon: IconCode,
    problem: 'Need coding practice with useful feedback?',
    solution: 'Code Practice and Review',
    description:
      'Write code in an online editor, run submissions, and use structured review feedback to improve your approach.',
    benefits: ['Monaco editor', 'Run and submit flow', 'Structured code feedback'],
  },
  {
    Icon: IconCoin,
    problem: 'Want a reason to return every day?',
    solution: 'Coins, Streaks, and Achievements',
    description:
      'Start with welcome coins, keep a daily streak alive, and earn rewards through assessments, contests, and swaps.',
    benefits: ['Welcome coins', 'Daily streaks', 'Achievement progress'],
  },
];

export default function LandingPage({
  onSignIn,
  onGetStarted,
  onGuestBrowse,
  themeMode = 'light',
  onToggleTheme,
}) {
  const isDark = themeMode === 'dark';
  const [activeFeature, setActiveFeature] = useState(LEARNING_FEATURES[0].solution);
  const activeFeatureData = LEARNING_FEATURES.find(item => item.solution === activeFeature) || LEARNING_FEATURES[0];
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-bgPrimary text-textPrimary">
      <section
        className="relative min-h-[92vh] overflow-hidden bg-surfaceDark text-white"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(16,16,16,0.90) 0%, rgba(16,16,16,0.70) 46%, rgba(16,16,16,0.22) 100%), url(${HERO_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <header className="relative z-10 flex items-center justify-between gap-3 px-4 py-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <LogoMark size={34} />
            <div>
              <p className="text-sm font-bold leading-none">SkillPath</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-white/65">Learning Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-md border border-white/20 bg-white/10 text-white hover:bg-white/15 transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <IconSun size={17} /> : <IconMoon size={17} />}
            </button>
            <button
              type="button"
              onClick={onSignIn}
              className="rounded-md px-3 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 transition-colors sm:px-4"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={onGetStarted}
              className="rounded-md bg-accentIndigo px-3 py-2 text-sm font-semibold text-white hover:bg-accentViolet transition-colors sm:px-4"
            >
              Start
            </button>
          </div>
        </header>

        <div className="relative z-10 grid min-h-[calc(92vh-76px)] items-center gap-8 px-5 pb-20 sm:px-8 lg:grid-cols-[1fr_380px] lg:px-12">
          <div className="max-w-3xl animate-landing-rise">
            <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/75 backdrop-blur landing-glow">
              Personalized learning, powered by adaptive practice
            </p>
            <h1 className="text-5xl font-bold leading-[1.02] sm:text-6xl lg:text-7xl">
              SkillPath
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/78 sm:text-xl">
              Adapt to your pace, compete with peers, exchange skills with students, and master topics faster with live insights.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onGetStarted}
                className="btn-primary justify-center"
              >
                Get Started Free
              </button>
              <button
                type="button"
                onClick={onGuestBrowse}
                className="rounded-md border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/15 transition-colors"
              >
                Preview as Guest
              </button>
              <button
                type="button"
                onClick={scrollToFeatures}
                className="rounded-md border border-white/25 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/15 transition-colors"
              >
                Explore Features
              </button>
            </div>
          </div>

          <div className="hidden lg:block animate-landing-float">
            <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-xl shadow-modal">
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <p className="text-xs font-bold uppercase tracking-wide text-white/65">Live loop</p>
                <span className="rounded-full bg-accentEmerald px-2 py-0.5 text-[10px] font-bold text-white">Ready</span>
              </div>
              {[
                ['Assess', 'Adaptive topic quiz unlocked'],
                ['Improve', 'Weakness summary generated'],
                ['Connect', 'Verified SkillSwap session ready'],
              ].map(([label, body], index) => (
                <div key={label} className="mt-3 rounded-md border border-white/15 bg-black/20 p-3 landing-stagger" style={{ animationDelay: `${index * 120}ms` }}>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-white/55">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-borderColor bg-bgCard">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-5 py-6 sm:grid-cols-3 sm:px-8 lg:px-12">
          {[
            ['500', 'welcome coins for new accounts'],
            ['BKT', 'mastery tracking and adaptive practice'],
            ['Live', 'MongoDB, Redis, SMTP, and Google auth ready'],
          ].map(([value, label]) => (
            <div key={label} className="rounded-lg border border-borderColor bg-bgSecondary p-4 landing-stat">
              <p className="text-2xl font-bold text-textPrimary">{value}</p>
              <p className="mt-1 text-xs font-medium text-textMuted">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-12">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-accentIndigo">How it works</p>
          <h2 className="mt-2 text-3xl font-bold text-textPrimary sm:text-4xl">Three steps to start learning smarter</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {HOW_IT_WORKS.map(item => (
            <article key={item.step} className="card p-5 landing-feature-card">
              <p className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md border border-accentIndigo/20 bg-accentIndigo/10 text-sm font-bold text-accentIndigo">
                {item.step}
              </p>
              <h3 className="text-lg font-bold text-textPrimary">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-textMuted">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="features" className="border-y border-borderColor bg-bgCard scroll-mt-20">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-12">
          <div className="mb-8 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-accentIndigo">Features that help you learn</p>
            <h2 className="mt-2 text-3xl font-bold text-textPrimary sm:text-4xl">Everything you need to master your skills</h2>
          </div>

          <div className="mb-5 rounded-lg border border-accentIndigo/20 bg-accentIndigo/6 p-5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-accentIndigo">Currently highlighted</p>
            <h3 className="mt-2 text-xl font-bold text-textPrimary">{activeFeatureData.solution}</h3>
            <p className="mt-2 text-sm leading-relaxed text-textMuted">{activeFeatureData.description}</p>
          </div>

          <div className="mx-auto flex max-w-4xl flex-col gap-4">
            {LEARNING_FEATURES.map(feature => (
              <FeatureCard
                key={feature.solution}
                active={feature.solution === activeFeature}
                onActivate={() => setActiveFeature(feature.solution)}
                {...feature}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-accentIndigo">For teachers</p>
            <h2 className="mt-2 text-3xl font-bold text-textPrimary sm:text-4xl">Run assessments without losing the learning signal.</h2>
            <p className="mt-4 text-sm leading-relaxed text-textMuted sm:text-base">
              Create static or dynamic adaptive tests, review class progress, organize competitions, and give feedback without mixing AI into grading.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                'Create adaptive lab tests',
                'Review class analytics',
                'Organize competitions',
                'Provide submission feedback',
              ].map(item => (
                <div key={item} className="flex items-center gap-2 rounded-md border border-borderColor bg-bgCard p-3">
                  <IconCheck size={15} className="text-accentEmerald" />
                  <span className="text-sm font-semibold text-textSecondary">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-borderColor bg-bgCard p-6 shadow-card">
            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-accentIndigo/10 text-accentIndigo">
              <IconAward size={24} />
            </div>
            <h3 className="mt-5 text-xl font-bold text-textPrimary">Empower your classroom</h3>
            <p className="mt-2 text-sm leading-relaxed text-textMuted">
              Keep assessment logic predictable while giving students visible progress, rewards, and practical next steps.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-borderColor bg-bgCard">
        <div className="mx-auto max-w-6xl px-5 py-12 text-center sm:px-8 lg:px-12">
          <IconUser size={28} className="mx-auto mb-4 text-accentIndigo" />
          <h2 className="text-3xl font-bold text-textPrimary">Ready to learn smarter?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-textMuted">
            Start with adaptive practice, live competitions, and peer learning built for students and teachers.
          </p>
          <button type="button" onClick={onGetStarted} className="btn-primary mt-6 justify-center">
            Get Started Free
          </button>
        </div>
      </section>

      <footer className="border-t border-borderColor bg-bgCard px-5 py-6 text-center text-xs text-textMuted">
        SkillPath Learning Platform. Student and faculty portal.
      </footer>
    </div>
  );
}

function FeatureCard({ Icon, problem, solution, description, benefits, active, onActivate }) {
  return (
    <article
      role="button"
      tabIndex={0}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onClick={onActivate}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') onActivate();
      }}
      className={`card overflow-hidden landing-feature-card ${active ? 'landing-feature-card-active' : ''}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-[0.95fr_1.05fr]">
        <div className="border-b border-borderColor bg-bgSecondary p-5 md:border-b-0 md:border-r">
          <div className="landing-feature-icon mb-4 flex h-11 w-11 items-center justify-center rounded-md border border-borderColor bg-bgCard text-accentIndigo">
            <Icon size={20} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-textMuted">Problem</p>
          <h3 className="mt-2 text-lg font-bold leading-snug text-textPrimary">{problem}</h3>
        </div>

        <div className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-wide text-accentIndigo">Solution</p>
          <h3 className="mt-2 text-lg font-bold text-textPrimary">{solution}</h3>
          <p className="mt-2 text-sm leading-relaxed text-textMuted">{description}</p>

          <div className="mt-4 flex flex-col gap-2">
            {benefits.map(benefit => (
              <div key={benefit} className="flex items-center gap-2 text-xs font-semibold text-textSecondary">
                <span className="h-1.5 w-1.5 rounded-full bg-accentIndigo" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
