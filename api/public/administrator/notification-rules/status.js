import { updateNotificationStatusByCodeDB } from '../../../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { // Allow only POST method
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id, status } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Missing required field: id (rule code)' });
  }
  if (typeof status !== 'boolean') {
    return res.status(400).json({ success: false, error: 'Field "status" must be a boolean' });
  }

  try {
    const rowCount = await updateNotificationStatusByCodeDB(id, status);
    if (!rowCount) {
      return res.status(404).json({ success: false, error: 'Notification rule not found' });
    }

    res.status(200).json({ success: true, id, status });

  } catch (error) {
    console.error('[API] Error updating notification status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update notification status',
      message: error.message
    });
  }
}
