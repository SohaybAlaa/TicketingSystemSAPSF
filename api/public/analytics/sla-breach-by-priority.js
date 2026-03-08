import { getSlaBreachByPriorityDB } from '../../_utils/db.js';

export default async function handler(req, res) {
  // Reject any non-GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // Extract optional filters from query string
    const { startDate, endDate, team } = req.query;

    // Query the DB for SLA breaches per priority level, applying filters if provided
    const data = await getSlaBreachByPriorityDB(
      startDate || null,  // Filter by start of date range
      endDate || null,    // Filter by end of date range
      team || null        // Filter by team
    );

    // Return the SLA breach breakdown by priority to the client
    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    // Log full error server-side and return a sanitized message to the client
    console.error('[API] Error fetching SLA breach by priority:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch SLA breach by priority',
      message: error.message
    });
  }
}