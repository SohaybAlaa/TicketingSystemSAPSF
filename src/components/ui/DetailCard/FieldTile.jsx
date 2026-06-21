import React from 'react'

// Reusable field tile used inside detail cards (EmployeeDetailCard, SLARuleDetailCard, etc.)
// Shows a colored icon circle, a label, and a value.
// Props:
//   label        - field label text
//   value        - field value (string)
//   icon         - Lucide icon component
//   color        - accent hex color for icon bg + border
//   isEmail      - if true, value is styled in blue (link-like)
//   customRender - optional JSX to render instead of plain value (e.g. a Tag)
//   copyButton   - optional JSX for a copy action button (shown on hover)
export default function FieldTile({ label, value, icon: Icon, color, isEmail, customRender, copyButton }) {
  return (
    <div
      className="group relative rounded-xl px-4 py-3.5 transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-default"
      style={{
        background: `linear-gradient(135deg, ${color}08 0%, ${color}04 100%)`,
        border: `1px solid ${color}20`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`
        e.currentTarget.style.borderColor = `${color}40`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = `linear-gradient(135deg, ${color}08 0%, ${color}04 100%)`
        e.currentTarget.style.borderColor = `${color}20`
      }}
    >
      <div className="flex items-center gap-3 justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: `${color}18` }}
          >
            <Icon className="icon-flip" size={18} style={{ color }} strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate mb-0.5">
              {label}
            </div>
            {customRender ? customRender : (
              <div
                className={`text-sm font-semibold truncate ${isEmail ? 'text-blue-600' : 'text-gray-800'}`}
                title={value}
              >
                {value ?? '—'}
              </div>
            )}
          </div>
        </div>
        {copyButton}
      </div>
    </div>
  )
}
