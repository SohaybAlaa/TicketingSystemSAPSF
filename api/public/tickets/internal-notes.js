import { getTicketInternalNotesDB, addTicketInternalNoteDB } from '../../_utils/db.js';

export default async function handler(req, res) {
  if (req.method === 'GET') { //accept only GET requests (Post request ⬇ )
    const { ticketId } = req.query; //get ticketId from the query parameters

    if (!ticketId) { //check if ticketId is provided
      return res.status(400).json({
        success: false,
        error: 'Missing required query param: ticketId'
      });
    }

    try {
      const rows = await getTicketInternalNotesDB(ticketId); //get internal notes from the database

      const notes = rows.map(row => ({ //map each row to a note object
        note_id: row.id,
        ticket_id: row.ticket_id,
        author_name: row.hr_user_name,
        text: row.note_text,
        created_at: row.created_at,
      }));

      return res.status(200).json({  //return the internal notes as JSON
        success: true,
        count: notes.length,
        notes
      });

    } catch (error) { //catch any errors
      console.error('[API] Error fetching internal notes:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch internal notes',
        message: error.message
      });
    }
  }

  if (req.method === 'POST') { //accept only POST requests (Get request ⬆ )
    try {
      const { ticketId, hrInfo, noteText } = req.body; //get ticketId, hrInfo, noteText from the request body

      if (!ticketId || !hrInfo || !noteText) { //check if ticketId, hrInfo, noteText are provided
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: ticketId, hrInfo, noteText'
        });
      }

      await addTicketInternalNoteDB(ticketId, hrInfo, noteText); //add internal note to the database

      return res.status(200).json({ //return success message
        success: true,
        message: 'Internal note added successfully'
      });

    } catch (error) { //catch any errors
      console.error('[API] Error adding internal note:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to add internal note',
        message: error.message
      });
    }
  }

  return res.status(405).json({ //return method not allowed error
    success: false,
    error: 'Method not allowed'
  });
}
