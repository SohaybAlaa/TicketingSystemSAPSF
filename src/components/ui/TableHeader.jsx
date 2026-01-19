import React from "react";

/**
 * TableHeader - A reusable component for table headers with RTL support
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to display inside the header
 * @param {boolean} props.isRTL - Whether the text should be displayed in RTL mode
 * @returns {JSX.Element}
 */
const TableHeader = ({ children, isRTL }) => {
  const rtlClass = (base, rtlExtra = "", isRTL) =>
    `${base} ${isRTL ? rtlExtra : ""}`.trim();

  return (
    <th
      className={rtlClass(
        "px-6 py-3 text-sm font-semibold text-gray-700",
        "font-bold text-base",
        isRTL
      )}
      style={{ textAlign: isRTL ? "right" : "left" }}
    >
      {children}
    </th>
  );
};

export default TableHeader;
