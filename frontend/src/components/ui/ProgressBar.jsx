// src/components/ui/ProgressBar.jsx
import React from 'react';

/**
 * ProgressBar — thin track with gradient fill
 * value: 0–100
 */
export default function ProgressBar({ value = 0, height = 'h-1.5', className = '', label = false }) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-textMuted font-medium">Progress</span>
          <span className="text-[10px] text-textSecondary font-semibold">{clamped}%</span>
        </div>
      )}
      <div className={`progress-track ${height}`}>
        <div
          className="progress-fill"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
