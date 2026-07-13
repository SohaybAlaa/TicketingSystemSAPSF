import { createEmployeeDB, getEmployeeByIdDB } from '../../../_utils/db.js';

// Map a raw employees DB row to the camelCase shape the frontend expects.
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
  if (req.method !== 'POST') { // Allow only POST method
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const {
    employeeId, name, entityCode, entityName, location,
    department, employeeClass, manager, email, mobileNumber
  } = req.body;

  // Validate required fields (mirrors EmployeeFormModal validation)
  if (!employeeId || !name || !email || !entityCode || !entityName || !department) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: employeeId, name, email, entityCode, entityName, department'
    });
  }

  try {
    const { id } = await createEmployeeDB({
      employeeId, name, entityCode, entityName, location,
      department, employeeClass, manager, email, mobileNumber
    });

    // Re-fetch with joins so the response carries entity/manager display values
    const row = await getEmployeeByIdDB(id);

    res.status(201).json({ success: true, employee: formatEmployee(row) });

  } catch (error) {
    console.error('[API] Error creating employee:', error);
    // Unique violation on employee_id
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'An employee with this Employee ID already exists',
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create employee',
      message: error.message
    });
  }
}
