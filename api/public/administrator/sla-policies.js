import { getAllSlaPoliciesDB } from '../../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') { // Allow only GET method
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const rows = await getAllSlaPoliciesDB(); // [{ id, sla_id }]
    const policies = rows.map(r => ({ id: r.id, slaId: r.sla_id }));

    res.status(200).json({
      success: true,
      count: policies.length,
      policies
    });

  } catch (error) {
    console.error('[API] Error fetching SLA policies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch SLA policies from database',
      message: error.message
    });
  }
}
