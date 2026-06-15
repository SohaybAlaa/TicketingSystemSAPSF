import React from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import Tag from '@components/ui/Tag'

// Cell renderer for the SLA Type column — renders a colored Tag
export const SlaTypeCellRenderer = ({ value, data, t, isRTL }) => {
  if (data?._skeleton) return null
  return <Tag type="slaType" value={value} showIcon t={t} isRTL={isRTL} />
}

// Cell renderer for the Time Type column — renders a colored Tag
export const TimeTypeCellRenderer = ({ value, data, t, isRTL }) => {
  if (data?._skeleton) return null
  return <Tag type="timeType" value={value} showIcon t={t} isRTL={isRTL} />
}

// Custom header for the SLA ID column — includes a Collapse All / Expand All toggle button
export const SlaIdHeaderComponent = ({ displayName, collapseAll, expandAll, allCollapsed }) => {
  const Icon = allCollapsed ? ChevronUp : ChevronDown
  const title = allCollapsed ? 'Expand All' : 'Collapse All'
  return (
    <div className="flex items-center justify-between w-full gap-1">
      <span>{displayName}</span>
      <button
        onClick={(e) => { e.stopPropagation(); allCollapsed ? expandAll() : collapseAll() }}
        title={title}
        className="p-0.5 rounded hover:bg-gray-200/70 transition-colors"
      >
        <Icon size={15} className="text-gray-400 hover:text-gray-600" />
      </button>
    </div>
  )
}
