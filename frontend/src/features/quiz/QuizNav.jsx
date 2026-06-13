// src/features/quiz/QuizNav.jsx

export default function QuizNav({ questions, currentIndex, answers, flagged, onJump }) {
  return (
    <div className="card p-5">
      <h4 className="font-display font-semibold text-sm text-textPrimary mb-1">
        Question Navigator
      </h4>
      <p className="text-[10px] text-textMuted mb-4 leading-relaxed">
        Jump to any question. Green = answered, Orange = flagged.
      </p>

      <div className="grid grid-cols-6 sm:grid-cols-4 gap-2 mb-5">
        {questions.map((q, idx) => {
          const isAnswered = !!answers[q.id];
          const isFlagged  = !!flagged[q.id];
          const isCurrent  = idx === currentIndex;

          return (
            <button
              key={q.id}
              onClick={() => onJump(idx)}
              className={`
                w-full aspect-square rounded-md flex items-center justify-center
                text-xs font-display font-bold transition-all duration-150
                ${isCurrent
                  ? 'bg-accentIndigo text-white ring-2 ring-accentIndigo/40'
                  : isFlagged
                    ? 'bg-accentAmber/15 text-accentAmber border border-accentAmber/30'
                    : isAnswered
                      ? 'bg-accentEmerald/12 text-accentEmerald border border-accentEmerald/20'
                      : 'bg-bgSecondary border border-borderColor text-textMuted hover:border-borderHover'}
              `}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="space-y-2 border-t border-borderColor pt-4">
        {[
          { color: 'bg-accentIndigo',   label: 'Current question' },
          { color: 'bg-accentEmerald/30', label: 'Answered' },
          { color: 'bg-accentAmber/30',   label: 'Flagged for review' },
          { color: 'bg-bgSecondary',      label: 'Not answered yet' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2.5">
            <div className={`w-3 h-3 rounded-sm ${l.color} border border-borderColor flex-shrink-0`} />
            <span className="text-[10px] text-textMuted">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
