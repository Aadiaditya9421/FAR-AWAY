// src/components/ui/Button.jsx
import React from 'react';

/**
 * Button — design system primitive
 * variants: primary | secondary | ghost | success | danger | amber
 * sizes: sm | md (default) | lg
 */
export default function Button({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  fullWidth = false,
}) {
  const variantClass = {
    primary:   'btn-primary',
    secondary: 'btn-secondary',
    ghost:     'btn-ghost',
    success:   'btn-success',
    danger:    'btn-danger',
    amber:     'btn-amber',
    indigo:    'btn-primary',
  }[variant] || 'btn-secondary';

  const sizeClass = {
    sm: 'text-xs px-3 py-1.5 rounded',
    md: '',
    lg: 'text-sm px-5 py-2.5 rounded-lg',
  }[size] || '';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn ${variantClass} ${sizeClass} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''} ${className}`}
    >
      {icon && <span className="text-base leading-none">{icon}</span>}
      {children}
      {iconRight && <span className="text-base leading-none">{iconRight}</span>}
    </button>
  );
}
