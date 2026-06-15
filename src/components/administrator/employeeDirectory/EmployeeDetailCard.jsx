import React, { useState } from 'react'
import { UserSearch, Mail, Building2, Hash, Copy, TicketCheck, Building, BriefcaseBusiness, ReceiptText, Code, Phone } from 'lucide-react'
import Tag from '@components/ui/Tag'
import DetailCardShell, { DetailCardPlaceholder } from '@components/ui/DetailCard/DetailCardShell'

// Defines the 8 detail fields displayed in the card grid.
// - key: property name on the employee object (e.g. employee.employeeId)
// - labelKey: i18n translation key suffix for the field label
// - fallback: English text if translation is missing
// - icon / color: Lucide icon and its accent color used for the icon circle and borders
// - isEmail: if true, the value is styled as a link color (blue)
const FIELD_CONFIG = [
  { key: 'employeeId',    labelKey: 'employeeId',    fallback: 'Employee ID',    icon: Hash,             color: '#eab308' },
  { key: 'entityCode',    labelKey: 'entityCode',    fallback: 'Entity code',    icon: Code,             color: '#8b5cf6' },
  { key: 'entityName',    labelKey: 'entityName',    fallback: 'Entity name',    icon: Building,         color: '#3b82f6' },
  { key: 'department',    labelKey: 'department',    fallback: 'Department',     icon: Building2,        color: '#22c55e' },
  { key: 'employeeClass', labelKey: 'employeeClass', fallback: 'Employee class', icon: ReceiptText,      color: '#f97316', isTag: true },
  { key: 'manager',       labelKey: 'manager',       fallback: 'Manager',        icon: BriefcaseBusiness,color: '#06b6d4' },
  { key: 'email',         labelKey: 'email',         fallback: 'Email',          icon: Mail,             color: '#ec4899', isEmail: true },
  { key: 'mobileNumber',  labelKey: 'mobileNumber',  fallback: 'Mobile Number',  icon: Phone,            color: '#10b981' },
]

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
  if (!employee) {
    return (
      <DetailCardPlaceholder
        placeholderIcon={UserSearch}
        noSelectionText={t('administratorMenu.tabs.employeeDirectory.selectEmployee', 'Select an Employee')}
        noSelectionSub={t('administratorMenu.tabs.employeeDirectory.selectEmployeeTip', 'Click on any row in the table above to view employee details')}
        tileCount={8}
        cols={4}
      />
    )
  }

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

  // Map FIELD_CONFIG to translated labels + actual employee values + copy button per tile
  const fields = FIELD_CONFIG.map(({ key, labelKey, fallback, icon, color, isEmail, isTag }) => {
    const label = t(`administratorMenu.tabs.employeeDirectory.columns.${labelKey}`, fallback)
    const value = employee[key]
    return {
      label,
      value,
      icon,
      color,
      isEmail,
      customRender: isTag && value ? <Tag type="employeeClass" value={value} showIcon t={t} /> : null,
      copyButton: (
        <button
          onClick={() => handleCopyField(label, value)}
          className="p-1.5 hover:bg-green-100 rounded-lg transition-all duration-200 flex-shrink-0 opacity-0 group-hover:opacity-100"
          title={`Copy ${label}`}
        >
          {copiedField === label
            ? <TicketCheck size={14} className="text-green-600" />
            : <Copy size={14} className="text-green-600 hover:text-green-700 hover-effect" />
          }
        </button>
      ),
    }
  })

  // Avatar header uses initials instead of an icon — DetailCardShell accepts headerContent override
  return (
    <DetailCardShell
      headerIcon={() => <span className="font-semibold text-lg">{initials}</span>}
      title={employee.name}
      subtitle={`${employee.department} · ${employee.location} · ${employee.entityName}`}
      fields={fields}
      cols={4}
      onEdit={() => onEdit(employee)}
      onDelete={() => onDelete(employee)}
      t={t}
    />
  )
}
