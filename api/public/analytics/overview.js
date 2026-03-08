import { 
  getTicketsByStatusDB,          // Fetches ticket counts grouped by status
  getPriorityDistributionDB,     // Fetches ticket counts grouped by priority
  getSlaBreachStatsDB,           // Fetches overall SLA breach totals
  getSlaBreachByPriorityDB,      // Fetches SLA breach counts broken down by priority
  getAvgResolutionTimeDB         // Fetches average ticket resolution time in hours
} from '../../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {  // Allow Only GET Method
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { startDate, endDate, team } = req.query; // Extract optional filter params from query string
    // Fetch all overview metrics in parallel to minimize total response time
    const [statusData, priorityData, slaData, slaByPriorityData, resolutionData] = await Promise.all([
      getTicketsByStatusDB(startDate || null, endDate || null, team || null),         // Ticket counts by status, filtered by date range and team
      getPriorityDistributionDB(startDate || null, endDate || null, team || null),    // Ticket counts by priority, filtered by date range and team
      getSlaBreachStatsDB(team || null),                                              // Overall SLA breach stats (no date filter — reflects current state)
      getSlaBreachByPriorityDB(startDate || null, endDate || null, team || null),     // SLA breaches per priority level, filtered by date range and team
      getAvgResolutionTimeDB(null, 90, team || null)                                  // Avg resolution time over the last 90 days for the given team
    ]);

    // Sum all ticket counts across every status to get the grand total
    const totalTickets = statusData.reduce((sum, item) => sum + item.count, 0);

    // Sum only tickets in terminal states (Completed or Closed)
    const closedTickets = statusData
      .filter(item => ['Completed', 'Closed'].includes(item.status))
      .reduce((sum, item) => sum + item.count, 0);

    // Calculate SLA compliance rate as a percentage; default to 100% if no tickets exist
    const slaComplianceRate = slaData.total > 0 
      ? ((slaData.total - slaData.breached) / slaData.total * 100).toFixed(1)
      : 100;

    // Isolate the breach count specifically for Critical-priority tickets (0 if not found)
    const criticalBreaches = slaByPriorityData.find(item => item.priority === 'Critical')?.breached || 0;

    // Parse avg resolution hours from the first result row; default to 0 if unavailable
    const avgResolutionTime = resolutionData.length > 0 && resolutionData[0].avg_hours
      ? parseFloat(resolutionData[0].avg_hours)
      : 0;

    // Return all computed metrics and raw breakdowns to the client
    res.status(200).json({
      success: true,
      data: {
        totalTickets,           // Total number of tickets across all statuses
        closedTickets,          // Tickets in Completed or Closed state
        avgResolutionTime,      // Average hours to resolve a ticket (last 90 days)
        slaComplianceRate: parseFloat(slaComplianceRate),  // % of tickets meeting SLA
        slaBreached: slaData.breached,      // Raw count of SLA-breached tickets
        slaTotal: slaData.total,            // Raw total tickets tracked for SLA
        criticalBreaches,                   // SLA breaches for Critical-priority tickets
        statusBreakdown: priorityData,      // Ticket counts grouped by priority
        priorityBreakdown: priorityData     // Ticket counts grouped by priority
      }
    });

  } catch (error) {
    // Log full error server-side and return a sanitized message to the client
    console.error('[API] Error fetching analytics overview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics overview',
      message: error.message
    });
  }
}