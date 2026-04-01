import React from "react";
import { Sparkles, ClockAlert, AlarmClock, Loader2, CheckCheck, ArchiveRestore, ArrowDown, Minus, ArrowUp, ShieldAlert ,TriangleAlert, UserCheck, UserX, User, UserCog} from "lucide-react";

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
// Centralized color mapping for all statuses and priorities
export const COLOR_MAP = {
  // Status colors
  "PENDING THIRDPARTY": "#fc6900", // Alternative spelling
  "PENDING THIRD PARTY": "#fc6900", // With space
  "PENDING EMPLOYEE": "#eab308",
  "UNDER PROCESS": "#3b82f6",
  NEW: "#9333ea",
  COMPLETED: "#22c55e",
  CLOSED: "#6b7280",
  
  // Org Structure specific statuses
  ACTIVE: "#22c55e",
  INACTIVE: "#ef4444",
  
  // Priority colors
  LOW: "#22c55e",
  MEDIUM: "#3b82f6",
  HIGH: "#fc6900",
  CRITICAL: "#ef4444",
  
  // User type colors
  AGENT: "#9333ea",
  MANAGER: "#3b82f6",
  SUPERVISOR: "#fc6900",
  
  // Special tags
  OVERDUE: "#ef4444",
};

export const ICON_MAP = {
  // Status icons
  NEW: Sparkles,
  "PENDING THIRD PARTY": ClockAlert,
  "PENDING THIRDPARTY": ClockAlert,
  "PENDING EMPLOYEE": AlarmClock,
  "UNDER PROCESS": Loader2,
  COMPLETED: CheckCheck,
  CLOSED: ArchiveRestore,

  // Org Structure specific icons
  ACTIVE: UserCheck,
  INACTIVE: UserX,

  // Priority icons
  LOW: ArrowDown,
  MEDIUM: Minus,
  HIGH: ArrowUp,
  CRITICAL: ShieldAlert,
  
  // User type icons
  AGENT: User,
  MANAGER: UserCog,
  SUPERVISOR: UserCog,
  
  OVERDUE: TriangleAlert,
};

export const getValueColor = (value) => {
  const stringValue = String(value || "");
  const normalized = stringValue?.toUpperCase().replace(/_/g, " ") || "";
  return COLOR_MAP[normalized] || "#6b7280";
};

export const getValueIcon = (value) => {
  const stringValue = String(value || "");
  const normalized = stringValue?.toUpperCase().replace(/_/g, " ") || "";
  return ICON_MAP[normalized] || null;
};

const Tag = ({ type, value, t, isRTL = false, className = "", icon, showIcon = false }) => {
  // Ensure value is a string before processing
  const stringValue = String(value || "");
  
  // Normalize the value for color mapping
  const normalizedValue = stringValue?.toUpperCase().replace(/_/g, ' ') || "";
  
  // Get the color based on the value
  const color = COLOR_MAP[normalizedValue] || "#6b7280"; // Default gray
  
  // Define background and text colors based on the main color
  const bgColor = `${color}20`; // 20% opacity version of the color
  const borderColor = `${color}40`; // 40% opacity version of the color
  const textColor = color;
  const IconComp = ICON_MAP[normalizedValue] || null;
  
  // Translation key based on type
  let translationKey;
  
  if (type === 'status') {
    // Handle both formats: "New" and "NEW"
    // Check if we're in the ticket details page
    const isTicketDetailsPage = window.location.pathname.includes('/tickets/');
    
    if (isTicketDetailsPage) {
      // In ticket details page, use the ticketDetails.statuses namespace
      // Use the value as-is (with spaces) for translation keys
      translationKey = `ticketsPage.statuses.${value}`;
    } else {
      // In tickets list page, use the ticketsPage.statuses namespace
      // Use the value as-is (with spaces) for translation keys
      translationKey = `ticketsPage.statuses.${value}`;
    }
  } else if (type === 'userType') {
    translationKey = `administratorMenu.userTypes.${value}`;
  } else {
    // For priorities, check if we're in ticket details page
    const isTicketDetailsPage = window.location.pathname.includes('/tickets/');
    
    if (isTicketDetailsPage) {
      translationKey = `ticketsPage.priorities.${value}`;
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
      {icon
        ? <span className="mr-1">{icon}</span>
        : showIcon && IconComp && <IconComp className="w-3.5 h-3.5 mr-1" />
      }
      {t ? t(translationKey) : stringValue}
    </div>
  );
};

export default Tag;
