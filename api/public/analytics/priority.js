import { getPriorityDistributionDB } from '../../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') { // Allow ONLY GET Method
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // Extract optional filters from query string 
    const { startDate, endDate, team } = req.query;

    // Query the DB for ticket counts by priority, applying filters if provided
    const data = await getPriorityDistributionDB(
      startDate || null,  // Filter by start of date range
      endDate || null,    // Filter by end of date range
      team || null        // Filter by team
    );

    // Return the priority distribution to the client
    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    // Log full error server-side and return a sanitized message to the client
    console.error('[API] Error fetching priority distribution:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch priority distribution',
      message: error.message
    });
  }
}