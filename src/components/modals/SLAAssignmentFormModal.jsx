import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from './Modal'
import { Settings, AlertCircle } from 'lucide-react'
import DaisySelect from '@components/ui/DaisySelect'
import Tag, { getValueColor } from '@components/ui/Tag'
import { ENTITY_OPTIONS, CATEGORY_OPTIONS, SUBCATEGORY_OPTIONS, EMPLOYEE_CLASS_OPTIONS, SLA_ID_OPTIONS } from '@data/mockData'

// Modal for creating or editing an SLA assignment rule
export default function SLAAssignmentFormModal({ isOpen, onClose, onSave, initial = null, existingConfigs = [], slaIdOptions = SLA_ID_OPTIONS }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  // If `initial` is provided, we're editing an existing record
  const isEdit = !!initial

  // Default blank form state
  const empty = { slaId: '', entity: '', supportCategory: '', subcategory: '', employeeClass: '' }

  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})

  // Reset form whenever the modal opens — populate with existing data if editing
  useEffect(() => {
    if (isOpen) {
      setForm(initial
        ? {
            slaId: initial.slaId ?? '',
            entity: initial.entity ?? '',
            supportCategory: initial.supportCategory ?? '',
            subcategory: initial.subcategory ?? '',
            employeeClass: initial.employeeClass ?? '',
          }
        : empty
      )
      setErrors({})
    }
  }, [isOpen, initial])

  // Update a single form field and clear its error
  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }))
    if (errors.duplicate) setErrors(e => ({ ...e, duplicate: undefined }))
  }

  // Returns true if all fields are valid, otherwise populates errors
  const validate = () => {
    const next = {}
    if (!form.slaId) next.slaId = t('modals.slaAssignmentForm.errors.slaIdRequired', 'SLA ID is required')
    if (!form.entity) next.entity = t('modals.slaAssignmentForm.errors.entityRequired', 'Entity is required')
    if (!form.supportCategory) next.supportCategory = t('modals.slaAssignmentForm.errors.categoryRequired', 'Support Category is required')
    if (!form.subcategory) next.subcategory = t('modals.slaAssignmentForm.errors.subcategoryRequired', 'Subcategory is required')
    if (!form.employeeClass) next.employeeClass = t('modals.slaAssignmentForm.errors.employeeClassRequired', 'Employee Class is required')

    // Check for an existing config with the same Entity + Category + Employee Class
    const isDuplicate = existingConfigs.some(r =>
      r.id !== initial?.id &&
      r.entity === form.entity &&
      r.supportCategory === form.supportCategory &&
      r.employeeClass === form.employeeClass
    )
    if (isDuplicate) next.duplicate = t('modals.slaAssignmentForm.errors.duplicate', 'An assignment with this Entity + Category + Employee Class already exists')

    setErrors(next)
    return Object.keys(next).length === 0
  }

  // Validate then call the parent's onSave callback
  const handleSave = () => {
    if (!validate()) return
    onSave(form)
    onClose()
  }

  // Shared label style — flips text alignment in RTL
  const labelStyle = `block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ${isRTL ? 'text-right' : 'text-left'}`

  // Inline error message shown below a field
  const ErrMsg = ({ msg }) => (
    <div className={`flex items-center gap-1.5 mt-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
      <AlertCircle size={13} style={{ color: '#ef4444', flexShrink: 0 }} />
      <span className="text-xs font-medium" style={{ color: '#ef4444' }}>{msg}</span>
    </div>
  )

  // Helper to render a DaisySelect bound to a form key
  const sel = (key, options, hasError, translationPrefix = null) => (
    <DaisySelect
      value={form[key]}
      options={options}
      onChange={val => set(key, val)}
      hasError={hasError}
      translationPrefix={translationPrefix}
      t={t}
      isRTL={isRTL}
    />
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit
        ? t('modals.slaAssignmentForm.editTitle', 'Edit SLA Assignment')
        : t('modals.slaAssignmentForm.newTitle', 'New SLA Assignment')
      }
      icon={
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fde047, #facc15)', boxShadow: '0 4px 6px -1px rgba(251,191,36,.4)' }}>
          <Settings size={24} color="#9d6806" />
        </div>
      }
      subtitle={isEdit
        ? t('modals.slaAssignmentForm.editSubtitle', 'Update the details of this SLA assignment')
        : t('modals.slaAssignmentForm.newSubtitle', 'Fill in the details to create a new SLA assignment')
      }
    >
      <div dir={isRTL ? 'rtl' : 'ltr'} className="flex flex-col gap-4">

        {/* SLA ID */}
        <div>
          <label className={labelStyle}>
            {t('modals.slaAssignmentForm.slaId', 'SLA ID')} <span className="text-red-400">*</span>
          </label>
          {sel('slaId', slaIdOptions, !!errors.slaId)}
          {errors.slaId && <ErrMsg msg={errors.slaId} />}
        </div>

        {/* Entity */}
        <div>
          <label className={labelStyle}>
            {t('modals.slaAssignmentForm.entity', 'Entity')} <span className="text-red-400">*</span>
          </label>
          {sel('entity', ENTITY_OPTIONS, !!errors.entity || !!errors.duplicate)}
          {errors.entity && <ErrMsg msg={errors.entity} />}
        </div>

        {/* Support Category + Subcategory — side by side */}
        <div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelStyle}>
                {t('modals.slaAssignmentForm.supportCategory', 'Support Category')} <span className="text-red-400">*</span>
              </label>
              {sel('supportCategory', CATEGORY_OPTIONS, !!errors.supportCategory || !!errors.duplicate)}
              {errors.supportCategory && <ErrMsg msg={errors.supportCategory} />}
            </div>
            <div>
              <label className={labelStyle}>
                {t('modals.slaAssignmentForm.subcategory', 'Subcategory')} <span className="text-red-400">*</span>
              </label>
              {sel('subcategory', SUBCATEGORY_OPTIONS, !!errors.subcategory || !!errors.duplicate)}
              {errors.subcategory && <ErrMsg msg={errors.subcategory} />}
            </div>
          </div>
        </div>

        {/* Employee Class */}
        <div>
          <label className={labelStyle}>
            {t('modals.slaAssignmentForm.employeeClass', 'Employee Class')} <span className="text-red-400">*</span>
          </label>
          <div className={`flex flex-wrap gap-2 mt-1 ${isRTL ? 'flex-row-reverse justify-end' : 'justify-start'}`}>
            {EMPLOYEE_CLASS_OPTIONS.map(opt => {
              const selected = form.employeeClass === opt
              // Get the tag's accent color for the selection ring
              const color = getValueColor(opt)
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => set('employeeClass', opt)}
                  className="rounded-full transition-all duration-150 focus:outline-none hover:scale-110"
                  style={selected ? { boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${color}` } : { opacity: 0.5 }}
                  onMouseEnter={(e) => {
                    if (!selected) e.currentTarget.style.opacity = '0.8'
                  }}
                  onMouseLeave={(e) => {
                    if (!selected) e.currentTarget.style.opacity = '0.5'
                  }}
                >
                  <Tag type="employeeClass" value={opt} showIcon t={t} isRTL={isRTL} />
                </button>
              )
            })}
          </div>
          {(errors.employeeClass || errors.duplicate) && <ErrMsg msg={errors.employeeClass || errors.duplicate} />}
        </div>

        {/* Duplicate error */}
        {errors.duplicate && <ErrMsg msg={errors.duplicate} />}

        {/* Action buttons */}
        <div className={`flex gap-3 mt-2 ${isRTL ? 'flex-row-reverse' : 'justify-end'}`}>
          <button onClick={onClose} className="modal-cancel-button">
            {t('modals.slaAssignmentForm.cancel', 'Cancel')}
          </button>
          <button onClick={handleSave} className="modal-save-button">
            {isEdit
              ? t('modals.slaAssignmentForm.saveChanges', 'Save Changes')
              : t('modals.slaAssignmentForm.create', 'Create Assignment')
            }
          </button>
        </div>
      </div>
    </Modal>
  )
}