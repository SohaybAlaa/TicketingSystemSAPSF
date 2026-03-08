import { getTicketsByCategoryDB } from '../../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') { // Allow only GET method
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // Extract optional filters from query string 
    const { startDate, endDate, team, includeReason } = req.query;
    // Query the DB for ticket counts by category, applying filters if provided
    const data = await getTicketsByCategoryDB(
      startDate || null,          // Filter by start of date range 
      endDate || null,            // Filter by end of date range
      includeReason === 'true',   // Coerce string to boolean — include subcategory reason breakdown if true
      team || null                // Filter by team, or null to include all teams
    );

    // Return the category breakdown to the client
    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    // Log full error server-side and return a sanitized message to the client
    console.error('[API] Error fetching tickets by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tickets by category',
      message: error.message
    });
  }
}