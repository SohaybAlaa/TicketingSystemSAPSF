import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { useTranslation } from 'react-i18next'
import { myTheme } from '@utils/agGridThemes'
import SectionHeader from '@components/ui/SectionHeader'
import ModernSeparator from '@components/ui/ModernSeparator'
import GridSearchBar from '@components/ui/GridSearchBar'
import StatusFilterCards from '@components/ui/StatusFilterCards'
import AlertNotification from '@components/ui/AlertNotification'
import DeleteConfirmModal from '@components/modals/DeleteConfirmModal'
import GroupFormModal from '@components/modals/GroupFormModal'
import MemberFormModal from '@components/modals/MemberFormModal'
import { MOCK_GROUPS } from '@data/mockData'
import { Plus, UserPlus, Users, Boxes } from 'lucide-react'
import { resolveRowStatus } from '@utils/dateUtils'
import { buildGridOverlay, defaultColDef, getRowStyle, getScrollParent } from '@utils/agGridUtils.jsx'
import { makeSkeletonRows } from '@components/ui/GridSkeleton'
import {
  StatusCellRenderer,
  UserTypeCellRenderer,
  DateCellRenderer,
  ActionsCellRenderer,
  TextCellRenderer,
  ParentNameCellRenderer,
} from '@components/grid/CellRenderers'

ModuleRegistry.registerModules([AllCommunityModule])

// Configuration: Constants and settings for the entire component
const ALERT_AUTO_DISMISS_MS = 4000 // Auto-dismiss alerts after 4 seconds

const CONFIG = {
  MEMBER_LOADING_DELAY_MS: 800, // Delay before showing members (for loading animation)
  SCROLL_OFFSET_PX: 30, // Offset when auto-scrolling to members section
  GROUP_PAGINATION: {
    DEFAULT: 10, // Default rows per page for groups table
    OPTIONS: [10, 25, 50], // Available page size options
  },
  MEMBER_PAGINATION: {
    DEFAULT: 20, // Default rows per page for members table
    OPTIONS: [20, 50, 100], // Available page size options
  },
}


// Manages two tables: Support Groups and their Assigned Users (Members)
// Features: CRUD operations, search, filtering by status, pagination, RTL support
export default function OrgStructureTab() {
  // Get translation function (t) and i18n instance for multi-language support
  const { t, i18n } = useTranslation()
  // Detect if current language is Arabic for RTL (right-to-left) layout support
  const isRTL = i18n.language === 'ar'

  // Column definitions for the Support Groups table
  // Recreated when language changes (dependency: [t]) to update translated headers
  const groupColumns = useMemo(() => [
    { field: 'externalCode', headerName: t('administratorMenu.tabs.orgStructure.supportGroups.columns.externalCode'), flex: 1, minWidth: 140, cellRenderer: TextCellRenderer, cellStyle: { fontWeight: '600' } },
    { field: 'parentName', headerName: t('administratorMenu.tabs.orgStructure.supportGroups.columns.parentName'), flex: 1.5, minWidth: 200, cellRenderer: ParentNameCellRenderer, cellStyle: { fontWeight: '600' } },
    { field: 'name',       headerName: t('administratorMenu.tabs.orgStructure.supportGroups.columns.name'),       flex: 1.5, minWidth: 140, cellRenderer: TextCellRenderer, cellStyle: { fontWeight: '600' } },
    { field: 'validFrom',  headerName: t('administratorMenu.tabs.orgStructure.supportGroups.columns.validFrom'),  flex: 1, minWidth: 120, cellRenderer: DateCellRenderer },
    { field: 'validTo',    headerName: t('administratorMenu.tabs.orgStructure.supportGroups.columns.validTo'),    flex: 1, minWidth: 120, cellRenderer: DateCellRenderer },
    { headerName: t('administratorMenu.tabs.orgStructure.supportGroups.columns.status'), flex: 1, minWidth: 110, cellRenderer: StatusCellRenderer },
    { headerName: t('administratorMenu.tabs.orgStructure.supportGroups.columns.action'), flex: 1, minWidth: 120, sortable: false, filter: false, suppressMovable: true, cellRenderer: ActionsCellRenderer },
  ], [t]) // Re-create when translations change

  // Column definitions for the Assigned Users (Members) table
  // Recreated when language changes to update translated headers
  const memberColumns = useMemo(() => [
    { field: 'id',         headerName: t('administratorMenu.tabs.orgStructure.assignedUsers.columns.record'),     flex: 1, minWidth: 120, cellRenderer: TextCellRenderer, cellStyle: { fontWeight: '600' } },
    { field: 'employeeId', headerName: t('administratorMenu.tabs.orgStructure.assignedUsers.columns.employeeId'), flex: 1, minWidth: 110, cellRenderer: TextCellRenderer, cellStyle: { fontWeight: '600' } },
    { field: 'name',       headerName: t('administratorMenu.tabs.orgStructure.assignedUsers.columns.name'),       flex: 2, minWidth: 160, cellRenderer: TextCellRenderer, cellStyle: { fontWeight: '600' } },
    { field: 'userType',   headerName: t('administratorMenu.tabs.orgStructure.assignedUsers.columns.userType'),   flex: 1, minWidth: 120, cellRenderer: UserTypeCellRenderer },
    { field: 'from',       headerName: t('administratorMenu.tabs.orgStructure.assignedUsers.columns.validFrom'),  flex: 1, minWidth: 120, cellRenderer: DateCellRenderer },
    { field: 'to',         headerName: t('administratorMenu.tabs.orgStructure.assignedUsers.columns.validTo'),    flex: 1, minWidth: 120, cellRenderer: DateCellRenderer },
    { headerName: t('administratorMenu.tabs.orgStructure.assignedUsers.columns.status'), flex: 1, minWidth: 110, cellRenderer: StatusCellRenderer },
    { headerName: t('administratorMenu.tabs.orgStructure.assignedUsers.columns.action'), flex: 1, minWidth: 100, sortable: false, filter: false, suppressMovable: true, cellRenderer: ActionsCellRenderer },
  ], [t]) // Re-create when translations change

  // Overlay templates: Custom messages shown when tables are empty
  // Recreated when language changes to show translated messages
  const OVERLAY_NO_GROUPS = useMemo(() => buildGridOverlay({
    icon: Boxes,
    heading: t('administratorMenu.tabs.orgStructure.supportGroups.overlay.noGroups'),
    sub: t('administratorMenu.tabs.orgStructure.supportGroups.overlay.noGroupsSub'),
  }), [t])

  const OVERLAY_NO_MEMBERS = useMemo(() => buildGridOverlay({
    icon: Users,
    heading: t('administratorMenu.tabs.orgStructure.assignedUsers.overlay.noMembers'),
    sub: t('administratorMenu.tabs.orgStructure.assignedUsers.overlay.noMembersSub'),
  }), [t])

  const OVERLAY_NO_SELECTION = useMemo(() => buildGridOverlay({
    icon: Users,
    heading: t('administratorMenu.tabs.orgStructure.assignedUsers.overlay.noSelection'),
    sub: t('administratorMenu.tabs.orgStructure.assignedUsers.overlay.noSelectionSub'),
  }), [t])

  // Data state: Groups and selected group
  const [groups,        setGroups]        = useState(MOCK_GROUPS) // All support groups
  const [selectedGroup, setSelectedGroup] = useState(null) // Currently selected group (for members table)
  const [loadingMembers, setLoadingMembers] = useState(false) // Loading state when fetching members

  // Modal state: Controls which modal is open and what data it contains
  const [groupModal,        setGroupModal]        = useState(null) // null | 'new' | groupObject (for edit)
  const [memberTarget,      setMemberTarget]      = useState(null) // true when adding new member
  const [editMemberTarget,  setEditMemberTarget]  = useState(null) // { groupId, member } when editing
  const [deleteGroupTarget, setDeleteGroupTarget] = useState(null) // Group to delete
  const [deleteMemberTarget,setDeleteMemberTarget]= useState(null) // { groupId, member } to delete

  // Alert notifications: Stores active alerts to display to user
  const [alerts, setAlerts] = useState([])

  // Helper: Add an alert notification that auto-dismisses based on type
  const pushAlert = useCallback((type, title, message) => {
    const id = Date.now() + Math.random()
    setAlerts(prev => [{ id, type, title, message }, ...prev])
    const durations = { success: 3000, warning: 5000, error: 7000 }
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== id))
    }, durations[type] || ALERT_AUTO_DISMISS_MS)
  }, [])

  // Helper: Manually remove an alert by ID
  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }, [])

  // Search and filter state
  const [groupSearch,  setGroupSearch]  = useState('') // Quick search text for groups table
  const [memberSearch, setMemberSearch] = useState('') // Quick search text for members table
  const [groupFilter,  setGroupFilter]  = useState(null) // Status filter: null | 'Active' | 'Inactive'
  const [memberFilter, setMemberFilter] = useState(null) // Status filter: null | 'Active' | 'Inactive'

  // Grid references: Access ag-Grid API for programmatic control
  const groupGridRef   = useRef(null) // Reference to groups table
  const memberGridRef  = useRef(null) // Reference to members table
  const groupSearchRef = useRef(null) // Reference to group search input (for auto-focus)

  // Effects: Initialize and sync grid filters
  useEffect(() => { groupSearchRef.current?.focus() }, []) // Auto-focus group search on mount
  useEffect(() => { groupGridRef.current?.api?.onFilterChanged()  }, [groupFilter]) // Notify grid when filter changes
  useEffect(() => { memberGridRef.current?.api?.onFilterChanged() }, [memberFilter]) // Notify grid when filter changes

  // Stats: Calculate counts for status filter cards
  // Recalculated whenever groups change
  const groupStats = useMemo(() => {
    const active = groups.filter(g => resolveRowStatus(g) === 'Active').length
    return { total: groups.length, active, inactive: groups.length - active }
  }, [groups])

  // Member stats: Calculated for the currently selected group
  // Shows '•••' if no group is selected
  const memberStats = useMemo(() => {
    const members = selectedGroup
      ? groups.find(g => g.id === selectedGroup.id)?.members ?? []
      : []
    const active = members.filter(m => resolveRowStatus(m) === 'Active').length
    return { total: members.length, active, inactive: members.length - active }
  }, [selectedGroup, groups])

  // Helper: Sync selected group after groups array changes
  // Ensures selectedGroup still exists in updated groups array
  const syncSelected = useCallback((updatedGroups) => {
    if (selectedGroup) {
      // Find the updated version of the selected group, or null if it was deleted
      setSelectedGroup(updatedGroups.find(g => g.id === selectedGroup.id) ?? null)
    }
  }, [selectedGroup])

  // Handler: When a group row is clicked, select it and load its members
  // Shows loading state, then scrolls to members section
  const handleGroupRowClick = useCallback((params) => {
    // Skip if clicking skeleton row or already selected group
    if (params.data?._skeleton || selectedGroup?.id === params.data.id) return
    
    setLoadingMembers(true)
    setSelectedGroup(null) // Clear selection to trigger loading state
    
    // Store the group to select after loading delay
    const groupToSelect = params.data
    
    // Delay before showing members (for loading animation)
    setTimeout(() => {
      setSelectedGroup(groupToSelect) // Set new selection
      setLoadingMembers(false)
    }, CONFIG.MEMBER_LOADING_DELAY_MS)
    
  }, [selectedGroup])

  useEffect(() => {
    let timer = null;
    if (selectedGroup) {
      const section = document.getElementById('assigned-users-section')
      if (!section) return
      const scrollContainer = getScrollParent(section)
      const top = section.getBoundingClientRect().top
      // Scroll to section with offset, handling both window and container scrolling
      scrollContainer === window
        ? window.scrollTo({ top: top + window.scrollY - CONFIG.SCROLL_OFFSET_PX, behavior: 'smooth' })
        : scrollContainer.scrollTo({ top: scrollContainer.scrollTop + top - CONFIG.SCROLL_OFFSET_PX, behavior: 'smooth' })
    }
  }, [selectedGroup, loadingMembers])

  // Handler: Save a new or edited group
  const handleSaveGroup = useCallback((form) => {
    const isNew = groupModal === 'new' // Check if creating new or editing existing
    const updated = isNew
      ? [...groups, { ...form, id: Date.now(), members: [] }] // Add new group with unique ID
      : groups.map(g => g.id === groupModal.id ? { ...g, ...form } : g) // Update existing group
    
    setGroups(updated)
    syncSelected(updated) // Keep selected group in sync
    setGroupModal(null) // Close modal
    
    // Show success alert
    pushAlert(
      'success',
      isNew ? t('administratorMenu.tabs.orgStructure.alerts.groupCreated') : t('administratorMenu.tabs.orgStructure.alerts.groupUpdated'),
      isNew ? t('administratorMenu.tabs.orgStructure.alerts.groupCreatedMsg', { name: form.name }) : t('administratorMenu.tabs.orgStructure.alerts.groupUpdatedMsg', { name: form.name }),
    )
  }, [groupModal, groups, syncSelected, pushAlert, t])

  // Handler: Delete a group
  const handleDeleteGroup = useCallback(() => {
    const name = deleteGroupTarget.name
    const updated = groups.filter(g => g.id !== deleteGroupTarget.id) // Remove group from list
    
    // Clear selection if deleted group was selected
    if (selectedGroup?.id === deleteGroupTarget.id) setSelectedGroup(null)
    
    setGroups(updated)
    setDeleteGroupTarget(null) // Close delete confirmation modal
    
    // Show success alert
    pushAlert('success', t('administratorMenu.tabs.orgStructure.alerts.groupDeleted'), t('administratorMenu.tabs.orgStructure.alerts.groupDeletedMsg', { name }))
  }, [groups, deleteGroupTarget, selectedGroup, pushAlert, t])

  // Handler: Update members of a specific group
  // fn is a function that takes current members array and returns updated array
  const updateGroupMembers = useCallback((groupId, fn) => {
    const updated = groups.map(g => g.id === groupId ? { ...g, members: fn(g.members) } : g)
    setGroups(updated)
    syncSelected(updated) // Keep selected group in sync
  }, [groups, syncSelected])

  // Handler: Add a new member to the selected group
  const handleAddMember = useCallback((form) => {
    updateGroupMembers(selectedGroup.id, ms => [...ms, { ...form, id: Date.now() }]) // Add with unique ID
    setMemberTarget(null) // Close modal
    pushAlert('success', t('administratorMenu.tabs.orgStructure.alerts.memberAdded'), t('administratorMenu.tabs.orgStructure.alerts.memberAddedMsg', { name: form.name }))
  }, [selectedGroup, updateGroupMembers, pushAlert, t])

  // Handler: Save changes to an existing member
  const handleSaveEditMember = useCallback((form) => {
    updateGroupMembers(editMemberTarget.groupId, ms => ms.map(m => m.id === editMemberTarget.member.id ? { ...m, ...form } : m))
    setEditMemberTarget(null) // Close modal
    pushAlert('success', t('administratorMenu.tabs.orgStructure.alerts.memberUpdated'), t('administratorMenu.tabs.orgStructure.alerts.memberUpdatedMsg', { name: form.name }))
  }, [editMemberTarget, updateGroupMembers, pushAlert, t])

  // Handler: Delete a member from a group
  const handleDeleteMember = useCallback(() => {
    const name = deleteMemberTarget.member.name
    updateGroupMembers(deleteMemberTarget.groupId, ms => ms.filter(m => m.id !== deleteMemberTarget.member.id)) // Remove member
    setDeleteMemberTarget(null) // Close delete confirmation modal
    pushAlert('success', t('administratorMenu.tabs.orgStructure.alerts.memberRemoved'), t('administratorMenu.tabs.orgStructure.alerts.memberRemovedMsg', { name }))
  }, [deleteMemberTarget, updateGroupMembers, pushAlert, t])

  // Data for members table: Show skeleton rows while loading, empty if no group selected
  const memberRows = useMemo(() => {
    if (loadingMembers) return makeSkeletonRows(CONFIG.MEMBER_PAGINATION.DEFAULT) // Show loading skeletons
    if (!selectedGroup) return [] // Empty if no group selected
    return groups.find(g => g.id === selectedGroup.id)?.members ?? [] // Get members of selected group
  }, [loadingMembers, selectedGroup, groups])

  // Grid contexts: Passed to cell renderers so they can trigger actions
  // Note: Use stable field names `onEdit` / `onDelete` so one ActionsCellRenderer component handles both grids
  const groupContext = useMemo(() => ({
    onEdit:   (g) => setGroupModal(g), // Open edit modal with group data
    onDelete: (g) => setDeleteGroupTarget(g), // Open delete confirmation
  }), [])

  // Member context: Includes groupId so handlers know which group to update
  const memberContext = useMemo(() => ({
    onEdit:   (m) => setEditMemberTarget({ groupId: selectedGroup?.id, member: m }), // Open edit modal
    onDelete: (m) => setDeleteMemberTarget({ groupId: selectedGroup?.id, member: m }), // Open delete confirmation
  }), [selectedGroup?.id]) // Re-create only when selected group ID changes

  // External filters: Custom filter logic for ag-Grid
  // These allow filtering by status (Active/Inactive) independent of quick search
  const isGroupExternalFilterPresent  = useCallback(() => groupFilter  !== null, [groupFilter]) // Is a filter active?
  const doesGroupExternalFilterPass   = useCallback((node) => node.data?._skeleton || resolveRowStatus(node.data) === groupFilter,  [groupFilter]) // Does row match filter?
  const isMemberExternalFilterPresent = useCallback(() => memberFilter !== null, [memberFilter]) // Is a filter active?
  const doesMemberExternalFilterPass  = useCallback((node) => node.data?._skeleton || resolveRowStatus(node.data) === memberFilter, [memberFilter]) // Does row match filter?

  // Choose which overlay message to show: "No members" or "Select a group first"
  const memberOverlay = selectedGroup ? OVERLAY_NO_MEMBERS : OVERLAY_NO_SELECTION

  return (
    <>
      <AlertNotification alerts={alerts} onClose={removeAlert} />

      {/* Modals */}
      <GroupFormModal
        isOpen={groupModal === 'new' || !!(groupModal?.id)}
        onClose={() => setGroupModal(null)}
        onSave={handleSaveGroup}
        initial={groupModal === 'new' ? null : groupModal}
      />
      <MemberFormModal
        isOpen={!!memberTarget || !!editMemberTarget}
        onClose={() => { setMemberTarget(null); setEditMemberTarget(null) }}
        onSave={editMemberTarget ? handleSaveEditMember : handleAddMember}
        initial={editMemberTarget?.member ?? null}
        groupName={selectedGroup?.name}
      />
      <DeleteConfirmModal
        isOpen={!!deleteGroupTarget}
        onClose={() => setDeleteGroupTarget(null)}
        onConfirm={handleDeleteGroup}
        type="group"
        itemName={deleteGroupTarget?.name}
      />
      <DeleteConfirmModal
        isOpen={!!deleteMemberTarget}
        onClose={() => setDeleteMemberTarget(null)}
        onConfirm={handleDeleteMember}
        type="member"
        itemName={deleteMemberTarget?.member.name}
      />

      {/* Table 1: Support Groups */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
          <SectionHeader 
            icon={Boxes} 
            title={t('administratorMenu.tabs.orgStructure.supportGroups.title')} 
            description={t('administratorMenu.tabs.orgStructure.supportGroups.description', 'Manage support groups and team hierarchies')}
          />
          <div className="flex flex-wrap items-center gap-3">
            <GridSearchBar
              inputRef={groupSearchRef}
              value={groupSearch}
              onChange={setGroupSearch}
              placeholder={t('administratorMenu.tabs.orgStructure.supportGroups.searchPlaceholder')}
            />
            <button
              onClick={() => setGroupModal('new')}
              className={`action-button !w-52 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Plus className="w-5 h-5 icon-spin" />{t('administratorMenu.tabs.orgStructure.supportGroups.newGroup')}
            </button>
          </div>
        </div>

        <StatusFilterCards
          totalLabel={t('administratorMenu.tabs.orgStructure.supportGroups.totalGroups')}
          totalIcon={Boxes}
          total={groupStats.total}
          active={groupStats.active}
          inactive={groupStats.inactive}
          filter={groupFilter}
          onFilter={setGroupFilter}
          activeLabel={t('administratorMenu.tabs.orgStructure.supportGroups.active')}
          inactiveLabel={t('administratorMenu.tabs.orgStructure.supportGroups.inactive')}
        />

        <div className="rounded-xl overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
          <AgGridReact
            key={`group-grid-${i18n.language}`}
            ref={groupGridRef}
            domLayout="autoHeight"
            rowData={groups}
            quickFilterText={groupSearch}
            columnDefs={groupColumns}
            defaultColDef={defaultColDef}
            getRowStyle={getRowStyle}
            onRowClicked={handleGroupRowClick}
            context={groupContext}
            rowHeight={48}
            headerHeight={52}
            suppressCellFocus
            pagination
            paginationPageSize={CONFIG.GROUP_PAGINATION.DEFAULT}
            paginationPageSizeSelector={CONFIG.GROUP_PAGINATION.OPTIONS}
            isExternalFilterPresent={isGroupExternalFilterPresent}
            doesExternalFilterPass={doesGroupExternalFilterPass}
            enableRtl={isRTL}
            gridOptions={{
              theme: myTheme,
              enableCellTextSelection: true,
              ensureDomOrder: true,
              overlayNoRowsTemplate: OVERLAY_NO_GROUPS,
            }}
          />
        </div>
      </div>

      <ModernSeparator />

      {/* Table 2: Assigned Users */}
      <div id="assigned-users-section">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
          <SectionHeader icon={Users} title={t('administratorMenu.tabs.orgStructure.assignedUsers.title')} subtitle={selectedGroup ? `• ${selectedGroup.name}` : undefined} />
          <div className="flex flex-wrap items-center gap-3">
            <GridSearchBar
              value={memberSearch}
              onChange={setMemberSearch}
              placeholder={t('administratorMenu.tabs.orgStructure.assignedUsers.searchPlaceholder')}
              disabled={!selectedGroup || loadingMembers}
            />
            <button
              disabled={!selectedGroup || loadingMembers}
              onClick={() => setMemberTarget(true)}
              className={`action-button !w-52 disabled:!cursor-not-allowed ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <UserPlus className="w-5 h-5 icon-flip" />{t('administratorMenu.tabs.orgStructure.assignedUsers.addMember')}
            </button>
          </div>
        </div>

        <StatusFilterCards
          totalLabel={t('administratorMenu.tabs.orgStructure.assignedUsers.totalEmployees')}
          totalIcon={Users}
          total={selectedGroup ? memberStats.total : '•••'}
          active={selectedGroup ? memberStats.active : '•••'}
          inactive={selectedGroup ? memberStats.inactive : '•••'}
          filter={memberFilter}
          onFilter={setMemberFilter}
          disabled={!selectedGroup}
          activeLabel={t('administratorMenu.tabs.orgStructure.supportGroups.active')}
          inactiveLabel={t('administratorMenu.tabs.orgStructure.supportGroups.inactive')}
        />

        <div className="rounded-xl overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
          <AgGridReact
            key={`member-grid-${i18n.language}`}
            ref={memberGridRef}
            domLayout="autoHeight"
            rowData={memberRows}
            quickFilterText={loadingMembers ? '' : memberSearch}
            columnDefs={memberColumns}
            defaultColDef={defaultColDef}
            getRowStyle={getRowStyle}
            context={memberContext}
            rowHeight={48}
            headerHeight={52}
            suppressCellFocus
            pagination
            paginationPageSize={CONFIG.MEMBER_PAGINATION.DEFAULT}
            paginationPageSizeSelector={CONFIG.MEMBER_PAGINATION.OPTIONS}
            isExternalFilterPresent={isMemberExternalFilterPresent}
            doesExternalFilterPass={doesMemberExternalFilterPass}
            enableRtl={isRTL}
            gridOptions={{
              theme: myTheme,
              enableCellTextSelection: true,
              ensureDomOrder: true,
              overlayNoRowsTemplate: memberOverlay,
            }}
          />
        </div>
      </div>
    </>
  )
}
