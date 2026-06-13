import {
  LogoMark,
  IconCode,
  IconMoon,
  IconSun,
  IconTrophy,
  IconTarget,
  IconZap,
} from '../../components/ui/Icons';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1800&q=80';

const FEATURES = [
  {
    title: 'Adaptive assessments',
    body: 'Practice from a question bank that responds to topic, difficulty, and mastery signals.',
    Icon: IconTarget,
  },
  {
    title: 'Live competitions',
    body: 'Run skill arenas with coins, rankings, entry fees, and real-time leaderboard updates.',
    Icon: IconTrophy,
  },
  {
    title: 'AI learning support',
    body: 'Get hints, explanations, study notes, and weakness summaries without putting AI in grading.',
    Icon: IconZap,
  },
  {
    title: 'Coding practice',
    body: 'Solve coding problems and receive structured feedback from the integrated tutor flow.',
    Icon: IconCode,
  },
];

export default function LandingPage({
  onSignIn,
  onRegister,
  onGuestBrowse,
  themeMode = 'light',
  onToggleTheme,
}) {
  const isDark = themeMode === 'dark';

  return (
    <div className="min-h-screen bg-bgPrimary text-textPrimary">
      <section
        className="relative min-h-[88vh] overflow-hidden bg-surfaceDark text-white"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(16,16,16,0.88) 0%, rgba(16,16,16,0.68) 46%, rgba(16,16,16,0.20) 100%), url(${HERO_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <LogoMark size={34} />
            <div>
              <p className="text-sm font-bold leading-none">Far Away</p>
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
              className="rounded-md px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 transition-colors"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={onRegister}
              className="rounded-md bg-accentIndigo px-4 py-2 text-sm font-semibold text-white hover:bg-accentViolet transition-colors"
            >
              Create
            </button>
          </div>
        </header>

        <div className="relative z-10 flex min-h-[calc(88vh-76px)] items-center px-5 pb-16 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/75 backdrop-blur">
              Class assessments, competitions, and AI guidance
            </p>
            <h1 className="text-5xl font-bold leading-[1.02] sm:text-6xl lg:text-7xl">
              Far Away
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/78 sm:text-xl">
              A deployment-ready learning arena where students practice, compete, earn coins, and receive live mastery feedback.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onRegister}
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
            <div key={label} className="rounded-lg border border-borderColor bg-bgSecondary p-4">
              <p className="text-2xl font-bold text-textPrimary">{value}</p>
              <p className="mt-1 text-xs font-medium text-textMuted">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-12">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-accentIndigo">Built for repeated practice</p>
            <h2 className="mt-2 text-3xl font-bold text-textPrimary">Everything opens into the real app.</h2>
          </div>
          <button type="button" onClick={onSignIn} className="btn-secondary self-start sm:self-auto">
            Continue to Sign In
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {FEATURES.map(({ title, body, Icon }) => (
            <article key={title} className="card p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md border border-borderColor bg-bgSecondary text-accentIndigo">
                <Icon size={18} />
              </div>
              <h3 className="text-lg font-bold text-textPrimary">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-textMuted">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-borderColor bg-bgCard px-5 py-6 text-center text-xs text-textMuted">
        Far Away Learning Platform. Student and faculty portal.
      </footer>
    </div>
  );
}
