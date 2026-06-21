import React from 'react'
import { MousePointerClick } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PLACEHOLDERS } from '@data/notificationRules'
import FieldLabel from '@components/ui/FieldLabel'

/**
 * Grid of insertable placeholder chips used by the email editor. Buttons are
 * grayed out when `disabled` (i.e. preview mode). Clicking a chip calls
 * `onInsert(key)` so the parent can splice the token into the active field.
 */
export default function PlaceholderBar({ onInsert, disabled = false }) {
  const { t } = useTranslation()
  return (
    <div
      className={`bg-gradient-to-br from-gray-50 via-white to-yellow-50/30 border border-gray-200 rounded-xl p-4 mb-4 transition-opacity duration-200 hover:border-yellow-400 transition-colors duration-200 ${disabled ? 'opacity-50' : ''}`}
      aria-disabled={disabled}
    >
      <FieldLabel className="mb-4">
        <span className="inline-flex items-center gap-2">
          {disabled
            ? t('administratorMenu.tabs.notificationRules.form.clickToEdit')
            : t('administratorMenu.tabs.notificationRules.form.clickToInsert')}
          <MousePointerClick
            size={25}
            strokeWidth={2.25}
            className="text-slate-600 flex-shrink-0 anim-click-tap"
          />
        </span>
      </FieldLabel>
      <div className="flex flex-col gap-3">
        {PLACEHOLDERS.map(({ group, items }) => (
          <div key={group} className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-3">
            <span className="!text-[12px] sm:!text-[14px] !font-extrabold !text-amber-600 !uppercase !tracking-[0.12em] sm:mt-2 sm:w-24 flex-shrink-0">
              {group}
            </span>
            <div className="flex flex-wrap gap-2">
              {items.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => !disabled && onInsert(key)}
                  disabled={disabled}
                  title={disabled
                    ? t('administratorMenu.tabs.notificationRules.template.enableEditToInsert')
                    : t('administratorMenu.tabs.notificationRules.template.insertX', { label })}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg !text-[13px] !text-slate-800 !font-semibold transition-all duration-150 ${disabled
                    ? 'cursor-not-allowed'
                    : 'hover:border-yellow-400 hover:bg-yellow-50 hover:!text-yellow-800 hover:shadow-md hover:shadow-yellow-200/70 hover:-translate-y-0.5 hover:scale-[1.04] active:translate-y-0 active:scale-95 cursor-pointer will-change-transform'
                    }`}
                >
                  <Icon size={14} className="text-gray-500 flex-shrink-0" strokeWidth={2.25} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
