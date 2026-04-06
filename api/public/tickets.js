import { getAllTicketsDB } from '../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const tickets = await getAllTicketsDB(); // Get all tickets from the database

    const formattedTickets = tickets.map(row => ({ // Map each ticket row to a formatted object
      ticketId: row.ticket_id,
      title: row.title,
      category: row.category,
      subcategory: row.subcategory,
      reason: row.reason,
      employee: row.employee_name || row.employee_id,
      employeeId: row.employee_id,
      employeeEmail: row.employee_email,
      department: row.assigned_to_team || 'N/A',
      priority: row.priority || 'Medium',
      status: row.internal_status || 'New',
      sapStatus: row.sap_status,
      assignedTo: row.assigned_to_user_name || 'Unassigned',
      assignedToId: row.assigned_to_user_id,
      assignedToEmail: row.assigned_to_user_email,
      created: row.created_at ? new Date(row.created_at).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }) : 'N/A',
      slaDue: row.sla_deadline ? new Date(row.sla_deadline).toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }) : 'N/A',
      startDate: row.start_date,
      endDate: row.end_date,
      startTime: row.start_time,
      endTime: row.end_time,
      vacationTypeId: row.vacation_type_id,
      sapExternalCode: row.sap_external_code,
      raisedBy: row.raised_by || 'employee',
      raisedById: row.raised_by_id || null,
      raisedByName: row.raised_by_name || null,
      raisedByEmail: row.raised_by_email || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      resolvedAt: row.resolved_at
    }));

    res.status(200).json({ // Return the formatted tickets as JSON
      success: true,
      count: formattedTickets.length,
      tickets: formattedTickets
    });

  } catch (error) {
    console.error('[API] Error fetching tickets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tickets from database',
      message: error.message
    });
  }
}
