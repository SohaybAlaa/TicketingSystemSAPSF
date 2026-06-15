import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  COND_TYPES, PERSONAS, genCondId,
  CONDITION_TYPE, WHEN_TYPE, COND_OP, TIME_UNIT, PERSONA_EXTRA,
} from '@data/notificationRules'

// ─── Constants ────────

// Generates a random notification ID like 'NTF-472'
const newId = () => 'NTF-' + String(Math.floor(Math.random() * 900) + 100)

// Ensures condition type strings match the exact casing in COND_TYPES
// (prevents bugs when loading saved data that may have different casing)
const normalizeConds = (conds) => {
  if (!conds?.length) return []
  return conds.map(c => {
    const found = COND_TYPES.find(ct => ct.value.toLowerCase() === (c.type || '').toLowerCase())
    return { ...c, type: found?.value || c.type }
  })
}

// Returns a fresh blank condition with sensible defaults
const makeCond = () => ({
  id: genCondId(),
  type: CONDITION_TYPE.STATUS,
  subtype: 'Any status change',
  whenType: WHEN_TYPE.IMMEDIATE,
  amount: 1,
  unit: TIME_UNIT.HOURS,
  ageBreached: false,
  op: COND_OP.AND,
})

// ─── Hook ─────────────

/**
 * Encapsulates all notification-form state, validation, save flow and
 * email-editor refs/helpers. Returns everything `InlineForm` needs to render.
 */
export default function useNotificationForm({ initial, onSave, onValuesChange, stepRefs }) {
  const { t } = useTranslation()

  // ── Core values ─────
  const [name, setName] = useState(initial?.name || '')          // step 1
  const [id] = useState(initial?.id || newId())                  // auto-generated, never changes
  const [status, setStatus] = useState(initial?.status ?? true)  // active by default
  const [conds, setConds] = useState(() => normalizeConds(initial?.conds))      // step 2
  const [personas, setPersonas] = useState(() => new Set(initial?.personas || []))  // step 3 — Set for O(1) lookup
  const [extraSelections, setExtraSelections] = useState(initial?.extraSelections || {})  // step 3 extra dropdowns
  const [subject, setSubject] = useState(initial?.subject || '') // step 4
  const [body, setBody] = useState(initial?.body || '')          // step 4

  // ── Email editor state ──────────────────────────────────────────────────────
  const [isEditingEmail, setIsEditingEmail] = useState(false) // toggles preview vs edit mode in step 4
  const subjectRef = useRef(null)       // ref to the subject <input> for cursor-based placeholder insertion
  const bodyRef = useRef(null)          // ref to the body <textarea> for auto-grow + cursor-based insertion
  const activeFieldRef = useRef('body') // tracks which field was last focused so insertPlaceholder knows where to insert

  // ── Touched state (for showing errors after blur/save) ─────────────────────
  // Errors are hidden until the user has interacted with a field, or clicked Save
  const [touched, setTouched] = useState({
    name: false, personas: false, subject: false, body: false, extras: {},
  })
  const markTouched = useCallback(
    (field) => setTouched(prev => ({ ...prev, [field]: true })), // called onBlur for each field
    []
  )
  const markExtraTouched = useCallback(
    (extra) => setTouched(prev => ({ ...prev, extras: { ...prev.extras, [extra]: true } })), // for extra dropdowns
    []
  )

  // Bubble values up so the parent row's header preview reflects live changes
  useEffect(() => {
    if (!onValuesChange) return
    onValuesChange({ name, conds, personas: [...personas], subject, body })
  }, [name, conds, personas, subject, body, onValuesChange])

  // Auto-grow body textarea height to fit its content so it never shows a scrollbar
  useEffect(() => {
    const el = bodyRef.current
    if (!el || !isEditingEmail) return
    el.style.height = 'auto'              // reset first so it can shrink
    el.style.height = el.scrollHeight + 'px'
  }, [body, isEditingEmail])

  // ── Condition helpers ────────
  const addCond = useCallback(() => {
    setConds(prev => [...prev, makeCond()]) // append a blank condition
  }, [])
  const updateCond = useCallback(
    (cid, next) => setConds(prev => prev.map(c => c.id === cid ? next : c)), // replace one condition by id
    []
  )
  const removeCond = useCallback(
    (cid) => setConds(prev => prev.filter(c => c.id !== cid)), // remove one condition by id
    []
  )

  // ── Persona helpers 
  const togglePersona = useCallback((pid) => {
    markTouched('personas') // mark touched so validation error shows if none selected
    setPersonas(prev => {
      const next = new Set(prev)
      next.has(pid) ? next.delete(pid) : next.add(pid) // toggle: add if missing, remove if present
      return next
    })
  }, [markTouched])

  // Updates the selected values for one extra dropdown (e.g. specific employees for "Other employee")
  const updateExtra = useCallback((extra, values) => {
    setExtraSelections(prev => ({ ...prev, [extra]: values }))
  }, [])

  // Personas that have an extra dropdown AND are currently selected (controls which dropdowns are visible)
  const extraPersonas = useMemo(
    () => PERSONAS.filter(p => p.extra && personas.has(p.id)),
    [personas]
  )

  // ── Email helpers ──
  // Inserts a placeholder token (e.g. {{ticket_id}}) at the cursor position in subject or body
  const insertPlaceholder = useCallback((ph) => {
    if (activeFieldRef.current === 'subject' && subjectRef.current) {
      const el = subjectRef.current
      const s = el.selectionStart ?? subject.length  // cursor start position
      const e = el.selectionEnd ?? s                 // cursor end (may differ if text is selected)
      const next = subject.substring(0, s) + ph + subject.substring(e)
      setSubject(next)
      setTimeout(() => { el.selectionStart = el.selectionEnd = s + ph.length; el.focus() }, 0) // move cursor after token
    } else if (bodyRef.current) {
      const el = bodyRef.current
      const s = el.selectionStart ?? body.length
      const e = el.selectionEnd ?? s
      const next = body.substring(0, s) + ph + body.substring(e)
      setBody(next)
      setTimeout(() => { el.selectionStart = el.selectionEnd = s + ph.length; el.focus() }, 0)
    }
  }, [subject, body])

  // Fills subject + body from the first condition's built-in template (asks for confirmation if fields have content)
  const applyTemplate = useCallback(() => {
    if (!conds.length) return
    const hasContent = subject.trim() || body.trim()
    if (hasContent && !window.confirm(t('administratorMenu.tabs.notificationRules.template.applyTemplateConfirm'))) return
    const def = COND_TYPES.find(ct => ct.value === conds[0].type)
    if (def?.template) { setSubject(def.template.subject); setBody(def.template.body) }
  }, [conds, subject, body, t])

  // ── Validation ─────
  // errors is recomputed whenever values change — empty string = valid, non-empty = error message
  const errors = useMemo(() => ({
    name: !name.trim()
      ? t('administratorMenu.tabs.notificationRules.validation.nameRequired') : '',
    personas: personas.size === 0
      ? t('administratorMenu.tabs.notificationRules.validation.recipientsRequired') : '',
    subject: !subject.trim()
      ? t('administratorMenu.tabs.notificationRules.validation.subjectRequired') : '',
    body: !body.trim()
      ? t('administratorMenu.tabs.notificationRules.validation.bodyRequired') : '',
    extras: Object.fromEntries(
      extraPersonas
        .filter(p => !(extraSelections[p.extra]?.length))
        .map(p => [
          p.extra,
          p.extra === PERSONA_EXTRA.GROUP
            ? t('administratorMenu.tabs.notificationRules.alerts.selectTeam')
            : t('administratorMenu.tabs.notificationRules.alerts.selectAgent'),
        ])
    ),
  }), [name, personas, subject, body, extraPersonas, extraSelections, t])

  // true if any field has an error — used to decide whether handleSave should proceed
  const hasErrors = !!(
    errors.name || errors.personas || errors.subject || errors.body ||
    Object.keys(errors.extras).length
  )

  // Returns the error message for a field only if the user has already interacted with it
  const showErr = useCallback(
    (field) => touched[field] && errors[field],
    [touched, errors]
  )
  // Same as showErr but for extra persona dropdowns
  const showExtraErr = useCallback(
    (extra) => touched.extras?.[extra] && errors.extras?.[extra],
    [touched, errors]
  )

  // ── Save flow ──────
  const handleSave = useCallback(() => {
    if (hasErrors) {
      // Mark every field as touched so all error messages become visible at once
      setTouched({
        name: true, personas: true, subject: true, body: true,
        extras: Object.fromEntries(extraPersonas.map(p => [p.extra, true])),
      })
      // Scroll to and focus the first failing section
      if (errors.name) {
        stepRefs?.step1?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        document.getElementById(`f-name-${id}`)?.focus()
        return
      }
      if (Object.keys(errors.extras).length || errors.personas) {
        stepRefs?.step3?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      if (errors.subject || errors.body) {
        stepRefs?.step4?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setIsEditingEmail(true) // auto-switch to edit mode so the user can fix the fields
        return
      }
      return
    }
    onSave({
      id,
      name: name.trim(),
      status,
      conds,
      personas: [...personas],
      extraSelections,
      subject,
      body,
    })
  }, [hasErrors, errors, extraPersonas, stepRefs, id, name, status, conds, personas, extraSelections, subject, body, onSave])

  return {
    // identity
    id,
    // values + setters
    name, setName,
    status, setStatus,
    conds, addCond, updateCond, removeCond,
    personas, togglePersona,
    extraSelections, updateExtra,
    extraPersonas,
    subject, setSubject,
    body, setBody,
    // email editor
    isEditingEmail, setIsEditingEmail,
    subjectRef, bodyRef, activeFieldRef,
    insertPlaceholder, applyTemplate,
    // validation
    touched, markTouched, markExtraTouched,
    errors, showErr, showExtraErr, hasErrors,
    // save
    handleSave,
    // derived
    personaCount: personas.size,
    condCount: conds.length,
  }
}
