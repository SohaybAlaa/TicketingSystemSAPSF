import { deleteSlaAssignmentDB, getSlaAssignmentByIdDB } from '../../../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { // Allow only POST method
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { id } = req.body; // Get assignment id from request body

    if (!id) {
      return res.status(400).json({ success: false, error: 'Missing required field: id' });
    }

    const existing = await getSlaAssignmentByIdDB(id); // Ensure the assignment exists
    if (!existing) {
      return res.status(404).json({ success: false, error: 'SLA assignment not found' });
    }

    await deleteSlaAssignmentDB(id); // Delete assignment from DB

    res.status(200).json({
      success: true,
      message: 'SLA assignment deleted successfully'
    });

  } catch (error) {
    console.error('[API] Error deleting SLA assignment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete SLA assignment',
      message: error.message
    });
  }
}
