import { getAllSlaAssignmentsDB } from '../../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') { // Allow only GET method
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Already formatted to the frontend shape (resolved display names)
    const assignments = await getAllSlaAssignmentsDB();

    res.status(200).json({
      success: true,
      count: assignments.length,
      assignments
    });

  } catch (error) {
    console.error('[API] Error fetching SLA assignments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch SLA assignments from database',
      message: error.message
    });
  }
}
