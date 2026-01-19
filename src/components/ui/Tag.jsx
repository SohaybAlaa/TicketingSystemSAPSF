import React from "react";

/**
 * Tag - A reusable component for displaying status and priority tags
 * 
 * @param {Object} props
 * @param {string} props.type - The type of tag ('status' or 'priority')
 * @param {string} props.value - The value to display (e.g., 'New', 'HIGH')
 * @param {Function} props.t - Translation function
 * @param {boolean} props.isRTL - Whether to use RTL layout
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.icon - Optional icon to display before the text
 * @returns {JSX.Element}
 */
const Tag = ({ type, value, t, isRTL = false, className = "", icon }) => {
  // Centralized color mapping for all statuses and priorities
  const COLOR_MAP = {
    // Status colors
    "PENDING THIRDPARTY": "#fc6900", // Alternative spelling
    "PENDING EMPLOYEE": "#eab308",
    "UNDER PROCESS": "#3b82f6",
    NEW: "#9333ea",
    COMPLETED: "#22c55e",
    CLOSED: "#6b7280",
    
    // Priority colors
    LOW: "#22c55e", // Same as UNDER PROCESS
    MEDIUM: "#3b82f6", // Same as UNDER PROCESS
    HIGH: "#fc6900", // Same as PENDING THIRD PARTY
    CRITICAL: "#ef4444",
    
    // Special tags
    OVERDUE: "#ef4444", // Same as CRITICAL
  };
  
  // Normalize the value for color mapping
  const normalizedValue = value?.toUpperCase().replace(/_/g, ' ') || "";
  
  // Get the color based on the value
  const color = COLOR_MAP[normalizedValue] || "#6b7280"; // Default gray
  
  // Define background and text colors based on the main color
  const bgColor = `${color}20`; // 20% opacity version of the color
  const borderColor = `${color}40`; // 40% opacity version of the color
  const textColor = color;
  
  // Translation key based on type
  let translationKey;
  
  if (type === 'status') {
    // Handle both formats: "New" and "NEW"
    // Check if we're in the ticket details page
    const isTicketDetailsPage = window.location.pathname.includes('/tickets/');
    
    if (isTicketDetailsPage) {
      // In ticket details page, use the ticketDetails.statuses namespace
      // Convert status values to translation key format
      // First standardize by replacing spaces with underscores and converting to uppercase
      const formattedValue = value
        .toUpperCase()
        .replace(/ /g, '_')
        .replace('THIRDPARTY', 'THIRD_PARTY'); // Handle the special case more generally
      
      translationKey = `ticketDetails.statuses.${formattedValue}`;
    } else {
      // In tickets list page, use the ticketsPage.statuses namespace
      translationKey = `ticketsPage.statuses.${value}`;
    }
  } else {
    // For priorities, check if we're in ticket details page
    const isTicketDetailsPage = window.location.pathname.includes('/tickets/');
    
    if (isTicketDetailsPage) {
      translationKey = `ticketDetails.priorities.${value}`;
    } else {
      translationKey = `ticketsPage.priorities.${value}`;
    }
  }
  
  return (
    <div 
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${className}`}
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        color: textColor,
        borderWidth: "1px",
        borderStyle: "solid",
        direction: isRTL ? "rtl" : "ltr"
      }}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {t ? t(translationKey) : value}
    </div>
  );
};

export default Tag;
