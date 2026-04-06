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

  const now = new Date();

  // Resolve end date from any known field name
  const endRaw = item.validTo ?? item.to ?? item.endDate ?? item.expiryDate ?? null;
  // Resolve start date from any known field name
  const startRaw = item.validFrom ?? item.from ?? item.startDate ?? null;

  // Check if both dates exist
  if (startRaw && endRaw) {
    const startDate = new Date(startRaw);
    const endDate = new Date(endRaw);
    
    // Active only if current date is between start and end dates (inclusive)
    if (!isNaN(startDate) && !isNaN(endDate)) {
      if (now >= startDate && now <= endDate) {
        return 'Active';
      } else {
        return 'Inactive';
      }
    }
  }

  // If only end date exists, check if it's in the future
  if (endRaw && !startRaw) {
    const endDate = new Date(endRaw);
    if (!isNaN(endDate) && endDate < now) return 'Inactive';
  }

  // If only start date exists, check if it's in the past
  if (startRaw && !endRaw) {
    const startDate = new Date(startRaw);
    if (!isNaN(startDate) && startDate > now) return 'Inactive';
  }

  // If the item has an isActive boolean property
  if (typeof item.isActive === 'boolean') {
    return item.isActive ? 'Active' : 'Inactive';
  }

  // Default to Active if no date information is available
  return 'Active';
};
