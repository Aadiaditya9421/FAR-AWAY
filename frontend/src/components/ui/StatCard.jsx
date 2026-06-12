// src/components/ui/StatCard.jsx

/**
 * StatCard — dashboard metric card
 * Inspired by Cal.com feature-card with Notion's tight heading tracking
 */
export default function StatCard({ label, value, icon, accent = 'default', sublabel, onClick }) {
  const accentStyles = {
    default: { value: 'text-textPrimary',  icon: 'bg-bgSecondary border-borderColor' },
    amber:   { value: 'text-accentAmber',  icon: 'bg-accentAmber/8 border-accentAmber/20' },
    indigo:  { value: 'text-accentIndigo', icon: 'bg-accentIndigo/8 border-accentIndigo/20' },
    emerald: { value: 'text-accentEmerald',icon: 'bg-accentEmerald/8 border-accentEmerald/20' },
    violet:  { value: 'text-accentViolet', icon: 'bg-accentViolet/8 border-accentViolet/20' },
  };

  const style = accentStyles[accent] || accentStyles.default;

  return (
    <div
      className={`stat-card ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''}`}
      onClick={onClick}
    >
      <div className="flex flex-col gap-1 min-w-0">
        <span className="label-caps">{label}</span>
        <span className={`font-display font-bold text-2xl tracking-tight leading-none ${style.value}`}>
          {value}
        </span>
        {sublabel && (
          <span className="text-[10px] text-textMuted mt-0.5">{sublabel}</span>
        )}
      </div>
      <div className={`w-11 h-11 flex-shrink-0 rounded-lg border flex items-center justify-center text-xl ${style.icon}`}>
        {icon}
      </div>
    </div>
  );
}
