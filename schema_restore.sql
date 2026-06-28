-- ============================================================
-- AdminSAPSF - Full Database Schema Restore Script
-- Run this against your PostgreSQL database to recreate all
-- tables from scratch. Safe to re-run (uses DROP IF EXISTS).
-- Creation order matters: tickets must exist before child tables.
-- ============================================================


-- #1 tickets (parent table — must be created first)
DROP TABLE IF EXISTS tickets CASCADE;

CREATE TABLE tickets (
    id                      SERIAL PRIMARY KEY,
    ticket_id               VARCHAR(50) UNIQUE NOT NULL,
    title                   VARCHAR(255) NOT NULL,
    category                VARCHAR(100) NOT NULL,
    subcategory             VARCHAR(100),
    reason                  TEXT,

    -- Employee info (denormalized — no FK, employees live in SAP)
    employee_id             VARCHAR(50) NOT NULL,
    employee_name           VARCHAR(255),
    employee_email          VARCHAR(255),
    employee_department     VARCHAR(100),
    employee_position       VARCHAR(100),
    employee_location       VARCHAR(100),

    -- Assignment (HR staff handling this ticket)
    assigned_to_user_id     VARCHAR(50),
    assigned_to_user_name   VARCHAR(255),
    assigned_to_user_email  VARCHAR(255),
    assigned_to_team        VARCHAR(100),
    assigned_to_department  VARCHAR(100),
    vacation_type_id        INT,

    -- Who raised the ticket
    raised_by               VARCHAR(20) DEFAULT 'employee'
                                CHECK (raised_by IN ('employee', 'hr_staff')),
    raised_by_id            VARCHAR(50),
    raised_by_name          VARCHAR(255),
    raised_by_email         VARCHAR(255),

    -- Status & Priority
    priority                VARCHAR(20) DEFAULT 'Medium'
                                CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
    internal_status         VARCHAR(30) NOT NULL DEFAULT 'New'
                                CHECK (internal_status IN (
                                    'Pending Employee', 'Pending Third Party',
                                    'Under Process', 'Closed', 'Completed', 'New'
                                )),
    sap_status              VARCHAR(20)
                                CHECK (sap_status IN ('pending', 'approved', 'rejected', 'cancelled')),

    -- Leave details (nullable — only for leave/attendance tickets)
    start_date              DATE,
    end_date                DATE,
    start_time              TIME,
    end_time                TIME,

    -- SAP integration
    sap_external_code       TEXT UNIQUE,

    -- Timestamps
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),
    resolved_at             TIMESTAMPTZ,
    sla_deadline            TIMESTAMPTZ NOT NULL,

    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);


-- #2 ticket_communications
DROP TABLE IF EXISTS ticket_communications CASCADE;

CREATE TABLE ticket_communications (
    id                  SERIAL PRIMARY KEY,
    ticket_id           VARCHAR(50) NOT NULL,
    message_text        TEXT NOT NULL,
    sender_type         VARCHAR(20) NOT NULL
                            CHECK (sender_type IN ('employee', 'hr_staff')),

    -- Employee info (populated when sender_type = 'employee')
    employee_id         VARCHAR(50),
    employee_name       VARCHAR(255),
    employee_email      VARCHAR(255),
    employee_department VARCHAR(100),

    -- HR staff info (populated when sender_type = 'hr_staff')
    hr_user_id          VARCHAR(50),
    hr_user_name        VARCHAR(255),
    hr_user_email       VARCHAR(255),
    hr_department       VARCHAR(100),

    created_at          TIMESTAMPTZ DEFAULT NOW(),

    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
    CONSTRAINT valid_sender_info CHECK (
        (sender_type = 'employee' AND employee_id IS NOT NULL) OR
        (sender_type = 'hr_staff' AND hr_user_id IS NOT NULL)
    )
);


-- #3 ticket_attachments
DROP TABLE IF EXISTS ticket_attachments CASCADE;

CREATE TABLE ticket_attachments (
    id                  SERIAL PRIMARY KEY,
    ticket_id           VARCHAR(50) NOT NULL,
    original_filename   VARCHAR(255) NOT NULL,
    stored_filename     VARCHAR(255) NOT NULL UNIQUE,
    file_size_bytes     BIGINT NOT NULL,
    file_type           VARCHAR(100) NOT NULL,
    file_path           TEXT NOT NULL,
    uploaded_by_type    VARCHAR(20) NOT NULL
                            CHECK (uploaded_by_type IN ('employee', 'hr_staff')),
    uploaded_by_name    VARCHAR(255) NOT NULL,
    uploaded_by_id      VARCHAR(50),
    uploaded_at         TIMESTAMPTZ DEFAULT NOW(),

    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE
);


-- #4 ticket_internal_notes
DROP TABLE IF EXISTS ticket_internal_notes CASCADE;

CREATE TABLE ticket_internal_notes (
    id              SERIAL PRIMARY KEY,
    ticket_id       VARCHAR(50) NOT NULL,
    note_text       TEXT NOT NULL,
    hr_user_id      VARCHAR(50) NOT NULL,
    hr_user_name    VARCHAR(255) NOT NULL,
    hr_user_email   VARCHAR(255) NOT NULL,
    hr_department   VARCHAR(100),
    created_at      TIMESTAMPTZ DEFAULT NOW(),

    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE
);


-- #5 ticket_activity_log
DROP TABLE IF EXISTS ticket_activity_log CASCADE;

CREATE TABLE ticket_activity_log (
    id                      SERIAL PRIMARY KEY,
    ticket_id               VARCHAR(50) NOT NULL,
    change_type             VARCHAR(20) NOT NULL
                                CHECK (change_type IN ('status', 'priority', 'assignment')),
    old_value               VARCHAR(255),
    new_value               VARCHAR(255),
    changed_by_type         VARCHAR(20) NOT NULL
                                CHECK (changed_by_type IN ('employee', 'hr_staff')),
    changed_by_id           VARCHAR(50),
    changed_by_name         VARCHAR(255) NOT NULL,
    changed_by_email        VARCHAR(255),
    changed_by_department   VARCHAR(100),
    changed_at              TIMESTAMPTZ DEFAULT NOW(),

    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE
);


-- ============================================================
-- Verification queries — run after applying schema:
--
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- SELECT conname, conrelid::regclass, confrelid::regclass FROM pg_constraint WHERE contype = 'f';
-- SELECT conname, conrelid::regclass, pg_get_constraintdef(oid) FROM pg_constraint WHERE contype = 'c';
-- ============================================================
