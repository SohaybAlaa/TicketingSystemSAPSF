import { deleteGroupDB, getGroupByIdDB } from '../../../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { // Allow only POST method
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { id } = req.body; // Get group id from request body

    if (!id) {
      return res.status(400).json({ success: false, error: 'Missing required field: id' });
    }

    const existing = await getGroupByIdDB(id); // Ensure the group exists
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Support group not found' });
    }

    // Delete group (cascades to its group_members via ON DELETE CASCADE)
    await deleteGroupDB(id);

    res.status(200).json({
      success: true,
      message: 'Support group deleted successfully'
    });

  } catch (error) {
    console.error('[API] Error deleting support group:', error);
    if (error.code === '23503') { // still referenced (e.g. ticketing_rules)
      return res.status(409).json({
        success: false,
        error: 'Cannot delete: this group is still referenced by other records',
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to delete support group',
      message: error.message
    });
  }
}
