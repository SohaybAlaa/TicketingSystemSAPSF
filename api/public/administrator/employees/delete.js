import { deleteEmployeeDB, getEmployeeByIdDB } from '../../../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { // Allow only POST method
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { id } = req.body; // Get employee internal id from request body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: id'
      });
    }

    const existing = await getEmployeeByIdDB(id); // Ensure the employee exists
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    await deleteEmployeeDB(id); // Delete employee from DB

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully'
    });

  } catch (error) {
    console.error('[API] Error deleting employee:', error);
    // Foreign key violation — employee is referenced elsewhere (e.g. group_members)
    if (error.code === '23503') {
      return res.status(409).json({
        success: false,
        error: 'Cannot delete: this employee is still referenced by other records',
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to delete employee',
      message: error.message
    });
  }
}
