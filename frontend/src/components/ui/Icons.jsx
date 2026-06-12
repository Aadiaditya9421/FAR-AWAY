// src/components/ui/Icons.jsx
// ─── Far Away — SVG Icon Library ───
// Pixel-perfect 24×24 icons. All stroke-based, 2px weight, round caps/joins.
// Usage: <IconBook size={18} className="text-textMuted" />


const Ico = ({ size, className, children, viewBox = '0 0 24 24' }) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const IconLayoutGrid = ({ size = 18, className = '' }) => (
  <Ico size={size} className={className}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </Ico>
);

export const IconBook = ({ size = 18, className = '' }) => (
  <Ico size={size} className={className}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <line x1="9" y1="7" x2="15" y2="7" />
    <line x1="9" y1="11" x2="13" y2="11" />
  </Ico>
);

export const IconTrophy = ({ size = 18, className = '' }) => (
  <Ico size={size} className={className}>
    <path d="M8 21h8M12 17v4" />
    <path d="M7 4h10v7a5 5 0 0 1-5 5 5 5 0 0 1-5-5V4z" />
    <path d="M7 7H4a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4" />
    <path d="M17 7h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4" />
  </Ico>
);

export const IconZap = ({ size = 18, className = '' }) => (
  <Ico size={size} className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </Ico>
);

export const IconArrowsSwap = ({ size = 18, className = '' }) => (
  <Ico size={size} className={className}>
    <path d="M7 16V4m0 0-4 4m4-4 4 4" />
    <path d="M17 8v12m0 0 4-4m-4 4-4-4" />
  </Ico>
);

export const IconLogOut = ({ size = 18, className = '' }) => (
  <Ico size={size} className={className}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </Ico>
);

export const IconLogIn = ({ size = 18, className = '' }) => (
  <Ico size={size} className={className}>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </Ico>
);

export const IconBell = ({ size = 18, className = '' }) => (
  <Ico size={size} className={className}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Ico>
);

export const IconSearch = ({ size = 16, className = '' }) => (
  <Ico size={size} className={className}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Ico>
);

export const IconCoin = ({ size = 16, className = '' }) => (
  <Ico size={size} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M14.4 9.6C13.9 9 13 8.5 12 8.5c-1.7 0-3 1.1-3 2.5 0 1.3 1 2 3 2.5s3 1.2 3 2.5c0 1.4-1.3 2.5-3 2.5-1.1 0-2-.5-2.5-1.2" />
    <line x1="12" y1="7" x2="12" y2="8.5" />
    <line x1="12" y1="15.5" x2="12" y2="17" />
  </Ico>
);

export const IconLock = ({ size = 20, className = '' }) => (
  <Ico size={size} className={className}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Ico>
);

export const IconEye = ({ size = 16, className = '' }) => (
  <Ico size={size} className={className}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </Ico>
);

export const IconEyeOff = ({ size = 16, className = '' }) => (
  <Ico size={size} className={className}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </Ico>
);

export const IconClock = ({ size = 14, className = '' }) => (
  <Ico size={size} className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </Ico>
);

export const IconCalendar = ({ size = 14, className = '' }) => (
  <Ico size={size} className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </Ico>
);

export const IconUser = ({ size = 18, className = '' }) => (
  <Ico size={size} className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Ico>
);

export const IconPlus = ({ size = 16, className = '' }) => (
  <Ico size={size} className={className}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </Ico>
);

export const IconCheck = ({ size = 16, className = '' }) => (
  <Ico size={size} className={className}>
    <polyline points="20 6 9 17 4 12" />
  </Ico>
);

export const IconX = ({ size = 16, className = '' }) => (
  <Ico size={size} className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Ico>
);

export const IconChevronRight = ({ size = 16, className = '' }) => (
  <Ico size={size} className={className}>
    <polyline points="9 18 15 12 9 6" />
  </Ico>
);

export const IconChevronDown = ({ size = 16, className = '' }) => (
  <Ico size={size} className={className}>
    <polyline points="6 9 12 15 18 9" />
  </Ico>
);

export const IconArrowLeft = ({ size = 18, className = '' }) => (
  <Ico size={size} className={className}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </Ico>
);

export const IconStar = ({ size = 14, className = '' }) => (
  <Ico size={size} className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </Ico>
);

export const IconCode = ({ size = 18, className = '' }) => (
  <Ico size={size} className={className}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </Ico>
);

export const IconPlay = ({ size = 18, className = '' }) => (
  <Ico size={size} className={className}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </Ico>
);

export const IconDatabase = ({ size = 18, className = '' }) => (
  <Ico size={size} className={className}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </Ico>
);

export const IconGlobe = ({ size = 18, className = '' }) => (
  <Ico size={size} className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </Ico>
);

export const IconServer = ({ size = 18, className = '' }) => (
  <Ico size={size} className={className}>
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
    <line x1="6" y1="6" x2="6.01" y2="6" />
    <line x1="6" y1="18" x2="6.01" y2="18" />
  </Ico>
);

export const IconAtom = ({ size = 18, className = '' }) => (
  <Ico size={size} className={className}>
    <circle cx="12" cy="12" r="1" />
    <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5z" />
    <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5z" />
  </Ico>
);

export const IconFlame = ({ size = 14, className = '' }) => (
  <Ico size={size} className={className}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </Ico>
);

export const IconAward = ({ size = 16, className = '' }) => (
  <Ico size={size} className={className}>
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </Ico>
);

export const IconTarget = ({ size = 14, className = '' }) => (
  <Ico size={size} className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </Ico>
);

export const IconFilter = ({ size = 16, className = '' }) => (
  <Ico size={size} className={className}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </Ico>
);

export const IconSend = ({ size = 16, className = '' }) => (
  <Ico size={size} className={className}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </Ico>
);

export const IconFlag = ({ size = 16, className = '' }) => (
  <Ico size={size} className={className}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </Ico>
);

// Far Away logo mark SVG
export const LogoMark = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-label="Far Away">
    <rect width="32" height="32" rx="8" fill="#fa520f" />
    <path d="M8 16L16 8L24 16L16 24Z" fill="white" />
    <path d="M16 8L24 16" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
  </svg>
);

// Inline spinner
export const Spinner = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`animate-spin ${className}`} aria-label="Loading">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);
