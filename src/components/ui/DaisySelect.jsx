// ChevronDown = small "v" arrow icon from lucide-react icon library
import { ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

/**
 * DaisySelect — A reusable dropdown (select) component.
 * Uses position:fixed + portal so the menu escapes any overflow container (modals, etc.)
 *
 * Props:
 * @param {string}   value       - The currently selected value (e.g. "Agent")
 * @param {string[]} options     - Array of option values to show in the dropdown (e.g. ["Agent", "Manager", "Supervisor"])
 * @param {function} onChange    - Callback fired when the user picks an option, receives the selected value
 * @param {boolean}  hasError    - If true, shows a red border to indicate a validation error
 * @param {string}   placeholder - Custom placeholder text (optional, falls back to translated "Select…")
 * @param {string}   translationPrefix - Translation namespace prefix for option labels (e.g. "modals.memberForm.userTypes")
 *                                      If provided, each option "Agent" is translated via t("modals.memberForm.userTypes.Agent")
 * @param {function} t           - The i18n translation function from react-i18next
 * @param {boolean}  isRTL       - If true, flips layout for Arabic (right-to-left) languages
 */
export default function DaisySelect({ value, options, onChange, hasError, placeholder, translationPrefix, t, isRTL, disabled }) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 })

  // If no custom placeholder is passed, use the translated default "Select…" / "اختر…"
  const displayPlaceholder = placeholder || t('common.selectPlaceholder', 'Select…')

  // If a value is selected, get its translated label (e.g. "Agent" → "وكيل" in Arabic)
  // If no translationPrefix is provided, just show the raw value
  // If nothing is selected (value is empty/null), label stays null → we show the placeholder instead
  const label = value ? (translationPrefix ? t(`${translationPrefix}.${value}`, value) : value) : null

  // Calculate menu position from trigger button's bounding rect
  const updatePosition = () => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setMenuPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    })
  }

  // Toggle dropdown open/closed
  const toggle = () => {
    if (disabled) return
    if (!isOpen) updatePosition()
    setIsOpen(prev => !prev)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setIsOpen(false)
      }
    }
    // Close on scroll of any ancestor (modal body, etc.)
    const handleScroll = () => setIsOpen(false)

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isOpen])

  return (
    <div className="w-full relative">

      {/* ─── Trigger Button ─── */}
      <div
        ref={triggerRef}
        role="button"
        onClick={toggle}
        className={`btn btn-sm btn-outline w-full justify-between px-3 py-2 h-auto min-h-0 rounded-xl font-medium text-sm transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-yellow-400 hover:bg-yellow-50'}
          ${hasError ? 'border-red-400 bg-red-50/30' : 'border-gray-200'}
          ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        {/* Selected value text or placeholder — fills available space with flex-1 */}
        {/* In RTL (Arabic): text aligns right. In LTR (English): text aligns left */}
        {/* Gray-400 color for placeholder, gray-800 for actual selected value */}
        <span className={`${label ? 'text-gray-800' : 'text-gray-400'} ${isRTL ? 'text-right' : 'text-left'} flex-1`}>
          {label ?? displayPlaceholder}
        </span>

        {/* Dropdown arrow icon — moves to left side in RTL, right side in LTR */}
        <ChevronDown size={15} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${isRTL ? 'order-first' : 'order-last'}`} />
      </div>

      {/* ─── Dropdown Menu — portaled to document.body with position:fixed ─── */}
      {/* This ensures the menu floats above modals, overflow containers, etc. */}
      {isOpen && createPortal(
        <div
          ref={menuRef}
          className={`bg-base-100 rounded-xl p-2 shadow-xl border border-gray-200 max-h-48 overflow-y-auto ${isRTL ? 'text-right' : 'text-left'}`}
          style={{
            position: 'fixed',
            top: menuPos.top,
            left: menuPos.left,
            width: menuPos.width,
            zIndex: 99999,
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <ul className="flex flex-col gap-0.5 w-full">
            {/* Loop through each option and render a clickable list item */}
            {options.map(option => {
              // Translate the option label if a namespace is provided, otherwise use raw value
              const optionLabel = translationPrefix ? t(`${translationPrefix}.${option}`, option) : option
              const isSelected = value === option

              return (
                <li
                  key={option}
                  // When clicked: update the parent form with the new value, then close the dropdown
                  onClick={() => {
                    onChange(option)
                    setIsOpen(false)
                  }}
                >
                  {/* Highlight the currently selected option with a yellow background */}
                  <a className={`block px-3 py-1.5 font-medium w-full rounded-lg cursor-pointer hover:bg-yellow-50 transition-colors ${isSelected ? 'bg-yellow-50 text-yellow-800' : ''}`}>
                    {optionLabel}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>,
        document.body
      )}
    </div>
  )
}
