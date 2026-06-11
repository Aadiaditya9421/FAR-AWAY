// src/features/auth/AuthPage.jsx
// ─── Far Away — Login / Register (Cal.com + Mistral light design) ───

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogoMark, IconEye, IconEyeOff, IconLogIn, Spinner } from '../../components/ui/Icons';

function InputField({ label, type = 'text', value, onChange, placeholder, autoComplete, error }) {
  const [showPass, setShowPass] = useState(false);
  const isPass = type === 'password';

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-semibold text-textSecondary">{label}</label>
      <div className="relative">
        <input
          className={`input ${error ? 'border-accentCrimson focus:border-accentCrimson' : ''}`}
          style={error ? { boxShadow: '0 0 0 3px rgba(239,68,68,0.10)' } : {}}
          type={isPass && showPass ? 'text' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        {isPass && (
          <button
            type="button"
            onClick={() => setShowPass(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textSecondary transition-colors"
          >
            {showPass ? <IconEyeOff size={15} /> : <IconEye size={15} />}
          </button>
        )}
      </div>
      {error && <p className="text-[11px] text-accentCrimson font-medium">{error}</p>}
    </div>
  );
}

function LoginForm({ onSwitch, onGuestBrowse }) {
  const { login } = useAuth();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = key => e => { setForm(p => ({ ...p, [key]: e.target.value })); setErrors(p => ({ ...p, [key]: '' })); };

  const handleSubmit = e => {
    e.preventDefault();
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    if (!form.password) errs.password = 'Password is required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    const res = login(form);
    if (!res.ok) { setErrors({ password: res.error }); setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <InputField label="Email address" type="email" value={form.email} onChange={set('email')} placeholder="you@university.edu" autoComplete="email" error={errors.email} />
      <InputField label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Your password" autoComplete="current-password" error={errors.password} />

      <button type="submit" disabled={loading} className="btn-primary w-full justify-center gap-2 mt-1" style={{ height: '44px' }}>
        {loading ? <Spinner size={15} /> : <IconLogIn size={15} />}
        {loading ? 'Signing in…' : 'Sign In'}
      </button>

      <div className="divider" />

      <div className="flex flex-col gap-2 text-center">
        <p className="text-[13px] text-textMuted">
          Don't have an account?{' '}
          <button type="button" onClick={onSwitch} className="text-accentIndigo font-semibold hover:underline">
            Create one
          </button>
        </p>
        <button type="button" onClick={onGuestBrowse} className="text-[12px] text-textMuted hover:text-textSecondary transition-colors">
          Continue browsing as guest
        </button>
      </div>
    </form>
  );
}

function RegisterForm({ onSwitch, onGuestBrowse }) {
  const { register } = useAuth();
  const [form, setForm]   = useState({ name: '', email: '', password: '' });
  const [role, setRole]   = useState('student');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = key => e => { setForm(p => ({ ...p, [key]: e.target.value })); setErrors(p => ({ ...p, [key]: '' })); };

  const handleSubmit = e => {
    e.preventDefault();
    const errs = {};
    if (!form.name)     errs.name     = 'Full name is required';
    if (!form.email)    errs.email    = 'Email is required';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    const res = register({ ...form, role });
    if (!res.ok) { setErrors({ email: res.error }); setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <InputField label="Full Name" value={form.name} onChange={set('name')} placeholder="Alex Johnson" autoComplete="name" error={errors.name} />
      <InputField label="Email address" type="email" value={form.email} onChange={set('email')} placeholder="you@university.edu" autoComplete="email" error={errors.email} />
      <InputField label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Minimum 6 characters" autoComplete="new-password" error={errors.password} />

      {/* Role Switcher */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-semibold text-textSecondary">I am registering as a</label>
        <div className="pill-group" style={{ height: '38px', padding: '3px' }}>
          <button
            type="button"
            onClick={() => setRole('student')}
            className={role === 'student' ? 'pill-tab-active flex-1 text-center py-1 text-xs' : 'pill-tab-idle flex-1 text-center py-1 text-xs'}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setRole('teacher')}
            className={role === 'teacher' ? 'pill-tab-active flex-1 text-center py-1 text-xs' : 'pill-tab-idle flex-1 text-center py-1 text-xs'}
          >
            Teacher
          </button>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full justify-center gap-2 mt-1" style={{ height: '44px' }}>
        {loading ? <Spinner size={15} /> : null}
        {loading ? 'Creating account…' : 'Create Account'}
      </button>

      <div className="divider" />

      <div className="flex flex-col gap-2 text-center">
        <p className="text-[13px] text-textMuted">
          Already have an account?{' '}
          <button type="button" onClick={onSwitch} className="text-accentIndigo font-semibold hover:underline">
            Sign in
          </button>
        </p>
        <button type="button" onClick={onGuestBrowse} className="text-[12px] text-textMuted hover:text-textSecondary transition-colors">
          Continue browsing as guest
        </button>
      </div>
    </form>
  );
}

export default function AuthPage({ onGuestBrowse }) {
  const [tab, setTab] = useState('login');

  return (
    <div className="min-h-screen bg-bgPrimary flex items-center justify-center relative">
      {/* Mistral sunset stripe at top */}
      <div className="fixed top-0 left-0 right-0 sunset-stripe z-50" />

      {/* Decorative cream band left */}
      <div
        className="fixed left-0 top-0 bottom-0 w-[42%] hidden lg:block"
        style={{ background: 'linear-gradient(160deg, #fff8e0 0%, #fffaeb 60%, #f5f5f5 100%)' }}
      >
        {/* Left panel content */}
        <div className="flex flex-col justify-between h-full p-12">
          <div className="flex items-center gap-3">
            <LogoMark size={36} />
            <div>
              <p className="font-sans font-bold text-[16px] text-textPrimary leading-none">Far Away</p>
              <p className="text-[11px] text-textMuted font-medium tracking-wide uppercase mt-0.5">Learning Platform</p>
            </div>
          </div>

          <div className="max-w-sm">
            <h1 className="font-sans font-bold text-[36px] text-textPrimary leading-[1.12] tracking-tight mb-4">
              Learn, compete,<br />grow further.
            </h1>
            <p className="text-[15px] text-textMuted leading-relaxed mb-8">
              Access class assessments, compete in live arenas, and trade skills with peers — all in one platform.
            </p>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Time-gated class assessments', sub: 'Only available during your lab window' },
                { label: 'Live skill competitions', sub: 'Win coins, climb the leaderboard' },
                { label: 'Peer skill exchange', sub: 'Teach what you know, learn what you need' },
              ].map(f => (
                <div key={f.label} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accentIndigo/10 border border-accentIndigo/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-accentIndigo" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-textPrimary">{f.label}</p>
                    <p className="text-[12px] text-textMuted">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-textMuted">
            Far Away Learning Platform · Student Portal
          </p>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:ml-[42%]">
        <div className="w-full max-w-[400px] animate-fadeIn">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <LogoMark size={32} />
            <p className="font-sans font-bold text-[16px] text-textPrimary">Far Away</p>
          </div>

          <div className="mb-6">
            <h2 className="font-sans font-bold text-[24px] text-textPrimary tracking-tight mb-1">
              {tab === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-[13px] text-textMuted">
              {tab === 'login'
                ? 'Sign in to access your assessments and dashboard'
                : 'Join thousands of students on Far Away'}
            </p>
          </div>

          {/* Tab switcher (Cal.com nav-pill-group style) */}
          <div className="pill-group mb-6">
            <button type="button" onClick={() => setTab('login')}
              className={tab === 'login' ? 'pill-tab-active flex-1 text-center' : 'pill-tab-idle flex-1 text-center'}>
              Sign In
            </button>
            <button type="button" onClick={() => setTab('register')}
              className={tab === 'register' ? 'pill-tab-active flex-1 text-center' : 'pill-tab-idle flex-1 text-center'}>
              Register
            </button>
          </div>

          {/* Form card */}
          <div className="bg-bgCard border border-borderColor rounded-xl p-7" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            {tab === 'login'
              ? <LoginForm onSwitch={() => setTab('register')} onGuestBrowse={onGuestBrowse} />
              : <RegisterForm onSwitch={() => setTab('login')} onGuestBrowse={onGuestBrowse} />
            }
          </div>

          <p className="text-center text-[11px] text-textMuted mt-5">
            By continuing you agree to our{' '}
            <span className="text-textSecondary cursor-pointer hover:text-accentIndigo transition-colors">Terms</span>
            {' '}and{' '}
            <span className="text-textSecondary cursor-pointer hover:text-accentIndigo transition-colors">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
