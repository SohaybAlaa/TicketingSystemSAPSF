```sql

-- #1- tickets table
-- Drop the existing table if it exists (CASCADE also drops dependent objects like FKs)
DROP TABLE IF EXISTS tickets CASCADE;

-- Main tickets table: stores all support/leave requests submitted by employees
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,                          -- Auto-increment internal PK
    ticket_id VARCHAR(50) UNIQUE NOT NULL,          -- Human-readable ticket ID (e.g. VT-01, EPT-01)
    title VARCHAR(255) NOT NULL,                    -- Short description of the request (e.g. Annual leave)
    category VARCHAR(100) NOT NULL,                 -- Ticket category (e.g. Leave & Attendance, HR Policies)
    subcategory VARCHAR(100),                        -- Subcategory within the category (e.g. vacation, medical, inquiry)
    reason TEXT,                                     -- Free-text reason or additional details provided by the requester

    -- Employee info (no FK since employees are external)
    employee_id VARCHAR(50) NOT NULL,               -- SAP employee ID
    employee_name VARCHAR(255),                     -- Full name
    employee_email VARCHAR(255),                    -- Work email
    employee_department VARCHAR(100),               -- Department 
    employee_position VARCHAR(100),                 -- Job title
    employee_location VARCHAR(100),                 -- Office location

    -- Assignment (HR staff handling this ticket)
    assigned_to_user_id VARCHAR(50),                -- HR staff SAP user ID (no FK enforced, comes from SAP)
    assigned_to_user_name VARCHAR(255),             -- HR staff full name 
    assigned_to_user_email VARCHAR(255),            -- HR staff email
    assigned_to_team VARCHAR(100),                  -- HR team name (e.g. Alpha, Beta)
    assigned_to_department VARCHAR(100),            -- HR department (e.g. HR Operations, Benefits)
    vacation_type_id INT,                           -- SAP vacation type ID (nullable, used for leave tickets)

    -- Who raised this ticket (employee themselves via self-service, or HR staff on their behalf)
    raised_by VARCHAR(20) DEFAULT 'employee' CHECK (raised_by IN ('employee', 'hr_staff')),
    raised_by_id VARCHAR(50),                         -- SAP user ID of whoever raised the ticket
    raised_by_name VARCHAR(255),                      -- Full name of whoever raised the ticket
    raised_by_email VARCHAR(255),                     -- Email of whoever raised the ticket

    -- Status & Priority 

    -- Ticket urgency level, defaults to Medium
    priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
    
    --  Current workflow status of the ticket
    internal_status VARCHAR(30) NOT NULL DEFAULT 'New' CHECK (internal_status IN ('Pending Employee', 'Pending Third Party', 'Under Process', 'Closed', 'Completed', 'New')),
    
    -- SAP-side approval status (null if not yet submitted to SAP)
    sap_status VARCHAR(20) CHECK (sap_status IN ('pending', 'approved', 'rejected', 'cancelled')),
    

    -- Leave details (only for leave/attendance tickets)
    start_date DATE,                                -- Leave start date
    end_date DATE,                                  -- Leave end date
    start_time TIME,                                -- Start time (for partial-day leaves)
    end_time TIME,                                  -- End time (for partial-day leaves)

    -- SAP integration
    sap_external_code TEXT UNIQUE,                  -- SAP external code returned after submission

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),           -- When the ticket was created
    updated_at TIMESTAMPTZ DEFAULT NOW(),           -- Last update time (should be updated via trigger or app)
    resolved_at TIMESTAMPTZ,                        -- When the ticket was resolved (null if still open)
    sla_deadline TIMESTAMPTZ NOT NULL,              -- SLA due date — ticket is breached if unresolved after this

    CONSTRAINT valid_date_range CHECK (end_date >= start_date) -- Ensures end date is not before start date
);

-- Sample data inserts
INSERT INTO tickets (
    ticket_id, title, category, subcategory, reason,
    employee_id, employee_name, employee_email, employee_department, employee_position, employee_location,
    assigned_to_user_id, assigned_to_user_name, assigned_to_user_email, assigned_to_team, assigned_to_department,
    vacation_type_id, priority, internal_status, sap_status,
    start_date, end_date, start_time, end_time,
    sap_external_code, created_at, updated_at, resolved_at, sla_deadline
)
VALUES
-- ==================== VT TICKETS ====================
('VT-01', 'Summer vacation 2026', 'Leave & Attendance', 'vacation', 'Planning a summer getaway with family',
 'EMP001', 'Sarah Johnson', 'sarah.johnson@company.com', 'Engineering', 'Senior Developer', 'New York',
 '101', 'John Doe', 'john.doe@company.com', 'Alpha', 'HR Operations',
 1, 'High', 'Pending Employee', 'pending',
 '2026-07-15', '2026-07-29', NULL, NULL,
 'EmployeeTime/externalCode=a11aa11aa11a11a1a11aa1a111aaa111',
 '2026-04-06 09:00:00 +0200', '2026-04-06 09:30:00 +0200', NULL,
 '2026-04-13 09:00:00 +0200'),

-- ==================== EPT TICKETS ====================
('EPT-01', 'Dental emergency appointment', 'Leave & Attendance', 'medical', 'Sudden tooth abscess, needs immediate treatment',
 'EMP011', 'Jennifer Brown', 'jennifer.brown@company.com', 'Engineering', 'Backend Developer', 'New York',
 '103', 'William Smith', 'william.smith@company.com', 'Alpha', 'HR Operations',
 NULL, 'Critical', 'Completed', 'approved',
 '2026-04-17', '2026-04-17', '10:00:00', '15:00:00',
 'EmployeeTime/externalCode=k11kk11kk11k11k1k11kk1k111kkk111',
 '2026-04-06 08:30:00 +0200', '2026-04-06 09:00:00 +0200', '2026-04-06 09:15:00 +0200',
 '2026-04-13 08:30:00 +0200'),

-- ==================== ST TICKETS ====================
('ST-01', 'Payroll inquiry - missing bonus', 'HR Policies', 'inquiry', 'Expected Q1 bonus not reflected in March payslip',
 'EMP021', 'Yuki Tanaka', 'yuki.tanaka@company.com', 'Engineering', 'Frontend Developer', 'New York',
 '101', 'John Doe', 'john.doe@company.com', 'Alpha', 'HR Operations',
 NULL, 'High', 'Under Process', NULL,
 NULL, NULL, NULL, NULL, NULL,
 '2026-04-05 10:00:00 +0200', '2026-04-06 09:00:00 +0200', NULL,
 '2026-04-12 10:00:00 +0200'),

select * from tickets; -- Verify all inserted rows

#2- communcation table

DROP TABLE IF EXISTS ticket_communications CASCADE;

-- Communication table for messages between employees and HR
CREATE TABLE ticket_communications (
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(50) NOT NULL,
    message_text TEXT NOT NULL,

    -- Sender information (could be employee or HR staff)
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('employee', 'hr_staff')),

    -- Employee info (when sender is employee)
    employee_id VARCHAR(50),
    employee_name VARCHAR(255),
    employee_email VARCHAR(255),
    employee_department VARCHAR(100),

    -- HR Staff info (when sender is HR)
    hr_user_id VARCHAR(50),                          -- HR staff SAP user ID
    hr_user_name VARCHAR(255),
    hr_user_email VARCHAR(255),
    hr_department VARCHAR(100),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Foreign key
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,

    -- Ensure proper sender info is provided
    CONSTRAINT valid_sender_info CHECK (
        (sender_type = 'employee' AND employee_id IS NOT NULL) OR
        (sender_type = 'hr_staff' AND hr_user_id IS NOT NULL)
    )
);

-- Test data for ticket_communications

-- Employee message (for ticket ST-01 from your tickets table)
INSERT INTO ticket_communications (
    ticket_id, message_text, sender_type,
    employee_id, employee_name, employee_email, employee_department
) VALUES (
    'ST-01', 
    'Hi, I need clarification on the health insurance coverage for dental procedures. Are routine cleanings covered?',
    'employee',
    'EMP003', 'Michael Chen', 'michael.chen@company.com', 'Finance'
);

-- HR Staff reply
INSERT INTO ticket_communications (
    ticket_id, message_text, sender_type,
    hr_user_id, hr_user_name, hr_user_email, hr_department
) VALUES (
    'ST-01',
    'Hello Michael, yes, routine dental cleanings are covered under our basic health insurance plan. You can schedule up to 2 cleanings per year at no cost. Would you like me to send you the full dental benefits document?',
    'hr_staff',
    'HR003', 'William Smith', 'william.smith@company.com', 'Benefits'
);

-- Employee follow-up
INSERT INTO ticket_communications (
    ticket_id, message_text, sender_type,
    employee_id, employee_name, employee_email, employee_department
) VALUES (
    'ST-01',
    'Yes please! That would be very helpful. Also, what about orthodontic coverage?',
    'employee',
    'EMP003', 'Michael Chen', 'michael.chen@company.com', 'Finance'
);


-- View the created table
SELECT * FROM ticket_communications;


#3- attachments table

DROP TABLE IF EXISTS ticket_attachments CASCADE;
-- Attachments table for files uploaded to tickets
CREATE TABLE ticket_attachments (
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(50) NOT NULL,
    
    -- File information
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL UNIQUE,
    file_size_bytes BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL, -- MIME type (e.g., 'image/png', 'application/pdf')
    file_path TEXT NOT NULL,
    
    -- Upload metadata
    uploaded_by_type VARCHAR(20) NOT NULL CHECK (uploaded_by_type IN ('employee', 'hr_staff')),
    uploaded_by_name VARCHAR(255) NOT NULL,
    uploaded_by_id VARCHAR(50), -- employee_id or hr_user_id
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign key
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE
);

INSERT INTO ticket_attachments (
    ticket_id, original_filename, stored_filename, file_size_bytes, 
    file_type, file_path, uploaded_by_type, uploaded_by_name, uploaded_by_id
) VALUES (
    'ST-01',
    'image_2025-11-01_22-23-04.png',
    'test5_klenka_com_1763314274517.png',
    87434,
    'image/png',
    '/uploads/vacation_attachments/test5_klenka_com_1763314274517.png',
    'employee',
    'John Doe',
    'EMP999'
);

select * from ticket_attachments;


#4- internal notes table

DROP TABLE IF EXISTS ticket_internal_notes CASCADE;
-- Internal Notes table for HR staff communication (not visible to employees)
CREATE TABLE ticket_internal_notes (
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(50) NOT NULL,
    note_text TEXT NOT NULL,
    
    -- HR Staff info (only HR can create internal notes)
    hr_user_id VARCHAR(50) NOT NULL,               -- HR staff SAP user ID
    hr_user_name VARCHAR(255) NOT NULL,
    hr_user_email VARCHAR(255) NOT NULL,
    hr_department VARCHAR(100),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign key
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE
);

-- Internal note between HR staff
INSERT INTO ticket_internal_notes (
    ticket_id, note_text,
    hr_user_id, hr_user_name, hr_user_email, hr_department
) VALUES (
    'ST-01',
    'Michael has been asking a lot of questions about benefits lately. Might want to schedule a 1-on-1 benefits review session with him.',
    'HR003', 'William Smith', 'william.smith@company.com', 'Benefits'
);

-- Another HR staff adds a note
INSERT INTO ticket_internal_notes (
    ticket_id, note_text,
    hr_user_id, hr_user_name, hr_user_email, hr_department
) VALUES (
    'ST-01',
    'Good idea. I noticed he recently got married (life event in SAP). That might explain the increased interest in coverage details. I''ll reach out.',
    'HR002', 'Tommy Shelby', 'tommy.shelby@company.com', 'HR Operations'
);

-- View all internal notes for a ticket
SELECT * FROM ticket_internal_notes;

#5- activity log table

-- Activity log for tracking status, priority, and assignment changes
DROP TABLE IF EXISTS ticket_activity_log CASCADE;

CREATE TABLE ticket_activity_log (
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(50) NOT NULL,

    -- Type of change: 'status', 'priority', 'assignment'
    change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('status', 'priority', 'assignment')),

    -- Old and new values
    old_value VARCHAR(255),
    new_value VARCHAR(255),

    -- Who made the change
    changed_by_type VARCHAR(20) NOT NULL CHECK (changed_by_type IN ('employee', 'hr_staff')),
    changed_by_id VARCHAR(50),                      -- SAP user ID of who made the change (employee_id or hr_user_id)
    changed_by_name VARCHAR(255) NOT NULL,
    changed_by_email VARCHAR(255),
    changed_by_department VARCHAR(100),

    -- Timestamp
    changed_at TIMESTAMPTZ DEFAULT NOW(),

    -- Foreign key
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE
);

-- Sample activity log data for VT-01
INSERT INTO ticket_activity_log (ticket_id, change_type, old_value, new_value, changed_by_type, changed_by_id, changed_by_name, changed_by_email, changed_by_department, changed_at)
VALUES
-- Initial creation (by employee)
('VT-01', 'status', NULL, 'New', 'employee', NULL, 'John Smith', 'john.smith@company.com', 'Engineering', '2026-02-12 08:00:00 +0200'),
('VT-01', 'priority', NULL, 'Medium', 'employee', NULL, 'John Smith', 'john.smith@company.com', 'Engineering', '2026-02-12 08:00:00 +0200'),
('VT-01', 'assignment', NULL, 'John Doe', 'employee', NULL, 'John Smith', 'john.smith@company.com', 'Engineering', '2026-02-12 08:00:00 +0200'),
-- Subsequent changes
('VT-01', 'status', 'New', 'Under Process', 'hr_staff', 'HR001', 'John Doe', 'john.doe@company.com', 'HR Operations', '2026-02-12 09:30:00 +0200'),
('VT-01', 'priority', 'Medium', 'High', 'hr_staff', 'HR001', 'John Doe', 'john.doe@company.com', 'HR Operations', '2026-02-12 10:15:00 +0200'),
('VT-01', 'assignment', 'John Doe', 'Tommy Shelby', 'hr_staff', 'HR001', 'John Doe', 'john.doe@company.com', 'HR Operations', '2026-02-12 11:00:00 +0200'),
('VT-01', 'status', 'Under Process', 'Pending Employee', 'hr_staff', 'HR002', 'Tommy Shelby', 'tommy.shelby@company.com', 'HR Operations', '2026-02-12 13:00:00 +0200'),
('VT-01', 'priority', 'High', 'Critical', 'hr_staff', 'HR002', 'Tommy Shelby', 'tommy.shelby@company.com', 'HR Operations', '2026-02-12 13:30:00 +0200'),
('VT-01', 'status', 'Pending Employee', 'Pending Third Party', 'hr_staff', 'HR002', 'Tommy Shelby', 'tommy.shelby@company.com', 'HR Operations', '2026-02-13 09:00:00 +0200'),
('VT-01', 'assignment', 'Tommy Shelby', 'William Smith', 'hr_staff', 'HR002', 'Tommy Shelby', 'tommy.shelby@company.com', 'HR Operations', '2026-02-13 09:15:00 +0200'),
('VT-01', 'status', 'Pending Third Party', 'Completed', 'hr_staff', 'HR003', 'William Smith', 'william.smith@company.com', 'Benefits', '2026-02-13 14:00:00 +0200'),
('VT-01', 'priority', 'Critical', 'Low', 'hr_staff', 'HR003', 'William Smith', 'william.smith@company.com', 'Benefits', '2026-02-13 14:00:00 +0200');

-- EPT-01: Initial creation + subsequent changes
INSERT INTO ticket_activity_log (ticket_id, change_type, old_value, new_value, changed_by_type, changed_by_id, changed_by_name, changed_by_email, changed_by_department, changed_at)
VALUES
-- Initial creation (by employee)
('EPT-01', 'status', NULL, 'New', 'employee', NULL, 'Sarah Johnson', 'sarah.johnson@company.com', 'Marketing', '2026-02-12 07:30:00 +0200'),
('EPT-01', 'priority', NULL, 'Critical', 'employee', NULL, 'Sarah Johnson', 'sarah.johnson@company.com', 'Marketing', '2026-02-12 07:30:00 +0200'),
('EPT-01', 'assignment', NULL, 'Tommy Shelby', 'employee', NULL, 'Sarah Johnson', 'sarah.johnson@company.com', 'Marketing', '2026-02-12 07:30:00 +0200'),
-- Subsequent changes
('EPT-01', 'status', 'New', 'Under Process', 'hr_staff', 'HR002', 'Tommy Shelby', 'tommy.shelby@company.com', 'HR Operations', '2026-02-12 08:15:00 +0200');

-- ST-01: Initial creation + subsequent changes
INSERT INTO ticket_activity_log (ticket_id, change_type, old_value, new_value, changed_by_type, changed_by_id, changed_by_name, changed_by_email, changed_by_department, changed_at)
VALUES
-- Initial creation (by employee)
('ST-01', 'status', NULL, 'New', 'employee', NULL, 'Michael Chen', 'michael.chen@company.com', 'Finance', '2026-02-11 16:00:00 +0200'),
('ST-01', 'priority', NULL, 'Medium', 'employee', NULL, 'Michael Chen', 'michael.chen@company.com', 'Finance', '2026-02-11 16:00:00 +0200'),
('ST-01', 'assignment', NULL, 'William Smith', 'employee', NULL, 'Michael Chen', 'michael.chen@company.com', 'Finance', '2026-02-11 16:00:00 +0200'),
-- Subsequent changes
('ST-01', 'status', 'New', 'Pending Employee', 'hr_staff', 'HR003', 'William Smith', 'william.smith@company.com', 'Benefits', '2026-02-11 16:30:00 +0200'),
('ST-01', 'assignment', 'William Smith', 'Tommy Shelby', 'hr_staff', 'HR003', 'William Smith', 'william.smith@company.com', 'Benefits', '2026-02-12 09:00:00 +0200');

SELECT * FROM ticket_activity_log;