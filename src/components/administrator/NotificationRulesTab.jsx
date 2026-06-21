import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BellDot, BellRing, BellOff, BellPlus, RefreshCw, Inbox } from 'lucide-react'

import SectionHeader from '@components/ui/SectionHeader'
import AlertNotification from '@components/ui/AlertNotification'
import CompactStatsCard from '@components/ui/CompactStatsCard'
import GridSearchBar from '@components/ui/GridSearchBar'
import DeleteConfirmModal from '@components/modals/DeleteConfirmModal'

import { INITIAL_NOTIFICATIONS } from '@data/notificationRules'
import EmptyState from '@components/ui/EmptyState'
import NotificationRow from './notificationRules/NotificationRow'
import NewNotificationRow from './notificationRules/NewNotificationRow'

export default function NotificationRulesTab() {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
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

  // Toggle a row open/closed; clicking the same row again collapses it
  const toggleRow = (id) => setExpandedId(prev => prev === id ? null : id)

  // Opens the delete confirmation modal with the target rule's info
  const handleDeleteRequest = (id, name) => {
    setDeleteModal({ isOpen: true, id, name })
  }

  // Removes the pending notification from state, shows a success alert, and closes the modal
  const handleDeleteConfirm = () => {
    const { id } = deleteModal
    if (id) {
      if (expandedId === id) setExpandedId(null)
      setNotifications(prev => prev.filter(n => n.id !== id))
      pushAlert('success', t('administratorMenu.tabs.notificationRules.alerts.deleted'), t('administratorMenu.tabs.notificationRules.alerts.deletedMsg'))
    }
    setDeleteModal({ isOpen: false, id: null, name: null })
  }

  const handleDeleteClose = () => {
    setDeleteModal({ isOpen: false, id: null, name: null })
  }

  // Flips a rule's active/inactive status and shows a feedback alert
  const toggleStatus = (id) => {
    const current = notifications.find(n => n.id === id)
    if (!current) return
    const nextActive = !current.status
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: nextActive } : n))
    pushAlert('success',
      nextActive ? t('administratorMenu.tabs.notificationRules.alerts.activated') : t('administratorMenu.tabs.notificationRules.alerts.deactivated'),
      nextActive ? t('administratorMenu.tabs.notificationRules.alerts.activatedMsg') : t('administratorMenu.tabs.notificationRules.alerts.deactivatedMsg')
    )
  }

  // Inserts a new rule or updates an existing one depending on whether the id already exists
  const handleSave = (data) => {
    const isNew = !notifications.find(n => n.id === data.id)
    if (isNew) {
      setNotifications(prev => [...prev, data])
      pushAlert('success', t('administratorMenu.tabs.notificationRules.alerts.created'), t('administratorMenu.tabs.notificationRules.alerts.createdMsg'))
    } else {
      setNotifications(prev => prev.map(n => n.id === data.id ? data : n))
      pushAlert('success', t('administratorMenu.tabs.notificationRules.alerts.updated'), t('administratorMenu.tabs.notificationRules.alerts.updatedMsg'))
    }
    setExpandedId(null)
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

      {/* Stats cards */}
      {notifications.length > 0 && (
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
      )}

      {/* Inline create form — visible only when expandedId === 'new' */}
      <div className={expandedId === 'new' ? 'mb-6' : ''}>
        <NewNotificationRow
          open={expandedId === 'new'}
          onSave={handleSave}
          onCancel={() => setExpandedId(null)}
        />
      </div>

      {/* Existing notifications */}
      {notifications.length === 0 && expandedId !== 'new' ? (
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
              onSave={handleSave}
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