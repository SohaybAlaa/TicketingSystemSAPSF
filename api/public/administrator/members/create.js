import { createGroupMemberDB, getGroupMemberByIdDB, getGroupByIdDB, resolveEmployeeRefIdDB } from '../../../_utils/db.js';

function formatMember(row) {
  return {
    id: row.id,
    employeeId: row.employee_code,
    name: row.employee_name,
    userType: row.user_type,
    from: row.valid_from || '',
    to: row.valid_to || '',
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { // Allow only POST method
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { groupId, employeeId, userType, from, to } = req.body;

  // valid_from / valid_to are NOT NULL in the schema
  if (!groupId || !employeeId || !userType || !from || !to) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: groupId, employeeId, userType, from, to'
    });
  }

  if (from > to) {
    return res.status(400).json({ success: false, error: "'to' date must be on or after 'from' date" });
  }

  try {
    const group = await getGroupByIdDB(groupId); // Ensure the group exists
    if (!group) {
      return res.status(404).json({ success: false, error: 'Support group not found' });
    }

    // Strict FK: resolve the typed Employee ID to an existing employee
    const employeeRefId = await resolveEmployeeRefIdDB(employeeId);
    if (!employeeRefId) {
      return res.status(404).json({
        success: false,
        error: `No employee found with ID "${employeeId}". Members must be existing employees.`
      });
    }

    const { id } = await createGroupMemberDB(groupId, employeeRefId, { userType, from, to });
    const row = await getGroupMemberByIdDB(id);

    res.status(201).json({ success: true, member: formatMember(row) });

  } catch (error) {
    console.error('[API] Error adding group member:', error);
    if (error.code === '23505') { // UNIQUE(group_id, employee_id, valid_from)
      return res.status(409).json({
        success: false,
        error: 'This employee is already a member of the group for that start date',
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to add group member',
      message: error.message
    });
  }
}
