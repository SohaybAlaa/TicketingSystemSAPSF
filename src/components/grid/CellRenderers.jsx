import React from 'react'
import { useTranslation } from 'react-i18next'
import Tag from '@components/ui/Tag'
import ActionIconButton from '@components/ui/ActionIconButton'
import { Pencil, Trash2 } from 'lucide-react'
// Import withSkeleton higher-order component for adding skeleton loading state
import { withSkeleton, SkeletonBar } from '@components/ui/GridSkeleton'
// Import utility functions for formatting dates and resolving row status
import { formatDate, resolveRowStatus } from '@utils/dateUtils'

// Status Cell Renderer: Displays the status of a row (Active, Inactive, etc.)
// Props: data - the row data object
// Returns: Centered Tag component showing the row's status with an icon
function StatusCellRendererBase({ data }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  return (
    <div className="flex items-center justify-center h-full w-full absolute inset-0">
      <Tag type="status" value={resolveRowStatus(data)} showIcon t={t} isRTL={isRTL} />
    </div>
  )
}

// User Type Cell Renderer: Displays the type of user (Employee, HR Staff, etc.)
// Props: value - the user type string
// Returns: Centered Tag component showing the user type with an icon
function UserTypeCellRendererBase({ value }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  return (
    <div className="flex items-center justify-center h-full w-full absolute inset-0">
      <Tag type="userType" value={value} showIcon t={t} isRTL={isRTL} />
    </div>
  )
}

// Date Cell Renderer: Displays a formatted date
// Props: value - the date value (string or Date object)
// Returns: Formatted date string using formatDate utility
function DateCellRendererBase({ value }) {
  return <span>{formatDate(value)}</span>
}

// Text Cell Renderer: Displays plain text content with skeleton loading support
// Props: props.value - the text to display, props.data - row data, props.node - ag-Grid node info
// Returns: SkeletonBar if row is loading (_skeleton flag), otherwise plain text or "---" if empty
// Note: This is the only renderer NOT wrapped with withSkeleton HOC (handles its own skeleton logic)
function TextCellRendererRaw(props) {
  if (props.data?._skeleton) return <SkeletonBar rowIndex={props.node?.rowIndex ?? 0} centered />
  return <div className="flex items-center justify-center h-full w-full"><span>{props.value ? props.value : '---'}</span></div>
}

// Actions Cell Renderer: Displays edit and delete action buttons
// Props: data - the row data object, context - ag-Grid context with onEdit and onDelete callbacks
// Returns: Two action buttons (Edit in blue, Delete in red) centered in the cell
// Note: context.onEdit and context.onDelete are passed from the grid's context prop
function ActionsCellRendererBase({ data, context }) {
  return (
    <div className="flex items-center justify-center gap-2 h-full w-full absolute inset-0">
      <ActionIconButton onClick={() => context.onEdit(data)}   icon={Pencil} variant="blue" title="Edit"   />
      <ActionIconButton onClick={() => context.onDelete(data)} icon={Trash2} variant="red"  title="Delete" />
    </div>
  )
}

// Export cell renderers wrapped with withSkeleton HOC for automatic skeleton loading
// withSkeleton(Component, showSkeleton) - wraps component to show SkeletonBar while loading
// The second parameter (true) enables skeleton display when row._skeleton is true
export const StatusCellRenderer   = withSkeleton(StatusCellRendererBase,   true) // Status with skeleton support
export const UserTypeCellRenderer = withSkeleton(UserTypeCellRendererBase, true) // User type with skeleton support
export const DateCellRenderer     = withSkeleton(DateCellRendererBase,     true) // Date with skeleton support
export const ActionsCellRenderer  = withSkeleton(ActionsCellRendererBase,  true) // Actions with skeleton support
export const TextCellRenderer     = TextCellRendererRaw // Text renderer (handles its own skeleton logic)
