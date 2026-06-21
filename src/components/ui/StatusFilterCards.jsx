import React from 'react'
import CompactStatsCard from '@components/ui/CompactStatsCard'
import { CheckCircle2, XCircle } from 'lucide-react'

export default function StatusFilterCards({
  totalLabel, totalIcon, total, active, inactive,
  filter, onFilter, disabled = false,
  activeLabel = 'Active', inactiveLabel = 'Inactive',
}) {
  const toggle = (val) => {
    if (disabled) return
    onFilter(filter === val ? null : val)
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
      <CompactStatsCard title={totalLabel} value={total} icon={totalIcon} iconBoxColor="#eab308" onClick={() => onFilter(null)} active={filter === null} />
      <CompactStatsCard title={activeLabel} value={active} icon={CheckCircle2} iconBoxColor="#22c55e" onClick={() => toggle('Active')} active={filter === 'Active'} />
      <CompactStatsCard title={inactiveLabel} value={inactive} icon={XCircle} iconBoxColor="#ef4444" onClick={() => toggle('Inactive')} active={filter === 'Inactive'} />
    </div>
  )
}
