import pgPromise from "pg-promise"; // PostgreSQL promise-based client factory
import dotenv from "dotenv"; // Loads environment variables from .env file
import { Client } from "ssh2"; // SSH2 client for establishing SSH tunnel connections
import net from "net"; // Node.js built-in TCP networking (used to create the local tunnel server)
import path from "path"; // Node.js built-in path utilities for resolving file/directory paths
import { fileURLToPath } from "url"; // Converts ESM import.meta.url to a file path (__filename equivalent)

const __filename = fileURLToPath(import.meta.url); // Get the current file path
const __dirname = path.dirname(__filename); // Get the directory of the current file

// Load .env from project root 
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

console.log('[DB] .env loaded from:', envPath);
console.log('[DB] Environment variables:', {
  postgres_host: process.env.postgres_host,
  postgres_port: process.env.postgres_port,
  postgres_db: process.env.postgres_db,
  postgres_username: process.env.postgres_username,
  postgres_password: process.env.postgres_password ? '***' : undefined,
  SSH_HOST: process.env.SSH_HOST,
  SSH_USERNAME: process.env.SSH_USERNAME
});

export const pgp = pgPromise({}); // Initialize pg-promise instance (shared across the app)
let db; // Active pg-promise database connection (set after SSH tunnel or direct connect)
let sshClient; // SSH2 client instance (only used when SSH_HOST is configured)
let server; // Local TCP server that proxies connections through the SSH tunnel

// Initialize SSH tunnel and database connection
async function initializeConnection() {
  try {
    if (process.env.SSH_HOST) { // If SSH_HOST is configured
      console.log('[DB] Setting up SSH tunnel...');
      
      await new Promise((resolve, reject) => {
        sshClient = new Client();
        
        sshClient.on('ready', () => {
          console.log('[DB] SSH connection established');
          
          server = net.createServer((sock) => {
            sshClient.forwardOut(
              sock.remoteAddress,
              sock.remotePort,
              '127.0.0.1',
              parseInt(process.env.postgres_port) || 5432,
              (err, stream) => {
                if (err) {
                  console.error('[DB] SSH forward error:', err);
                  sock.end();
                  return;
                }
                sock.pipe(stream).pipe(sock);
              }
            );
          });
          
          server.listen(5433, '127.0.0.1', () => {
            console.log('[DB] SSH tunnel listening on 127.0.0.1:5433');
            resolve();
          });
        });
        
        sshClient.on('error', (err) => {
          console.error('[DB] SSH connection error:', err);
          reject(err);
        });
        
        sshClient.connect({
          host: process.env.SSH_HOST,
          port: parseInt(process.env.SSH_PORT) || 22,
          username: process.env.SSH_USERNAME,
          password: process.env.SSH_PASSWORD,
        });
      });

      db = pgp({
        host: '127.0.0.1',
        port: 5433,
        database: process.env.postgres_db,
        user: process.env.postgres_username,
        password: process.env.postgres_password,
      });
    } else {
      db = pgp({
        host: process.env.postgres_host,
        port: process.env.postgres_port,
        database: process.env.postgres_db,
        user: process.env.postgres_username,
        password: process.env.postgres_password,
      });
    }
    
    console.log('[DB] Database connection initialized');
  } catch (error) {
    console.error('[DB] Failed to initialize connection:', error);
    throw error;
  }
}

await initializeConnection();

export default db;

/**
 * Centralized query error handler — wraps any db call with consistent logging and re-throw.
 * @param {string} label - Human-readable label for logging (e.g. 'getAllTickets')
 * @param {Function} fn - Async function that performs the db operation
 */
async function dbQuery(label, fn) {
  try {
    return await fn();
  } catch (error) {
    console.error(`[DB] Error in ${label}:`, error.message);
    throw error;
  }
}

// ===========================================
// TICKET HELPERS
// ===========================================

/**
 * Get all tickets from the database
 */
export async function getAllTicketsDB() {
  return dbQuery('getAllTickets', () => db.manyOrNone(`
      SELECT 
        id,
        ticket_id,
        title,
        category,
        subcategory,
        reason,
        employee_id,
        employee_name,
        employee_email,
        assigned_to_user_id,
        assigned_to_user_name,
        assigned_to_user_email,
        assigned_to_team,
        vacation_type_id,
        priority,
        internal_status,
        sap_status,
        start_date,
        end_date,
        start_time,
        end_time,
        sap_external_code,
        raised_by,
        raised_by_id,
        raised_by_name,
        raised_by_email,
        created_at,
        updated_at,
        resolved_at,
        sla_deadline
      FROM public.tickets
      ORDER BY created_at DESC
    `));
}

/**
 * Get ticket by ID with full details
 */
export async function getTicketByIdDB(ticketId) {
  return dbQuery('getTicketById', () => db.oneOrNone(`
    SELECT * FROM tickets WHERE ticket_id = $(id)
  `, { id: ticketId }));
}

/**
 * Generate the next ticket_id based on category prefix
 * Leave & Attendance → VT-XX, HR Policies → ST-XX, else → ST-XX
 */
export async function generateTicketIdDB(category) {
  return dbQuery('generateTicketId', async () => {
    let prefix = 'ST';
    if (category === 'Leave & Attendance') prefix = 'VT';
    else if (category === 'HR Policies') prefix = 'ST';

    const result = await db.oneOrNone(`
      SELECT ticket_id FROM tickets
      WHERE ticket_id LIKE $(prefix) || '-%'
      ORDER BY id DESC LIMIT 1
    `, { prefix });

    let nextNum = 1;
    if (result) {
      const parts = result.ticket_id.split('-');
      nextNum = parseInt(parts[1], 10) + 1;
    }
    return `${prefix}-${String(nextNum).padStart(2, '0')}`;
  });
}

/**
 * Create a new ticket (raised by HR staff on behalf of an employee)
 */
export async function createTicketDB(ticket) {
  return dbQuery('createTicket', async () => {
    const row = await db.one(`
      INSERT INTO tickets(
        ticket_id, title, category, subcategory, reason,
        employee_id, employee_name, employee_email,
        priority, internal_status,
        raised_by, raised_by_id, raised_by_name, raised_by_email,
        sla_deadline
      ) VALUES(
        $(ticket_id), $(title), $(category), $(subcategory), $(reason),
        $(employee_id), $(employee_name), $(employee_email),
        $(priority), 'New',
        $(raised_by), $(raised_by_id), $(raised_by_name), $(raised_by_email),
        NOW() + $(sla_hours)::int * INTERVAL '1 hour'
      )
      RETURNING *
    `, ticket);
    return row;
  });
}

/**
 * Update ticket status
 */
export async function updateTicketStatusDB(ticketId, status) {
  const isResolved = ['Completed', 'Closed'].includes(status); //check if ticket is completed or closed to set resolved_at to now
  return dbQuery('updateTicketStatus', () => db.none(`
    UPDATE tickets 
    SET internal_status = $(status),
        updated_at = NOW(),
        resolved_at = ${isResolved ? 'NOW()' : 'NULL'}
    WHERE ticket_id = $(id)
  `, { id: ticketId, status }));
}

/**
 * Update ticket priority
 */
export async function updateTicketPriorityDB(ticketId, priority) {
  return dbQuery('updateTicketPriority', () => db.none(`
    UPDATE tickets 
    SET priority = $(priority), updated_at = NOW()
    WHERE ticket_id = $(id)
  `, { id: ticketId, priority }));
}

/**
 * Assign ticket to user
 */
export async function assignTicketDB(ticketId, userId, userName, userEmail) {
  return dbQuery('assignTicket', () => db.none(`
    UPDATE tickets 
    SET assigned_to_user_id = $(userId),
        assigned_to_user_name = $(userName),
        assigned_to_user_email = $(userEmail),
        updated_at = NOW()
    WHERE ticket_id = $(id)
  `, { id: ticketId, userId, userName, userEmail }));
}

/**
 * Delete ticket
 */
export async function deleteTicketDB(ticketId) {
  return dbQuery('deleteTicket', () => db.none(`DELETE FROM tickets WHERE ticket_id = $(id)`, { id: ticketId }));
}

// =========================================================
// TICKET ACTIVITY LOG HELPERS at /ticketID page Details Tab
// =========================================================

/**
 * Get all activity log entries for a ticket
 */
export async function getTicketActivityLogDB(ticketId) {
  return dbQuery('getTicketActivityLog', () => db.manyOrNone(`
    SELECT id, ticket_id, change_type, old_value, new_value,
      changed_by_type, changed_by_id, changed_by_name, changed_by_email, changed_by_department,
      changed_at
    FROM ticket_activity_log
    WHERE ticket_id = $(id)
    ORDER BY changed_at ASC
  `, { id: ticketId }));
}

/**
 * Add an activity log entry for a ticket
 */
export async function addTicketActivityLogDB(ticketId, changeType, oldValue, newValue, changedByInfo) {
  return dbQuery('addTicketActivityLog', () => db.none(`
    INSERT INTO ticket_activity_log(
      ticket_id, change_type, old_value, new_value,
      changed_by_type, changed_by_id, changed_by_name, changed_by_email, changed_by_department
    ) VALUES(
      $(ticket_id), $(change_type), $(old_value), $(new_value),
      $(changed_by_type), $(changed_by_id), $(changed_by_name), $(changed_by_email), $(changed_by_department)
    )
  `, {
    ticket_id: ticketId,
    change_type: changeType,
    old_value: oldValue || null,
    new_value: newValue,
    changed_by_type: changedByInfo.type || 'hr_staff',
    changed_by_id: changedByInfo.id || null,
    changed_by_name: changedByInfo.name || 'System',
    changed_by_email: changedByInfo.email || null,
    changed_by_department: changedByInfo.department || null,
  }));
}

// ===========================================
// TICKET COMMUNICATION HELPERS
// ===========================================

/**
 * Get all communications for a ticket
 */
export async function getTicketCommunicationsDB(ticketId) {
  return dbQuery('getTicketCommunications', () => db.manyOrNone(`
    SELECT id, ticket_id, message_text, sender_type,
      employee_id, employee_name, employee_email, employee_department,
      hr_user_id, hr_user_name, hr_user_email, hr_department,
      created_at
    FROM ticket_communications
    WHERE ticket_id = $(id)
    ORDER BY created_at ASC
  `, { id: ticketId }));
}

/**
 * Add a communication message to a ticket (HR staff)
 */
export async function addTicketCommunicationDB(ticketId, senderType, senderInfo, messageText) {
  return dbQuery('addTicketCommunication', () => db.none(`
    INSERT INTO ticket_communications(
      ticket_id, message_text, sender_type,
      employee_id, employee_name, employee_email, employee_department,
      hr_user_id, hr_user_name, hr_user_email, hr_department
    ) VALUES(
      $(ticket_id), $(message_text), $(sender_type),
      $(employee_id), $(employee_name), $(employee_email), $(employee_department),
      $(hr_user_id), $(hr_user_name), $(hr_user_email), $(hr_department)
    )
  `, {
    ticket_id: ticketId,
    message_text: messageText,
    sender_type: senderType,
    employee_id: senderInfo.employee_id || null,
    employee_name: senderInfo.employee_name || null,
    employee_email: senderInfo.employee_email || null,
    employee_department: senderInfo.employee_department || null,
    hr_user_id: senderInfo.hr_user_id || null,
    hr_user_name: senderInfo.hr_user_name || null,
    hr_user_email: senderInfo.hr_user_email || null,
    hr_department: senderInfo.hr_department || null,
  }));
}

// ===========================================
// TICKET ATTACHMENT HELPERS
// ===========================================

/**
 * Get all attachments for a ticket
 */
export async function getTicketAttachmentsDB(ticketId) {
  return dbQuery('getTicketAttachments', () => db.manyOrNone(`
    SELECT id, ticket_id, original_filename, stored_filename,
      file_size_bytes, file_type, file_path,
      uploaded_by_type, uploaded_by_name, uploaded_by_id,
      uploaded_at
    FROM ticket_attachments
    WHERE ticket_id = $(id)
    ORDER BY uploaded_at DESC
  `, { id: ticketId }));
}

/**
 * Save an attachment record to the database
 */
export async function saveTicketAttachmentDB(ticketId, fileInfo, uploaderInfo) {
  return dbQuery('saveTicketAttachment', () => db.none(`
    INSERT INTO ticket_attachments(
      ticket_id, original_filename, stored_filename,
      file_size_bytes, file_type, file_path,
      uploaded_by_type, uploaded_by_name, uploaded_by_id
    ) VALUES(
      $(ticket_id), $(original_filename), $(stored_filename),
      $(file_size_bytes), $(file_type), $(file_path),
      $(uploaded_by_type), $(uploaded_by_name), $(uploaded_by_id)
    )
  `, {
    ticket_id: ticketId,
    original_filename: fileInfo.original_filename,
    stored_filename: fileInfo.stored_filename,
    file_size_bytes: fileInfo.file_size_bytes,
    file_type: fileInfo.file_type,
    file_path: fileInfo.file_path,
    uploaded_by_type: uploaderInfo.uploaded_by_type,
    uploaded_by_name: uploaderInfo.uploaded_by_name,
    uploaded_by_id: uploaderInfo.uploaded_by_id || null,
  }));
}

// ===========================================
// TICKET INTERNAL NOTES HELPERS
// ===========================================

/**
 * Get all internal notes for a ticket
 */
export async function getTicketInternalNotesDB(ticketId) {
  return dbQuery('getTicketInternalNotes', () => db.manyOrNone(`
    SELECT id, ticket_id, note_text,
      hr_user_id, hr_user_name, hr_user_email, hr_department,
      created_at
    FROM ticket_internal_notes
    WHERE ticket_id = $(id)
    ORDER BY created_at ASC
  `, { id: ticketId }));
}

/**
 * Add an internal note to a ticket
 */
export async function addTicketInternalNoteDB(ticketId, hrInfo, noteText) {
  return dbQuery('addTicketInternalNote', () => db.none(`
    INSERT INTO ticket_internal_notes(
      ticket_id, note_text,
      hr_user_id, hr_user_name, hr_user_email, hr_department
    ) VALUES(
      $(ticket_id), $(note_text),
      $(hr_user_id), $(hr_user_name), $(hr_user_email), $(hr_department)
    )
  `, {
    ticket_id: ticketId,
    note_text: noteText,
    hr_user_id: hrInfo.hr_user_id,
    hr_user_name: hrInfo.hr_user_name,
    hr_user_email: hrInfo.hr_user_email,
    hr_department: hrInfo.hr_department || null,
  }));
}

// ===========================================
// Home page /admin HELPERS
// ===========================================

/**
 * Get daily ticket counts per stat for the last 7 days 
 * Metric Cards Sparklines per 7days in /admin page
 * @param {number|null} userId
 */
export async function getDashboardTrendsDB(userId, userTeam = null) {
  return dbQuery('getDashboardTrends', () => db.manyOrNone(`
    SELECT
      d.day,
      (SELECT COUNT(DISTINCT al.ticket_id) FROM ticket_activity_log al
        JOIN tickets t ON t.ticket_id = al.ticket_id
        WHERE t.assigned_to_user_id = $(userId)
          AND t.internal_status NOT IN ('Completed','Closed')
          AND al.changed_at::date = d.day)::int AS assigned_to_me,
      (SELECT COUNT(DISTINCT al.ticket_id) FROM ticket_activity_log al
        JOIN tickets t ON t.ticket_id = al.ticket_id
        WHERE t.assigned_to_team = $(userTeam)
          AND t.internal_status NOT IN ('Completed','Closed')
          AND al.changed_at::date = d.day)::int AS my_team_tickets,
      (SELECT COUNT(DISTINCT al.ticket_id) FROM ticket_activity_log al
        JOIN tickets t ON t.ticket_id = al.ticket_id
        WHERE al.change_type = 'status' AND al.new_value = 'New'
          AND t.assigned_to_user_id = $(userId)
          AND al.changed_at::date = d.day)::int AS new_tickets,
      (SELECT COUNT(DISTINCT al.ticket_id) FROM ticket_activity_log al
        JOIN tickets t ON t.ticket_id = al.ticket_id
        WHERE al.change_type = 'status' AND al.new_value = 'Under Process'
          AND t.assigned_to_user_id = $(userId)
          AND al.changed_at::date = d.day)::int AS under_process,
      (SELECT COUNT(*) FROM tickets
        WHERE sla_deadline::date < d.day
          AND assigned_to_user_id = $(userId)
          AND internal_status NOT IN ('Completed','Closed'))::int AS sla_breached,
      (SELECT COUNT(DISTINCT al.ticket_id) FROM ticket_activity_log al
        JOIN tickets t ON t.ticket_id = al.ticket_id
        WHERE al.change_type = 'status' AND al.new_value IN ('Completed','Closed')
          AND t.assigned_to_user_id = $(userId)
          AND al.changed_at::date = d.day)::int AS closed_30_days
    FROM (
      SELECT generate_series(
        NOW()::date - 6 * INTERVAL '1 day',
        NOW()::date,
        INTERVAL '1 day'
      )::date AS day
    ) d
    ORDER BY d.day ASC
  `, { userId: userId || null, userTeam: userTeam || null }));
}

/**
 * Get dashboard statistics computed from the tickets table
 * count for metric cards as Closed(30days) , New Tickets ,Under Process , SLA Breached  ....
 * @param {string|null} userId - The logged-in user's assigned_to_user_id (for "Assigned to Me")
 * @param {string|null} userTeam - The logged-in user's team name (for "My Team Tickets")
 */
export async function getDashboardStatsDB(userId, userTeam = null) {
  return dbQuery('getDashboardStats', () => db.one(`
    SELECT
      COUNT(*) FILTER (WHERE $(userId) IS NOT NULL AND assigned_to_user_id = $(userId) AND internal_status NOT IN ('Completed', 'Closed'))::int AS assigned_to_me,
      COUNT(*) FILTER (
        WHERE $(userTeam) IS NOT NULL
          AND assigned_to_team = $(userTeam)
          AND internal_status NOT IN ('Completed', 'Closed')
      )::int AS my_team_tickets,
      COUNT(*) FILTER (WHERE internal_status = 'New' AND assigned_to_user_id = $(userId))::int AS new_tickets,
      COUNT(*) FILTER (WHERE internal_status = 'Under Process' AND assigned_to_user_id = $(userId))::int AS under_process,
      COUNT(*) FILTER (
        WHERE sla_deadline < NOW()
          AND assigned_to_user_id = $(userId)
          AND internal_status NOT IN ('Completed', 'Closed')
      )::int AS sla_breached,
      COUNT(*) FILTER (
        WHERE internal_status IN ('Completed', 'Closed')
          AND assigned_to_user_id = $(userId)
          AND updated_at >= NOW() - INTERVAL '30 days'
      )::int AS closed_30_days
    FROM tickets
  `, { userId: userId || null, userTeam: userTeam || null }));
}

/**
 * Get recent activity log entries for the user's tickets and their team's tickets (last 48h)
 * RECENT ACTIVITY IN /admin page from ticket_activity_log table
 * @param {number|null} userId - The logged-in user's assigned_to_user_id
 * @param {number} limit - Max entries to return
 */
export async function getRecentActivityDB(userId, limit = 10) {
  return dbQuery('getRecentActivity', () => db.manyOrNone(`
    SELECT al.id, al.ticket_id, al.change_type, al.old_value, al.new_value,
      al.changed_by_type, al.changed_by_id, al.changed_by_name, al.changed_by_email, al.changed_by_department,
      al.changed_at,
      t.title AS ticket_title, t.category AS ticket_category
    FROM ticket_activity_log al
    JOIN tickets t ON t.ticket_id = al.ticket_id
    WHERE al.changed_at >= NOW() - INTERVAL '48 hours'
      AND (
        ($(userId) IS NOT NULL AND t.assigned_to_user_id = $(userId))
        OR t.assigned_to_team IN (
          SELECT DISTINCT assigned_to_team FROM tickets WHERE $(userId) IS NOT NULL AND assigned_to_user_id = $(userId)
        )
      )
    ORDER BY al.changed_at DESC
    LIMIT $(limit)
  `, { userId: userId || null, limit }));
}

// ===========================================
// ANALYTICS HELPERS
// ===========================================

/**
 * Get tickets count by internal_status within optional date range and team filter
 */
export async function getTicketsByStatusDB(startDate = null, endDate = null, team = null) {
  return dbQuery('getTicketsByStatus', () => db.manyOrNone(
    `SELECT internal_status AS status, COUNT(*)::int AS count
       FROM tickets
      WHERE ($(startDate)::timestamptz IS NULL OR created_at >= $(startDate))
        AND ($(endDate)::timestamptz IS NULL OR created_at <  $(endDate))
        AND ($(team)::text IS NULL OR assigned_to_team = $(team))
      GROUP BY internal_status`,
    { startDate, endDate, team }
  ));
}

/**
 * Get distribution of tickets by category (optionally include reason)
 */
export async function getTicketsByCategoryDB(startDate = null, endDate = null, includeReason = false, team = null) {
  const groupCols = includeReason ? "category, reason" : "category";
  return dbQuery('getTicketsByCategory', () => db.manyOrNone(
    `SELECT ${groupCols}, COUNT(*)::int AS count
       FROM tickets
      WHERE ($(startDate)::timestamptz IS NULL OR created_at >= $(startDate))
        AND ($(endDate)::timestamptz IS NULL OR created_at <  $(endDate))
        AND ($(team)::text IS NULL OR assigned_to_team = $(team))
      GROUP BY ${groupCols}
      ORDER BY count DESC`,
    { startDate, endDate, team }
  ));
}

/**
 * Get priority distribution (Critical / High / Medium / Low)
 */
export async function getPriorityDistributionDB(startDate = null, endDate = null, team = null) {
  return dbQuery('getPriorityDistribution', () => db.manyOrNone(
    `SELECT priority, COUNT(*)::int AS count
       FROM tickets
      WHERE ($(startDate)::timestamptz IS NULL OR created_at >= $(startDate))
        AND ($(endDate)::timestamptz IS NULL OR created_at <  $(endDate))
        AND ($(team)::text IS NULL OR assigned_to_team = $(team))
      GROUP BY priority`,
    { startDate, endDate, team }
  ));
}

/**
 * Get SLA breach statistics (breached vs total)
 */
export async function getSlaBreachStatsDB(team = null) {
  return dbQuery('getSlaBreachStats', () => db.one(
    `SELECT
        COUNT(*) FILTER (WHERE sla_deadline < NOW() AND internal_status NOT IN ('Completed','Closed') AND ($(team)::text IS NULL OR assigned_to_team = $(team)))::int AS breached,
        COUNT(*) FILTER (WHERE ($(team)::text IS NULL OR assigned_to_team = $(team)))::int AS total
       FROM tickets`,
    { team }
  ));
}

/**
 * Get SLA breach statistics grouped by priority
 * ex:priority: 'Critical', breached: 8, total: 25 
 */
export async function getSlaBreachByPriorityDB(startDate = null, endDate = null, team = null) {
  return dbQuery('getSlaBreachByPriority', () => db.manyOrNone(
    `SELECT 
        priority,
        COUNT(*) FILTER (WHERE sla_deadline < NOW() AND internal_status NOT IN ('Completed','Closed'))::int AS breached,
        COUNT(*)::int AS total
       FROM tickets
      WHERE ($(startDate)::timestamptz IS NULL OR created_at >= $(startDate))
        AND ($(endDate)::timestamptz IS NULL OR created_at <  $(endDate))
        AND ($(team)::text IS NULL OR assigned_to_team = $(team))
      GROUP BY priority`,
    { startDate, endDate, team }
  ));
}

/**
 * Get average resolution time in hours, overall or grouped by a column
 */
const ALLOWED_GROUP_BY_COLUMNS = ['priority', 'category', 'assigned_to_team', 'assigned_to_user_name'];

export async function getAvgResolutionTimeDB(groupBy = null, daysBack = 90, team = null) {
  if (groupBy && !ALLOWED_GROUP_BY_COLUMNS.includes(groupBy)) {
    throw new Error(`Invalid groupBy column: "${groupBy}". Allowed: ${ALLOWED_GROUP_BY_COLUMNS.join(', ')}`);
  }
  const selectGroup = groupBy ? ` ${groupBy},` : "";
  const groupByClause = groupBy ? `GROUP BY ${groupBy}` : "";
  return dbQuery('getAvgResolutionTime', () => db.manyOrNone(
    `SELECT${selectGroup} ROUND(AVG(EXTRACT(EPOCH FROM resolved_at - created_at) / 3600)::numeric,2) AS avg_hours
       FROM tickets
      WHERE resolved_at IS NOT NULL
        AND created_at >= NOW() - $(daysBack) * INTERVAL '1 day'
        AND ($(team)::text IS NULL OR assigned_to_team = $(team))
      ${groupByClause}`,
    { daysBack, team }
  ));
}

/**
 * Get daily ticket throughput (opened vs closed) for the past N days
 */
export async function getTicketThroughputDB(daysBack = 30, team = null) {
  return dbQuery('getTicketThroughput', () => db.manyOrNone(
    `WITH series AS (
        SELECT generate_series(NOW()::date - ($(daysBack)-1) * INTERVAL '1 day', NOW()::date, INTERVAL '1 day') AS day
     ), opened AS (
        SELECT date_trunc('day', created_at)::date AS d, COUNT(*) AS opened
          FROM tickets
         WHERE created_at >= NOW()::date - ($(daysBack)-1) * INTERVAL '1 day'
           AND ($(team)::text IS NULL OR assigned_to_team = $(team))
         GROUP BY 1
     ), closed AS (
        SELECT date_trunc('day', resolved_at)::date AS d, COUNT(*) AS closed
          FROM tickets
         WHERE resolved_at IS NOT NULL
           AND resolved_at >= NOW()::date - ($(daysBack)-1) * INTERVAL '1 day'
           AND ($(team)::text IS NULL OR assigned_to_team = $(team))
         GROUP BY 1
     )
     SELECT s.day,
            COALESCE(o.opened,0)::int AS opened,
            COALESCE(c.closed,0)::int AS closed
       FROM series s
       LEFT JOIN opened o ON o.d = s.day
       LEFT JOIN closed c ON c.d = s.day
       ORDER BY s.day`,
    { daysBack, team }
  ));
}

/**
 * Get top HR staff who closed the most tickets in the given time window
 */
export async function getTopHrClosersDB(daysBack = 30, limit = 5, team = null) {
  return dbQuery('getTopHrClosers', () => db.manyOrNone(
    `SELECT assigned_to_user_id AS user_id,
            assigned_to_user_name AS user_name,
            COUNT(*)::int AS closed_count
       FROM tickets
      WHERE internal_status IN ('Completed','Closed')
        AND resolved_at >= NOW() - $(daysBack) * INTERVAL '1 day'
        AND assigned_to_user_id IS NOT NULL
        AND ($(team)::text IS NULL OR assigned_to_team = $(team))
      GROUP BY assigned_to_user_id, assigned_to_user_name
      ORDER BY closed_count DESC
      LIMIT $(limit)`,
    { daysBack, limit, team }
  ));
}

/**
 * Get comprehensive agent performance metrics for all HR staff
 */
export async function getAgentPerformanceDB(startDate = null, endDate = null, team = null) {
  return dbQuery('getAgentPerformance', () => db.manyOrNone(
    `SELECT 
        assigned_to_user_name AS agent_name,
        COUNT(*) FILTER (WHERE internal_status IN ('Completed','Closed'))::int AS tickets_handled,
        COUNT(*) FILTER (WHERE internal_status = 'Under Process')::int AS under_process,
        ROUND(AVG(
          CASE 
            WHEN resolved_at IS NOT NULL
            THEN EXTRACT(EPOCH FROM resolved_at - created_at) / 3600 
            ELSE NULL 
          END
        )::numeric, 2) AS avg_resolution_time,
        COUNT(*) FILTER (WHERE sla_deadline < NOW() AND internal_status NOT IN ('Completed','Closed'))::int AS breached_count
       FROM tickets
      WHERE assigned_to_user_name IS NOT NULL
        AND ($(startDate)::timestamptz IS NULL OR created_at >= $(startDate))
        AND ($(endDate)::timestamptz IS NULL OR created_at <  $(endDate))
        AND ($(team)::text IS NULL OR assigned_to_team = $(team))
      GROUP BY assigned_to_user_name
      ORDER BY tickets_handled DESC`,
    { startDate, endDate, team }
  ));
}
