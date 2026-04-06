import React, { useState, useEffect } from 'react'  
import { useTranslation } from 'react-i18next'           
import Modal from './Modal'                                  
import { ClipboardList, AlertCircle } from 'lucide-react'    
import Tag, { getValueColor } from '@components/ui/Tag'     
import { ENTITY_OPTIONS, CATEGORY_OPTIONS, SUBCATEGORY_OPTIONS, 
    EMPLOYEE_CLASS_OPTIONS, PRIORITY_OPTIONS, GROUP_OPTIONS } from '@data/mockData' 
import DaisySelect from '@components/ui/DaisySelect'      

// TicketingRuleFormModal: Modal for creating/editing ticketing rules with validation and duplicate detection
export default function TicketingRuleFormModal({ isOpen, onClose, onSave, initial = null, existingRules = [] }) {
  const { t, i18n } = useTranslation()   // t = translate function, i18n = language instance
  const isRTL = i18n.language === 'ar'   // true when Arabic is active → flips layout to right-to-left
  const isEdit = !!initial               // if initial data is passed → we're editing, otherwise creating

  // Empty form state template
  const empty = { entity: '', supportCategory: '', subcategory: '', employeeClass: '', priority: '', group: '', agent: '' } // blank form template

  // Form state and validation errors
  const [form,   setForm]   = useState(empty)  // current form values
  const [errors, setErrors] = useState({})     // validation error messages keyed by field name

  // Initialize form with edit data or empty state when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm(initial
        ? { entity: initial.entity ?? '', supportCategory: initial.supportCategory ?? '', subcategory: initial.subcategory ?? '', employeeClass: initial.employeeClass ?? '', priority: initial.priority ?? '', group: initial.group ?? '', agent: initial.agent ?? '' } // populate from existing rule
        : empty          // reset to blank for new rule
      )
      setErrors({})      // clear any previous validation errors
    }
  }, [isOpen, initial])  // re-run when modal opens or initial data changes

  // Update form field and clear its error if present
  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))                        // update only the changed field, keep others
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined })) // clear error for this field as user fixes it
  }

  // Validate form: check required fields and detect duplicate rules
  const validate = () => {
    const next = {}                                              // collect all errors here
    if (!form.entity)          next.entity          = 'Entity is required'           // required field check
    if (!form.supportCategory) next.supportCategory = 'Support category is required' // required field check
    if (!form.subcategory)     next.subcategory     = 'Subcategory is required'      // required field check
    if (!form.priority)        next.priority        = 'Priority is required'         // required field check

    // Check for duplicate rule (same Entity + Support Category + Subcategory)
    const isDuplicate = existingRules.some(r =>
      r.id !== initial?.id &&                    // skip the rule being edited (so it doesn't match itself)
      r.entity === form.entity &&                // same entity
      r.supportCategory === form.supportCategory && // same category
      r.subcategory === form.subcategory         // same subcategory → duplicate
    )
    if (isDuplicate) next.duplicateRule = 'A rule with this Entity + Support Category + Subcategory already exists'

    setErrors(next)                              // store errors in state → triggers re-render with error UI
    return Object.keys(next).length === 0        // return true if no errors (form is valid)
  }

  // Validate and save form, then close modal
  const handleSave = () => {
    if (!validate()) return  // stop if validation fails → errors shown to user
    onSave(form)             // pass form data to parent component
    onClose()                // close the modal
  }

  // Helper to render DaisySelect with consistent props
  const sel = (key, options, hasError, translationPrefix = null) => ( // shorthand to avoid repeating DaisySelect props
    <DaisySelect
      value={form[key]}                     // current selected value from form state
      options={options}                     // array of available choices
      onChange={val => set(key, val)}       // update form state when user picks an option
      hasError={hasError}                   // red border if validation failed
      translationPrefix={translationPrefix} // i18n namespace for translating option labels
      t={t}                                 // translation function
      isRTL={isRTL}                         // flip layout for Arabic
    />
  )

  // Reusable label styling with RTL support
  const labelStyle = `block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ${isRTL ? 'text-right' : 'text-left'}` // shared label style for all fields
  // Error message component with icon
  const ErrMsg = ({ msg }) => (              // small inline component to show a red error message with an icon
    <div className={`flex items-center gap-1.5 mt-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
      <AlertCircle size={13} style={{ color: '#ef4444', flexShrink: 0 }} />  {/* red warning icon */}
      <span className="text-xs font-medium" style={{ color: '#ef4444' }}>{msg}</span>  {/* error text */}
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? t('modals.ticketingRuleForm.editTitle', 'Edit Ticketing Rule') : t('modals.ticketingRuleForm.newTitle', 'New Ticketing Rule')}  // dynamic title based on mode
      icon={
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fde047, #facc15)', boxShadow: '0 4px 6px -1px rgba(251,191,36,.4)' }}>
          <ClipboardList size={24} color="#9d6806" />
        </div>
      }
      subtitle={isEdit ? t('modals.ticketingRuleForm.editSubtitle', 'Update the details of this ticketing rule') : t('modals.ticketingRuleForm.newSubtitle', 'Fill in the details to create a new ticketing rule')} // dynamic subtitle
    >
      <div dir={isRTL ? 'rtl' : 'ltr'} className="flex flex-col gap-4">  {/* dir attribute flips entire form layout for Arabic */}

        {/* Entity field - required, shows duplicate error */}
        <div>
          <label className={labelStyle}>{t('modals.ticketingRuleForm.entity', 'Entity')} <span className="text-red-400">*</span></label>
          {sel('entity', ENTITY_OPTIONS, !!errors.entity || !!errors.duplicateRule)}  {/* show error state if entity missing OR duplicate rule */}
          {errors.entity && <ErrMsg msg={errors.entity} />}
        </div>

        {/* Support Category + Subcategory fields - required, side-by-side layout, shows duplicate error */}
        <div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelStyle}>{t('modals.ticketingRuleForm.supportCategory', 'Support Category')} <span className="text-red-400">*</span></label>
              {sel('supportCategory', CATEGORY_OPTIONS, !!errors.supportCategory || !!errors.duplicateRule)}
              {errors.supportCategory && <ErrMsg msg={errors.supportCategory} />}
            </div>
            <div>
              <label className={labelStyle}>{t('modals.ticketingRuleForm.subcategory', 'Subcategory')} <span className="text-red-400">*</span></label>
              {sel('subcategory', SUBCATEGORY_OPTIONS, !!errors.subcategory || !!errors.duplicateRule)}
              {errors.subcategory && <ErrMsg msg={errors.subcategory} />}
            </div>
          </div>
          {errors.duplicateRule && <ErrMsg msg={errors.duplicateRule} />}  {/* duplicate error shown below both fields */}
        </div>

        {/* Group field - optional */}
        <div>
          <label className={labelStyle}>{t('modals.ticketingRuleForm.group', 'Group')}</label>
          {sel('group', GROUP_OPTIONS, !!errors.group)}
          {errors.group && <ErrMsg msg={errors.group} />}
        </div>

        {/* Agent field - optional text input */}
        <div>
          <label className={labelStyle}>{t('modals.ticketingRuleForm.agent', 'Agent')}</label>
          <input
            value={form.agent}
            onChange={e => set('agent', e.target.value)}
            placeholder={t('modals.ticketingRuleForm.agentPlaceholder', 'Agent name (optional)')}
            className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition-all ${isRTL ? 'text-right' : 'text-left'}`} // styled text input with yellow focus ring
          />
        </div>

        {/* Priority field - required, button-based selector with colored tags */}
        <div>
          <label className={labelStyle}>{t('modals.ticketingRuleForm.priority', 'Priority')} <span className="text-red-400">*</span></label>
          <div className={`flex flex-wrap gap-2 mt-1 ${isRTL ? 'flex-row-reverse justify-end' : 'justify-start'}`}>  {/* priority buttons row — reversed in RTL */}
            {PRIORITY_OPTIONS.map(p => {
              const selected = form.priority === p   // is this the currently selected priority?
              const color = getValueColor(p)           // get the color for this priority level (e.g. red for Critical)
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => set('priority', p)}
                  className="rounded-full transition-all duration-150 focus:outline-none"
                  style={selected ? { boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${color}` } : { opacity: 0.5 }} // selected = colored ring, unselected = faded
                >
                  <Tag type="priority" value={p} showIcon t={t} isRTL={isRTL} />
                </button>
              )
            })}
          </div>
          {errors.priority && <ErrMsg msg={errors.priority} />}
        </div>

        {/* Employee Class field - optional, uses dropUp positioning to avoid overflow */}
        <div>
          <label className={labelStyle}>{t('modals.ticketingRuleForm.employeeClass', 'Employee Class')}</label>
          {/* 4th arg = translation prefix for option labels */}
          {sel('employeeClass', EMPLOYEE_CLASS_OPTIONS, !!errors.employeeClass, 'administratorMenu.tabs.ticketingRules.employeeClasses')} 
          {errors.employeeClass && <ErrMsg msg={errors.employeeClass} />}
        </div>

        {/* Modal action buttons - Cancel and Save/Create */}
        <div className={`flex gap-3 mt-2 ${isRTL ? 'flex-row-reverse' : 'justify-end'}`}>  {/* action buttons — reversed order in RTL */}
          <button onClick={onClose} className="modal-cancel-button">
            {t('modals.ticketingRuleForm.cancel', 'Cancel')}
          </button>
          <button onClick={handleSave} className="modal-save-button">
            {isEdit ? t('modals.ticketingRuleForm.saveChanges', 'Save Changes') : t('modals.ticketingRuleForm.create', 'Create Rule')}
          </button>
        </div>
      </div>
    </Modal>
  )
}
