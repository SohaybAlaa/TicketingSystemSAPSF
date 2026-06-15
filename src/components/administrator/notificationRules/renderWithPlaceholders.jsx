import React from 'react'

/**
 * Render a string containing `{{token}}` placeholders, wrapping each token in a
 * yellow chip and leaving plain text segments untouched.
 */
export default function renderWithPlaceholders(str) {
  if (!str) return null
  const parts = str.split(/(\{\{[^}]+\}\})/g)
  return parts.map((part, i) => {
    const m = part.match(/^\{\{(.+)\}\}$/)
    if (m) {
      const label = m[1].replace(/_/g, ' ')
      return (
        <span
          key={i}
          className="inline-flex items-center px-1.5 py-[1px] mx-0.5 rounded-md bg-yellow-100 border border-yellow-300 !text-yellow-800 !text-[11px] !font-bold align-baseline"
        >
          {label}
        </span>
      )
    }
    return <span key={i}>{part}</span>
  })
}
