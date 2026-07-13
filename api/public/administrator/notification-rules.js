import { getAllNotificationRulesDB } from '../../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') { // Allow only GET method
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Already assembled to the frontend shape (rule + conditions + personas)
    const rules = await getAllNotificationRulesDB();

    res.status(200).json({
      success: true,
      count: rules.length,
      rules
    });

  } catch (error) {
    console.error('[API] Error fetching notification rules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notification rules from database',
      message: error.message
    });
  }
}
