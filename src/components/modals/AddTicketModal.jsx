import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from './Modal'
import { TicketPlus, AlertCircle, Paperclip, X, FileText, FileImage, File } from 'lucide-react'
import Tag, { getValueColor } from '@components/ui/Tag'
import DaisySelect from '@components/ui/DaisySelect'

// Map MIME types to file extensions for validation
const ACCEPTED_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}
// Convert MIME types to comma-separated string for file input accept attribute
const ACCEPT_STRING = Object.keys(ACCEPTED_TYPES).join(',') //  Example: "image/png,image/jpeg,application/pdf"
const MAX_FILE_SIZE = 5 * 1024 * 1024      // 5 MB per file
const MAX_TOTAL_SIZE = 20 * 1024 * 1024     // 20 MB total

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result.split(',')[1]) // strip data:…;base64,
  reader.onerror = reject
  reader.readAsDataURL(file)
})

// Return appropriate icon and color based on file MIME type
const getFileIcon = (type) => {
  if (type.startsWith('image/')) return { Icon: FileImage, color: '#9ca3af' }
  if (type === 'application/pdf') return { Icon: FileText, color: '#ef4444' }
  if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      type === 'application/msword') return { Icon: FileText, color: '#3b82f6' }
  return { Icon: File, color: '#9ca3af' }
}

// Convert bytes to human-readable file size (B, KB, MB)
const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical']

export default function AddTicketModal({ isOpen, onClose, onSave, isProcessing, categories = [], subcategoryMap = {} }) {
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
  // Stores file objects: { file, name, size, type, base64, preview? }
  const [attachments, setAttachments] = useState([])
  const fileInputRef = useRef(null) // Reference to hidden file input element

  useEffect(() => {
    if (isOpen) {
      setForm(empty)
      setErrors({})
      setAttachments([])
    }
  }, [isOpen])

  // Helper to update form field and clear its error
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

  // Check all required fields and return true if valid
  const validate = () => {
    const next = {}
    for (const key of REQUIRED_FIELDS) {
      const val = typeof form[key] === 'string' ? form[key].trim() : form[key]
      if (!val) next[key] = t(`modals.addTicket.errors.${key}Required`)
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  // Validate form and send ticket data to parent component
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
      attachments: attachments.map(a => ({ name: a.name, base64: a.base64, type: a.type })),
    })
  }

  // Calculate total size of all attachments
  const totalSize = attachments.reduce((sum, a) => sum + a.size, 0)

  // Handle file selection, validate, and convert to base64
  const handleFilePick = async (e) => {
    const files = Array.from(e.target.files || [])
    if (fileInputRef.current) fileInputRef.current.value = ''
    const newErrors = []
    const toAdd = []

    for (const file of files) {
      if (!ACCEPTED_TYPES[file.type]) {
        newErrors.push(t('modals.addTicket.attachments.unsupportedType', { name: file.name }))
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        newErrors.push(t('modals.addTicket.attachments.fileTooLarge', { name: file.name, max: '5 MB' }))
        continue
      }
      if (totalSize + file.size > MAX_TOTAL_SIZE) {
        newErrors.push(t('modals.addTicket.attachments.totalTooLarge', { max: '20 MB' }))
        break
      }
      if (attachments.some(a => a.name === file.name)) {
        newErrors.push(t('modals.addTicket.attachments.duplicate', { name: file.name }))
        continue
      }
      const base64 = await fileToBase64(file)
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      toAdd.push({ file, name: file.name, size: file.size, type: file.type, base64, preview })
    }
    if (toAdd.length) setAttachments(prev => [...prev, ...toAdd])
    if (newErrors.length) setErrors(prev => ({ ...prev, attachments: newErrors.join(' ') }))
    else setErrors(prev => ({ ...prev, attachments: undefined }))
  }

  // Remove attachment and clean up preview URL
  const removeAttachment = (name) => {
    setAttachments(prev => {
      const removed = prev.find(a => a.name === name)
      if (removed?.preview) URL.revokeObjectURL(removed.preview)
      return prev.filter(a => a.name !== name)
    })
    if (errors.attachments) setErrors(prev => ({ ...prev, attachments: undefined }))
  }

  const subcategoryOptions = form.category ? (subcategoryMap[form.category] || []) : []

  // Reusable label styling with RTL support
  const labelStyle = `block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ${isRTL ? 'text-right' : 'text-left'}`

  // Error message component
  const ErrMsg = ({ msg }) => (
    <div className={`flex items-center gap-1.5 mt-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
      <AlertCircle size={13} style={{ color: '#ef4444', flexShrink: 0 }} />
      <span className="text-xs font-medium" style={{ color: '#ef4444' }}>{msg}</span>
    </div>
  )

  // Input styling with error state and RTL support
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
              options={categories}
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

        {/* Attachments */}
        <div>
          <label className={labelStyle}>{t('modals.addTicket.attachments.label', 'Attachments')}</label>

          {/* Drop zone / button */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_STRING}
            multiple
            className="hidden"
            onChange={handleFilePick}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-xl px-4 py-3 flex items-center gap-2 text-sm transition-all hover:border-yellow-400 hover:bg-yellow-50/40 ${
              isRTL ? 'flex-row-reverse' : ''
            } ${
              errors.attachments ? 'border-red-300 bg-red-50/20' : 'border-gray-200 text-gray-400'
            }`}
          >
            <Paperclip size={16} />
            <span>{t('modals.addTicket.attachments.browse', 'Browse files — PDF, DOCX, Images (max 5 MB each)')}</span>
          </button>

          {errors.attachments && <ErrMsg msg={errors.attachments} />}

          {/* File list */}
          {attachments.length > 0 && (
            <div className="mt-2 flex flex-col gap-1.5">
              {attachments.map(a => {
                const { Icon, color: iconColor } = getFileIcon(a.type)
                return (
                  <div
                    key={a.name}
                    className={`flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2 text-sm group transition-all duration-300 ease-in-out hover:border-yellow-400 hover:bg-yellow-50/80 hover:scale-[1.015] hover:shadow-sm ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    {a.preview
                      ? <img src={a.preview} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                      : <Icon size={28} className="flex-shrink-0" style={{ color: iconColor }} />
                    }
                    <span className="truncate flex-1 text-gray-700 font-medium">{a.name}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{formatSize(a.size)}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(a.name)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-100"
                    >
                      <X size={14} className="text-red-400" />
                    </button>
                  </div>
                )
              })}
              <p className={`text-xs text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('modals.addTicket.attachments.totalSize', 'Total')}: {formatSize(totalSize)} / 20 MB
              </p>
            </div>
          )}
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
