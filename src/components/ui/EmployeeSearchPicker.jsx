import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Search, User, IdCard, Mail, CheckCircle2, X } from 'lucide-react'

// Build up-to-2-char initials from a full name for the avatar circle
const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Searchable employee picker backed by the Employee Directory.
 * Fetches the employee list when `active` becomes true, lets the user search by name or ID
 * via a portal-positioned dropdown (so it escapes the modal's overflow/scroll), and shows a
 * rich "selected" card once one is chosen.
 *
 * `onSelect` receives the full employee record ({ id, name, email, entity, employeeClass,
 * department, location }) so callers can pull whatever fields they need.
 *
 * Props:
 *   active      - fetch the employee list while true (e.g. the parent modal's isOpen)
 *   selected    - { id, name, email? } | null — shows the selected card instead of the search input
 *   onSelect    - (employee) => void
 *   onClear     - () => void
 *   hasError    - highlights the search input red
 *   isRTL, t    - i18n
 *   placeholder - search input placeholder
 */
export default function EmployeeSearchPicker({
  active,
  selected,
  onSelect,
  onClear,
  hasError,
  isRTL,
  t,
  placeholder,
}) {
  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Portal-positioned dropdown (escapes the modal's overflow so it never clips/scrolls)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 })

  const updateMenuPos = () => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setMenuPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
  }

  // Keep the portaled menu aligned on scroll/resize, and close it on outside click
  useEffect(() => {
    if (!search) return
    updateMenuPos()
    const onScroll = (e) => {
      if (menuRef.current && menuRef.current.contains(e.target)) return
      updateMenuPos()
    }
    const onClickOutside = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setSearch('')
      }
    }
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', updateMenuPos)
    document.addEventListener('mousedown', onClickOutside)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', updateMenuPos)
      document.removeEventListener('mousedown', onClickOutside)
    }
  }, [search])

  // Fetch employees whenever the picker becomes active (e.g. parent modal opens)
  useEffect(() => {
    if (!active) return
    setSearch('')
    const fetchEmployees = async () => {
      setIsLoading(true)
      try {
        const res = await fetch('/api/public/administrator/employees')
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.employees) {
            setEmployees(data.employees.map(emp => ({
              id: emp.employeeId,
              name: emp.name,
              email: emp.email,
              entity: emp.entityName,
              employeeClass: emp.employeeClass,
              department: emp.department,
              location: emp.location,
            })))
          }
        }
      } catch (err) {
        console.error('[EmployeeSearchPicker] Failed to fetch employees:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchEmployees()
  }, [active])

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.id.toLowerCase().includes(search.toLowerCase())
  )

  if (selected) {
    return (
      <div className={`flex items-center gap-3 rounded-xl border border-green-200 bg-green-50/50 px-3 py-2.5 transition-all ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
        >
          {getInitials(selected.name)}
        </div>
        <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className={`flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
            <span className="font-semibold text-gray-800 truncate">{selected.name}</span>
          </div>
          <div className={`flex items-center gap-3 mt-0.5 text-xs text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className={`inline-flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <IdCard size={12} /> {selected.id}
            </span>
            {selected.email && (
              <span className={`inline-flex items-center gap-1 truncate ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Mail size={12} /> {selected.email}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="p-1.5 rounded-lg hover:bg-red-100 transition-colors flex-shrink-0"
          title={t('common.change', 'Change')}
        >
          <X size={16} className="text-red-400" />
        </button>
      </div>
    )
  }

  return (
    <div className="relative" ref={triggerRef}>
      <div className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`}>
        <Search size={16} />
      </div>
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={placeholder}
        className={`w-full border rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition-all ${isRTL ? 'text-right pr-9' : 'text-left pl-9'} ${hasError ? 'border-red-400 bg-red-50/30' : 'border-gray-200'}`}
        disabled={isLoading}
      />
      {search && createPortal(
        <div
          ref={menuRef}
          className={`bg-white border border-gray-200 rounded-xl shadow-xl hide-scrollbar ${isRTL ? 'text-right' : 'text-left'}`}
          style={{
            position: 'fixed',
            top: menuPos.top,
            left: menuPos.left,
            width: menuPos.width,
            zIndex: 99999,
            maxHeight: '224px',
            overflowY: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {isLoading ? (
            <div className="p-3 text-center text-sm text-gray-400">
              {t('common.loading', 'Loading...')}
            </div>
          ) : filteredEmployees.length > 0 ? (
            filteredEmployees.map(emp => (
              <button
                key={emp.id}
                type="button"
                onClick={() => { onSelect(emp); setSearch('') }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-yellow-50/70 transition-colors border-b border-gray-100 last:border-b-0 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}
                >
                  {getInitials(emp.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 truncate">{emp.name}</div>
                  <div className={`flex items-center gap-1 text-xs text-gray-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <IdCard size={11} /> {emp.id}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center gap-1 p-4 text-center">
              <User size={20} className="text-gray-300" />
              <span className="text-sm text-gray-400">{t('common.noResults', 'No employees found')}</span>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  )
}
