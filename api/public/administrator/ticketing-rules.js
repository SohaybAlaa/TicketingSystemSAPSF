import { getAllTicketingRulesDB } from '../../_utils/db.js';

// Map a ticketing_rules row (with joined names) to the shape the grid expects.
function formatRule(row) {
  return {
    id: row.id,
    entity: row.entity,
    employeeClass: row.employee_class,
    supportCategory: row.support_category,
    subcategory: row.subcategory,
    group: row.group_name,
    priority: row.priority,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') { // Allow only GET method
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const rows = await getAllTicketingRulesDB(); // Get all ticketing rules from the database
    const rules = rows.map(formatRule);

    res.status(200).json({
      success: true,
      count: rules.length,
      rules
    });

  } catch (error) {
    console.error('[API] Error fetching ticketing rules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ticketing rules from database',
      message: error.message
    });
  }
}
