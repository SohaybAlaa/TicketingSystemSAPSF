import { deleteGroupMemberDB, getGroupMemberByIdDB } from '../../../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { // Allow only POST method
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { id } = req.body; // Get member id from request body

    if (!id) {
      return res.status(400).json({ success: false, error: 'Missing required field: id' });
    }

    const existing = await getGroupMemberByIdDB(id); // Ensure the member exists
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Group member not found' });
    }

    await deleteGroupMemberDB(id); // Remove member from group

    res.status(200).json({
      success: true,
      message: 'Group member removed successfully'
    });

  } catch (error) {
    console.error('[API] Error removing group member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove group member',
      message: error.message
    });
  }
}
