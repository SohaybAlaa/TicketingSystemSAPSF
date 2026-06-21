import React from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Numbered yellow-accent header used at the top of every notification-form
 * section card. Renders the step number, title, optional subtitle, plus
 * optional badge/action slots on the trailing edge. Mirrors layout for RTL.
 */
export default function CardHeader({ num, label, subtitle, badge, action }) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return (
    <div className={`relative flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 ${isRTL ? 'bg-gradient-to-l from-yellow-50/60 via-amber-50/30 to-transparent' : 'bg-gradient-to-r from-yellow-50/60 via-amber-50/30 to-transparent'}`}>
      {/* Left accent bar (or right in RTL) */}
      <span
        aria-hidden="true"
        className={`absolute top-3 bottom-3 w-1 bg-gradient-to-b from-yellow-400 to-amber-500 ${isRTL ? 'right-0 rounded-l-full' : 'left-0 rounded-r-full'}`}
      />
      <div className="flex items-center gap-4 min-w-0">
        <div
          className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 flex items-center justify-center !text-[16px] !font-extrabold !text-yellow-900 flex-shrink-0 shadow-md shadow-yellow-300/60 ring-2 ring-white"
        >
          {num}
        </div>
        <div className="min-w-0">
          <div className="!text-[19px] !font-bold !text-slate-900 leading-tight tracking-tight truncate">
            {label}
          </div>
          {subtitle && (
            <div className="!text-[14px] !font-medium !text-gray-500 mt-1 leading-snug">
              {subtitle}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {badge}
        {action}
      </div>
    </div>
  )
}
