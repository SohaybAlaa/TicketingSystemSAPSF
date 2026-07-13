import {
  createSlaRuleDB,
  createSlaRuleWithNewPolicyDB,
  getSlaRuleByIdDB,
  getPolicyBySlaIdDB,
  parseResponseTimeString,
} from '../../../_utils/db.js';

const VALID_SLA_TYPES = ['Initial Review', 'Completion Due'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const VALID_TIME_TYPES = ['Calendar Time', 'Working Time', 'Custom Time'];

export default async function handler(req, res) {
  if (req.method !== 'POST') { // Allow only POST method
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { slaId, slaName, slaType, priority, responseTime, timeType } = req.body;

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

  const ruleData = {
    slaName, slaType, priority,
    responseValue: parsed.value,
    responseUnit: parsed.unit,
    timeType,
  };

  try {
    let id;
    if (slaId) {
      // Existing group: no orphan risk (only inserts a rule row)
      const policy = await getPolicyBySlaIdDB(slaId);
      if (!policy) {
        return res.status(400).json({ success: false, error: `Unknown SLA group: "${slaId}"` });
      }
      ({ id } = await createSlaRuleDB(policy.id, ruleData));
    } else {
      // New group: create policy + first rule atomically (no orphan empty policy)
      ({ id } = await createSlaRuleWithNewPolicyDB(ruleData));
    }

    const rule = await getSlaRuleByIdDB(id);
    res.status(201).json({ success: true, rule });

  } catch (error) {
    console.error('[API] Error creating SLA rule:', error);
    if (error.code === '23505') { // UNIQUE (policy_id, sla_type, priority)
      return res.status(409).json({
        success: false,
        error: 'This SLA group already has a rule for that type and priority',
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create SLA rule',
      message: error.message
    });
  }
}
