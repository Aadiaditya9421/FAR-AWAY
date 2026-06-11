import React from 'react';
import { IconTrophy } from '../../components/ui/Icons';

const BARS = [
  { day: 'Mon',   h: 40  },
  { day: 'Tue',   h: 65  },
  { day: 'Wed',   h: 50  },
  { day: 'Thu',   h: 95  },
  { day: 'Fri',   h: 120 },
  { day: 'Sat',   h: 80  },
  { day: 'Today', h: 145, active: true },
];

const MAX_H = 145;

export default function SkillsChart() {
  return (
    <div className="card p-5">
      <div className="flex justify-between items-start mb-1">
        <div>
          <div className="flex items-center gap-2">
            <IconTrophy size={15} className="text-accentIndigo" />
            <h4 className="font-display font-semibold text-sm text-textPrimary">
              Skills Growth Velocity
            </h4>
          </div>
          <p className="text-[10px] text-textMuted mt-0.5">
            Weekly progress from daily assessment accuracy
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accentIndigo" />
          <span className="text-[10px] text-textMuted">XP Points</span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="mt-4 flex items-end justify-between gap-1 px-2 h-36 border-b border-borderColor pb-2">
        {BARS.map((bar, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
            <div className="relative w-full flex justify-center">
              {bar.active && (
                <div
                  className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px]
                              font-display font-bold text-accentIndigo whitespace-nowrap"
                >
                  +{bar.h}
                </div>
              )}
              <div
                style={{ height: `${(bar.h / MAX_H) * 120}px` }}
                className={`
                  w-5 rounded-t-sm transition-all duration-500
                  ${bar.active
                    ? 'bg-accentIndigo shadow-glow-indigo'
                    : 'bg-accentIndigo/30 hover:bg-accentIndigo/50'}
                `}
              />
            </div>
            <span className="text-[9px] text-textMuted whitespace-nowrap">{bar.day}</span>
          </div>
        ))}
      </div>

      {/* Summary row */}
      <div className="flex justify-between mt-3 pt-1">
        {[
          { label: 'This Week', value: '595 XP', color: 'text-accentIndigo' },
          { label: 'Avg Daily',  value: '85 XP',  color: 'text-textSecondary' },
          { label: 'Best Day',   value: '145 XP', color: 'text-accentEmerald' },
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
