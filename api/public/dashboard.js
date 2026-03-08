import { getDashboardStatsDB, getRecentActivityDB, getDashboardTrendsDB } from '../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') { //Allow only GET Method
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // Extract userId from query parameters
    // If not provided, default to null (can be used for admin/global dashboard)
    const userId = req.query.userId || null;
    const userTeam = req.query.team || null;

    // Fetch stats, trends and recent activity in parallel
    // Fetch dashboard data in parallel for better performance
    // - stats: summary card counts
    // - trends: time-based trend data
    // - recentActivity: latest ticket updates (limit 10)
    const [stats, trends, recentActivity] = await Promise.all([ 
      getDashboardStatsDB(userId, userTeam),
      getDashboardTrendsDB(userId, userTeam),
      getRecentActivityDB(userId, 10)
    ]);

    // Transform trend rows into separate arrays per metric
    const trendArrays = {
      assignedToMe:   trends.map(r => r.assigned_to_me),
      myTeamTickets:  trends.map(r => r.my_team_tickets),
      newTickets:     trends.map(r => r.new_tickets),
      underProcess:   trends.map(r => r.under_process),
      slaBreached:    trends.map(r => r.sla_breached),
      closed30Days:   trends.map(r => r.closed_30_days),
    };

    // Format recent activity entries
    const formattedActivity = recentActivity.map(row => ({
      id: row.id,
      ticketId: row.ticket_id,
      ticketTitle: row.ticket_title,
      ticketCategory: row.ticket_category,
      changeType: row.change_type,
      oldValue: row.old_value,
      newValue: row.new_value,
      changedByType: row.changed_by_type,
      changedByName: row.changed_by_name,
      changedAt: row.changed_at,
    }));

    res.status(200).json({ // Return success response with dashboard data
      success: true,
      stats: {
        assignedToMe: stats.assigned_to_me,
        myTeamTickets: stats.my_team_tickets,
        newTickets: stats.new_tickets,
        underProcess: stats.under_process,
        slaBreached: stats.sla_breached,
        closed30Days: stats.closed_30_days,
      },
      trends: trendArrays,
      recentActivity: formattedActivity
    });

  } catch (error) {
    console.error('[API] Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
      message: error.message
    });
  }
}
