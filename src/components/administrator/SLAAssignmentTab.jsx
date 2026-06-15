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
import { MOCK_SLA_CONFIGURATIONS, MOCK_SLA_RULES } from '@data/mockData'
import { buildGridOverlay, defaultColDef, getRowStyle } from '@utils/agGridUtils.jsx'
import { ActionsCellRenderer, TextCellRenderer } from '@components/grid/CellRenderers'
import Tag from '@components/ui/Tag'
import { Settings, AlertTriangle, Building2, Logs, Users } from 'lucide-react'
ModuleRegistry.registerModules([AllCommunityModule])

// Tab that displays and manages SLA assignment configurations in an AG Grid table
export default function SLAAssignmentTab() {
  const { t, i18n } = useTranslation()
  // isRTL flips grid direction and layout for Arabic
  const isRTL = i18n.language === 'ar'

  // Get SLA ID options from the actual SLA Rules data
  const slaIdOptions = useMemo(() => {
    const uniqueIds = [...new Set(MOCK_SLA_RULES.map(r => r.slaId))].sort()
    return uniqueIds
  }, [])

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
      cellRenderer: (params) => <Tag type="employeeClass" value={params.value} showIcon t={t} isRTL={isRTL} />,
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
  const [configs, setConfigs] = useState(MOCK_SLA_CONFIGURATIONS)
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

  // Adds a new config with an auto-generated SLA-### id, or updates an existing one
  const handleSave = useCallback((form) => {
    const isNew = configModal === 'new'
    if (isNew) {
      const maxId = configs.reduce((m, r) => Math.max(m, r.id), 0)
      // Find the highest existing SLA number so the next id is always unique
      const nextNum = configs.reduce((m, r) => {
        const n = parseInt(r.slaId?.replace('SLA-', ''), 10)
        return isNaN(n) ? m : Math.max(m, n)
      }, 0) + 1
      const newConfig = {
        id: maxId + 1,
        slaId: `SLA-${String(nextNum).padStart(3, '0')}`,
        ...form,
      }
      setConfigs(prev => [...prev, newConfig])
    } else {
      setConfigs(prev => prev.map(r => r.id === configModal.id ? { ...r, ...form } : r))
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
  }, [configModal, configs, pushAlert, t])

  // Removes the row stored in deleteTarget and shows a success alert
  const handleDelete = useCallback(() => {
    const { id } = deleteTarget
    setConfigs(prev => prev.filter(r => r.id !== id))
    setDeleteTarget(null)
    pushAlert(
      'success',
      t('administratorMenu.tabs.slaAssignment.alerts.deleted', 'Assignment removed'),
      t('administratorMenu.tabs.slaAssignment.alerts.deletedMsg', 'SLA assignment has been removed.'),
    )
  }, [deleteTarget, pushAlert, t])

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
      <div className="flex items-center justify-between mb-3">
        <SectionHeader
          icon={Settings}
          title={t('administratorMenu.tabs.slaAssignment.title', 'SLA Assignment')}
          description={t('administratorMenu.tabs.slaAssignment.description', 'Assign SLA rules to categories and employee classes')}
        />
        <div className="flex items-center gap-4">
          <GridSearchBar
            inputRef={searchRef}
            value={search}
            onChange={setSearch}
            placeholder={t('administratorMenu.tabs.slaAssignment.searchPlaceholder', 'Search assignments...')}
          />
          <button
            onClick={() => setConfigModal('new')}
            className={`action-button !w-52 ${isRTL ? 'flex-row-reverse' : ''}`}
            onMouseEnter={e => {
              const i = e.currentTarget.querySelector('.icon-spin')
              if (i) { i.style.transition = 'transform 1s ease'; i.style.transform = 'rotate(360deg)' }
            }}
            onMouseLeave={e => {
              const i = e.currentTarget.querySelector('.icon-spin')
              if (i) { i.style.transition = 'none'; i.style.transform = 'rotate(0deg)' }
            }}
          >
            <Settings className="w-5 h-5 icon-spin" />
            {t('administratorMenu.tabs.slaAssignment.addConfig', 'Add Assignment')}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
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
          rowData={configs}
          quickFilterText={search}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowStyle={getRowStyle}
          context={gridContext}
          rowHeight={48}
          headerHeight={52}
          suppressCellFocus
          pagination
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
