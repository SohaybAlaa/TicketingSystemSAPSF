// ChevronDown = small "v" arrow icon from lucide-react icon library
import { ChevronDown } from 'lucide-react'

/**
 * DaisySelect — A reusable dropdown (select) component built with DaisyUI.
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
export default function DaisySelect({ value, options, onChange, hasError, placeholder, translationPrefix, t, isRTL }) {

  // If no custom placeholder is passed, use the translated default "Select…" / "اختر…"
  const displayPlaceholder = placeholder || t('common.selectPlaceholder', 'Select…')

  // If a value is selected, get its translated label (e.g. "Agent" → "وكيل" in Arabic)
  // If no translationPrefix is provided, just show the raw value
  // If nothing is selected (value is empty/null), label stays null → we show the placeholder instead
  const label = value ? (translationPrefix ? t(`${translationPrefix}.${value}`, value) : value) : null

  // DaisyUI dropdowns open on focus and close on blur.
  // Calling blur() on the focused element closes the dropdown after the user picks an option.
  const close = () => { document.activeElement?.blur() }

  return (
    // "dropdown dropdown-bottom" = DaisyUI dropdown that opens below the trigger button
    // "w-full" = take full width of the parent container
    <div className="dropdown dropdown-bottom w-full">

      {/* ─── Trigger Button ─── */}
      {/* This is what the user sees and clicks to open the dropdown */}
      {/* tabIndex={0} makes it focusable (required for DaisyUI dropdown to work) */}
      <div
        tabIndex={0}
        role="button"
        className={`btn btn-sm btn-outline w-full justify-between px-3 py-2 h-auto min-h-0 rounded-xl font-medium text-sm transition-all duration-200
          hover:border-yellow-400 hover:bg-yellow-50
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
        <ChevronDown size={15} className={`text-gray-400 ${isRTL ? 'order-first' : 'order-last'}`} />
      </div>

      {/* ─── Dropdown Menu (appears when trigger is focused/clicked) ─── */}
      {/* "dropdown-content" = DaisyUI class that shows/hides this on focus */}
      {/* "menu" = DaisyUI menu styling for the list items */}
      {/* z-[1] = ensures dropdown appears above other content */}
      <ul
        tabIndex={0}
        className={`dropdown-content menu bg-base-100 rounded-xl z-[1] w-full p-2 shadow-xl border border-gray-200 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}
      >
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
                close()
              }}
            >
              {/* Highlight the currently selected option with a yellow background */}
              <a className={`font-medium ${isSelected ? 'bg-yellow-50 text-yellow-800' : ''}`}>
                {optionLabel}
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
