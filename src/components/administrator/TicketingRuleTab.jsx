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
import { MOCK_TICKETING_RULES } from '@data/mockData'
import { buildGridOverlay, defaultColDef, getRowStyle } from '@utils/agGridUtils.jsx'
import { ActionsCellRenderer, TextCellRenderer } from '@components/grid/CellRenderers'
import Tag from '@components/ui/Tag'
import { SlidersHorizontal, AlertTriangle, Logs, CirclePile, UserCog } from 'lucide-react'

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
    },
    {
      field: 'supportCategory',
      headerName: t('administratorMenu.tabs.ticketingRules.columns.supportCategory', 'Support Category'),
      flex: 1.4, minWidth: 155,
      cellRenderer: TextCellRenderer,
    },
    {
      field: 'subcategory',
      headerName: t('administratorMenu.tabs.ticketingRules.columns.subcategory', 'Subcategory'),
      flex: 1.2, minWidth: 130,
      cellRenderer: TextCellRenderer,
    },
    {
      field: 'group',
      headerName: t('administratorMenu.tabs.ticketingRules.columns.group', 'Group'),
      flex: 1.4, minWidth: 150,
      cellRenderer: TextCellRenderer,
    },
    {
      field: 'agent',
      headerName: t('administratorMenu.tabs.ticketingRules.columns.agent', 'Agent'),
      flex: 1.2, minWidth: 130,
      cellRenderer: TextCellRenderer,
      cellStyle: { fontWeight: '600' },
    },
    {
      field: 'priority',
      headerName: t('administratorMenu.tabs.ticketingRules.columns.priority', 'Priority'),
      flex: 0.9, minWidth: 110,
      headerClass: 'ag-header-cell-center',
      cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
      // Render priority as a colored tag badge
      cellRenderer: (params) => <Tag type="priority" value={params.value} t={t} isRTL={isRTL} />,
    },
    {
      field: 'employeeClass',
      headerName: t('administratorMenu.tabs.ticketingRules.columns.employeeClass', 'Employee Class'),
      flex: 1.2, minWidth: 145,
      // Translate employee class values dynamically
      cellRenderer: (params) => t(`administratorMenu.tabs.ticketingRules.employeeClasses.${params.value}`, params.value),
    },
    {
      headerName: t('administratorMenu.tabs.ticketingRules.columns.action', 'Action'),
      flex: 0.5, minWidth: 100,
      sortable: false, filter: false, suppressMovable: true,
      // Render edit/delete action buttons
      cellRenderer: ActionsCellRenderer,
    },
  ], [t])

  // Empty state overlay when no rules match search/filter
  const OVERLAY_NO_RULES = useMemo(() => buildGridOverlay({
    icon: AlertTriangle,
    heading: t('administratorMenu.tabs.ticketingRules.overlay.noRules', 'No ticketing rules found'),
    sub: t('administratorMenu.tabs.ticketingRules.overlay.noRulesSub', 'Add your first rule or adjust your search filters'),
  }), [t])

  // State: Rules data
  const [rules, setRules] = useState(MOCK_TICKETING_RULES)

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

  // Handler: Save new or updated rule
  const handleSave = useCallback((form) => {
    const isNew = ruleModal === 'new'
    const updated = isNew
      ? [...rules, { ...form, id: Date.now() }]
      : rules.map(r => r.id === ruleModal.id ? { ...r, ...form } : r)

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
  }, [ruleModal, rules, pushAlert, t])

  // Handler: Delete rule after confirmation
  const handleDelete = useCallback(() => {
    const { id, supportCategory, subcategory } = deleteRuleTarget
    const updated = rules.filter(r => r.id !== id)
    setRules(updated)
    setDeleteRuleTarget(null)
    pushAlert(
      'success',
      t('administratorMenu.tabs.ticketingRules.alerts.deleted', 'Rule removed'),
      t('administratorMenu.tabs.ticketingRules.alerts.deletedMsg', { supportCategory, subcategory }, `${supportCategory} / ${subcategory} rule has been removed.`),
    )
  }, [rules, deleteRuleTarget, pushAlert, t])

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
      <div className="flex items-center justify-between mb-3">
        <SectionHeader
          icon={SlidersHorizontal}
          title={t('administratorMenu.tabs.ticketingRules.title', 'Ticketing Rules')}
        />
        <div className="flex items-center gap-4">
          <GridSearchBar
            inputRef={searchRef}
            value={search}
            onChange={setSearch}
            placeholder={t('administratorMenu.tabs.ticketingRules.searchPlaceholder', 'Search rules...')}
          />
          {/* Add Rule Button with icon rotation on hover */}
          <button
            onClick={() => setRuleModal('new')}
            className={`action-button ${isRTL ? 'flex-row-reverse' : ''}`}
            onMouseEnter={e => {
              const i = e.currentTarget.querySelector('.icon-spin')
              if (i) { i.style.transition = 'transform 1s ease'; i.style.transform = 'rotate(360deg)' }
            }}
            onMouseLeave={e => {
              const i = e.currentTarget.querySelector('.icon-spin')
              if (i) { i.style.transition = 'none'; i.style.transform = 'rotate(0deg)' }
            }}
          >
            <SlidersHorizontal className="w-5 h-5 icon-spin" />
            {t('administratorMenu.tabs.ticketingRules.addRule', 'Add Rule')}
          </button>
        </div>
      </div>

      {/* Stats Row: Quick overview cards (Total, Categories, Groups, Agents) */}
      <div className="grid grid-cols-4 gap-3 mb-5">
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
          title={t('administratorMenu.tabs.ticketingRules.agents', 'Agents')}
          value={new Set(rules.map(r => r.agent).filter(Boolean)).size}
          icon={UserCog}
          iconBoxColor="#8b5cf6"
        />
      </div>

      {/* AG Grid: Rules Table with search, pagination, and RTL support */}
      <div className="rounded-xl overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        <AgGridReact
          key={`ticketing-rules-grid-${i18n.language}`}
          ref={gridRef}
          domLayout="autoHeight"
          rowData={rules}
          quickFilterText={search}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowStyle={getRowStyle}
          context={gridContext}
          rowHeight={48}
          headerHeight={52}
          suppressCellFocus
          pagination
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
