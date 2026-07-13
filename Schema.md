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

    -- SLA linkage (flow Step 3 output): the resolved SLA policy for this ticket.
    -- Plain INT, app-enforced (no DB FK) — consistent with FIX #6, since
    -- sla_policies is defined later in this file (admin module).
    sla_policy_id INT,                              -- e.g. id of 'SLA-002'

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
('VT-01', 'Summer vacation 2026', 'Vacation Ticket Request', 'Annual Leave', 'Planning a summer getaway with family',
 'EMP-0001', 'Sara Al-Mansoori', 'sara.mansoori@klenkaegypt.com', 'HR & People Ops', 'HR Specialist', 'Cairo',
 '101', 'John Doe', 'john.doe@company.com', 'Alpha', 'HR Operations',
 1, 'Medium', 'Pending Employee', 'pending',
 '2026-07-15', '2026-07-29', NULL, NULL,
 'EmployeeTime/externalCode=a11aa11aa11a11a1a11aa1a111aaa111',
 '2026-04-06 09:00:00 +0200', '2026-04-06 09:30:00 +0200', NULL,
 '2026-04-06 13:00:00 +0200'),

-- ==================== EPT TICKETS ====================
('EPT-01', 'Dental emergency appointment', 'Exit Permission Ticket Request', 'Medical Appointment', 'Sudden tooth abscess, needs immediate treatment',
 'EMP-0003', 'Lina Tran', 'l.tran@klenkaegypt.com', 'IT & Systems', 'IT Support Engineer', 'Giza',
 '103', 'William Smith', 'william.smith@company.com', 'Alpha', 'HR Operations',
 NULL, 'High', 'Completed', 'approved',
 '2026-04-17', '2026-04-17', '10:00:00', '15:00:00',
 'EmployeeTime/externalCode=k11kk11kk11k11k1k11kk1k111kkk111',
 '2026-04-06 08:30:00 +0200', '2026-04-06 09:00:00 +0200', '2026-04-06 09:15:00 +0200',
 '2026-04-06 10:36:45 +0200'),

-- ==================== ST TICKETS ====================
('ST-01', 'Payroll inquiry - missing bonus', 'Support Ticket Request', 'General Inquiry', 'Expected Q1 bonus not reflected in March payslip',
 'EMP-0001', 'Sara Al-Mansoori', 'sara.mansoori@klenkaegypt.com', 'HR & People Ops', 'HR Specialist', 'Cairo',
 '101', 'John Doe', 'john.doe@company.com', 'Alpha', 'HR Operations',
 NULL, 'Low', 'Under Process', NULL,
 NULL, NULL, NULL, NULL, NULL,
 '2026-04-05 10:00:00 +0200', '2026-04-06 09:00:00 +0200', NULL,
 '2026-04-09 09:00:00 +0200'),

-- ==================== VT TICKETS (additional) ====================
('VT-02', 'Eid Al-Fitr family trip', 'Vacation Ticket Request', 'Annual Leave', 'Traveling to visit family for the holiday',
 'EMP-0002', 'Khalid Jaber', 'k.jaber@klenkauae.com', 'Finance', 'Finance Analyst', 'Dubai',
 '102', 'Tommy Shelby', 'tommy.shelby@company.com', 'Beta', 'HR Operations',
 1, 'Low', 'New', 'pending',
 '2026-05-10', '2026-05-14', NULL, NULL,
 'EmployeeTime/externalCode=b22bb22bb22b22b2b22bb2b222bbb222',
 '2026-05-01 09:00:00 +0200', '2026-05-01 09:00:00 +0200', NULL,
 '2026-05-03 12:00:00 +0200'),

('VT-03', 'Sick leave - flu recovery', 'Vacation Ticket Request', 'Sick Leave', 'Diagnosed with flu, doctor recommended 3 days rest',
 'EMP-0006', 'James Okafor', 'j.okafor@klenkauae.com', 'Sales', 'Sales Executive', 'Sharjah',
 '101', 'John Doe', 'john.doe@company.com', 'Alpha', 'HR Operations',
 2, 'Medium', 'Under Process', 'pending',
 '2026-05-12', '2026-05-14', NULL, NULL,
 'EmployeeTime/externalCode=c33cc33cc33c33c3c33cc3c333ccc333',
 '2026-05-11 08:00:00 +0200', '2026-05-11 08:30:00 +0200', NULL,
 '2026-05-13 08:30:00 +0200'),

('VT-04', 'Unpaid leave for personal matters', 'Vacation Ticket Request', 'Unpaid Leave', 'Need extended time off to handle a family matter',
 'EMP-0007', 'Aisha Benali', 'a.benali@klenkaegypt.com', 'Marketing', 'Marketing Specialist', 'Cairo',
 '103', 'William Smith', 'william.smith@company.com', 'Alpha', 'Benefits',
 3, 'Low', 'Pending Third Party', NULL,
 '2026-05-20', '2026-06-03', NULL, NULL,
 'EmployeeTime/externalCode=d44dd44dd44d44d4d44dd4d444ddd444',
 '2026-05-15 10:15:00 +0200', '2026-05-16 09:00:00 +0200', NULL,
 '2026-05-17 12:00:00 +0200'),

('VT-05', 'Winter holiday in the Alps', 'Vacation Ticket Request', 'Annual Leave', 'Booked a family ski trip',
 'EMP-0005', 'Nour Atassi', 'n.atassi@klenkaegypt.com', 'Legal', 'Legal Advisor', 'Alexandria',
 '102', 'Tommy Shelby', 'tommy.shelby@company.com', 'Beta', 'HR Operations',
 1, 'Medium', 'Completed', 'approved',
 '2026-01-20', '2026-01-27', NULL, NULL,
 'EmployeeTime/externalCode=e55ee55ee55e55e5e55ee5e555eee555',
 '2026-01-10 09:00:00 +0200', '2026-01-11 10:00:00 +0200', '2026-01-11 10:00:00 +0200',
 '2026-01-12 16:00:00 +0200'),

('VT-06', 'Medical leave - minor surgery recovery', 'Vacation Ticket Request', 'Sick Leave', 'Scheduled minor surgery, needs recovery time',
 'EMP-0006', 'James Okafor', 'j.okafor@klenkauae.com', 'Sales', 'Sales Executive', 'Sharjah',
 '103', 'William Smith', 'william.smith@company.com', 'Alpha', 'Benefits',
 2, 'Medium', 'Completed', 'approved',
 '2026-02-05', '2026-02-12', NULL, NULL,
 'EmployeeTime/externalCode=f66ff66ff66f66f6f66ff6f666fff666',
 '2026-02-01 08:00:00 +0200', '2026-02-02 09:00:00 +0200', '2026-02-02 09:00:00 +0200',
 '2026-02-03 09:00:00 +0200'),

('VT-07', 'Extended unpaid leave request', 'Vacation Ticket Request', 'Unpaid Leave', 'Requesting unpaid leave to relocate family',
 'EMP-0007', 'Aisha Benali', 'a.benali@klenkaegypt.com', 'Marketing', 'Marketing Specialist', 'Cairo',
 '101', 'John Doe', 'john.doe@company.com', 'Alpha', 'HR Operations',
 3, 'Low', 'Closed', 'rejected',
 '2026-03-01', '2026-03-31', NULL, NULL,
 'EmployeeTime/externalCode=g77gg77gg77g77g7g77gg7g777ggg777',
 '2026-02-20 11:00:00 +0200', '2026-02-25 09:00:00 +0200', '2026-02-25 09:00:00 +0200',
 '2026-02-23 16:00:00 +0200'),

('VT-08', 'National Day long weekend', 'Vacation Ticket Request', 'Annual Leave', 'Taking advantage of the long weekend to travel',
 'EMP-0010', 'Tom Fischer', 't.fischer@klenkauae.com', 'Operations', 'Operations Coordinator', 'Abu Dhabi',
 '102', 'Tommy Shelby', 'tommy.shelby@company.com', 'Beta', 'HR Operations',
 1, 'Low', 'New', 'pending',
 '2026-12-01', '2026-12-03', NULL, NULL,
 'EmployeeTime/externalCode=h88hh88hh88h88h8h88hh8h888hhh888',
 '2026-06-10 09:30:00 +0200', '2026-06-10 09:30:00 +0200', NULL,
 '2026-06-10 13:30:00 +0200'),

('VT-09', 'Flu symptoms - doctor recommended rest', 'Vacation Ticket Request', 'Sick Leave', 'Fever and flu symptoms, doctor advised 2 days rest',
 'EMP-0012', 'Carlos Mendez', 'c.mendez@klenkauae.com', 'Sales', 'Sales Executive', 'Sharjah',
 '103', 'William Smith', 'william.smith@company.com', 'Alpha', 'Benefits',
 2, 'Medium', 'Pending Employee', 'pending',
 '2026-06-18', '2026-06-19', NULL, NULL,
 'EmployeeTime/externalCode=i99ii99ii99i99i9i99ii9i999iii999',
 '2026-06-17 07:45:00 +0200', '2026-06-17 08:00:00 +0200', NULL,
 '2026-06-17 12:00:00 +0200'),

('VT-10', 'Unpaid leave to relocate', 'Vacation Ticket Request', 'Unpaid Leave', 'Relocating households, needs a full week off',
 'EMP-0007', 'Aisha Benali', 'a.benali@klenkaegypt.com', 'Marketing', 'Marketing Specialist', 'Cairo',
 '101', 'John Doe', 'john.doe@company.com', 'Alpha', 'HR Operations',
 3, 'Low', 'Under Process', 'pending',
 '2026-07-01', '2026-07-07', NULL, NULL,
 'EmployeeTime/externalCode=j00jj00jj00j00j0j00jj0j000jjj000',
 '2026-06-25 13:00:00 +0200', '2026-06-26 09:00:00 +0200', NULL,
 '2026-06-29 16:00:00 +0200'),

-- ==================== EPT TICKETS (additional) ====================
('EPT-02', 'Bank appointment for loan paperwork', 'Exit Permission Ticket Request', 'Personal Errand', 'Need to sign loan documents in person before noon',
 'EMP-0005', 'Nour Atassi', 'n.atassi@klenkaegypt.com', 'Legal', 'Legal Advisor', 'Alexandria',
 '102', 'Tommy Shelby', 'tommy.shelby@company.com', 'Beta', 'HR Operations',
 NULL, 'Low', 'Completed', 'approved',
 '2026-05-05', '2026-05-05', '10:00:00', '12:00:00',
 'EmployeeTime/externalCode=k11kl11kl11k11k1l11kl1k111lll111',
 '2026-05-04 09:00:00 +0200', '2026-05-05 12:30:00 +0200', '2026-05-05 12:30:00 +0200',
 '2026-05-07 10:00:00 +0200'),

('EPT-03', 'Follow-up doctor visit', 'Exit Permission Ticket Request', 'Medical Appointment', 'Post-surgery follow-up checkup',
 'EMP-0010', 'Tom Fischer', 't.fischer@klenkauae.com', 'Operations', 'Operations Coordinator', 'Abu Dhabi',
 '103', 'William Smith', 'william.smith@company.com', 'Alpha', 'Benefits',
 NULL, 'Medium', 'Completed', 'approved',
 '2026-05-18', '2026-05-18', '09:00:00', '11:00:00',
 'EmployeeTime/externalCode=l22lm22lm22l22l2m22lm2l222mmm222',
 '2026-05-17 08:00:00 +0200', '2026-05-18 11:30:00 +0200', '2026-05-18 11:30:00 +0200',
 '2026-05-18 09:00:00 +0200'),

('EPT-04', 'Client meeting downtown', 'Exit Permission Ticket Request', 'Business Trip', 'Attending an urgent client meeting outside the office',
 'EMP-0008', 'David Park', 'd.park@klenkauae.com', 'IT & Systems', 'IT Support Engineer', 'Dubai',
 '101', 'John Doe', 'john.doe@company.com', 'Alpha', 'HR Operations',
 NULL, 'Medium', 'Under Process', 'pending',
 '2026-05-22', '2026-05-22', '13:00:00', '17:00:00',
 'EmployeeTime/externalCode=m33mn33mn33m33m3n33mn3m333nnn333',
 '2026-05-22 09:00:00 +0200', '2026-05-22 09:15:00 +0200', NULL,
 '2026-05-24 12:00:00 +0200'),

('EPT-05', 'Passport renewal at embassy', 'Exit Permission Ticket Request', 'Personal Errand', 'Embassy only accepts appointments during work hours',
 'EMP-0009', 'Rania Mahmoud', 'r.mahmoud@klenkaegypt.com', 'Finance', 'Finance Analyst', 'Alexandria',
 '102', 'Tommy Shelby', 'tommy.shelby@company.com', 'Beta', 'HR Operations',
 NULL, 'Low', 'New', 'pending',
 '2026-06-02', '2026-06-02', '09:00:00', '12:00:00',
 'EmployeeTime/externalCode=n44no44no44n44n4o44no4n444ooo444',
 '2026-06-01 10:00:00 +0200', '2026-06-01 10:00:00 +0200', NULL,
 '2026-06-02 10:00:00 +0200'),

('EPT-06', 'Physiotherapy session', 'Exit Permission Ticket Request', 'Medical Appointment', 'Ongoing physiotherapy for back injury',
 'EMP-0002', 'Khalid Jaber', 'k.jaber@klenkauae.com', 'Finance', 'Finance Analyst', 'Dubai',
 '103', 'William Smith', 'william.smith@company.com', 'Alpha', 'Benefits',
 NULL, 'Medium', 'Pending Employee', 'pending',
 '2026-06-08', '2026-06-08', '14:00:00', '15:30:00',
 'EmployeeTime/externalCode=o55op55op55o55o5p55op5o555ppp555',
 '2026-06-07 09:00:00 +0200', '2026-06-07 09:30:00 +0200', NULL,
 '2026-06-07 11:00:00 +0200'),

('EPT-07', 'Vendor site visit', 'Exit Permission Ticket Request', 'Business Trip', 'On-site visit to inspect vendor facility',
 'EMP-0008', 'David Park', 'd.park@klenkauae.com', 'IT & Systems', 'IT Support Engineer', 'Dubai',
 '101', 'John Doe', 'john.doe@company.com', 'Alpha', 'HR Operations',
 NULL, 'Medium', 'Completed', 'approved',
 '2026-06-14', '2026-06-14', '08:00:00', '16:00:00',
 'EmployeeTime/externalCode=p66pq66pq66p66p6q66pq6p666qqq666',
 '2026-06-13 09:00:00 +0200', '2026-06-14 16:30:00 +0200', '2026-06-14 16:30:00 +0200',
 '2026-06-14 12:00:00 +0200'),

('EPT-08', 'Car registration renewal', 'Exit Permission Ticket Request', 'Personal Errand', 'Vehicle registration expires this week',
 'EMP-0005', 'Nour Atassi', 'n.atassi@klenkaegypt.com', 'Legal', 'Legal Advisor', 'Alexandria',
 '102', 'Tommy Shelby', 'tommy.shelby@company.com', 'Beta', 'HR Operations',
 NULL, 'Low', 'Closed', 'approved',
 '2026-06-20', '2026-06-20', '11:00:00', '13:00:00',
 'EmployeeTime/externalCode=q77qr77qr77q77q7r77qr7q777rrr777',
 '2026-06-19 10:00:00 +0200', '2026-06-20 13:30:00 +0200', '2026-06-20 13:30:00 +0200',
 '2026-06-23 16:00:00 +0200'),

('EPT-09', 'Eye checkup appointment', 'Exit Permission Ticket Request', 'Medical Appointment', 'Annual eye examination',
 'EMP-0002', 'Khalid Jaber', 'k.jaber@klenkauae.com', 'Finance', 'Finance Analyst', 'Dubai',
 '103', 'William Smith', 'william.smith@company.com', 'Alpha', 'Benefits',
 NULL, 'Medium', 'Under Process', 'pending',
 '2026-06-28', '2026-06-28', '10:00:00', '11:00:00',
 'EmployeeTime/externalCode=r88rs88rs88r88r8s88rs8r888sss888',
 '2026-06-27 09:00:00 +0200', '2026-06-27 09:15:00 +0200', NULL,
 '2026-06-28 16:00:00 +0200'),

('EPT-10', 'Regional office visit', 'Exit Permission Ticket Request', 'Business Trip', 'Coordinating with the regional office team on-site',
 'EMP-0008', 'David Park', 'd.park@klenkauae.com', 'IT & Systems', 'IT Support Engineer', 'Dubai',
 '101', 'John Doe', 'john.doe@company.com', 'Alpha', 'HR Operations',
 NULL, 'Medium', 'New', 'pending',
 '2026-07-05', '2026-07-05', '09:00:00', '15:00:00',
 'EmployeeTime/externalCode=s99st99st99s99s9t99st9s999ttt999',
 '2026-07-04 08:30:00 +0200', '2026-07-04 08:30:00 +0200', NULL,
 '2026-07-05 09:00:00 +0200'),

-- ==================== ST TICKETS (additional) ====================
('ST-02', 'Laptop keyboard not working', 'Support Ticket Request', 'Hardware', 'Several keys stopped responding after a spill',
 'EMP-0007', 'Aisha Benali', 'a.benali@klenkaegypt.com', 'Marketing', 'Marketing Specialist', 'Cairo',
 '102', 'Tommy Shelby', 'tommy.shelby@company.com', 'Beta', 'HR Operations',
 NULL, 'High', 'Completed', NULL,
 NULL, NULL, NULL, NULL, NULL,
 '2026-05-06 09:00:00 +0200', '2026-05-07 11:00:00 +0200', '2026-05-07 11:00:00 +0200',
 '2026-05-06 14:00:00 +0200'),

('ST-03', 'Cannot install VPN client', 'Support Ticket Request', 'Software', 'VPN installer fails with a permissions error',
 'EMP-0004', 'Marcus Reyes', 'm.reyes@klenkauae.com', 'Operations', 'Operations Coordinator', 'Abu Dhabi',
 '103', 'William Smith', 'william.smith@company.com', 'Alpha', 'Benefits',
 NULL, 'Medium', 'Under Process', NULL,
 NULL, NULL, NULL, NULL, NULL,
 '2026-05-14 10:00:00 +0200', '2026-05-14 10:30:00 +0200', NULL,
 '2026-05-18 10:30:00 +0200'),

('ST-04', 'Need access to shared drive', 'Support Ticket Request', 'Access Request', 'Requesting read/write access to the Finance shared drive',
 'EMP-0008', 'David Park', 'd.park@klenkauae.com', 'IT & Systems', 'IT Support Engineer', 'Dubai',
 '101', 'John Doe', 'john.doe@company.com', 'Alpha', 'HR Operations',
 NULL, 'High', 'New', NULL,
 NULL, NULL, NULL, NULL, NULL,
 '2026-05-25 08:45:00 +0200', '2026-05-25 08:45:00 +0200', NULL,
 '2026-05-25 09:15:00 +0200'),

('ST-05', 'Question about expense policy', 'Support Ticket Request', 'General Inquiry', 'Unclear on the reimbursement limit for travel meals',
 'EMP-0005', 'Nour Atassi', 'n.atassi@klenkaegypt.com', 'Legal', 'Legal Advisor', 'Alexandria',
 '102', 'Tommy Shelby', 'tommy.shelby@company.com', 'Beta', 'HR Operations',
 NULL, 'Low', 'Completed', NULL,
 NULL, NULL, NULL, NULL, NULL,
 '2026-06-02 11:00:00 +0200', '2026-06-03 09:00:00 +0200', '2026-06-03 09:00:00 +0200',
 '2026-06-07 12:00:00 +0200'),

('ST-06', 'Monitor flickering issue', 'Support Ticket Request', 'Hardware', 'External monitor flickers intermittently',
 'EMP-0007', 'Aisha Benali', 'a.benali@klenkaegypt.com', 'Marketing', 'Marketing Specialist', 'Cairo',
 '103', 'William Smith', 'william.smith@company.com', 'Alpha', 'Benefits',
 NULL, 'High', 'Pending Third Party', NULL,
 NULL, NULL, NULL, NULL, NULL,
 '2026-06-10 09:30:00 +0200', '2026-06-11 10:00:00 +0200', NULL,
 '2026-06-10 10:30:00 +0200'),

('ST-07', 'Excel crashes on large files', 'Support Ticket Request', 'Software', 'Excel closes unexpectedly when opening files over 20MB',
 'EMP-0006', 'James Okafor', 'j.okafor@klenkauae.com', 'Sales', 'Sales Executive', 'Sharjah',
 '101', 'John Doe', 'john.doe@company.com', 'Alpha', 'HR Operations',
 NULL, 'Medium', 'Under Process', NULL,
 NULL, NULL, NULL, NULL, NULL,
 '2026-06-18 13:00:00 +0200', '2026-06-18 13:20:00 +0200', NULL,
 '2026-06-22 13:20:00 +0200'),

('ST-08', 'Request access to HR portal', 'Support Ticket Request', 'Access Request', 'New manager needs approval access in the HR portal',
 'EMP-0008', 'David Park', 'd.park@klenkauae.com', 'IT & Systems', 'IT Support Engineer', 'Dubai',
 '102', 'Tommy Shelby', 'tommy.shelby@company.com', 'Beta', 'HR Operations',
 NULL, 'High', 'Closed', NULL,
 NULL, NULL, NULL, NULL, NULL,
 '2026-06-23 09:00:00 +0200', '2026-06-24 10:00:00 +0200', '2026-06-24 10:00:00 +0200',
 '2026-06-23 12:00:00 +0200'),

('ST-09', 'Clarification on remote work policy', 'Support Ticket Request', 'General Inquiry', 'Asking how many remote days are allowed per month',
 'EMP-0009', 'Rania Mahmoud', 'r.mahmoud@klenkaegypt.com', 'Finance', 'Finance Analyst', 'Alexandria',
 '103', 'William Smith', 'william.smith@company.com', 'Alpha', 'Benefits',
 NULL, 'Low', 'New', NULL,
 NULL, NULL, NULL, NULL, NULL,
 '2026-07-02 10:00:00 +0200', '2026-07-02 10:00:00 +0200', NULL,
 '2026-07-05 10:00:00 +0200'),

('ST-10', 'Broken mouse replacement', 'Support Ticket Request', 'Hardware', 'Wireless mouse no longer connects, needs a replacement',
 'EMP-0007', 'Aisha Benali', 'a.benali@klenkaegypt.com', 'Marketing', 'Marketing Specialist', 'Cairo',
 '101', 'John Doe', 'john.doe@company.com', 'Alpha', 'HR Operations',
 NULL, 'High', 'Under Process', NULL,
 NULL, NULL, NULL, NULL, NULL,
 '2026-07-08 09:00:00 +0200', '2026-07-08 09:10:00 +0200', NULL,
 '2026-07-08 13:10:00 +0200');

select * from tickets; -- Verify all inserted rows

--#2- communcation table

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


--#3- attachments table

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


--#4- internal notes table

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

--#5- activity log table

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

-- ============================================================
-- ADMINISTRATOR MODULE SCHEMA
-- Covers the 6 admin tabs:
-- Listed in physical / execution order (top-to-bottom):
--   0. set_updated_at()             (shared trigger function)
--   1. support_categories           (shared lookup — fix #3)
--   2. subcategories                (shared lookup — fix #3)
--   3. entities                     (shared lookup)
--   4. employees                    (Employee Directory tab)
--   5. support_groups               (Org Structure tab - groups)
--   6. group_members                (Org Structure tab - members)
--   7. ticketing_rules              (Ticketing Rule tab)
--   8. sla_policies                 (SLA Rule tab - group header)
--   9. sla_rules                    (SLA Rule tab - rule rows)
--  10. sla_assignments              (SLA Assignment tab)
--  11. notification_rules           (Notification Rules tab)
--  12. notification_conditions      (Notification Rules tab - conditions)
--  13. notification_personas        (Notification Rules tab - recipients)
--  14. notification_rule_entities   (Notification Rules tab - entity scope)
--  15. ticket_sla_timers            (SLA runtime - per-ticket timers)
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- FIX #7: Shared trigger function — auto-updates updated_at
-- on every table that has that column.
-- Usage: after CREATE TABLE, call:
--   CREATE TRIGGER trg_<table>_updated_at
--   BEFORE UPDATE ON <table>
--   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ─────────────────────────────────────────────────────────────
-- TABLE 1: support_categories lookup table  (FIX #3)
-- Centralized category list shared by ticketing_rules,
-- sla_assignments, and tickets. Prevents free-text mismatches
-- (e.g. 'IT Support' vs 'it support') that silently break the
-- SLA flow lookup chain.
-- Works with or without SAP: categories are managed here and
-- optionally enriched by SAP sync via sap_code.
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS support_categories CASCADE;

CREATE TABLE support_categories (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL UNIQUE,  -- e.g. 'IT Support', 'HR'
    sap_code   VARCHAR(50),                  -- optional SAP category code for future sync
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_support_categories_updated_at
BEFORE UPDATE ON support_categories
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

INSERT INTO support_categories (name) VALUES
('Vacation Ticket Request'),
('Exit Permission Ticket Request'),
('Support Ticket Request');


-- ─────────────────────────────────────────────────────────────
-- TABLE 2: subcategories lookup table  (FIX #3)
-- Each subcategory belongs to a parent support_category.
-- Prevents orphan subcategories (e.g. 'Payroll' under 'IT Support')
-- and eliminates free-text drift between ticketing_rules and
-- sla_assignments tables.
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS subcategories CASCADE;

CREATE TABLE subcategories (
    id          SERIAL PRIMARY KEY,
    category_id INT         NOT NULL REFERENCES support_categories(id) ON DELETE RESTRICT,
    name        VARCHAR(100) NOT NULL,
    sap_code    VARCHAR(50),                 -- optional SAP subcategory code for future sync
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (category_id, name)              -- same name can exist under different categories
);

CREATE TRIGGER trg_subcategories_updated_at
BEFORE UPDATE ON subcategories
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Vacation Ticket Request subcategories (category_id = 1)
INSERT INTO subcategories (category_id, name) VALUES
(1, 'Annual Leave'),
(1, 'Sick Leave'),
(1, 'Unpaid Leave');

-- Exit Permission Ticket Request subcategories (category_id = 2)
INSERT INTO subcategories (category_id, name) VALUES
(2, 'Personal Errand'),
(2, 'Medical Appointment'),
(2, 'Business Trip');

-- Support Ticket Request subcategories (category_id = 3)
INSERT INTO subcategories (category_id, name) VALUES
(3, 'Hardware'),
(3, 'Software'),
(3, 'Access Request'),
(3, 'General Inquiry');


-- ─────────────────────────────────────────────────────────────
-- TABLE 3: entities
-- Shared lookup used across employees, ticketing rules,
-- SLA assignments, and notification rules.
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS entities CASCADE;

CREATE TABLE entities (
    id           SERIAL PRIMARY KEY,
    code         VARCHAR(50)  NOT NULL UNIQUE,  -- e.g. 'E001', 'E002'
    name         VARCHAR(150) NOT NULL UNIQUE,  -- e.g. 'HQ Corp', 'Regional Ltd'
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_entities_updated_at
BEFORE UPDATE ON entities
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Sample data
INSERT INTO entities (code, name) VALUES
('E001', 'Klenka Egypt'),
('E002', 'Klenka UAE');


-- ─────────────────────────────────────────────────────────────
-- TABLE 4: employees
-- Employee Directory tab.
-- Owns all employee records with full CRUD.
-- SAP integration (when ready) upserts by employee_id.
-- Works standalone without SAP: records created/edited manually.
--
-- FIX #6: tickets.employee_id references employees.employee_id
-- (VARCHAR FK, not INT) so tickets still work if the employees
-- row doesn't exist yet — enforced at app layer, not DB, to
-- allow tickets created before SAP sync populates employees.
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS employees CASCADE;

CREATE TABLE employees (
    id              SERIAL PRIMARY KEY,
    employee_id     VARCHAR(50)  NOT NULL UNIQUE,  -- e.g. 'EMP-0001' (SAP key; upsert anchor)
    name            VARCHAR(150) NOT NULL,
    entity_id       INT          REFERENCES entities(id) ON DELETE SET NULL,
    location        VARCHAR(100),
    department      VARCHAR(100),
    employee_class  VARCHAR(50)  CHECK (employee_class IN ('Full-time', 'Part-time', 'Contractor', 'Intern')),
    -- FIX #1: store manager's employee_id (stable SAP key), not their name.
    -- Resolve display name by joining employees ON e2.employee_id = employees.manager_id.
    -- Nullable: top-level employees have no manager.
    manager_id      VARCHAR(50)  REFERENCES employees(employee_id) ON DELETE SET NULL,
    email           VARCHAR(150),
    mobile_number   VARCHAR(30),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_employees_updated_at
BEFORE UPDATE ON employees
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- entity_id: 1 = Klenka Egypt, 2 = Klenka UAE
-- Managers inserted first (no manager_id), then their reports
-- manager_id references employee_id of the manager row
INSERT INTO employees (employee_id, name, entity_id, location, department, employee_class, manager_id, email, mobile_number) VALUES
-- Managers (no manager_id)
('MGR-0001', 'Ahmad Khalil',     1, 'Cairo',      'Management',      'Full-time',  NULL,       'ahmad.khalil@klenkaegypt.com',  '+20 100 000 0001'),
('MGR-0002', 'Leila Nasser',     2, 'Dubai',      'Management',      'Full-time',  NULL,       'leila.nasser@klenkauae.com',    '+971 50 000 0002'),
('MGR-0003', 'Fatima Al-Rashid', 1, 'Alexandria', 'Management',      'Full-time',  NULL,       'fatima.rashid@klenkaegypt.com', '+20 100 000 0003'),
('MGR-0004', 'Omar Farouk',      2, 'Abu Dhabi',  'IT & Systems',    'Full-time',  NULL,       'omar.farouk@klenkauae.com',     '+971 50 000 0004'),
-- Employees (manager_id = their manager''s employee_id)
('EMP-0001', 'Sara Al-Mansoori', 1, 'Cairo',      'HR & People Ops', 'Full-time',  'MGR-0001', 'sara.mansoori@klenkaegypt.com', '+20 101 234 5678'),
('EMP-0002', 'Khalid Jaber',     2, 'Dubai',      'Finance',         'Part-time',  'MGR-0002', 'k.jaber@klenkauae.com',         '+971 50 234 5678'),
('EMP-0003', 'Lina Tran',        1, 'Giza',       'IT & Systems',    'Contractor', 'MGR-0001', 'l.tran@klenkaegypt.com',        '+20 102 345 6789'),
('EMP-0004', 'Marcus Reyes',     2, 'Abu Dhabi',  'Operations',      'Full-time',  'MGR-0002', 'm.reyes@klenkauae.com',         '+971 50 345 6789'),
('EMP-0005', 'Nour Atassi',      1, 'Alexandria', 'Legal',           'Full-time',  'MGR-0003', 'n.atassi@klenkaegypt.com',      '+20 103 456 7890'),
('EMP-0006', 'James Okafor',     2, 'Sharjah',    'Sales',           'Full-time',  'MGR-0004', 'j.okafor@klenkauae.com',        '+971 50 456 7890'),
('EMP-0007', 'Aisha Benali',     1, 'Cairo',      'Marketing',       'Part-time',  'MGR-0001', 'a.benali@klenkaegypt.com',      '+20 104 567 8901'),
('EMP-0008', 'David Park',       2, 'Dubai',      'IT & Systems',    'Contractor', 'MGR-0004', 'd.park@klenkauae.com',          '+971 50 567 8901'),
('EMP-0009', 'Rania Mahmoud',    1, 'Alexandria', 'Finance',         'Full-time',  'MGR-0003', 'r.mahmoud@klenkaegypt.com',     '+20 105 678 9012'),
('EMP-0010', 'Tom Fischer',      2, 'Abu Dhabi',  'Operations',      'Part-time',  'MGR-0002', 't.fischer@klenkauae.com',       '+971 50 678 9012'),
('EMP-0011', 'Yara Saleh',       1, 'Giza',       'HR & People Ops', 'Contractor', 'MGR-0003', 'y.saleh@klenkaegypt.com',       '+20 106 789 0123'),
('EMP-0012', 'Carlos Mendez',    2, 'Sharjah',    'Sales',           'Full-time',  'MGR-0004', 'c.mendez@klenkauae.com',        '+971 50 789 0123');


-- ─────────────────────────────────────────────────────────────
-- TABLE 5: support_groups
-- Org Structure tab — top grid (Support Groups).
-- Groups are entity-agnostic (shared across all entities).
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS support_groups CASCADE;

CREATE TABLE support_groups (
    id              SERIAL PRIMARY KEY,
    external_code   VARCHAR(50)  NOT NULL UNIQUE,  -- e.g. 'L1-001', 'HR-001'
    name            VARCHAR(150) NOT NULL,
    parent_name     VARCHAR(150),                  -- department / parent unit label (plain text)
    valid_from      DATE         NOT NULL,
    valid_to        DATE         NOT NULL,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_support_groups_updated_at
BEFORE UPDATE ON support_groups
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Sample data (aligned to the 3 request categories: Vacation, Exit Permission, Support)
INSERT INTO support_groups (external_code, name, parent_name, valid_from, valid_to) VALUES
('VAC-001', 'Vacation Approvals Team',     'HR Operations',          '2025-01-01', '2026-12-31'),
('EXT-001', 'Exit Permission Approvals',   'HR Operations',          '2025-01-01', '2026-12-31'),
('SUP-001', 'IT & General Support L1',     'IT Support Department',  '2025-01-01', '2026-12-31'),
('SUP-002', 'IT & General Support L2',     'IT Support Department',  '2025-01-01', '2026-12-31');


-- ─────────────────────────────────────────────────────────────
-- TABLE 6: group_members
-- Org Structure tab — bottom grid (Assigned Users).
-- Members are employees assigned to a support group with a role.
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS group_members CASCADE;

CREATE TABLE group_members (
    id           SERIAL PRIMARY KEY,
    group_id     INT         NOT NULL REFERENCES support_groups(id) ON DELETE CASCADE,
    employee_id  INT         NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    user_type    VARCHAR(50) NOT NULL,   -- 'Agent' | 'Supervisor' | 'Manager'
    valid_from   DATE        NOT NULL,
    valid_to     DATE        NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- FIX #5: UNIQUE includes valid_from so an employee can
    -- leave and rejoin the same group in a later period.
    -- Overlapping date ranges are prevented at the app layer.
    UNIQUE (group_id, employee_id, valid_from),

    CHECK (user_type IN ('Agent', 'Supervisor', 'Manager')),
    CHECK (valid_to >= valid_from)
);

CREATE TRIGGER trg_group_members_updated_at
BEFORE UPDATE ON group_members
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Sample data (group IDs 1=VAC-001, 2=EXT-001, 3=SUP-001, 4=SUP-002; employee IDs 1–16)
INSERT INTO group_members (group_id, employee_id, user_type, valid_from, valid_to) VALUES
(1, 1,  'Supervisor', '2025-01-01', '2026-12-31'),  -- MGR-0001 Ahmad Khalil → Vacation Approvals
(1, 5,  'Agent',      '2025-01-01', '2026-12-31'),  -- EMP-0001 Sara Al-Mansoori
(1, 13, 'Agent',      '2025-03-01', '2026-12-31'),  -- EMP-0009 Rania Mahmoud
(2, 3,  'Supervisor', '2025-01-01', '2026-12-31'),  -- MGR-0003 Fatima Al-Rashid → Exit Permission Approvals
(2, 9,  'Agent',      '2025-01-15', '2026-12-31'),  -- EMP-0005 Nour Atassi
(2, 15, 'Agent',      '2025-05-01', '2026-12-31'),  -- EMP-0011 Yara Saleh
(3, 4,  'Manager',    '2025-01-01', '2026-12-31'),  -- MGR-0004 Omar Farouk → IT & General Support L1
(3, 7,  'Agent',      '2025-02-01', '2026-12-31'),  -- EMP-0003 Lina Tran
(3, 12, 'Agent',      '2025-02-01', '2026-12-31'),  -- EMP-0008 David Park
(4, 2,  'Supervisor', '2025-01-01', '2026-12-31'),  -- MGR-0002 Leila Nasser → IT & General Support L2
(4, 8,  'Agent',      '2025-03-01', '2026-12-31'),  -- EMP-0004 Marcus Reyes
(4, 14, 'Agent',      '2025-02-01', '2026-12-31');  -- EMP-0010 Tom Fischer


-- ─────────────────────────────────────────────────────────────
-- TABLE 7: ticketing_rules
-- Ticketing Rule tab.
-- Maps (entity, employee_class, category, subcategory)
-- → (support_group, priority).
-- No agent column — group-level routing only.
-- FIX #3: category_id and subcategory_id are now FKs to
-- support_categories and subcategories lookup tables.
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS ticketing_rules CASCADE;

CREATE TABLE ticketing_rules (
    id               SERIAL PRIMARY KEY,
    entity_id        INT         NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
    employee_class   VARCHAR(50) NOT NULL CHECK (employee_class IN ('Full-time', 'Part-time', 'Contractor', 'Intern')),
    category_id      INT         NOT NULL REFERENCES support_categories(id) ON DELETE RESTRICT,
    subcategory_id   INT         NOT NULL REFERENCES subcategories(id) ON DELETE RESTRICT,
    group_id         INT         NOT NULL REFERENCES support_groups(id) ON DELETE RESTRICT,
    priority         VARCHAR(20) NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Prevent duplicate routing rules for the same combo
    UNIQUE (entity_id, employee_class, category_id, subcategory_id)
);

CREATE TRIGGER trg_ticketing_rules_updated_at
BEFORE UPDATE ON ticketing_rules
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- category_id / subcategory_id reference support_categories / subcategories by ID
-- cat: 1=Vacation Ticket Request, 2=Exit Permission Ticket Request, 3=Support Ticket Request
-- sub: 1=Annual Leave, 2=Sick Leave, 3=Unpaid Leave, 4=Personal Errand, 5=Medical Appointment,
--      6=Business Trip, 7=Hardware, 8=Software, 9=Access Request, 10=General Inquiry
-- group: 1=VAC-001, 2=EXT-001, 3=SUP-001, 4=SUP-002
-- entity_id values match real employees' entities only (1=Klenka Egypt, 2=Klenka UAE).
-- NOTE: this combo set (entity, class, category, subcategory) is intentionally IDENTICAL
-- to the one used in sla_assignments below, so every routed ticket also resolves an SLA ID
-- (Steps 2 and 3 of SLA_FLOW_DOCUMENTATION.md always succeed together for these 12 combos).
INSERT INTO ticketing_rules (entity_id, employee_class, category_id, subcategory_id, group_id, priority) VALUES
(1, 'Full-time',  1, 1,  1, 'Medium'),    -- Klenka Egypt | Vacation | Annual Leave        → VAC-001 | Medium | SLA-001
(2, 'Full-time',  1, 2,  1, 'Medium'),    -- Klenka UAE   | Vacation | Sick Leave          → VAC-001 | Medium | SLA-001
(1, 'Part-time',  1, 3,  1, 'Low'),       -- Klenka Egypt | Vacation | Unpaid Leave        → VAC-001 | Low    | SLA-002
(2, 'Part-time',  1, 1,  1, 'Low'),       -- Klenka UAE   | Vacation | Annual Leave        → VAC-001 | Low    | SLA-002
(1, 'Contractor', 2, 5,  2, 'High'),      -- Klenka Egypt | Exit     | Medical Appointment → EXT-001 | High   | SLA-003
(1, 'Full-time',  2, 4,  2, 'Low'),       -- Klenka Egypt | Exit     | Personal Errand     → EXT-001 | Low    | SLA-001
(2, 'Contractor', 2, 6,  2, 'Medium'),    -- Klenka UAE   | Exit     | Business Trip       → EXT-001 | Medium | SLA-003
(2, 'Part-time',  2, 5,  2, 'Medium'),    -- Klenka UAE   | Exit     | Medical Appointment → EXT-001 | Medium | SLA-002
(1, 'Part-time',  3, 7,  3, 'High'),      -- Klenka Egypt | Support  | Hardware            → SUP-001 | High   | SLA-002
(2, 'Full-time',  3, 8,  4, 'Medium'),    -- Klenka UAE   | Support  | Software            → SUP-002 | Medium | SLA-001
(2, 'Contractor', 3, 9,  4, 'High'),      -- Klenka UAE   | Support  | Access Request      → SUP-002 | High   | SLA-003
(1, 'Full-time',  3, 10, 3, 'Low');       -- Klenka Egypt | Support  | General Inquiry     → SUP-001 | Low    | SLA-001


-- ─────────────────────────────────────────────────────────────
-- TABLE 8: sla_policies
-- SLA Rule tab — one row per SLA ID group (e.g. SLA-001).
-- Container for a group of sla_rules. The display name lives
-- per-row in sla_rules.sla_name (each rule has its own name).
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS sla_policies CASCADE;

CREATE TABLE sla_policies (
    id          SERIAL PRIMARY KEY,
    sla_id      VARCHAR(20) NOT NULL UNIQUE,   -- e.g. 'SLA-001'
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_sla_policies_updated_at
BEFORE UPDATE ON sla_policies
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Sample data
INSERT INTO sla_policies (sla_id) VALUES
('SLA-001'), ('SLA-002'), ('SLA-003'), ('SLA-004'),
('SLA-005'), ('SLA-006'), ('SLA-007'), ('SLA-008'), ('SLA-009');


-- ─────────────────────────────────────────────────────────────
-- TABLE 9: sla_rules
-- SLA Rule tab — individual rule rows, grouped under a policy.
-- Each row defines one response-time requirement for a
-- (sla_policy, sla_type, priority) combination.
-- Operating hours are stored per rule row (per UI design).
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS sla_rules CASCADE;

CREATE TABLE sla_rules (
    id                  SERIAL PRIMARY KEY,
    policy_id           INT         NOT NULL REFERENCES sla_policies(id) ON DELETE CASCADE,
    sla_name            VARCHAR(150) NOT NULL,
    sla_type            VARCHAR(30) NOT NULL,   -- 'Initial Review' | 'Completion Due'
    priority            VARCHAR(20) NOT NULL,   -- 'Low' | 'Medium' | 'High' | 'Critical'
    -- FIX #8: NUMERIC(10,2) allows fractional values (e.g. 0.5 hours = 30 min)
    response_time_value NUMERIC(10,2) NOT NULL CHECK (response_time_value > 0),
    -- FIX #4: CHECK constraint prevents invalid/misspelled units
    response_time_unit  VARCHAR(20)  NOT NULL CHECK (response_time_unit IN ('Minutes', 'Hours', 'Days')),
    -- FIX #4: CHECK constraint on time_type
    -- 'Calendar Time' = 24/7, timer ignores operating hours (counts continuously).
    -- 'Working Time'  = standard week: Sun-Thu 08:00-16:00 (oh_* hold this preset).
    -- 'Custom Time'   = admin-defined mix; any days/hours set per rule in oh_* columns.
    time_type           VARCHAR(30)  NOT NULL CHECK (time_type IN ('Calendar Time', 'Working Time', 'Custom Time')),

    -- Operating hours stored as individual day columns (per rule row)
    -- Each day: enabled (boolean), start time, end time
    oh_sun_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    oh_sun_start   TIME,
    oh_sun_end     TIME,

    oh_mon_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    oh_mon_start   TIME,
    oh_mon_end     TIME,

    oh_tue_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    oh_tue_start   TIME,
    oh_tue_end     TIME,

    oh_wed_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    oh_wed_start   TIME,
    oh_wed_end     TIME,

    oh_thu_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    oh_thu_start   TIME,
    oh_thu_end     TIME,

    oh_fri_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    oh_fri_start   TIME,
    oh_fri_end     TIME,

    oh_sat_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    oh_sat_start   TIME,
    oh_sat_end     TIME,

    -- FIX #4: CHECK constraints on enum-like columns
    CHECK (sla_type IN ('Initial Review', 'Completion Due')),
    CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Each policy can have at most one rule per (sla_type, priority)
    UNIQUE (policy_id, sla_type, priority)
);

CREATE TRIGGER trg_sla_rules_updated_at
BEFORE UPDATE ON sla_rules
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Sample data (SLA-001 = policy_id 1, SLA-002 = policy_id 2)
INSERT INTO sla_rules (policy_id, sla_name, sla_type, priority, response_time_value, response_time_unit, time_type, oh_sun_enabled, oh_sun_start, oh_sun_end, oh_mon_enabled, oh_mon_start, oh_mon_end, oh_tue_enabled, oh_tue_start, oh_tue_end, oh_wed_enabled, oh_wed_start, oh_wed_end, oh_thu_enabled, oh_thu_start, oh_thu_end, oh_fri_enabled, oh_fri_start, oh_fri_end, oh_sat_enabled, oh_sat_start, oh_sat_end) VALUES
-- SLA-001 (Calendar 24/7 for Critical/High, Working hours for Medium/Low)
(1, 'Critical Initial Review', 'Initial Review', 'Critical', 1,  'Hours',   'Calendar Time', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59'),
(1, 'Critical Completion',     'Completion Due', 'Critical', 4,  'Hours',   'Calendar Time', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59'),
(1, 'High Initial Review',     'Initial Review', 'High',     2,  'Hours',   'Calendar Time', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59'),
(1, 'High Completion',         'Completion Due', 'High',     8,  'Hours',   'Calendar Time', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59'),
(1, 'Medium Initial Review',   'Initial Review', 'Medium',   4,  'Hours',   'Working Time',  TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', FALSE, NULL, NULL, FALSE, NULL, NULL),
(1, 'Medium Completion',       'Completion Due', 'Medium',   16, 'Hours',   'Working Time',  TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', FALSE, NULL, NULL, FALSE, NULL, NULL),
(1, 'Low Initial Review',      'Initial Review', 'Low',      8,  'Hours',   'Working Time',  TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', FALSE, NULL, NULL, FALSE, NULL, NULL),
(1, 'Low Completion',          'Completion Due', 'Low',      24, 'Hours',   'Working Time',  TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', FALSE, NULL, NULL, FALSE, NULL, NULL),
-- SLA-002
(2, 'Critical Initial Review', 'Initial Review', 'Critical', 30, 'Minutes', 'Calendar Time', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59'),
(2, 'Critical Completion',     'Completion Due', 'Critical', 2,  'Hours',   'Calendar Time', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59'),
(2, 'High Initial Review',     'Initial Review', 'High',     1,  'Hours',   'Working Time',  TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', FALSE, NULL, NULL, FALSE, NULL, NULL),
(2, 'High Completion',         'Completion Due', 'High',     4,  'Hours',   'Working Time',  TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', FALSE, NULL, NULL, FALSE, NULL, NULL),
(2, 'Medium Initial Review',   'Initial Review', 'Medium',   2,  'Hours',   'Working Time',  TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', FALSE, NULL, NULL, FALSE, NULL, NULL),
(2, 'Medium Completion',       'Completion Due', 'Medium',   8,  'Hours',   'Working Time',  TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', FALSE, NULL, NULL, FALSE, NULL, NULL),
(2, 'Low Initial Review',      'Initial Review', 'Low',      4,  'Hours',   'Working Time',  TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', FALSE, NULL, NULL, FALSE, NULL, NULL),
(2, 'Low Completion',          'Completion Due', 'Low',      16, 'Hours',   'Working Time',  TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', FALSE, NULL, NULL, FALSE, NULL, NULL),
-- SLA-003
(3, 'Critical Initial Review', 'Initial Review', 'Critical', 15, 'Minutes', 'Calendar Time', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59'),
(3, 'Critical Completion',     'Completion Due', 'Critical', 1,  'Hours',   'Calendar Time', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59'),
(3, 'High Initial Review',     'Initial Review', 'High',     30, 'Minutes', 'Calendar Time', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59'),
(3, 'High Completion',         'Completion Due', 'High',     2,  'Hours',   'Calendar Time', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59', TRUE, '00:00', '23:59'),
(3, 'Medium Initial Review',   'Initial Review', 'Medium',   1,  'Hours',   'Working Time',  TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', FALSE, NULL, NULL, FALSE, NULL, NULL),
(3, 'Medium Completion',       'Completion Due', 'Medium',   4,  'Hours',   'Working Time',  TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', FALSE, NULL, NULL, FALSE, NULL, NULL),
(3, 'Low Initial Review',      'Initial Review', 'Low',      2,  'Hours',   'Working Time',  TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', FALSE, NULL, NULL, FALSE, NULL, NULL),
(3, 'Low Completion',          'Completion Due', 'Low',      8,  'Hours',   'Working Time',  TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', TRUE, '08:00', '16:00', FALSE, NULL, NULL, FALSE, NULL, NULL);


-- ─────────────────────────────────────────────────────────────
-- TABLE 10: sla_assignments
-- SLA Assignment tab.
-- Maps (entity, employee_class, category, subcategory) → sla_policy.
-- Looked up after ticketing_rules to find the applicable SLA
-- timer for the ticket.
-- FIX #3: category_id and subcategory_id are now FKs.
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS sla_assignments CASCADE;

CREATE TABLE sla_assignments (
    id             SERIAL PRIMARY KEY,
    policy_id      INT         NOT NULL REFERENCES sla_policies(id) ON DELETE RESTRICT,
    entity_id      INT         NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
    employee_class VARCHAR(50) NOT NULL CHECK (employee_class IN ('Full-time', 'Part-time', 'Contractor', 'Intern')),
    category_id    INT         NOT NULL REFERENCES support_categories(id) ON DELETE RESTRICT,
    subcategory_id INT         NOT NULL REFERENCES subcategories(id) ON DELETE RESTRICT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Prevent duplicate assignments for the same combo
    UNIQUE (entity_id, employee_class, category_id, subcategory_id)
);

CREATE TRIGGER trg_sla_assignments_updated_at
BEFORE UPDATE ON sla_assignments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- cat: 1=Vacation Ticket Request, 2=Exit Permission Ticket Request, 3=Support Ticket Request
-- sub: 1=Annual Leave, 2=Sick Leave, 3=Unpaid Leave, 4=Personal Errand, 5=Medical Appointment,
--      6=Business Trip, 7=Hardware, 8=Software, 9=Access Request, 10=General Inquiry
-- entity_id values match real employees' entities only (1=Klenka Egypt, 2=Klenka UAE).
-- NOTE: this combo set is IDENTICAL to ticketing_rules above (see note there).
INSERT INTO sla_assignments (policy_id, entity_id, employee_class, category_id, subcategory_id) VALUES
-- SLA-001
(1, 1, 'Full-time',  1, 1),    -- Klenka Egypt | Vacation | Annual Leave
(1, 2, 'Full-time',  1, 2),    -- Klenka UAE   | Vacation | Sick Leave
(1, 1, 'Full-time',  2, 4),    -- Klenka Egypt | Exit     | Personal Errand
(1, 2, 'Full-time',  3, 8),    -- Klenka UAE   | Support  | Software
(1, 1, 'Full-time',  3, 10),   -- Klenka Egypt | Support  | General Inquiry
-- SLA-002
(2, 1, 'Part-time',  1, 3),    -- Klenka Egypt | Vacation | Unpaid Leave
(2, 2, 'Part-time',  1, 1),    -- Klenka UAE   | Vacation | Annual Leave
(2, 2, 'Part-time',  2, 5),    -- Klenka UAE   | Exit     | Medical Appointment
(2, 1, 'Part-time',  3, 7),    -- Klenka Egypt | Support  | Hardware
-- SLA-003
(3, 1, 'Contractor', 2, 5),    -- Klenka Egypt | Exit     | Medical Appointment
(3, 2, 'Contractor', 2, 6),    -- Klenka UAE   | Exit     | Business Trip
(3, 2, 'Contractor', 3, 9);    -- Klenka UAE   | Support  | Access Request


-- ─────────────────────────────────────────────────────────────
-- TABLE 11: notification_rules
-- Notification Rules tab — one row per notification rule.
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS notification_rules CASCADE;

CREATE TABLE notification_rules (
    id             SERIAL PRIMARY KEY,
    rule_code      VARCHAR(20)   NOT NULL UNIQUE,  -- e.g. 'NTF-001'
    name           VARCHAR(200)  NOT NULL,
    status         BOOLEAN       NOT NULL DEFAULT TRUE,   -- true = active
    email_subject  TEXT          NOT NULL,
    email_body     TEXT          NOT NULL,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_notification_rules_updated_at
BEFORE UPDATE ON notification_rules
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Sample data
-- NOTE: email_body uses E'...' (Postgres escape-string syntax) so \n is stored as a real
-- newline byte. A plain '...' literal treats \n as two literal characters (backslash + n)
-- since standard_conforming_strings is on by default — that bug showed up as literal "\n"
-- text in the notification email preview/textarea instead of line breaks.
INSERT INTO notification_rules (rule_code, name, status, email_subject, email_body) VALUES
('NTF-001', 'New ticket opened alert',          TRUE,  'Ticket {{ticket_id}} opened on {{date_time}}',        E'Dear {{employee_name}},\n\nA new ticket has been opened.\n\nTicket ID: {{ticket_id}}\nPriority: {{priority}}\nOpened on: {{date_time}}\n\nThank you.'),
('NTF-002', 'SLA breach — 24h escalation',      TRUE,  'URGENT — Ticket {{ticket_id}} SLA deadline update',   E'Dear {{employee_name}},\n\nThis is an automated SLA alert for ticket {{ticket_id}}.\n\nSLA deadline: {{sla_deadline}}\nPriority: {{priority}}\nStatus: {{status}}\n\nPlease take immediate action.\n\nThank you.'),
('NTF-003', 'Ticket resolved confirmation',      FALSE, 'Ticket {{ticket_id}} has been resolved',              E'Dear {{employee_name}},\n\nYour ticket has been successfully resolved.\n\nTicket ID: {{ticket_id}}\nStatus: {{status}}\nResolution time: {{resolution_time}}\nDate & time: {{date_time}}\n\nThank you for using our support system.');


-- ─────────────────────────────────────────────────────────────
-- TABLE 12: notification_conditions
-- Notification Rules tab — trigger conditions per rule.
-- Each rule can have multiple conditions joined by AND / OR.
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS notification_conditions CASCADE;

CREATE TABLE notification_conditions (
    id              SERIAL PRIMARY KEY,
    rule_id         INT         NOT NULL REFERENCES notification_rules(id) ON DELETE CASCADE,
    sort_order      INT         NOT NULL DEFAULT 0,   -- display/evaluation order
    condition_type  VARCHAR(50) NOT NULL,  -- 'Status' | 'Priority' | 'SLA' | 'Ticket Age' | 'Start Date' | 'Resolution Time' | 'Agent' | 'Team' | 'Entity' | 'Employee Class' | 'Custom Email'
    subtype         VARCHAR(100),          -- e.g. 'SLA breached', 'High → Critical'
    when_type       VARCHAR(20) NOT NULL,  -- 'immediate' | 'time' | 'breach'
    -- FIX #8: NUMERIC allows fractional values (e.g. 1.5 hours)
    time_amount     NUMERIC(10,2),         -- numeric value for time-based triggers (e.g. 24, 1.5)
    time_unit       VARCHAR(20),           -- 'minutes' | 'hours' | 'days'
    age_breached    BOOLEAN     NOT NULL DEFAULT FALSE,
    logical_op      VARCHAR(5)  NOT NULL DEFAULT 'AND',  -- 'AND' | 'OR' (operator after this condition)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sample data
INSERT INTO notification_conditions (rule_id, sort_order, condition_type, subtype, when_type, time_amount, time_unit, age_breached, logical_op) VALUES
-- NTF-001 conditions
(1, 1, 'Start Date', 'On ticket creation',  'time',      1,  'hours', FALSE, 'AND'),
(1, 2, 'Entity',     'Any entity change',   'immediate', NULL, NULL,  FALSE, 'AND'),
-- NTF-002 conditions
(2, 1, 'SLA',        'SLA breached',        'breach',    NULL, NULL,  FALSE, 'AND'),
(2, 2, 'Priority',   'High → Critical',     'immediate', NULL, NULL,  FALSE, 'AND'),
(2, 3, 'Ticket Age', 'Exceeds threshold',   'time',      24, 'hours', TRUE,  'OR'),
-- NTF-003 conditions
(3, 1, 'Status',     'Completed',           'immediate', NULL, NULL,  FALSE, 'AND'),
(3, 2, 'Resolution Time', 'Resolved on time','time',     NULL, NULL,  FALSE, 'AND');


-- ─────────────────────────────────────────────────────────────
-- TABLE 13: notification_personas
-- Notification Rules tab — who receives each notification rule.
-- persona_key matches the PERSONAS id list in notificationRules.js
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS notification_personas CASCADE;

CREATE TABLE notification_personas (
    id           SERIAL PRIMARY KEY,
    rule_id      INT         NOT NULL REFERENCES notification_rules(id) ON DELETE CASCADE,
    persona_key  VARCHAR(50) NOT NULL,  -- 'employee' | 'agent' | 'assigned_group' | 'manager_group' | 'other_employee' | 'other_agent' | 'other_group' | 'other_manager'
    -- For "other_*" personas, optionally store the specific target reference(s).
    -- Stored as a JSON array of names/IDs/emails (safe for commas + long lists).
    extra_ref    TEXT,                  -- e.g. ["Fatima Al-Zahra","Khalid Mansour"]

    UNIQUE (rule_id, persona_key)
);

-- Sample data
INSERT INTO notification_personas (rule_id, persona_key) VALUES
-- NTF-001
(1, 'employee'), (1, 'assigned_group'),
-- NTF-002
(2, 'agent'), (2, 'manager_group'), (2, 'other_employee'),
-- NTF-003
(3, 'employee'), (3, 'agent');


-- ─────────────────────────────────────────────────────────────
-- TABLE 14: notification_rule_entities
-- Junction table: a notification rule can target zero or more
-- entities. If a rule has no rows here → applies globally.
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS notification_rule_entities CASCADE;

CREATE TABLE notification_rule_entities (
    id        SERIAL PRIMARY KEY,
    rule_id   INT NOT NULL REFERENCES notification_rules(id) ON DELETE CASCADE,
    entity_id INT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,

    UNIQUE (rule_id, entity_id)
);

-- Sample data (NTF-002 scoped to Klenka Egypt and Klenka UAE only)
INSERT INTO notification_rule_entities (rule_id, entity_id) VALUES
(2, 1),  -- NTF-002 → Klenka Egypt
(2, 2);  -- NTF-002 → Klenka UAE
-- NTF-001 and NTF-003 have no rows here → global scope


-- ============================================================
-- SLA RUNTIME MODULE
-- Per-ticket live timer state. Driven by sla_rules (the template).
-- Implements the SLA_FLOW_DOCUMENTATION timer behavior:
--   - Two timers per ticket: Initial Review + Completion Due
--   - PAUSE on 'Pending Third Party' / 'Pending Employee'
--   - STOP  on 'Completed' / 'Closed'
--   - BREACH when the deadline passes before the timer is met
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- TABLE 15: ticket_sla_timers
-- One row per (ticket, timer_type). A ticket has up to 2 rows.
--
-- The rule values (response time, time type) are SNAPSHOTTED at
-- activation so later edits to sla_rules don't rewrite history.
--
-- due_at is the projected deadline. For 'Working Time' / 'Custom
-- Time' the app recomputes due_at on each resume so paused business
-- hours are excluded. For 'Calendar Time' paused_ms is simply added.
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS ticket_sla_timers CASCADE;

CREATE TABLE ticket_sla_timers (
    id          SERIAL       PRIMARY KEY,
    -- App-enforced link to tickets (VARCHAR business key), like ticket_communications.
    ticket_id   VARCHAR(50)  NOT NULL REFERENCES tickets(ticket_id) ON DELETE CASCADE,
    -- Which sla_rules row drives this timer (nullable: kept for traceability;
    -- SET NULL so deleting a rule never erases timer history).
    sla_rule_id INT          REFERENCES sla_rules(id) ON DELETE SET NULL,

    timer_type  VARCHAR(30)  NOT NULL CHECK (timer_type IN ('Initial Review', 'Completion Due')),

    -- Snapshot of the rule at activation time
    response_time_value NUMERIC(10,2) NOT NULL CHECK (response_time_value > 0),
    response_time_unit  VARCHAR(20)   NOT NULL CHECK (response_time_unit IN ('Minutes', 'Hours', 'Days')),
    time_type           VARCHAR(30)   NOT NULL CHECK (time_type IN ('Calendar Time', 'Working Time', 'Custom Time')),

    -- Snapshot of the rule's operating hours at activation time (mirrors sla_rules.oh_*).
    -- Without its own copy, pause/resume and priority-resync math would have no business-hours
    -- data to work from for 'Working Time' / 'Custom Time' timers (a timer row has no join back
    -- to sla_rules for this — sla_rule_id is nullable and only kept for traceability).
    oh_sun_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    oh_sun_start   TIME,
    oh_sun_end     TIME,

    oh_mon_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    oh_mon_start   TIME,
    oh_mon_end     TIME,

    oh_tue_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    oh_tue_start   TIME,
    oh_tue_end     TIME,

    oh_wed_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    oh_wed_start   TIME,
    oh_wed_end     TIME,

    oh_thu_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    oh_thu_start   TIME,
    oh_thu_end     TIME,

    oh_fri_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    oh_fri_start   TIME,
    oh_fri_end     TIME,

    oh_sat_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    oh_sat_start   TIME,
    oh_sat_end     TIME,

    -- Live timer state
    state        VARCHAR(20)  NOT NULL DEFAULT 'running'
                 CHECK (state IN ('running', 'paused', 'met', 'breached')),
    started_at   TIMESTAMPTZ,              -- when this timer first started
    due_at       TIMESTAMPTZ,              -- projected deadline (recomputed on resume)
    paused_at    TIMESTAMPTZ,              -- set while state = 'paused', else NULL
    paused_ms    BIGINT       NOT NULL DEFAULT 0,   -- total accumulated pause duration (ms)
    satisfied_at TIMESTAMPTZ,              -- when the timer was met or breached
    breached     BOOLEAN      NOT NULL DEFAULT FALSE,

    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    -- One Initial Review and one Completion Due per ticket
    UNIQUE (ticket_id, timer_type)
);

CREATE TRIGGER trg_ticket_sla_timers_updated_at
BEFORE UPDATE ON ticket_sla_timers
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_ticket_sla_timers_ticket ON ticket_sla_timers (ticket_id);

-- Sample data — matches the existing tickets sample rows.
-- sla_rule_id values reference sla_rules by insertion order: SLA-001=1-8, SLA-002=9-16, SLA-003=17-24
-- (Critical IR/CD, High IR/CD, Medium IR/CD, Low IR/CD, in that order within each policy).
-- Values computed from the same working-time-aware algorithm used by api/_utils/slaTimeMath.js,
-- so they match exactly what the live SLA flow would produce for each ticket's combo/status/timestamps.
INSERT INTO ticket_sla_timers (ticket_id, sla_rule_id, timer_type, response_time_value, response_time_unit, time_type, state, started_at, due_at, paused_at, paused_ms, satisfied_at, breached) VALUES
-- VT-01 (Medium, SLA-001, Pending Employee → Initial Review paused before assignment)
('VT-01', 5, 'Initial Review', 4, 'Hours', 'Working Time', 'paused', '2026-04-06 09:00:00 +0200', '2026-04-06 13:00:00 +0200', '2026-04-06 09:30:00 +0200', 0, NULL, FALSE),
-- EPT-01 (High, SLA-003, Completed → both timers met)
('EPT-01', 19, 'Initial Review', 30, 'Minutes', 'Calendar Time', 'met', '2026-04-06 08:30:00 +0200', '2026-04-06 09:00:00 +0200', NULL, 0, '2026-04-06 08:36:45 +0200', FALSE),
('EPT-01', 20, 'Completion Due', 2, 'Hours', 'Calendar Time', 'met', '2026-04-06 08:36:45 +0200', '2026-04-06 10:36:45 +0200', NULL, 0, '2026-04-06 09:15:00 +0200', FALSE),
-- ST-01 (Low, SLA-001, Under Process → Initial Review met, Completion Due running)
('ST-01', 7, 'Initial Review', 8, 'Hours', 'Working Time', 'met', '2026-04-05 10:00:00 +0200', '2026-04-06 10:00:00 +0200', NULL, 0, '2026-04-06 09:00:00 +0200', FALSE),
('ST-01', 8, 'Completion Due', 24, 'Hours', 'Working Time', 'running', '2026-04-06 09:00:00 +0200', '2026-04-09 09:00:00 +0200', NULL, 0, NULL, FALSE),
-- VT-02 (Low, SLA-002, New → Initial Review running)
('VT-02', 15, 'Initial Review', 4, 'Hours', 'Working Time', 'running', '2026-05-01 09:00:00 +0200', '2026-05-03 12:00:00 +0200', NULL, 0, NULL, FALSE),
-- VT-03 (Medium, SLA-001, Under Process)
('VT-03', 5, 'Initial Review', 4, 'Hours', 'Working Time', 'met', '2026-05-11 08:00:00 +0200', '2026-05-11 12:00:00 +0200', NULL, 0, '2026-05-11 08:30:00 +0200', FALSE),
('VT-03', 6, 'Completion Due', 16, 'Hours', 'Working Time', 'running', '2026-05-11 08:30:00 +0200', '2026-05-13 08:30:00 +0200', NULL, 0, NULL, FALSE),
-- VT-04 (Low, SLA-002, Pending Third Party → Initial Review paused before assignment)
('VT-04', 15, 'Initial Review', 4, 'Hours', 'Working Time', 'paused', '2026-05-15 10:15:00 +0200', '2026-05-17 12:00:00 +0200', '2026-05-16 09:00:00 +0200', 0, NULL, FALSE),
-- VT-05 (Medium, SLA-001, Completed → both timers met)
('VT-05', 5, 'Initial Review', 4, 'Hours', 'Working Time', 'met', '2026-01-10 09:00:00 +0200', '2026-01-11 12:00:00 +0200', NULL, 0, '2026-01-10 10:00:00 +0200', FALSE),
('VT-05', 6, 'Completion Due', 16, 'Hours', 'Working Time', 'met', '2026-01-10 10:00:00 +0200', '2026-01-12 16:00:00 +0200', NULL, 0, '2026-01-11 10:00:00 +0200', FALSE),
-- VT-06 (Medium, SLA-001, Completed → both timers met)
('VT-06', 5, 'Initial Review', 4, 'Hours', 'Working Time', 'met', '2026-02-01 08:00:00 +0200', '2026-02-01 12:00:00 +0200', NULL, 0, '2026-02-01 09:00:00 +0200', FALSE),
('VT-06', 6, 'Completion Due', 16, 'Hours', 'Working Time', 'met', '2026-02-01 09:00:00 +0200', '2026-02-03 09:00:00 +0200', NULL, 0, '2026-02-02 09:00:00 +0200', FALSE),
-- VT-07 (Low, SLA-002, Closed → Completion Due breached)
('VT-07', 15, 'Initial Review', 4, 'Hours', 'Working Time', 'met', '2026-02-20 11:00:00 +0200', '2026-02-22 12:00:00 +0200', NULL, 0, '2026-02-20 12:00:00 +0200', FALSE),
('VT-07', 16, 'Completion Due', 16, 'Hours', 'Working Time', 'breached', '2026-02-20 12:00:00 +0200', '2026-02-23 16:00:00 +0200', NULL, 0, '2026-02-25 09:00:00 +0200', TRUE),
-- VT-08 (Low, SLA-002, New → Initial Review running)
('VT-08', 15, 'Initial Review', 4, 'Hours', 'Working Time', 'running', '2026-06-10 09:30:00 +0200', '2026-06-10 13:30:00 +0200', NULL, 0, NULL, FALSE),
-- VT-09 (Medium, SLA-001, Pending Employee → Initial Review paused before assignment)
('VT-09', 5, 'Initial Review', 4, 'Hours', 'Working Time', 'paused', '2026-06-17 07:45:00 +0200', '2026-06-17 12:00:00 +0200', '2026-06-17 08:00:00 +0200', 0, NULL, FALSE),
-- VT-10 (Low, SLA-002, Under Process)
('VT-10', 15, 'Initial Review', 4, 'Hours', 'Working Time', 'met', '2026-06-25 13:00:00 +0200', '2026-06-28 09:00:00 +0200', NULL, 0, '2026-06-26 09:00:00 +0200', FALSE),
('VT-10', 16, 'Completion Due', 16, 'Hours', 'Working Time', 'running', '2026-06-26 09:00:00 +0200', '2026-06-29 16:00:00 +0200', NULL, 0, NULL, FALSE),
-- EPT-02 (Low, SLA-001, Completed → both timers met)
('EPT-02', 7, 'Initial Review', 8, 'Hours', 'Working Time', 'met', '2026-05-04 09:00:00 +0200', '2026-05-05 09:00:00 +0200', NULL, 0, '2026-05-04 10:00:00 +0200', FALSE),
('EPT-02', 8, 'Completion Due', 24, 'Hours', 'Working Time', 'met', '2026-05-04 10:00:00 +0200', '2026-05-07 10:00:00 +0200', NULL, 0, '2026-05-05 12:30:00 +0200', FALSE),
-- EPT-03 (Medium, SLA-002, Completed → Completion Due breached)
('EPT-03', 13, 'Initial Review', 2, 'Hours', 'Working Time', 'met', '2026-05-17 08:00:00 +0200', '2026-05-17 10:00:00 +0200', NULL, 0, '2026-05-17 09:00:00 +0200', FALSE),
('EPT-03', 14, 'Completion Due', 8, 'Hours', 'Working Time', 'breached', '2026-05-17 09:00:00 +0200', '2026-05-18 09:00:00 +0200', NULL, 0, '2026-05-18 11:30:00 +0200', TRUE),
-- EPT-04 (Medium, SLA-003, Under Process)
('EPT-04', 21, 'Initial Review', 1, 'Hours', 'Working Time', 'met', '2026-05-22 09:00:00 +0200', '2026-05-24 09:00:00 +0200', NULL, 0, '2026-05-22 09:15:00 +0200', FALSE),
('EPT-04', 22, 'Completion Due', 4, 'Hours', 'Working Time', 'running', '2026-05-22 09:15:00 +0200', '2026-05-24 12:00:00 +0200', NULL, 0, NULL, FALSE),
-- EPT-05 (Low, SLA-001, New → Initial Review running)
('EPT-05', 7, 'Initial Review', 8, 'Hours', 'Working Time', 'running', '2026-06-01 10:00:00 +0200', '2026-06-02 10:00:00 +0200', NULL, 0, NULL, FALSE),
-- EPT-06 (Medium, SLA-002, Pending Employee → Initial Review paused before assignment)
('EPT-06', 13, 'Initial Review', 2, 'Hours', 'Working Time', 'paused', '2026-06-07 09:00:00 +0200', '2026-06-07 11:00:00 +0200', '2026-06-07 09:30:00 +0200', 0, NULL, FALSE),
-- EPT-07 (Medium, SLA-003, Completed → Completion Due breached)
('EPT-07', 21, 'Initial Review', 1, 'Hours', 'Working Time', 'met', '2026-06-13 09:00:00 +0200', '2026-06-14 09:00:00 +0200', NULL, 0, '2026-06-13 10:00:00 +0200', FALSE),
('EPT-07', 22, 'Completion Due', 4, 'Hours', 'Working Time', 'breached', '2026-06-13 10:00:00 +0200', '2026-06-14 12:00:00 +0200', NULL, 0, '2026-06-14 16:30:00 +0200', TRUE),
-- EPT-08 (Low, SLA-001, Closed → both timers met)
('EPT-08', 7, 'Initial Review', 8, 'Hours', 'Working Time', 'met', '2026-06-19 10:00:00 +0200', '2026-06-21 16:00:00 +0200', NULL, 0, '2026-06-19 11:00:00 +0200', FALSE),
('EPT-08', 8, 'Completion Due', 24, 'Hours', 'Working Time', 'met', '2026-06-19 11:00:00 +0200', '2026-06-23 16:00:00 +0200', NULL, 0, '2026-06-20 13:30:00 +0200', FALSE),
-- EPT-09 (Medium, SLA-002, Under Process)
('EPT-09', 13, 'Initial Review', 2, 'Hours', 'Working Time', 'met', '2026-06-27 09:00:00 +0200', '2026-06-28 10:00:00 +0200', NULL, 0, '2026-06-27 09:15:00 +0200', FALSE),
('EPT-09', 14, 'Completion Due', 8, 'Hours', 'Working Time', 'running', '2026-06-27 09:15:00 +0200', '2026-06-28 16:00:00 +0200', NULL, 0, NULL, FALSE),
-- EPT-10 (Medium, SLA-003, New → Initial Review running)
('EPT-10', 21, 'Initial Review', 1, 'Hours', 'Working Time', 'running', '2026-07-04 08:30:00 +0200', '2026-07-05 09:00:00 +0200', NULL, 0, NULL, FALSE),
-- ST-02 (High, SLA-002, Completed → both timers breached)
('ST-02', 11, 'Initial Review', 1, 'Hours', 'Working Time', 'breached', '2026-05-06 09:00:00 +0200', '2026-05-06 10:00:00 +0200', NULL, 0, '2026-05-06 10:00:00 +0200', TRUE),
('ST-02', 12, 'Completion Due', 4, 'Hours', 'Working Time', 'breached', '2026-05-06 10:00:00 +0200', '2026-05-06 14:00:00 +0200', NULL, 0, '2026-05-07 11:00:00 +0200', TRUE),
-- ST-03 (Medium, SLA-001, Under Process)
('ST-03', 5, 'Initial Review', 4, 'Hours', 'Working Time', 'met', '2026-05-14 10:00:00 +0200', '2026-05-14 14:00:00 +0200', NULL, 0, '2026-05-14 10:30:00 +0200', FALSE),
('ST-03', 6, 'Completion Due', 16, 'Hours', 'Working Time', 'running', '2026-05-14 10:30:00 +0200', '2026-05-18 10:30:00 +0200', NULL, 0, NULL, FALSE),
-- ST-04 (High, SLA-003, New → Initial Review running)
('ST-04', 19, 'Initial Review', 30, 'Minutes', 'Calendar Time', 'running', '2026-05-25 08:45:00 +0200', '2026-05-25 09:15:00 +0200', NULL, 0, NULL, FALSE),
-- ST-05 (Low, SLA-001, Completed → both timers met)
('ST-05', 7, 'Initial Review', 8, 'Hours', 'Working Time', 'met', '2026-06-02 11:00:00 +0200', '2026-06-03 11:00:00 +0200', NULL, 0, '2026-06-02 12:00:00 +0200', FALSE),
('ST-05', 8, 'Completion Due', 24, 'Hours', 'Working Time', 'met', '2026-06-02 12:00:00 +0200', '2026-06-07 12:00:00 +0200', NULL, 0, '2026-06-03 09:00:00 +0200', FALSE),
-- ST-06 (High, SLA-002, Pending Third Party → Initial Review paused before assignment)
('ST-06', 11, 'Initial Review', 1, 'Hours', 'Working Time', 'paused', '2026-06-10 09:30:00 +0200', '2026-06-10 10:30:00 +0200', '2026-06-11 10:00:00 +0200', 0, NULL, FALSE),
-- ST-07 (Medium, SLA-001, Under Process)
('ST-07', 5, 'Initial Review', 4, 'Hours', 'Working Time', 'met', '2026-06-18 13:00:00 +0200', '2026-06-21 09:00:00 +0200', NULL, 0, '2026-06-18 13:20:00 +0200', FALSE),
('ST-07', 6, 'Completion Due', 16, 'Hours', 'Working Time', 'running', '2026-06-18 13:20:00 +0200', '2026-06-22 13:20:00 +0200', NULL, 0, NULL, FALSE),
-- ST-08 (High, SLA-003, Closed → both timers breached)
('ST-08', 19, 'Initial Review', 30, 'Minutes', 'Calendar Time', 'breached', '2026-06-23 09:00:00 +0200', '2026-06-23 09:30:00 +0200', NULL, 0, '2026-06-23 10:00:00 +0200', TRUE),
('ST-08', 20, 'Completion Due', 2, 'Hours', 'Calendar Time', 'breached', '2026-06-23 10:00:00 +0200', '2026-06-23 12:00:00 +0200', NULL, 0, '2026-06-24 10:00:00 +0200', TRUE),
-- ST-09 (Low, SLA-001, New → Initial Review running)
('ST-09', 7, 'Initial Review', 8, 'Hours', 'Working Time', 'running', '2026-07-02 10:00:00 +0200', '2026-07-05 10:00:00 +0200', NULL, 0, NULL, FALSE),
-- ST-10 (High, SLA-002, Under Process)
('ST-10', 11, 'Initial Review', 1, 'Hours', 'Working Time', 'met', '2026-07-08 09:00:00 +0200', '2026-07-08 10:00:00 +0200', NULL, 0, '2026-07-08 09:10:00 +0200', FALSE),
('ST-10', 12, 'Completion Due', 4, 'Hours', 'Working Time', 'running', '2026-07-08 09:10:00 +0200', '2026-07-08 13:10:00 +0200', NULL, 0, NULL, FALSE);

-- Backfill the oh_* snapshot columns above from each row's originating sla_rules row (the
-- INSERT above omits them for brevity — this reproduces exactly what api/_utils/db.js's
-- insertTicketSlaTimerDB now captures automatically at activation time).
UPDATE ticket_sla_timers t
SET oh_sun_enabled = r.oh_sun_enabled, oh_sun_start = r.oh_sun_start, oh_sun_end = r.oh_sun_end,
    oh_mon_enabled = r.oh_mon_enabled, oh_mon_start = r.oh_mon_start, oh_mon_end = r.oh_mon_end,
    oh_tue_enabled = r.oh_tue_enabled, oh_tue_start = r.oh_tue_start, oh_tue_end = r.oh_tue_end,
    oh_wed_enabled = r.oh_wed_enabled, oh_wed_start = r.oh_wed_start, oh_wed_end = r.oh_wed_end,
    oh_thu_enabled = r.oh_thu_enabled, oh_thu_start = r.oh_thu_start, oh_thu_end = r.oh_thu_end,
    oh_fri_enabled = r.oh_fri_enabled, oh_fri_start = r.oh_fri_start, oh_fri_end = r.oh_fri_end,
    oh_sat_enabled = r.oh_sat_enabled, oh_sat_start = r.oh_sat_start, oh_sat_end = r.oh_sat_end
FROM sla_rules r
WHERE t.sla_rule_id = r.id;