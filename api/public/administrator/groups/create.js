import { createGroupDB, getGroupByIdDB } from '../../../_utils/db.js';

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
  if (req.method !== 'POST') { // Allow only POST method
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { externalCode, name, parentName, validFrom, validTo } = req.body;

  // Validate required fields (external_code, name, valid_from, valid_to are NOT NULL)
  if (!externalCode || !name || !validFrom || !validTo) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: externalCode, name, validFrom, validTo'
    });
  }

  if (validFrom > validTo) {
    return res.status(400).json({ success: false, error: 'validTo must be on or after validFrom' });
  }

  try {
    const { id } = await createGroupDB({ externalCode, name, parentName, validFrom, validTo });
    const row = await getGroupByIdDB(id);

    res.status(201).json({ success: true, group: formatGroup(row) });

  } catch (error) {
    console.error('[API] Error creating support group:', error);
    if (error.code === '23505') { // unique_violation on external_code
      return res.status(409).json({
        success: false,
        error: 'A support group with this external code already exists',
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create support group',
      message: error.message
    });
  }
}
