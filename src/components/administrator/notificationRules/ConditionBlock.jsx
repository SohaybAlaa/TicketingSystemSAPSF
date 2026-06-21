import React from 'react'
import { AlertOctagon, CheckCircle2, X, Timer } from 'lucide-react'
import {
  COND_TYPES,
  CONDITION_TYPE, WHEN_TYPE, COND_OPS, TIME_UNITS, AGE_OPTION, AGE_OPTIONS,
} from '@data/notificationRules'
import FieldLabel from '@components/ui/FieldLabel'
import DaisySelect from '@components/ui/DaisySelect'
import { useTranslation } from 'react-i18next'

export default function ConditionBlock({ cond, index, total, onChange, onRemove }) {
  const { t: i18nT, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const def = COND_TYPES.find(ct => ct.value === cond.type) || COND_TYPES[0]
  const Icon = def.icon
  
  // Custom translation function that returns condition type labels
  const getConditionLabel = (value) => {
    return i18nT(`administratorMenu.tabs.notificationRules.conditions.types.${value}`) || value
  }
  
  // Custom translation function for subtypes
  const getSubtypeLabel = (value) => {
    return i18nT(`administratorMenu.tabs.notificationRules.conditions.subtypes.${value}`) || value
  }

  // Per-option color classes for Status / Priority subtype dropdowns,
  // matching the ticket details page palette.
  const STATUS_OPT_COLORS = {
    'New':                 'hover:bg-purple-400 hover:!text-white',
    'Under process':       'hover:bg-blue-400 hover:!text-white',
    'Pending employee':    'hover:bg-orange-400 hover:!text-white',
    'Pending third party': 'hover:bg-orange-300 hover:!text-white',
    'Completed':           'hover:bg-green-400 hover:!text-white',
    'Closed':              'hover:bg-gray-400 hover:!text-white',
  }
  const PRIORITY_OPT_COLORS = {
    'Low':      'hover:bg-green-400 hover:!text-white',
    'Medium':   'hover:bg-blue-400 hover:!text-white',
    'High':     'hover:bg-orange-400 hover:!text-white',
    'Critical': 'hover:bg-red-500 hover:!text-white',
  }
  const subtypeOptionClass =
    cond.type === CONDITION_TYPE.STATUS   ? (opt) => STATUS_OPT_COLORS[opt]   || ''
  : cond.type === CONDITION_TYPE.PRIORITY ? (opt) => PRIORITY_OPT_COLORS[opt] || ''
  : undefined

  return (
    <div className="relative">
      {index > 0 && (
        <div className="relative my-3">
          {/* Hairline behind */}
          <div className="absolute inset-0 flex items-center pointer-events-none">
            <div className="w-full border-t border-gray-300" />
          </div>
          {/* Centered AND/OR pill */}
          <div className="relative flex justify-center">
            <div className="bg-white px-2">
              <div className="flex items-center gap-0.5 bg-gray-50 border border-gray-200 rounded-full p-0.5">
                {COND_OPS.map(op => {
                  const active = cond.op === op
                  return (
                    <button
                      key={op}
                      onClick={() => onChange({ ...cond, op })}
                      className={`px-3 py-0.5 rounded-full !text-[11px] !font-extrabold !uppercase !tracking-wider transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${active
                        ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 !text-yellow-900 anim-andor-glow'
                        : '!text-gray-500 hover:!text-yellow-700 hover:bg-yellow-50'
                        }`}
                    >
                      {op}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative bg-white border border-gray-200 rounded-xl px-3 sm:px-4 py-3 hover:border-yellow-300 hover:shadow-sm transition-all duration-200">
        {/* Remove button — top-right corner on mobile/tablet */}
        {total > 1 && (
          <button
            onClick={onRemove}
            className="lg:hidden absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 hover:scale-110 active:scale-95 border border-transparent hover:border-red-400 transition-all duration-200 cursor-pointer z-10"
          >
            <X size={13} strokeWidth={2.5} />
          </button>
        )}
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3">

          {/* Row 1 (mobile): icon + Type dropdown */}
          {/* Row 1 (tablet): icon + Type + Subtype */}
          {/* Row 1 (desktop): icon + Type + Subtype + When + remove — all in one flex */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Icon */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ring-1 ring-inset ring-white/40"
              style={{
                background: `linear-gradient(135deg, ${def.color}22, ${def.color}44)`,
                boxShadow: `0 2px 10px -2px ${def.color}55, inset 0 1px 0 rgba(255,255,255,0.45)`,
              }}
            >
              <Icon size={16} style={{ color: def.color }} strokeWidth={2.25} />
            </div>

            {/* Type dropdown — always visible in row 1 */}
            <div className="flex flex-col gap-0.5 min-w-0 flex-1 lg:w-44 lg:flex-none">
              <FieldLabel size="sm">{i18nT('administratorMenu.tabs.notificationRules.conditions.conditionType')}</FieldLabel>
              <DaisySelect
                value={cond.type}
                options={COND_TYPES.map(ct => ct.value)}
                onChange={value => {
                  const found = COND_TYPES.find(ct => ct.value === value)
                  onChange({ ...cond, type: value, whenType: found?.whenType || WHEN_TYPE.IMMEDIATE, subtype: found?.subtypes[0] || '' })
                }}
                translationPrefix="administratorMenu.tabs.notificationRules.conditions.types"
                t={i18nT}
                isRTL={isRTL}
              />
            </div>

            {/* Subtype — visible in row 1 on tablet+, hidden on mobile */}
            <div className="hidden md:flex flex-col gap-0.5 min-w-0 flex-1 lg:w-44 lg:flex-none">
              <FieldLabel size="sm">{i18nT('administratorMenu.tabs.notificationRules.form.step2')}</FieldLabel>
              <DaisySelect
                value={cond.subtype}
                options={def.subtypes}
                onChange={value => onChange({ ...cond, subtype: value })}
                translationPrefix="administratorMenu.tabs.notificationRules.conditions.subtypes"
                t={i18nT}
                isRTL={isRTL}
                getOptionClass={subtypeOptionClass}
              />
            </div>

          </div>

          {/* Row 2 (mobile only): Subtype dropdown */}
          <div className="md:hidden flex flex-col gap-0.5 min-w-0 w-full">
            <FieldLabel size="sm">{i18nT('administratorMenu.tabs.notificationRules.form.step2')}</FieldLabel>
            <DaisySelect
              value={cond.subtype}
              options={def.subtypes}
              onChange={value => onChange({ ...cond, subtype: value })}
              translationPrefix="administratorMenu.tabs.notificationRules.conditions.subtypes"
              t={i18nT}
              isRTL={isRTL}
              getOptionClass={subtypeOptionClass}
            />
          </div>

          {/* Row 3 (mobile) / Row 2 (tablet) / inline (desktop): When to send + remove */}
          <div className="flex items-end gap-2 lg:flex-1 min-w-0">
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <FieldLabel size="sm">{i18nT('administratorMenu.tabs.notificationRules.conditions.whenToSend')}</FieldLabel>
          {(() => {
            const instantMode = cond.type === CONDITION_TYPE.SLA ? WHEN_TYPE.BREACH : WHEN_TYPE.IMMEDIATE
            const isInstant = cond.whenType !== WHEN_TYPE.TIME
            const isBreach = instantMode === WHEN_TYPE.BREACH
            const InstantIcon = isBreach ? AlertOctagon : CheckCircle2
            const otherMode = isInstant ? WHEN_TYPE.TIME : instantMode
            const switchTitle = isInstant
              ? i18nT('administratorMenu.tabs.notificationRules.conditions.tooltips.switchToScheduled')
              : (isBreach
                ? i18nT('administratorMenu.tabs.notificationRules.conditions.tooltips.switchToBreach')
                : i18nT('administratorMenu.tabs.notificationRules.conditions.tooltips.switchToImmediate'))

            const tone = isInstant
              ? (isBreach
                ? 'border-red-200 bg-gradient-to-br from-red-50 to-rose-50 shadow-red-100'
                : 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-green-100')
              : 'border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-amber-100'

            const instantBtnLabel = isBreach
              ? i18nT('administratorMenu.tabs.notificationRules.conditions.onBreach')
              : i18nT('administratorMenu.tabs.notificationRules.conditions.instant')

            return (
              <div className={`w-full px-2 py-2 rounded-xl border shadow-sm transition-colors duration-200 ${tone} [&_.btn]:min-h-0 [&_.btn]:!h-7 [&_.btn]:!py-0`}>
                {/* Row 1: toggle + number + time unit (always visible) */}
                <div className="flex items-center gap-1.5">
                  {/* Segmented pill toggle */}
                  <div className="flex items-center gap-0.5 bg-white/70 border border-gray-200 rounded-full p-0.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => onChange({ ...cond, whenType: instantMode })}
                      title={isBreach
                        ? i18nT('administratorMenu.tabs.notificationRules.conditions.tooltips.atMomentOfBreach')
                        : i18nT('administratorMenu.tabs.notificationRules.conditions.tooltips.immediatelyOnChange')}
                      className={`w-7 h-6 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${isInstant
                        ? (isBreach
                          ? 'bg-gradient-to-r from-red-400 via-rose-400 to-red-500 !text-white shadow-sm shadow-red-300/60'
                          : 'bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 !text-white shadow-sm shadow-green-300/60')
                        : '!text-gray-500 hover:!text-gray-700'
                        }`}
                    >
                      <InstantIcon size={13} strokeWidth={2.75} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange({ ...cond, whenType: WHEN_TYPE.TIME })}
                      title={i18nT('administratorMenu.tabs.notificationRules.conditions.tooltips.scheduled')}
                      className={`w-7 h-6 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${!isInstant
                        ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 !text-yellow-900 shadow-sm shadow-amber-300/60'
                        : '!text-gray-500 hover:!text-gray-700'
                        }`}
                    >
                      <Timer size={13} strokeWidth={2.75} />
                    </button>
                  </div>

                  {/* Instant: show label. Scheduled: show number + time unit + age (inline on desktop) */}
                  {isInstant ? (
                    <span className={`!text-[12px] !font-bold truncate ${isBreach ? '!text-red-700' : '!text-green-700'}`}>
                      {isBreach ? i18nT('administratorMenu.tabs.notificationRules.conditions.slaBreached') : i18nT('administratorMenu.tabs.notificationRules.conditions.immediate')}
                    </span>
                  ) : (
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <input
                        type="number"
                        min="1"
                        value={cond.amount || 1}
                        onChange={e => onChange({ ...cond, amount: e.target.value })}
                        className="w-12 h-7 bg-white border border-amber-200 rounded-md px-1 py-0 text-[12px] font-bold text-center text-slate-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-300/40 transition-all flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <DaisySelect
                          value={cond.unit || TIME_UNITS[1]}
                          options={TIME_UNITS}
                          onChange={value => onChange({ ...cond, unit: value })}
                          translationPrefix="administratorMenu.tabs.notificationRules.conditions"
                          t={i18nT}
                          isRTL={isRTL}
                        />
                      </div>
                      {/* Age breached inline on desktop */}
                      <div className="hidden lg:block flex-1 min-w-0">
                        <DaisySelect
                          value={cond.ageBreached ? AGE_OPTION.BREACHED : AGE_OPTION.NORMAL}
                          options={AGE_OPTIONS}
                          onChange={value => onChange({ ...cond, ageBreached: value === AGE_OPTION.BREACHED })}
                          translationPrefix="administratorMenu.tabs.notificationRules.conditions.ageOptions"
                          t={i18nT}
                          isRTL={isRTL}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Row 2: age breached — mobile/tablet only, scheduled mode only */}
                {!isInstant && (
                  <div className="lg:hidden mt-2 min-w-0">
                    <DaisySelect
                      value={cond.ageBreached ? AGE_OPTION.BREACHED : AGE_OPTION.NORMAL}
                      options={AGE_OPTIONS}
                      onChange={value => onChange({ ...cond, ageBreached: value === AGE_OPTION.BREACHED })}
                      translationPrefix="administratorMenu.tabs.notificationRules.conditions.ageOptions"
                      t={i18nT}
                      isRTL={isRTL}
                    />
                  </div>
                )}
              </div>
            )
          })()}
            </div>

          </div>

          {/* Remove button — end of row on desktop only */}
          {total > 1 && (
            <button
              onClick={onRemove}
              className="hidden lg:flex w-7 h-7 flex-shrink-0 items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 hover:rounded-full hover:scale-110 active:scale-95 border border-transparent hover:border-red-400 transition-all duration-200 cursor-pointer self-center"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          )}

        </div>
      </div>
    </div>
  )
}
