import {
  createSlaAssignmentDB,
  getSlaAssignmentByIdDB,
  getPolicyBySlaIdDB,
  getEntityIdByNameDB,
  getCategoryIdByNameDB,
  getSubcategoryIdByNameDB,
} from '../../../_utils/db.js';

const VALID_CLASSES = ['Full-time', 'Part-time', 'Contractor', 'Intern'];

// Resolve the frontend display names to internal FK ids.
// Returns { ids } on success or { error } with a helpful message.
async function resolveAssignmentIds({ slaId, entity, supportCategory, subcategory }) {
  const policy = await getPolicyBySlaIdDB(slaId);
  if (!policy) return { error: `Unknown SLA group: "${slaId}"` };

  const entityId = await getEntityIdByNameDB(entity);
  if (!entityId) return { error: `Unknown entity: "${entity}"` };

  const categoryId = await getCategoryIdByNameDB(supportCategory);
  if (!categoryId) return { error: `Unknown support category: "${supportCategory}"` };

  const subcategoryId = await getSubcategoryIdByNameDB(categoryId, subcategory);
  if (!subcategoryId) return { error: `Subcategory "${subcategory}" does not belong to category "${supportCategory}"` };

  return { ids: { policyId: policy.id, entityId, categoryId, subcategoryId } };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { // Allow only POST method
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { slaId, entity, employeeClass, supportCategory, subcategory } = req.body;

  if (!slaId || !entity || !employeeClass || !supportCategory || !subcategory) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: slaId, entity, employeeClass, supportCategory, subcategory'
    });
  }
  if (!VALID_CLASSES.includes(employeeClass)) {
    return res.status(400).json({ success: false, error: `Invalid employeeClass. Must be one of: ${VALID_CLASSES.join(', ')}` });
  }

  try {
    const { ids, error } = await resolveAssignmentIds({ slaId, entity, supportCategory, subcategory });
    if (error) return res.status(400).json({ success: false, error });

    const { id } = await createSlaAssignmentDB({ ...ids, employeeClass });
    const assignment = await getSlaAssignmentByIdDB(id);

    res.status(201).json({ success: true, assignment });

  } catch (error) {
    console.error('[API] Error creating SLA assignment:', error);
    if (error.code === '23505') { // UNIQUE (entity_id, employee_class, category_id, subcategory_id)
      return res.status(409).json({
        success: false,
        error: 'An SLA assignment for this entity, employee class, category and subcategory already exists',
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create SLA assignment',
      message: error.message
    });
  }
}
