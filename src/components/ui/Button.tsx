'use client'

import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  loading?: boolean
}

export function Button({ variant = 'primary', loading, children, className = '', disabled, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-bold transition-all active:scale-95 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'text-black',
    secondary: 'text-white',
    ghost: 'text-white',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }

  const inlineStyles: Record<string, React.CSSProperties> = {
    primary: { background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)' },
    secondary: { background: '#1A1A1A', border: '1px solid #2A2A2A' },
    ghost: { background: 'transparent' },
    danger: {},
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      style={inlineStyles[variant]}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
