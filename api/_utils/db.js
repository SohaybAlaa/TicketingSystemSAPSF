import pgPromise from "pg-promise"; // PostgreSQL promise-based client factory
import dotenv from "dotenv"; // Loads environment variables from .env file
import { Client } from "ssh2"; // SSH2 client for establishing SSH tunnel connections
import net from "net"; // Node.js built-in TCP networking (used to create the local tunnel server)
import path from "path"; // Node.js built-in path utilities for resolving file/directory paths
import { fileURLToPath } from "url"; // Converts ESM import.meta.url to a file path (__filename equivalent)
import { toMinutes, computeDueAt, elapsedWorkingMinutes, operatingHoursFromRuleRow } from "./slaTimeMath.js";

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
    SELECT t.*, e.mobile_number AS employee_mobile_number
    FROM tickets t
    LEFT JOIN employees e ON e.employee_id = t.employee_id
    WHERE t.ticket_id = $(id)
  `, { id: ticketId }));
}

/**
 * Generate the next ticket_id based on category prefix
 * Vacation Ticket Request → VT-XX, Exit Permission Ticket Request → EPT-XX, else (Support Ticket Request) → ST-XX
 */
export async function generateTicketIdDB(category) {
  return dbQuery('generateTicketId', async () => {
    let prefix = 'ST';
    if (category === 'Vacation Ticket Request') prefix = 'VT';
    else if (category === 'Exit Permission Ticket Request') prefix = 'EPT';

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
        employee_id, employee_name, employee_email, employee_department, employee_location,
        priority, internal_status, assigned_to_team,
        raised_by, raised_by_id, raised_by_name, raised_by_email,
        sla_deadline
      ) VALUES(
        $(ticket_id), $(title), $(category), $(subcategory), $(reason),
        $(employee_id), $(employee_name), $(employee_email), $(employee_department), $(employee_location),
        $(priority), 'New', $(assigned_to_team),
        $(raised_by), $(raised_by_id), $(raised_by_name), $(raised_by_email),
        NOW() + $(sla_hours)::int * INTERVAL '1 hour'
      )
      RETURNING *
    `, { assigned_to_team: null, ...ticket });
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

// SLA breach is computed live ("state = running AND due_at < NOW()"), not from a stored flag —
// so it must only be evaluated while a ticket's clock is actually counting down. Paused tickets
// (Pending Employee / Pending Third Party) have their clock frozen: a deadline that's merely in
// the past while paused isn't a real breach, it's just calendar time passing while nothing was
// counted. Completed/Closed tickets are already resolved. Shared by every breach-count query below.
const BREACH_EXCLUDED_STATUSES = "('Completed','Closed','Pending Employee','Pending Third Party')";

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
          AND internal_status NOT IN ${BREACH_EXCLUDED_STATUSES})::int AS sla_breached,
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
          AND internal_status NOT IN ${BREACH_EXCLUDED_STATUSES}
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
        COUNT(*) FILTER (WHERE sla_deadline < NOW() AND internal_status NOT IN ${BREACH_EXCLUDED_STATUSES} AND ($(team)::text IS NULL OR assigned_to_team = $(team)))::int AS breached,
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
        COUNT(*) FILTER (WHERE sla_deadline < NOW() AND internal_status NOT IN ${BREACH_EXCLUDED_STATUSES})::int AS breached,
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
        COUNT(*) FILTER (WHERE sla_deadline < NOW() AND internal_status NOT IN ${BREACH_EXCLUDED_STATUSES})::int AS breached_count
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

// =========================================================
// ADMINISTRATOR MODULE — ENTITIES  (Schema.md TABLE 3)
// Shared lookup used by employees, ticketing rules, SLA
// assignments and notification rules.
// =========================================================

/**
 * Get all entities ordered by code.
 */
export async function getAllEntitiesDB() {
  return dbQuery('getAllEntities', () => db.manyOrNone(`
    SELECT id, code, name, created_at, updated_at
    FROM entities
    ORDER BY code ASC
  `));
}

/**
 * Resolve an entity to its internal id from a (code, name) pair.
 * Find-or-create: looks up by unique code first; if absent, inserts a
 * new entity. Returns the entity id (or null if code/name are blank).
 * @param {string} code
 * @param {string} name
 */
export async function resolveEntityIdDB(code, name) {
  return dbQuery('resolveEntityId', async () => {
    if (!code && !name) return null;

    // Try existing by code
    if (code) {
      const found = await db.oneOrNone(`SELECT id FROM entities WHERE code = $(code)`, { code });
      if (found) return found.id;
    }
    // Try existing by name (code may have been blank)
    if (name) {
      const foundByName = await db.oneOrNone(`SELECT id FROM entities WHERE name = $(name)`, { name });
      if (foundByName) return foundByName.id;
    }
    // Create a new entity (code + name are both UNIQUE in the schema)
    const created = await db.one(`
      INSERT INTO entities(code, name)
      VALUES($(code), $(name))
      RETURNING id
    `, { code: code || name, name: name || code });
    return created.id;
  });
}

// =========================================================
// ADMINISTRATOR MODULE — EMPLOYEES  (Schema.md TABLE 4)
// Employee Directory tab. Full CRUD. Exposes entity code/name
// (via entities join) and manager display name (self-join on
// manager_id → employee_id) to match the frontend shape.
// =========================================================

// Shared SELECT projection used by list + get-by-id helpers.
const EMPLOYEE_SELECT = `
  SELECT
    e.id,
    e.employee_id,
    e.name,
    e.location,
    e.department,
    e.employee_class,
    e.email,
    e.mobile_number,
    e.manager_id,
    ent.code AS entity_code,
    ent.name AS entity_name,
    mgr.name AS manager_name
  FROM employees e
  LEFT JOIN entities  ent ON ent.id = e.entity_id
  LEFT JOIN employees mgr ON mgr.employee_id = e.manager_id
`;

/**
 * Get all employees with entity code/name and manager display name.
 */
export async function getAllEmployeesDB() {
  return dbQuery('getAllEmployees', () => db.manyOrNone(`
    ${EMPLOYEE_SELECT}
    ORDER BY e.id ASC
  `));
}

/**
 * Get a single employee by internal id.
 */
export async function getEmployeeByIdDB(id) {
  return dbQuery('getEmployeeById', () => db.oneOrNone(`
    ${EMPLOYEE_SELECT}
    WHERE e.id = $(id)
  `, { id }));
}

/**
 * Resolve a manager display name to their employee_id (stable SAP key).
 * Best-effort: returns null if no employee matches that name.
 * @param {string} managerName
 */
async function resolveManagerIdDB(managerName) {
  if (!managerName) return null;
  const row = await db.oneOrNone(`
    SELECT employee_id FROM employees WHERE name = $(managerName) LIMIT 1
  `, { managerName });
  return row ? row.employee_id : null;
}

/**
 * Create a new employee. Resolves entity (find-or-create by code/name)
 * and manager (name → employee_id) before inserting.
 * @param {object} emp - { employeeId, name, entityCode, entityName, location, department, employeeClass, manager, email, mobileNumber }
 */
export async function createEmployeeDB(emp) {
  return dbQuery('createEmployee', async () => {
    const entityId  = await resolveEntityIdDB(emp.entityCode, emp.entityName);
    const managerId = await resolveManagerIdDB(emp.manager);

    return db.one(`
      INSERT INTO employees(
        employee_id, name, entity_id, location, department,
        employee_class, manager_id, email, mobile_number
      ) VALUES(
        $(employee_id), $(name), $(entity_id), $(location), $(department),
        $(employee_class), $(manager_id), $(email), $(mobile_number)
      )
      RETURNING id
    `, {
      employee_id: emp.employeeId,
      name: emp.name,
      entity_id: entityId,
      location: emp.location || null,
      department: emp.department || null,
      employee_class: emp.employeeClass || null,
      manager_id: managerId,
      email: emp.email || null,
      mobile_number: emp.mobileNumber || null,
    });
  });
}

/**
 * Update an existing employee by internal id.
 * @param {number} id
 * @param {object} emp - same shape as createEmployeeDB
 */
export async function updateEmployeeDB(id, emp) {
  return dbQuery('updateEmployee', async () => {
    const entityId  = await resolveEntityIdDB(emp.entityCode, emp.entityName);
    const managerId = await resolveManagerIdDB(emp.manager);

    return db.none(`
      UPDATE employees SET
        employee_id    = $(employee_id),
        name           = $(name),
        entity_id      = $(entity_id),
        location       = $(location),
        department     = $(department),
        employee_class = $(employee_class),
        manager_id     = $(manager_id),
        email          = $(email),
        mobile_number  = $(mobile_number)
      WHERE id = $(id)
    `, {
      id,
      employee_id: emp.employeeId,
      name: emp.name,
      entity_id: entityId,
      location: emp.location || null,
      department: emp.department || null,
      employee_class: emp.employeeClass || null,
      manager_id: managerId,
      email: emp.email || null,
      mobile_number: emp.mobileNumber || null,
    });
  });
}

/**
 * Delete an employee by internal id.
 */
export async function deleteEmployeeDB(id) {
  return dbQuery('deleteEmployee', () => db.none(`DELETE FROM employees WHERE id = $(id)`, { id }));
}

/**
 * Resolve a typed employee identifier to the internal employees.id (PK).
 * Matches the business key (employee_id, e.g. 'EMP-0001') first, then falls
 * back to a numeric internal id. Returns null if no employee matches.
 * Used by group_members to satisfy the strict FK to employees(id).
 * @param {string|number} typedId
 */
export async function resolveEmployeeRefIdDB(typedId) {
  return dbQuery('resolveEmployeeRefId', async () => {
    if (typedId === undefined || typedId === null || typedId === '') return null;
    const value = typedId.toString().trim();

    const byBusiness = await db.oneOrNone(
      `SELECT id FROM employees WHERE employee_id = $(value)`, { value }
    );
    if (byBusiness) return byBusiness.id;

    if (/^\d+$/.test(value)) {
      const byId = await db.oneOrNone(
        `SELECT id FROM employees WHERE id = $(value)`, { value: parseInt(value, 10) }
      );
      if (byId) return byId.id;
    }
    return null;
  });
}

// =========================================================
// ADMINISTRATOR MODULE — SUPPORT GROUPS  (Schema.md TABLE 5)
// Org Structure tab — top grid. Entity-agnostic groups.
// =========================================================

/**
 * Get all support groups (without members) ordered by external code.
 */
export async function getAllGroupsDB() {
  return dbQuery('getAllGroups', () => db.manyOrNone(`
    SELECT id, external_code, name, parent_name,
           to_char(valid_from, 'YYYY-MM-DD') AS valid_from,
           to_char(valid_to,   'YYYY-MM-DD') AS valid_to,
           created_at, updated_at
    FROM support_groups
    ORDER BY external_code ASC
  `));
}

/**
 * Get a single support group by id.
 */
export async function getGroupByIdDB(id) {
  return dbQuery('getGroupById', () => db.oneOrNone(`
    SELECT id, external_code, name, parent_name,
           to_char(valid_from, 'YYYY-MM-DD') AS valid_from,
           to_char(valid_to,   'YYYY-MM-DD') AS valid_to,
           created_at, updated_at
    FROM support_groups
    WHERE id = $(id)
  `, { id }));
}

/**
 * Create a support group.
 * @param {object} g - { externalCode, name, parentName, validFrom, validTo }
 */
export async function createGroupDB(g) {
  return dbQuery('createGroup', () => db.one(`
    INSERT INTO support_groups(external_code, name, parent_name, valid_from, valid_to)
    VALUES($(external_code), $(name), $(parent_name), $(valid_from), $(valid_to))
    RETURNING id
  `, {
    external_code: g.externalCode,
    name: g.name,
    parent_name: g.parentName || null,
    valid_from: g.validFrom,
    valid_to: g.validTo,
  }));
}

/**
 * Update a support group by id.
 * @param {number} id
 * @param {object} g - same shape as createGroupDB
 */
export async function updateGroupDB(id, g) {
  return dbQuery('updateGroup', () => db.none(`
    UPDATE support_groups SET
      external_code = $(external_code),
      name          = $(name),
      parent_name   = $(parent_name),
      valid_from    = $(valid_from),
      valid_to      = $(valid_to)
    WHERE id = $(id)
  `, {
    id,
    external_code: g.externalCode,
    name: g.name,
    parent_name: g.parentName || null,
    valid_from: g.validFrom,
    valid_to: g.validTo,
  }));
}

/**
 * Delete a support group (cascades to its group_members).
 */
export async function deleteGroupDB(id) {
  return dbQuery('deleteGroup', () => db.none(`DELETE FROM support_groups WHERE id = $(id)`, { id }));
}

// =========================================================
// ADMINISTRATOR MODULE — GROUP MEMBERS  (Schema.md TABLE 6)
// Org Structure tab — bottom grid. Employees assigned to a
// group with a role. Strict FK: employee_id -> employees(id).
// =========================================================

/**
 * Get all members of a group, joined to employees for the business
 * key + display name the frontend grid renders.
 */
export async function getGroupMembersDB(groupId) {
  return dbQuery('getGroupMembers', () => db.manyOrNone(`
    SELECT
      gm.id,
      e.employee_id AS employee_code,
      e.name        AS employee_name,
      gm.user_type,
      to_char(gm.valid_from, 'YYYY-MM-DD') AS valid_from,
      to_char(gm.valid_to,   'YYYY-MM-DD') AS valid_to
    FROM group_members gm
    JOIN employees e ON e.id = gm.employee_id
    WHERE gm.group_id = $(groupId)
    ORDER BY gm.id ASC
  `, { groupId }));
}

/**
 * Get a single group member by id (joined to employees).
 */
export async function getGroupMemberByIdDB(id) {
  return dbQuery('getGroupMemberById', () => db.oneOrNone(`
    SELECT
      gm.id,
      gm.group_id,
      e.employee_id AS employee_code,
      e.name        AS employee_name,
      gm.user_type,
      to_char(gm.valid_from, 'YYYY-MM-DD') AS valid_from,
      to_char(gm.valid_to,   'YYYY-MM-DD') AS valid_to
    FROM group_members gm
    JOIN employees e ON e.id = gm.employee_id
    WHERE gm.id = $(id)
  `, { id }));
}

/**
 * Add a member to a group. The caller must resolve employeeRefId
 * (employees.id) via resolveEmployeeRefIdDB before calling.
 * @param {number} groupId
 * @param {number} employeeRefId - internal employees.id
 * @param {object} m - { userType, from, to }
 */
export async function createGroupMemberDB(groupId, employeeRefId, m) {
  return dbQuery('createGroupMember', () => db.one(`
    INSERT INTO group_members(group_id, employee_id, user_type, valid_from, valid_to)
    VALUES($(group_id), $(employee_id), $(user_type), $(valid_from), $(valid_to))
    RETURNING id
  `, {
    group_id: groupId,
    employee_id: employeeRefId,
    user_type: m.userType,
    valid_from: m.from,
    valid_to: m.to,
  }));
}

/**
 * Update an existing group member.
 * @param {number} id
 * @param {number} employeeRefId - internal employees.id
 * @param {object} m - { userType, from, to }
 */
export async function updateGroupMemberDB(id, employeeRefId, m) {
  return dbQuery('updateGroupMember', () => db.none(`
    UPDATE group_members SET
      employee_id = $(employee_id),
      user_type   = $(user_type),
      valid_from  = $(valid_from),
      valid_to    = $(valid_to)
    WHERE id = $(id)
  `, {
    id,
    employee_id: employeeRefId,
    user_type: m.userType,
    valid_from: m.from,
    valid_to: m.to,
  }));
}

/**
 * Remove a member from a group.
 */
export async function deleteGroupMemberDB(id) {
  return dbQuery('deleteGroupMember', () => db.none(`DELETE FROM group_members WHERE id = $(id)`, { id }));
}

// =========================================================
// ADMINISTRATOR MODULE — LOOKUP RESOLVERS
// Resolve display names (as sent by the frontend selects) to
// the internal ids required by ticketing_rules / SLA / etc.
// Each returns null when no match exists.
// =========================================================

/** Resolve an entity name (e.g. 'Acme Corp') to entities.id. */
export async function getEntityIdByNameDB(name) {
  return dbQuery('getEntityIdByName', async () => {
    if (!name) return null;
    const row = await db.oneOrNone(`SELECT id FROM entities WHERE name = $(name)`, { name });
    return row ? row.id : null;
  });
}

/** Resolve a support category name (e.g. 'IT Support') to support_categories.id. */
export async function getCategoryIdByNameDB(name) {
  return dbQuery('getCategoryIdByName', async () => {
    if (!name) return null;
    const row = await db.oneOrNone(`SELECT id FROM support_categories WHERE name = $(name)`, { name });
    return row ? row.id : null;
  });
}

/** Resolve a subcategory name within a category to subcategories.id (enforces the parent link). */
export async function getSubcategoryIdByNameDB(categoryId, name) {
  return dbQuery('getSubcategoryIdByName', async () => {
    if (!categoryId || !name) return null;
    const row = await db.oneOrNone(
      `SELECT id FROM subcategories WHERE category_id = $(categoryId) AND name = $(name)`,
      { categoryId, name }
    );
    return row ? row.id : null;
  });
}

/** Resolve a support group name (e.g. 'Level 1 Support') to support_groups.id. */
export async function getGroupIdByNameDB(name) {
  return dbQuery('getGroupIdByName', async () => {
    if (!name) return null;
    const row = await db.oneOrNone(`SELECT id FROM support_groups WHERE name = $(name) ORDER BY id ASC LIMIT 1`, { name });
    return row ? row.id : null;
  });
}

/**
 * Get all support categories, each with its list of subcategories.
 * Used to drive the Category/Subcategory dropdowns in the Ticketing Rule
 * and SLA Assignment admin forms (they must match support_categories /
 * subcategories exactly, since those names are resolved by-name on save).
 */
export async function getAllCategoriesWithSubcategoriesDB() {
  return dbQuery('getAllCategoriesWithSubcategories', async () => {
    const rows = await db.manyOrNone(`
      SELECT cat.id AS category_id, cat.name AS category_name,
             sub.id AS subcategory_id, sub.name AS subcategory_name
      FROM support_categories cat
      LEFT JOIN subcategories sub ON sub.category_id = cat.id
      ORDER BY cat.name ASC, sub.name ASC
    `);
    const byId = new Map();
    for (const row of rows) {
      if (!byId.has(row.category_id)) {
        byId.set(row.category_id, { id: row.category_id, name: row.category_name, subcategories: [] });
      }
      if (row.subcategory_id) {
        byId.get(row.category_id).subcategories.push({ id: row.subcategory_id, name: row.subcategory_name });
      }
    }
    return Array.from(byId.values());
  });
}

// =========================================================
// ADMINISTRATOR MODULE — TICKETING RULES  (Schema.md TABLE 7)
// Ticketing Rule tab. Maps (entity, employee_class, category,
// subcategory) -> (support_group, priority). Group-level
// routing only (no agent column per schema).
// =========================================================

// Shared SELECT projection joining all lookup tables to display names.
const TICKETING_RULE_SELECT = `
  SELECT
    tr.id,
    ent.name AS entity,
    tr.employee_class,
    cat.name AS support_category,
    sub.name AS subcategory,
    grp.name AS group_name,
    tr.priority
  FROM ticketing_rules tr
  JOIN entities           ent ON ent.id = tr.entity_id
  JOIN support_categories cat ON cat.id = tr.category_id
  JOIN subcategories      sub ON sub.id = tr.subcategory_id
  JOIN support_groups     grp ON grp.id = tr.group_id
`;

/**
 * Get all ticketing rules with resolved display names.
 */
export async function getAllTicketingRulesDB() {
  return dbQuery('getAllTicketingRules', () => db.manyOrNone(`
    ${TICKETING_RULE_SELECT}
    ORDER BY tr.id ASC
  `));
}

/**
 * Get a single ticketing rule by id.
 */
export async function getTicketingRuleByIdDB(id) {
  return dbQuery('getTicketingRuleById', () => db.oneOrNone(`
    ${TICKETING_RULE_SELECT}
    WHERE tr.id = $(id)
  `, { id }));
}

/**
 * Create a ticketing rule. All ids must be pre-resolved by the caller.
 * @param {object} r - { entityId, employeeClass, categoryId, subcategoryId, groupId, priority }
 */
export async function createTicketingRuleDB(r) {
  return dbQuery('createTicketingRule', () => db.one(`
    INSERT INTO ticketing_rules(entity_id, employee_class, category_id, subcategory_id, group_id, priority)
    VALUES($(entity_id), $(employee_class), $(category_id), $(subcategory_id), $(group_id), $(priority))
    RETURNING id
  `, {
    entity_id: r.entityId,
    employee_class: r.employeeClass,
    category_id: r.categoryId,
    subcategory_id: r.subcategoryId,
    group_id: r.groupId,
    priority: r.priority,
  }));
}

/**
 * Update a ticketing rule by id. All ids must be pre-resolved by the caller.
 * @param {number} id
 * @param {object} r - same shape as createTicketingRuleDB
 */
export async function updateTicketingRuleDB(id, r) {
  return dbQuery('updateTicketingRule', () => db.none(`
    UPDATE ticketing_rules SET
      entity_id      = $(entity_id),
      employee_class = $(employee_class),
      category_id    = $(category_id),
      subcategory_id = $(subcategory_id),
      group_id       = $(group_id),
      priority       = $(priority)
    WHERE id = $(id)
  `, {
    id,
    entity_id: r.entityId,
    employee_class: r.employeeClass,
    category_id: r.categoryId,
    subcategory_id: r.subcategoryId,
    group_id: r.groupId,
    priority: r.priority,
  }));
}

/**
 * Delete a ticketing rule by id.
 */
export async function deleteTicketingRuleDB(id) {
  return dbQuery('deleteTicketingRule', () => db.none(`DELETE FROM ticketing_rules WHERE id = $(id)`, { id }));
}

// =========================================================
// ADMINISTRATOR MODULE — SLA POLICIES + RULES  (Schema.md TABLES 8 & 9)
// SLA Rule tab. A policy (sla_policies, e.g. 'SLA-001') groups
// multiple rule rows (sla_rules). Operating hours are stored per
// rule row as oh_<day>_enabled/start/end columns.
// =========================================================

const SLA_DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

// Build a frontend responseTime string (e.g. '4 Hours', '30 Minutes') from value + unit.
function buildResponseTimeString(value, unit) {
  const num = Number(value);
  const singular = String(unit).replace(/s$/, ''); // 'Minute' | 'Hour' | 'Day'
  const label = num === 1 ? singular : `${singular}s`;
  const display = Number.isInteger(num) ? String(num) : String(num);
  return `${display} ${label}`;
}

// Parse a responseTime string ('4 Hours', '1 Hour', '30 Minutes', '2 Days')
// into { value, unit } where unit is one of 'Minutes' | 'Hours' | 'Days'.
// Returns null when the string cannot be parsed.
export function parseResponseTimeString(str) {
  const m = String(str).trim().match(/^([\d.]+)\s*(minute|hour|day)s?$/i);
  if (!m) return null;
  const value = Number(m[1]);
  const unitMap = { minute: 'Minutes', hour: 'Hours', day: 'Days' };
  const unit = unitMap[m[2].toLowerCase()];
  if (!value || value <= 0 || !unit) return null;
  return { value, unit };
}

// Convert an operatingHours object into the flat oh_* param map for SQL.
function slaOhParams(oh) {
  const params = {};
  for (const d of SLA_DAYS) {
    const day = (oh && oh[d]) || {};
    params[`oh_${d}_enabled`] = !!day.enabled;
    params[`oh_${d}_start`] = day.start || null;
    params[`oh_${d}_end`] = day.end || null;
  }
  return params;
}

// Default operating hours derived from the chosen time type (mirrors the seed pattern).
export function defaultOperatingHoursForTimeType(timeType) {
  const oh = {};
  if (timeType === 'Calendar Time') {
    for (const d of SLA_DAYS) oh[d] = { enabled: true, start: '00:00', end: '23:59' };
  } else {
    // Working Time / Custom Time: Sun–Thu 08:00–16:00
    for (const d of SLA_DAYS) {
      const working = ['sun', 'mon', 'tue', 'wed', 'thu'].includes(d);
      oh[d] = { enabled: working, start: '08:00', end: '16:00' };
    }
  }
  return oh;
}

// Map a raw sla_rules row (joined to sla_policies) to the frontend rule shape.
export function formatSlaRuleRow(row) {
  const operatingHours = {};
  for (const d of SLA_DAYS) {
    operatingHours[d] = {
      enabled: row[`oh_${d}_enabled`],
      start: row[`oh_${d}_start`] || '08:00',
      end: row[`oh_${d}_end`] || '17:00',
    };
  }
  return {
    id: row.id,
    slaId: row.sla_id,
    slaName: row.sla_name,
    slaType: row.sla_type,
    priority: row.priority,
    responseTime: buildResponseTimeString(row.response_time_value, row.response_time_unit),
    timeType: row.time_type,
    operatingHours,
  };
}

// Shared SELECT projection (joins policy, formats times to HH:MM).
const SLA_RULE_SELECT = `
  SELECT
    r.id, p.sla_id, r.sla_name, r.sla_type, r.priority,
    r.response_time_value, r.response_time_unit, r.time_type,
    ${SLA_DAYS.map(d => `r.oh_${d}_enabled, to_char(r.oh_${d}_start,'HH24:MI') AS oh_${d}_start, to_char(r.oh_${d}_end,'HH24:MI') AS oh_${d}_end`).join(',\n    ')}
  FROM sla_rules r
  JOIN sla_policies p ON p.id = r.policy_id
`;

/**
 * Get all SLA rules (grouped by policy) formatted for the frontend.
 */
export async function getAllSlaRulesDB() {
  return dbQuery('getAllSlaRules', async () => {
    const rows = await db.manyOrNone(`${SLA_RULE_SELECT} ORDER BY p.sla_id ASC, r.id ASC`);
    return rows.map(formatSlaRuleRow);
  });
}

/**
 * Get a single formatted SLA rule by id (or null).
 */
export async function getSlaRuleByIdDB(id) {
  return dbQuery('getSlaRuleById', async () => {
    const row = await db.oneOrNone(`${SLA_RULE_SELECT} WHERE r.id = $(id)`, { id });
    return row ? formatSlaRuleRow(row) : null;
  });
}

/** Find an SLA policy by its business code (e.g. 'SLA-001'). */
export async function getPolicyBySlaIdDB(slaId) {
  return dbQuery('getPolicyBySlaId', () => db.oneOrNone(
    `SELECT id, sla_id FROM sla_policies WHERE sla_id = $(slaId)`, { slaId }
  ));
}

/** Create a new SLA policy row. */
export async function createPolicyDB(slaId) {
  return dbQuery('createPolicy', () => db.one(
    `INSERT INTO sla_policies(sla_id) VALUES($(slaId)) RETURNING id, sla_id`, { slaId }
  ));
}

/** Generate the next available 'SLA-XXX' code. */
export async function generateNextSlaIdDB() {
  return dbQuery('generateNextSlaId', async () => {
    const row = await db.one(
      `SELECT COALESCE(MAX(CAST(SUBSTRING(sla_id FROM 5) AS INTEGER)), 0) + 1 AS next
       FROM sla_policies WHERE sla_id ~ '^SLA-[0-9]+$'`
    );
    return `SLA-${String(row.next).padStart(3, '0')}`;
  });
}

// Build the parameterized INSERT for a single SLA rule (shared by the plain
// create and the transactional new-policy create). Operating hours default
// from the time type when not supplied.
function buildSlaRuleInsert(policyId, r) {
  const ohCols = SLA_DAYS.flatMap(d => [`oh_${d}_enabled`, `oh_${d}_start`, `oh_${d}_end`]);
  const ohVals = SLA_DAYS.flatMap(d => [`$(oh_${d}_enabled)`, `$(oh_${d}_start)`, `$(oh_${d}_end)`]);
  const operatingHours = r.operatingHours || defaultOperatingHoursForTimeType(r.timeType);
  const params = {
    policy_id: policyId,
    sla_name: r.slaName,
    sla_type: r.slaType,
    priority: r.priority,
    response_time_value: r.responseValue,
    response_time_unit: r.responseUnit,
    time_type: r.timeType,
    ...slaOhParams(operatingHours),
  };
  const text = `
    INSERT INTO sla_rules(
      policy_id, sla_name, sla_type, priority, response_time_value, response_time_unit, time_type,
      ${ohCols.join(', ')}
    ) VALUES(
      $(policy_id), $(sla_name), $(sla_type), $(priority), $(response_time_value), $(response_time_unit), $(time_type),
      ${ohVals.join(', ')}
    )
    RETURNING id
  `;
  return { text, params };
}

/**
 * Create an SLA rule under an EXISTING policy. Operating hours default from the time type.
 * @param {number} policyId
 * @param {object} r - { slaName, slaType, priority, responseValue, responseUnit, timeType, operatingHours? }
 */
export async function createSlaRuleDB(policyId, r) {
  const { text, params } = buildSlaRuleInsert(policyId, r);
  return dbQuery('createSlaRule', () => db.one(text, params));
}

/**
 * Create a brand-new policy AND its first rule atomically (single transaction),
 * so a failed rule insert never leaves an orphan empty policy behind.
 * @param {object} r - same shape as createSlaRuleDB's rule arg
 * @returns {{ id: number, slaId: string }} the new rule id + generated policy code
 */
export async function createSlaRuleWithNewPolicyDB(r) {
  return dbQuery('createSlaRuleWithNewPolicy', () => db.tx(async t => {
    const codeRow = await t.one(
      `SELECT COALESCE(MAX(CAST(SUBSTRING(sla_id FROM 5) AS INTEGER)), 0) + 1 AS next
       FROM sla_policies WHERE sla_id ~ '^SLA-[0-9]+$'`
    );
    const slaId = `SLA-${String(codeRow.next).padStart(3, '0')}`;
    const policy = await t.one(`INSERT INTO sla_policies(sla_id) VALUES($(slaId)) RETURNING id`, { slaId });
    const { text, params } = buildSlaRuleInsert(policy.id, r);
    const ruleRow = await t.one(text, params);
    return { id: ruleRow.id, slaId };
  }));
}

/**
 * Update the scalar fields of an SLA rule (not operating hours, not policy).
 * @param {number} id
 * @param {object} r - { slaName, slaType, priority, responseValue, responseUnit, timeType }
 */
export async function updateSlaRuleDB(id, r) {
  return dbQuery('updateSlaRule', () => db.none(`
    UPDATE sla_rules SET
      sla_name            = $(sla_name),
      sla_type            = $(sla_type),
      priority            = $(priority),
      response_time_value = $(response_time_value),
      response_time_unit  = $(response_time_unit),
      time_type           = $(time_type)
    WHERE id = $(id)
  `, {
    id,
    sla_name: r.slaName,
    sla_type: r.slaType,
    priority: r.priority,
    response_time_value: r.responseValue,
    response_time_unit: r.responseUnit,
    time_type: r.timeType,
  }));
}

/**
 * Update the operating hours + derived time type of an SLA rule.
 * @param {number} id
 * @param {string} timeType
 * @param {object} operatingHours
 */
export async function updateSlaRuleOperatingHoursDB(id, timeType, operatingHours) {
  const setOh = SLA_DAYS.flatMap(d => [
    `oh_${d}_enabled = $(oh_${d}_enabled)`,
    `oh_${d}_start = $(oh_${d}_start)`,
    `oh_${d}_end = $(oh_${d}_end)`,
  ]);
  const params = { id, time_type: timeType, ...slaOhParams(operatingHours) };
  return dbQuery('updateSlaRuleOperatingHours', () => db.none(`
    UPDATE sla_rules SET time_type = $(time_type), ${setOh.join(', ')} WHERE id = $(id)
  `, params));
}

/** Delete an SLA rule by id. */
export async function deleteSlaRuleDB(id) {
  return dbQuery('deleteSlaRule', () => db.none(`DELETE FROM sla_rules WHERE id = $(id)`, { id }));
}

/**
 * Delete a policy only if it has no remaining rules and is not referenced
 * by any sla_assignments. Returns true if it was deleted.
 */
export async function deletePolicyIfUnusedDB(policyId) {
  return dbQuery('deletePolicyIfUnused', async () => {
    const rules = await db.one(`SELECT COUNT(*)::int AS c FROM sla_rules WHERE policy_id = $(policyId)`, { policyId });
    if (rules.c > 0) return false;
    const assigns = await db.one(`SELECT COUNT(*)::int AS c FROM sla_assignments WHERE policy_id = $(policyId)`, { policyId });
    if (assigns.c > 0) return false;
    await db.none(`DELETE FROM sla_policies WHERE id = $(policyId)`, { policyId });
    return true;
  });
}

/**
 * List all SLA policies (id + business code), ordered by code.
 * Used to populate the SLA ID dropdown on the SLA Assignment tab.
 */
export async function getAllSlaPoliciesDB() {
  return dbQuery('getAllSlaPolicies', () => db.manyOrNone(
    `SELECT id, sla_id FROM sla_policies ORDER BY sla_id ASC`
  ));
}

// =========================================================
// ADMINISTRATOR MODULE — SLA ASSIGNMENTS  (Schema.md TABLE 10)
// SLA Assignment tab. Maps (entity, employee_class, category,
// subcategory) → an SLA policy. Looked up after ticketing_rules
// to find the applicable SLA timer for a ticket.
// =========================================================

// Shared SELECT projection joining all lookup tables to display names.
const SLA_ASSIGNMENT_SELECT = `
  SELECT
    a.id,
    p.sla_id,
    ent.name AS entity,
    a.employee_class,
    cat.name AS support_category,
    sub.name AS subcategory
  FROM sla_assignments a
  JOIN sla_policies       p   ON p.id   = a.policy_id
  JOIN entities           ent ON ent.id = a.entity_id
  JOIN support_categories cat ON cat.id = a.category_id
  JOIN subcategories      sub ON sub.id = a.subcategory_id
`;

// Map a raw sla_assignments row to the frontend shape.
function formatSlaAssignmentRow(row) {
  return {
    id: row.id,
    slaId: row.sla_id,
    entity: row.entity,
    employeeClass: row.employee_class,
    supportCategory: row.support_category,
    subcategory: row.subcategory,
  };
}

/**
 * Get all SLA assignments with resolved display names.
 */
export async function getAllSlaAssignmentsDB() {
  return dbQuery('getAllSlaAssignments', async () => {
    const rows = await db.manyOrNone(`${SLA_ASSIGNMENT_SELECT} ORDER BY a.id ASC`);
    return rows.map(formatSlaAssignmentRow);
  });
}

/**
 * Get a single SLA assignment by id (formatted) or null.
 */
export async function getSlaAssignmentByIdDB(id) {
  return dbQuery('getSlaAssignmentById', async () => {
    const row = await db.oneOrNone(`${SLA_ASSIGNMENT_SELECT} WHERE a.id = $(id)`, { id });
    return row ? formatSlaAssignmentRow(row) : null;
  });
}

/**
 * Create an SLA assignment. All ids must be pre-resolved by the caller.
 * @param {object} a - { policyId, entityId, employeeClass, categoryId, subcategoryId }
 */
export async function createSlaAssignmentDB(a) {
  return dbQuery('createSlaAssignment', () => db.one(`
    INSERT INTO sla_assignments(policy_id, entity_id, employee_class, category_id, subcategory_id)
    VALUES($(policy_id), $(entity_id), $(employee_class), $(category_id), $(subcategory_id))
    RETURNING id
  `, {
    policy_id: a.policyId,
    entity_id: a.entityId,
    employee_class: a.employeeClass,
    category_id: a.categoryId,
    subcategory_id: a.subcategoryId,
  }));
}

/**
 * Update an SLA assignment by id. All ids must be pre-resolved by the caller.
 */
export async function updateSlaAssignmentDB(id, a) {
  return dbQuery('updateSlaAssignment', () => db.none(`
    UPDATE sla_assignments SET
      policy_id      = $(policy_id),
      entity_id      = $(entity_id),
      employee_class = $(employee_class),
      category_id    = $(category_id),
      subcategory_id = $(subcategory_id)
    WHERE id = $(id)
  `, {
    id,
    policy_id: a.policyId,
    entity_id: a.entityId,
    employee_class: a.employeeClass,
    category_id: a.categoryId,
    subcategory_id: a.subcategoryId,
  }));
}

/** Delete an SLA assignment by id. */
export async function deleteSlaAssignmentDB(id) {
  return dbQuery('deleteSlaAssignment', () => db.none(`DELETE FROM sla_assignments WHERE id = $(id)`, { id }));
}

// =========================================================
// ADMINISTRATOR MODULE — NOTIFICATION RULES  (Schema.md TABLES 11–13)
// Notification Rules tab. A rule (notification_rules) has many
// trigger conditions (notification_conditions) and recipient
// personas (notification_personas). Rules are keyed to the
// frontend by their business code ('NTF-001'). Entity scoping
// (Table 14) is not surfaced by the current UI → rules are global.
// =========================================================

// Maps an "other_*" persona to the extraSelections bucket the frontend uses.
const PERSONA_EXTRA_MAP = {
  other_employee: 'employee',
  other_agent: 'agent',
  other_group: 'group',
  other_manager: 'manager',
};

// Parse an extra_ref value into a string array. New rows store a JSON array;
// legacy rows may hold a comma-joined string — support both.
function parseExtraRef(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(s => String(s).trim()).filter(Boolean);
  } catch { /* not JSON → fall through to comma-split */ }
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

// Assemble a full notification rule (+ conditions + personas) into the frontend shape.
function formatNotificationRule(r, conds, personas) {
  const extraSelections = {};
  for (const p of personas) {
    const extra = PERSONA_EXTRA_MAP[p.persona_key];
    if (extra && p.extra_ref) {
      const values = parseExtraRef(p.extra_ref);
      if (values.length) extraSelections[extra] = values;
    }
  }
  return {
    id: r.rule_code,
    name: r.name,
    status: r.status,
    subject: r.email_subject,
    body: r.email_body,
    conds: conds.map(c => ({
      id: c.id,
      type: c.condition_type,
      subtype: c.subtype || '',
      whenType: c.when_type,
      amount: c.time_amount != null ? Number(c.time_amount) : 1,
      unit: c.time_unit || 'hours',
      ageBreached: c.age_breached,
      op: c.logical_op,
    })),
    personas: personas.map(p => p.persona_key),
    extraSelections,
  };
}

// Generate the next 'NTF-XXX' code (runs inside a transaction task).
async function nextNotificationCode(t) {
  const r = await t.one(
    `SELECT COALESCE(MAX(CAST(SUBSTRING(rule_code FROM 5) AS INTEGER)), 0) + 1 AS next
     FROM notification_rules WHERE rule_code ~ '^NTF-[0-9]+$'`
  );
  return `NTF-${String(r.next).padStart(3, '0')}`;
}

// Insert the child conditions + personas for a rule (inside a transaction task).
async function insertNotificationChildren(t, ruleId, rule) {
  const conds = rule.conds || [];
  for (let i = 0; i < conds.length; i++) {
    const c = conds[i];
    const isTimed = c.whenType === 'time';
    await t.none(`
      INSERT INTO notification_conditions(
        rule_id, sort_order, condition_type, subtype, when_type,
        time_amount, time_unit, age_breached, logical_op
      ) VALUES(
        $(rule_id), $(sort_order), $(condition_type), $(subtype), $(when_type),
        $(time_amount), $(time_unit), $(age_breached), $(logical_op)
      )
    `, {
      rule_id: ruleId,
      sort_order: i + 1,
      condition_type: c.type,
      subtype: c.subtype || null,
      when_type: c.whenType,
      time_amount: isTimed && c.amount != null ? c.amount : null,
      time_unit: isTimed && c.unit ? c.unit : null,
      age_breached: !!c.ageBreached,
      logical_op: c.op || 'AND',
    });
  }

  const personas = rule.personas || [];
  const extra = rule.extraSelections || {};
  for (const key of personas) {
    const extraType = PERSONA_EXTRA_MAP[key];
    // Store the selected values as a JSON array (safe for commas + arbitrary length).
    const extraRef = extraType && Array.isArray(extra[extraType]) && extra[extraType].length
      ? JSON.stringify(extra[extraType])
      : null;
    await t.none(
      `INSERT INTO notification_personas(rule_id, persona_key, extra_ref) VALUES($(rule_id), $(persona_key), $(extra_ref))`,
      { rule_id: ruleId, persona_key: key, extra_ref: extraRef }
    );
  }
}

/**
 * Get all notification rules with their conditions + personas, in frontend shape.
 */
export async function getAllNotificationRulesDB() {
  return dbQuery('getAllNotificationRules', async () => {
    const rules = await db.manyOrNone(
      `SELECT id, rule_code, name, status, email_subject, email_body
       FROM notification_rules ORDER BY rule_code ASC`
    );
    if (!rules.length) return [];
    const ids = rules.map(r => r.id);
    const conds = await db.manyOrNone(
      `SELECT * FROM notification_conditions WHERE rule_id IN ($(ids:csv)) ORDER BY rule_id ASC, sort_order ASC`, { ids }
    );
    const personas = await db.manyOrNone(
      `SELECT * FROM notification_personas WHERE rule_id IN ($(ids:csv)) ORDER BY rule_id ASC, id ASC`, { ids }
    );
    return rules.map(r => formatNotificationRule(
      r,
      conds.filter(c => c.rule_id === r.id),
      personas.filter(p => p.rule_id === r.id)
    ));
  });
}

/**
 * Get a single notification rule (by business code) in frontend shape, or null.
 */
export async function getNotificationRuleByCodeDB(code) {
  return dbQuery('getNotificationRuleByCode', async () => {
    const r = await db.oneOrNone(
      `SELECT id, rule_code, name, status, email_subject, email_body FROM notification_rules WHERE rule_code = $(code)`, { code }
    );
    if (!r) return null;
    const conds = await db.manyOrNone(`SELECT * FROM notification_conditions WHERE rule_id = $(id) ORDER BY sort_order ASC`, { id: r.id });
    const personas = await db.manyOrNone(`SELECT * FROM notification_personas WHERE rule_id = $(id) ORDER BY id ASC`, { id: r.id });
    return formatNotificationRule(r, conds, personas);
  });
}

/**
 * Create a notification rule (+ children). Generates its own NTF code.
 * @param {object} rule - { name, status, subject, body, conds, personas, extraSelections }
 * @returns {string} the generated rule_code
 */
export async function createNotificationRuleDB(rule) {
  return dbQuery('createNotificationRule', () => db.tx(async t => {
    const code = await nextNotificationCode(t);
    const row = await t.one(`
      INSERT INTO notification_rules(rule_code, name, status, email_subject, email_body)
      VALUES($(code), $(name), $(status), $(subject), $(body))
      RETURNING id, rule_code
    `, { code, name: rule.name, status: rule.status !== false, subject: rule.subject, body: rule.body });
    await insertNotificationChildren(t, row.id, rule);
    return row.rule_code;
  }));
}

/**
 * Update a notification rule (by code) + fully replace its children.
 * @returns {boolean} false if the rule code was not found.
 */
export async function updateNotificationRuleByCodeDB(code, rule) {
  return dbQuery('updateNotificationRuleByCode', () => db.tx(async t => {
    const existing = await t.oneOrNone(`SELECT id FROM notification_rules WHERE rule_code = $(code)`, { code });
    if (!existing) return false;
    await t.none(
      `UPDATE notification_rules SET name = $(name), status = $(status), email_subject = $(subject), email_body = $(body) WHERE id = $(id)`,
      { id: existing.id, name: rule.name, status: rule.status !== false, subject: rule.subject, body: rule.body }
    );
    await t.none(`DELETE FROM notification_conditions WHERE rule_id = $(id)`, { id: existing.id });
    await t.none(`DELETE FROM notification_personas WHERE rule_id = $(id)`, { id: existing.id });
    await insertNotificationChildren(t, existing.id, rule);
    return true;
  }));
}

/**
 * Toggle just the active status of a rule (by code). Returns rows affected.
 */
export async function updateNotificationStatusByCodeDB(code, status) {
  return dbQuery('updateNotificationStatus', () => db.result(
    `UPDATE notification_rules SET status = $(status) WHERE rule_code = $(code)`,
    { code, status: !!status }, r => r.rowCount
  ));
}

/**
 * Delete a notification rule by code (children cascade). Returns rows affected.
 */
export async function deleteNotificationRuleByCodeDB(code) {
  return dbQuery('deleteNotificationRule', () => db.result(
    `DELETE FROM notification_rules WHERE rule_code = $(code)`, { code }, r => r.rowCount
  ));
}

// =========================================================
// SLA RUNTIME  (Schema.md TABLE 15 — ticket_sla_timers)
// Implements SLA_FLOW_DOCUMENTATION.md end to end:
//   Ticketing Rule lookup -> SLA Assignment lookup -> SLA Rule lookup -> timers.
// Two timers per ticket: Initial Review (starts at creation, status = New)
// and Completion Due (starts once status = Under Process). PAUSE on
// Pending Employee/Pending Third Party, STOP on Completed/Closed.
// =========================================================

const SLA_PAUSE_STATUSES = ['Pending Employee', 'Pending Third Party'];
const SLA_STOP_STATUSES = ['Completed', 'Closed'];

/** Find the ticketing_rules match for (entity, class, category, subcategory) -> { groupId, priority }. */
export async function getTicketingRuleByComboDB(entityId, employeeClass, categoryId, subcategoryId) {
  return dbQuery('getTicketingRuleByCombo', async () => {
    const row = await db.oneOrNone(`
      SELECT group_id, priority FROM ticketing_rules
      WHERE entity_id = $(entityId) AND employee_class = $(employeeClass)
        AND category_id = $(categoryId) AND subcategory_id = $(subcategoryId)
    `, { entityId, employeeClass, categoryId, subcategoryId });
    return row ? { groupId: row.group_id, priority: row.priority } : null;
  });
}

/** Find the sla_assignments match for (entity, class, category, subcategory) -> { policyId, slaId }. */
export async function getSlaAssignmentByComboDB(entityId, employeeClass, categoryId, subcategoryId) {
  return dbQuery('getSlaAssignmentByCombo', async () => {
    const row = await db.oneOrNone(`
      SELECT a.policy_id, p.sla_id FROM sla_assignments a
      JOIN sla_policies p ON p.id = a.policy_id
      WHERE a.entity_id = $(entityId) AND a.employee_class = $(employeeClass)
        AND a.category_id = $(categoryId) AND a.subcategory_id = $(subcategoryId)
    `, { entityId, employeeClass, categoryId, subcategoryId });
    return row ? { policyId: row.policy_id, slaId: row.sla_id } : null;
  });
}

/** Raw sla_rules row (value/unit/timeType/operating hours) for (policy, priority, type), or null. */
async function getSlaRuleRowDB(policyId, priority, slaType) {
  return db.oneOrNone(`${SLA_RULE_SELECT} WHERE p.id = $(policyId) AND r.priority = $(priority) AND r.sla_type = $(slaType)`, { policyId, priority, slaType });
}

// Insert one ticket_sla_timers row, computing due_at from the matched sla_rules row. Returns the created row.
// Snapshots the rule's operating hours onto the timer row itself (oh_* columns) — pause/resume
// and priority-resync math need real business-hours data on the timer, not just a dangling
// sla_rule_id (which is nullable and only kept for traceability, per Schema.md).
async function insertTicketSlaTimerDB(t, ticketId, ruleRow, timerType, startAt) {
  const minutes = toMinutes(ruleRow.response_time_value, ruleRow.response_time_unit);
  const operatingHours = operatingHoursFromRuleRow(ruleRow);
  const dueAt = computeDueAt({ from: startAt, minutes, timeType: ruleRow.time_type, operatingHours });
  const ohColumns = SLA_DAYS.map(d => `oh_${d}_enabled, oh_${d}_start, oh_${d}_end`).join(', ');
  const ohPlaceholders = SLA_DAYS.map(d => `$(oh_${d}_enabled), $(oh_${d}_start), $(oh_${d}_end)`).join(', ');
  const ohParams = {};
  for (const d of SLA_DAYS) {
    ohParams[`oh_${d}_enabled`] = !!ruleRow[`oh_${d}_enabled`];
    ohParams[`oh_${d}_start`] = ruleRow[`oh_${d}_start`] || null;
    ohParams[`oh_${d}_end`] = ruleRow[`oh_${d}_end`] || null;
  }
  return t.one(`
    INSERT INTO ticket_sla_timers(
      ticket_id, sla_rule_id, timer_type, response_time_value, response_time_unit, time_type,
      ${ohColumns},
      state, started_at, due_at
    ) VALUES(
      $(ticketId), $(ruleId), $(timerType), $(value), $(unit), $(timeType),
      ${ohPlaceholders},
      'running', $(startAt), $(dueAt)
    )
    RETURNING *
  `, {
    ticketId, ruleId: ruleRow.id, timerType,
    value: ruleRow.response_time_value, unit: ruleRow.response_time_unit, timeType: ruleRow.time_type,
    startAt, dueAt, ...ohParams,
  });
}

/**
 * Resolve the SLA policy for a new ticket and activate its Initial Review timer.
 * Also stamps tickets.sla_policy_id and syncs tickets.sla_deadline to the timer's due_at.
 * No-op (returns null) if no sla_assignments row matches this combo.
 * @param {object} p - { ticketId, entityId, employeeClass, categoryId, subcategoryId, priority }
 */
export async function activateInitialReviewTimerDB(p) {
  return dbQuery('activateInitialReviewTimer', () => db.tx(async t => {
    const assignment = await t.oneOrNone(`
      SELECT a.policy_id FROM sla_assignments a
      WHERE a.entity_id = $(entityId) AND a.employee_class = $(employeeClass)
        AND a.category_id = $(categoryId) AND a.subcategory_id = $(subcategoryId)
    `, p);
    if (!assignment) return null;

    const ruleRow = await t.oneOrNone(`${SLA_RULE_SELECT} WHERE p.id = $(policyId) AND r.priority = $(priority) AND r.sla_type = 'Initial Review'`, {
      policyId: assignment.policy_id, priority: p.priority,
    });
    if (!ruleRow) return null;

    const timer = await insertTicketSlaTimerDB(t, p.ticketId, ruleRow, 'Initial Review', new Date());
    await t.none(`UPDATE tickets SET sla_policy_id = $(policyId), sla_deadline = $(dueAt) WHERE ticket_id = $(ticketId)`, {
      policyId: assignment.policy_id, dueAt: timer.due_at, ticketId: p.ticketId,
    });
    return timer;
  }));
}

// Mark a running/paused timer row as resolved: 'breached' if its due_at has passed, else 'met'.
async function resolveTimerDB(t, timer, now) {
  const breached = new Date(timer.due_at) < now;
  await t.none(`
    UPDATE ticket_sla_timers SET state = $(state), satisfied_at = $(now), breached = $(breached),
      paused_at = NULL
    WHERE id = $(id)
  `, { id: timer.id, state: breached ? 'breached' : 'met', now, breached });
}

/**
 * Advance a ticket's SLA timers after its status changed. Call AFTER the status
 * column itself has already been updated. `ticket` must be the row fetched
 * BEFORE the update (so ticket.internal_status is the old status).
 */
export async function advanceTicketSlaOnStatusChangeDB(ticket, newStatus) {
  const oldStatus = ticket.internal_status;
  if (oldStatus === newStatus) return;

  return dbQuery('advanceTicketSlaOnStatusChange', () => db.tx(async t => {
    const now = new Date();
    const timers = await t.manyOrNone(`SELECT * FROM ticket_sla_timers WHERE ticket_id = $(ticketId)`, { ticketId: ticket.ticket_id });
    const initialReview = timers.find(x => x.timer_type === 'Initial Review');
    const completionDue = timers.find(x => x.timer_type === 'Completion Due');

    if (SLA_STOP_STATUSES.includes(newStatus)) {
      for (const timer of timers) {
        if (timer.state === 'running') {
          await resolveTimerDB(t, timer, now);
        } else if (timer.state === 'paused') {
          // The clock was frozen at paused_at (doc: "Timer PAUSED: stops counting, does NOT
          // reset"). Check breach against that frozen instant, not the current time — otherwise
          // a ticket paused for days and then closed/completed gets falsely marked breached.
          await resolveTimerDB(t, timer, timer.paused_at ? new Date(timer.paused_at) : now);
        }
      }
    } else if (SLA_PAUSE_STATUSES.includes(newStatus)) {
      for (const timer of timers) {
        if (timer.state === 'running') {
          await t.none(`UPDATE ticket_sla_timers SET state = 'paused', paused_at = $(now) WHERE id = $(id)`, { id: timer.id, now });
        }
      }
    } else {
      // Leaving a paused state (e.g. back to Under Process) -> resume by shifting due_at
      // forward by however much SLA-countable time the pause window overlapped.
      for (const timer of timers) {
        if (timer.state === 'paused' && timer.paused_at) {
          const operatingHours = operatingHoursFromRuleRow(timer);
          const shiftMinutes = elapsedWorkingMinutes({
            from: new Date(timer.paused_at), to: now, timeType: timer.time_type, operatingHours,
          });
          const newDueAt = timer.time_type === 'Calendar Time'
            ? new Date(new Date(timer.due_at).getTime() + shiftMinutes * 60000)
            : computeDueAt({ from: new Date(timer.due_at), minutes: shiftMinutes, timeType: timer.time_type, operatingHours });
          const pausedMs = now.getTime() - new Date(timer.paused_at).getTime();
          await t.none(`
            UPDATE ticket_sla_timers SET state = 'running', paused_at = NULL,
              paused_ms = paused_ms + $(pausedMs), due_at = $(dueAt)
            WHERE id = $(id)
          `, { id: timer.id, pausedMs, dueAt: newDueAt });
        }
      }

      // First move into Under Process: settle Initial Review, activate Completion Due.
      if (newStatus === 'Under Process' && !completionDue) {
        if (initialReview && (initialReview.state === 'running' || initialReview.state === 'paused')) {
          await resolveTimerDB(t, initialReview, now);
        }
        if (ticket.sla_policy_id) {
          const ruleRow = await t.oneOrNone(
            `${SLA_RULE_SELECT} WHERE p.id = $(policyId) AND r.priority = $(priority) AND r.sla_type = 'Completion Due'`,
            { policyId: ticket.sla_policy_id, priority: ticket.priority }
          );
          if (ruleRow) {
            const timer = await insertTicketSlaTimerDB(t, ticket.ticket_id, ruleRow, 'Completion Due', now);
            await t.none(`UPDATE tickets SET sla_deadline = $(dueAt) WHERE ticket_id = $(ticketId)`, { dueAt: timer.due_at, ticketId: ticket.ticket_id });
          }
        }
      }
    }

    // Keep tickets.sla_deadline mirroring whichever timer is currently live.
    const refreshed = await t.manyOrNone(`SELECT * FROM ticket_sla_timers WHERE ticket_id = $(ticketId)`, { ticketId: ticket.ticket_id });
    const active = refreshed.find(x => x.timer_type === 'Completion Due') || refreshed.find(x => x.timer_type === 'Initial Review');
    if (active) {
      await t.none(`UPDATE tickets SET sla_deadline = $(dueAt) WHERE ticket_id = $(ticketId)`, { dueAt: active.due_at, ticketId: ticket.ticket_id });
    }
  }));
}

/**
 * Rebase a ticket's still-open SLA timers (Initial Review / Completion Due, whichever are
 * running or paused) onto a new priority's sla_rules row after the ticket's priority changes.
 *
 * Recomputes due_at from how much SLA-countable time the timer has already consumed under its
 * OLD rule, projected onto the NEW rule's budget — deliberately NOT from "now" (that would let
 * re-prioritizing reset the clock and dodge an imminent breach) and NOT from scratch (that would
 * ignore time already spent). A ticket escalated to a tighter priority can come out of this
 * already overdue — that's correct: it reflects what the deadline would have been if it had
 * always had this priority.
 *
 * No-op if the ticket has no sla_policy_id (no real SLA assignment matched at creation — nothing
 * to rebase against), if it has no open timers, or if the new priority has no rule configured
 * under the same policy (leaves the existing timer(s) untouched rather than guessing).
 */
export async function resyncTicketSlaTimersForPriorityDB(ticketId, newPriority) {
  return dbQuery('resyncTicketSlaTimersForPriority', () => db.tx(async t => {
    const ticket = await t.oneOrNone(`SELECT sla_policy_id FROM tickets WHERE ticket_id = $(ticketId)`, { ticketId });
    if (!ticket || !ticket.sla_policy_id) return null;

    const timers = await t.manyOrNone(
      `SELECT * FROM ticket_sla_timers WHERE ticket_id = $(ticketId) AND state IN ('running', 'paused')`,
      { ticketId }
    );
    if (!timers.length) return null;

    const now = new Date();
    for (const timer of timers) {
      const newRuleRow = await t.oneOrNone(
        `${SLA_RULE_SELECT} WHERE p.id = $(policyId) AND r.priority = $(priority) AND r.sla_type = $(slaType)`,
        { policyId: ticket.sla_policy_id, priority: newPriority, slaType: timer.timer_type }
      );
      if (!newRuleRow) continue; // no rule configured for this priority/type under this policy — leave the timer as-is

      // The clock isn't advancing right now if the timer is paused — use the moment it stopped.
      const referenceNow = timer.state === 'paused' && timer.paused_at ? new Date(timer.paused_at) : now;

      const oldMinutes = toMinutes(timer.response_time_value, timer.response_time_unit);
      const oldOperatingHours = operatingHoursFromRuleRow(timer);
      // Minutes left between the reference point and the OLD due_at. Since due_at already
      // reflects every prior pause/resume shift, this nets out consumed-vs-remaining for free —
      // no need to reconstruct pause history.
      const remainingOldMinutes = elapsedWorkingMinutes({
        from: referenceNow, to: new Date(timer.due_at), timeType: timer.time_type, operatingHours: oldOperatingHours,
      });
      const consumedMinutes = Math.max(0, oldMinutes - remainingOldMinutes);

      const newMinutes = toMinutes(newRuleRow.response_time_value, newRuleRow.response_time_unit);
      const newOperatingHours = operatingHoursFromRuleRow(newRuleRow);
      const remainingNewMinutes = newMinutes - consumedMinutes;
      const newDueAt = computeDueAt({
        from: referenceNow, minutes: remainingNewMinutes, timeType: newRuleRow.time_type, operatingHours: newOperatingHours,
      });

      const ohParams = {};
      for (const d of SLA_DAYS) {
        ohParams[`oh_${d}_enabled`] = !!newRuleRow[`oh_${d}_enabled`];
        ohParams[`oh_${d}_start`] = newRuleRow[`oh_${d}_start`] || null;
        ohParams[`oh_${d}_end`] = newRuleRow[`oh_${d}_end`] || null;
      }
      const ohSet = SLA_DAYS.map(d => `oh_${d}_enabled = $(oh_${d}_enabled), oh_${d}_start = $(oh_${d}_start), oh_${d}_end = $(oh_${d}_end)`).join(', ');

      await t.none(`
        UPDATE ticket_sla_timers
        SET sla_rule_id = $(ruleId), response_time_value = $(value), response_time_unit = $(unit),
            time_type = $(timeType), due_at = $(dueAt), ${ohSet}
        WHERE id = $(id)
      `, {
        id: timer.id, ruleId: newRuleRow.id, value: newRuleRow.response_time_value, unit: newRuleRow.response_time_unit,
        timeType: newRuleRow.time_type, dueAt: newDueAt, ...ohParams,
      });
    }

    // Keep tickets.sla_deadline mirroring whichever timer is currently live (same pattern as
    // advanceTicketSlaOnStatusChangeDB's final sync step).
    const refreshed = await t.manyOrNone(`SELECT * FROM ticket_sla_timers WHERE ticket_id = $(ticketId)`, { ticketId });
    const active = refreshed.find(x => x.timer_type === 'Completion Due') || refreshed.find(x => x.timer_type === 'Initial Review');
    if (active) {
      await t.none(`UPDATE tickets SET sla_deadline = $(dueAt) WHERE ticket_id = $(ticketId)`, { dueAt: active.due_at, ticketId });
    }
    return true;
  }));
}

/** Get both SLA timer rows for a ticket (Initial Review + Completion Due, whichever exist). */
export async function getTicketSlaTimersDB(ticketId) {
  return dbQuery('getTicketSlaTimers', () => db.manyOrNone(
    `SELECT * FROM ticket_sla_timers WHERE ticket_id = $(ticketId) ORDER BY id ASC`, { ticketId }
  ));
}
