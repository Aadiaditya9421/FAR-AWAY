// src/components/ui/Badge.jsx
import React from 'react';

/**
 * Badge — pill label for difficulty, status, skill level
 * variant: easy | medium | hard | live | upcoming | completed | expert | intermediate | beginner | custom
 */
export default function Badge({ children, variant = 'custom', className = '', dot = false }) {
  const variantClass = {
    easy:         'badge-easy',
    medium:       'badge-medium',
    hard:         'badge-hard',
    live:         'badge-live',
    upcoming:     'badge-upcoming',
    completed:    'badge-completed',
    expert:       'badge-expert',
    intermediate: 'badge-intermediate',
    beginner:     'badge-beginner',
    custom:       'badge bg-borderColor text-textSecondary border border-borderHover',
  }[variant] || 'badge bg-borderColor text-textSecondary border border-borderHover';

  return (
    <span className={`${variantClass} ${className}`}>
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 inline-block" />
      )}
      {children}
    </span>
  );
}
