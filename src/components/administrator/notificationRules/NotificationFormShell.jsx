import React, { useState, useRef, useMemo, useCallback, useLayoutEffect } from 'react'
import ExpandPanel from './ExpandPanel'
import StepBar from './StepBar'
import NotificationFormSections from './NotificationFormSections'

/**
 * Shared form container for both new and existing notifications.
 * Handles all step navigation, form state, scroll tracking, and layout.
 * 
 * Props:
 *   initial: null (new) or rule object (edit)
 *   onSave: (rule) => void
 *   onCancel: () => void
 *   onValuesChange: (values) => void (optional, for parent tracking)
 *   header: ReactNode (optional, rendered above the form)
 *   open: boolean (for new-mode wrapper; ignored in edit mode)
 *   wrapperClassName: string (optional, for new-mode dashed border)
 */
export default function NotificationFormShell({
  initial,
  onSave,
  onCancel,
  onValuesChange,
  header,
  open,
  wrapperClassName = '',
}) {
  const isNew = initial === null
  const isExpanded = open // Controlled by parent in both new and edit mode

  const [activeStep, setActiveStep] = useState(1)
  const [formValues, setFormValues] = useState(
    initial ? {
      name: initial.name || '',
      conds: initial.conds || [],
      personas: initial.personas || [],
      subject: initial.subject || '',
      body: initial.body || '',
    } : {
      name: '',
      conds: [],
      personas: [],
      subject: '',
      body: '',
    }
  )

  const stepRef1 = useRef(null)
  const stepRef2 = useRef(null)
  const stepRef3 = useRef(null)
  const stepRef4 = useRef(null)
  const stepRefBar = useRef(null)
  const clickLockRef = useRef(null) // locked step during click-driven smooth scroll
  const clickLockTimeoutRef = useRef(null)

  // Compute which steps are "complete" based on form values
  const completedSteps = useMemo(() => {
    const steps = []
    if (formValues.name.trim()) steps.push(1)
    if (formValues.conds.length > 0) steps.push(2)
    if (formValues.personas.length > 0) steps.push(3)
    if (formValues.subject.trim() && formValues.body.trim()) steps.push(4)
    return steps
  }, [formValues])

  // Scroll to a specific step + immediately set active state and lock visualization
  const handleStepClick = useCallback((step) => {
    setActiveStep(step)

    // Lock the StepBar visualization to this step until the smooth scroll settles
    clickLockRef.current = step
    if (clickLockTimeoutRef.current) clearTimeout(clickLockTimeoutRef.current)
    clickLockTimeoutRef.current = setTimeout(() => {
      clickLockRef.current = null
      clickLockTimeoutRef.current = null
    }, 700)

    const refs = [stepRef1, stepRef2, stepRef3, stepRef4]
    const target = refs[step - 1]?.current
    if (!target) return

    const main = document.querySelector('main')
    if (!main) return

    // Account for the sticky StepBar so the section lands below it, not under it
    const stickyHeight = stepRefBar.current?.getBoundingClientRect().height ?? 0
    const targetTop = target.getBoundingClientRect().top
    const mainTop = main.getBoundingClientRect().top
    const offset = targetTop - mainTop - stickyHeight - 16 // 16px breathing gap

    main.scrollBy({ top: offset, behavior: 'smooth' })
  }, [])

  // Bubble values up so parent can track live progress
  const handleValuesChange = useCallback((values) => {
    setFormValues(values)
    if (onValuesChange) onValuesChange(values)
  }, [onValuesChange])

  // Scroll tracking — updates activeStep based on which section's body is currently in view
  useLayoutEffect(() => {
    if (!isExpanded) return

    const scrollContainer = document.querySelector('main')
    if (!scrollContainer) return

    const refs = [stepRef1, stepRef2, stepRef3, stepRef4]
    let raf = 0

    const compute = () => {
      // While a click is in flight, keep the bar pinned to the clicked target
      if (clickLockRef.current !== null) {
        setActiveStep(clickLockRef.current)
        return
      }

      const containerRect = scrollContainer.getBoundingClientRect()
      const stickyHeight = stepRefBar.current?.getBoundingClientRect().height ?? 0
      // Anchor sits just below the sticky StepBar, with a small breathing gap
      const anchorY = containerRect.top + stickyHeight + 24

      let activeIdx = 0
      for (let i = 0; i < refs.length; i++) {
        const el = refs[i].current
        if (!el) continue
        const rect = el.getBoundingClientRect()
        // Section is active when its top has scrolled past the anchor
        if (rect.top <= anchorY) {
          activeIdx = i
        } else {
          break
        }
      }
      setActiveStep(activeIdx + 1)
    }

    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => { raf = 0; compute() })
    }

    compute()
    scrollContainer.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      scrollContainer.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [isExpanded])

  const formContent = (
    <>
      {/* Sticky StepBar — outside ExpandPanel so overflow:hidden cannot clip it */}
      {isExpanded && (
        <div
          ref={stepRefBar}
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            borderRadius: '16px 16px 0 0',
            transition: 'background-color 450ms ease, border-color 450ms ease, box-shadow 450ms ease',
          }}
        >
          <StepBar
            activeStep={activeStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
          />
        </div>
      )}

      {/* Expanded form */}
      <ExpandPanel open={isExpanded}>
        <NotificationFormSections
          initial={initial}
          onSave={onSave}
          onCancel={onCancel}
          isExpanded={isExpanded}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          completedSteps={completedSteps}
          stepRef1={stepRef1}
          stepRef2={stepRef2}
          stepRef3={stepRef3}
          stepRef4={stepRef4}
          onValuesChange={handleValuesChange}
        />
      </ExpandPanel>
    </>
  )

  // Edit mode: render as a full row with header + form (wrapperClassName wraps both)
  if (!isNew) {
    return (
      <div className={wrapperClassName}>
        {header}
        {formContent}
      </div>
    )
  }

  // New mode: render in a dashed border wrapper
  return (
    <div className={wrapperClassName}>
      {formContent}
    </div>
  )
}
