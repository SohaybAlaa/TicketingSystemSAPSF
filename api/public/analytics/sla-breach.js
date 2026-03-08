import { getSlaBreachStatsDB } from '../../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') { //Allow only GET Method
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // Extract optional team filter from query string (e.g. ?team=...)
    const { team } = req.query;

    // Query the DB for SLA breach totals
    const data = await getSlaBreachStatsDB(team || null); // null returns stats across all teams

    // Return the SLA breach stats to the client
    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    // Log full error server-side and return a sanitized message to the client
    console.error('[API] Error fetching SLA breach stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch SLA breach stats',
      message: error.message
    });
  }
}