import { deleteTicketingRuleDB, getTicketingRuleByIdDB } from '../../../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { // Allow only POST method
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { id } = req.body; // Get rule id from request body

    if (!id) {
      return res.status(400).json({ success: false, error: 'Missing required field: id' });
    }

    const existing = await getTicketingRuleByIdDB(id); // Ensure the rule exists
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Ticketing rule not found' });
    }

    await deleteTicketingRuleDB(id); // Delete rule from DB

    res.status(200).json({
      success: true,
      message: 'Ticketing rule deleted successfully'
    });

  } catch (error) {
    console.error('[API] Error deleting ticketing rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete ticketing rule',
      message: error.message
    });
  }
}
