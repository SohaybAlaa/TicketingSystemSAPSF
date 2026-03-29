import React from 'react'

export default function ActionIconButton({ onClick, icon: Icon, variant = 'blue', title }) {
  const colors = variant === 'red'
    ? 'text-red-600 hover:bg-red-50'
    : 'text-blue-600 hover:bg-blue-50'
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick() }}
      className={`p-2 ${colors} rounded-full transition-colors cursor-pointer flex items-center justify-center`}
      title={title}
    >
      <Icon className="w-4 h-4" />
    </button>
  )
}
