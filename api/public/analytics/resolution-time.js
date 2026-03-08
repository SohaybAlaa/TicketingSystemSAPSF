import { getAvgResolutionTimeDB } from '../../_utils/db.js';

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
    const { groupBy, daysBack, team } = req.query;
    
    // Query the DB for avg resolution time, applying filters if provided
    const data = await getAvgResolutionTimeDB(
      groupBy || null,                    // Group results by a field (e.g. priority, category), or null for a single overall average
      daysBack ? parseInt(daysBack) : 90, // Lookback window in days; query string is always a string so parseInt is required — defaults to 90 days
      team || null                        // Filter by team, or null to include all teams
    );

    // Return the resolution time stats to the client
    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    // Log full error server-side and return a sanitized message to the client
    console.error('[API] Error fetching resolution time stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch resolution time stats',
      message: error.message
    });
  }
}