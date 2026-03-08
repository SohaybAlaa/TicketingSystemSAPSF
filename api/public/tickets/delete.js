import { deleteTicketDB } from '../../_utils/db.js';
import { rm } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') { //Allow only POST Method
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { ticketId } = req.body; // Get ticket ID from request body

    if (!ticketId) { // Check if ticket ID is provided
      return res.status(400).json({
        success: false,
        error: 'Missing required field: ticketId'
      });
    }

    // Delete ticket from DB (cascades to communications, internal_notes, attachments)
    await deleteTicketDB(ticketId);

    // Delete attachment files from filesystem
    const uploadDir = path.join(process.cwd(), 'uploads', 'tickets', ticketId.toString());
    if (existsSync(uploadDir)) {
      await rm(uploadDir, { recursive: true, force: true });
      console.log(`[API] Deleted attachment folder: ${uploadDir}`);
    }

    res.status(200).json({
      success: true,
      message: 'Ticket deleted successfully'
    });

  } catch (error) {
    console.error('[API] Error deleting ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete ticket',
      message: error.message
    });
  }
}
