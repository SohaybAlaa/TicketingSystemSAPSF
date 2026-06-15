// Step 3 of the notification form — recipients.
// The user picks who receives the notification via PersonaCard tiles (e.g. Employee, Assigned Agent).
// Some personas (Other employee, Other agent, etc.) reveal a MultiSelectChips dropdown for specific people.
import React from 'react'
import { Users, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  PERSONAS, PERSONA_EXTRA,
  GROUP_OPTS, AGENT_OPTS, EMPLOYEE_OPTS, MANAGER_OPTS,
} from '@data/notificationRules'
import CardHeader from './CardHeader'
import FieldLabel from '@components/ui/FieldLabel'
import Pill from '@components/ui/Pill'
import MultiSelectChips from '@components/ui/MultiSelectChips'
import PersonaCard from './PersonaCard'

const EXTRA_OPTIONS = {
  [PERSONA_EXTRA.GROUP]: GROUP_OPTS,
  [PERSONA_EXTRA.AGENT]: AGENT_OPTS,
  [PERSONA_EXTRA.MANAGER]: MANAGER_OPTS,
  [PERSONA_EXTRA.EMPLOYEE]: EMPLOYEE_OPTS,
}

// f = form state/handlers from useNotificationForm.js
// stepRef = DOM ref so the parent can track scroll position for the StepBar
// setActiveStep = highlights this step in the StepBar when the section is focused
export default function Section3Recipients({ f, stepRef, setActiveStep }) {
  const { t } = useTranslation()

  return (
    <div
      ref={stepRef}
      className="bg-white border-2 border-gray-200 rounded-2xl mb-5 shadow-md hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-200/50 transition-[border-color,box-shadow] duration-200 overflow-hidden scroll-mt-4"
      onFocus={() => setActiveStep(3)}
    >
      <CardHeader
        num="3"
        label={t('administratorMenu.tabs.notificationRules.form.step3')}
        subtitle={t('administratorMenu.tabs.notificationRules.recipients.subtitle')}
        badge={
          f.personaCount > 0 && (
            <Pill color="amber" variant="solid" icon={Users}>
              {f.personaCount} {t('administratorMenu.tabs.notificationRules.form.step3')}
            </Pill>
          )
        }
      />
      <div className="p-6">
        {/* Persona card grid — red outline on the whole grid if validation fails */}
        <div className="mb-4">
          <FieldLabel size="sm" className="mb-3">
            {t('administratorMenu.tabs.notificationRules.recipients.title')} <span className="!text-red-500 !font-bold">*</span>
          </FieldLabel>
          <div className={`grid grid-cols-4 gap-3 ${f.showErr('personas') ? 'p-3 -m-3 rounded-2xl border-2 border-red-300 bg-red-50/40' : ''}`}>
            {PERSONAS.map(p => (
              <PersonaCard
                key={p.id}
                persona={p}
                selected={f.personas.has(p.id)} // highlighted if this persona is selected
                onToggle={() => f.togglePersona(p.id)}
              />
            ))}
          </div>
          {f.showErr('personas') && (
            <span className="inline-flex items-center gap-1 !text-[11.5px] !font-semibold !text-red-600 mt-4 ml-1">
              <AlertCircle size={12} strokeWidth={2.5} /> {f.errors.personas}
            </span>
          )}
        </div>

        {/* Extra dropdowns — appear only when a persona with an extra type is selected (e.g. Other employee) */}
        {f.extraPersonas.length > 0 && (
          <div className="mt-5 pt-5 border-t border-dashed border-gray-200">
            <FieldLabel size="sm" className="mb-3">{t('administratorMenu.tabs.notificationRules.recipients.title')}</FieldLabel>
            <div
              className="grid gap-3 p-4 rounded-2xl bg-gradient-to-br from-amber-50/60 via-yellow-50/40 to-transparent border border-amber-100"
              style={{ gridTemplateColumns: `repeat(${f.extraPersonas.length}, 1fr)` }}
            >
              {f.extraPersonas.map(p => {
                const opts = EXTRA_OPTIONS[p.extra] ?? EMPLOYEE_OPTS // fallback to employee options
                const selectedValues = f.extraSelections[p.extra] || []
                const kindKey = p.extra === PERSONA_EXTRA.GROUP ? 'team' : p.extra
                const kindLabel = t(`administratorMenu.tabs.notificationRules.recipients.kinds.${kindKey}`)
                const hasExtraErr = f.showExtraErr(p.extra)
                return (
                  <div key={p.id} className="flex flex-col gap-1.5">
                    <FieldLabel size="sm" icon={p.icon}>
                      {t('administratorMenu.tabs.notificationRules.recipients.selectRecipients')} <span className="!text-red-500 !font-bold">*</span>
                    </FieldLabel>
                    {/* Red ring on error, validates on blur */}
                    <div
                      className={hasExtraErr ? 'rounded-xl ring-2 ring-red-300 ring-offset-1 ring-offset-amber-50/60' : ''}
                      onBlur={() => f.markExtraTouched(p.extra)}
                    >
                      <MultiSelectChips
                        options={opts}
                        value={selectedValues}
                        onChange={values => { f.markExtraTouched(p.extra); f.updateExtra(p.extra, values) }}
                        placeholder={t('administratorMenu.tabs.notificationRules.recipients.addPlaceholder', { kind: kindLabel })}
                        theme="amber"
                      />
                    </div>
                    {hasExtraErr && (
                      <span className="inline-flex items-center gap-1 !text-[11.5px] !font-semibold !text-red-600 mt-0.5">
                        <AlertCircle size={12} strokeWidth={2.5} /> {f.errors.extras[p.extra]}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
