// Step 2 of the notification form — trigger conditions.
// Lets the user add one or more conditions (e.g. status = New, priority = High) joined by AND/OR.
// Each condition is a ConditionBlock; a ConditionSummary preview is shown above the list.
import React from 'react'
import { Plus, Filter } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import CardHeader from './CardHeader'
import ConditionSummary from './ConditionSummary'
import FieldLabel from '@components/ui/FieldLabel'
import Pill from '@components/ui/Pill'
import ConditionBlock from './ConditionBlock'

// f = form state/handlers from useNotificationForm
// stepRef = DOM ref so the parent can track scroll position for the StepBar
// setActiveStep = highlights this step in the StepBar when the section is focused
export default function Section2Conditions({ f, stepRef, setActiveStep }) {
  const { t } = useTranslation()

  return (
    <div
      ref={stepRef}
      className="bg-white border-2 border-gray-200 rounded-2xl mb-5 shadow-md hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-200/50 transition-[border-color,box-shadow] duration-200 overflow-hidden scroll-mt-4"
      onFocus={() => setActiveStep(2)}
    >
      <CardHeader
        num="2"
        label={t('administratorMenu.tabs.notificationRules.form.step2')}
        subtitle={t('administratorMenu.tabs.notificationRules.conditions.subtitle')}
        badge={
          f.condCount > 0 && (
            <Pill color="blue" variant="solid" icon={Filter}>
              {f.condCount} {t('administratorMenu.tabs.notificationRules.form.step2')}
            </Pill>
          )
        }
      />
      <div className="p-4 sm:p-6">
        {/* Live summary of all conditions — only shown when at least one exists */}
        {f.condCount > 0 && (
          <div className="mb-5">
            <FieldLabel size="sm" className="mb-2">{t('administratorMenu.tabs.notificationRules.conditions.summary')}</FieldLabel>
            <ConditionSummary conds={f.conds} />
          </div>
        )}

        {/* List of condition blocks — each block has a type, operator, and value */}
        <div className="flex flex-col gap-2 mb-3">
          {f.conds.map((c, i) => (
            <ConditionBlock
              key={c.id}
              cond={c}
              index={i}
              total={f.conds.length} // used to show/hide AND/OR operator between blocks
              onChange={next => f.updateCond(c.id, next)}
              onRemove={() => f.removeCond(c.id)}
            />
          ))}
        </div>

        {/* Add condition button — rotates the + icon on hover */}
        <button
          onClick={f.addCond}
          className="group w-full mt-4 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-yellow-300 rounded-xl !text-[13px] !font-bold !text-yellow-700 !uppercase tracking-wider hover:bg-yellow-50 hover:border-yellow-500 hover:shadow-sm hover:shadow-yellow-200 transition-all duration-200 cursor-pointer"
        >
          <Plus
            size={16}
            strokeWidth={2.75}
            className="transition-transform duration-300 group-hover:rotate-90 group-hover:text-yellow-800"
          />
          <span className="group-hover:!text-yellow-800 transition-colors">{t('administratorMenu.tabs.notificationRules.conditions.addCondition')}</span>
        </button>
      </div>
    </div>
  )
}
