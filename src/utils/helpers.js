// Color management is now handled by the Tag component

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
  { value: "New", label: "New" },
  { value: "Under Process", label: "Under Process" },
  { value: "Pending Employee", label: "Pending Employee" },
  { value: "Pending Third Party", label: "Pending Third Party" },
  { value: "Completed", label: "Completed" },
  { value: "Closed", label: "Closed" },
];

// Priority options
export const PRIORITIES = [
  { value: "Critical", label: "Critical" },
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
];

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
