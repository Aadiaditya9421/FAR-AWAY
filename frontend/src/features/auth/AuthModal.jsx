// src/features/auth/AuthModal.jsx
// ─── Far Away — "Sign in to continue" gating modal ───
// Shown when a guest tries to use a functional action.

import React from 'react';

export default function AuthModal({ isOpen, onClose, onSignIn, onRegister }) {
  if (!isOpen) return null;

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center animate-overlay-in"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      {/* Modal card — stop propagation so clicking inside doesn't close */}
      <div
        className="relative w-full max-w-sm mx-4 glass-strong rounded-xl p-8 animate-modal-in"
        style={{ border: '1px solid rgba(255,255,255,0.09)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-textMuted hover:text-textPrimary transition-colors text-xl leading-none"
          aria-label="Close"
        >
          ×
        </button>

        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 mx-auto"
          style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        {/* Text */}
        <div className="text-center mb-6">
          <h2 className="heading-display text-xl text-textPrimary mb-2">
            Sign in to continue
          </h2>
          <p className="text-textMuted text-sm leading-relaxed">
            You need an account to use this feature. It's free and takes less than a minute.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button onClick={onSignIn} className="btn-primary w-full justify-center">
            Sign In
          </button>
          <button onClick={onRegister} className="btn-secondary w-full justify-center">
            Create Free Account
          </button>
          <button
            onClick={onClose}
            className="text-textMuted text-xs text-center hover:text-textSecondary transition-colors mt-1"
          >
            Continue browsing as guest
          </button>
        </div>
      </div>
    </div>
  );
}
