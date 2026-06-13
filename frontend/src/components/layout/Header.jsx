// src/components/layout/Header.jsx
// ─── Far Away — Premium Top Navigation Header ───
// Merges all features from Sidebar and TopBar into a unified header.
// Styled following clean, minimal, Apple/Cal.com design guidelines.

import { useState } from 'react';
import Avatar from '../ui/Avatar';
import {
  LogoMark,
  IconLayoutGrid, IconBook, IconTrophy,
  IconZap, IconArrowsSwap, IconSearch, IconBell,
  IconCoin, IconFlame, IconLogOut, IconLogIn, IconPlus, IconUser, IconCode,
  IconMoon, IconSun, IconArrowLeft,
} from '../ui/Icons';

const STUDENT_NAV = [
  { id: 'dashboard',    Icon: IconLayoutGrid, label: 'Dashboard'    },
  { id: 'assessments',  Icon: IconBook,       label: 'Assessments'  },
  { id: 'leaderboard',  Icon: IconTrophy,     label: 'Leaderboards' },
  { id: 'competitions', Icon: IconZap,        label: 'Competitions' },
  { id: 'coding',       Icon: IconCode,       label: 'Coding'       },
  { id: 'skillswap',    Icon: IconArrowsSwap, label: 'SkillSwap'    },
];

const TEACHER_NAV = [
  { id: 'class-progress', Icon: IconUser,       label: 'Class Progress' },
  { id: 'create-test',    Icon: IconPlus,       label: 'Create Lab Test' },
  { id: 'coding',         Icon: IconCode,       label: 'Coding Bank' },
  { id: 'leaderboard',    Icon: IconTrophy,     label: 'Leaderboards' },
];

export default function Header({
  activeTab,
  onTabChange,
  canGoBack = false,
  onBack,
  user,
  isLoggedIn,
  onLogout,
  onLogin,
  searchQuery,
  onSearchChange,
  notifications = [],
  hasUnread,
  onNotificationClick,
  onClearNotifications,
  onCoinClick,
  onCoinHistoryClick,
  themeMode = 'light',
  onToggleTheme,
  userRole = 'student',
}) {
  const navs = userRole === 'teacher' || userRole === 'admin' ? TEACHER_NAV : STUDENT_NAV;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountPinned, setAccountPinned] = useState(false);
  const isDark = themeMode === 'dark';

  const handleBellClick = () => {
    setNotificationsOpen(open => !open);
    onNotificationClick?.();
  };

  return (
    <header className="relative h-[76px] border-b border-borderColor bg-bgCard/90 backdrop-blur-md sticky top-0 z-50 w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-all">
      {/* ── Left: Branding ── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {canGoBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-lg border border-borderColor flex items-center justify-center hover:bg-bgSecondary transition-colors text-textSecondary"
            title="Go back"
            aria-label="Go back"
          >
            <IconArrowLeft size={16} />
          </button>
        )}
        <div
          className="flex items-center gap-3.5 cursor-pointer"
          onClick={() => onTabChange(userRole === 'teacher' || userRole === 'admin' ? 'class-progress' : 'dashboard')}
        >
          {/* Logo icon only appears when size is 100% (large desktops), hidden on smaller sizes */}
          <div className="hidden xl:block transition-all duration-300">
            <LogoMark size={28} />
          </div>
          <div className="flex flex-col">
            <h1 className="font-sans font-bold text-[14px] text-textPrimary tracking-tight leading-none">
              Far Away
            </h1>
            <p className="text-[9px] text-textMuted mt-0.5 font-medium tracking-wider uppercase">
              Learning Arena
            </p>
          </div>
        </div>
      </div>

      {/* ── Center: Horizontal Navigation Links (with wider gap) ── */}
      <nav className="hidden xl:flex items-center gap-2">
        {navs.map(({ id, Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={activeTab === id ? 'top-nav-item-active' : 'top-nav-item-idle'}
          >
            <Icon size={14} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* ── Right: Search, Stats, & Account (with increased spacing) ── */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(o => !o)}
          className="xl:hidden w-9 h-9 rounded-lg border border-borderColor flex items-center justify-center hover:bg-bgSecondary transition-colors text-textSecondary"
          title="Menu"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>

        {/* Search Input */}
        <div className="relative hidden 2xl:block">
          <IconSearch
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            disabled={activeTab === 'quiz'}
            placeholder={userRole === 'teacher' ? 'Search student…' : 'Search…'}
            className="input pl-8 text-[12px]"
            style={{ height: '34px', width: '180px' }}
          />
        </div>

        {/* Stats Pill Capsule */}
        {userRole === 'student' && (
          <div className="hidden lg:flex items-center gap-3">
            {/* Coins balance */}
            <button
              onClick={onCoinClick}
              className="flex items-center gap-1 bg-accentAmber/8 border border-accentAmber/20
                         text-accentAmber px-3 py-1.5 rounded-full text-[11px] font-semibold
                         hover:bg-accentAmber/15 transition-all active:scale-95 select-none tabular-nums"
              title="Claim daily bonus coins"
            >
              <IconCoin size={13} />
              <span>{user.coins}</span>
            </button>

            {/* Daily streak */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-bgSecondary border border-borderColor">
              <IconFlame size={12} className="text-accentAmber" />
              <span className="text-[11px] font-semibold text-textSecondary tabular-nums">{user.streak}d</span>
            </div>
          </div>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={handleBellClick}
            className="w-9 h-9 rounded-lg border border-borderColor flex items-center justify-center relative hover:bg-bgSecondary transition-colors"
            title="Notifications"
            aria-expanded={notificationsOpen}
            aria-label="Notifications"
          >
            <IconBell size={15} className="text-textSecondary" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-accentIndigo" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-[calc(100%+10px)] w-[300px] max-w-[calc(100vw-24px)] rounded-lg border border-borderColor bg-bgCard shadow-modal z-[70] p-3 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-borderColor">
                <p className="text-[12px] font-bold text-textPrimary">Notifications</p>
                {notifications.length > 0 ? (
                  <button
                    type="button"
                    onClick={onClearNotifications}
                    className="text-[10px] font-semibold text-accentIndigo hover:underline"
                  >
                    Clear
                  </button>
                ) : (
                  <span className="text-[10px] font-semibold text-textMuted uppercase tracking-wide">Today</span>
                )}
              </div>
              <div className="pt-2 space-y-2">
                {notifications.length > 0 ? notifications.map(item => (
                  <div key={item.id || item.title} className="rounded-md bg-bgSecondary/70 border border-borderColor p-3">
                    <p className="text-[12px] font-semibold text-textPrimary">{item.title}</p>
                    <p className="text-[11px] text-textMuted mt-1 leading-relaxed">{item.body}</p>
                  </div>
                )) : (
                  <div className="rounded-md bg-bgSecondary/70 border border-borderColor p-4 text-center">
                    <p className="text-[12px] font-semibold text-textPrimary">All clear</p>
                    <p className="text-[11px] text-textMuted mt-1">New SkillSwap and account updates will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="w-9 h-9 rounded-lg border border-borderColor flex items-center justify-center hover:bg-bgSecondary transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <IconSun size={15} className="text-textSecondary" />
          ) : (
            <IconMoon size={15} className="text-textSecondary" />
          )}
        </button>

        {/* Divider line */}
        <div className="h-5 w-[1px] bg-borderColor hidden sm:block" />

        {/* Auth / Account widget */}
        {isLoggedIn ? (
          <div
            className="relative"
            onMouseEnter={() => setAccountOpen(true)}
            onMouseLeave={() => {
              if (!accountPinned) setAccountOpen(false);
            }}
          >
            <button
              type="button"
              onClick={() => {
                setAccountPinned(pinned => {
                  const next = !pinned;
                  setAccountOpen(next);
                  return next;
                });
              }}
              className="flex items-center gap-3.5 rounded-lg px-1.5 py-1 hover:bg-bgSecondary transition-colors"
              aria-expanded={accountOpen || accountPinned}
              aria-label="Account menu"
            >
              <Avatar initials={user.initials || 'TR'} size="sm" />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[12px] font-semibold text-textPrimary leading-none truncate max-w-[80px]">
                  {user.name.split(' ')[0]}
                </span>
                <span className="text-[9px] text-textMuted mt-0.5">
                  {userRole === 'admin' ? 'Admin' : userRole === 'teacher' ? 'Faculty' : `Lv.${user.level}`}
                </span>
              </div>
            </button>

            {(accountOpen || accountPinned) && (
              <div className="absolute right-0 top-[calc(100%+10px)] w-[280px] max-w-[calc(100vw-24px)] rounded-lg border border-borderColor bg-bgCard shadow-modal z-[70] p-4 animate-fadeIn">
                <div className="flex items-center gap-3 pb-3 border-b border-borderColor">
                  <Avatar initials={user.initials || 'TR'} size="md" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-textPrimary truncate">{user.name}</p>
                    <p className="text-[11px] text-textMuted">{userRole === 'admin' ? 'Admin account' : userRole === 'teacher' ? 'Faculty account' : 'Student account'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 py-3">
                  <div className="rounded-md bg-bgSecondary border border-borderColor p-3">
                    <p className="text-[10px] text-textMuted font-semibold uppercase tracking-wide">Coins</p>
                    <p className="text-[18px] text-textPrimary font-bold tabular-nums">{user.coins}</p>
                  </div>
                  <div className="rounded-md bg-bgSecondary border border-borderColor p-3">
                    <p className="text-[10px] text-textMuted font-semibold uppercase tracking-wide">Streak</p>
                    <p className="text-[18px] text-textPrimary font-bold tabular-nums">{user.streak || 0}d</p>
                  </div>
                  <div className="rounded-md bg-bgSecondary border border-borderColor p-3">
                    <p className="text-[10px] text-textMuted font-semibold uppercase tracking-wide">XP</p>
                    <p className="text-[18px] text-textPrimary font-bold tabular-nums">{user.xp || 0}</p>
                  </div>
                  <div className="rounded-md bg-bgSecondary border border-borderColor p-3">
                    <p className="text-[10px] text-textMuted font-semibold uppercase tracking-wide">Level</p>
                    <p className="text-[18px] text-textPrimary font-bold tabular-nums">{user.level || 0}</p>
                  </div>
                </div>

                {userRole === 'student' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAccountOpen(false);
                      setAccountPinned(false);
                      onCoinHistoryClick?.();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-[12px] font-semibold text-textSecondary hover:text-accentAmber hover:bg-accentAmber/5 transition-all mb-1"
                    title="View coin balance history"
                  >
                    <IconCoin size={14} />
                    <span>Coin History</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setAccountOpen(false);
                    setAccountPinned(false);
                    onLogout?.();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-[12px] font-semibold text-accentCrimson hover:bg-accentCrimson/5 transition-all"
                  title="Sign Out"
                >
                  <IconLogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="btn-primary btn-sm flex items-center gap-1.5"
            style={{ height: '34px', borderRadius: '8px' }}
          >
            <IconLogIn size={13} />
            <span>Sign In</span>
          </button>
        )}
      </div>

      {/* ── Mobile slide-down navigation ── */}
      {mobileOpen && (
        <div className="xl:hidden absolute top-full left-0 right-0 bg-bgCard border-b border-borderColor shadow-glass px-4 sm:px-6 py-3 flex flex-col gap-1 animate-fadeIn">
          {navs.map(({ id, Icon, label }) => (
            <button
              key={id}
              onClick={() => { onTabChange(id); setMobileOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-display font-semibold transition-colors ${activeTab === id ? 'bg-accentIndigo/10 text-accentIndigo' : 'text-textSecondary hover:bg-bgSecondary'}`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
          {/* Mobile search */}
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            disabled={activeTab === 'quiz'}
            placeholder={userRole === 'teacher' ? 'Search student…' : 'Search…'}
            className="input mt-2"
          />
        </div>
      )}
    </header>
  );
}
