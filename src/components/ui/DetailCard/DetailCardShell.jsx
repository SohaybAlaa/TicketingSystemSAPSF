import React from 'react'
import { Pencil, Trash2, ArrowUp } from 'lucide-react'
import FieldTile from './FieldTile'

// Maps cols number to a safe static Tailwind class (JIT-safe fallback)
const COLS_CLASS_MAP = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' }

// Generic skeleton shown when no item is selected.
// Props:
//   placeholderIcon  - Lucide icon component shown in the gray header box
//   noSelectionText  - primary text (e.g. "No SLA rule selected")
//   noSelectionSub   - secondary text (e.g. "Select a row above...")
//   tileCount        - how many pulsing skeleton tiles to show
//   cols             - grid columns for tiles (default 3)
//   colsClass        - explicit Tailwind grid class(es) override (e.g. "grid-cols-2 lg:grid-cols-4")
//   extraSkeleton    - optional JSX rendered below the tiles (e.g. calendar skeleton)
export function DetailCardPlaceholder({ placeholderIcon: Icon, noSelectionText, noSelectionSub, tileCount = 6, cols = 3, colsClass, extraSkeleton }) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-white to-gray-50 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white flex-shrink-0 shadow-md">
            <Icon size={28} strokeWidth={1.5} />
          </div>
          <div>
            <div className="font-semibold text-lg text-gray-600 tracking-tight">{noSelectionText}</div>
            <div className="text-base text-gray-400 mt-1 font-medium flex items-center gap-2">
              {noSelectionSub}
              <ArrowUp className="h-6 w-6 text-yellow-400 animate-bounce" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button disabled className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 border border-gray-200 text-gray-400 cursor-not-allowed">
            <Pencil size={16} />
          </button>
          <button disabled className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 border border-gray-200 text-gray-400 cursor-not-allowed">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className={`grid ${colsClass ?? COLS_CLASS_MAP[cols] ?? 'grid-cols-3'} bg-white p-5 gap-3`}>
        {[...Array(tileCount)].map((_, i) => (
          <div key={i} className="rounded-xl px-4 py-3.5 bg-gray-50 border border-gray-100 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="h-2 bg-gray-200 rounded w-16 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
      {extraSkeleton && (
        <>
          <div className="mx-5 border-t border-gray-100" />
          {extraSkeleton}
        </>
      )}
    </div>
  )
}

// Generic detail card shell — header + tile grid + optional children below a divider.
// Props:
//   headerIcon      - Lucide icon component (shown in the yellow box)
//   headerIconGradient - optional Tailwind gradient class (default yellow-400→yellow-500)
//   title           - primary title text
//   subtitle        - secondary subtitle text
//   fields          - array of field objects: { label, value, icon, color, customRender?, copyButton? }
//   cols            - grid columns for tiles (default 3)
//   colsClass       - explicit Tailwind grid class(es) override (e.g. "grid-cols-2 lg:grid-cols-4")
//   onEdit          - edit button callback
//   onDelete        - delete button callback
//   t               - i18n translation function
//   children        - optional content rendered below the tiles (e.g. OperatingHoursCalendar)
export default function DetailCardShell({ headerIcon: Icon, headerIconGradient, title, subtitle, fields, cols = 3, colsClass, onEdit, onDelete, t, children }) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white animate-in fade-in slide-in-from-bottom-3 duration-300">

      {/* Header: icon + title/subtitle + edit/delete buttons */}
      <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-white to-gray-50 gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl ${headerIconGradient ?? 'bg-gradient-to-br from-yellow-400 to-yellow-500'} flex items-center justify-center text-white flex-shrink-0 shadow-md`}>
            <Icon size={28} strokeWidth={1.5} />
          </div>
          <div>
            <div className="font-semibold text-lg text-gray-900 tracking-tight">{title}</div>
            {subtitle && <div className="text-sm text-gray-400 font-medium mt-0.5">{subtitle}</div>}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onEdit}
            title={t('common.edit', 'Edit')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-50 border border-blue-200 text-blue-500 hover:bg-blue-100 hover:border-blue-400 hover:text-blue-700 hover:scale-110 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={onDelete}
            title={t('common.delete', 'Delete')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 hover:border-red-400 hover:text-red-700 hover:scale-110 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Tile grid */}
      <div className={`grid ${colsClass ?? COLS_CLASS_MAP[cols] ?? 'grid-cols-3'} bg-white px-5 pt-2 pb-5 gap-3`}>
        {fields.map(({ label, value, icon, color, customRender, copyButton }) => (
          <FieldTile
            key={label}
            label={label}
            value={value}
            icon={icon}
            color={color}
            customRender={customRender}
            copyButton={copyButton}
          />
        ))}
      </div>

      {/* Divider + children (e.g. OperatingHoursCalendar) */}
      {children && (
        <>
          <div className="mx-5 border-t border-gray-200" />
          {children}
        </>
      )}
    </div>
  )
}
