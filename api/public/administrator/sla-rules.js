import { getAllSlaRulesDB } from '../../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') { // Allow only GET method
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Already formatted to the frontend shape (responseTime string + operatingHours object)
    const rules = await getAllSlaRulesDB();

    res.status(200).json({
      success: true,
      count: rules.length,
      rules
    });

  } catch (error) {
    console.error('[API] Error fetching SLA rules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch SLA rules from database',
      message: error.message
    });
  }
}
