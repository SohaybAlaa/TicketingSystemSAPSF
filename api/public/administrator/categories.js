import { getAllCategoriesWithSubcategoriesDB } from '../../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') { // Allow only GET method
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const rows = await getAllCategoriesWithSubcategoriesDB(); // Get all categories + subcategories from the database

    const categories = rows.map(row => ({ // Map each category row to a formatted object
      id: row.id,
      name: row.name,
      subcategories: row.subcategories.map(s => ({ id: s.id, name: s.name })),
    }));

    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });

  } catch (error) {
    console.error('[API] Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories from database',
      message: error.message
    });
  }
}
