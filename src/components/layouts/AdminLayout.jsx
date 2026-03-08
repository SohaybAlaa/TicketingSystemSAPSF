import React from "react";

/**
 * AdminLayout - A reusable layout component for admin pages
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to render inside the layout
 * @param {string} props.title - The page title
 * @param {string} props.subtitle - Optional subtitle text
 * @param {React.ReactNode} props.headerActions - Optional actions to display in the header
 * @returns {JSX.Element}
 */
export default function AdminLayout({ children, title, subtitle, headerActions }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        {(title || headerActions) && (
          <div className="mb-8 flex items-center justify-between">
            {title && (
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-1 h-7 rounded-full bg-gradient-to-b from-yellow-400 to-yellow-500" />
                  <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">{title}</h1>
                </div>
                {subtitle && (
                  <p className="text-sm text-gray-400 font-medium pl-4">{subtitle}</p>
                )}
              </div>
            )}
            {headerActions && ( //button
              <div className="flex items-center gap-4">
                {headerActions}
              </div>
            )}
          </div>
        )}
        
        {/* Content */}
        {children}
      </div>
    </div>
  );
}
