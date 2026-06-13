// src/components/ui/Avatar.jsx
import { AVATAR_COLORS } from '../../data/mockData';

/**
 * Avatar — circular avatar with initials + brand color
 * sizes: sm (28px) | md (36px) | lg (44px)
 */
export default function Avatar({ initials = '?', size = 'md', className = '', ring = false }) {
  const color = AVATAR_COLORS[initials] || '#6366f1';

  const sizeClass = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
    xl: 'w-14 h-14 text-base',
  }[size] || 'w-9 h-9 text-xs';

  return (
    <div
      className={`avatar ${sizeClass} ${ring ? 'ring-2 ring-accentIndigo/40' : ''} ${className}`}
      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
      title={initials}
    >
      {initials}
    </div>
  );
}
