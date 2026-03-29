import React from 'react'
import { Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function GridSearchBar({ value, onChange, placeholder, disabled = false, inputRef }) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return (
    <div className="relative" dir={isRTL ? 'rtl' : 'ltr'}>
      <Search className={`absolute ${isRTL ? 'right-2.5' : 'left-2.5'} top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none`} />
      <input
        ref={inputRef}
        disabled={disabled}
        className={`border border-gray-200 rounded-xl ${isRTL ? 'pr-8 pl-8' : 'pl-8 pr-8'} py-3 text-sm font-semibold text-gray-800
                   focus:outline-none focus:ring-3 focus:ring-yellow-400 w-120 bg-white
                   disabled:!cursor-not-allowed ${isRTL ? 'text-right' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className={`absolute ${isRTL ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}
