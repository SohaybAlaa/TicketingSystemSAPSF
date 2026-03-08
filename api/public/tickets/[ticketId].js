import { getTicketByIdDB, getTicketCommunicationsDB, getTicketInternalNotesDB, getTicketActivityLogDB } from '../../_utils/db.js';

export default async function handler(req, res) { 
  if (req.method !== 'GET') { 
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  const { ticketId } = req.params; // Get ticket ID from URL params

  if (!ticketId) { // Check if ticket ID is provided
    return res.status(400).json({
      success: false,
      error: 'Ticket ID is required'
    });
  }

  try {
    const ticket = await getTicketByIdDB(ticketId); // Get ticket by ID from database

    if (!ticket) { // Check if ticket exists
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Determine SLA hours based on ticket type prefix
    let slaHours = 24; // Default
    const ticketPrefix = ticket.ticket_id?.substring(0, ticket.ticket_id.indexOf('-')); // Get ticket type prefix VT / EPT / ST 
    
    if (ticketPrefix === 'EPT') {
      slaHours = 12; // Exit Permission Ticket
    } else if (ticketPrefix === 'VT') {
      slaHours = 24; // Vacation Ticket
    } else if (ticketPrefix === 'ST') {
      slaHours = 48; // Support Ticket
    }

    // Calculate SLA deadlines based on ticket type
    const createdDate = new Date(ticket.created_at);
    const resolutionDueDate = new Date(createdDate.getTime() + (slaHours * 60 * 60 * 1000)); // Calculate resolution due date
    const responseDueDate = new Date(createdDate.getTime() + (slaHours * 0.25 * 60 * 60 * 1000)); // Calculate response due date (25% of resolution time)

    // Format ticket data
    const formattedTicket = {
      ticket_id: ticket.ticket_id, //
      title: ticket.title,
      category: ticket.category,
      category_name: ticket.category,
      reason: ticket.reason,
      employee: {
        name: ticket.employee_name || ticket.employee_id,
        id: ticket.employee_id,
        email: ticket.employee_email,
        department: ticket.employee_department || 'N/A',
        position: ticket.employee_position || 'Employee',
        location: ticket.employee_location || 'N/A'
      },
      priority: ticket.priority || 'Medium',
      status: ticket.internal_status || 'New',
      sap_status: ticket.sap_status,
      assigned_user_name: ticket.assigned_to_user_name || 'Unassigned',
      assigned_to_user_id: ticket.assigned_to_user_id,
      assigned_to_user_email: ticket.assigned_to_user_email,
      created_at: ticket.created_at,
      updated_at: ticket.updated_at,
      resolved_at: ticket.resolved_at,
      // Use calculated SLA deadlines based on ticket type
      sla_response_due_at: responseDueDate.toISOString(),
      sla_resolution_due_at: resolutionDueDate.toISOString(),
      sla_response_breached: new Date() > responseDueDate,
      sla_resolution_breached: new Date() > resolutionDueDate,
      assigned_group_name: ticket.assigned_to_team || 'HR Operations',
      channel: 'Chatbot',
      start_date: ticket.start_date,
      end_date: ticket.end_date,
      start_time: ticket.start_time,
      end_time: ticket.end_time,
      vacation_type_id: ticket.vacation_type_id,
      sap_external_code: ticket.sap_external_code
    };

    // Fetch real activity log from DB
    const activityRows = await getTicketActivityLogDB(ticketId); // Get activity log from database
    const statusHistory = activityRows.map(row => ({ // Map activity log rows to status history
      id: row.id,
      change_type: row.change_type,
      old_value: row.old_value,
      new_value: row.new_value,
      old_status: row.change_type === 'status' ? row.old_value : undefined,
      new_status: row.change_type === 'status' ? row.new_value : undefined,
      changed_by_type: row.changed_by_type,
      changed_by_name: row.changed_by_name,
      changed_by_department: row.changed_by_department,
      changed_at: row.changed_at,
    }));

    // Fetch real communications from DB
    const commRows = await getTicketCommunicationsDB(ticketId); // Get communications from database
    const comments = commRows.map(row => ({ // Map communications to comments
      comment_id: row.id,
      ticket_id: row.ticket_id,
      author_name: row.sender_type === 'hr_staff' ? row.hr_user_name : row.employee_name,
      author_type: row.sender_type === 'hr_staff' ? 'HR' : 'Employee',
      department: row.sender_type === 'hr_staff' ? row.hr_department : row.employee_department,
      text: row.message_text,
      created_at: row.created_at,
    }));

    // Fetch real internal notes from DB
    const noteRows = await getTicketInternalNotesDB(ticketId); // Get internal notes from database
    const internalNotes = noteRows.map(row => ({ // Map internal notes to internal notes
      note_id: row.id,
      ticket_id: row.ticket_id,
      author_name: row.hr_user_name,
      department: row.hr_department,
      text: row.note_text,
      created_at: row.created_at,
    }));

    res.status(200).json({ // Return ticket data
      success: true,
      ticket: formattedTicket,
      statusHistory,
      comments,
      internalNotes
    });

  } catch (error) {
    console.error('[API] Error fetching ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ticket from database',
      message: error.message
    });
  }
}
