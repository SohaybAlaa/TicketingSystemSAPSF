import { deleteNotificationRuleByCodeDB } from '../../../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { // Allow only POST method
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { id } = req.body; // rule code (e.g. 'NTF-001')

    if (!id) {
      return res.status(400).json({ success: false, error: 'Missing required field: id (rule code)' });
    }

    const rowCount = await deleteNotificationRuleByCodeDB(id);
    if (!rowCount) {
      return res.status(404).json({ success: false, error: 'Notification rule not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Notification rule deleted successfully'
    });

  } catch (error) {
    console.error('[API] Error deleting notification rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification rule',
      message: error.message
    });
  }
}
