import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from './Modal'
import { Timer, AlertCircle, Hash } from 'lucide-react'
import Tag, { getValueColor } from '@components/ui/Tag'
import DaisySelect from '@components/ui/DaisySelect'
import { PRIORITY_OPTIONS } from '@data/mockData'

// Static option lists for tag-button selectors
const SLA_TYPE_OPTIONS = ['Initial Review', 'Completion Due']
const TIME_TYPE_OPTIONS = ['Working Time', 'Calendar Time', 'Custom Time']
const RESPONSE_TIME_UNITS = ['Hours', 'Days']

// Modal for creating or editing a single SLA rule
export default function SLARuleFormModal({ isOpen, onClose, onSave, initial = null, existingRules = [] }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  // If `initial` is provided, we're in edit mode
  const isEdit = !!initial

  // Default blank form state
  const empty = { slaId: '', slaName: '', slaType: '', priority: '', responseTimeValue: '', responseTimeUnit: 'Hours', timeType: '' }

  // Derive unique SLA ID options from existing rules for the group dropdown
  const slaIdOptions = useMemo(() => {
    const unique = [...new Set(existingRules.map(r => r.slaId))].sort()
    return unique
  }, [existingRules])

  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  // When true, the user wants to create a brand-new SLA group instead of joining an existing one
  const [createNewGroup, setCreateNewGroup] = useState(false)

  // Reset form on open; parse "4 Hours" / "2 Days" string back into separate value + unit fields
  useEffect(() => {
    if (isOpen) {
      // Parse existing responseTime like "4 Hours" or "2 Days" into value + unit
      let rtVal = '', rtUnit = 'Hours'
      if (initial?.responseTime) {
        const parts = initial.responseTime.match(/^(\d+)\s*(Hours?|Days?)$/i)
        if (parts) {
          rtVal = parts[1]
          rtUnit = parts[2].replace(/s?$/i, 's') // normalize to "Hours" or "Days"
          if (rtUnit === 'Hours') rtUnit = 'Hours'
          else if (rtUnit === 'Days') rtUnit = 'Days'
        } else {
          rtVal = initial.responseTime
        }
      }
      setForm(initial
        ? {
            slaId: initial.slaId ?? '',
            slaName: initial.slaName ?? '',
            slaType: initial.slaType ?? '',
            priority: initial.priority ?? '',
            responseTimeValue: rtVal,
            responseTimeUnit: rtUnit,
            timeType: initial.timeType ?? '',
          }
        : empty
      )
      setErrors({})
      setCreateNewGroup(false)
    }
  }, [isOpen, initial])

  // Update a single form field and clear its validation error
  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }))
  }

  // Returns true if all required fields pass; otherwise populates errors state
  const validate = () => {
    const next = {}
    if (!form.slaName.trim()) next.slaName = t('modals.slaRuleForm.errors.slaNameRequired', 'SLA Name is required')
    if (!form.slaType) next.slaType = t('modals.slaRuleForm.errors.slaTypeRequired', 'SLA Type is required')
    if (!form.priority) next.priority = t('modals.slaRuleForm.errors.priorityRequired', 'Priority is required')
    if (!form.responseTimeValue || isNaN(form.responseTimeValue) || Number(form.responseTimeValue) <= 0) next.responseTime = t('modals.slaRuleForm.errors.responseTimeRequired', 'Enter a valid response time')
    if (!form.timeType) next.timeType = t('modals.slaRuleForm.errors.timeTypeRequired', 'Time Type is required')


    setErrors(next)
    return Object.keys(next).length === 0
  }

  // Validate, normalize responseTime to a string (e.g. "4 Hours"), then call onSave
  const handleSave = () => {
    if (!validate()) return
    const num = Number(form.responseTimeValue)
    const unit = form.responseTimeUnit === 'Days' ? (num === 1 ? 'Day' : 'Days') : (num === 1 ? 'Hour' : 'Hours')
    const { responseTimeValue, responseTimeUnit, ...rest } = form
    onSave({ ...rest, slaId: form.slaId || '', responseTime: `${num} ${unit}` })
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="560px"
      title={isEdit
        ? t('modals.slaRuleForm.editTitle', 'Edit SLA Rule')
        : t('modals.slaRuleForm.newTitle', 'New SLA Rule')
      }
      icon={
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fde047, #facc15)', boxShadow: '0 4px 6px -1px rgba(251,191,36,.4)' }}>
          <Timer size={24} color="#9d6806" />
        </div>
      }
      subtitle={isEdit
        ? t('modals.slaRuleForm.editSubtitle', 'Update the details of this SLA rule')
        : t('modals.slaRuleForm.newSubtitle', 'Fill in the details to create a new SLA rule')
      }
    >
      <div dir={isRTL ? 'rtl' : 'ltr'} className="flex flex-col gap-4">

        {/* SLA ID Group — hidden in edit mode since the group cannot change */}
        {!isEdit && (
          <div>
            <label className={labelStyle}>
              {t('modals.slaRuleForm.slaIdGroup', 'SLA ID Group')}
            </label>
            
            {/* Toggle buttons */}
            <div className={`flex gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                type="button"
                onClick={() => {
                  setCreateNewGroup(false)
                }}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  !createNewGroup
                    ? 'bg-yellow-50 border-2 border-yellow-400 text-yellow-700 shadow-sm'
                    : 'bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100'
                }`}
              >
                {t('modals.slaRuleForm.selectExisting', 'Select Existing Group')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreateNewGroup(true)
                  set('slaId', '')
                }}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  createNewGroup
                    ? 'bg-yellow-50 border-2 border-yellow-400 text-yellow-700 shadow-sm'
                    : 'bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100'
                }`}
              >
                {t('modals.slaRuleForm.createNewGroup', 'Create New Group')}
              </button>
            </div>

            {/* Dropdown - only enabled when selecting existing */}
            <DaisySelect
              value={form.slaId}
              options={slaIdOptions}
              onChange={val => set('slaId', val)}
              placeholder={createNewGroup 
                ? t('modals.slaRuleForm.newGroupPlaceholder', 'Auto-generated ID') 
                : t('modals.slaRuleForm.selectGroupPlaceholder', 'Select an SLA group...')
              }
              t={t}
              isRTL={isRTL}
              disabled={createNewGroup}
            />
            
            <p className={`!text-sm mt-1.5 italic ${isRTL ? 'text-right' : 'text-left'}`} style={{ color: '#a16207' }}>
              {createNewGroup
                ? t('modals.slaRuleForm.newGroupHint', 'A new SLA group will be created with an auto-generated ID.')
                : t('modals.slaRuleForm.existingGroupHint', 'Add this rule to an existing SLA group.')
              }
            </p>
          </div>
        )}

        {/* SLA Name — text input */}
        <div>
          <label className={labelStyle}>
            {t('modals.slaRuleForm.slaName', 'SLA Name')} <span className="text-red-400">*</span>
          </label>
          <input
            value={form.slaName}
            onChange={e => set('slaName', e.target.value)}
            placeholder={t('modals.slaRuleForm.slaNamePlaceholder', 'e.g. Critical Ticket Initial Review')}
            className={`w-full border rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition-all ${
              errors.slaName ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
            } ${isRTL ? 'text-right' : 'text-left'}`}
          />
          {errors.slaName && <ErrMsg msg={errors.slaName} />}
        </div>

        {/* SLA Type — tag-button selector */}
        <div>
          <label className={labelStyle}>
            {t('modals.slaRuleForm.slaType', 'SLA Type')} <span className="text-red-400">*</span>
          </label>
          <div className={`flex flex-wrap gap-2 mt-1 ${isRTL ? 'flex-row-reverse justify-end' : 'justify-start'}`}>
            {SLA_TYPE_OPTIONS.map(opt => {
              const selected = form.slaType === opt
              const color = getValueColor(opt)
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => set('slaType', opt)}
                  className="rounded-full transition-all duration-150 focus:outline-none hover:scale-110"
                  style={selected ? { boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${color}` } : { opacity: 0.5 }}
                  onMouseEnter={(e) => {
                    if (!selected) e.currentTarget.style.opacity = '0.8'
                  }}
                  onMouseLeave={(e) => {
                    if (!selected) e.currentTarget.style.opacity = '0.5'
                  }}
                >
                  <Tag type="slaType" value={opt} showIcon t={t} isRTL={isRTL} />
                </button>
              )
            })}
          </div>
          {errors.slaType && <ErrMsg msg={errors.slaType} />}
        </div>

        {/* Time Type — tag-button selector */}
        <div>
          <label className={labelStyle}>
            {t('modals.slaRuleForm.timeType', 'Time Type')} <span className="text-red-400">*</span>
          </label>
          <div className={`flex flex-wrap gap-2 mt-1 ${isRTL ? 'flex-row-reverse justify-end' : 'justify-start'}`}>
            {TIME_TYPE_OPTIONS.map(opt => {
              const selected = form.timeType === opt
              const color = getValueColor(opt)
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => set('timeType', opt)}
                  className="rounded-full transition-all duration-150 focus:outline-none hover:scale-110"
                  style={selected ? { boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${color}` } : { opacity: 0.5 }}
                  onMouseEnter={(e) => {
                    if (!selected) e.currentTarget.style.opacity = '0.8'
                  }}
                  onMouseLeave={(e) => {
                    if (!selected) e.currentTarget.style.opacity = '0.5'
                  }}
                >
                  <Tag type="timeType" value={opt} showIcon t={t} isRTL={isRTL} />
                </button>
              )
            })}
          </div>
          {errors.timeType && <ErrMsg msg={errors.timeType} />}
        </div>

        {/* Priority — button-based selector with colored tags */}
        <div>
          <label className={labelStyle}>
            {t('modals.slaRuleForm.priority', 'Priority')} <span className="text-red-400">*</span>
          </label>
          <div className={`flex flex-wrap gap-2 mt-1 ${isRTL ? 'flex-row-reverse justify-end' : 'justify-start'}`}>
            {PRIORITY_OPTIONS.map(p => {
              const selected = form.priority === p
              const color = getValueColor(p)
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => set('priority', p)}
                  className="rounded-full transition-all duration-150 focus:outline-none hover:scale-110"
                  style={selected ? { boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${color}` } : { opacity: 0.5 }}
                  onMouseEnter={(e) => {
                    if (!selected) e.currentTarget.style.opacity = '0.8'
                  }}
                  onMouseLeave={(e) => {
                    if (!selected) e.currentTarget.style.opacity = '0.5'
                  }}
                >
                  <Tag type="priority" value={p} showIcon t={t} isRTL={isRTL} />
                </button>
              )
            })}
          </div>
          {errors.priority && <ErrMsg msg={errors.priority} />}
        </div>

        {/* Response Time — number + unit */}
        <div>
          <label className={labelStyle}>
            {t('modals.slaRuleForm.responseTime', 'Response Time')} <span className="text-red-400">*</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              value={form.responseTimeValue}
              onChange={e => set('responseTimeValue', e.target.value)}
              placeholder="e.g. 4"
              className={`w-24 border rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition-all ${isRTL ? 'text-right' : 'text-left'} ${
                errors.responseTime ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
              }`}
            />
            <div className={`flex gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {RESPONSE_TIME_UNITS.map(u => {
                const selected = form.responseTimeUnit === u
                // Blue for Hours, purple for Days
                const color = u === 'Hours' ? '#0ea5e9' : '#8b5cf6'
                return (
                  <button
                    key={u}
                    type="button"
                    onClick={() => set('responseTimeUnit', u)}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 focus:outline-none hover:scale-110"
                    style={selected
                      ? { backgroundColor: `${color}20`, borderColor: color, color, borderWidth: '1px', borderStyle: 'solid', boxShadow: `0 0 0 2px #fff, 0 0 0 3px ${color}` }
                      : { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb', color: '#9ca3af', borderWidth: '1px', borderStyle: 'solid' }
                    }
                    onMouseEnter={(e) => {
                      if (!selected) {
                        e.currentTarget.style.backgroundColor = `${color}10`
                        e.currentTarget.style.borderColor = color
                        e.currentTarget.style.color = color
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selected) {
                        e.currentTarget.style.backgroundColor = '#f3f4f6'
                        e.currentTarget.style.borderColor = '#e5e7eb'
                        e.currentTarget.style.color = '#9ca3af'
                      }
                    }}
                  >
                    {u}
                  </button>
                )
              })}
            </div>
          </div>
          {errors.responseTime && <ErrMsg msg={errors.responseTime} />}
        </div>

        {/* Live preview strip — appears as soon as any tag field is filled in */}
        {(form.slaType || form.timeType) && (
          <div className={`flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {t('modals.slaRuleForm.preview', 'Preview')}
            </span>
            <div className="flex items-center gap-2">
              {form.slaType && <Tag type="slaType" value={form.slaType} showIcon t={t} isRTL={isRTL} />}
              {form.timeType && <Tag type="timeType" value={form.timeType} showIcon t={t} isRTL={isRTL} />}
              {form.priority && <Tag type="priority" value={form.priority} showIcon t={t} isRTL={isRTL} />}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className={`flex gap-3 mt-2 ${isRTL ? 'flex-row-reverse' : 'justify-end'}`}>
          <button onClick={onClose} className="modal-cancel-button">
            {t('modals.slaRuleForm.cancel', 'Cancel')}
          </button>
          <button onClick={handleSave} className="modal-save-button">
            {isEdit
              ? t('modals.slaRuleForm.saveChanges', 'Save Changes')
              : t('modals.slaRuleForm.create', 'Create Rule')
            }
          </button>
        </div>
      </div>
    </Modal>
  )
}
