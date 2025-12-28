// Chart colors configuration
export const CHART_COLORS = {
  NEW: "#9333ea",
  "UNDER PROCESS": "#3b82f6",
  "PENDING EMPLOYEE": "#eab308",
  "PENDING THIRD PARTY": "#f97316",
  COMPLETED: "#22c55e",
  CLOSED: "#6b7280",
  LOW: "#3b82f6",
  MEDIUM: "#eab308",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
};

// Helper function for chart colors
export const getColorForIndex = (index) => {
  const colors = [
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#6366f1",
  ];
  return colors[index % colors.length];
};

// Status options for action menu button in ticket page
export const STATUSES = [
  { value: "New", label: "New", color: "#ede9fe" },
  { value: "Under Process", label: "Under Process", color: "#dbeafe" },
  { value: "Pending Employee", label: "Pending Employee", color: "#fffbeb" },
  {
    value: "Pending ThirdParty",
    label: "Pending ThirdParty",
    color: "#fef3c7",
  },
  { value: "Completed", label: "Completed", color: "#d1fae5" },
  { value: "Closed", label: "Closed", color: "#e5e7eb" },
];

// Priority options
export const PRIORITIES = [
  { value: "CRITICAL", label: "Critical", color: "#fecaca" },
  { value: "HIGH", label: "High", color: "#fed7aa" },
  { value: "MEDIUM", label: "Medium", color: "#dbeafe" },
  { value: "LOW", label: "Low", color: "#d1fae5" },
];

/**
 * Get color classes for priority badges
 * @param {string} priority - Priority level (CRITICAL, HIGH, MEDIUM, LOW)
 * @returns {string} - Tailwind CSS classes
 */
export const getPriorityColor = (priority) => {
  const colors = {
    LOW: "bg-blue-100 text-blue-800 border-blue-200",
    MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
    HIGH: "bg-orange-100 text-orange-800 border-orange-200",
    CRITICAL: "bg-red-100 text-red-800 border-red-200",
  };
  return colors[priority] || colors.MEDIUM;
};

/**
 * Get color classes for status badges
 * @param {string} status - Status value
 * @returns {string} - Tailwind CSS classes
 */
export const getStatusColor = (status) => {
  const colors = {
    NEW: "bg-purple-100 text-purple-800 border-purple-200",
    UNDER_PROCESS: "bg-blue-100 text-blue-800 border-blue-200",
    PENDING_EMPLOYEE: "bg-yellow-100 text-yellow-800 border-yellow-200",
    PENDING_THIRD_PARTY: "bg-orange-100 text-orange-800 border-orange-200",
    COMPLETED: "bg-green-100 text-green-800 border-green-200",
    CLOSED: "bg-gray-100 text-gray-800 border-gray-200",
  };
  return colors[status] || colors.NEW;
};

/**
 * Check if a ticket's SLA is overdue (more than 72 hours since creation)
 * @param {string} createdDate - The date the ticket was created
 * @returns {boolean} - True if SLA is overdue
 */
export const isSLAOverdue = (createdDate) => {
  const created = new Date(createdDate);
  const now = new Date();
  const hoursDiff = (now - created) / (1000 * 60 * 60);
  return hoursDiff > 72;
};

/**
 * Get color styles for priority badges
 * @param {string} priority - Priority level (CRITICAL, HIGH, MEDIUM, LOW)
 * @returns {object} - Object containing bg, text, and border colors
 */
export const getPriorityColorStyles = (priority) => {
  switch (priority) {
    case "CRITICAL":
      return { bg: "#fecaca", text: "#991b1b", border: "#f87171" };
    case "HIGH":
      return { bg: "#fed7aa", text: "#9a3412", border: "#fb923c" };
    case "MEDIUM":
      return { bg: "#dbeafe", text: "#1e40af", border: "#60a5fa" };
    case "LOW":
      return { bg: "#d1fae5", text: "#065f46", border: "#4ade80" };
    default:
      return { bg: "#f3f4f6", text: "#6b7280", border: "#d1d5db" };
  }
};

/**
 * Get color styles for status badges
 * @param {string} status - Status value
 * @returns {object} - Object containing bg, text, and border colors
 */
export const getStatusColorStyles = (status) => {
  switch (status) {
    case "Pending ThirdParty":
      return { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" };
    case "Pending Employee":
      return { bg: "#fffbeb", text: "#b45309", border: "#f59e0b" };
    case "Under Process":
      return { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6" };
    case "New":
      return { bg: "#ede9fe", text: "#6d28d9", border: "#a78bfa" };
    case "Completed":
      return { bg: "#d1fae5", text: "#065f46", border: "#34d399" };
    case "Closed":
      return { bg: "#e5e7eb", text: "#4b5563", border: "#9ca3af" };
    default:
      return { bg: "#f3f4f6", text: "#6b7280", border: "#d1d5db" };
  }
};

/**
 * Get alert notification styles based on type
 * @param {string} type - Alert type (success, error, warning, info)
 * @returns {object} - Object containing bg, border, text colors and icon component
 */
export const getAlertStyles = (type) => {
  // This will be imported with icons in the component that uses it
  const alertTypes = {
    success: {
      bg: "#d1fae5",
      border: "#34d399",
      text: "#065f46",
    },
    error: {
      bg: "#fee2e2",
      border: "#f87171",
      text: "#991b1b",
    },
    warning: {
      bg: "#fef3c7",
      border: "#fbbf24",
      text: "#92400e",
    },
    info: {
      bg: "#dbeafe",
      border: "#60a5fa",
      text: "#1e40af",
    },
  };

  return (
    alertTypes[type] || {
      bg: "#f3f4f6",
      border: "#9ca3af",
      text: "#374151",
    }
  );
};
