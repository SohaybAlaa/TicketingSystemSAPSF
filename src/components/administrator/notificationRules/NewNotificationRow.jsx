import React from 'react'
import NotificationFormShell from './NotificationFormShell'

export default function NewNotificationRow({ onSave, onCancel, open }) {
  return (
    <NotificationFormShell
      initial={null}
      onSave={onSave}
      onCancel={onCancel}
      open={open}
      wrapperClassName={`border-2 border-dashed rounded-2xl transition-all duration-300 ${open ? 'border-yellow-400 bg-white shadow-lg shadow-yellow-100' : 'border-transparent'}`}
    />
  )
}
