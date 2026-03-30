import React, { useState } from 'react'
import { UserSearch, Mail, Building2, Hash, Pencil, Trash2, Copy, TicketCheck, Building, BriefcaseBusiness, ReceiptText, Code, Phone, ArrowUp } from 'lucide-react'

// Defines the 8 detail fields displayed in the card grid.
// - key: property name on the employee object (e.g. employee.employeeId)
// - labelKey: i18n translation key suffix for the field label
// - fallback: English text if translation is missing
// - icon / color: Lucide icon and its accent color used for the icon circle and borders
// - isEmail: if true, the value is styled as a link color (blue)
const FIELD_CONFIG = [
  { key: 'employeeId',    labelKey: 'employeeId',    fallback: 'Employee ID',      icon: Hash,             color: '#eab308' },
  { key: 'entityCode',    labelKey: 'entityCode',    fallback: 'Entity code',      icon: Code,             color: '#8b5cf6' },
  { key: 'entityName',    labelKey: 'entityName',    fallback: 'Entity name',      icon: Building,         color: '#3b82f6' },
  { key: 'department',    labelKey: 'department',    fallback: 'Department',        icon: Building2,        color: '#22c55e' },
  { key: 'employeeClass', labelKey: 'employeeClass', fallback: 'Employee class',   icon: ReceiptText,      color: '#f97316' },
  { key: 'manager',       labelKey: 'manager',       fallback: 'Manager',          icon: BriefcaseBusiness,color: '#06b6d4' },
  { key: 'email',         labelKey: 'email',         fallback: 'Email',            icon: Mail,             color: '#ec4899', isEmail: true },
  { key: 'mobileNumber',  labelKey: 'mobileNumber',  fallback: 'Mobile Number',    icon: Phone,            color: '#10b981' },
]

// Shown when no employee is selected yet. Renders a gray skeleton with
// pulsing placeholder boxes so the user knows there's a card to fill in.
function PlaceholderCard({ t }) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-white to-gray-50 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center font-semibold text-lg text-white flex-shrink-0 shadow-md">
            <UserSearch size={28} strokeWidth={1.5} />
          </div>
          <div>
            <div className="font-semibold text-lg text-gray-600 tracking-tight">
              {t('administratorMenu.tabs.employeeDirectory.selectEmployee', 'Select an Employee')}
            </div>
            <div className="text-base text-gray-400 mt-1 font-medium flex items-center gap-2">
              {t('administratorMenu.tabs.employeeDirectory.selectEmployeeTip', 'Click on any row in the table above to view employee details')}
              <ArrowUp className="h-6 w-6 text-gray-500 animate-bounce" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            disabled
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 border border-gray-200 text-gray-400 cursor-not-allowed"
          >
            <Pencil size={16} />
          </button>
          <button
            disabled
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 border border-gray-200 text-gray-400 cursor-not-allowed"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-4 bg-white p-5 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-xl px-4 py-3.5 bg-gray-50 border border-gray-100 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="h-2 bg-gray-200 rounded w-16 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// A single field tile inside the detail card grid.
// Shows an icon, a label, and the value. Has a copy button that appears on hover.
// The tile background and border use the field's accent color at low opacity.
function FieldTile({ label, value, icon: Icon, color, isEmail, copiedField, onCopy }) {
  return (
    <div
      className="group relative rounded-xl px-4 py-3.5 transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-default"
      style={{
        background: `linear-gradient(135deg, ${color}08 0%, ${color}04 100%)`,
        border: `1px solid ${color}20`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`
        e.currentTarget.style.borderColor = `${color}40`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = `linear-gradient(135deg, ${color}08 0%, ${color}04 100%)`
        e.currentTarget.style.borderColor = `${color}20`
      }}
    >
      <div className="flex items-center gap-3 justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: `${color}18` }}
          >
            <Icon size={18} style={{ color }} strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate mb-0.5">
              {label}
            </div>
            <div
              className={`text-sm font-semibold truncate ${isEmail ? 'text-blue-600' : 'text-gray-800'}`}
              title={value}
            >
              {value ?? '—'}
            </div>
          </div>
        </div>
        <button
          onClick={() => onCopy(label, value)}
          className="p-1.5 hover:bg-green-100 rounded-lg transition-all duration-200 flex-shrink-0 opacity-0 group-hover:opacity-100"
          title={`Copy ${label}`}
        >
          {copiedField === label ? (
            <TicketCheck size={14} className="text-green-600" />
          ) : (
            <Copy size={14} className="text-green-600 hover:text-green-700 hover-effect" />
          )}
        </button>
      </div>
    </div>
  )
}

// Main detail card component. Receives an employee object and renders:
// 1. A header with avatar initials, name, department, and edit/delete buttons
// 2. A 4-column grid of FieldTile components for each field in FIELD_CONFIG
//
// Props:
//   employee - the employee object to display (or placeholder)
//   onEdit   - callback when the edit button is clicked
//   onDelete - callback when the delete button is clicked
//   onCopy   - callback when a field value is copied to clipboard
//   t        - i18n translation function
export default function EmployeeDetailCard({ employee, onEdit, onDelete, onCopy, t }) {
  // Tracks which field was just copied so we can show a checkmark icon briefly
  const [copiedField, setCopiedField] = useState(null)

  // No employee selected — show the placeholder skeleton
  if (!employee) return <PlaceholderCard t={t} />

  // Build avatar initials from the first letter of the first two words
  // e.g. "John Doe" => "JD"
  const initials = employee.name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  // Copy a field's value to the clipboard, show a checkmark for 2 seconds,
  // and notify the parent via onCopy so it can show an alert toast.
  const handleCopyField = (fieldName, value) => {
    navigator.clipboard.writeText(value || '')
    setCopiedField(fieldName)
    if (onCopy) onCopy(fieldName, value)
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Map FIELD_CONFIG to translated labels + actual employee values
  const fields = FIELD_CONFIG.map(({ key, labelKey, fallback, icon, color, isEmail }) => ({
    label: t(`administratorMenu.tabs.employeeDirectory.columns.${labelKey}`, fallback),
    value: employee[key],
    icon,
    color,
    isEmail,
  }))

  return (
    <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Card header: avatar + name/dept + action buttons */}
      <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-white to-gray-50 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center font-semibold text-lg text-white flex-shrink-0 shadow-md">
            {initials}
          </div>
          <div>
            <div className="font-semibold text-lg text-gray-900">
              {employee.name}
            </div>
            <div className="text-base text-gray-500 mt-1 font-medium">
              {employee.department} · {employee.location} · {employee.entityName}
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(employee)}
            title={t('common.edit', 'Edit')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-50 border border-blue-200 text-blue-500 hover:bg-blue-100 hover:border-blue-400 hover:text-blue-700 hover:scale-110 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(employee)}
            title={t('common.delete', 'Delete')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 hover:border-red-400 hover:text-red-700 hover:scale-110 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* 4-column fields grid */}
      <div className="grid grid-cols-4 bg-white p-5 gap-3">
        {fields.map(({ label, value, icon, color, isEmail }) => (
          <FieldTile
            key={label}
            label={label}
            value={value}
            icon={icon}
            color={color}
            isEmail={isEmail}
            copiedField={copiedField}
            onCopy={handleCopyField}
          />
        ))}
      </div>
    </div>
  )
}
