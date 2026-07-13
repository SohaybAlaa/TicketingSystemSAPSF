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
import SLAAssignmentFormModal from '@components/modals/SLAAssignmentFormModal'
import { buildGridOverlay, defaultColDef, getRowStyle } from '@utils/agGridUtils.jsx'
import { ActionsCellRenderer, TextCellRenderer } from '@components/grid/CellRenderers'
import { SKELETON_ROWS, SkeletonBar } from '@components/ui/GridSkeleton'
import Tag from '@components/ui/Tag'
import { Settings, AlertTriangle, Building2, Logs, Users } from 'lucide-react'
ModuleRegistry.registerModules([AllCommunityModule])

// Tab that displays and manages SLA assignment configurations in an AG Grid table
export default function SLAAssignmentTab() {
  const { t, i18n } = useTranslation()
  // isRTL flips grid direction and layout for Arabic
  const isRTL = i18n.language === 'ar'

  // SLA ID options are loaded from the sla-policies endpoint (see effect below)
  const [slaIdOptions, setSlaIdOptions] = useState([])

  // Column definitions
  const columnDefs = useMemo(() => [
    {
      field: 'slaId',
      headerName: t('administratorMenu.tabs.slaAssignment.columns.slaId', 'SLA ID'),
      flex: 0.8, minWidth: 130,
      cellRenderer: TextCellRenderer,
      cellStyle: { fontWeight: '700' },
    },
    {
      field: 'entity',
      headerName: t('administratorMenu.tabs.slaAssignment.columns.entity', 'Entity'),
      flex: 1.2, minWidth: 150,
      cellRenderer: TextCellRenderer,
      cellStyle: { fontWeight: '700' },
    },
    {
      field: 'employeeClass',
      headerName: t('administratorMenu.tabs.slaAssignment.columns.employeeClass', 'Employee Class'),
      flex: 1.2, minWidth: 155,
      headerClass: 'ag-header-cell-center',
      cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
      cellRenderer: (params) => params.data?._skeleton
        ? <SkeletonBar rowIndex={params.node?.rowIndex ?? 0} centered />
        : <Tag type="employeeClass" value={params.value} showIcon t={t} isRTL={isRTL} />,
    },
    {
      field: 'supportCategory',
      headerName: t('administratorMenu.tabs.slaAssignment.columns.supportCategory', 'Support Category'),
      flex: 1.4, minWidth: 170,
      cellRenderer: TextCellRenderer,
      cellStyle: { fontWeight: '600' },
    },
    {
      field: 'subcategory',
      headerName: t('administratorMenu.tabs.slaAssignment.columns.subcategory', 'Subcategory'),
      flex: 1.2, minWidth: 150,
      cellRenderer: TextCellRenderer,
      cellStyle: { fontWeight: '600' },
    },
    {
      headerName: t('administratorMenu.tabs.slaAssignment.columns.action', 'Action'),
      flex: 0.5, minWidth: 100,
      sortable: false, filter: false, suppressMovable: true,
      cellRenderer: ActionsCellRenderer,
    },
  ], [t, isRTL])

  // Custom overlay shown by AG Grid when there are no rows to display
  const OVERLAY_EMPTY = useMemo(() => buildGridOverlay({
    icon: AlertTriangle,
    heading: t('administratorMenu.tabs.slaAssignment.overlay.noConfigs', 'No SLA assignments found'),
    sub: t('administratorMenu.tabs.slaAssignment.overlay.noConfigsSub', 'Add your first SLA assignment or adjust your search filters'),
  }), [t])

  // Main data list for the grid
  const [configs, setConfigs] = useState([])

  // Live dropdown sources for the form modal (entities/categories+subcategories)
  const [entityOptions, setEntityOptions] = useState([])
  const [categories,    setCategories]    = useState([])

  // Ticketing rules, fetched read-only so we can warn when an assignment has no matching
  // ticketing rule — that combo would get a real SLA timer but never a Group/Priority
  // (SLA_FLOW_DOCUMENTATION Steps 2 and 3 are independent lookups; nothing else catches this).
  const [ticketingRules, setTicketingRules] = useState([])

  // Data-loading (initial fetch) and mutation (create/update/delete) states
  const [isLoading,    setIsLoading]    = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  // null = closed, 'new' = create form, object = edit form with existing row data
  const [configModal, setConfigModal] = useState(null)
  // Holds the row pending deletion so the confirm modal knows what to remove
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [alerts, setAlerts] = useState([])

  // Shows a timed toast; auto-removes after success/warning/error durations
  const pushAlert = useCallback((type, title, message) => {
    const id = Date.now() + Math.random()
    const durations = { success: 3000, warning: 5000, error: 7000 }
    setAlerts(prev => [{ id, type, title, message }, ...prev])
    setTimeout(() => setAlerts(prev => prev.filter(a => a.id !== id)), durations[type] ?? 4000)
  }, [])

  // Manually dismisses a toast by its id
  const removeAlert = useCallback((id) => setAlerts(prev => prev.filter(a => a.id !== id)), [])

  // quickFilterText on the grid uses this to filter rows client-side
  const [search, setSearch] = useState('')
  const searchRef = useRef(null)
  const gridRef = useRef(null)
  // Auto-focus the search bar when the tab mounts
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

  // Fetch assignments + SLA policy options from the API on first mount
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setIsLoading(true)
        const [aRes, pRes] = await Promise.all([
          fetch('/api/public/administrator/sla-assignments'),
          fetch('/api/public/administrator/sla-policies'),
        ])
        if (!aRes.ok) throw new Error(`HTTP ${aRes.status}`)
        const aData = await aRes.json()
        if (!aData.success) throw new Error(aData.error || 'Failed to load assignments')
        if (!cancelled) setConfigs(aData.assignments || [])
        // Policy options are non-critical; ignore their failure quietly
        if (pRes.ok) {
          const pData = await pRes.json()
          if (!cancelled && pData.success) setSlaIdOptions((pData.policies || []).map(p => p.slaId))
        }
      } catch (err) {
        console.error('[SLAAssignment] Failed to fetch data:', err)
        if (!cancelled) {
          pushAlert('error', t('administratorMenu.tabs.slaAssignment.alerts.loadFailed', 'Failed to load assignments'), err.message)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [pushAlert, t])

  // Fetch live entity/category options for the create/edit form (must match the DB exactly,
  // since the backend resolves these by name — see resolveAssignmentIds in sla-assignments/create.js)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [eRes, cRes, rRes] = await Promise.all([
          fetch('/api/public/administrator/entities'),
          fetch('/api/public/administrator/categories'),
          fetch('/api/public/administrator/ticketing-rules'),
        ])
        const [eData, cData, rData] = await Promise.all([eRes.json(), cRes.json(), rRes.json()])
        if (cancelled) return
        if (eData.success) setEntityOptions((eData.entities || []).map(e => e.name))
        if (cData.success) setCategories(cData.categories || [])
        if (rData.success) setTicketingRules(rData.rules || [])
      } catch (err) {
        console.error('[SLAAssignment] Failed to fetch form options:', err)
      }
    })()
    return () => { cancelled = true }
  }, [])

  // Adds a new assignment or updates an existing one via the API
  const handleSave = useCallback(async (form) => {
    if (isProcessing) return
    const isNew = configModal === 'new'
    setIsProcessing(true)
    try {
      if (isNew) {
        const data = await apiRequest('/api/public/administrator/sla-assignments/create', form)
        setConfigs(prev => [...prev, data.assignment])
      } else {
        const data = await apiRequest('/api/public/administrator/sla-assignments/update', { id: configModal.id, ...form })
        setConfigs(prev => prev.map(r => (r.id === configModal.id ? data.assignment : r)))
      }
      setConfigModal(null)
      pushAlert(
        'success',
        isNew
          ? t('administratorMenu.tabs.slaAssignment.alerts.created', 'Assignment added')
          : t('administratorMenu.tabs.slaAssignment.alerts.updated', 'Assignment updated'),
        isNew
          ? t('administratorMenu.tabs.slaAssignment.alerts.createdMsg', 'New SLA assignment has been added.')
          : t('administratorMenu.tabs.slaAssignment.alerts.updatedMsg', 'SLA assignment has been updated.'),
      )

      // Warn if this combo has no matching Ticketing Rule — tickets would get a real SLA
      // timer but never be routed to a group or get an authoritative priority.
      const hasMatchingRule = ticketingRules.some(r =>
        r.entity === form.entity &&
        r.employeeClass === form.employeeClass &&
        r.supportCategory === form.supportCategory &&
        r.subcategory === form.subcategory
      )
      if (!hasMatchingRule) {
        pushAlert(
          'warning',
          t('administratorMenu.tabs.slaAssignment.alerts.noTicketingRule', 'No matching Ticketing Rule'),
          t('administratorMenu.tabs.slaAssignment.alerts.noTicketingRuleMsg', 'Tickets for this Entity + Employee Class + Category + Subcategory will get a real SLA timer, but won\'t be routed to a group or get an authoritative priority until a Ticketing Rule is added for the same combo.'),
        )
      }
    } catch (err) {
      console.error('[SLAAssignment] Save failed:', err)
      pushAlert('error', t('administratorMenu.tabs.slaAssignment.alerts.saveFailed', 'Save failed'), err.message)
    } finally {
      setIsProcessing(false)
    }
  }, [configModal, ticketingRules, pushAlert, t, apiRequest, isProcessing])

  // Removes the row stored in deleteTarget via the API and shows a success alert
  const handleDelete = useCallback(async () => {
    if (isProcessing) return
    const { id } = deleteTarget
    setIsProcessing(true)
    try {
      await apiRequest('/api/public/administrator/sla-assignments/delete', { id })
      setConfigs(prev => prev.filter(r => r.id !== id))
      setDeleteTarget(null)
      pushAlert(
        'success',
        t('administratorMenu.tabs.slaAssignment.alerts.deleted', 'Assignment removed'),
        t('administratorMenu.tabs.slaAssignment.alerts.deletedMsg', 'SLA assignment has been removed.'),
      )
    } catch (err) {
      console.error('[SLAAssignment] Delete failed:', err)
      pushAlert('error', t('administratorMenu.tabs.slaAssignment.alerts.deleteFailed', 'Delete failed'), err.message)
    } finally {
      setIsProcessing(false)
    }
  }, [deleteTarget, pushAlert, t, apiRequest, isProcessing])

  // Passed to AG Grid so cell renderers can trigger edit/delete actions
  const gridContext = useMemo(() => ({
    onEdit: (r) => setConfigModal(r),
    onDelete: (r) => setDeleteTarget(r),
  }), [])

  return (
    <>
      <AlertNotification alerts={alerts} onClose={removeAlert} />

      {/* Add / Edit Modal */}
      <SLAAssignmentFormModal
        isOpen={configModal === 'new' || !!(configModal?.id)}
        onClose={() => setConfigModal(null)}
        onSave={handleSave}
        initial={configModal === 'new' ? null : configModal}
        existingConfigs={configs}
        slaIdOptions={slaIdOptions}
        entityOptions={entityOptions}
        categories={categories}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        type="assignment"
        itemName={deleteTarget ? `${deleteTarget.entity} / ${deleteTarget.supportCategory}` : ''}
      />

      {/* Header: Title, Search, Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
        <SectionHeader
          icon={Settings}
          title={t('administratorMenu.tabs.slaAssignment.title', 'SLA Assignment')}
          description={t('administratorMenu.tabs.slaAssignment.description', 'Assign SLA rules to categories and employee classes')}
        />
        <div className="flex flex-wrap items-center gap-3">
          <GridSearchBar
            inputRef={searchRef}
            value={search}
            onChange={setSearch}
            placeholder={t('administratorMenu.tabs.slaAssignment.searchPlaceholder', 'Search assignments...')}
          />
          <button
            onClick={() => setConfigModal('new')}
            className={`action-button !w-52 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Settings className="w-5 h-5 icon-spin" />
            {t('administratorMenu.tabs.slaAssignment.addConfig', 'Add Assignment')}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <CompactStatsCard
          title={t('administratorMenu.tabs.slaAssignment.totalConfigs', 'Total Configs')}
          value={configs.length}
          icon={Settings}
          iconBoxColor="#eab308"
        />
        <CompactStatsCard
          title={t('administratorMenu.tabs.slaAssignment.entities', 'Entities')}
          value={new Set(configs.map(r => r.entity)).size}
          icon={Building2}
          iconBoxColor="#22c55e"
        />
        <CompactStatsCard
          title={t('administratorMenu.tabs.slaAssignment.categories', 'Categories')}
          value={new Set(configs.map(r => r.supportCategory)).size}
          icon={Logs}
          iconBoxColor="#3b82f6"
        />
        <CompactStatsCard
          title={t('administratorMenu.tabs.slaAssignment.employeeClasses', 'Employee Classes')}
          value={new Set(configs.map(r => r.employeeClass)).size}
          icon={Users}
          iconBoxColor="#FF6E00"
        />
      </div>

      {/* AG Grid */}
      <div className="rounded-xl overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        <AgGridReact
          key={`sla-config-grid-${i18n.language}`}
          ref={gridRef}
          domLayout="autoHeight"
          rowData={isLoading ? SKELETON_ROWS : configs}
          quickFilterText={isLoading ? '' : search}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowStyle={getRowStyle}
          context={gridContext}
          rowHeight={48}
          headerHeight={52}
          suppressCellFocus
          pagination={!isLoading}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 25, 50]}
          enableRtl={isRTL}
          gridOptions={{
            theme: myTheme,
            enableCellTextSelection: true,
            ensureDomOrder: true,
            overlayNoRowsTemplate: OVERLAY_EMPTY,
          }}
        />
      </div>
    </>
  )
}
