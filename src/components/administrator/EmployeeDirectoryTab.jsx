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
import EmployeeFormModal from '@components/modals/EmployeeFormModal'
import ModernSeparator from '@components/ui/ModernSeparator'
import EmployeeDetailCard from '@components/administrator/employeeDirectory/EmployeeDetailCard'
import { SKELETON_ROWS, SkeletonBar } from '@components/ui/GridSkeleton'
import { UserPlus, Building2, Contact, BookUser, Building, BriefcaseBusiness, Users } from 'lucide-react'
import { buildGridOverlay, defaultColDef, getRowStyle } from '@utils/agGridUtils.jsx'
import { ActionsCellRenderer, TextCellRenderer } from '@components/grid/CellRenderers'
import Tag from '@components/ui/Tag'
ModuleRegistry.registerModules([AllCommunityModule])

// Each object defines one column in the AG Grid table.
// - field: the property name from the employee data object
// - labelKey: used to look up the translated header text via i18n
// - fallback: default English header if translation is missing
// - flex / minWidth: control how wide the column is
// - bold: if true, the cell text will be bold (font-weight 600)
const COLUMN_CONFIG = [
  { field: 'employeeId',    labelKey: 'employeeId',    fallback: 'Employee ID',      flex: 1,   minWidth: 155, bold: true },
  { field: 'name',          labelKey: 'name',          fallback: 'Name',             flex: 1.5, minWidth: 140, bold: true },
  { field: 'entityCode',    labelKey: 'entityCode',    fallback: 'Entity Code',      flex: 1,   minWidth: 150 },
  { field: 'entityName',    labelKey: 'entityName',    fallback: 'Entity Name',      flex: 1.5, minWidth: 140 },
  { field: 'department',    labelKey: 'department',    fallback: 'Department',        flex: 1.5, minWidth: 140 },
  { field: 'employeeClass', labelKey: 'employeeClass', fallback: 'Employee Class',   flex: 1.7, minWidth: 170 },
  { field: 'manager',       labelKey: 'manager',       fallback: 'Manager',          flex: 1.5, minWidth: 140 },
]

// Each object defines one summary stat card shown above the table.
// - titleKey / fallback: i18n key and English fallback for the card title
// - icon / iconBoxColor: Lucide icon component and its background color
// - getValue: function that receives the employees array and returns the number to display
const STATS_CONFIG = [
  { titleKey: 'totalEmployees', fallback: 'Total Employees', icon: BookUser,          iconBoxColor: '#eab308', getValue: (emps) => emps.length },
  { titleKey: 'departments',    fallback: 'Departments',     icon: Building2,         iconBoxColor: '#22c55e', getValue: (emps) => new Set(emps.map(e => e.department)).size },
  { titleKey: 'entities',       fallback: 'Entities',        icon: Building,          iconBoxColor: '#3b82f6', getValue: (emps) => new Set(emps.map(e => e.entityName)).size },
  { titleKey: 'managers',       fallback: 'Managers',        icon: BriefcaseBusiness, iconBoxColor: '#FF6E00', getValue: (emps) => new Set(emps.map(e => e.manager).filter(Boolean)).size },
]

// Main component that renders the full Employee Directory page:
// header + search bar, stat cards, AG Grid table, and a detail card below the table.
export default function EmployeeDirectoryTab() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Build AG Grid column definitions from COLUMN_CONFIG, then append the Actions column.
  // useMemo ensures we only rebuild when the language (t) changes.
  const columnDefs = useMemo(() => [
    ...COLUMN_CONFIG.map(({ field, labelKey, fallback, flex, minWidth, bold }) => ({
      field,
      headerName: t(`administratorMenu.tabs.employeeDirectory.columns.${labelKey}`, fallback),
      flex,
      minWidth,
      ...(field === 'employeeClass'
        ? {
            headerClass: 'ag-header-cell-center',
            cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
            cellRenderer: (params) => params.data?._skeleton
              ? <SkeletonBar rowIndex={params.node?.rowIndex ?? 0} centered />
              : <Tag type="employeeClass" value={params.value} showIcon t={t} isRTL={isRTL} />,
          }
        : {
            cellRenderer: TextCellRenderer,
            ...(bold && { cellStyle: { fontWeight: '600' } }),
          }
      ),
    })),
    {
      headerName: t('administratorMenu.tabs.employeeDirectory.columns.action', 'Action'),
      flex: 0.5,
      minWidth: 100,
      sortable: false,
      filter: false,
      suppressMovable: true,
      cellRenderer: ActionsCellRenderer,
    },
  ], [t])

  // HTML overlay shown inside the grid when there are zero rows (empty state)
  const OVERLAY_NO_EMPLOYEES = useMemo(() => buildGridOverlay({
    icon: Users,
    heading: t('administratorMenu.tabs.employeeDirectory.overlay.noEmployees', 'No employees found'),
    sub: t(
      'administratorMenu.tabs.employeeDirectory.overlay.noEmployeesSub',
      'Add your first employee or adjust your search filters',
    ),
  }), [t])

  // Employee list and the currently selected row (null = show placeholder)
  const [employees,        setEmployees]        = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  // Data-loading (initial fetch) and mutation (create/update/delete) states
  const [isLoading,    setIsLoading]    = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  // Modal state: null = closed, 'new' = adding, or an employee object = editing that employee
  const [employeeModal,        setEmployeeModal]        = useState(null)
  const [deleteEmployeeTarget, setDeleteEmployeeTarget] = useState(null)

  // Toast-style alert notifications (success / warning / error)
  const [alerts, setAlerts] = useState([])

  // Add a new alert and auto-remove it after a duration based on its type
  const pushAlert = useCallback((type, title, message) => {
    const id = Date.now() + Math.random()
    const durations = { success: 3000, warning: 5000, error: 7000 }
    setAlerts(prev => [{ id, type, title, message }, ...prev])
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== id))
    }, durations[type] ?? 4000)
  }, [])

  // Manually dismiss an alert by its id
  const removeAlert = useCallback((id) => setAlerts(prev => prev.filter(a => a.id !== id)), [])

  // Quick-filter text for the AG Grid (filters all columns at once)
  const [search, setSearch] = useState('')
  const searchRef           = useRef(null)
  const gridRef             = useRef(null)
  const detailRef           = useRef(null)

  // Auto-focus the search input when the tab first mounts
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

  // Fetch the employee list from the API on first mount
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setIsLoading(true)
        const res = await fetch('/api/public/administrator/employees')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!data.success) throw new Error(data.error || 'Failed to load employees')
        if (!cancelled) setEmployees(data.employees || [])
      } catch (err) {
        console.error('[EmployeeDirectory] Failed to fetch employees:', err)
        if (!cancelled) {
          pushAlert(
            'error',
            t('administratorMenu.tabs.employeeDirectory.alerts.loadFailed', 'Failed to load employees'),
            err.message,
          )
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [pushAlert, t])

  // After an edit or delete, update selectedEmployee to reflect the new data
  // (or clear it if the selected employee was deleted)
  const syncSelected = useCallback((updated) => {
    setSelectedEmployee(prev =>
      prev ? (updated.find(e => e.id === prev.id) ?? null) : null
    )
  }, [])

  // When a row is clicked in the grid, show that employee's details below
  // and smooth-scroll down to the detail card after a short delay (lets React render first)
  const handleRowClick = useCallback((params) => {
    if (params.data?._skeleton) return
    setSelectedEmployee(params.data)
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }, [])

  // Called when the EmployeeFormModal submits. Handles both creating and updating
  // via the live API, then updates local state from the server response.
  const handleSave = useCallback(async (form) => {
    if (isProcessing) return
    const isNew = employeeModal === 'new'
    setIsProcessing(true)
    try {
      let updated
      if (isNew) {
        const data = await apiRequest('/api/public/administrator/employees/create', form)
        updated = [...employees, data.employee]
      } else {
        const data = await apiRequest('/api/public/administrator/employees/update', { id: employeeModal.id, ...form })
        updated = employees.map(e => (e.id === employeeModal.id ? data.employee : e))
      }
      setEmployees(updated)
      syncSelected(updated)
      setEmployeeModal(null)
      pushAlert(
        'success',
        isNew
          ? t('administratorMenu.tabs.employeeDirectory.alerts.created', 'Employee added')
          : t('administratorMenu.tabs.employeeDirectory.alerts.updated', 'Employee updated'),
        isNew
          ? t('administratorMenu.tabs.employeeDirectory.alerts.createdMsg', { name: form.name }, `${form.name} has been added.`)
          : t('administratorMenu.tabs.employeeDirectory.alerts.updatedMsg', { name: form.name }, `${form.name} has been updated.`),
      )
    } catch (err) {
      console.error('[EmployeeDirectory] Save failed:', err)
      pushAlert(
        'error',
        t('administratorMenu.tabs.employeeDirectory.alerts.saveFailed', 'Save failed'),
        err.message,
      )
    } finally {
      setIsProcessing(false)
    }
  }, [employeeModal, employees, syncSelected, pushAlert, t, apiRequest, isProcessing])

  // Called when the DeleteConfirmModal confirms deletion — deletes via the API.
  const handleDelete = useCallback(async () => {
    if (isProcessing) return
    const { name, id } = deleteEmployeeTarget
    setIsProcessing(true)
    try {
      await apiRequest('/api/public/administrator/employees/delete', { id })
      const updated = employees.filter(e => e.id !== id)
      if (selectedEmployee?.id === id) setSelectedEmployee(null)
      setEmployees(updated)
      setDeleteEmployeeTarget(null)
      pushAlert(
        'success',
        t('administratorMenu.tabs.employeeDirectory.alerts.deleted', 'Employee removed'),
        t('administratorMenu.tabs.employeeDirectory.alerts.deletedMsg', { name }, `${name} has been removed.`),
      )
    } catch (err) {
      console.error('[EmployeeDirectory] Delete failed:', err)
      pushAlert(
        'error',
        t('administratorMenu.tabs.employeeDirectory.alerts.deleteFailed', 'Delete failed'),
        err.message,
      )
    } finally {
      setIsProcessing(false)
    }
  }, [employees, deleteEmployeeTarget, selectedEmployee, pushAlert, t, apiRequest, isProcessing])

  // Context object passed to every AG Grid cell. ActionsCellRenderer reads
  // onEdit/onDelete from here to wire up the edit and delete buttons per row.
  const gridContext = useMemo(() => ({
    onEdit:   (e) => setEmployeeModal(e),
    onDelete: (e) => setDeleteEmployeeTarget(e),
  }), [])

  return (
    <>
      <AlertNotification alerts={alerts} onClose={removeAlert} />

      {/* Modals */}
      <EmployeeFormModal
        isOpen={employeeModal === 'new' || !!(employeeModal?.id)}
        onClose={() => setEmployeeModal(null)}
        onSave={handleSave}
        initial={employeeModal === 'new' ? null : employeeModal}
      />
      <DeleteConfirmModal
        isOpen={!!deleteEmployeeTarget}
        onClose={() => setDeleteEmployeeTarget(null)}
        onConfirm={handleDelete}
        type="employee"
        itemName={deleteEmployeeTarget?.name}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
        <SectionHeader
          icon={BookUser}
          title={t('administratorMenu.tabs.employeeDirectory.title', 'Employee directory')}
          description={t('administratorMenu.tabs.employeeDirectory.description', 'View and manage employee records and information')}
        />
        <div className="flex flex-wrap items-center gap-3">
          <GridSearchBar
            inputRef={searchRef}
            value={search}
            onChange={setSearch}
            placeholder={t(
              'administratorMenu.tabs.employeeDirectory.searchPlaceholder',
              'Search...',
            )}
          />
          <button
            onClick={() => setEmployeeModal('new')}
            className={`action-button !w-52 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <UserPlus className="w-5 h-5 icon-spin" />
            {t('administratorMenu.tabs.employeeDirectory.addEmployee', 'Add employee')}
          </button>
        </div>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {STATS_CONFIG.map(({ titleKey, fallback, icon, iconBoxColor, getValue }) => (
          <CompactStatsCard
            key={titleKey}
            title={t(`administratorMenu.tabs.employeeDirectory.${titleKey}`, fallback)}
            value={getValue(employees)}
            icon={icon}
            iconBoxColor={iconBoxColor}
          />
        ))}
      </div>

      {/* AG Grid */}
      <div className="rounded-xl overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        <AgGridReact
          key={`employee-grid-${i18n.language}`}
          ref={gridRef}
          domLayout="autoHeight"
          rowData={isLoading ? SKELETON_ROWS : employees}
          quickFilterText={isLoading ? '' : search}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowStyle={(params) => ({
            ...getRowStyle(params),
            ...(selectedEmployee?.id === params.data?.id && !params.data?._skeleton
              ? { background: 'var(--color-background-info)' }
              : {}),
          })}
          onRowClicked={handleRowClick}
          context={gridContext}
          rowHeight={48}
          headerHeight={52}
          suppressCellFocus
          pagination={!isLoading}
          paginationPageSize={25}
          paginationPageSizeSelector={[ 25, 50, 75, 100, 200]}
          enableRtl={isRTL}
          gridOptions={{
            theme: myTheme,
            enableCellTextSelection: true,
            ensureDomOrder: true,
            overlayNoRowsTemplate: OVERLAY_NO_EMPLOYEES,
          }}
        />
      </div>

      {/* Separator & Detail card */}
      <div ref={detailRef}>
        <ModernSeparator />
        <SectionHeader
          icon={Contact}
          title={t('administratorMenu.tabs.employeeDirectory.employeeDetails', 'Employee Details')}
        />
        <EmployeeDetailCard
          employee={selectedEmployee}
          onEdit={(e) => setEmployeeModal(e)}
          onDelete={(e) => setDeleteEmployeeTarget(e)}
          onCopy={(fieldName, value) => pushAlert('success', 'Copied', `${fieldName} copied to clipboard`)}
          t={t}
        />
      </div>
    </>
  )
}