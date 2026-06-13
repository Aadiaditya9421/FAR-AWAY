// src/features/assessments/AssessmentCard.jsx
import Badge from '../../components/ui/Badge';

const TOPIC_ICONS = {
  DSA: '🔗', WebDev: '🎨', Backend: '⚙️', React: '⚛️',
};

export default function AssessmentCard({ item, onClick }) {
  return (
    <div
      onClick={() => onClick(item)}
      className="card-interactive p-5 flex flex-col justify-between min-h-[210px]
                 hover:border-accentIndigo/50 hover:shadow-glow-indigo group cursor-pointer"
    >
      <div>
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <Badge variant={item.difficulty}>{item.difficulty}</Badge>
          <div className="flex items-center gap-1.5">
            <span className="text-base">{TOPIC_ICONS[item.topic] || '📘'}</span>
            <span className="text-[10px] text-textMuted font-semibold font-display uppercase tracking-wide">
              {item.topic}
            </span>
          </div>
        </div>

        {/* Title */}
        <h4 className="font-display font-semibold text-sm text-textPrimary mb-2
                       group-hover:text-accentIndigo transition-colors leading-snug">
          {item.title}
        </h4>

        {/* Description */}
        <p className="text-[11px] text-textMuted leading-relaxed">
          {item.desc}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-borderColor pt-3 mt-4">
        <div className="flex gap-3 text-[10px] text-textMuted font-medium">
          <span>⏱️ {item.duration} min</span>
          <span>❓ {item.questions.length} questions</span>
        </div>
        <span className="text-[10px] font-bold text-accentAmber font-display">
          🪙 +{item.coinsReward}
        </span>
      </div>
    </div>
  );
}
