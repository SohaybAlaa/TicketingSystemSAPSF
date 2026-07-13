import { updateEmployeeDB, getEmployeeByIdDB } from '../../../_utils/db.js';

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
    id, employeeId, name, entityCode, entityName, location,
    department, employeeClass, manager, email, mobileNumber
  } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Missing required field: id' });
  }

  // Validate required fields (mirrors EmployeeFormModal validation)
  if (!employeeId || !name || !email || !entityCode || !entityName || !department) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: employeeId, name, email, entityCode, entityName, department'
    });
  }

  try {
    const existing = await getEmployeeByIdDB(id); // Ensure the employee exists
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    await updateEmployeeDB(id, {
      employeeId, name, entityCode, entityName, location,
      department, employeeClass, manager, email, mobileNumber
    });

    const row = await getEmployeeByIdDB(id); // Re-fetch with joins

    res.status(200).json({ success: true, employee: formatEmployee(row) });

  } catch (error) {
    console.error('[API] Error updating employee:', error);
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'An employee with this Employee ID already exists',
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to update employee',
      message: error.message
    });
  }
}
