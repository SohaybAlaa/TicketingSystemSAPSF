import {
  updateSlaRuleDB,
  updateSlaRuleOperatingHoursDB,
  defaultOperatingHoursForTimeType,
  getSlaRuleByIdDB,
  parseResponseTimeString,
} from '../../../_utils/db.js';

const VALID_SLA_TYPES = ['Initial Review', 'Completion Due'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const VALID_TIME_TYPES = ['Calendar Time', 'Working Time', 'Custom Time'];

export default async function handler(req, res) {
  if (req.method !== 'POST') { // Allow only POST method
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id, slaName, slaType, priority, responseTime, timeType } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Missing required field: id' });
  }
  if (!slaName || !slaType || !priority || !responseTime || !timeType) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: slaName, slaType, priority, responseTime, timeType'
    });
  }
  if (!VALID_SLA_TYPES.includes(slaType)) {
    return res.status(400).json({ success: false, error: `Invalid slaType. Must be one of: ${VALID_SLA_TYPES.join(', ')}` });
  }
  if (!VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ success: false, error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}` });
  }
  if (!VALID_TIME_TYPES.includes(timeType)) {
    return res.status(400).json({ success: false, error: `Invalid timeType. Must be one of: ${VALID_TIME_TYPES.join(', ')}` });
  }

  const parsed = parseResponseTimeString(responseTime);
  if (!parsed) {
    return res.status(400).json({ success: false, error: `Invalid responseTime: "${responseTime}"` });
  }

  try {
    const existing = await getSlaRuleByIdDB(id); // Ensure the rule exists
    if (!existing) {
      return res.status(404).json({ success: false, error: 'SLA rule not found' });
    }

    await updateSlaRuleDB(id, {
      slaName, slaType, priority,
      responseValue: parsed.value,
      responseUnit: parsed.unit,
      timeType,
    });

    // The edit modal changes timeType but collects no operating hours. If the
    // timeType changed, reset the hours to that type's defaults so the row can't
    // end up e.g. 'Working Time' with 24/7 hours. The user can still fine-tune
    // hours afterwards via the operating-hours editor.
    if (existing.timeType !== timeType) {
      await updateSlaRuleOperatingHoursDB(id, timeType, defaultOperatingHoursForTimeType(timeType));
    }

    const rule = await getSlaRuleByIdDB(id);
    res.status(200).json({ success: true, rule });

  } catch (error) {
    console.error('[API] Error updating SLA rule:', error);
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'This SLA group already has a rule for that type and priority',
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to update SLA rule',
      message: error.message
    });
  }
}
