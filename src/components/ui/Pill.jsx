import React from 'react'

const PILL_VARIANTS = {
  green: {
    solid: 'bg-green-500 !text-white border-green-600 shadow-green-500/30',
    soft: 'bg-green-50 !text-green-700 border-green-200',
    dot: 'bg-green-500',
  },
  red: {
    solid: 'bg-red-500 !text-white border-red-600 shadow-red-500/30',
    soft: 'bg-red-50 !text-red-700 border-red-200',
    dot: 'bg-red-500',
  },
  blue: {
    solid: 'bg-blue-600 !text-white border-blue-700 shadow-blue-500/40',
    soft: 'bg-blue-50 !text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  amber: {
    solid: 'bg-amber-600 !text-white border-amber-700 shadow-amber-500/40',
    soft: 'bg-amber-50 !text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  purple: {
    solid: 'bg-purple-600 !text-white border-purple-700 shadow-purple-500/40',
    soft: 'bg-purple-50 !text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
  },
  gray: {
    solid: 'bg-gray-600 !text-white border-gray-700 shadow-gray-500/40',
    soft: 'bg-gray-50 !text-gray-700 border-gray-200',
    dot: 'bg-gray-500',
  },
}

/**
 * Compact status / count / category badge. (Pills in notification rules at section 1, 2, 3 active - conditions - recipients)
 * Supports solid + soft variants, optional dot, optional leading icon.
 */
export default function Pill({ children, icon: Icon, color = 'gray', variant = 'soft', dot = false, className = '' }) {
  const cfg = PILL_VARIANTS[color] ?? PILL_VARIANTS.gray
  const isSolid = variant === 'solid'
  const styles = isSolid ? cfg.solid : cfg.soft
  const dotBg = isSolid ? 'bg-white' : cfg.dot
  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 min-w-[120px] rounded-full !text-[11px] !font-extrabold !uppercase tracking-wider border shadow-sm ${styles} ${className}`}
      style={isSolid ? { textShadow: '0 1px 2px rgba(0,0,0,0.20)' } : undefined}
    >
      {dot && <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotBg}`} />}
      {Icon && <Icon size={11} strokeWidth={2.75} className="flex-shrink-0" />}
      <span>{children}</span>
    </span>
  )
}
