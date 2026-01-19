import React from "react";

/**
 * FilterButton - A reusable button component for filter selections
 * 
 * @param {Object} props
 * @param {boolean} props.active - Whether the button is active/selected
 * @param {Function} props.onClick - Click handler function
 * @param {React.ReactNode} props.children - The content to display inside the button
 * @param {boolean} props.isRTL - Whether the text should be displayed in RTL mode
 * @returns {JSX.Element}
 */
const FilterButton = ({ active, onClick, children, isRTL }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer ${
      active
        ? "bg-yellow-400 text-black hover:bg-yellow-500"
        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
    }`}
  >
    {children}
  </button>
);

export default FilterButton;
