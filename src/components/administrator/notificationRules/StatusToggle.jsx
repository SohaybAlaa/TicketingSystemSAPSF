import React from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Large green/red rounded pill that shows ACTIVE / INACTIVE on a notification
 * rule. Acts as a switch with animated thumb and slide-in text.
 */
export default function StatusToggle({ active, onChange }) {
  const { t } = useTranslation()
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={onChange}
      title={t('administratorMenu.tabs.notificationRules.actions.toggle')}
      className={`relative inline-flex h-10 w-29 items-center rounded-full cursor-pointer focus:outline-none hover:scale-105 active:scale-[0.98] transition-[background,box-shadow,transform] duration-500 ${active
          ? 'bg-gradient-to-r from-green-400 via-emerald-500 to-emerald-600'
          : 'bg-gradient-to-r from-rose-400 via-red-500 to-red-600'
        }`}
      style={{
        boxShadow: active
          ? '0 1px 3px rgba(16,185,129,0.25), 0 0 12px rgba(16,185,129,0.20), inset 0 -2px 4px rgba(0,0,0,0.08)'
          : '0 1px 3px rgba(255,44,44,0.25), 0 0 12px rgba(255,44,44,0.20), inset 0 -2px 4px rgba(0,0,0,0.08)',
      }}
    >
      <span
        className={`absolute left-3.5 top-1/2 -translate-y-1/2 !text-[11px] !font-extrabold !uppercase !tracking-[0.15em] !text-white pointer-events-none transition-all duration-500 ${active ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3'
          }`}
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.25)' }}
      >
        {t('administratorMenu.tabs.notificationRules.form.active')}
      </span>
      <span
        className={`absolute right-3.5 top-1/2 -translate-y-1/2 !text-[11px] !font-extrabold !uppercase !tracking-[0.15em] !text-white pointer-events-none transition-all duration-500 ${!active ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-3'
          }`}
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.25)' }}
      >
        {t('administratorMenu.tabs.notificationRules.form.inactive')}
      </span>
      <span
        className="absolute top-1 left-1 h-8 w-8 rounded-full bg-white"
        style={{
          transform: active ? 'translateX(76px)' : 'translateX(0)',
          transition: 'transform 900ms cubic-bezier(0.65, 0, 0.35, 1)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.20), 0 0 0 1px rgba(0,0,0,0.04), inset 0 -1px 2px rgba(0,0,0,0.06)',
        }}
      />
    </button>
  )
}
