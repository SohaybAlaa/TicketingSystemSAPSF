// Displays a single existing notification rule as a collapsible row.
// The header shows the rule name, subject, condition/persona pills, status toggle, and delete button.
// Clicking the row expands it to reveal the full edit form (NotificationFormShell).
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BellRing, BellOff, Mail, Trash2, Filter, Users, ChevronDown } from 'lucide-react'
import { COND_TYPES, PERSONAS } from '@data/notificationRules'
import renderWithPlaceholders from './renderWithPlaceholders'
import StatusToggle from './StatusToggle'
import NotificationFormShell from './NotificationFormShell'

export default function NotificationRow({ n, isExpanded, onToggle, onSave, onDelete, onToggleStatus }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const condCount = n.conds?.length || 0
  const personaCount = n.personas?.length || 0

  // Compute condition and persona pills for the header — show stacked icon avatars + total
  const MAX_AVATARS = 5

  const conditionPill = useMemo(() => {
    // Unique condition defs by type, up to MAX_AVATARS
    const uniqueDefs = []
    const seen = new Set()
    for (const c of (n.conds || [])) {
      if (seen.has(c.type)) continue
      seen.add(c.type)
      const def = COND_TYPES.find(ct => ct.value === c.type)
      if (def) uniqueDefs.push(def)
      if (uniqueDefs.length >= MAX_AVATARS) break
    }
    const empty = condCount === 0
    const extra = condCount - uniqueDefs.length
    return (
      <div className={`inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full transition-all duration-300 hover:scale-105 ${empty
        ? 'bg-gray-50/80 border border-gray-200'
        : 'bg-blue-50/70 border border-blue-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm'
      }`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${empty ? 'bg-gray-200' : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm shadow-blue-300/50'}`}>
          <Filter size={12} className={empty ? 'text-gray-400' : 'text-white'} strokeWidth={2.75} />
        </div>
        <span className={`!text-[11px] !font-bold !uppercase !tracking-wider ${empty ? '!text-gray-400' : '!text-blue-700'}`}>
          {t('administratorMenu.tabs.notificationRules.conditions.title')}
        </span>
        {!empty && (
          <>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse -space-x-1.5 space-x-reverse' : '-space-x-1.5'}`}>
              {uniqueDefs.map((def, i) => {
                const Icon = def.icon
                return (
                  <div
                    key={def.value}
                    className="w-6 h-6 rounded-full flex items-center justify-center ring-[1.5px] ring-white shadow-sm transition-transform duration-200 hover:scale-125 hover:!z-50 hover:shadow-md"
                    style={{ backgroundColor: def.color + '22', border: `1.5px solid ${def.color}`, zIndex: uniqueDefs.length - i }}
                    title={t(`administratorMenu.tabs.notificationRules.conditions.types.${def.value}`) || def.label}
                  >
                    <Icon size={12} style={{ color: def.color }} strokeWidth={2.5} />
                  </div>
                )
              })}
              {extra > 0 && (
                <div className="w-6 h-6 rounded-full flex items-center justify-center ring-[1.5px] ring-white bg-white border border-blue-300 !text-[10px] !font-extrabold !text-blue-700 shadow-sm">
                  +{extra}
                </div>
              )}
            </div>
            <span className="!text-[12px] !text-blue-800 !font-extrabold tabular-nums">{condCount}</span>
          </>
        )}
      </div>
    )
  }, [condCount, n.conds, t, isRTL])

  const personaPill = useMemo(() => {
    const uniqueDefs = []
    for (const pid of (n.personas || [])) {
      const def = PERSONAS.find(p => p.id === pid)
      if (def) uniqueDefs.push(def)
      if (uniqueDefs.length >= MAX_AVATARS) break
    }
    const empty = personaCount === 0
    const extra = personaCount - uniqueDefs.length
    return (
      <div className={`inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full transition-all duration-300 hover:scale-105 ${empty
        ? 'bg-gray-50/80 border border-gray-200'
        : 'bg-amber-50/70 border border-amber-200 hover:border-amber-400 hover:bg-amber-50 hover:shadow-sm'
      }`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${empty ? 'bg-gray-200' : 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-sm shadow-yellow-300/50'}`}>
          <Users size={12} className={empty ? 'text-gray-400' : 'text-white'} strokeWidth={2.75} />
        </div>
        <span className={`!text-[11px] !font-bold !uppercase !tracking-wider ${empty ? '!text-gray-400' : '!text-amber-700'}`}>
          {t('administratorMenu.tabs.notificationRules.recipients.title')}
        </span>
        {!empty && (
          <>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse -space-x-1.5 space-x-reverse' : '-space-x-1.5'}`}>
              {uniqueDefs.map((def, i) => {
                const Icon = def.icon
                return (
                  <div
                    key={def.id}
                    className="w-6 h-6 rounded-full flex items-center justify-center ring-[1.5px] ring-white shadow-sm bg-gradient-to-br from-yellow-200 to-amber-300 border border-yellow-500 transition-transform duration-200 hover:scale-125 hover:!z-50 hover:shadow-md"
                    style={{ zIndex: uniqueDefs.length - i }}
                    title={t(`administratorMenu.tabs.notificationRules.recipients.personas.${def.id}`) || def.label}
                  >
                    <Icon size={12} className="text-yellow-900" strokeWidth={2.5} />
                  </div>
                )
              })}
              {extra > 0 && (
                <div className="w-6 h-6 rounded-full flex items-center justify-center ring-[1.5px] ring-white bg-white border border-amber-400 !text-[10px] !font-extrabold !text-amber-700 shadow-sm">
                  +{extra}
                </div>
              )}
            </div>
            <span className="!text-[12px] !text-amber-800 !font-extrabold tabular-nums">{personaCount}</span>
          </>
        )}
      </div>
    )
  }, [personaCount, n.personas, t, isRTL])

  // Row header component — rendered above the form shell
  const isActive = !!n.status
  const accentColor = isActive ? '#22c55e' : '#ef4444' // green-500 / red-500
  const header = (
    <div
      className={`${isRTL ? 'bg-gradient-to-bl' : 'bg-gradient-to-br'} from-white via-amber-50/40 to-yellow-50 group-hover/row:to-yellow-100 ${isExpanded ? 'rounded-t-2xl' : 'rounded-2xl'} transition-colors duration-300 overflow-hidden cursor-pointer relative`}
      onClick={onToggle}
    >
      {/* Vertical accent strip — emerald / red glow, absolute on the leading edge */}
      <div
        className={`absolute top-2 bottom-2 w-1 rounded-full pointer-events-none ${isRTL ? 'right-2' : 'left-2'}`}
        style={{
          backgroundColor: isActive ? '#10b981' : '#ef4444',
          boxShadow: isActive
            ? '0 0 8px rgba(16, 185, 129, 0.45)'
            : '0 0 8px rgba(239, 68, 68, 0.40)',
          transition: 'background-color 500ms ease, box-shadow 500ms ease',
        }}
      />

      <div className="flex items-center gap-3 px-6 py-4">
        {/* Status bell — yellow gradient container, fills when expanded */}
        <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border transition-[background,border-color,box-shadow] duration-300 ${isExpanded
          ? 'bg-gradient-to-br from-yellow-300 to-amber-400 border-yellow-400 shadow-lg shadow-yellow-300/50'
          : 'bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-200 group-hover/row:from-yellow-100 group-hover/row:to-amber-200 group-hover/row:border-yellow-300 group-hover/row:shadow-md group-hover/row:shadow-yellow-200/50'
        }`}>
          {isActive
            ? <BellRing size={22} className={`icon-shake ${isExpanded ? 'text-white drop-shadow-sm' : 'text-yellow-600'}`} strokeWidth={2.5} />
            : <BellOff size={22} className={`icon-shake ${isExpanded ? 'text-white drop-shadow-sm' : 'text-yellow-600'}`} strokeWidth={2.5} />
          }
        </div>

        {/* Left side: info */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="!text-slate-800 !text-[17px] !leading-tight flex-shrink-0">
              <span className="!font-extrabold">#</span><span className="!font-bold">{n.id}</span>
            </span>
            <span className="!text-gray-300 !font-bold !text-2xl !leading-none flex-shrink-0">·</span>
            <h3 dir="auto" className="!font-semibold !text-slate-800 !text-[17px] !leading-tight truncate">
              {n.name || t('administratorMenu.tabs.notificationRules.untitled')}
            </h3>
          </div>

          {n.subject ? (
            <div className="flex items-center gap-2 min-w-0">
              <Mail size={14} className="text-amber-500 flex-shrink-0" />
              <div dir="auto" className="!text-[14px] !text-slate-600 !font-medium leading-snug truncate">
                {renderWithPlaceholders(n.subject)}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <Mail size={14} className="text-gray-300 flex-shrink-0" />
              <span className="!text-[13px] !text-gray-400 !font-medium italic">{t('administratorMenu.tabs.notificationRules.noSubjectSet')}</span>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {conditionPill}
            {personaPill}
          </div>
        </div>

        {/* Right side: status toggle + delete + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div onClick={e => e.stopPropagation()}>
            <StatusToggle active={n.status} onChange={onToggleStatus} />
          </div>
          <div onClick={e => e.stopPropagation()}>
            <button
              onClick={() => onDelete?.(n.id, n.name)}
              title={t('administratorMenu.tabs.notificationRules.actions.delete')}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 hover:border-red-400 hover:text-red-700 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
            >
              <Trash2 size={18} />
            </button>
          </div>
          <div className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 ${isExpanded
              ? 'bg-yellow-100 border-yellow-600 text-yellow-800'
              : 'bg-yellow-50 border-yellow-400 text-yellow-600 group-hover:bg-yellow-100 group-hover:border-yellow-400 group-hover:text-yellow-700'
            }`}>
            <ChevronDown
              size={20}
              strokeWidth={2.5}
              style={{
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 300ms ease',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <NotificationFormShell
      initial={n}
      onSave={onSave}
      onCancel={onToggle}
      header={header}
      open={isExpanded}
      wrapperClassName={`group/row border-2 border-yellow-100 rounded-2xl shadow-sm hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-200/60 transition-all duration-300 ${isExpanded ? 'shadow-md' : ''}`}
    />
  )
}
