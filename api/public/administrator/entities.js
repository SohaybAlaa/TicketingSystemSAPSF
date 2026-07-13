import { getAllEntitiesDB } from '../../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') { // Allow only GET method
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const rows = await getAllEntitiesDB(); // Get all entities from the database

    const entities = rows.map(row => ({ // Map each entity row to a formatted object
      id: row.id,
      code: row.code,
      name: row.name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.status(200).json({
      success: true,
      count: entities.length,
      entities
    });

  } catch (error) {
    console.error('[API] Error fetching entities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch entities from database',
      message: error.message
    });
  }
}
