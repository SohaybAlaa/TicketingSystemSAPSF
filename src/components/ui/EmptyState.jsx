// Reusable empty state display — use inside a grid overlay, a div, or anywhere with no data.
// Shows an icon box, title, optional semi-description, optional description, and an optional action button.
//
// Props:
//   icon            — Lucide icon component to display (required)
//   iconColor       — Tailwind text color class for the icon, default 'text-yellow-500'
//   iconBoxColor    — Tailwind bg/border classes for the icon box (or use the default yellow theme)
//   title           — Main bold heading (required)
//   semiDescription — Smaller muted line shown between title and description (optional)
//   description     — Subtitle below the title (optional)
//   action          — { label, icon: LucideIcon, onClick } — renders the action button (optional)
//   className       — Extra class names on the wrapper (optional)
import React from 'react'

export default function EmptyState({
  icon: Icon,
  iconColor = 'text-yellow-500',
  iconBoxColor,
  title,
  semiDescription,
  description,
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-24 gap-5 text-center ${className}`}>

      {/* Icon box */}
      <div
        className={
          iconBoxColor
            ? `w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${iconBoxColor}`
            : 'w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 flex items-center justify-center shadow-lg shadow-yellow-100'
        }
      >
        <Icon size={32} className={iconColor} />
      </div>

      {/* Text block */}
      <div className="flex flex-col items-center gap-1">
        <p className="!text-xl !font-extrabold !text-slate-800">{title}</p>
        {semiDescription && (
          <p className="!text-xs !font-bold !text-gray-400 !uppercase tracking-wider mt-0.5">{semiDescription}</p>
        )}
        {description && (
          <p className="!text-sm !text-gray-500 mt-1 !font-medium">{description}</p>
        )}
      </div>

      {/* Action button */}
      {action && (
        <button
          onClick={action.onClick}
          className="action-button flex items-center gap-2 mt-2"
        >
          {action.icon && <action.icon size={16} />}
          {action.label}
        </button>
      )}
    </div>
  )
}
