import { updateTicketStatusDB, getTicketByIdDB, addTicketActivityLogDB, advanceTicketSlaOnStatusChangeDB } from '../../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { // Allow only Post Method
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { ticketId, status } = req.body; // Get ticketId and status from request body

    if (!ticketId || !status) { // Check if ticketId and status are provided
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: ticketId, status'
      });
    }

    // Get old status before updating (also carries sla_policy_id/priority for the timer step below)
    const ticket = await getTicketByIdDB(ticketId); // Get ticket by id
    const oldStatus = ticket ? ticket.internal_status : null; // Get old status

    // Status already comes with spaces from frontend, use as-is
    await updateTicketStatusDB(ticketId, status); // Update ticket status

    // Advance SLA timers (pause/resume/stop, activate Completion Due) per SLA_FLOW_DOCUMENTATION
    if (ticket) await advanceTicketSlaOnStatusChangeDB(ticket, status);

    // Log the status change
    const changedBy = req.session?.user
      ? { type: 'hr_staff', id: req.session.user.id, name: req.session.user.username, email: req.session.user.email, department: req.session.user.department }
      : { type: 'hr_staff', id: null, name: 'HR Admin', email: null, department: 'HR Operations' };
    await addTicketActivityLogDB(ticketId, 'status', oldStatus, status, changedBy); // Add ticket activity log

    res.status(200).json({
      success: true,
      message: 'Ticket status updated successfully'
    });

  } catch (error) {
    console.error('[API] Error updating ticket status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update ticket status',
      message: error.message
    });
  }
}
