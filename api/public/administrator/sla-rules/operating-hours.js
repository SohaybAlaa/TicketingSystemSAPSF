import { updateSlaRuleOperatingHoursDB, getSlaRuleByIdDB } from '../../../_utils/db.js';

const VALID_TIME_TYPES = ['Calendar Time', 'Working Time', 'Custom Time'];
const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export default async function handler(req, res) {
  if (req.method !== 'POST') { // Allow only POST method
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id, timeType, operatingHours } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Missing required field: id' });
  }
  if (!timeType || !VALID_TIME_TYPES.includes(timeType)) {
    return res.status(400).json({ success: false, error: `Invalid timeType. Must be one of: ${VALID_TIME_TYPES.join(', ')}` });
  }
  if (!operatingHours || typeof operatingHours !== 'object') {
    return res.status(400).json({ success: false, error: 'Missing or invalid operatingHours object' });
  }
  // Validate that each enabled day has start + end times
  for (const d of DAYS) {
    const day = operatingHours[d];
    if (day?.enabled && (!day.start || !day.end)) {
      return res.status(400).json({ success: false, error: `Day "${d}" is enabled but missing start/end time` });
    }
  }

  try {
    const existing = await getSlaRuleByIdDB(id); // Ensure the rule exists
    if (!existing) {
      return res.status(404).json({ success: false, error: 'SLA rule not found' });
    }

    await updateSlaRuleOperatingHoursDB(id, timeType, operatingHours);

    const rule = await getSlaRuleByIdDB(id);
    res.status(200).json({ success: true, rule });

  } catch (error) {
    console.error('[API] Error saving SLA operating hours:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save operating hours',
      message: error.message
    });
  }
}
