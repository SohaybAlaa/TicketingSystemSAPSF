import React from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Generic on/off pill switch with green/red gradient. (As in Notification Info 1 status (active/inactive) in notification rules)
 * Honors RTL knob direction.
 */
export default function Toggle({ checked, onChange }) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus:ring-4 ${checked
        ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-md shadow-green-300/60 focus:ring-green-400/30'
        : 'bg-gradient-to-r from-rose-400 to-red-500 shadow-md shadow-red-300/50 focus:ring-red-400/30'
      }`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
        isRTL
          ? (checked ? '-translate-x-6' : '-translate-x-1')
          : (checked ? 'translate-x-6' : 'translate-x-1')
      }`} />
    </button>
  )
}
