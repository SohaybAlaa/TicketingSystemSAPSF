import React from 'react'
import { X as XIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import DaisySelect from '@components/ui/DaisySelect'

const THEMES = {
  amber: {
    wrapper: 'border-amber-200 hover:border-amber-300 focus-within:border-amber-400 focus-within:ring-amber-300/40',
    chip: 'bg-amber-100 !text-amber-800 border-amber-300',
    chipX: 'hover:bg-amber-200 hover:text-amber-900',
  },
  yellow: {
    wrapper: 'border-yellow-200 hover:border-yellow-300 focus-within:border-yellow-400 focus-within:ring-yellow-300/40',
    chip: 'bg-yellow-100 !text-yellow-800 border-yellow-300',
    chipX: 'hover:bg-yellow-200 hover:text-yellow-900',
  },
}

/**
 * Selected items render as removable chips above a `DaisySelect` filtered to
 * the remaining options. `theme` controls the chip color palette.
 */
export default function MultiSelectChips({ options, value = [], onChange, placeholder = 'Add\u2026', theme = 'amber' }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const th = THEMES[theme] ?? THEMES.amber
  const remaining = options.filter(o => !value.includes(o))

  const addOne = (v) => {
    if (!v || value.includes(v)) return
    onChange([...value, v])
  }
  const removeOne = (v) => onChange(value.filter(x => x !== v))

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {value.length > 0 && (
        <div className={`flex flex-wrap items-center gap-1.5 px-2 py-1.5 bg-white border-2 ${th.wrapper} rounded-xl transition-all`}>
          {value.map(v => (
            <span
              key={v}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg !text-[12px] !font-semibold border ${th.chip}`}
            >
              {v}
              <button
                type="button"
                onClick={() => removeOne(v)}
                className={`flex items-center justify-center w-4 h-4 rounded-full ${th.chipX} transition-colors cursor-pointer`}
                aria-label={`Remove ${v}`}
              >
                <XIcon size={11} strokeWidth={3} />
              </button>
            </span>
          ))}
        </div>
      )}
      {remaining.length > 0 && (
        <DaisySelect
          value=""
          options={remaining}
          onChange={addOne}
          placeholder={placeholder}
          t={t}
          isRTL={isRTL}
        />
      )}
    </div>
  )
}
