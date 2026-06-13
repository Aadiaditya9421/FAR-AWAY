// src/features/dashboard/AIInsightsCard.jsx

function InsightIcon({ active = false }) {
  return (
    <div className={`p-2 rounded-lg ${active ? 'bg-accentIndigo/10 text-accentIndigo' : 'bg-bgSecondary border border-borderColor text-accentIndigo'}`}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </div>
  );
}

function EmptyInsights({ loading, error, isLiveData }) {
  const message = loading
    ? 'Loading live mastery signals...'
    : error
      ? 'AI Tutor could not load live analytics right now.'
      : isLiveData
        ? 'Complete your first assessment to calibrate your live mastery profile.'
        : 'Sign in to build a live mastery profile from real assessment attempts.';

  return (
    <div className="bg-bgCard border border-borderColor rounded-xl p-5 shadow-glass relative overflow-hidden flex flex-col justify-center min-h-[160px]">
      <div className="flex items-start gap-3.5">
        <InsightIcon />
        <div>
          <h4 className="font-display font-bold text-base text-textPrimary leading-tight">
            AI Tutor Insights
          </h4>
          <p className="text-sm text-textMuted mt-1.5 leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AIInsightsCard({ insights, loading = false, error = '', isLiveData = false }) {
  if (!insights) {
    return <EmptyInsights loading={loading} error={error} isLiveData={isLiveData} />;
  }

  const {
    weakAreas = [],
    reason = '',
    nextTopics = [],
    personalizedRecommendation = '',
    strengths = [],
    masterySummary = '',
    provider = 'fallback',
  } = insights;
  const hasSignals = strengths.length > 0 || weakAreas.length > 0;
  const providerLabel = provider === 'gemini' ? 'Gemini' : 'AI Tutor';

  return (
    <div className="bg-bgCard border border-borderColor rounded-xl p-5 shadow-glass relative overflow-hidden flex flex-col gap-4">
      <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-accentIndigo via-accentViolet to-accentAmber" />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <InsightIcon active />
          <h4 className="font-display font-bold text-base text-textPrimary tracking-tight">
            AI Tutor Insights
          </h4>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-accentIndigo/10 text-accentIndigo border border-accentIndigo/20">
          {providerLabel}
        </span>
      </div>

      <div className="p-3.5 rounded-lg bg-bgSecondary border border-borderColor/60">
        <p className="text-xs text-textMuted uppercase font-semibold tracking-wider">Overall Posture</p>
        <p className="text-sm text-textPrimary mt-1 leading-relaxed">
          {masterySummary || 'Your progress dashboard is currently being calibrated.'}
        </p>
      </div>

      {hasSignals ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strengths.length > 0 && (
            <div className="space-y-1.5">
              <h5 className="text-xs font-semibold text-accentEmerald tracking-tight flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accentEmerald" />
                Key Strengths
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {strengths.map((item) => (
                  <span
                    key={item}
                    className="text-xs px-2.5 py-1 rounded-md bg-accentEmerald/8 text-accentEmerald border border-accentEmerald/15 font-semibold"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {weakAreas.length > 0 && (
            <div className="space-y-1.5">
              <h5 className="text-xs font-semibold text-accentRose tracking-tight flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accentRose" />
                Focus Areas
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {weakAreas.map((item) => (
                  <span
                    key={item}
                    className="text-xs px-2.5 py-1 rounded-md bg-accentRose/8 text-accentRose border border-accentRose/15 font-semibold"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-bgSecondary/60 border border-borderColor text-xs text-textMuted leading-relaxed">
          No strengths or focus areas are labeled yet. Take one live assessment so the tutor can use real mastery signals.
        </div>
      )}

      {reason && (
        <div className="text-xs text-textMuted leading-relaxed">
          <strong className="text-textPrimary">Concept Analysis:</strong> {reason}
        </div>
      )}

      {nextTopics.length > 0 && (
        <div className="pt-2 border-t border-borderColor/60 space-y-2.5">
          <div className="space-y-1.5">
            <span className="text-xs text-textMuted uppercase font-semibold tracking-wider">Recommended Subtopics</span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {nextTopics.map((topic) => (
                <li key={topic} className="flex items-center gap-2 text-xs text-textPrimary">
                  <div className="w-1.5 h-1.5 rounded-full bg-accentIndigo" />
                  {topic}
                </li>
              ))}
            </ul>
          </div>

          {personalizedRecommendation && (
            <div className="p-3 rounded-lg bg-accentIndigo/5 border border-accentIndigo/10 text-xs text-textPrimary leading-relaxed">
              <span className="font-semibold text-accentIndigo">Next Step: </span>
              {personalizedRecommendation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
