import React from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Reusable Section Header Component
 * Used for section titles with icon and gradient styling
 * 
 * @param {React.ComponentType} icon - Lucide icon component
 * @param {string} title - Section title (will be uppercase with tracking)
 * @param {string} subtitle - Optional subtitle (normal case, gray color)
 * @param {string} className - Additional CSS classes
 */
export default function SectionHeader({ icon: Icon, title, subtitle, className = '' }) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return (
    <div className={`pb-3 ${className}`}>
      <div className="flex items-center gap-2.5">
        <h2 className={`text-base font-bold text-slate-700 uppercase tracking-wider ${isRTL ? 'text-right' : ''}`}>
          {title}
          {subtitle && <span className={`${isRTL ? 'mr-2' : 'ml-2'} normal-case font-bold text-gray-500`}>{subtitle}</span>}
        </h2>
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-sm shadow-yellow-400/40">
          <Icon className="w-6 h-6 text-yellow-900" />
        </div>
      </div>
      <div className={`w-10 h-1 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 ${isRTL ? 'ml-auto' : ''}`} />
    </div>
  )
}
