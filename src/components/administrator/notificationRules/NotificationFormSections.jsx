import React, { useMemo } from 'react'
import { Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import useNotificationForm from './useNotificationForm'
import Section1Info from './Section1Info'
import Section2Conditions from './Section2Conditions'
import Section3Recipients from './Section3Recipients'
import Section4Email from './Section4Email'

// Renders all 4 form sections + save/cancel footer.
// Receives step refs and active step state from NotificationFormShell (for scroll tracking).
// All form logic (field state, validation, save) lives in useNotificationForm via `f`.
export default function NotificationFormSections({
  initial,       // null = new rule, object = editing existing rule
  onSave,        // called with the final rule object when the user clicks Save
  onCancel,      // called when the user clicks Cancel
  isExpanded,    // whether the form is currently visible
  activeStep,    // currently highlighted step in the StepBar
  setActiveStep, // updates the StepBar highlight as the user scrolls
  completedSteps,// set of step numbers that have been filled
  stepRef1,      // DOM ref for Section 1 (used for scroll-based step highlighting)
  stepRef2,      // DOM ref for Section 2
  stepRef3,      // DOM ref for Section 3
  stepRef4,      // DOM ref for Section 4
  onValuesChange,// optional: notifies parent of form value changes (for header preview)
}) {
  const { t } = useTranslation()

  // Group the 4 step refs into one object so useNotificationForm can scroll to them on validation errors
  const stepRefs = useMemo(
    () => ({ step1: stepRef1, step2: stepRef2, step3: stepRef3, step4: stepRef4 }),
    [stepRef1, stepRef2, stepRef3, stepRef4]
  )

  // `f` exposes all form state + handlers (field values, errors, handleSave, etc.)
  const f = useNotificationForm({ initial, onSave, onValuesChange, stepRefs })

  return (
    <div
      className="border-t-2 border-yellow-200 bg-gradient-to-br from-yellow-50/40 to-amber-50/20 px-6 pb-10 pt-5"
      style={{ overflowX: 'hidden' }}
    >
      {/* Each section receives `f` (form state/handlers) and its own ref + step setter */}
      <Section1Info f={f} stepRef={stepRef1} setActiveStep={setActiveStep} />
      <Section2Conditions f={f} stepRef={stepRef2} setActiveStep={setActiveStep} />
      <Section3Recipients f={f} stepRef={stepRef3} setActiveStep={setActiveStep} />
      <Section4Email f={f} stepRef={stepRef4} setActiveStep={setActiveStep} />

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-3">
        <button onClick={f.handleSave} className="action-button flex items-center gap-2">
          <Save size={16} /> {t('administratorMenu.tabs.notificationRules.actions.save')}
        </button>
        <button
          onClick={onCancel}
          className="cancel-button !w-30 !h-13 !px-0 !flex-none !flex items-center justify-center"
          title={t('administratorMenu.tabs.notificationRules.actions.cancel')}
        >
          {t('administratorMenu.tabs.notificationRules.actions.cancel')}
        </button>
      </div>
    </div>
  )
}
