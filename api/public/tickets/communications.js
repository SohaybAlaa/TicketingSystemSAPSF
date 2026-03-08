import { getTicketCommunicationsDB, addTicketCommunicationDB } from '../../_utils/db.js';

export default async function handler(req, res) {
  if (req.method === 'GET') { //accept only GET requests (Post request ⬇ )
    const { ticketId } = req.query;

    if (!ticketId) { //check if ticketId is provided
      return res.status(400).json({
        success: false,
        error: 'Missing required query param: ticketId'
      });
    }

    try {
      const rows = await getTicketCommunicationsDB(ticketId); //get ticket communications from the database

      const communications = rows.map(row => ({ //map each row to a communication object
        comment_id: row.id,
        ticket_id: row.ticket_id,
        author_name: row.sender_type === 'hr_staff' ? row.hr_user_name : row.employee_name,
        author_type: row.sender_type === 'hr_staff' ? 'HR' : 'Employee',
        text: row.message_text,
        created_at: row.created_at,
      }));

      return res.status(200).json({ //return the communications as JSON
        success: true,
        count: communications.length,
        communications
      });

    } catch (error) {
      console.error('[API] Error fetching communications:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch communications',
        message: error.message
      });
    }
  }

  if (req.method === 'POST') { //accept only POST requests (Get request ⬆ )
    try {
      const { ticketId, senderType, senderInfo, messageText } = req.body; //get ticketId, senderType, senderInfo, messageText from the request body

      if (!ticketId || !senderType || !messageText) { //check if ticketId, senderType, messageText are provided
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: ticketId, senderType, messageText'
        });
      }

      await addTicketCommunicationDB(ticketId, senderType, senderInfo || {}, messageText); //add ticket communication to the database

      return res.status(200).json({ //return success message
        success: true,
        message: 'Communication added successfully'
      });

    } catch (error) { //catch any errors
      console.error('[API] Error adding communication:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to add communication',
        message: error.message
      });
    }
  }

  return res.status(405).json({ //return method not allowed error
    success: false,
    error: 'Method not allowed'
  });
}
