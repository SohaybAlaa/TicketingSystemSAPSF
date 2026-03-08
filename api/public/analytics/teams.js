import db from '../../_utils/db.js';

export default async function handler(req, res) {
  // Reject any non-GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // Fetch unique teams from tickets table
    // Excludes NULLs (unassigned tickets) and sorts alphabetically for consistent dropdown ordering
    const teams = await db.manyOrNone(`
      SELECT DISTINCT assigned_to_team
      FROM tickets
      WHERE assigned_to_team IS NOT NULL
      ORDER BY assigned_to_team ASC
    `);

    // Transform to match expected format
    // teamId and teamName are both set to the raw team string since there is no separate teams table
    const formattedTeams = teams.map((team) => ({
      teamId: team.assigned_to_team,   // Used as the filter value when querying other endpoints
      teamName: team.assigned_to_team  // Used as the display label in the team dropdown
    }));

    // Return the formatted team list to the client
    res.status(200).json({
      success: true,
      data: formattedTeams
    });

  } catch (error) {
    // Log full error server-side and return a sanitized message to the client
    console.error('[API] Error fetching teams:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch teams',
      message: error.message
    });
  }
}