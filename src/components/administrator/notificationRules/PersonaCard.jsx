import React from 'react'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function PersonaCard({ persona, selected, onToggle }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const Icon = persona.icon
  const translatedLabel = t(`administratorMenu.tabs.notificationRules.recipients.personas.${persona.id}`) || persona.label
  return (
    <button
      onClick={onToggle}
      className={`relative flex flex-col items-center gap-2.5 px-3 py-4 rounded-xl border-2 text-center cursor-pointer select-none group transition-[transform,border-color,box-shadow,background-color] duration-200 hover:scale-[1.02] active:scale-95 ${selected
          ? 'bg-gradient-to-b from-yellow-50 to-amber-50 border-yellow-400 shadow-md shadow-yellow-200/60'
          : 'bg-white border-gray-200 hover:border-yellow-300 hover:shadow-sm hover:shadow-yellow-100 hover:bg-yellow-50/40'
        }`}
    >
      {/* Check badge — absolute top-right corner (or top-left in RTL) */}
      <span
        aria-hidden="true"
        className={`absolute -top-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ring-2 ring-white ${selected
            ? 'bg-yellow-400 shadow-sm shadow-yellow-300/60 scale-100 opacity-100'
            : 'bg-gray-200 scale-0 opacity-0'
          } ${isRTL ? '-left-1.5' : '-right-1.5'}`}
      >
        <Check size={11} className="text-yellow-900" strokeWidth={3} />
      </span>

      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${selected
            ? 'bg-gradient-to-br from-yellow-300 to-amber-500 shadow-md shadow-yellow-300/60 ring-2 ring-white'
            : 'bg-gray-100 group-hover:bg-yellow-100 group-hover:scale-105'
          }`}
      >
        <Icon
          size={20}
          strokeWidth={selected ? 2.5 : 2}
          className={selected ? 'text-yellow-900' : 'text-gray-500 group-hover:text-yellow-700'}
        />
      </div>

      <span className={`!text-[13px] !font-bold leading-tight tracking-tight ${selected ? '!text-yellow-900' : '!text-slate-700 group-hover:!text-yellow-800'}`}>
        {translatedLabel}
      </span>
    </button>
  )
}
