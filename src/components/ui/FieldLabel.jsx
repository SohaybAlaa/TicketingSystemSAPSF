import React from 'react'

/**
 * Uppercase form-field label with amber dot prefix and optional leading icon.
 * Two sizes: `md` (default) and `sm`.
 */
export default function FieldLabel({ children, icon: Icon, iconClassName = '', htmlFor, size = 'md', className = '' }) {
  const isSm = size === 'sm'
  return (
    <label
      htmlFor={htmlFor}
      className={`!font-extrabold !uppercase !text-slate-700 flex items-center ${
        isSm
          ? '!text-[12px] !tracking-[0.1em] gap-1.5'
          : '!text-[13px] !tracking-[0.12em] gap-2'
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`${isSm ? 'w-[7px] h-[7px]' : 'w-2 h-2'} rounded-full bg-amber-500 flex-shrink-0 shadow-sm shadow-amber-300`}
      />
      {Icon && (
        <Icon
          size={isSm ? 13 : 15}
          className={`text-slate-600 flex-shrink-0 ${iconClassName}`}
          strokeWidth={2.25}
        />
      )}
      <span className="truncate">{children}</span>
    </label>
  )
}
