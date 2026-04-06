import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from './Modal'
import { TicketPlus, AlertCircle } from 'lucide-react'
import Tag, { getValueColor } from '@components/ui/Tag'
import DaisySelect from '@components/ui/DaisySelect'

const TICKET_CATEGORIES = ['Leave & Attendance', 'HR Policies']

const SUBCATEGORY_MAP = {
  'Leave & Attendance': ['vacation', 'medical', 'personal', 'business trip'],
  'HR Policies': ['inquiry', 'complaint', 'document request', 'policy clarification'],
}

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical']

export default function AddTicketModal({ isOpen, onClose, onSave, isProcessing }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const empty = {
    employeeName: '',
    employeeId: '',
    employeeEmail: '',
    category: '',
    subcategory: '',
    priority: '',
    title: '',
    reason: '',
  }

  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      setForm(empty)
      setErrors({})
    }
  }, [isOpen])

  const set = (key, val) => {
    setForm(f => {
      const next = { ...f, [key]: val }
      // Reset subcategory when category changes
      if (key === 'category') next.subcategory = ''
      return next
    })
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }))
  }

  const REQUIRED_FIELDS = ['employeeName', 'employeeId', 'category', 'subcategory', 'priority', 'title']

  const validate = () => {
    const next = {}
    for (const key of REQUIRED_FIELDS) { // instead of if (!form.employeeName.trim()) next.employeeName = t('modals.addTicket.errors.employeeNameRequired', 'Employee name is required')
      const val = typeof form[key] === 'string' ? form[key].trim() : form[key]
      if (!val) next[key] = t(`modals.addTicket.errors.${key}Required`)
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave({
      employeeName: form.employeeName.trim(),
      employeeId: form.employeeId.trim(),
      employeeEmail: form.employeeEmail.trim() || null,
      category: form.category,
      subcategory: form.subcategory,
      priority: form.priority,
      title: form.title.trim(),
      reason: form.reason.trim() || null,
    })
  }

  const subcategoryOptions = form.category ? (SUBCATEGORY_MAP[form.category] || []) : []

  const labelStyle = `block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ${isRTL ? 'text-right' : 'text-left'}`

  const ErrMsg = ({ msg }) => (
    <div className={`flex items-center gap-1.5 mt-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
      <AlertCircle size={13} style={{ color: '#ef4444', flexShrink: 0 }} />
      <span className="text-xs font-medium" style={{ color: '#ef4444' }}>{msg}</span>
    </div>
  )

  const inputClass = (hasError) =>
    `w-full border rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition-all ${isRTL ? 'text-right' : 'text-left'} ${hasError ? 'border-red-400 bg-red-50/30' : 'border-gray-200'}`

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('modals.addTicket.title', 'Add Ticket')}
      icon={
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fde047, #facc15)', boxShadow: '0 4px 6px -1px rgba(251,191,36,.4)' }}>
          <TicketPlus size={24} color="#9d6806" />
        </div>
      }
      subtitle={t('modals.addTicket.subtitle', 'Create a new ticket on behalf of an employee')}
    >
      <div dir={isRTL ? 'rtl' : 'ltr'} className="flex flex-col gap-4">

        {/* Employee Name + Employee ID side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelStyle}>{t('modals.addTicket.employeeName', 'Employee Name')} <span className="text-red-400">*</span></label>
            <input
              value={form.employeeName}
              onChange={e => set('employeeName', e.target.value)}
              placeholder={t('modals.addTicket.employeeNamePlaceholder', 'e.g. John Smith')}
              className={inputClass(!!errors.employeeName)}
            />
            {errors.employeeName && <ErrMsg msg={errors.employeeName} />}
          </div>
          <div>
            <label className={labelStyle}>{t('modals.addTicket.employeeId', 'Employee ID')} <span className="text-red-400">*</span></label>
            <input
              value={form.employeeId}
              onChange={e => set('employeeId', e.target.value)}
              placeholder={t('modals.addTicket.employeeIdPlaceholder', 'e.g. EMP001')}
              className={inputClass(!!errors.employeeId)}
            />
            {errors.employeeId && <ErrMsg msg={errors.employeeId} />}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className={labelStyle}>{t('modals.addTicket.ticketTitle', 'Title')} <span className="text-red-400">*</span></label>
          <input
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder={t('modals.addTicket.titlePlaceholder', 'Short description of the request')}
            className={inputClass(!!errors.title)}
          />
          {errors.title && <ErrMsg msg={errors.title} />}
        </div>

        {/* Category + Subcategory side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelStyle}>{t('modals.addTicket.category', 'Category')} <span className="text-red-400">*</span></label>
            <DaisySelect
              value={form.category}
              options={TICKET_CATEGORIES}
              onChange={val => set('category', val)}
              hasError={!!errors.category}
              t={t}
              isRTL={isRTL}
            />
            {errors.category && <ErrMsg msg={errors.category} />}
          </div>
          <div>
            <label className={labelStyle}>{t('modals.addTicket.subcategory', 'Subcategory')} <span className="text-red-400">*</span></label>
            <DaisySelect
              value={form.subcategory}
              options={subcategoryOptions}
              onChange={val => set('subcategory', val)}
              hasError={!!errors.subcategory}
              placeholder={!form.category ? t('modals.addTicket.selectCategoryFirst', 'Select category first') : undefined}
              disabled={!form.category}
              t={t}
              isRTL={isRTL}
            />
            {errors.subcategory && <ErrMsg msg={errors.subcategory} />}
          </div>
        </div>

        {/* Priority - button based selector with colored tags */}
        <div>
          <label className={labelStyle}>{t('modals.addTicket.priority', 'Priority')} <span className="text-red-400">*</span></label>
          <div className={`flex flex-wrap gap-2 mt-1 ${isRTL ? 'flex-row-reverse justify-end' : 'justify-start'}`}>
            {PRIORITY_OPTIONS.map(p => {
              const selected = form.priority === p
              const color = getValueColor(p)
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => set('priority', p)}
                  className="rounded-full transition-all duration-150 focus:outline-none"
                  style={selected ? { boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${color}` } : { opacity: 0.5 }}
                >
                  <Tag type="priority" value={p} showIcon t={t} isRTL={isRTL} />
                </button>
              )
            })}
          </div>
          {errors.priority && <ErrMsg msg={errors.priority} />}
        </div>

        {/* Reason */}
        <div>
          <label className={labelStyle}>{t('modals.addTicket.reason', 'Reason')}</label>
          <textarea
            value={form.reason}
            onChange={e => set('reason', e.target.value)}
            placeholder={t('modals.addTicket.reasonPlaceholder', 'Additional details or reason for this request...')}
            rows={3}
            className={`${inputClass(false)} resize-none`}
          />
        </div>

        {/* Action buttons */}
        <div className={`flex gap-3 mt-2 ${isRTL ? 'flex-row-reverse' : 'justify-end'}`}>
          <button onClick={onClose} className="modal-cancel-button" disabled={isProcessing}>
            {t('modals.addTicket.cancel', 'Cancel')}
          </button>
          <button onClick={handleSave} className="modal-save-button" disabled={isProcessing}>
            {isProcessing
              ? t('modals.addTicket.creating', 'Creating...')
              : t('modals.addTicket.create', 'Create Ticket')
            }
          </button>
        </div>
      </div>
    </Modal>
  )
}
