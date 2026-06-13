/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Canvas & Surfaces (Cal.com + Mistral merged) ──
        bgPrimary:    'rgb(var(--app-bg-primary) / <alpha-value>)',
        bgSecondary:  'rgb(var(--app-bg-secondary) / <alpha-value>)',
        bgCard:       'rgb(var(--app-bg-card) / <alpha-value>)',
        bgCardHover:  'rgb(var(--app-bg-card-hover) / <alpha-value>)',
        bgGlass:      'rgb(var(--app-bg-glass) / <alpha-value>)',

        // ── Borders (Cal.com hairlines) ──
        borderColor:  'rgb(var(--app-border-color) / <alpha-value>)',
        borderHover:  'rgb(var(--app-border-hover) / <alpha-value>)',
        borderActive: '#fa520f',   // Mistral orange on focus

        // ── Primary Accent: Mistral Orange ──
        accentIndigo:  '#fa520f',  // PRIMARY: Mistral orange (all CTAs)
        accentViolet:  '#cc3a05',  // PRIMARY DEEP: pressed/darker
        accentEmerald: '#10b981',  // Success / connected
        accentAmber:   '#f59e0b',  // Coins / warnings
        accentCrimson: '#ef4444',  // Danger / errors
        accentCyan:    '#3b82f6',  // Info / data viz

        // ── Cream surfaces (Mistral signature) ──
        cream:         '#fff8e0',
        creamLight:    '#fffaeb',
        creamDeeper:   '#fff0c2',
        beigeDeep:     '#e6d5a8',
        sunshine300:   '#ffd06a',
        sunshine500:   '#ffb83e',
        sunshine700:   '#ffa110',

        // ── Text (Mistral ink scale) ──
        textPrimary:   'rgb(var(--app-text-primary) / <alpha-value>)',
        textSecondary: 'rgb(var(--app-text-secondary) / <alpha-value>)',
        textMuted:     'rgb(var(--app-text-muted) / <alpha-value>)',
        textFaint:     'rgb(var(--app-text-faint) / <alpha-value>)',

        // ── Dark surface (Cal.com footer) ──
        surfaceDark:   '#101010',

        // ── Semantic badge backgrounds ──
        badgeEasy:   'rgba(16,185,129,0.10)',
        badgeMedium: 'rgba(245,158,11,0.10)',
        badgeHard:   'rgba(239,68,68,0.10)',
      },
      fontFamily: {
        sans:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        'display': '-0.04em',
        'tight2':  '-0.02em',
        'tight1':  '-0.01em',
      },
      opacity: {
        3: '0.03', 4: '0.04', 6: '0.06',
        8: '0.08', 12: '0.12', 15: '0.15',
      },
      borderRadius: {
        'xs': '4px', 'sm': '6px', 'md': '8px',
        'lg': '12px', 'xl': '16px', '2xl': '20px',
      },
      boxShadow: {
        'card':         '0 1px 2px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)',
        'card-hover':   '0 2px 4px rgba(0,0,0,0.06), 0 8px 20px rgba(0,0,0,0.06)',
        'glow-indigo':  '0 0 0 3px rgba(250,82,15,0.12)',
        'glow-amber':   '0 0 16px rgba(245,158,11,0.15)',
        'glow-emerald': '0 0 16px rgba(16,185,129,0.15)',
        'glass':        '0 8px 32px rgba(0,0,0,0.08)',
        'modal':        '0 16px 48px rgba(0,0,0,0.12)',
        'input-focus':  '0 0 0 3px rgba(250,82,15,0.12)',
      },
      animation: {
        'fadeIn':       'fadeIn 0.22s ease-out',
        'slideUp':      'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slideInRight': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'spinSlow':     'spinSlow 6s linear infinite',
        'pulseBorder':  'pulseBorder 1s infinite alternate',
        'shimmer':      'shimmer 2s infinite',
        'float':        'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:      { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideUp:     { from: { opacity: '0', transform: 'translateY(18px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideInRight:{ from: { transform: 'translateX(100%)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        spinSlow:    { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
        pulseBorder: { from: { boxShadow: '0 0 0 rgba(250,82,15,0.2)' }, to: { boxShadow: '0 0 12px rgba(250,82,15,0.5)' } },
        shimmer:     { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float:       { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-4px)' } },
      },
    },
  },
  plugins: [],
}
