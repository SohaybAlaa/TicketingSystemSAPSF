import { getTicketByIdDB, getTicketCommunicationsDB, getTicketInternalNotesDB, getTicketActivityLogDB, getTicketSlaTimersDB } from '../../_utils/db.js';

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

    // Pull the real SLA timers (SLA_FLOW_DOCUMENTATION Step 5). Initial Review = "Response Due",
    // Completion Due = "Resolution Due". A 'running' timer past its due_at is breached even
    // before the DB row is opportunistically flipped by the next status change.
    const timers = await getTicketSlaTimersDB(ticketId);
    const initialReviewTimer = timers.find(t => t.timer_type === 'Initial Review');
    const completionDueTimer = timers.find(t => t.timer_type === 'Completion Due');
    const isBreached = (timer) => !!timer && (
      timer.state === 'breached' || (timer.state === 'running' && new Date() > new Date(timer.due_at))
    );

    // Tickets with no matching sla_assignments row never get a real timer (see create.js) — they
    // fall back to a flat deadline on tickets.sla_deadline instead. Schema.md documents that
    // column as "SLA due date — ticket is breached if unresolved after this" with no carve-out
    // for the no-policy case, so honor it here too: without this, dashboards (which key off
    // sla_deadline) could show a ticket as breached while this page showed no SLA data for it.
    const PAUSE_OR_STOP_STATUSES = ['Completed', 'Closed', 'Pending Employee', 'Pending Third Party'];
    const hasRealSlaPolicy = !!ticket.sla_policy_id;
    const fallbackDueAt = (!hasRealSlaPolicy && !completionDueTimer) ? ticket.sla_deadline : null;
    const fallbackBreached = !!fallbackDueAt
      && !PAUSE_OR_STOP_STATUSES.includes(ticket.internal_status)
      && new Date() > new Date(fallbackDueAt);

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
        location: ticket.employee_location || 'N/A',
        // Not stored on tickets itself (tickets.employee_id has no DB-enforced FK — employees
        // can be synced from SAP after the ticket already exists) — resolved via a join to
        // employees in getTicketByIdDB, so it's null if that employee record doesn't exist yet.
        mobileNumber: ticket.employee_mobile_number || null,
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
      // Real SLA timers (ticket_sla_timers) — null until that phase's timer has been activated.
      // Falls back to the flat tickets.sla_deadline for tickets with no matching sla_assignments
      // row (no real timer was ever created for them — see fallbackDueAt above).
      sla_response_due_at: initialReviewTimer?.due_at || null,
      sla_resolution_due_at: completionDueTimer?.due_at || fallbackDueAt,
      sla_response_breached: isBreached(initialReviewTimer),
      sla_resolution_breached: isBreached(completionDueTimer) || fallbackBreached,
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
