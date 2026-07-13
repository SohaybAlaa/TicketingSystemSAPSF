import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { useTranslation } from 'react-i18next'
import { myTheme } from '@utils/agGridThemes'
import SectionHeader from '@components/ui/SectionHeader'
import GridSearchBar from '@components/ui/GridSearchBar'
import CompactStatsCard from '@components/ui/CompactStatsCard'
import AlertNotification from '@components/ui/AlertNotification'
import DeleteConfirmModal from '@components/modals/DeleteConfirmModal'
import TicketingRuleFormModal from '@components/modals/TicketingRuleFormModal'
import { buildGridOverlay, defaultColDef, getRowStyle } from '@utils/agGridUtils.jsx'
import { ActionsCellRenderer, TextCellRenderer } from '@components/grid/CellRenderers'
import { SKELETON_ROWS, SkeletonBar } from '@components/ui/GridSkeleton'
import Tag from '@components/ui/Tag'
import { SlidersHorizontal, AlertTriangle, Logs, CirclePile, Building2 } from 'lucide-react'

ModuleRegistry.registerModules([AllCommunityModule])

/**
 * TicketingRulesTab Component
 * 
 * Manages the ticketing rules administration interface with CRUD operations.
 * Displays rules in an AG Grid table with search, filtering, and bulk statistics.
 * Supports RTL languages and provides modal-based create/edit/delete workflows.
 */
export default function TicketingRulesTab() {
  // Internationalization and RTL support
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Define AG Grid column configuration with custom renderers
  const columnDefs = useMemo(() => [
    {
      field: 'entity',
      headerName: t('administratorMenu.tabs.ticketingRules.columns.entity', 'Entity'),
      flex: 1.2, minWidth: 130,
      cellRenderer: TextCellRenderer,
      cellStyle: { fontWeight: '700' },
    },
    {
      field: 'employeeClass',
      headerName: t('administratorMenu.tabs.ticketingRules.columns.employeeClass', 'Employee Class'),
      flex: 1.2, minWidth: 145,
      headerClass: 'ag-header-cell-center',
      cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
      cellRenderer: (params) => params.data?._skeleton
        ? <SkeletonBar rowIndex={params.node?.rowIndex ?? 0} centered />
        : <Tag type="employeeClass" value={params.value} showIcon t={t} isRTL={isRTL} />,
    },
    {
      field: 'supportCategory',
      headerName: t('administratorMenu.tabs.ticketingRules.columns.supportCategory', 'Support Category'),
      flex: 1.4, minWidth: 155,
      cellRenderer: TextCellRenderer,
      cellStyle: { fontWeight: '600' },
    },
    {
      field: 'subcategory',
      headerName: t('administratorMenu.tabs.ticketingRules.columns.subcategory', 'Subcategory'),
      flex: 1.2, minWidth: 130,
      cellRenderer: TextCellRenderer,
      cellStyle: { fontWeight: '600' },
    },
    {
      field: 'group',
      headerName: t('administratorMenu.tabs.ticketingRules.columns.group', 'Group'),
      flex: 1.4, minWidth: 150,
      cellRenderer: TextCellRenderer,
      cellStyle: { fontWeight: '500' },
    },
    {
      field: 'priority',
      headerName: t('administratorMenu.tabs.ticketingRules.columns.priority', 'Priority'),
      flex: 0.9, minWidth: 110,
      headerClass: 'ag-header-cell-center',
      cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
      // Render priority as a colored tag badge
      cellRenderer: (params) => params.data?._skeleton
        ? <SkeletonBar rowIndex={params.node?.rowIndex ?? 0} centered />
        : <Tag type="priority" value={params.value} t={t} isRTL={isRTL} />,
    },
    {
      headerName: t('administratorMenu.tabs.ticketingRules.columns.action', 'Action'),
      flex: 0.5, minWidth: 100,
      sortable: false, filter: false, suppressMovable: true,
      // Render edit/delete action buttons
      cellRenderer: ActionsCellRenderer,
    },
  ], [t, isRTL])

  // Empty state overlay when no rules match search/filter
  const OVERLAY_NO_RULES = useMemo(() => buildGridOverlay({
    icon: AlertTriangle,
    heading: t('administratorMenu.tabs.ticketingRules.overlay.noRules', 'No ticketing rules found'),
    sub: t('administratorMenu.tabs.ticketingRules.overlay.noRulesSub', 'Add your first rule or adjust your search filters'),
  }), [t])

  // State: Rules data
  const [rules, setRules] = useState([])

  // Live dropdown sources for the form modal (entities/categories+subcategories/groups)
  const [entityOptions, setEntityOptions] = useState([])
  const [categories,    setCategories]    = useState([])
  const [groupOptions,  setGroupOptions]  = useState([])

  // SLA assignments, fetched read-only so we can warn when a rule has no matching SLA
  // assignment — that combo would route+prioritize tickets but never get a real SLA timer
  // (SLA_FLOW_DOCUMENTATION Steps 2 and 3 are independent lookups; nothing else catches this).
  const [slaAssignments, setSlaAssignments] = useState([])

  // Data-loading (initial fetch) and mutation (create/update/delete) states
  const [isLoading,    setIsLoading]    = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  // State: Modal management (null | 'new' | ruleObject for edit)
  const [ruleModal,        setRuleModal]        = useState(null)
  const [deleteRuleTarget, setDeleteRuleTarget] = useState(null)

  // State: Alert notifications queue
  const [alerts, setAlerts] = useState([])

  // Add alert to queue with auto-dismiss based on type
  const pushAlert = useCallback((type, title, message) => {
    const id = Date.now() + Math.random()
    const durations = { success: 3000, warning: 5000, error: 7000 }
    setAlerts(prev => [{ id, type, title, message }, ...prev])
    setTimeout(() => setAlerts(prev => prev.filter(a => a.id !== id)), durations[type] ?? 4000)
  }, [])

  // Remove alert from queue
  const removeAlert = useCallback((id) => setAlerts(prev => prev.filter(a => a.id !== id)), [])

  // State: Search/filter and grid references
  const [search,    setSearch]    = useState('')
  const searchRef                 = useRef(null)
  const gridRef                   = useRef(null)

  // Auto-focus search input on mount
  useEffect(() => { searchRef.current?.focus() }, [])

  // Generic POST helper for create/update/delete — throws on failure
  const apiRequest = useCallback(async (url, body) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.success) {
      throw new Error(data.error || `HTTP ${res.status}`)
    }
    return data
  }, [])

  // Fetch the ticketing rules list from the API on first mount
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setIsLoading(true)
        const res = await fetch('/api/public/administrator/ticketing-rules')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!data.success) throw new Error(data.error || 'Failed to load rules')
        if (!cancelled) setRules(data.rules || [])
      } catch (err) {
        console.error('[TicketingRules] Failed to fetch rules:', err)
        if (!cancelled) {
          pushAlert('error', t('administratorMenu.tabs.ticketingRules.alerts.loadFailed', 'Failed to load rules'), err.message)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [pushAlert, t])

  // Fetch live entity/category/group options for the create/edit form (must match the DB
  // exactly, since the backend resolves these by name — see resolveRuleIds in ticketing-rules/create.js)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [eRes, cRes, gRes, aRes] = await Promise.all([
          fetch('/api/public/administrator/entities'),
          fetch('/api/public/administrator/categories'),
          fetch('/api/public/administrator/groups'),
          fetch('/api/public/administrator/sla-assignments'),
        ])
        const [eData, cData, gData, aData] = await Promise.all([eRes.json(), cRes.json(), gRes.json(), aRes.json()])
        if (cancelled) return
        if (eData.success) setEntityOptions((eData.entities || []).map(e => e.name))
        if (cData.success) setCategories(cData.categories || [])
        if (gData.success) setGroupOptions((gData.groups || []).map(g => g.name))
        if (aData.success) setSlaAssignments(aData.assignments || [])
      } catch (err) {
        console.error('[TicketingRules] Failed to fetch form options:', err)
      }
    })()
    return () => { cancelled = true }
  }, [])

  // Handler: Save new or updated rule via the API
  const handleSave = useCallback(async (form) => {
    if (isProcessing) return
    const isNew = ruleModal === 'new'
    setIsProcessing(true)
    try {
      let updated
      if (isNew) {
        const data = await apiRequest('/api/public/administrator/ticketing-rules/create', form)
        updated = [...rules, data.rule]
      } else {
        const data = await apiRequest('/api/public/administrator/ticketing-rules/update', { id: ruleModal.id, ...form })
        updated = rules.map(r => (r.id === ruleModal.id ? data.rule : r))
      }
      setRules(updated)
      setRuleModal(null)
      pushAlert(
        'success',
        isNew
          ? t('administratorMenu.tabs.ticketingRules.alerts.created', 'Rule added')
          : t('administratorMenu.tabs.ticketingRules.alerts.updated', 'Rule updated'),
        isNew
          ? t('administratorMenu.tabs.ticketingRules.alerts.createdMsg', 'New ticketing rule has been added.')
          : t('administratorMenu.tabs.ticketingRules.alerts.updatedMsg', 'Ticketing rule has been updated.'),
      )

      // Warn if this combo has no matching SLA Assignment — tickets routed by this rule
      // would get a Group + Priority but never a real SLA timer (fall back to a flat deadline).
      const hasMatchingAssignment = slaAssignments.some(a =>
        a.entity === form.entity &&
        a.employeeClass === form.employeeClass &&
        a.supportCategory === form.supportCategory &&
        a.subcategory === form.subcategory
      )
      if (!hasMatchingAssignment) {
        pushAlert(
          'warning',
          t('administratorMenu.tabs.ticketingRules.alerts.noSlaAssignment', 'No matching SLA Assignment'),
          t('administratorMenu.tabs.ticketingRules.alerts.noSlaAssignmentMsg', 'Tickets for this Entity + Employee Class + Category + Subcategory will be routed but won\'t get a real SLA timer until an SLA Assignment is added for the same combo.'),
        )
      }
    } catch (err) {
      console.error('[TicketingRules] Save failed:', err)
      pushAlert('error', t('administratorMenu.tabs.ticketingRules.alerts.saveFailed', 'Save failed'), err.message)
    } finally {
      setIsProcessing(false)
    }
  }, [ruleModal, rules, slaAssignments, pushAlert, t, apiRequest, isProcessing])

  // Handler: Delete rule after confirmation via the API
  const handleDelete = useCallback(async () => {
    if (isProcessing) return
    const { id, supportCategory, subcategory } = deleteRuleTarget
    setIsProcessing(true)
    try {
      await apiRequest('/api/public/administrator/ticketing-rules/delete', { id })
      const updated = rules.filter(r => r.id !== id)
      setRules(updated)
      setDeleteRuleTarget(null)
      pushAlert(
        'success',
        t('administratorMenu.tabs.ticketingRules.alerts.deleted', 'Rule removed'),
        t('administratorMenu.tabs.ticketingRules.alerts.deletedMsg', { supportCategory, subcategory }, `${supportCategory} / ${subcategory} rule has been removed.`),
      )
    } catch (err) {
      console.error('[TicketingRules] Delete failed:', err)
      pushAlert('error', t('administratorMenu.tabs.ticketingRules.alerts.deleteFailed', 'Delete failed'), err.message)
    } finally {
      setIsProcessing(false)
    }
  }, [rules, deleteRuleTarget, pushAlert, t, apiRequest, isProcessing])

  // Context passed to grid for row action handlers
  const gridContext = useMemo(() => ({
    onEdit:   (r) => setRuleModal(r),
    onDelete: (r) => setDeleteRuleTarget(r),
  }), [])

  return (
    <>
      <AlertNotification alerts={alerts} onClose={removeAlert} />

      {/* Modal: Create/Edit Rule Form */}
      <TicketingRuleFormModal
        isOpen={ruleModal === 'new' || !!(ruleModal?.id)}
        onClose={() => setRuleModal(null)}
        onSave={handleSave}
        initial={ruleModal === 'new' ? null : ruleModal}
        existingRules={rules}
        entityOptions={entityOptions}
        categories={categories}
        groupOptions={groupOptions}
      />
      {/* Modal: Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={!!deleteRuleTarget}
        onClose={() => setDeleteRuleTarget(null)}
        onConfirm={handleDelete}
        type="rule"
        itemName={deleteRuleTarget ? `${deleteRuleTarget.supportCategory} / ${deleteRuleTarget.subcategory}` : ''}
      />

      {/* Header: Title, Search Bar, Add Rule Button */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
        <SectionHeader
          icon={SlidersHorizontal}
          title={t('administratorMenu.tabs.ticketingRules.title', 'Ticketing Rules')}
          description={t('administratorMenu.tabs.ticketingRules.description', 'Configure ticket routing and assignment rules')}
        />
        <div className="flex flex-wrap items-center gap-3">
          <GridSearchBar
            inputRef={searchRef}
            value={search}
            onChange={setSearch}
            placeholder={t('administratorMenu.tabs.ticketingRules.searchPlaceholder', 'Search rules...')}
          />
          {/* Add Rule Button with icon rotation on hover */}
          <button
            onClick={() => setRuleModal('new')}
            className={`action-button !w-52 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <SlidersHorizontal className="w-5 h-5 icon-spin" />
            {t('administratorMenu.tabs.ticketingRules.addRule', 'Add Rule')}
          </button>
        </div>
      </div>

      {/* Stats Row: Quick overview cards (Total, Categories, Groups) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <CompactStatsCard
          title={t('administratorMenu.tabs.ticketingRules.totalRules', 'Total Rules')}
          value={rules.length}
          icon={SlidersHorizontal}
          iconBoxColor="#eab308"
        />
        <CompactStatsCard
          title={t('administratorMenu.tabs.ticketingRules.categories', 'Categories')}
          value={new Set(rules.map(r => r.supportCategory)).size}
          icon={Logs}
          iconBoxColor="#22c55e"
        />
        <CompactStatsCard
          title={t('administratorMenu.tabs.ticketingRules.groups', 'Groups')}
          value={new Set(rules.map(r => r.group)).size}
          icon={CirclePile}
          iconBoxColor="#3b82f6"
        />
        <CompactStatsCard
          title={t('administratorMenu.tabs.ticketingRules.entities', 'Entities')}
          value={new Set(rules.map(r => r.entity)).size}
          icon={Building2}
          iconBoxColor="#FF6E00"
        />
      </div>

      {/* AG Grid: Rules Table with search, pagination, and RTL support */}
      <div className="rounded-xl overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        <AgGridReact
          key={`ticketing-rules-grid-${i18n.language}`}
          ref={gridRef}
          domLayout="autoHeight"
          rowData={isLoading ? SKELETON_ROWS : rules}
          quickFilterText={isLoading ? '' : search}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowStyle={getRowStyle}
          context={gridContext}
          rowHeight={48}
          headerHeight={52}
          suppressCellFocus
          pagination={!isLoading}
          paginationPageSize={20}
          paginationPageSizeSelector={[20, 50, 100]}
          enableRtl={isRTL}
          gridOptions={{
            theme: myTheme,
            enableCellTextSelection: true,
            ensureDomOrder: true,
            overlayNoRowsTemplate: OVERLAY_NO_RULES,
          }}
        />
      </div>

    </>
  )
}
