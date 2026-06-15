import React from 'react'
import { Timer, Hash, FileText, Hourglass, Layers2, CalendarClock, ChevronsUp } from 'lucide-react'
import Tag from '@components/ui/Tag'
import DetailCardShell, { DetailCardPlaceholder } from '@components/ui/DetailCard/DetailCardShell'

// Field config for the 6 summary tiles
const FIELD_CONFIG = [
  { key: 'slaId',        labelKey: 'slaId',        fallback: 'SLA ID',        icon: Hash,          color: '#f59e0b' },
  { key: 'nameAndId',    labelKey: 'nameAndId',     fallback: 'ID · SLA Name', icon: FileText,      color: '#8b5cf6' },
  { key: 'responseTime', labelKey: 'responseTime',  fallback: 'Response Time', icon: Hourglass,     color: '#0ea5e9' },
  { key: 'slaType',      labelKey: 'slaType',       fallback: 'SLA Type',      icon: Layers2,       color: '#ec4899', tagType: 'slaType' },
  { key: 'timeType',     labelKey: 'timeType',      fallback: 'Time Type',     icon: CalendarClock, color: '#10b981', tagType: 'timeType' },
  { key: 'priority',     labelKey: 'priority',      fallback: 'Priority',      icon: ChevronsUp,    color: '#6366f1', tagType: 'priority' },
]

// Calendar section skeleton — shown inside the placeholder when no rule is selected
function CalendarSkeleton() {
  return (
    <div className="bg-white px-5 pt-5 pb-5">
      <div className="flex items-center justify-between mb-6 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex-shrink-0" />
          <div>
            <div className="h-3 bg-gray-200 rounded w-36 mb-1.5" />
            <div className="h-2.5 bg-gray-100 rounded w-56" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex-shrink-0" />
          <div className="flex items-center gap-2">
            <div className="h-3 bg-gray-200 rounded w-20" />
            <div className="h-3 bg-purple-100 rounded w-12" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mb-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex-shrink-0" />
          <div className="h-3 bg-gray-200 rounded w-28" />
        </div>
        <div className="h-10 bg-gray-100 rounded-lg w-24 border border-gray-200" />
      </div>
      <div className="space-y-2">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 animate-pulse flex items-center gap-4">
            <div className="w-5 h-5 rounded bg-gray-200 flex-shrink-0" />
            <div className="h-3 bg-gray-200 rounded w-20" />
            <div className="flex items-center gap-1.5">
              <div className="h-6 bg-gray-200 rounded-full w-16" />
              <div className="h-6 bg-gray-200 rounded-full w-24" />
              <div className="h-6 bg-gray-200 rounded-full w-14" />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <div className="h-2 bg-gray-100 rounded w-8" />
              <div className="h-7 bg-gray-100 rounded-lg w-20 border border-gray-100" />
              <div className="h-2 bg-gray-100 rounded w-3" />
              <div className="h-2 bg-gray-100 rounded w-6" />
              <div className="h-7 bg-gray-100 rounded-lg w-20 border border-gray-100" />
            </div>
            <div className="h-6 bg-gray-200 rounded-full w-20 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

// SLA Rule detail card — uses shared DetailCardShell + DetailCardPlaceholder
// Props: selectedRule, children (OperatingHoursCalendar), onEdit, onDelete, t, isRTL
export default function SLARuleDetailCard({ selectedRule, children, onEdit, onDelete, t, isRTL }) {
  if (!selectedRule) {
    return (
      <DetailCardPlaceholder
        placeholderIcon={Timer}
        noSelectionText={t('administratorMenu.tabs.slaRules.operatingHours.noSelection', 'No SLA rule selected')}
        noSelectionSub={t('administratorMenu.tabs.slaRules.operatingHours.noSelectionSub', 'Select a row from the SLA Rules table above to configure its operating hours')}
        tileCount={6}
        cols={3}
        extraSkeleton={<CalendarSkeleton />}
      />
    )
  }

  // Build fields array — tagType drives the customRender (Tag component)
  const fields = FIELD_CONFIG.map(cfg => ({
    label: cfg.key === 'nameAndId'
      ? `${t('administratorMenu.tabs.slaRules.columns.id', 'ID')} · ${t('administratorMenu.tabs.slaRules.columns.slaName', 'SLA Name')}`
      : t(`administratorMenu.tabs.slaRules.columns.${cfg.labelKey}`, cfg.fallback),
    value: cfg.key === 'nameAndId'
      ? `#${selectedRule.id} · ${selectedRule.slaName}`
      : selectedRule[cfg.key],
    icon: cfg.icon,
    color: cfg.color,
    customRender: cfg.tagType
      ? <Tag type={cfg.tagType} value={selectedRule[cfg.key]} t={t} isRTL={isRTL} showIcon />
      : null,
  }))

  return (
    <DetailCardShell
      headerIcon={Timer}
      title={selectedRule.slaName}
      subtitle={`${selectedRule.slaId} · ID ${selectedRule.id}`}
      fields={fields}
      cols={3}
      onEdit={() => onEdit(selectedRule)}
      onDelete={() => onDelete(selectedRule)}
      t={t}
    >
      {children}
    </DetailCardShell>
  )
}
