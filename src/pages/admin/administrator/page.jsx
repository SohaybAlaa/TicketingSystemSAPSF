import AdminLayout from '@/components/layouts/AdminLayout'
import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Network,
  SlidersHorizontal,
  Timer,
  BellDot,
  BookUser,
} from 'lucide-react'

import OrgStructureTab from '@components/administrator/OrgStructureTab'
import EmployeeDirectoryTab from '@components/administrator/EmployeeDirectoryTab'

export default function Administrator() {
  // Get translation function (t) and i18n instance for multi-language support
  const { t, i18n } = useTranslation()
  // Store the current language code (e.g., 'en' or 'ar') to detect language changes for RTL support
  const preferredLanguage = i18n.language

  // Define all available tabs with their properties (id, label, icon, welcome text, description)
  // useMemo prevents this array from being recreated on every render, improving performance
  // Dependencies: [t] ensures the array updates when translations change
  const tabs = useMemo(() => [
    {
      id: 'org-structure',
      label: t('administratorMenu.tabs.orgStructure.label'),
      icon: Network,
    },
    {
      id: 'employee-profile',
      label: t('administratorMenu.tabs.employeeDirectory.label'),
      icon: BookUser,
      welcome: t('administratorMenu.tabs.employeeDirectory.welcome'),
      desc: t('administratorMenu.tabs.employeeDirectory.desc'),
    },
    {
      id: 'ticketing-rule',
      label: t('administratorMenu.tabs.ticketingRule.label'),
      icon: SlidersHorizontal,
      welcome: t('administratorMenu.tabs.ticketingRule.welcome'),
      desc: t('administratorMenu.tabs.ticketingRule.desc'),
    },
    {
      id: 'sla',
      label: t('administratorMenu.tabs.sla.label'),
      icon: Timer,
      welcome: t('administratorMenu.tabs.sla.welcome'),
      desc: t('administratorMenu.tabs.sla.desc'),
    },
    {
      id: 'notification-email',
      label: t('administratorMenu.tabs.notificationEmail.label'),
      icon: BellDot,
      welcome: t('administratorMenu.tabs.notificationEmail.welcome'),
      desc: t('administratorMenu.tabs.notificationEmail.desc'),
    },
  ], [t])

  // State management for tab navigation
  const [activeTab, setActiveTab] = useState('org-structure') // Tracks which tab is currently selected
  const tabsRef = useRef({}) // Stores DOM references to each tab button for position calculations
  const [indicator, setIndicator] = useState({ left: 0, width: 0 }) // Stores left position and width of the sliding underline

  // Effect: Recalculates the sliding indicator position whenever the active tab changes or language switches
  // This ensures the yellow underline animates to match the selected tab's position
  // For RTL languages, the calculation still works because offsetLeft is relative to the parent
  useEffect(() => {
    const el = tabsRef.current[activeTab] // Get the DOM element of the active tab
    if (el) {
      const parent = el.parentElement // Get the tabs container (parent)
      setIndicator({
        left: el.offsetLeft - parent.offsetLeft, // Calculate position relative to parent
        width: el.offsetWidth, // Match the width of the active tab button
      })
    }
  }, [activeTab, preferredLanguage]) // Re-run when tab changes or language switches (for RTL support)

  // Find the full tab object (with welcome text, description, icon) for the currently active tab
  const activeData = tabs.find((tab) => tab.id === activeTab)

  return (
    <AdminLayout
      title={t('administratorMenu.title')}
      subtitle={t('administratorMenu.subtitle')}
    >
      {/* Tab Container */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">

        {/* Mobile Tab Navigation - 2x3 Grid */}
        <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 md:hidden">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-4 text-lg font-semibold rounded-xl cursor-pointer flex items-center justify-center gap-3 transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white text-gray-800 shadow-[inset_0_-4px_12px_rgba(234,179,8,0.3)] border border-yellow-300 ring-1 ring-yellow-200'
                  : 'bg-transparent text-gray-500 hover:bg-white hover:text-gray-700 hover:shadow-sm border border-transparent'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-yellow-500' : ''}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Desktop Tab Navigation - Row with Sliding Indicator */}
        <div className="hidden md:block bg-gradient-to-r from-gray-50 to-white relative">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                ref={(el) => (tabsRef.current[tab.id] = el)}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-2 py-4 text-base font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer flex items-center justify-center gap-3 ${
                  activeTab === tab.id
                    ? 'text-gray-800 shadow-[inset_0_-6px_16px_rgba(234,179,8,0.25)]'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className={`w-5 h-5 flex-shrink-0 ${activeTab === tab.id ? 'text-yellow-500' : ''}`} />
                {tab.label}
              </button>
            ))}
          </div>
          {/* Sliding indicator */}
          <div
            className="absolute bottom-0 h-[2px] bg-yellow-400 rounded-full transition-all duration-500 ease-in-out"
            style={{ left: indicator.left, width: indicator.width }}
          />
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Organization Structure — real content */}
          {activeTab === 'org-structure' && <OrgStructureTab />}

          {/* Employee Directory — real content */}
          {activeTab === 'employee-profile' && <EmployeeDirectoryTab />}

          {/* Other tabs — placeholder welcome cards */}
          {activeTab !== 'org-structure' && activeTab !== 'employee-profile' && activeData && (
            <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
              <div className="w-16 h-16 rounded-2xl bg-yellow-50 border border-yellow-200 flex items-center justify-center shadow-sm">
                <activeData.icon className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="space-y-2 max-w-md">
                <h2 className="text-2xl font-bold text-gray-800">{activeData.welcome}</h2>
                <p className="text-gray-500 text-base leading-relaxed">{activeData.desc}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
