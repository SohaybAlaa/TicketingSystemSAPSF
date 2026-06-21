import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { useTranslation } from 'react-i18next'
import { myTheme } from '@utils/agGridThemes'
import SectionHeader from '@components/ui/SectionHeader'
import ModernSeparator from '@components/ui/ModernSeparator'
import GridSearchBar from '@components/ui/GridSearchBar'
import CompactStatsCard from '@components/ui/CompactStatsCard'
import AlertNotification from '@components/ui/AlertNotification'
import DeleteConfirmModal from '@components/modals/DeleteConfirmModal'
import SLARuleFormModal from '@components/modals/SLARuleFormModal'
import { MOCK_SLA_RULES } from '@data/mockData'
import { buildGridOverlay, defaultColDef, getRowStyle } from '@utils/agGridUtils.jsx'
import { ActionsCellRenderer, TextCellRenderer } from '@components/grid/CellRenderers'
import Tag from '@components/ui/Tag'
import { Timer, AlertTriangle, MailSearch, CalendarClock, Layers2, Globe, ChevronDown, ChevronUp } from 'lucide-react'
import { SlaTypeCellRenderer, TimeTypeCellRenderer, SlaIdHeaderComponent } from './slaRules/SlaRuleCellRenderers'
import { PRIORITY_ORDER, DAY_PRESETS, parseResponseTime, translateResponseTime, determineTimeType, DEFAULT_OPERATING_HOURS } from './slaRules/slaRuleUtils'
import SLARuleDetailCard from './slaRules/SLARuleDetailCard'
import OperatingHoursCalendar from './slaRules/OperatingHoursCalendar'

ModuleRegistry.registerModules([AllCommunityModule])

export default function SLARuleTab() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Expand/collapse state for SLA ID groups
  const [collapsedGroups, setCollapsedGroups] = useState(new Set())
  const toggleGroup = useCallback((slaId) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(slaId)) next.delete(slaId)
      else next.add(slaId)
      return next
    })
  }, [])

  // Track sort state to disable rowSpan when sorting is active
  const [sortActive, setSortActive] = useState(false)

  // State
  const [rules, setRules] = useState(MOCK_SLA_RULES)
  
  // Draft operating hours state - tracks unsaved changes
  const [draftHours, setDraftHours] = useState(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Collapse all / Expand all SLA ID groups
  const allSlaIds = useMemo(() => new Set(rules.map(r => r.slaId)), [rules])
  const collapseAll = useCallback(() => setCollapsedGroups(new Set(allSlaIds)), [allSlaIds])
  const expandAll = useCallback(() => setCollapsedGroups(new Set()), [])

  // Column definitions for the SLA Rules table
  const columnDefs = useMemo(() => [
    {
      field: 'slaId',
      headerName: t('administratorMenu.tabs.slaRules.columns.slaId', 'SLA ID'),
      headerComponent: SlaIdHeaderComponent,
      headerComponentParams: { collapseAll, expandAll, allCollapsed: collapsedGroups.size > 0 && collapsedGroups.size >= allSlaIds.size },
      flex: 0.7, minWidth: 110,
      sortable: false,
      cellClass: 'sla-id-cell',
      cellRenderer: (params) => {
        if (params.data?._skeleton) return null
        const isCollapsed = collapsedGroups.has(params.data.slaId)
        const Icon = isCollapsed ? ChevronDown : ChevronUp
        return (
          <span
            className="flex items-center gap-1.5 cursor-pointer select-none w-full h-full"
            onClick={(e) => { e.stopPropagation(); toggleGroup(params.data.slaId) }}
          >
            <span className="text-sm font-bold text-slate-700">{params.value}</span>
            <Icon size={18} className="text-gray-400 flex-shrink-0" />
          </span>
        )
      },
      rowSpan: (params) => {
        if (!params.data) return 1
        // Disable rowSpan when sorting is active to prevent corruption
        if (sortActive) return 1
        // If group is collapsed, no spanning needed
        if (collapsedGroups.has(params.data.slaId)) return 1
        const rowIndex = params.node.rowIndex
        // Only span from the first row of each group
        if (rowIndex > 0) {
          const prev = params.api.getDisplayedRowAtIndex(rowIndex - 1)
          if (prev?.data?.slaId === params.data.slaId) return 1
        }
        // Count how many consecutive rows share the same slaId
        let count = 1
        let next = params.api.getDisplayedRowAtIndex(rowIndex + count)
        while (next?.data?.slaId === params.data.slaId) {
          count++
          next = params.api.getDisplayedRowAtIndex(rowIndex + count)
        }
        return count
      },
      cellStyle: (params) => {
        if (!params.data) return {}
        // When sorting is active, show simple cell style without spanning effects
        if (sortActive) {
          return {
            display: 'flex',
            alignItems: 'center',
            background: '#ffffff',
            borderRight: '2px solid #e2e8f0',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
          }
        }
        const rowIndex = params.node.rowIndex
        const isFirst = rowIndex === 0 || (() => {
          const prev = params.api.getDisplayedRowAtIndex(rowIndex - 1)
          return !prev?.data || prev.data.slaId !== params.data.slaId
        })()
        if (isFirst) {
          const isCollapsed = collapsedGroups.has(params.data.slaId)
          
          // Check if this group has multiple rows
          const nextRow = params.api.getDisplayedRowAtIndex(rowIndex + 1)
          const hasMultipleRows = nextRow?.data?.slaId === params.data.slaId
          
          // Determine group index (0, 1, 2, ...) to alternate bg color
          let groupIdx = 0
          for (let i = rowIndex - 1; i >= 0; i--) {
            const row = params.api.getDisplayedRowAtIndex(i)
            if (!row?.data) break
            const prev = i > 0 ? params.api.getDisplayedRowAtIndex(i - 1) : null
            if (!prev?.data || prev.data.slaId !== row.data.slaId) groupIdx++
          }
          const bg = groupIdx % 2 === 0 ? '#ffffff' : '#F8F9FA'
          return {
            display: 'flex',
            alignItems: 'center',
            background: bg,
            zIndex: 1,
            borderRight: '2px solid #e2e8f0',
            // Only apply thick bottom border if group has multiple rows and is not collapsed
            ...(!isCollapsed && hasMultipleRows ? { borderBottom: '3px solid #cbd5e1' } : {}),
            cursor: 'pointer',
            transition: 'background 0.2s ease',
          }
        }
        return {}
      },
    },
    {
      field: 'id',
      headerName: t('administratorMenu.tabs.slaRules.columns.id', 'ID'),
      flex: 0.4, minWidth: 70,
      cellRenderer: TextCellRenderer,
      cellStyle: { fontWeight: '600' },
    },
    {
      field: 'slaName',
      headerName: t('administratorMenu.tabs.slaRules.columns.slaName', 'SLA Name'),
      flex: 1.8, minWidth: 200,
      cellRenderer: TextCellRenderer,
      cellStyle: { fontWeight: '600' },
    },
    {
      field: 'slaType',
      headerName: t('administratorMenu.tabs.slaRules.columns.slaType', 'SLA Type'),
      flex: 1.2, minWidth: 160,
      headerClass: 'ag-header-cell-center',
      cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
      cellRenderer: (params) => <SlaTypeCellRenderer {...params} t={t} isRTL={isRTL} />,
    },
    {
      field: 'priority',
      headerName: t('administratorMenu.tabs.slaRules.columns.priority', 'Priority'),
      flex: 0.9, minWidth: 120,
      headerClass: 'ag-header-cell-center',
      cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
      cellRenderer: (params) => <Tag type="priority" value={params.value} t={t} isRTL={isRTL} />,
      comparator: (valueA, valueB) => PRIORITY_ORDER[valueA] - PRIORITY_ORDER[valueB],
    },
    {
      field: 'responseTime',
      headerName: t('administratorMenu.tabs.slaRules.columns.responseTime', 'Response Time'),
      flex: 1, minWidth: 140,
      cellRenderer: (params) => {
        if (params.data?._skeleton) return null
        return <span style={{ fontWeight: '600' }}>{translateResponseTime(params.value, t)}</span>
      },
      cellStyle: { fontWeight: '600' },
      comparator: (valueA, valueB) => parseResponseTime(valueA) - parseResponseTime(valueB),
    },
    {
      field: 'timeType',
      headerName: t('administratorMenu.tabs.slaRules.columns.timeType', 'Time Type'),
      flex: 1.2, minWidth: 160,
      headerClass: 'ag-header-cell-center',
      cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
      cellRenderer: (params) => <TimeTypeCellRenderer {...params} t={t} isRTL={isRTL} />,
    },
    {
      headerName: t('administratorMenu.tabs.slaRules.columns.action', 'Action'),
      flex: 0.5, minWidth: 100,
      sortable: false, filter: false, suppressMovable: true,
      cellRenderer: ActionsCellRenderer,
    },
  ], [t, isRTL, collapsedGroups, toggleGroup, collapseAll, expandAll, sortActive])

  // Empty state overlay
  const OVERLAY_NO_RULES = useMemo(() => buildGridOverlay({
    icon: AlertTriangle,
    heading: t('administratorMenu.tabs.slaRules.overlay.noRules', 'No SLA rules found'),
    sub: t('administratorMenu.tabs.slaRules.overlay.noRulesSub', 'Add your first SLA rule or adjust your search filters'),
  }), [t])

  const [selectedRule, setSelectedRule] = useState(null)
  const [deleteRuleTarget, setDeleteRuleTarget] = useState(null)
  const [ruleModalOpen, setRuleModalOpen] = useState(false)
  const [ruleModalTarget, setRuleModalTarget] = useState(null)
  const [alerts, setAlerts] = useState([])
  const hoveredSlaIdRef = useRef(null)
  const gridWrapperRef = useRef(null)

  // Ref for scrolling to operating hours section
  const operatingHoursRef = useRef(null)

  // Alerts
  const pushAlert = useCallback((type, title, message) => {
    const id = Date.now() + Math.random()
    const durations = { success: 3000, warning: 5000, error: 7000 }
    setAlerts(prev => [{ id, type, title, message }, ...prev])
    setTimeout(() => setAlerts(prev => prev.filter(a => a.id !== id)), durations[type] ?? 4000)
  }, [])

  const removeAlert = useCallback((id) => setAlerts(prev => prev.filter(a => a.id !== id)), [])

  // Search & grid
  const [search, setSearch] = useState('')
  const searchRef = useRef(null)
  const gridRef = useRef(null)

  useEffect(() => { searchRef.current?.focus() }, [])

  // Filtered rules based on unified search across all columns
  const filteredRules = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rules
    return rules.filter(r =>
      r.slaId.toLowerCase().includes(q) ||
      String(r.id).includes(q) ||
      r.slaName.toLowerCase().includes(q) ||
      r.slaType.toLowerCase().includes(q) ||
      r.priority.toLowerCase().includes(q) ||
      r.responseTime.toLowerCase().includes(q) ||
      r.timeType.toLowerCase().includes(q)
    )
  }, [rules, search])

  // Displayed rules — hide collapsed group rows (keep only first row per collapsed group)
  const displayedRules = useMemo(() => {
    if (collapsedGroups.size === 0) return filteredRules
    const seen = new Set()
    return filteredRules.filter(r => {
      if (!collapsedGroups.has(r.slaId)) return true
      if (seen.has(r.slaId)) return false
      seen.add(r.slaId)
      return true
    })
  }, [filteredRules, collapsedGroups])

  // Row click handler — select a rule and scroll to operating hours
  const handleRowClick = useCallback((params) => {
    if (params.data?._skeleton) return
    if (params.column?.getColId() === 'slaId') return
    if (selectedRule?.id === params.data.id) return
    setSelectedRule(params.data)
    setTimeout(() => operatingHoursRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }, [selectedRule])

  // Keep selectedRule in sync when rules change
  const syncSelected = useCallback((updated) => {
    if (selectedRule) {
      setSelectedRule(updated.find(r => r.id === selectedRule.id) ?? null)
    }
  }, [selectedRule])

  // Save operating hours changes
  const handleSaveOperatingHours = useCallback(() => {
    if (!selectedRule || !draftHours) return
    
    // Determine the new time type based on operating hours
    const newTimeType = determineTimeType(draftHours)
    
    const updated = rules.map(r => {
      if (r.id !== selectedRule.id) return r
      return { 
        ...r, 
        operatingHours: draftHours,
        timeType: newTimeType 
      }
    })
    setRules(updated)
    syncSelected(updated)
    setDraftHours(null)
    setHasUnsavedChanges(false)
    pushAlert(
      'success',
      t('administratorMenu.tabs.slaRules.alerts.operatingHoursSaved', 'Operating Hours Saved'),
      t('administratorMenu.tabs.slaRules.alerts.operatingHoursSavedMsg', 'Operating hours have been updated successfully.'),
    )
  }, [selectedRule, draftHours, rules, syncSelected, pushAlert, t, determineTimeType])

  // Reset draft when selecting a different rule
  useEffect(() => {
    setDraftHours(null)
    setHasUnsavedChanges(false)
  }, [selectedRule?.id])

  // Toggle a day on/off for the selected rule
  const handleToggleDay = useCallback((day) => {
    if (!selectedRule) return
    const currentHours = draftHours ?? selectedRule.operatingHours
    const updatedHours = {
      ...currentHours,
      [day]: { ...currentHours[day], enabled: !currentHours[day].enabled },
    }
    setDraftHours(updatedHours)
    setHasUnsavedChanges(true)
  }, [selectedRule, draftHours])

  // Change start/end time for a day
  const handleTimeChange = useCallback((day, field, value) => {
    if (!selectedRule) return
    const currentHours = draftHours ?? selectedRule.operatingHours
    const updatedHours = {
      ...currentHours,
      [day]: { ...currentHours[day], [field]: value },
    }
    setDraftHours(updatedHours)
    setHasUnsavedChanges(true)
  }, [selectedRule, draftHours])

  // Change preset for a day — auto-fills start/end times
  const handlePresetChange = useCallback((day, presetKey) => {
    if (!selectedRule) return
    const preset = DAY_PRESETS.find(p => p.key === presetKey)
    if (!preset) return
    const currentHours = draftHours ?? selectedRule.operatingHours
    const dayEntry = { ...currentHours[day], preset: presetKey }
    if (presetKey !== 'custom') {
      dayEntry.start = preset.start
      dayEntry.end = preset.end
    }
    const updatedHours = { ...currentHours, [day]: dayEntry }
    setDraftHours(updatedHours)
    setHasUnsavedChanges(true)
  }, [selectedRule, draftHours])

  // Handlers
  const handleDelete = useCallback(() => {
    const { id, slaName } = deleteRuleTarget
    const updated = rules.filter(r => r.id !== id)
    if (selectedRule?.id === id) setSelectedRule(null)
    setRules(updated)
    setDeleteRuleTarget(null)
    pushAlert(
      'success',
      t('administratorMenu.tabs.slaRules.alerts.deleted', 'SLA Rule removed'),
      t('administratorMenu.tabs.slaRules.alerts.deletedMsg', 'SLA rule has been removed.'),
    )
  }, [rules, deleteRuleTarget, selectedRule, pushAlert, t])

  // Open modal for Add / Edit
  const openAddModal = useCallback(() => {
    setRuleModalTarget(null)
    setRuleModalOpen(true)
  }, [])

  const openEditModal = useCallback((rule) => {
    setRuleModalTarget(rule)
    setRuleModalOpen(true)
  }, [])

  // Save handler for modal (add or edit)
  const handleRuleSave = useCallback((formData) => {
    if (ruleModalTarget) {
      // Edit existing rule
      const updated = rules.map(r => {
        if (r.id !== ruleModalTarget.id) return r
        return { ...r, ...formData }
      })
      setRules(updated)
      syncSelected(updated)
      pushAlert('success',
        t('administratorMenu.tabs.slaRules.alerts.updated', 'SLA Rule updated'),
        t('administratorMenu.tabs.slaRules.alerts.updatedMsg', 'SLA rule has been updated successfully.'),
      )
    } else {
      // Add new rule — generate next id, use provided slaId group or create new
      const maxId = rules.reduce((m, r) => Math.max(m, r.id), 0)
      // If no slaId provided, generate a new group id
      let slaId = formData.slaId
      if (!slaId) {
        const nextNum = rules.reduce((m, r) => {
          const n = parseInt(r.slaId?.replace('SLA-', ''), 10)
          return isNaN(n) ? m : Math.max(m, n)
        }, 0) + 1
        slaId = `SLA-${String(nextNum).padStart(3, '0')}`
      }
      const newRule = {
        id: maxId + 1,
        ...formData,
        slaId,
        operatingHours: DEFAULT_OPERATING_HOURS,
      }
      // Insert after the last rule of the same slaId group
      const lastIdx = rules.reduce((idx, r, i) => r.slaId === slaId ? i : idx, -1)
      if (lastIdx >= 0) {
        const updated = [...rules]
        updated.splice(lastIdx + 1, 0, newRule)
        setRules(updated)
      } else {
        setRules(prev => [...prev, newRule])
      }
      pushAlert('success',
        t('administratorMenu.tabs.slaRules.alerts.created', 'SLA Rule created'),
        t('administratorMenu.tabs.slaRules.alerts.createdMsg', 'New SLA rule has been created successfully.'),
      )
    }
  }, [ruleModalTarget, rules, syncSelected, pushAlert, t])

  // Grid context
  const gridContext = useMemo(() => ({
    onEdit: (r) => openEditModal(r),
    onDelete: (r) => setDeleteRuleTarget(r),
  }), [openEditModal])

  // Get operating hours for selected rule (draft or saved)
  const selectedHours = useMemo(() => {
    if (!selectedRule) return null
    if (draftHours) return draftHours
    return rules.find(r => r.id === selectedRule.id)?.operatingHours ?? null
  }, [selectedRule, rules, draftHours])

  return (
    <>
      <AlertNotification alerts={alerts} onClose={removeAlert} />

      {/* SLA Rule Add / Edit Modal */}
      <SLARuleFormModal
        isOpen={ruleModalOpen}
        onClose={() => { setRuleModalOpen(false); setRuleModalTarget(null) }}
        onSave={handleRuleSave}
        initial={ruleModalTarget}
        existingRules={rules}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteRuleTarget}
        onClose={() => setDeleteRuleTarget(null)}
        onConfirm={handleDelete}
        type="rule"
        itemName={deleteRuleTarget?.slaName ?? ''}
      />

      {/* Header: Title, Search Bar, Add Rule Button */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
        <SectionHeader
          icon={Timer}
          title={t('administratorMenu.tabs.slaRules.title', 'SLA Rules')}
          description={t('administratorMenu.tabs.slaRules.description', 'Manage service level agreements and response times')}
        />
        <div className="flex flex-wrap items-center gap-3">
          <GridSearchBar
            inputRef={searchRef}
            value={search}
            onChange={setSearch}
            placeholder={t('administratorMenu.tabs.slaRules.searchPlaceholder', 'SLA ID, Name, Type, Priority...')}
          />
          <button
            onClick={openAddModal}
            className={`action-button !w-52 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Timer className="w-5 h-5 icon-spin" />
            {t('administratorMenu.tabs.slaRules.addRule', 'Add Rule')}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <CompactStatsCard
          title={t('administratorMenu.tabs.slaRules.slaGroups', 'SLA Groups')}
          value={new Set(rules.map(r => r.slaId)).size}
          icon={Layers2}
          iconBoxColor="#eab308"
        />
        <CompactStatsCard
          title={t('administratorMenu.tabs.slaRules.totalRules', 'Total Rules')}
          value={rules.length}
          icon={Timer}
          iconBoxColor="#22c55e"
        />
        <CompactStatsCard
          title={t('administratorMenu.tabs.slaRules.initialReviewCount', 'Initial Review')}
          value={rules.filter(r => r.slaType === 'Initial Review').length}
          icon={MailSearch}
          iconBoxColor="#3b82f6"
        />
        <CompactStatsCard
          title={t('administratorMenu.tabs.slaRules.completionDueCount', 'Completion Due')}
          value={rules.filter(r => r.slaType === 'Completion Due').length}
          icon={CalendarClock}
          iconBoxColor="#FF6E00"
        />
      </div>

      {/* AG Grid: SLA Rules Table */}
      <div ref={gridWrapperRef} className="rounded-xl overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        <AgGridReact
          key={`sla-rules-grid-${i18n.language}`}
          ref={gridRef}
          domLayout="autoHeight"
          rowData={displayedRules}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowStyle={(params) => {
            const base = getRowStyle(params)
            const isSelected = selectedRule?.id === params.data?.id && !params.data?._skeleton
            return {
              ...base,
              ...(isSelected ? { background: 'var(--color-background-info)' } : {}),
            }
          }}
          getRowClass={(params) => {
            if (!params.data) return ''
            const idx = displayedRules.findIndex(r => r.id === params.data?.id)
            const isGroupLast = idx >= 0 && idx < displayedRules.length - 1 && displayedRules[idx + 1]?.slaId !== params.data?.slaId
            return isGroupLast ? 'sla-group-last' : ''
          }}
          onCellMouseOver={(e) => {
            const slaId = e.data?.slaId
            if (!slaId || slaId === hoveredSlaIdRef.current) return
            hoveredSlaIdRef.current = slaId
            const container = gridWrapperRef.current
            if (!container) return
            container.querySelectorAll('.sla-id-cell.sla-id-hovered').forEach(el => el.classList.remove('sla-id-hovered'))
            container.querySelectorAll('.sla-id-cell').forEach(el => {
              if (el.textContent?.trim() === slaId) el.classList.add('sla-id-hovered')
            })
          }}
          onCellMouseOut={(e) => {
            if (!e.data) return
            hoveredSlaIdRef.current = null
            const container = gridWrapperRef.current
            if (!container) return
            container.querySelectorAll('.sla-id-cell.sla-id-hovered').forEach(el => el.classList.remove('sla-id-hovered'))
          }}
          onCellClicked={handleRowClick}
          onSortChanged={(e) => {
            // Check if any column has an active sort
            const sortModel = e.api.getColumnState().filter(col => col.sort != null)
            setSortActive(sortModel.length > 0)
          }}
          context={gridContext}
          rowHeight={48}
          headerHeight={52}
          suppressCellFocus
          suppressRowTransform
          pagination
          paginationPageSize={16}
          paginationPageSizeSelector={[16, 32, 64, 128, 256]}
          enableRtl={isRTL}
          gridOptions={{
            theme: myTheme,
            enableCellTextSelection: true,
            ensureDomOrder: true,
            overlayNoRowsTemplate: OVERLAY_NO_RULES,
          }}
        />
      </div>

      {/* Separator */}
      <ModernSeparator />

      {/* Operating Hours Section */}
      <div ref={operatingHoursRef}>
        <SectionHeader
          icon={Globe}
          title={t('administratorMenu.tabs.slaRules.operatingHours.title', 'Operating Hours')}
        />

        <SLARuleDetailCard
          selectedRule={selectedRule}
          onEdit={openEditModal}
          onDelete={setDeleteRuleTarget}
          t={t}
          isRTL={isRTL}
        >
          {selectedRule && selectedHours && (
            <OperatingHoursCalendar
              selectedHours={selectedHours}
              hasUnsavedChanges={hasUnsavedChanges}
              onToggleDay={handleToggleDay}
              onTimeChange={handleTimeChange}
              onPresetChange={handlePresetChange}
              onSave={handleSaveOperatingHours}
              t={t}
              isRTL={isRTL}
            />
          )}
        </SLARuleDetailCard>
      </div>
    </>
  )
}
