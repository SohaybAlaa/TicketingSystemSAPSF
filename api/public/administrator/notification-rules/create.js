import { createNotificationRuleDB, getNotificationRuleByCodeDB } from '../../../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { // Allow only POST method
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { name, status, subject, body, conds, personas, extraSelections } = req.body;

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
    const code = await createNotificationRuleDB({
      name, status, subject, body,
      conds: Array.isArray(conds) ? conds : [],
      personas,
      extraSelections: extraSelections || {},
    });

    const rule = await getNotificationRuleByCodeDB(code);
    res.status(201).json({ success: true, rule });

  } catch (error) {
    console.error('[API] Error creating notification rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create notification rule',
      message: error.message
    });
  }
}
