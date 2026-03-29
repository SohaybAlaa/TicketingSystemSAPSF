// Import formatDateTime from the existing module
export { formatDateTime } from './formatDateTime.js';

/**
 * Formats a date string to a readable date format (without time)
 * @param {string} dateString - The date string to format
 * @returns {string} - Formatted date string in DD-MM-YYYY format
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
};

/**
 * Determines the status of a row/item based on date information
 * @param {Object} item - The item with date properties
 * @returns {string} - 'Active' or 'Inactive'
 */
export const resolveRowStatus = (item) => {
  if (!item) return 'Inactive';
  
  // If the item has an endDate or expiryDate, check if it's still valid
  if (item.endDate || item.expiryDate) {
    const endDate = new Date(item.endDate || item.expiryDate);
    const now = new Date();
    return endDate >= now ? 'Active' : 'Inactive';
  }
  
  // If the item has a startDate, check if it has started
  if (item.startDate) {
    const startDate = new Date(item.startDate);
    const now = new Date();
    return startDate <= now ? 'Active' : 'Inactive';
  }
  
  // If the item has an isActive boolean property
  if (typeof item.isActive === 'boolean') {
    return item.isActive ? 'Active' : 'Inactive';
  }
  
  // Default to Active if no date information is available
  return 'Active';
};
