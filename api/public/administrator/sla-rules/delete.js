import { deleteSlaRuleDB, getSlaRuleByIdDB, getPolicyBySlaIdDB, deletePolicyIfUnusedDB } from '../../../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { // Allow only POST method
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { id } = req.body; // Get rule id from request body

    if (!id) {
      return res.status(400).json({ success: false, error: 'Missing required field: id' });
    }

    const existing = await getSlaRuleByIdDB(id); // Ensure the rule exists (and capture its group)
    if (!existing) {
      return res.status(404).json({ success: false, error: 'SLA rule not found' });
    }

    await deleteSlaRuleDB(id); // Delete the rule row

    // Clean up the parent policy if it is now empty and unreferenced
    const policy = await getPolicyBySlaIdDB(existing.slaId);
    if (policy) await deletePolicyIfUnusedDB(policy.id);

    res.status(200).json({
      success: true,
      message: 'SLA rule deleted successfully'
    });

  } catch (error) {
    console.error('[API] Error deleting SLA rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete SLA rule',
      message: error.message
    });
  }
}
