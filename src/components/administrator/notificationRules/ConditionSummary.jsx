import React from 'react'
import { useTranslation } from 'react-i18next'
import { COND_TYPES } from '@data/notificationRules'

/**
 * Compact one-line summary of a list of conditions, separated by AND/OR pills.
 */
export default function ConditionSummary({ conds }) {
  const { t } = useTranslation()
  if (!conds || conds.length === 0) return null

  return (
    <div className="flex items-center flex-wrap gap-1 px-3 py-2 bg-blue-50/60 border border-blue-100 rounded-xl">
      {conds.map((c, i) => {
        const def = COND_TYPES.find(ct => ct.value === c.type) || COND_TYPES[0]
        const Icon = def.icon
        const translatedLabel = t(`administratorMenu.tabs.notificationRules.conditions.types.${c.type}`) || def.label
        return (
          <React.Fragment key={c.id ?? i}>
            {i > 0 && (
              <span
                className="!text-[10px] !font-extrabold !uppercase !tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 !text-yellow-900 shadow-sm shadow-amber-200"
              >
                {c.op}
              </span>
            )}
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg !text-[12px] !font-semibold"
              style={{
                backgroundColor: def.color + '15',
                color: def.color,
                border: `1px solid ${def.color}30`,
              }}
            >
              <Icon size={12} style={{ color: def.color, flexShrink: 0 }} />
              {translatedLabel}
            </span>
          </React.Fragment>
        )
      })}
    </div>
  )
}
