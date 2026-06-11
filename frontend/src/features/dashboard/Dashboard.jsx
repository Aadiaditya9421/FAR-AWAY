// src/features/dashboard/Dashboard.jsx
import React from 'react';
import StatsRow from './StatsRow';
import LearningPath from './LearningPath';
import SkillsChart from './SkillsChart';
import SpotlightCard from './SpotlightCard';
import MentorshipPanel from './MentorshipPanel';

export default function Dashboard({
  user,
  assessments,
  skillSwap,
  competitions,
  onStartQuiz,
  onGoToAssessments,
  onGoToSkillSwap,
  onRegisterComp,
  onCoinClick,
}) {
  const liveComp = competitions.find(c => c.id === 'comp-1');

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

      {/* Stats Row */}
      <StatsRow user={user} onCoinClick={onCoinClick} />

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-5">
        {/* Left (2/3) */}
        <div className="col-span-2 flex flex-col gap-5">
          <LearningPath
            assessments={assessments.slice(0, 3)}
            onStart={onStartQuiz}
            onViewAll={onGoToAssessments}
          />
          <SkillsChart />
        </div>

        {/* Right (1/3) */}
        <div className="flex flex-col gap-5">
          <SpotlightCard
            competition={liveComp}
            onRegister={onRegisterComp}
          />
          <MentorshipPanel
            matches={skillSwap.matches}
            onGoToSkillSwap={onGoToSkillSwap}
          />
        </div>
      </div>
    </div>
  );
}
