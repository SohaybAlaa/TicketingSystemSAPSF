import { assignTicketDB, getTicketByIdDB, addTicketActivityLogDB } from '../../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { ticketId, userId, userName, userEmail } = req.body; // Get ticket ID, user ID, user name, and user email from request body

    if (!ticketId || !userName) { // if ticket ID or user name is missing
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: ticketId, userName'
      });
    }

    // Get old assignment before updating
    const ticket = await getTicketByIdDB(ticketId); // Get ticket by ID from database
    const oldAssignment = ticket ? ticket.assigned_to_user_name : null; // Get old assignment from ticket

    await assignTicketDB(ticketId, userId, userName, userEmail); // Assign ticket to user

    // Log the assignment change
    const changedBy = req.session?.user // Get changed by user from session
      ? { type: 'hr_staff', id: req.session.user.id, name: req.session.user.username, email: req.session.user.email, department: req.session.user.department }
      : { type: 'hr_staff', id: null, name: 'HR Admin', email: null, department: 'HR Operations' };
    await addTicketActivityLogDB(ticketId, 'assignment', oldAssignment, userName, changedBy); // Add ticket activity log

    res.status(200).json({
      success: true,
      message: 'Ticket assigned successfully'
    });

  } catch (error) {
    console.error('[API] Error assigning ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign ticket',
      message: error.message
    });
  }
}
