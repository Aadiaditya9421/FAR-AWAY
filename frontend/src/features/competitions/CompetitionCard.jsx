// src/features/competitions/CompetitionCard.jsx
import React from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { IconCoin, IconCheck, IconClock, IconZap } from '../../components/ui/Icons';

const STATUS_CONFIG = {
  live:      { bg: 'border-accentEmerald/20 bg-accentEmerald/3',  color: 'text-accentEmerald' },
  upcoming:  { bg: 'border-accentCyan/25 bg-accentCyan/3',        color: 'text-accentCyan' },
  completed: { bg: 'border-borderColor bg-transparent',          color: 'text-textMuted' },
};

export default function CompetitionCard({ comp, onRegister, userCoins }) {
  const cfg = STATUS_CONFIG[comp.status] || STATUS_CONFIG.completed;
  const canAfford = userCoins >= comp.fee;

  return (
    <div className={`card p-5 flex flex-col justify-between border ${cfg.bg} relative overflow-hidden`}>
      {/* Live decoration */}
      {comp.status === 'live' && (
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-accentEmerald/5 blur-2xl pointer-events-none" />
      )}

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant={comp.status}>{comp.status}</Badge>
            <Badge variant={comp.difficulty}>{comp.difficulty}</Badge>
          </div>
          <span className={cfg.color}>
            {comp.status === 'live' && <IconZap size={16} />}
            {comp.status === 'upcoming' && <IconClock size={16} />}
            {comp.status === 'completed' && <IconCheck size={16} />}
          </span>
        </div>

        {/* Title */}
        <h4 className="font-display font-semibold text-sm text-textPrimary mb-2 leading-snug">
          {comp.title}
        </h4>

        {/* Description */}
        <p className="text-[11px] text-textMuted leading-relaxed mb-4">
          {comp.desc}
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { label: 'Time',         value: comp.time,         color: comp.status === 'live' ? 'text-accentEmerald' : 'text-textSecondary' },
            { label: 'Participants', value: comp.participants,  color: 'text-textSecondary' },
            { label: 'Entry Fee',    value: comp.fee,          icon: <IconCoin size={11} />, color: 'text-accentAmber' },
            { label: 'Prize Pool',   value: comp.pool,         icon: <IconCoin size={11} />, color: 'text-accentAmber font-bold' },
          ].map(s => (
            <div key={s.label} className="p-2.5 rounded-md bg-bgSecondary/50 border border-borderColor flex flex-col justify-between">
              <div className="flex items-center gap-1">
                {s.icon && <span className={s.color}>{s.icon}</span>}
                <p className={`font-display font-semibold text-xs ${s.color}`}>{s.value}</p>
              </div>
              <p className="text-[9px] text-textMuted mt-1 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action */}
      {comp.status === 'live' && (
        comp.registered ? (
          <Button variant="success" fullWidth disabled icon={<IconCheck size={13} />}>
            Registered — Good Luck!
          </Button>
        ) : (
          <Button
            variant={canAfford ? 'primary' : 'ghost'}
            fullWidth
            onClick={() => onRegister(comp.id)}
            disabled={!canAfford}
          >
            {canAfford ? `Enter Arena — Pay ${comp.fee} coins` : `Need ${comp.fee - userCoins} more coins`}
          </Button>
        )
      )}

      {comp.status === 'upcoming' && (
        <Button variant="secondary" fullWidth>
          🔔 Get Notified
        </Button>
      )}

      {comp.status === 'completed' && (
        <Button variant="ghost" fullWidth disabled>
          View Results
        </Button>
      )}
    </div>
  );
}
