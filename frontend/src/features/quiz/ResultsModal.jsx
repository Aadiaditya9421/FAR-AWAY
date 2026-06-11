// src/features/quiz/ResultsModal.jsx
import React from 'react';
import Button from '../../components/ui/Button';
import { IconCoin, IconZap, IconCheck, IconTrophy } from '../../components/ui/Icons';

function ScoreRing({ percentage }) {
  const color = percentage >= 80 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444';
  const label = percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good Job!' : 'Keep Practicing';

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-28 h-28 rounded-full flex items-center justify-center border-4 relative"
        style={{ borderColor: color }}
      >
        {/* Glow */}
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-md"
          style={{ background: color }}
        />
        <div className="relative text-center">
          <div className="font-display font-bold text-3xl text-textPrimary leading-none">
            {percentage}%
          </div>
          <div className="text-[10px] text-textMuted mt-0.5">Score</div>
        </div>
      </div>
      <span
        className="font-display font-semibold text-sm"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
}

export default function ResultsModal({ result, onClose }) {
  if (!result) return null;
  const { percentage, correct, total, coinsEarned, xpEarned } = result;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-overlay-in"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
    >
      <div className="bg-bgCard border border-borderColor rounded-xl p-8 w-full max-w-md
                      shadow-glass animate-modal-in">
        {/* Header */}
        <div className="text-center mb-6">
          <IconTrophy size={32} className="text-accentAmber mx-auto mb-3" />
          <h2 className="font-display font-bold text-xl text-textPrimary tracking-tight mb-1">
            Assessment Complete!
          </h2>
          <p className="text-sm text-textMuted">Here's how you did</p>
        </div>

        {/* Score Ring */}
        <div className="flex justify-center mb-6">
          <ScoreRing percentage={percentage} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Correct', value: `${correct} / ${total}`, icon: <IconCheck size={14} />, color: 'text-accentEmerald' },
            { label: 'Coins', value: `+${coinsEarned}`, icon: <IconCoin size={14} />, color: 'text-accentAmber' },
            { label: 'XP Earned', value: `+${xpEarned}`, icon: <IconZap size={14} />, color: 'text-accentIndigo' },
          ].map(s => (
            <div key={s.label} className="text-center p-3 rounded-lg bg-bgSecondary border border-borderColor flex flex-col items-center justify-between min-h-[84px]">
              <div className="flex items-center gap-1">
                <span className={s.color}>{s.icon}</span>
                <span className="text-[10px] text-textMuted font-semibold">{s.label}</span>
              </div>
              <p className={`font-display font-bold text-base leading-tight mt-2 ${s.color}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Bonus message */}
        {percentage >= 80 && (
          <div className="mb-4 p-3 rounded-lg bg-accentEmerald/8 border border-accentEmerald/20 text-center">
            <p className="text-xs text-accentEmerald font-display font-semibold flex items-center justify-center gap-1.5">
              <IconCheck size={13} />
              Full reward unlocked! Maximum coins earned.
            </p>
          </div>
        )}

        {/* Action */}
        <Button variant="primary" fullWidth onClick={onClose}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
