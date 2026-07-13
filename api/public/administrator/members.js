import { getGroupMembersDB } from '../../_utils/db.js';

// Map a group_members row (joined to employees) to the shape the members grid expects.
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
  if (req.method !== 'GET') { // Allow only GET method
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { groupId } = req.query;

  if (!groupId) {
    return res.status(400).json({ success: false, error: 'Missing required query param: groupId' });
  }

  try {
    const rows = await getGroupMembersDB(groupId); // Get members of the group
    const members = rows.map(formatMember);

    res.status(200).json({
      success: true,
      count: members.length,
      members
    });

  } catch (error) {
    console.error('[API] Error fetching group members:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch group members from database',
      message: error.message
    });
  }
}
