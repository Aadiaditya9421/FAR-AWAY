// src/features/quiz/TimerPill.jsx
import React from 'react';

export default function TimerPill({ seconds }) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  const isUrgent = seconds <= 60;

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border
        font-mono font-bold text-sm select-none transition-all
        ${isUrgent
          ? 'border-accentCrimson text-accentCrimson bg-accentCrimson/8 animate-pulseBorder'
          : 'border-accentEmerald text-accentEmerald bg-accentEmerald/8'}
      `}
    >
      <span className={`text-base leading-none ${isUrgent ? 'animate-float' : ''}`}>
        {isUrgent ? '⚠️' : '⏱️'}
      </span>
      <span>
        {String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}
      </span>
    </div>
  );
}
