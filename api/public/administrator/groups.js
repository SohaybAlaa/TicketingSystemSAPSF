import { getAllGroupsDB } from '../../_utils/db.js';

// Map a support_groups row to the camelCase shape the Org Structure grid expects.
function formatGroup(row) {
  return {
    id: row.id,
    externalCode: row.external_code,
    name: row.name,
    parentName: row.parent_name || '',
    validFrom: row.valid_from || '',
    validTo: row.valid_to || '',
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') { // Allow only GET method
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const rows = await getAllGroupsDB(); // Get all support groups from the database
    const groups = rows.map(formatGroup);

    res.status(200).json({
      success: true,
      count: groups.length,
      groups
    });

  } catch (error) {
    console.error('[API] Error fetching support groups:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch support groups from database',
      message: error.message
    });
  }
}
