// src/features/dashboard/MentorshipPanel.jsx
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { IconArrowsSwap, IconUser } from '../../components/ui/Icons';

export default function MentorshipPanel({ matches, recommended = [], onGoToSkillSwap }) {
  const activeMatches = matches.filter(m => m.matched);
  const topRecommendation = recommended[0];

  return (
    <div className="card p-5">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <IconArrowsSwap size={15} className="text-accentIndigo" />
          <h4 className="font-display font-semibold text-sm text-textPrimary">
            Active Mentorships
          </h4>
        </div>
        {activeMatches.length > 0 && (
          <span className="text-[10px] font-bold text-accentEmerald bg-accentEmerald/10
                           border border-accentEmerald/20 px-2 py-0.5 rounded-full">
            {activeMatches.length} Active
          </span>
        )}
      </div>

      {activeMatches.length === 0 ? (
        <div className="text-center py-6 px-2 flex flex-col items-center">
          <IconUser size={28} className="text-textMuted mb-2 opacity-40" />
          {topRecommendation ? (
            <>
              <p className="text-[11px] text-textMuted leading-relaxed mb-2">
                Recommended mentor for {topRecommendation.targetTopic}:
              </p>
              <div className="w-full p-3 rounded-lg bg-accentAmber/5 border border-accentAmber/15 mb-3 text-left">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-display font-semibold text-textPrimary">{topRecommendation.name}</p>
                  <span className="text-[9px] font-bold text-accentAmber">{topRecommendation.score}% match</span>
                </div>
                <p className="text-[10px] text-textMuted mt-1">
                  Teaches {topRecommendation.give} · wants {topRecommendation.take}
                </p>
              </div>
            </>
          ) : (
            <p className="text-[11px] text-textMuted leading-relaxed mb-3">
              No active connections yet. Find peers in SkillSwap to start learning together.
            </p>
          )}
          <Button variant="ghost" size="sm" onClick={onGoToSkillSwap}>
            Browse SkillSwap
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {activeMatches.map(m => (
            <div
              key={m.id}
              className="flex items-center justify-between p-2.5 rounded-lg
                         bg-bgSecondary/40 border border-borderColor hover:border-borderHover transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Avatar initials={m.avatar} size="sm" />
                <div>
                  <p className="text-xs font-semibold text-textPrimary font-display">{m.name}</p>
                  <p className="text-[9px] text-textMuted">{m.give} to {m.take}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="live-dot" />
                <span className="text-[10px] font-bold text-accentEmerald">Live</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
