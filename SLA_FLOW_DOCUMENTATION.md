# SLA System Flow Documentation

## Complete Ticket Creation to SLA Rules Flow

```
                                    |
┌─────────────────────────────────────────────────────────────────────┐
│                    STEP 1: EMPLOYEE CREATES TICKET                  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    Employee Enters:                    System Knows:
                    ├─ Support Category                 ├─ Entity
                    ├─ Subcategory                      ├─ Employee Class
                    ├─ Description                      ├─ Username
                    ├─ Notes                            ├─ User ID
                    └─ etc.                             ├─ Email
                                                        ├─ Location
                                                        └─ etc.
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    STEP 2: TICKETING RULES LOOKUP                   │
│                                                                     │
│  INPUT:  Entity + Category + Subcategory                            │
│  OUTPUT: Group + Priority                                           │
│                                                                     │
│  Example:                                                           │
│  Acme Corp + HR + Payroll → HR Payroll Group + High Priority        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    Ticket Now Has:
                    ├─ Employee Details (Entity, Class, etc.)
                    ├─ Ticket Details (Category, Subcategory)
                    ├─ Group Assignment ✅
                    └─ Priority ✅
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   STEP 3: SLA ASSIGNMENT LOOKUP                     │
│                                                                     │
│  INPUT:  Entity + Category + Subcategory + Employee Class           │
│  OUTPUT: SLA ID                                                     │
│                                                                     │
│  Example:                                                           │
│  Acme Corp + HR + Payroll + Full-time → SLA-002                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    Ticket Now Has:
                    ├─ Employee Details
                    ├─ Ticket Details
                    ├─ Group Assignment
                    ├─ Priority
                    └─ SLA ID ✅
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    STEP 4: SLA RULES LOOKUP                         │
│                                                                     │
│  INPUT:  SLA ID + Priority                                          │
│  OUTPUT: Response Time Rules (2 rules)                              │
│                                                                     │
│  Example: SLA-002 + High Priority                                   │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Rule 1: Initial Review                                      │    │
│  │  ├─ Response Time: 1 Hour                                   │    │
│  │  ├─ Time Type: Working Time                                 │    │
│  │  └─ When: Status = New (not assigned)                       │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Rule 2: Completion Due                                      │    │
│  │  ├─ Response Time: 4 Hours                                  │    │
│  │  ├─ Time Type: Working Time                                 │    │
│  │  └─ When: Status = Under Process                            │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    STEP 5: TIMER ACTIVATION                         │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
        ┌─────────────────────┐       ┌─────────────────────┐
        │  INITIAL REVIEW     │       │ COMPLETION DUE      │
        │  TIMER              │       │  TIMER              │
        └─────────────────────┘       └─────────────────────┘
                    │                               │
        Status: New (not assigned)      Status: Under Process
        Countdown: 1 Hour               Countdown: 4 Hours
        Type: Working Time              Type: Working Time
                    │                               │
                    ▼                               ▼
        Agent must acknowledge          Agent must complete
        within 1 hour                   within 4 hours
                    │                               │
                    └───────────────┬───────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    TIMER BEHAVIOR BY STATUS                         │
│                                                                     │
│  ⏸️  PAUSED:                                                        │
│     ├─ Pending Third Party                                          │
│     └─ Pending Employee                                             │
│                                                                     │
│  ✅ STOPPED:                                                        │
│     ├─ Completed                                                    │
│     └─ Closed                                                       │
│                                                                     │
│  🔴 BREACHED:                                                       │
│     └─ Timer expired before completion                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Step-by-Step Breakdown

### Step 1: Employee Creates Ticket

**Employee Actions:**
- Selects Support Category (e.g., HR)
- Selects Subcategory (e.g., Payroll)
- Enters Description
- Adds Notes (optional)

**System Already Knows:**
- Entity (e.g., Acme Corp)
- Employee Class (e.g., Full-time)
- Username
- User ID
- Email
- Location
- Department, Manager, Job Title, Phone Number, etc.

---

### Step 2: Ticketing Rules Lookup

**Purpose:** Determine ticket routing and priority

**Lookup Logic:**
```
Match: Entity + Category + Subcategory
Return: Group + Priority
```

**Example:**
```
Input:  Acme Corp + HR + Payroll
Output: HR Payroll Group + High Priority
```

**Result:** Ticket is now assigned to a group and has a priority level.

---

### Step 3: SLA Assignment Lookup

**Purpose:** Determine which SLA policy applies to this ticket

**Lookup Logic:**
```
Match: Entity + Category + Subcategory + Employee Class
Return: SLA ID
```

**Example:**
```
Input:  Acme Corp + HR + Payroll + Full-time
Output: SLA-002
```

**Result:** Ticket now has an SLA ID that defines its service level requirements.

---

### Step 4: SLA Rules Lookup

**Purpose:** Get the actual response time requirements

**Lookup Logic:**
```
Match: SLA ID + Priority
Return: 2 Rules (Initial Review + Completion Due)
```

**Example:**
```
Input: SLA-002 + High Priority

Returns:
┌─────────────────────────────────────┐
│ Rule 1: Initial Review              │
│  - Response Time: 1 Hour             │
│  - Time Type: Working Time           │
│  - Active When: Status = New         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Rule 2: Completion Due              │
│  - Response Time: 4 Hours            │
│  - Time Type: Working Time           │
│  - Active When: Status = Under Process│
└─────────────────────────────────────┘
```

**Result:** System knows exactly how long the agent has to respond and complete the ticket.

---

### Step 5: Timer Activation

**Two Timers Are Created:**

#### 1. Initial Review Timer
- **Starts:** When ticket status = "New" (not assigned to any agent)
- **Duration:** Based on SLA Rules (e.g., 1 Hour)
- **Purpose:** Agent must acknowledge/start working on the ticket
- **Time Type:** Working Time or Calendar Time

#### 2. Completion Due Timer
- **Starts:** When ticket status = "Under Process"
- **Duration:** Based on SLA Rules (e.g., 4 Hours)
- **Purpose:** Agent must resolve/complete the ticket
- **Time Type:** Working Time or Calendar Time

---

## Timer Behavior by Status

### ⏸️ Timer PAUSED
Timer stops counting but does NOT reset. Resumes when status changes.

**Statuses:**
- Pending Third Party
- Pending Employee

### ✅ Timer STOPPED
Timer stops permanently. Ticket is considered resolved.

**Statuses:**
- Completed
- Closed

### 🔴 Timer BREACHED
Timer expired before ticket was completed.

**Result:**
- Ticket marked as "SLA Breached"
- Alerts/notifications triggered
- Visible in dashboards and reports

---

## Time Types Explained

### Working Time
- **Definition:** Only counts business hours
- **Default Hours:** Sunday - Thursday, 8:00 AM - 5:00 PM
- **Example:** If ticket created at 4:30 PM with 1-hour SLA, timer will pause at 5:00 PM and resume at 8:00 AM next working day

### Calendar Time
- **Definition:** Counts 24/7 continuously
- **Example:** If ticket created at 4:30 PM with 1-hour SLA, it must be addressed by 5:30 PM same day

### Custom Time
- **Definition:** Uses custom operating hours defined in Operating Hours section
- **Example:** Different hours for different regions or departments

---

## Real-World Example: Sarah's Payroll Issue

### Initial State
**Sarah (Full-time employee at Acme Corp)** creates a ticket:
- Category: HR
- Subcategory: Payroll
- Description: "My salary was not deposited"

### Step-by-Step Processing

1. **Ticketing Rules Lookup**
   ```
   Acme Corp + HR + Payroll
   → HR Payroll Group + High Priority
   ```

2. **SLA Assignment Lookup**
   ```
   Acme Corp + HR + Payroll + Full-time
   → SLA-002
   ```

3. **SLA Rules Lookup**
   ```
   SLA-002 + High Priority
   → Initial Review: 1 Hour (Working Time)
   → Completion Due: 4 Hours (Working Time)
   ```

4. **Timer Activation**
   - **Initial Review Timer:** Starts immediately (1 hour countdown)
   - Agent from HR Payroll Group must acknowledge within 1 hour

5. **Agent Assigns to Self**
   - Status changes to "Under Process"
   - **Completion Due Timer:** Starts now (4 hour countdown)
   - Agent must resolve within 4 hours

6. **Agent Needs Info from Finance**
   - Status changes to "Pending Third Party"
   - **Both Timers:** PAUSED ⏸️

7. **Finance Responds**
   - Status changes back to "Under Process"
   - **Completion Due Timer:** RESUMES from where it paused

8. **Agent Resolves Issue**
   - Status changes to "Completed"
   - **All Timers:** STOPPED ✅
   - SLA met successfully

---

## Key Insights

### Why Three Separate Tables?

1. **Ticketing Rules**
   - Purpose: Route tickets to correct group and set priority
   - Based on: Entity + Category + Subcategory + Employee Class
   - Output: Group + Priority

2. **SLA Assignment**
   - Purpose: Map tickets to SLA policies
   - Based on: Entity + Category + Subcategory + Employee Class
   - Output: SLA ID

3. **SLA Rules**
   - Purpose: Define actual time requirements
   - Based on: SLA ID + Priority
   - Output: Response Times + Time Types

### Why Three Separate Tables Are Necessary

**Enterprise Scale Requirements:**
- **1 Entity** can have:
  - 50+ different configurations
  - 150+ categories
  - 500+ subcategories
  - Multiple countries and branches
  - Corporate/company-wide structures

**Separation Benefits:**

1. **Ticketing Rules** (Routing Logic)
   ```
   Entity + Category + Subcategory + Employee Class → Group + Priority
   ```
   - Focuses on ticket routing and assignment
   - Determines which team handles the ticket
   - Sets initial priority level

2. **SLA Assignment** (Policy Mapping)
   ```
   Entity + Category + Subcategory + Employee Class → SLA ID
   ```
   - Centralized SLA policy management
   - Reusable across multiple ticketing rules
   - Easier to update policies without affecting routing
   - Supports multi-tenancy (different branches/countries sharing SLA policies)

3. **SLA Rules** (Time Requirements)
   ```
   SLA ID + Priority → Response Times + Time Types
   ```
   - Defines actual service level commitments
   - Single source of truth for time requirements
   - One SLA ID can serve multiple assignments

**Why NOT to Merge:**
- Merging SLA Assignment into Ticketing Rules would create massive redundancy
- Potential combinations: 50 entities × 150 categories × 500 subcategories × 4 employee classes = **15,000,000 rows**
- Separate tables allow for reusability and centralized management
- Changes to SLA policies don't require updating routing rules

---

## Technical Implementation Notes

### Database Tables

1. **ticketing_rules**
   - entity_id
   - category_id
   - subcategory_id
   - employee_class
   - group_id
   - priority
   - (proposed: sla_id)

2. **sla_assignments**
   - entity_id
   - category_id
   - subcategory_id
   - employee_class
   - sla_id

3. **sla_rules**
   - sla_id
   - priority
   - sla_type (Initial Review / Completion Due)
   - response_time
   - time_type (Working Time / Calendar Time / Custom Time)

### Timer Logic Pseudocode

```javascript
function activateTimers(ticket) {
  // Get SLA rules
  const slaRules = getSLARules(ticket.slaId, ticket.priority)
  
  // Initial Review Timer
  if (ticket.status === 'New') {
    startTimer(slaRules.initialReview)
  }
  
  // Completion Due Timer
  if (ticket.status === 'Under Process') {
    startTimer(slaRules.completionDue)
  }
  
  // Pause timers
  if (['Pending Third Party', 'Pending Employee'].includes(ticket.status)) {
    pauseAllTimers(ticket)
  }
  
  // Stop timers
  if (['Completed', 'Closed'].includes(ticket.status)) {
    stopAllTimers(ticket)
  }
}
```

---

## Questions for Leadership

1. **Priority Source:**
   - Is Priority always set by Ticketing Rules?
   - Or can it be manually changed later by agents/admins?

2. **SLA Types:**
   - ✅ Confirmed: Only Initial Review and Completion Due needed
   - Any future plans for additional SLA types?

3. **Timer Behavior:**
   - ✅ Confirmed: Timers pause for Pending statuses, stop for Completed/Closed
   - Any exceptions or special cases?

4. **Employee Class in Ticketing Rules:**
   - ✅ Confirmed: Employee Class is part of Ticketing Rules matching criteria
   - Used in both Ticketing Rules and SLA Configuration lookups

## Confirmed Design Decisions

✅ **Three Separate Tables Required:**
- Ticketing Rules (Routing)
- SLA Assignment (Policy Mapping)
- SLA Rules (Time Requirements)

✅ **Cannot Merge Tables:**
- Enterprise scale: 50+ entities, 150+ categories, 500+ subcategories
- Multi-country, multi-branch support required
- Separation enables reusability and centralized management

---

**Document Version:** 1.0  
**Last Updated:** April 22, 2026  
**Created By:** System Documentation
