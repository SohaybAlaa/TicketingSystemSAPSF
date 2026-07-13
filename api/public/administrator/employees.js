import { getAllEmployeesDB } from '../../_utils/db.js';

// Map a raw employees DB row (snake_case + joined columns) to the
// camelCase shape the Employee Directory frontend expects.
function formatEmployee(row) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    name: row.name,
    entityCode: row.entity_code || '',
    entityName: row.entity_name || '',
    location: row.location || '',
    department: row.department || '',
    employeeClass: row.employee_class || '',
    manager: row.manager_name || '',
    email: row.email || '',
    mobileNumber: row.mobile_number || '',
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') { // Allow only GET method
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const rows = await getAllEmployeesDB(); // Get all employees from the database
    const employees = rows.map(formatEmployee);

    res.status(200).json({
      success: true,
      count: employees.length,
      employees
    });

  } catch (error) {
    console.error('[API] Error fetching employees:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch employees from database',
      message: error.message
    });
  }
}
