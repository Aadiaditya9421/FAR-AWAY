// src/features/dashboard/SpotlightCard.jsx
import React from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { IconZap, IconCoin, IconCheck } from '../../components/ui/Icons';

export default function SpotlightCard({ competition, onRegister }) {
  const registered = competition?.registered;

  return (
    <div className="card p-5 border-accentAmber/20 bg-gradient-to-b from-bgCard to-bgCard relative overflow-hidden">
      {/* Glow decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-accentAmber/5 blur-3xl pointer-events-none" />

      <div className="flex justify-between items-start mb-3 relative">
        <Badge variant="live" dot>LIVE NOW</Badge>
        <span className="text-[9px] font-display font-bold text-accentAmber bg-accentAmber/10
                         border border-accentAmber/20 px-2 py-0.5 rounded uppercase tracking-wider">
          Spotlight
        </span>
      </div>

      <div className="flex items-center gap-2 mb-2 relative">
        <IconZap size={14} className="text-accentAmber" />
        <h4 className="font-display font-semibold text-sm text-textPrimary">
          Arena Challenge
        </h4>
      </div>
      <h5 className="font-display font-bold text-xs text-textPrimary mb-2 relative leading-snug">
        {competition?.title}
      </h5>
      <p className="text-[11px] text-textSecondary mb-4 leading-relaxed relative">
        {competition?.desc}
      </p>

      {/* Fee / Prize */}
      <div className="flex justify-between border-t border-borderColor pt-3 mb-4 text-[10px] text-textMuted">
        <span className="flex items-center gap-1">
          Entry Fee:
          <strong className="text-textSecondary font-display flex items-center gap-0.5">
            <IconCoin size={11} />
            {competition?.fee}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          Prize Pool:
          <strong className="text-accentAmber font-display flex items-center gap-0.5">
            <IconCoin size={11} />
            {competition?.pool}
          </strong>
        </span>
      </div>

      {/* Participants */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex -space-x-1.5">
          {['AW','MC','SL'].map(a => (
            <div key={a} className="w-5 h-5 rounded-full bg-accentIndigo/20 border border-bgCard
                                    flex items-center justify-center text-[8px] font-bold text-accentIndigo">
              {a[0]}
            </div>
          ))}
        </div>
        <span className="text-[10px] text-textMuted">{competition?.participants} participants joined</span>
      </div>

      <Button
        variant={registered ? 'ghost' : 'primary'}
        fullWidth
        onClick={() => onRegister(competition.id)}
        disabled={registered}
      >
        {registered ? (
          <span className="flex items-center justify-center gap-1.5">
            <IconCheck size={14} className="text-accentEmerald" />
            Arena Registered
          </span>
        ) : 'Register Arena Entry'}
      </Button>
    </div>
  );
}
