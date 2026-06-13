import { IconTrophy } from '../../components/ui/Icons';

export default function SkillsChart({ progress = [] }) {
  const topics = ['JavaScript', 'React', 'Python', 'DSA', 'OOPs', 'WebDev', 'Backend'];

  // Map backend mastery values, default to 25% for unstarted topics (P(L0) = 0.25)
  const topicMasteryList = topics.map(t => {
    const record = progress.find(p => p.topic.toLowerCase() === t.toLowerCase());
    const masteryVal = record && record.mastery !== undefined ? record.mastery : 0.25;
    return {
      topic: t,
      value: Math.round(masteryVal * 100),
      active: !!record && record.attemptCount > 0,
    };
  });

  const activeCount = topicMasteryList.filter(t => t.active).length;
  const avgMastery = Math.round(topicMasteryList.reduce((sum, t) => sum + t.value, 0) / topics.length);
  const bestTopic = topicMasteryList.reduce((best, t) => t.value > best.value ? t : best, topicMasteryList[0]);

  return (
    <div className="card p-5">
      <div className="flex justify-between items-start mb-1">
        <div>
          <div className="flex items-center gap-2">
            <IconTrophy size={15} className="text-accentIndigo" />
            <h4 className="font-display font-semibold text-sm text-textPrimary">
              Adaptive Mastery Profile
            </h4>
          </div>
          <p className="text-[10px] text-textMuted mt-0.5">
            Bayesian Knowledge Tracing (BKT) probability scores per subject area
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accentIndigo" />
          <span className="text-[10px] text-textMuted">Mastery (%)</span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="mt-4 flex items-end justify-between gap-1 px-2 h-36 border-b border-borderColor pb-2">
        {topicMasteryList.map((bar, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
            <div className="relative w-full flex justify-center">
              {bar.active && (
                <div
                  className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px]
                              font-display font-bold text-accentIndigo whitespace-nowrap"
                >
                  {bar.value}%
                </div>
              )}
              <div
                style={{ height: `${(bar.value / 100) * 120}px` }}
                className={`
                  w-5 rounded-t-sm transition-all duration-500
                  ${bar.active
                    ? 'bg-accentIndigo shadow-glow-indigo'
                    : 'bg-accentIndigo/30 hover:bg-accentIndigo/50'}
                `}
              />
            </div>
            <span className="text-[9px] text-textMuted whitespace-nowrap truncate max-w-[42px]" title={bar.topic}>
              {bar.topic}
            </span>
          </div>
        ))}
      </div>

      {/* Summary row */}
      <div className="flex justify-between mt-3 pt-1">
        {[
          { label: 'Avg Mastery', value: `${avgMastery}%`, color: 'text-accentIndigo' },
          { label: 'Started',     value: `${activeCount} / ${topics.length}`, color: 'text-textSecondary' },
          { label: 'Top Skill',   value: bestTopic.topic, color: 'text-accentEmerald' },
        ].map(s => (
          <div key={s.label} className="text-center">
            <p className={`font-display font-bold text-sm ${s.color}`}>{s.value}</p>
            <p className="text-[9px] text-textMuted mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
