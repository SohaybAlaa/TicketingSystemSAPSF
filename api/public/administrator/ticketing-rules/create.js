import {
  createTicketingRuleDB,
  getTicketingRuleByIdDB,
  getEntityIdByNameDB,
  getCategoryIdByNameDB,
  getSubcategoryIdByNameDB,
  getGroupIdByNameDB,
} from '../../../_utils/db.js';

const VALID_CLASSES = ['Full-time', 'Part-time', 'Contractor', 'Intern'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

function formatRule(row) {
  return {
    id: row.id,
    entity: row.entity,
    employeeClass: row.employee_class,
    supportCategory: row.support_category,
    subcategory: row.subcategory,
    group: row.group_name,
    priority: row.priority,
  };
}

// Resolve the frontend display names to internal FK ids.
// Returns { ids } on success or { error } with a helpful message.
async function resolveRuleIds({ entity, supportCategory, subcategory, group }) {
  const entityId = await getEntityIdByNameDB(entity);
  if (!entityId) return { error: `Unknown entity: "${entity}"` };

  const categoryId = await getCategoryIdByNameDB(supportCategory);
  if (!categoryId) return { error: `Unknown support category: "${supportCategory}"` };

  const subcategoryId = await getSubcategoryIdByNameDB(categoryId, subcategory);
  if (!subcategoryId) return { error: `Subcategory "${subcategory}" does not belong to category "${supportCategory}"` };

  const groupId = await getGroupIdByNameDB(group);
  if (!groupId) return { error: `Unknown support group: "${group}"` };

  return { ids: { entityId, categoryId, subcategoryId, groupId } };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { // Allow only POST method
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { entity, employeeClass, supportCategory, subcategory, group, priority } = req.body;

  // All columns are NOT NULL in the schema (group + employee_class included)
  if (!entity || !employeeClass || !supportCategory || !subcategory || !group || !priority) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: entity, employeeClass, supportCategory, subcategory, group, priority'
    });
  }

  if (!VALID_CLASSES.includes(employeeClass)) {
    return res.status(400).json({ success: false, error: `Invalid employeeClass. Must be one of: ${VALID_CLASSES.join(', ')}` });
  }
  if (!VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ success: false, error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}` });
  }

  try {
    const { ids, error } = await resolveRuleIds({ entity, supportCategory, subcategory, group });
    if (error) return res.status(400).json({ success: false, error });

    const { id } = await createTicketingRuleDB({ ...ids, employeeClass, priority });
    const row = await getTicketingRuleByIdDB(id);

    res.status(201).json({ success: true, rule: formatRule(row) });

  } catch (error) {
    console.error('[API] Error creating ticketing rule:', error);
    if (error.code === '23505') { // UNIQUE (entity_id, employee_class, category_id, subcategory_id)
      return res.status(409).json({
        success: false,
        error: 'A ticketing rule for this entity, employee class, category and subcategory already exists',
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create ticketing rule',
      message: error.message
    });
  }
}
