import {
  createTicketDB, generateTicketIdDB, addTicketActivityLogDB,
  getEntityIdByNameDB, getCategoryIdByNameDB, getSubcategoryIdByNameDB,
  getTicketingRuleByComboDB, activateInitialReviewTimerDB, getGroupByIdDB,
} from '../../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { // Allow only POST method
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const {
    employeeId, employeeName, employeeEmail, employeeDepartment, employeeLocation,
    employeeEntity, employeeClass, category, subcategory, priority, title, reason,
    raisedById, raisedByName, raisedByEmail,
  } = req.body;

  // Validate required fields
  if (!employeeId || !employeeName || !category || !priority || !title) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: employeeId, employeeName, category, priority, title'
    });
  }

  try {
    // Resolve the SLA flow combo (Entity + Employee Class + Category + Subcategory) to the
    // authoritative priority from ticketing_rules, per SLA_FLOW_DOCUMENTATION Step 2.
    // Falls back to the client-supplied priority when no entity/class was provided or no
    // rule matches (e.g. a combo outside TICKET_ROUTING_MATRIX.md).
    let entityId = null, categoryId = null, subcategoryId = null, resolvedPriority = priority, assignedTeam = null;
    if (employeeEntity && employeeClass && subcategory) {
      entityId = await getEntityIdByNameDB(employeeEntity);
      categoryId = await getCategoryIdByNameDB(category);
      subcategoryId = categoryId ? await getSubcategoryIdByNameDB(categoryId, subcategory) : null;
      if (entityId && subcategoryId) {
        const rule = await getTicketingRuleByComboDB(entityId, employeeClass, categoryId, subcategoryId);
        if (rule) {
          resolvedPriority = rule.priority;
          // Step 2 of SLA_FLOW_DOCUMENTATION also produces a Group assignment — resolve
          // the matched support_groups row so the ticket is routed, not just prioritized.
          const group = await getGroupByIdDB(rule.groupId);
          if (group) assignedTeam = group.name;
        }
      }
    }

    // Generate next ticket_id based on category
    const ticketId = await generateTicketIdDB(category);

    // Fallback flat SLA deadline (used only if no sla_assignments match is found below).
    const prefix = ticketId.substring(0, ticketId.indexOf('-'));
    let slaHours = 48; // Default for ST
    if (prefix === 'VT') slaHours = 24;
    else if (prefix === 'EPT') slaHours = 12;

    // Create the ticket
    let newTicket = await createTicketDB({
      ticket_id: ticketId,
      title,
      category,
      subcategory: subcategory || null,
      reason: reason || null,
      employee_id: employeeId,
      employee_name: employeeName,
      employee_email: employeeEmail || null,
      employee_department: employeeDepartment || null,
      employee_location: employeeLocation || null,
      priority: resolvedPriority,
      assigned_to_team: assignedTeam,
      raised_by: 'hr_staff',
      raised_by_id: raisedById || null,
      raised_by_name: raisedByName || null,
      raised_by_email: raisedByEmail || null,
      sla_hours: slaHours,
    });

    // Resolve SLA Assignment + SLA Rule and activate the Initial Review timer
    // (SLA_FLOW_DOCUMENTATION Steps 3-5). Overwrites sla_deadline/sla_policy_id
    // with the real SLA-flow deadline when a match exists.
    if (entityId && categoryId && subcategoryId) {
      const timer = await activateInitialReviewTimerDB({
        ticketId, entityId, employeeClass, categoryId, subcategoryId, priority: resolvedPriority,
      });
      if (timer) {
        newTicket.sla_deadline = timer.due_at;
      }
    }

    // Log initial activity entries (status, priority)
    const changedByInfo = {
      type: 'hr_staff',
      id: raisedById || null,
      name: raisedByName || 'System',
      email: raisedByEmail || null,
      department: null,
    };

    await addTicketActivityLogDB(ticketId, 'status', null, 'New', changedByInfo);
    await addTicketActivityLogDB(ticketId, 'priority', null, resolvedPriority, changedByInfo);

    // Format response to match the list API shape
    const formatted = {
      ticketId: newTicket.ticket_id,
      title: newTicket.title,
      category: newTicket.category,
      subcategory: newTicket.subcategory,
      reason: newTicket.reason,
      employee: newTicket.employee_name || newTicket.employee_id,
      employeeId: newTicket.employee_id,
      employeeEmail: newTicket.employee_email,
      department: newTicket.assigned_to_team || 'N/A',
      priority: newTicket.priority || 'Medium',
      status: newTicket.internal_status || 'New',
      sapStatus: newTicket.sap_status,
      assignedTo: newTicket.assigned_to_user_name || 'Unassigned',
      assignedToId: newTicket.assigned_to_user_id,
      assignedToEmail: newTicket.assigned_to_user_email,
      created: newTicket.created_at ? new Date(newTicket.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) : 'N/A',
      slaDue: newTicket.sla_deadline ? new Date(newTicket.sla_deadline).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }) : 'N/A',
      slaDeadlineAt: newTicket.sla_deadline,
      startDate: newTicket.start_date,
      endDate: newTicket.end_date,
      startTime: newTicket.start_time,
      endTime: newTicket.end_time,
      vacationTypeId: newTicket.vacation_type_id,
      sapExternalCode: newTicket.sap_external_code,
      raisedBy: newTicket.raised_by || 'hr_staff',
      raisedById: newTicket.raised_by_id || null,
      raisedByName: newTicket.raised_by_name || null,
      raisedByEmail: newTicket.raised_by_email || null,
      createdAt: newTicket.created_at,
      updatedAt: newTicket.updated_at,
      resolvedAt: newTicket.resolved_at,
    };

    res.status(201).json({ success: true, ticket: formatted });

  } catch (error) {
    console.error('[API] Error creating ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create ticket',
      message: error.message
    });
  }
}
