import React from "react";

/**
 * ActionButton - A reusable button component for admin actions
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element}
 */
export default function ActionButton({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 bg-white text-slate-800 border-2 border-slate-200 rounded-xl hover:bg-yellow-400 hover:border-2 hover:border-yellow-400 hover-effect font-semibold ${className}`}
    >
      {children}
    </button>
  );
}
