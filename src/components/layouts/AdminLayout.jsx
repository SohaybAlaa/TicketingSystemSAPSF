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
          <div className="mb-5 flex items-center justify-between">
            {title && (
              <div>
                <h1 className="mb-2">{title}</h1>
                {subtitle && <p>{subtitle}</p>}
              </div>
            )}
            {headerActions && (
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
