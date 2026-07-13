import {
  Activity, Flag, Headphones, Users, Building2,
  FileCheck, AlertOctagon, Clock, CalendarClock, Hourglass,
  User, UserCheck, UserPlus, Star, UsersRound, Crown,
  Ticket, FolderOpen, Folder,
  BarChart3, CalendarDays, TimerReset, HourglassIcon,
  BadgePercent, FileText,
  ChevronsUp, UserCog, BriefcaseBusinessIcon, UserRoundCog,
  BookUser, ContactRound, Building, IdCard, TriangleAlert,
  TicketMinus, Layers2, Layers,
} from 'lucide-react'

// ─── Notification rule enums ──────────────────────────────────────────────────

export const CONDITION_TYPE = {
  STATUS: 'Status',
  PRIORITY: 'Priority',
  SLA: 'SLA',
  TICKET_AGE: 'Ticket Age',
  START_DATE: 'Start Date',
  RESOLUTION_TIME: 'Resolution Time',
  ENTITY: 'Entity',
  CUSTOM_EMAIL: 'Custom Email',
}

export const WHEN_TYPE = {
  IMMEDIATE: 'immediate',
  TIME: 'time',
  BREACH: 'breach',
}

export const COND_OP = {
  AND: 'AND',
  OR: 'OR',
}
export const COND_OPS = [COND_OP.AND, COND_OP.OR]

export const TIME_UNIT = {
  MINUTES: 'minutes',
  HOURS: 'hours',
  DAYS: 'days',
}
export const TIME_UNITS = [TIME_UNIT.MINUTES, TIME_UNIT.HOURS, TIME_UNIT.DAYS]

export const AGE_OPTION = {
  NORMAL: 'normal',
  BREACHED: 'breached',
}
export const AGE_OPTIONS = [AGE_OPTION.NORMAL, AGE_OPTION.BREACHED]

export const PERSONA_EXTRA = {
  GROUP: 'group',
  AGENT: 'agent',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
}

// ─── Condition types ────────────────────────────────────────────────────────────

export const COND_TYPES = [
  {
    value: 'Status', label: 'Status changed', icon: Flag, color: '#3b82f6',
    subtypes: ['Any status change', 'New', 'Under process', 'Pending employee', 'Pending third party', 'Completed', 'Closed'],
    whenType: 'immediate',
    template: {
      subject: 'Ticket {{ticket_id}} status changed to {{status}}',
      body: `Dear {{employee_name}},\n\nThe status of your ticket has been updated.\n\nTicket ID: {{ticket_id}}\nTitle: {{ticket_title}}\nNew status: {{status}}\nEntity: {{entity}}\nDate & time: {{date_time}}\n\nThank you.`,
    },
  },
  {
    value: 'Priority', label: 'Priority changed', icon: ChevronsUp, color: '#fc6900',
    subtypes: ['Any priority change', 'Low → Medium', 'Medium → High', 'High → Critical', 'Downgraded'],
    whenType: 'immediate',
    template: {
      subject: 'Ticket {{ticket_id}} priority changed to {{priority}}',
      body: `Dear {{employee_name}},\n\nThe priority of your ticket has been changed.\n\nTicket ID: {{ticket_id}}\nTitle: {{ticket_title}}\nNew priority: {{priority}}\nStatus: {{status}}\nEntity: {{entity}}\nDate & time: {{date_time}}\n\nThank you.`,
    },
  },
  {
    value: 'Agent', label: 'Agent assigned / changed', icon: UserCog, color: '#eab308',
    subtypes: ['Any agent change', 'Agent assigned', 'Agent unassigned', 'Agent reassigned'],
    whenType: 'immediate',
    template: {
      subject: 'Ticket {{ticket_id}} has been assigned to a new agent',
      body: `Dear {{employee_name}},\n\nYour ticket has been assigned or reassigned to an agent.\n\nTicket ID: {{ticket_id}}\nTitle: {{ticket_title}}\nStatus: {{status}}\nPriority: {{priority}}\nDate & time: {{date_time}}\n\nThank you.`,
    },
  },
  {
    value: 'Team', label: 'Team assigned / changed', icon: ContactRound, color: '#8b5cf6',
    subtypes: ['Any team change', 'Team assigned', 'Team changed', 'Team removed'],
    whenType: 'immediate',
    template: {
      subject: 'Ticket {{ticket_id}} team assignment updated',
      body: `Dear {{employee_name}},\n\nThe team assigned to your ticket has been updated.\n\nTicket ID: {{ticket_id}}\nTitle: {{ticket_title}}\nStatus: {{status}}\nPriority: {{priority}}\nDate & time: {{date_time}}\n\nThank you.`,
    },
  },
  {
    value: 'Entity', label: 'Entity changed', icon: Building, color: '#3b82f6',
    subtypes: ['Any entity change'],
    whenType: 'immediate',
    template: {
      subject: 'Ticket {{ticket_id}} entity updated to {{entity}}',
      body: `Dear {{employee_name}},\n\nThe entity linked to your ticket has been changed.\n\nTicket ID: {{ticket_id}}\nTitle: {{ticket_title}}\nNew entity: {{entity}}\nStatus: {{status}}\nDate & time: {{date_time}}\n\nThank you.`,
    },
  },
  {
    value: 'Employee Class', label: 'Employee class changed', icon: IdCard, color: '#f59e0b',
    subtypes: ['Any class change', 'Fulltime', 'Partime', 'Contractor', 'Intern', 'VIP', 'Changed to lower tier', 'Changed to higher tier'],
    whenType: 'immediate',
    template: {
      subject: 'Ticket {{ticket_id}} — employee class updated',
      body: `Dear {{employee_name}},\n\nThe employee class associated with your ticket has been updated.\n\nTicket ID: {{ticket_id}}\nEmployee class: {{employee_class}}\nEntity: {{entity}}\nDate & time: {{date_time}}\n\nThank you.`,
    },
  },
  {
    value: 'SLA', label: 'SLA breached or not', icon: TriangleAlert, color: '#ef4444',
    subtypes: ['SLA breached', 'SLA at risk', 'SLA met'],
    whenType: 'breach',
    template: {
      subject: 'URGENT — Ticket {{ticket_id}} SLA deadline update',
      body: `Dear {{employee_name}},\n\nThis is an automated SLA alert for ticket {{ticket_id}}.\n\nTicket ID: {{ticket_id}}\nTitle: {{ticket_title}}\nSLA deadline: {{sla_deadline}}\nPriority: {{priority}}\nStatus: {{status}}\nEntity: {{entity}}\nDate & time: {{date_time}}\n\nPlease take immediate action.\n\nThank you.`,
    },
  },
  {
    value: 'Resolution Time', label: 'Resolution time', icon: TimerReset, color: '#10b981',
    subtypes: ['Approaching deadline', 'Passed deadline', 'Resolved on time', 'Resolved late'],
    whenType: 'time',
    template: {
      subject: 'Ticket {{ticket_id}} — resolution time alert',
      body: `Dear {{employee_name}},\n\nThis is a resolution time reminder for ticket {{ticket_id}}.\n\nTicket ID: {{ticket_id}}\nTitle: {{ticket_title}}\nResolution time: {{resolution_time}}\nSLA deadline: {{sla_deadline}}\nPriority: {{priority}}\nStatus: {{status}}\nDate & time: {{date_time}}\n\nThank you.`,
    },
  },
  {
    value: 'Start Date', label: 'Ticket start date & time', icon: CalendarClock, color: '#3b82f6',
    subtypes: ['On ticket creation', 'X hours after creation', 'X days after creation'],
    whenType: 'time',
    template: {
      subject: 'Ticket {{ticket_id}} opened on {{date_time}}',
      body: `Dear {{employee_name}},\n\nA new ticket has been opened.\n\nTicket ID: {{ticket_id}}\nTitle: {{ticket_title}}\nCategory: {{category}}\nSubcategory: {{subcategory}}\nEntity: {{entity}}\nPriority: {{priority}}\nOpened on: {{date_time}}\n\nThank you.`,
    },
  },
  {
    value: 'Ticket Age', label: 'Ticket age (counter)', icon: Hourglass, color: '#f59e0b',
    subtypes: ['Exceeds threshold', 'Every N days open', 'Still open after', 'Idle with no update'],
    whenType: 'time',
    template: {
      subject: 'Ticket {{ticket_id}} has been open for {{ticket_age}}',
      body: `Dear {{employee_name}},\n\nTicket {{ticket_id}} has been open for an extended period and may require attention.\n\nTicket ID: {{ticket_id}}\nTitle: {{ticket_title}}\nTicket age: {{ticket_age}}\nPriority: {{priority}}\nStatus: {{status}}\nEntity: {{entity}}\nDate & time: {{date_time}}\n\nPlease review and take action if needed.\n\nThank you.`,
    },
  },
]

// ─── Personas ──────────────────────────────────────────────────────────────────

export const PERSONAS = [
  { id: 'employee', label: 'Employee', icon: User, extra: null },
  { id: 'agent', label: 'Assigned agent', icon: UserRoundCog, extra: null },
  { id: 'assigned_group', label: 'Assigned team', icon: ContactRound, extra: null },
  { id: 'manager_group', label: 'Manager of ticket group', icon: Crown, extra: null },
  { id: 'other_employee', label: 'Other employee', icon: Users, extra: 'employee' },
  { id: 'other_agent', label: 'Other assigned agent', icon: UsersRound, extra: 'agent' },
  { id: 'other_group', label: 'Other assigned team', icon: BookUser, extra: 'group' },
  { id: 'other_manager', label: 'Other manager', icon: BriefcaseBusinessIcon, extra: 'manager' },
]

// ─── Placeholders ──────────────────────────────────────────────────────────────

export const PLACEHOLDERS = [
  {
    group: 'Person',
    items: [
      { key: '{{employee_name}}', label: 'Employee name', icon: User },
      { key: '{{assigned_agent}}', label: 'Assigned agent', icon: UserRoundCog },
      { key: '{{assigned_team}}', label: 'Assigned team', icon: ContactRound },
      { key: '{{manager}}', label: 'Manager', icon: Crown },
    ],
  },
  {
    group: 'Ticket',
    items: [
      { key: '{{ticket_id}}', label: 'Ticket ID', icon: Ticket },
      { key: '{{ticket_title}}', label: 'Ticket title', icon: TicketMinus },
      { key: '{{category}}', label: 'Category', icon: Layers2 },
      { key: '{{subcategory}}', label: 'Subcategory', icon: Layers },
      { key: '{{entity}}', label: 'Entity', icon: Building },
      { key: '{{priority}}', label: 'Priority level', icon: ChevronsUp },
      { key: '{{status}}', label: 'Ticket status', icon: Flag },
      { key: '{{employee_class}}', label: 'Employee class', icon: IdCard },
    ],
  },
  {
    group: 'Time',
    items: [
      { key: '{{date_time}}', label: 'Date & time', icon: CalendarDays },
      { key: '{{sla_deadline}}', label: 'SLA deadline', icon: TriangleAlert },
      { key: '{{resolution_time}}', label: 'Resolution time', icon: TimerReset },
      { key: '{{ticket_age}}', label: 'Ticket age', icon: HourglassIcon },
    ],
  },
]

// ─── Sample data ───────────────────────────────────────────────────────────────

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'NTF-001', name: 'New ticket opened alert', status: true,
    conds: [
      { id: 1006, type: 'Start Date', subtype: 'On ticket creation', whenType: 'time', amount: 1, unit: 'hours', ageBreached: false, op: 'AND' },
      { id: 1007, type: 'Entity', subtype: 'Any entity change', whenType: 'immediate', amount: 1, unit: 'hours', ageBreached: false, op: 'AND' },
    ],
    personas: ['employee', 'assigned_group'],
    subject: 'Ticket {{ticket_id}} opened on {{date_time}}',
    body: 'Dear {{employee_name}},\n\nA new ticket has been opened.\n\nTicket ID: {{ticket_id}}\nPriority: {{priority}}\nOpened on: {{date_time}}\n\nThank you.',
  },
  {
    id: 'NTF-002', name: 'SLA breach — 24h escalation to CEO', status: true,
    conds: [
      { id: 1001, type: 'SLA', subtype: 'SLA breached', whenType: 'breach', amount: 1, unit: 'hours', ageBreached: false, op: 'AND' },
      { id: 1002, type: 'Priority', subtype: 'High → Critical', whenType: 'immediate', amount: 1, unit: 'hours', ageBreached: false, op: 'AND' },
      { id: 1003, type: 'Ticket Age', subtype: 'Exceeds threshold', whenType: 'time', amount: 24, unit: 'hours', ageBreached: true, op: 'OR' },
    ],
    personas: ['agent', 'manager_group', 'other_employee'],
    subject: 'URGENT — Ticket {{ticket_id}} SLA deadline update',
    body: 'Dear {{employee_name}},\n\nThis is an automated SLA alert for ticket {{ticket_id}}.\n\nSLA deadline: {{sla_deadline}}\nPriority: {{priority}}\nStatus: {{status}}\n\nPlease take immediate action.\n\nThank you.',
  },
  {
    id: 'NTF-003', name: 'Ticket resolved confirmation', status: false,
    conds: [
      { id: 1008, type: 'Status', subtype: 'Completed', whenType: 'immediate', amount: 1, unit: 'hours', ageBreached: false, op: 'AND' },
      { id: 1009, type: 'Resolution Time', subtype: 'Resolved on time', whenType: 'time', amount: 1, unit: 'hours', ageBreached: false, op: 'AND' },
    ],
    personas: ['employee', 'agent'],
    subject: 'Ticket {{ticket_id}} has been resolved',
    body: 'Dear {{employee_name}},\n\nYour ticket has been successfully resolved.\n\nTicket ID: {{ticket_id}}\nTitle: {{ticket_title}}\nStatus: {{status}}\nResolution time: {{resolution_time}}\nDate & time: {{date_time}}\n\nThank you for using our support system.',
  },
]

// ─── ID generators ─────────────────────────────────────────────────────────────

let _cidx = 0
export const genCondId = () => ++_cidx
export const genNotifId = () => 'NTF-' + String(Math.floor(Math.random() * 900) + 100)

// ─── Form steps ────────────────────────────────────────────────────────────────

export const FORM_STEPS = [
  { num: 1, label: 'Info', hint: 'Name & status' },
  { num: 2, label: 'Conditions', hint: 'Trigger rules' },
  { num: 3, label: 'Recipients', hint: 'Who gets notified' },
  { num: 4, label: 'Email', hint: 'Subject & body' },
]
