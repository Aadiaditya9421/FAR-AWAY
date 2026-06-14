// src/features/dashboard/Dashboard.jsx
import StatsRow from './StatsRow';
import SpotlightCard from './SpotlightCard';
import PeerLearningPanel from './PeerLearningPanel';
import AIInsightsCard from './AIInsightsCard';
import TargetedPracticeCard from './TargetedPracticeCard';

export default function Dashboard({
  user,
  skillSwap,
  competitions,
  insights,
  practiceSet,
  dataLoading = false,
  dataError = '',
  isLiveData = false,
  isPreview = false,
  onStartQuiz,
  onGoToAssessments,
  onGoToCoding,
  onGoToSkillSwap,
  onRegisterComp,
  onCoinClick,
}) {
  const liveComp = competitions.find(c => c.status === 'live' || c.status === 'active') || competitions[0];

  return (
    <div className="animate-fadeIn space-y-6">
      {/* Welcome */}
      <div>
        <h3 className="font-display font-bold text-2xl text-textPrimary tracking-tight">
          Welcome back, <span className="text-gradient-indigo">{user.name.split(' ')[0]}</span>!
        </h3>
        <p className="text-sm text-textMuted mt-1">
          You're on a {user.streak}-day streak. Keep going!
        </p>
      </div>

      {isLiveData && (dataLoading || dataError) && (
        <div
          className={`card p-3 text-xs font-semibold ${
            dataError ? 'text-accentAmber border-accentAmber/20' : 'text-accentIndigo border-accentIndigo/20'
          }`}
        >
          {dataError || 'Loading live workspace data...'}
        </div>
      )}

      {/* Stats Row */}
      <StatsRow user={user} onCoinClick={onCoinClick} isPreview={isPreview} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <AIInsightsCard insights={insights} loading={dataLoading} error={dataError} isLiveData={isLiveData} />
          <TargetedPracticeCard
            practiceSet={practiceSet}
            loading={dataLoading}
            error={dataError}
            isLiveData={isLiveData}
            onStartAssessment={onStartQuiz}
            onGoToAssessments={onGoToAssessments}
            onGoToCoding={onGoToCoding}
          />
        </div>

        {/* Right (1/3) */}
        <div className="flex flex-col gap-5">
          <SpotlightCard
            competition={liveComp}
            onRegister={onRegisterComp}
            isPreview={isPreview}
          />
          <PeerLearningPanel
            matches={skillSwap.matches}
            recommended={skillSwap.recommended}
            onGoToSkillSwap={onGoToSkillSwap}
          />
        </div>
      </div>
    </div>
  );
}
