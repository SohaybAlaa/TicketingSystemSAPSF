import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BellDot, BellRing, BellOff, BellPlus, RefreshCw, Inbox } from 'lucide-react'

import SectionHeader from '@components/ui/SectionHeader'
import AlertNotification from '@components/ui/AlertNotification'
import CompactStatsCard from '@components/ui/CompactStatsCard'
import GridSearchBar from '@components/ui/GridSearchBar'
import DeleteConfirmModal from '@components/modals/DeleteConfirmModal'

import EmptyState from '@components/ui/EmptyState'
import NotificationRow from './notificationRules/NotificationRow'
import NewNotificationRow from './notificationRules/NewNotificationRow'

export default function NotificationRulesTab() {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState([])
  // Data-loading (initial fetch) and mutation (create/update/delete/status) states
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  // ID of the currently expanded row ('new' for the add form, or a rule's id)
  const [expandedId, setExpandedId] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  // Holds the id + name of the rule pending deletion
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: null })
  const searchRef = useRef(null)

  // Auto-focus the search bar on mount
  useEffect(() => { searchRef.current?.focus() }, [])

  // Counts for the three stats cards (total / active / inactive)
  const stats = useMemo(() => {
    const active = notifications.filter(n => n.status).length
    const inactive = notifications.length - active
    return { total: notifications.length, active, inactive }
  }, [notifications])

  // Applies search text + status filter to the notifications list
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return notifications.filter(n => {
      if (statusFilter === 'active' && !n.status) return false
      if (statusFilter === 'inactive' && n.status) return false
      if (!q) return true
      return (
        (n.name || '').toLowerCase().includes(q) ||
        (n.id || '').toLowerCase().includes(q) ||
        (n.subject || '').toLowerCase().includes(q)
      )
    })
  }, [notifications, search, statusFilter])

  // Shows a timed toast alert; accepts i18n keys or plain strings
  const pushAlert = useCallback((type, titleKey, messageKey) => {
    const id = Date.now() + Math.random()
    const dur = { success: 3000, warning: 5000, error: 7000 }
    const title = typeof titleKey === 'string' && titleKey.includes('.') ? t(titleKey) : titleKey
    const message = typeof messageKey === 'string' && messageKey.includes('.') ? t(messageKey) : messageKey
    setAlerts(prev => [{ id, type, title, message }, ...prev])
    setTimeout(() => setAlerts(prev => prev.filter(a => a.id !== id)), dur[type] ?? 4000)
  }, [t])

  // Dismisses a specific alert by its id
  const removeAlert = useCallback((id) => setAlerts(prev => prev.filter(a => a.id !== id)), [])

  // Generic POST helper for create/update/delete/status — throws on failure
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

  // Fetch the notification rules from the API on first mount
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setIsLoading(true)
        const res = await fetch('/api/public/administrator/notification-rules')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!data.success) throw new Error(data.error || 'Failed to load notification rules')
        if (!cancelled) setNotifications(data.rules || [])
      } catch (err) {
        console.error('[NotificationRules] Failed to fetch rules:', err)
        if (!cancelled) pushAlert('error', 'Failed to load notifications', err.message)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [pushAlert])

  // Toggle a row open/closed; clicking the same row again collapses it
  const toggleRow = (id) => setExpandedId(prev => prev === id ? null : id)

  // Opens the delete confirmation modal with the target rule's info
  const handleDeleteRequest = (id, name) => {
    setDeleteModal({ isOpen: true, id, name })
  }

  // Removes the pending notification via the API, shows a success alert, and closes the modal
  const handleDeleteConfirm = async () => {
    const { id } = deleteModal
    if (!id || isProcessing) { setDeleteModal({ isOpen: false, id: null, name: null }); return }
    setIsProcessing(true)
    try {
      await apiRequest('/api/public/administrator/notification-rules/delete', { id })
      if (expandedId === id) setExpandedId(null)
      setNotifications(prev => prev.filter(n => n.id !== id))
      pushAlert('success', t('administratorMenu.tabs.notificationRules.alerts.deleted'), t('administratorMenu.tabs.notificationRules.alerts.deletedMsg'))
      setDeleteModal({ isOpen: false, id: null, name: null })
    } catch (err) {
      console.error('[NotificationRules] Delete failed:', err)
      pushAlert('error', 'Delete failed', err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteClose = () => {
    setDeleteModal({ isOpen: false, id: null, name: null })
  }

  // Flips a rule's active/inactive status via the API and shows a feedback alert
  const toggleStatus = async (id) => {
    const current = notifications.find(n => n.id === id)
    if (!current || isProcessing) return
    const nextActive = !current.status
    setIsProcessing(true)
    try {
      await apiRequest('/api/public/administrator/notification-rules/status', { id, status: nextActive })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: nextActive } : n))
      pushAlert('success',
        nextActive ? t('administratorMenu.tabs.notificationRules.alerts.activated') : t('administratorMenu.tabs.notificationRules.alerts.deactivated'),
        nextActive ? t('administratorMenu.tabs.notificationRules.alerts.activatedMsg') : t('administratorMenu.tabs.notificationRules.alerts.deactivatedMsg')
      )
    } catch (err) {
      console.error('[NotificationRules] Status toggle failed:', err)
      pushAlert('error', 'Update failed', err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  // Inserts a new rule or updates an existing one via the API.
  // isNew is passed explicitly by the caller (the inline "new" form vs an
  // existing row) so we never mis-route based on a randomly generated code.
  const handleSave = async (data, isNew) => {
    if (isProcessing) return
    setIsProcessing(true)
    try {
      if (isNew) {
        // Backend generates the NTF code; use the returned rule
        const res = await apiRequest('/api/public/administrator/notification-rules/create', data)
        setNotifications(prev => [...prev, res.rule])
        pushAlert('success', t('administratorMenu.tabs.notificationRules.alerts.created'), t('administratorMenu.tabs.notificationRules.alerts.createdMsg'))
      } else {
        const res = await apiRequest('/api/public/administrator/notification-rules/update', data)
        setNotifications(prev => prev.map(n => n.id === data.id ? res.rule : n))
        pushAlert('success', t('administratorMenu.tabs.notificationRules.alerts.updated'), t('administratorMenu.tabs.notificationRules.alerts.updatedMsg'))
      }
      setExpandedId(null)
    } catch (err) {
      console.error('[NotificationRules] Save failed:', err)
      pushAlert('error', 'Save failed', err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <AlertNotification alerts={alerts} onClose={removeAlert} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <SectionHeader
          icon={BellDot}
          title={t('administratorMenu.tabs.notificationRules.title')}
          description={t('administratorMenu.tabs.notificationRules.description')}
        />
        <div className="flex flex-wrap items-center gap-3">
          {notifications.length > 0 && (
            <GridSearchBar
              inputRef={searchRef}
              value={search}
              onChange={setSearch}
              placeholder={t('administratorMenu.tabs.notificationRules.searchPlaceholder')}
            />
          )}
          <button
            onClick={() => toggleRow('new')}
            className="action-button !w-52"
          >
            <BellPlus className="w-5 h-5 icon-shake" />
            {t('administratorMenu.tabs.notificationRules.newNotification')}
          </button>
        </div>
      </div>

      {/* Stats cards — always shown (0s while loading) rather than popping in once data arrives */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-3 mb-4">
        <div className="notification-stats-card">
          <CompactStatsCard
            title={t('administratorMenu.tabs.notificationRules.stats.total')}
            value={stats.total}
            icon={BellDot}
            iconBoxColor="#eab308"
            active={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
            iconClassName="icon-shake"
          />
        </div>
        <div className="notification-stats-card">
          <CompactStatsCard
            title={t('administratorMenu.tabs.notificationRules.stats.active')}
            value={stats.active}
            icon={BellRing}
            iconBoxColor="#22c55e"
            active={statusFilter === 'active'}
            onClick={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')}
            iconClassName="icon-shake"
          />
        </div>
        <div className="notification-stats-card">
          <CompactStatsCard
            title={t('administratorMenu.tabs.notificationRules.stats.inactive')}
            value={stats.inactive}
            icon={BellOff}
            iconBoxColor="#ef4444"
            active={statusFilter === 'inactive'}
            onClick={() => setStatusFilter(statusFilter === 'inactive' ? 'all' : 'inactive')}
            iconClassName="icon-shake"
          />
        </div>
      </div>

      {/* Inline create form — visible only when expandedId === 'new' */}
      <div className={expandedId === 'new' ? 'mb-6' : ''}>
        <NewNotificationRow
          open={expandedId === 'new'}
          onSave={(data) => handleSave(data, true)}
          onCancel={() => setExpandedId(null)}
        />
      </div>

      {/* Existing notifications */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {/* Mirrors NotificationRow's collapsed shape (icon circle, title/subject/pills, toggle+delete+chevron, accent strip) */}
          {[0, 1, 2].map(i => (
            <div key={i} className="relative border-2 border-gray-100 rounded-2xl overflow-hidden min-h-[130px]">
              <div className="absolute top-2 bottom-2 left-2 w-1 rounded-full bg-gray-200" />
              <div className="flex items-start sm:items-center gap-3 px-4 sm:px-7 py-4 sm:py-5">
                <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse flex-shrink-0" />
                <div className="flex-1 min-w-0 flex flex-col gap-2.5">
                  <div className="h-4 w-40 rounded-full bg-gray-200 animate-pulse" />
                  <div className="h-3 w-56 rounded-full bg-gray-100 animate-pulse" />
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-28 rounded-full bg-gray-100 animate-pulse" />
                    <div className="h-6 w-28 rounded-full bg-gray-100 animate-pulse" />
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                  <div className="w-11 h-6 rounded-full bg-gray-200 animate-pulse" />
                  <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
                  <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 && expandedId !== 'new' ? (
        <EmptyState
          icon={BellDot}
          title={t('administratorMenu.tabs.notificationRules.empty.title')}
          description={t('administratorMenu.tabs.notificationRules.empty.subtitle')}
          action={{ label: t('administratorMenu.tabs.notificationRules.newNotification'), icon: BellPlus, onClick: () => toggleRow('new') }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={t('administratorMenu.tabs.notificationRules.noMatches.title')}
          semiDescription={`"${search}"`}
          description={t('administratorMenu.tabs.notificationRules.noMatches.subtitle')}
          action={{ label: t('administratorMenu.tabs.notificationRules.resetFilters'), icon: RefreshCw, onClick: () => { setSearch(''); setStatusFilter('all') } }}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(n => (
            <NotificationRow
              key={n.id}
              n={n}
              isExpanded={expandedId === n.id}
              onToggle={() => toggleRow(n.id)}
              onSave={(data) => handleSave(data, false)}
              onDelete={handleDeleteRequest}
              onToggleStatus={() => toggleStatus(n.id)}
            />
          ))}
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        type="notification"
        itemName={deleteModal.name}
      />
    </>
  )
}