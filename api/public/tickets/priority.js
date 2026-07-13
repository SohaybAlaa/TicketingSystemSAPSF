import { updateTicketPriorityDB, getTicketByIdDB, addTicketActivityLogDB, resyncTicketSlaTimersForPriorityDB } from '../../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { // allow only POST method
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { ticketId, priority } = req.body; // get ticketId and priority from request body

    if (!ticketId || !priority) { // check if ticketId and priority are provided
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: ticketId, priority'
      });
    }

    // Get old priority before updating
    const ticket = await getTicketByIdDB(ticketId);
    const oldPriority = ticket ? ticket.priority : null; // get old priority

    // Priority already comes with title case from frontend, use as-is
    await updateTicketPriorityDB(ticketId, priority); // update ticket priority

    // Rebase any still-open SLA timers onto the new priority's rule (SLA_FLOW_DOCUMENTATION
    // Step 4 depends on priority — escalating/downgrading after creation must not leave the
    // ticket's timer running on its old, now-stale, response-time budget).
    if (oldPriority && oldPriority !== priority) {
      await resyncTicketSlaTimersForPriorityDB(ticketId, priority);
    }

    // Log the priority change
    const changedBy = req.session?.user
      ? { type: 'hr_staff', id: req.session.user.id, name: req.session.user.username, email: req.session.user.email, department: req.session.user.department }
      : { type: 'hr_staff', id: null, name: 'HR Admin', email: null, department: 'HR Operations' };
    await addTicketActivityLogDB(ticketId, 'priority', oldPriority, priority, changedBy); // add ticket activity log

    res.status(200).json({
      success: true,
      message: 'Ticket priority updated successfully'
    });

  } catch (error) {
    console.error('[API] Error updating ticket priority:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update ticket priority',
      message: error.message
    });
  }
}
