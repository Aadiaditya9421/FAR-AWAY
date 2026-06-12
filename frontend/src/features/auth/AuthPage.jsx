// src/features/auth/AuthPage.jsx
// ─── Far Away — Login / Register (Cal.com + Mistral light design) ───

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogoMark, IconEye, IconEyeOff, IconLogIn, Spinner } from '../../components/ui/Icons';
import { forgotPasswordRequest, resetPasswordRequest } from '../../services';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
let googleScriptPromise = null;

function loadGoogleIdentityScript() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-google-identity="true"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.google), { once: true });
        existing.addEventListener('error', () => reject(new Error('Unable to load Google sign-in.')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.dataset.googleIdentity = 'true';
      script.onload = () => resolve(window.google);
      script.onerror = () => reject(new Error('Unable to load Google sign-in.'));
      document.head.appendChild(script);
    });
  }

  return googleScriptPromise;
}

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

function GoogleAuthButton({ role = 'student' }) {
  const { googleAuth } = useAuth();
  const buttonRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !buttonRef.current) return undefined;

    let active = true;
    const buttonEl = buttonRef.current;
    buttonEl.innerHTML = '';

    loadGoogleIdentityScript()
      .then(() => {
        if (!active || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            if (!response.credential) {
              setError('Google did not return a credential.');
              return;
            }

            setLoading(true);
            setError('');
            const res = await googleAuth({ credential: response.credential, role });
            if (!res.ok) {
              setError(res.error);
              setLoading(false);
            }
          },
        });

        window.google.accounts.id.renderButton(buttonEl, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'continue_with',
          width: buttonEl.offsetWidth || 344,
        });
      })
      .catch(() => {
        if (active) setError('Google sign-in could not load.');
      });

    return () => {
      active = false;
      buttonEl.innerHTML = '';
    };
  }, [googleAuth, role]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <button type="button" disabled className="btn-secondary w-full justify-center opacity-70" style={{ height: '44px' }}>
        Google sign-in not configured
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div ref={buttonRef} className={loading ? 'pointer-events-none opacity-60' : ''} />
      {loading && (
        <p className="text-center text-[12px] text-textMuted">Continuing with Google...</p>
      )}
      {error && <p className="text-center text-[11px] text-accentCrimson font-medium">{error}</p>}
    </div>
  );
}

function LoginForm({ onSwitch, onGuestBrowse, onForgotPassword }) {
  const { login } = useAuth();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = key => e => { setForm(p => ({ ...p, [key]: e.target.value })); setErrors(p => ({ ...p, [key]: '' })); };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    if (!form.password) errs.password = 'Password is required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    const res = await login(form);
    if (!res.ok) { setErrors({ password: res.error }); setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <InputField label="Email address" type="email" value={form.email} onChange={set('email')} placeholder="you@university.edu" autoComplete="email" error={errors.email} />
      <InputField label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Your password" autoComplete="current-password" error={errors.password} />

      <div className="flex justify-end -mt-2">
        <button type="button" onClick={onForgotPassword} className="text-[12px] font-semibold text-accentIndigo hover:underline">
          Forgot password?
        </button>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full justify-center gap-2 mt-1" style={{ height: '44px' }}>
        {loading ? <Spinner size={15} /> : <IconLogIn size={15} />}
        {loading ? 'Signing in…' : 'Sign In'}
      </button>

      <GoogleAuthButton role="student" />

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
  const [form, setForm]   = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [role, setRole]   = useState('student');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = key => e => { setForm(p => ({ ...p, [key]: e.target.value })); setErrors(p => ({ ...p, [key]: '' })); };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = {};
    if (!form.firstName || form.firstName.trim().length < 2) errs.firstName = 'First name (min 2 characters)';
    if (!form.lastName || form.lastName.trim().length < 2)  errs.lastName  = 'Last name (min 2 characters)';
    if (!form.email)    errs.email    = 'Email is required';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Minimum 8 characters';
    else if (!/[A-Z]/.test(form.password)) errs.password = 'Include at least one uppercase letter';
    else if (!/[0-9]/.test(form.password)) errs.password = 'Include at least one number';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    const res = await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, role });
    if (!res.ok) { setErrors({ email: res.error }); setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><InputField label="First Name" value={form.firstName} onChange={set('firstName')} placeholder="Alex" autoComplete="given-name" error={errors.firstName} /></div>
        <div className="flex-1"><InputField label="Last Name" value={form.lastName} onChange={set('lastName')} placeholder="Johnson" autoComplete="family-name" error={errors.lastName} /></div>
      </div>
      <InputField label="Email address" type="email" value={form.email} onChange={set('email')} placeholder="you@university.edu" autoComplete="email" error={errors.email} />
      <InputField label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Min 8 chars, 1 uppercase, 1 number" autoComplete="new-password" error={errors.password} />

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

      <GoogleAuthButton role={role} />

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

function ForgotPasswordForm({ onBack }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    try {
      await forgotPasswordRequest({ email });
      setSent(true);
    } catch (err) {
      setError(err.message || 'Unable to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-[13px] text-textMuted leading-relaxed">
          If that email is registered, a reset link has been sent.
        </p>
        <button type="button" onClick={onBack} className="btn-secondary w-full justify-center" style={{ height: '44px' }}>
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <InputField
        label="Email address"
        type="email"
        value={email}
        onChange={e => { setEmail(e.target.value); setError(''); }}
        placeholder="you@university.edu"
        autoComplete="email"
        error={error}
      />
      <button type="submit" disabled={loading} className="btn-primary w-full justify-center gap-2" style={{ height: '44px' }}>
        {loading ? <Spinner size={15} /> : null}
        {loading ? 'Sending link...' : 'Send reset link'}
      </button>
      <button type="button" onClick={onBack} className="btn-secondary w-full justify-center" style={{ height: '44px' }}>
        Back to sign in
      </button>
    </form>
  );
}

function ResetPasswordForm({ token, onBack, onComplete }) {
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = key => e => {
    setForm(p => ({ ...p, [key]: e.target.value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!token) {
      setError('Reset token is missing.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(form.password)) {
      setError('Password must include one uppercase letter.');
      return;
    }
    if (!/[0-9]/.test(form.password)) {
      setError('Password must include one number.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordRequest({ token, password: form.password });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Unable to reset password. Please request a new link.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-[13px] text-textMuted leading-relaxed">
          Your password has been updated. You can sign in with the new password now.
        </p>
        <button type="button" onClick={onComplete} className="btn-primary w-full justify-center" style={{ height: '44px' }}>
          Sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <InputField
        label="New password"
        type="password"
        value={form.password}
        onChange={set('password')}
        placeholder="Min 8 chars, 1 uppercase, 1 number"
        autoComplete="new-password"
      />
      <InputField
        label="Confirm password"
        type="password"
        value={form.confirmPassword}
        onChange={set('confirmPassword')}
        placeholder="Repeat password"
        autoComplete="new-password"
        error={error}
      />
      <button type="submit" disabled={loading} className="btn-primary w-full justify-center gap-2" style={{ height: '44px' }}>
        {loading ? <Spinner size={15} /> : null}
        {loading ? 'Updating password...' : 'Update password'}
      </button>
      <button type="button" onClick={onBack} className="btn-secondary w-full justify-center" style={{ height: '44px' }}>
        Back to sign in
      </button>
    </form>
  );
}

export default function AuthPage({ onGuestBrowse, initialTab = 'login' }) {
  const [tab, setTab] = useState(initialTab);
  const [resetToken, setResetToken] = useState(() => new URLSearchParams(window.location.search).get('resetToken') || '');
  const [flow, setFlow] = useState(() => resetToken ? 'reset' : 'auth');

  const returnToAuth = (nextTab = 'login') => {
    setFlow('auth');
    setTab(nextTab);
    if (resetToken) {
      const url = new URL(window.location.href);
      url.searchParams.delete('resetToken');
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
      setResetToken('');
    }
  };

  const title = flow === 'forgot'
    ? 'Reset password'
    : flow === 'reset'
      ? 'Create new password'
      : tab === 'login'
        ? 'Welcome back'
        : 'Create your account';
  const subtitle = flow === 'forgot'
    ? 'Enter your email and we will send a reset link'
    : flow === 'reset'
      ? 'Choose a strong password for your account'
      : tab === 'login'
        ? 'Sign in to access your assessments and dashboard'
        : 'Join thousands of students on Far Away';

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
              {title}
            </h2>
            <p className="text-[13px] text-textMuted">
              {subtitle}
            </p>
          </div>

          {/* Tab switcher (Cal.com nav-pill-group style) */}
          {flow === 'auth' && (
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
          )}

          {/* Form card */}
          <div className="bg-bgCard border border-borderColor rounded-xl p-7" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            {flow === 'forgot' ? (
              <ForgotPasswordForm onBack={() => returnToAuth('login')} />
            ) : flow === 'reset' ? (
              <ResetPasswordForm token={resetToken} onBack={() => returnToAuth('login')} onComplete={() => returnToAuth('login')} />
            ) : tab === 'login' ? (
              <LoginForm
                onSwitch={() => setTab('register')}
                onGuestBrowse={onGuestBrowse}
                onForgotPassword={() => setFlow('forgot')}
              />
            ) : (
              <RegisterForm onSwitch={() => setTab('login')} onGuestBrowse={onGuestBrowse} />
            )}
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
