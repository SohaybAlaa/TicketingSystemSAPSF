import { updateNotificationRuleByCodeDB, getNotificationRuleByCodeDB } from '../../../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { // Allow only POST method
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id, name, status, subject, body, conds, personas, extraSelections } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Missing required field: id (rule code)' });
  }
  if (!name || !subject || !body) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: name, subject, body'
    });
  }
  if (!Array.isArray(personas) || personas.length === 0) {
    return res.status(400).json({ success: false, error: 'At least one recipient (persona) is required' });
  }

  try {
    const found = await updateNotificationRuleByCodeDB(id, {
      name, status, subject, body,
      conds: Array.isArray(conds) ? conds : [],
      personas,
      extraSelections: extraSelections || {},
    });

    if (!found) {
      return res.status(404).json({ success: false, error: 'Notification rule not found' });
    }

    const rule = await getNotificationRuleByCodeDB(id);
    res.status(200).json({ success: true, rule });

  } catch (error) {
    console.error('[API] Error updating notification rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update notification rule',
      message: error.message
    });
  }
}
