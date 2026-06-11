// src/components/ui/Toast.jsx
import React, { useEffect, useState } from 'react';

const ICONS = {
  success: '✅',
  error:   '❌',
  warning: '⚠️',
  info:    'ℹ️',
};

const ACCENT = {
  success: 'border-accentEmerald/30 bg-accentEmerald/5',
  error:   'border-accentCrimson/30 bg-accentCrimson/5',
  warning: 'border-accentAmber/30   bg-accentAmber/5',
  info:    'border-accentIndigo/30  bg-accentIndigo/5',
};

function ToastItem({ id, msg, type = 'success', onRemove }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!visible) {
      const t = setTimeout(() => onRemove(id), 300);
      return () => clearTimeout(t);
    }
  }, [visible, id, onRemove]);

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-lg border glass-strong
        shadow-card max-w-sm w-full
        ${ACCENT[type] || ACCENT.info}
        transition-all duration-300
        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
      `}
    >
      <span className="text-base mt-0.5 flex-shrink-0">{ICONS[type] || ICONS.info}</span>
      <p className="text-sm text-textPrimary font-medium leading-snug">{msg}</p>
    </div>
  );
}

export default function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto animate-slideInRight">
          <ToastItem {...t} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
}
