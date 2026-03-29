import React from 'react'

/**
 * Reusable Modern Separator Component
 * Used to create elegant section separators with gradient styling
 * 
 * @param {string} className - Additional CSS classes
 * @param {string} width - Width of the gradient line (default: w-250 = 250px)
 * @param {string} gradient - Gradient classes (default: yellow gradient)
 */
export default function ModernSeparator({ 
  className = '', 
  width = 'w-250',
  gradient = 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400'
}) {
  return (
    <div className={`relative my-8 ${className}`}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300"></div>
      </div>
      <div className="relative flex justify-center">
        <div className="px-4 bg-white">
          <div className={`${width} h-1 ${gradient} rounded-full shadow-sm shadow-yellow-400/30`}></div>
        </div>
      </div>
    </div>
  )
}
