// Team data
export const TEAMS = [
  {
    teamId: "Alpha",
    teamName: "Team A",
    members: ["William Smith", "John Doe"],
  },
  {
    teamId: "Beta",
    teamName: "Team B",
    members: ["Arthur Morgan", "Tommy Shelby"],
  },
];

// Organization Structure Mock Data
export const MOCK_GROUPS = [
  {
    id: 1,
    name: 'HR Recruitment',
    validFrom: '2025-01-01',
    validTo: '2026-12-31',
    parentName: 'HR Department',
    externalCode: 'HR-001',
    members: [
      { id: 1,  employeeId: 12,  name: 'Ahmed Al-Rashidi',    userType: 'Agent',      from: '2025-01-01', to: '2026-12-31' },
      { id: 2,  employeeId: 13,  name: 'Sara Al-Mutairi',     userType: 'Manager',    from: '2025-02-01', to: '2026-10-31' },
      { id: 3,  employeeId: 17,  name: 'Khalid Nasser',       userType: 'Agent',      from: '2024-06-01', to: '2025-05-31' }, // 20%
      { id: 4,  employeeId: 18,  name: 'Fatima Al-Zahra',     userType: 'Supervisor', from: '2025-03-01', to: '2026-11-30' },
      { id: 5,  employeeId: 19,  name: 'Omar Al-Fahad',       userType: 'Agent',      from: '2025-04-01', to: '2026-09-30' },
      { id: 6,  employeeId: 20,  name: 'Nora Al-Hamdan',      userType: 'Manager',    from: '2025-01-15', to: '2026-12-31' },
      { id: 7,  employeeId: 21,  name: 'Yousef Al-Ahmad',     userType: 'Agent',      from: '2025-06-01', to: '2026-08-31' },
      { id: 8,  employeeId: 22,  name: 'Layla Al-Saud',       userType: 'Supervisor', from: '2024-09-01', to: '2025-08-31' }, // 20%
    ],
  },
  {
    id: 1.1,
    name: 'HR Payroll',
    validFrom: '2025-01-01',
    validTo: '2026-12-31',
    parentName: 'HR Department',
    externalCode: 'HR-002',
    members: [
      { id: 1,  employeeId: 23,  name: 'Mohammed Al-Khalid',  userType: 'Agent',      from: '2025-05-01', to: '2026-12-31' },
      { id: 2,  employeeId: 24,  name: 'Huda Al-Rashid',      userType: 'Manager',    from: '2025-07-01', to: '2026-07-31' },
      { id: 3,  employeeId: 25,  name: 'Ali Al-Mansour',      userType: 'Agent',      from: '2025-02-15', to: '2026-11-30' },
      { id: 4,  employeeId: 26,  name: 'Mariam Al-Saeed',     userType: 'Supervisor', from: '2025-08-01', to: '2026-12-31' },
    ],
  },
  {
    id: 1.2,
    name: 'HR Benefits',
    validFrom: '2025-01-01',
    validTo: '2026-12-31',
    parentName: 'HR Department',
    externalCode: 'HR-003',
    members: [
      { id: 1,  employeeId: 27,  name: 'Khalid Al-Omar',      userType: 'Agent',      from: '2025-03-15', to: '2026-06-30' },
      { id: 2,  employeeId: 28,  name: 'Aisha Al-Hassan',     userType: 'Manager',    from: '2025-09-01', to: '2026-12-31' },
      { id: 3,  employeeId: 29,  name: 'Fahad Al-Abdullah',   userType: 'Agent',      from: '2025-01-01', to: '2026-10-31' },
      { id: 4,  employeeId: 30,  name: 'Reem Al-Jaber',       userType: 'Supervisor', from: '2025-04-15', to: '2026-09-30' },
      { id: 5,  employeeId: 31,  name: 'Turki Al-Nasser',     userType: 'Agent',      from: '2025-06-15', to: '2026-12-31' },
      { id: 6,  employeeId: 32,  name: 'Najwa Al-Mohammed',   userType: 'Manager',    from: '2024-11-01', to: '2025-10-31' }, // 20%
      { id: 7,  employeeId: 33,  name: 'Saud Al-Rahman',      userType: 'Agent',      from: '2025-10-01', to: '2026-12-31' },
      { id: 8,  employeeId: 34,  name: 'Lina Al-Faisal',      userType: 'Supervisor', from: '2025-05-15', to: '2026-08-31' },
      { id: 9,  employeeId: 35,  name: 'Yasser Al-Tariq',     userType: 'Agent',      from: '2025-11-01', to: '2026-12-31' },
      { id: 10, employeeId: 36,  name: 'Hana Al-Zain',        userType: 'Manager',    from: '2024-08-01', to: '2025-07-31' }, // 20%
      { id: 11, employeeId: 37,  name: 'Bader Al-Majed',      userType: 'Agent',      from: '2025-07-15', to: '2026-11-30' },
      { id: 12, employeeId: 38,  name: 'Rania Al-Sulaiman',   userType: 'Supervisor', from: '2025-09-15', to: '2026-12-31' },
      { id: 13, employeeId: 39,  name: 'Faisal Al-Hamad',     userType: 'Agent',      from: '2025-03-01', to: '2026-10-31' },
    ],
  },
  {
    id: 2,
    name: 'IT Helpdesk',
    validFrom: '2025-03-01',
    validTo: '2026-11-30',
    parentName: 'IT Department',
    externalCode: 'IT-001',
    members: [
      { id: 1,  employeeId: 40,  name: 'Majed Al-Ansari',     userType: 'Agent',      from: '2025-03-01', to: '2026-12-31' },
      { id: 2,  employeeId: 41,  name: 'Dana Al-Khalifa',     userType: 'Manager',    from: '2024-07-01', to: '2025-06-30' }, // 20%
      { id: 3,  employeeId: 42,  name: 'Sami Al-Harbi',       userType: 'Agent',      from: '2025-04-01', to: '2026-10-31' },
      { id: 4,  employeeId: 43,  name: 'Amal Al-Muhammad',    userType: 'Supervisor', from: '2025-01-15', to: '2026-12-31' },
      { id: 5,  employeeId: 44,  name: 'Khaloud Al-Abdulaziz',userType: 'Agent',      from: '2025-06-01', to: '2026-09-30' },
      { id: 6,  employeeId: 45,  name: 'Hussam Al-Ali',       userType: 'Manager',    from: '2024-11-01', to: '2025-10-31' }, // 20%
      { id: 7,  employeeId: 46,  name: 'Rasha Al-Mutairi',    userType: 'Agent',      from: '2025-02-01', to: '2026-11-30' },
      { id: 8,  employeeId: 47,  name: 'Fahd Al-Bandar',      userType: 'Supervisor', from: '2025-05-15', to: '2026-08-31' },
    ],
  },
  {
    id: 2.1,
    name: 'IT Infrastructure',
    validFrom: '2025-03-01',
    validTo: '2026-11-30',
    parentName: 'IT Department',
    externalCode: 'IT-002',
    members: [
      { id: 1,  employeeId: 48,  name: 'Joud Al-Ahmari',      userType: 'Agent',      from: '2025-03-15', to: '2026-12-31' },
      { id: 2,  employeeId: 49,  name: 'Noura Al-Owaish',     userType: 'Manager',    from: '2025-07-01', to: '2026-07-31' },
      { id: 3,  employeeId: 50,  name: 'Abdulaziz Al-Rajhi',  userType: 'Agent',      from: '2025-01-01', to: '2026-06-30' },
      { id: 4,  employeeId: 51,  name: 'Salma Al-Ghamdi',     userType: 'Supervisor', from: '2025-09-01', to: '2026-12-31' },
    ],
  },
  {
    id: 2.2,
    name: 'IT Security',
    validFrom: '2025-03-01',
    validTo: '2026-11-30',
    parentName: 'IT Department',
    externalCode: 'IT-003',
    members: [
      { id: 1,  employeeId: 52,  name: 'Mansour Al-Dossary',  userType: 'Agent',      from: '2024-09-01', to: '2025-08-31' }, // 20%
      { id: 2,  employeeId: 53,  name: 'Hind Al-Shammari',    userType: 'Manager',    from: '2025-04-15', to: '2026-10-31' },
      { id: 3,  employeeId: 54,  name: 'Sultan Al-Qahtani',   userType: 'Agent',      from: '2025-08-01', to: '2026-12-31' },
      { id: 4,  employeeId: 55,  name: 'Lujain Al-Murshed',   userType: 'Supervisor', from: '2025-02-15', to: '2026-05-31' },
      { id: 5,  employeeId: 56,  name: 'Ahmad Al-Bakr',       userType: 'Agent',      from: '2025-06-15', to: '2026-11-30' },
      { id: 6,  employeeId: 57,  name: 'Mona Al-Hajri',       userType: 'Manager',    from: '2025-10-01', to: '2026-09-30' },
      { id: 7,  employeeId: 58,  name: 'Naif Al-Malki',       userType: 'Agent',      from: '2025-03-01', to: '2026-12-31' },
      { id: 8,  employeeId: 59,  name: 'Raghad Al-Saleh',     userType: 'Supervisor', from: '2024-05-01', to: '2025-04-30' }, // 20%
      { id: 9,  employeeId: 60,  name: 'Basil Al-Omari',      userType: 'Agent',      from: '2025-11-01', to: '2026-12-31' },
      { id: 10, employeeId: 61,  name: 'Dunya Al-Wahab',      userType: 'Manager',    from: '2025-05-01', to: '2026-04-30' },
      { id: 11, employeeId: 62,  name: 'Feras Al-Jabr',       userType: 'Agent',      from: '2025-07-15', to: '2026-08-31' },
      { id: 12, employeeId: 63,  name: 'Shahad Al-Muqbel',    userType: 'Supervisor', from: '2025-01-01', to: '2026-12-31' },
    ],
  },
  {
    id: 3,
    name: 'Finance Accounting',
    validFrom: '2025-01-01',
    validTo: '2026-12-31',
    parentName: 'Finance Department',
    externalCode: 'FIN-001',
    members: [
      { id: 1,  employeeId: 64,  name: 'Abdullah Al-Sulaiman',userType: 'Agent',      from: '2025-01-01', to: '2026-12-31' },
      { id: 2,  employeeId: 65,  name: 'Khadija Al-Rashid',   userType: 'Manager',    from: '2025-02-01', to: '2026-11-30' },
      { id: 3,  employeeId: 66,  name: 'Yousef Al-Mutawa',    userType: 'Agent',      from: '2024-06-01', to: '2025-05-31' }, // 20%
      { id: 4,  employeeId: 67,  name: 'Mona Al-Ghazzawi',    userType: 'Supervisor', from: '2025-03-01', to: '2026-10-31' },
      { id: 5,  employeeId: 68,  name: 'Saad Al-Farhan',      userType: 'Agent',      from: '2025-05-01', to: '2026-12-31' },
      { id: 6,  employeeId: 69,  name: 'Lama Al-Mansour',     userType: 'Manager',    from: '2025-04-15', to: '2026-09-30' },
      { id: 7,  employeeId: 70,  name: 'Othman Al-Hammad',    userType: 'Agent',      from: '2024-10-01', to: '2025-09-30' }, // 20%
      { id: 8,  employeeId: 71,  name: 'Rana Al-Khalid',      userType: 'Supervisor', from: '2025-06-01', to: '2026-12-31' },
    ],
  },
  {
    id: 3.1,
    name: 'Finance Planning',
    validFrom: '2025-01-01',
    validTo: '2026-12-31',
    parentName: 'Finance Department',
    externalCode: 'FIN-002',
    members: [
      { id: 1,  employeeId: 72,  name: 'Majed Al-Mohanna',    userType: 'Agent',      from: '2025-07-01', to: '2026-08-31' },
      { id: 2,  employeeId: 73,  name: 'Sajida Al-Hamdan',    userType: 'Manager',    from: '2025-01-15', to: '2026-12-31' },
      { id: 3,  employeeId: 74,  name: 'Nawaf Al-Shammari',   userType: 'Agent',      from: '2025-08-01', to: '2026-11-30' },
      { id: 4,  employeeId: 75,  name: 'Hessa Al-Muqbel',     userType: 'Supervisor', from: '2025-02-15', to: '2026-07-31' },
    ],
  },
  {
    id: 3.2,
    name: 'Finance Audit',
    validFrom: '2025-01-01',
    validTo: '2026-12-31',
    parentName: 'Finance Department',
    externalCode: 'FIN-003',
    members: [
      { id: 1,  employeeId: 76,  name: 'Turki Al-Ahmari',     userType: 'Agent',      from: '2025-09-01', to: '2026-12-31' },
      { id: 2,  employeeId: 77,  name: 'Jawhara Al-Murshid',  userType: 'Manager',    from: '2025-03-15', to: '2026-10-31' },
      { id: 3,  employeeId: 78,  name: 'Fahad Al-Mutairi',    userType: 'Agent',      from: '2025-10-01', to: '2026-12-31' },
      { id: 4,  employeeId: 79,  name: 'Roudha Al-Khalaf',    userType: 'Supervisor', from: '2025-05-15', to: '2026-06-30' },
      { id: 5,  employeeId: 80,  name: 'Sultan Al-Dawood',    userType: 'Agent',      from: '2025-11-01', to: '2026-12-31' },
      { id: 6,  employeeId: 81,  name: 'Amal Al-Bakr',        userType: 'Manager',    from: '2024-08-01', to: '2025-07-31' }, // 20%
      { id: 7,  employeeId: 82,  name: 'Naif Al-Mohaisin',    userType: 'Agent',      from: '2025-06-15', to: '2026-09-30' },
      { id: 8,  employeeId: 83,  name: 'Mona Al-Jabri',       userType: 'Supervisor', from: '2025-04-01', to: '2026-12-31' },
      { id: 9,  employeeId: 84,  name: 'Bader Al-Rashed',     userType: 'Agent',      from: '2025-07-15', to: '2026-11-30' },
      { id: 10, employeeId: 85,  name: 'Hind Al-Mansour',     userType: 'Manager',    from: '2025-08-15', to: '2026-12-31' },
      { id: 11, employeeId: 86,  name: 'Khalid Al-Mutairi',   userType: 'Agent',      from: '2025-02-01', to: '2026-08-31' },
    ],
  },
  {
    id: 4,
    name: 'Operations Support',
    validFrom: '2025-01-01',
    validTo: '2026-12-31',
    parentName: 'Operations Department',
    externalCode: 'OPS-001',
    members: [
      { id: 1,  employeeId: 87,  name: 'Ahmad Al-Fahad',      userType: 'Agent',      from: '2025-01-01', to: '2026-12-31' },
      { id: 2,  employeeId: 88,  name: 'Sara Al-Mohammed',    userType: 'Manager',    from: '2025-02-01', to: '2026-11-30' },
      { id: 3,  employeeId: 89,  name: 'Khalid Al-Harbi',     userType: 'Agent',      from: '2025-03-01', to: '2026-10-31' },
      { id: 4,  employeeId: 90,  name: 'Fatima Al-Ahmari',    userType: 'Supervisor', from: '2024-07-01', to: '2025-06-30' }, // 20%
      { id: 5,  employeeId: 91,  name: 'Omar Al-Rashid',      userType: 'Agent',      from: '2025-04-01', to: '2026-09-30' },
      { id: 6,  employeeId: 92,  name: 'Nora Al-Mansour',     userType: 'Manager',    from: '2025-05-01', to: '2026-12-31' },
      { id: 7,  employeeId: 93,  name: 'Majed Al-Mutairi',    userType: 'Agent',      from: '2025-01-15', to: '2026-08-31' },
      { id: 8,  employeeId: 94,  name: 'Layla Al-Ghamdi',     userType: 'Supervisor', from: '2025-06-01', to: '2026-12-31' },
      { id: 9,  employeeId: 95,  name: 'Sultan Al-Khalifa',   userType: 'Agent',      from: '2025-07-01', to: '2026-07-31' },
      { id: 10, employeeId: 96,  name: 'Hessa Al-Omari',      userType: 'Manager',    from: '2024-10-01', to: '2025-09-30' }, // 20%
      { id: 11, employeeId: 97,  name: 'Yousef Al-Muqbel',    userType: 'Agent',      from: '2025-08-01', to: '2026-11-30' },
      { id: 12, employeeId: 98,  name: 'Rana Al-Bandar',      userType: 'Supervisor', from: '2025-02-15', to: '2026-12-31' },
      { id: 13, employeeId: 99,  name: 'Fahd Al-Jabri',       userType: 'Agent',      from: '2025-09-01', to: '2026-10-31' },
      { id: 14, employeeId: 100, name: 'Mona Al-Faisal',      userType: 'Manager',    from: '2025-03-15', to: '2026-12-31' },
      { id: 15, employeeId: 101, name: 'Saad Al-Murshed',     userType: 'Agent',      from: '2025-10-01', to: '2026-09-30' },
      { id: 16, employeeId: 102, name: 'Lujain Al-Muhammad',  userType: 'Supervisor', from: '2025-04-15', to: '2026-12-31' },
      { id: 17, employeeId: 103, name: 'Ahmad Al-Hamdan',     userType: 'Agent',      from: '2025-05-15', to: '2026-08-31' },
      { id: 18, employeeId: 104, name: 'Khadija Al-Rajhi',    userType: 'Manager',    from: '2025-11-01', to: '2026-12-31' },
      { id: 19, employeeId: 105, name: 'Mansour Al-Malki',    userType: 'Agent',      from: '2025-06-15', to: '2026-11-30' },
      { id: 20, employeeId: 106, name: 'Raghad Al-Ahmari',    userType: 'Supervisor', from: '2024-05-01', to: '2025-04-30' }, // 20%
      { id: 21, employeeId: 107, name: 'Basil Al-Mutawa',     userType: 'Agent',      from: '2025-07-15', to: '2026-12-31' },
      { id: 22, employeeId: 108, name: 'Dunya Al-Muqbel',     userType: 'Manager',    from: '2025-08-15', to: '2026-10-31' },
      { id: 23, employeeId: 109, name: 'Feras Al-Murshid',    userType: 'Agent',      from: '2025-09-15', to: '2026-12-31' },
      { id: 24, employeeId: 110, name: 'Shahad Al-Mansour',   userType: 'Supervisor', from: '2025-01-01', to: '2026-06-30' },
    ],
  },
  {
    id: 5,
    name: 'Security Team',
    validFrom: '2025-01-15',
    validTo: '2025-12-31',
    parentName: 'Security Department',
    externalCode: 'SEC-001',
    members: [
      { id: 1,  employeeId: 111, name: 'Ali Al-Mohammed',     userType: 'Agent',      from: '2025-01-15', to: '2026-12-31' },
      { id: 2,  employeeId: 112, name: 'Aisha Al-Mutairi',    userType: 'Manager',    from: '2025-02-01', to: '2026-11-30' },
      { id: 3,  employeeId: 113, name: 'Khalid Al-Ghamdi',    userType: 'Agent',      from: '2025-03-01', to: '2026-10-31' },
      { id: 4,  employeeId: 114, name: 'Fatima Al-Rashid',    userType: 'Supervisor', from: '2024-06-01', to: '2025-05-31' }, // 20%
      { id: 5,  employeeId: 115, name: 'Omar Al-Mansour',     userType: 'Agent',      from: '2025-04-01', to: '2026-09-30' },
      { id: 6,  employeeId: 116, name: 'Nora Al-Khalifa',     userType: 'Manager',    from: '2025-05-01', to: '2026-12-31' },
      { id: 7,  employeeId: 117, name: 'Majed Al-Hamdan',     userType: 'Agent',      from: '2025-01-01', to: '2026-08-31' },
      { id: 8,  employeeId: 118, name: 'Layla Al-Muqbel',     userType: 'Supervisor', from: '2025-06-01', to: '2026-12-31' },
      { id: 9,  employeeId: 119, name: 'Sultan Al-Murshid',   userType: 'Agent',      from: '2025-07-01', to: '2026-07-31' },
      { id: 10, employeeId: 120, name: 'Hessa Al-Mutairi',    userType: 'Manager',    from: '2024-09-01', to: '2025-08-31' }, // 20%
      { id: 11, employeeId: 121, name: 'Yousef Al-Bandar',    userType: 'Agent',      from: '2025-08-01', to: '2026-11-30' },
      { id: 12, employeeId: 122, name: 'Rana Al-Muhammad',    userType: 'Supervisor', from: '2025-02-15', to: '2026-12-31' },
      { id: 13, employeeId: 123, name: 'Fahd Al-Mansour',     userType: 'Agent',      from: '2025-09-01', to: '2026-10-31' },
      { id: 14, employeeId: 124, name: 'Mona Al-Murshid',     userType: 'Manager',    from: '2025-03-15', to: '2026-12-31' },
      { id: 15, employeeId: 125, name: 'Saad Al-Muqbel',      userType: 'Agent',      from: '2025-10-01', to: '2026-09-30' },
      { id: 16, employeeId: 126, name: 'Lujain Al-Mutairi',   userType: 'Supervisor', from: '2025-04-15', to: '2026-12-31' },
      { id: 17, employeeId: 127, name: 'Ahmad Al-Malki',      userType: 'Agent',      from: '2025-05-15', to: '2026-08-31' },
      { id: 18, employeeId: 128, name: 'Khadija Al-Murshid',  userType: 'Manager',    from: '2025-11-01', to: '2026-12-31' },
      { id: 19, employeeId: 129, name: 'Mansour Al-Muqbel',   userType: 'Agent',      from: '2025-06-15', to: '2026-11-30' },
      { id: 20, employeeId: 130, name: 'Raghad Al-Murshid',   userType: 'Supervisor', from: '2025-07-15', to: '2026-12-31' },
      { id: 21, employeeId: 131, name: 'Basil Al-Muhammad',   userType: 'Agent',      from: '2025-08-15', to: '2026-10-31' },
      { id: 22, employeeId: 132, name: 'Dunya Al-Mutairi',    userType: 'Manager',    from: '2025-09-15', to: '2026-12-31' },
      { id: 23, employeeId: 133, name: 'Feras Al-Murshid',    userType: 'Agent',      from: '2025-01-01', to: '2026-06-30' },
    ],
  },
  {
    id: 6,
    name: 'Logistics Support',
    validFrom: '2025-04-01',
    validTo: '2026-12-31',
    parentName: 'Logistics Department',
    externalCode: 'LOG-001',
    members: [
      { id: 1,  employeeId: 134, name: 'Saud Al-Mohammed',    userType: 'Agent',      from: '2025-04-01', to: '2026-12-31' },
      { id: 2,  employeeId: 135, name: 'Rania Al-Mutairi',    userType: 'Manager',    from: '2025-05-01', to: '2026-11-30' },
      { id: 3,  employeeId: 136, name: 'Khalid Al-Hamdan',    userType: 'Agent',      from: '2024-07-01', to: '2025-06-30' }, // 20%
      { id: 4,  employeeId: 137, name: 'Fatima Al-Muqbel',    userType: 'Supervisor', from: '2025-06-01', to: '2026-10-31' },
      { id: 5,  employeeId: 138, name: 'Omar Al-Mansour',     userType: 'Agent',      from: '2025-01-01', to: '2026-12-31' },
      { id: 6,  employeeId: 139, name: 'Nora Al-Murshid',     userType: 'Manager',    from: '2025-07-01', to: '2026-09-30' },
      { id: 7,  employeeId: 140, name: 'Majed Al-Mutairi',    userType: 'Agent',      from: '2025-02-01', to: '2026-08-31' },
      { id: 8,  employeeId: 141, name: 'Layla Al-Muhammad',   userType: 'Supervisor', from: '2025-08-01', to: '2026-12-31' },
      { id: 9,  employeeId: 142, name: 'Sultan Al-Murshid',   userType: 'Agent',      from: '2024-11-01', to: '2025-10-31' }, // 20%
      { id: 10, employeeId: 143, name: 'Hessa Al-Muqbel',     userType: 'Manager',    from: '2025-09-01', to: '2026-12-31' },
      { id: 11, employeeId: 144, name: 'Yousef Al-Murshid',   userType: 'Agent',      from: '2025-03-01', to: '2026-11-30' },
      { id: 12, employeeId: 145, name: 'Rana Al-Mutairi',     userType: 'Supervisor', from: '2025-10-01', to: '2026-12-31' },
      { id: 13, employeeId: 146, name: 'Fahd Al-Muhammad',    userType: 'Agent',      from: '2025-04-15', to: '2026-10-31' },
      { id: 14, employeeId: 147, name: 'Mona Al-Murshid',     userType: 'Manager',    from: '2025-05-15', to: '2026-12-31' },
      { id: 15, employeeId: 148, name: 'Saad Al-Muqbel',      userType: 'Agent',      from: '2025-11-01', to: '2026-12-31' },
      { id: 16, employeeId: 149, name: 'Lujain Al-Muhammad',  userType: 'Supervisor', from: '2025-06-15', to: '2026-09-30' },
      { id: 17, employeeId: 150, name: 'Ahmad Al-Mutairi',    userType: 'Agent',      from: '2025-07-15', to: '2026-08-31' },
      { id: 18, employeeId: 151, name: 'Khadija Al-Murshid',  userType: 'Manager',    from: '2025-08-15', to: '2026-12-31' },
      { id: 19, employeeId: 152, name: 'Mansour Al-Muqbel',   userType: 'Agent',      from: '2025-01-15', to: '2026-07-31' },
      { id: 20, employeeId: 153, name: 'Raghad Al-Muhammad',  userType: 'Supervisor', from: '2025-09-15', to: '2026-11-30' },
      { id: 21, employeeId: 154, name: 'Basil Al-Mutairi',    userType: 'Agent',      from: '2025-02-15', to: '2026-12-31' },
      { id: 22, employeeId: 155, name: 'Dunya Al-Murshid',    userType: 'Manager',    from: '2025-03-15', to: '2026-10-31' },
      { id: 23, employeeId: 156, name: 'Feras Al-Muqbel',     userType: 'Agent',      from: '2025-10-15', to: '2026-12-31' },
      { id: 24, employeeId: 157, name: 'Shahad Al-Mutairi',   userType: 'Supervisor', from: '2025-04-01', to: '2026-09-30' },
      { id: 25, employeeId: 158, name: 'Sultan Al-Muhammad',  userType: 'Agent',      from: '2025-05-01', to: '2026-12-31' },
    ],
  },
  {
    id: 7,
    name: 'Marketing Support',
    validFrom: '2025-05-01',
    validTo: '2026-12-31',
    parentName: 'Marketing Department',
    externalCode: 'MKT-001',
    members: [
      { id: 1,  employeeId: 159, name: 'Majed Al-Mohammed',   userType: 'Agent',      from: '2025-05-01', to: '2026-12-31' },
      { id: 2,  employeeId: 160, name: 'Rania Al-Mutairi',    userType: 'Manager',    from: '2025-06-01', to: '2026-11-30' },
      { id: 3,  employeeId: 161, name: 'Khalid Al-Muqbel',    userType: 'Agent',      from: '2024-08-01', to: '2025-07-31' }, // 20%
      { id: 4,  employeeId: 162, name: 'Fatima Al-Murshid',   userType: 'Supervisor', from: '2025-07-01', to: '2026-10-31' },
      { id: 5,  employeeId: 163, name: 'Omar Al-Muhammad',    userType: 'Agent',      from: '2025-01-01', to: '2026-12-31' },
      { id: 6,  employeeId: 164, name: 'Nora Al-Mutairi',     userType: 'Manager',    from: '2025-08-01', to: '2026-09-30' },
      { id: 7,  employeeId: 165, name: 'Majed Al-Muqbel',     userType: 'Agent',      from: '2025-02-01', to: '2026-08-31' },
      { id: 8,  employeeId: 166, name: 'Layla Al-Muhammad',   userType: 'Supervisor', from: '2025-09-01', to: '2026-12-31' },
      { id: 9,  employeeId: 167, name: 'Sultan Al-Murshid',   userType: 'Agent',      from: '2025-03-01', to: '2026-11-30' },
      { id: 10, employeeId: 168, name: 'Hessa Al-Mutairi',    userType: 'Manager',    from: '2024-11-01', to: '2025-10-31' }, // 20%
      { id: 11, employeeId: 169, name: 'Yousef Al-Muhammad',  userType: 'Agent',      from: '2025-10-01', to: '2026-12-31' },
      { id: 12, employeeId: 170, name: 'Rana Al-Murshid',     userType: 'Supervisor', from: '2025-04-01', to: '2026-07-31' },
      { id: 13, employeeId: 171, name: 'Fahd Al-Mutairi',     userType: 'Agent',      from: '2025-05-15', to: '2026-10-31' },
      { id: 14, employeeId: 172, name: 'Mona Al-Muqbel',      userType: 'Manager',    from: '2025-06-15', to: '2026-12-31' },
      { id: 15, employeeId: 173, name: 'Saad Al-Muqbel',      userType: 'Agent',      from: '2025-11-01', to: '2026-12-31' },
      { id: 16, employeeId: 174, name: 'Lujain Al-Muhammad',  userType: 'Supervisor', from: '2025-07-15', to: '2026-09-30' },
      { id: 17, employeeId: 175, name: 'Ahmad Al-Mutairi',    userType: 'Agent',      from: '2025-08-15', to: '2026-08-31' },
      { id: 18, employeeId: 176, name: 'Khadija Al-Muqbel',   userType: 'Manager',    from: '2025-09-15', to: '2026-12-31' },
      { id: 19, employeeId: 177, name: 'Mansour Al-Muqbel',   userType: 'Agent',      from: '2025-01-15', to: '2026-11-30' },
      { id: 20, employeeId: 178, name: 'Raghad Al-Muqbel',    userType: 'Supervisor', from: '2025-10-15', to: '2026-12-31' },
      { id: 21, employeeId: 179, name: 'Basil Al-Muqbel',     userType: 'Agent',      from: '2025-02-15', to: '2026-07-31' },
      { id: 22, employeeId: 180, name: 'Dunya Al-Mutairi',    userType: 'Manager',    from: '2025-03-15', to: '2026-10-31' },
    ],
  },
  {
    id: 8,
    name: 'Quality Assurance',
    validFrom: '2025-03-15',
    validTo: '2026-12-31',
    parentName: 'Quality Assurance Department',
    externalCode: 'QA-001',
    members: [
      { id: 1,  employeeId: 181, name: 'Ahmad Al-Mohammed',   userType: 'Agent',      from: '2025-03-15', to: '2026-12-31' },
      { id: 2,  employeeId: 182, name: 'Aisha Al-Mutairi',    userType: 'Manager',    from: '2025-04-01', to: '2026-11-30' },
      { id: 3,  employeeId: 183, name: 'Khalid Al-Muqbel',    userType: 'Agent',      from: '2024-06-01', to: '2025-05-31' }, // 20%
      { id: 4,  employeeId: 184, name: 'Fatima Al-Murshid',   userType: 'Supervisor', from: '2025-05-01', to: '2026-10-31' },
      { id: 5,  employeeId: 185, name: 'Omar Al-Muhammad',    userType: 'Agent',      from: '2025-06-01', to: '2026-12-31' },
      { id: 6,  employeeId: 186, name: 'Nora Al-Mutairi',     userType: 'Manager',    from: '2025-01-01', to: '2026-09-30' },
      { id: 7,  employeeId: 187, name: 'Majed Al-Muqbel',     userType: 'Agent',      from: '2025-07-01', to: '2026-08-31' },
      { id: 8,  employeeId: 188, name: 'Layla Al-Muhammad',   userType: 'Supervisor', from: '2025-08-01', to: '2026-12-31' },
      { id: 9,  employeeId: 189, name: 'Sultan Al-Murshid',   userType: 'Agent',      from: '2025-02-01', to: '2026-11-30' },
      { id: 10, employeeId: 190, name: 'Hessa Al-Mutairi',    userType: 'Manager',    from: '2024-09-01', to: '2025-08-31' }, // 20%
      { id: 11, employeeId: 191, name: 'Yousef Al-Muhammad',  userType: 'Agent',      from: '2025-09-01', to: '2026-12-31' },
      { id: 12, employeeId: 192, name: 'Rana Al-Murshid',     userType: 'Supervisor', from: '2025-03-01', to: '2026-07-31' },
      { id: 13, employeeId: 193, name: 'Fahd Al-Mutairi',     userType: 'Agent',      from: '2025-10-01', to: '2026-10-31' },
      { id: 14, employeeId: 194, name: 'Mona Al-Muqbel',      userType: 'Manager',    from: '2025-04-15', to: '2026-12-31' },
      { id: 15, employeeId: 195, name: 'Saad Al-Muqbel',      userType: 'Agent',      from: '2025-11-01', to: '2026-12-31' },
      { id: 16, employeeId: 196, name: 'Lujain Al-Muhammad',  userType: 'Supervisor', from: '2025-05-15', to: '2026-09-30' },
      { id: 17, employeeId: 197, name: 'Ahmad Al-Mutairi',    userType: 'Agent',      from: '2025-06-15', to: '2026-08-31' },
      { id: 18, employeeId: 198, name: 'Khadija Al-Muqbel',   userType: 'Manager',    from: '2025-07-15', to: '2026-12-31' },
      { id: 19, employeeId: 199, name: 'Mansour Al-Muqbel',   userType: 'Agent',      from: '2025-08-15', to: '2026-11-30' },
      { id: 20, employeeId: 200, name: 'Raghad Al-Muqbel',    userType: 'Supervisor', from: '2025-01-15', to: '2026-12-31' },
    ],
  },
  {
    id: 9,
    name: 'Communications Team',
    validFrom: '2025-06-01',
    validTo: '2025-12-31',
    parentName: 'Communications Department',
    externalCode: 'COM-001',
    members: [
      { id: 1,  employeeId: 201, name: 'Saud Al-Mohammed',    userType: 'Agent',      from: '2025-06-01', to: '2026-12-31' },
      { id: 2,  employeeId: 202, name: 'Rania Al-Mutairi',    userType: 'Manager',    from: '2025-07-01', to: '2026-11-30' },
      { id: 3,  employeeId: 203, name: 'Khalid Al-Muqbel',    userType: 'Agent',      from: '2024-08-01', to: '2025-07-31' }, // 20%
      { id: 4,  employeeId: 204, name: 'Fatima Al-Murshid',   userType: 'Supervisor', from: '2025-08-01', to: '2026-10-31' },
      { id: 5,  employeeId: 205, name: 'Omar Al-Muhammad',    userType: 'Agent',      from: '2025-01-01', to: '2026-12-31' },
      { id: 6,  employeeId: 206, name: 'Nora Al-Mutairi',     userType: 'Manager',    from: '2025-09-01', to: '2026-09-30' },
      { id: 7,  employeeId: 207, name: 'Majed Al-Muqbel',     userType: 'Agent',      from: '2025-02-01', to: '2026-08-31' },
      { id: 8,  employeeId: 208, name: 'Layla Al-Muhammad',   userType: 'Supervisor', from: '2025-10-01', to: '2026-12-31' },
      { id: 9,  employeeId: 209, name: 'Sultan Al-Murshid',   userType: 'Agent',      from: '2025-03-01', to: '2026-11-30' },
      { id: 10, employeeId: 210, name: 'Hessa Al-Mutairi',    userType: 'Manager',    from: '2024-10-01', to: '2025-09-30' }, // 20%
      { id: 11, employeeId: 211, name: 'Yousef Al-Muhammad',  userType: 'Agent',      from: '2025-11-01', to: '2026-12-31' },
      { id: 12, employeeId: 212, name: 'Rana Al-Murshid',     userType: 'Supervisor', from: '2025-04-01', to: '2026-07-31' },
      { id: 13, employeeId: 213, name: 'Fahd Al-Mutairi',     userType: 'Agent',      from: '2025-05-01', to: '2026-10-31' },
      { id: 14, employeeId: 214, name: 'Mona Al-Muqbel',      userType: 'Manager',    from: '2025-06-15', to: '2026-12-31' },
      { id: 15, employeeId: 215, name: 'Saad Al-Muqbel',      userType: 'Agent',      from: '2025-07-15', to: '2026-09-30' },
      { id: 16, employeeId: 216, name: 'Lujain Al-Muhammad',  userType: 'Supervisor', from: '2025-08-15', to: '2026-12-31' },
      { id: 17, employeeId: 217, name: 'Ahmad Al-Mutairi',    userType: 'Agent',      from: '2025-09-15', to: '2026-11-30' },
      { id: 18, employeeId: 218, name: 'Khadija Al-Muqbel',   userType: 'Manager',    from: '2025-10-15', to: '2026-12-31' },
      { id: 19, employeeId: 219, name: 'Mansour Al-Muqbel',   userType: 'Agent',      from: '2025-01-15', to: '2026-08-31' },
      { id: 20, employeeId: 220, name: 'Raghad Al-Muqbel',    userType: 'Supervisor', from: '2025-11-15', to: '2026-12-31' },
      { id: 21, employeeId: 221, name: 'Basil Al-Mutairi',    userType: 'Agent',      from: '2025-02-15', to: '2026-07-31' },
      { id: 22, employeeId: 222, name: 'Dunya Al-Mutairi',    userType: 'Manager',    from: '2025-03-15', to: '2026-10-31' },
      { id: 23, employeeId: 223, name: 'Feras Al-Muqbel',     userType: 'Agent',      from: '2025-04-15', to: '2026-12-31' },
    ],
  },
  {
    id: 10,
    name: 'Administration Support',
    validFrom: '2025-01-01',
    validTo: '2026-12-31',
    parentName: 'Administration Department',
    externalCode: 'ADM-001',
    members: [
      { id: 1,  employeeId: 224, name: 'Majed Al-Mohammed',   userType: 'Agent',      from: '2025-01-01', to: '2026-12-31' },
      { id: 2,  employeeId: 225, name: 'Rania Al-Mutairi',    userType: 'Manager',    from: '2025-02-01', to: '2026-11-30' },
      { id: 3,  employeeId: 226, name: 'Khalid Al-Muqbel',    userType: 'Agent',      from: '2024-05-01', to: '2025-04-30' }, // 20%
      { id: 4,  employeeId: 227, name: 'Fatima Al-Murshid',   userType: 'Supervisor', from: '2025-03-01', to: '2026-10-31' },
      { id: 5,  employeeId: 228, name: 'Omar Al-Muhammad',    userType: 'Agent',      from: '2025-04-01', to: '2026-12-31' },
      { id: 6,  employeeId: 229, name: 'Nora Al-Mutairi',     userType: 'Manager',    from: '2025-05-01', to: '2026-09-30' },
      { id: 7,  employeeId: 230, name: 'Majed Al-Muqbel',     userType: 'Agent',      from: '2025-06-01', to: '2026-08-31' },
      { id: 8,  employeeId: 231, name: 'Layla Al-Muhammad',   userType: 'Supervisor', from: '2025-07-01', to: '2026-12-31' },
      { id: 9,  employeeId: 232, name: 'Sultan Al-Murshid',   userType: 'Agent',      from: '2025-01-15', to: '2026-11-30' },
      { id: 10, employeeId: 233, name: 'Hessa Al-Mutairi',    userType: 'Manager',    from: '2024-08-01', to: '2025-07-31' }, // 20%
      { id: 11, employeeId: 234, name: 'Yousef Al-Muhammad',  userType: 'Agent',      from: '2025-08-01', to: '2026-12-31' },
      { id: 12, employeeId: 235, name: 'Rana Al-Murshid',     userType: 'Supervisor', from: '2025-02-15', to: '2026-07-31' },
      { id: 13, employeeId: 236, name: 'Fahd Al-Mutairi',     userType: 'Agent',      from: '2025-09-01', to: '2026-10-31' },
      { id: 14, employeeId: 237, name: 'Mona Al-Muqbel',      userType: 'Manager',    from: '2025-03-15', to: '2026-12-31' },
      { id: 15, employeeId: 238, name: 'Saad Al-Muqbel',      userType: 'Agent',      from: '2025-10-01', to: '2026-09-30' },
      { id: 16, employeeId: 239, name: 'Lujain Al-Muhammad',  userType: 'Supervisor', from: '2025-04-15', to: '2026-12-31' },
      { id: 17, employeeId: 240, name: 'Ahmad Al-Mutairi',    userType: 'Agent',      from: '2025-05-15', to: '2026-08-31' },
      { id: 18, employeeId: 241, name: 'Khadija Al-Muqbel',   userType: 'Manager',    from: '2025-11-01', to: '2026-12-31' },
      { id: 19, employeeId: 242, name: 'Mansour Al-Muqbel',   userType: 'Agent',      from: '2025-06-15', to: '2026-11-30' },
      { id: 20, employeeId: 243, name: 'Raghad Al-Muqbel',    userType: 'Supervisor', from: '2025-07-15', to: '2026-12-31' },
      { id: 21, employeeId: 244, name: 'Basil Al-Mutairi',    userType: 'Agent',      from: '2025-08-15', to: '2026-10-31' },
      { id: 22, employeeId: 245, name: 'Dunya Al-Mutairi',    userType: 'Manager',    from: '2025-09-15', to: '2026-12-31' },
      { id: 23, employeeId: 246, name: 'Feras Al-Muqbel',     userType: 'Agent',      from: '2025-01-01', to: '2026-07-31' },
      { id: 24, employeeId: 247, name: 'Shahad Al-Mutairi',   userType: 'Supervisor', from: '2025-10-15', to: '2026-12-31' },
      { id: 25, employeeId: 248, name: 'Sultan Al-Muqbel',    userType: 'Agent',      from: '2025-02-01', to: '2026-09-30' },
    ],
  },
];

// Employee Directory 
//   Fields:
//   id, employeeId, name, entityCode, entityName, location,
//   department, employeeClass, manager, email, mobileNumber

export const MOCK_EMPLOYEES = [
  { id:1,  employeeId:'EMP-0001', name:'Sara Al-Mansoori', entityCode:'E001', entityName:'HQ Corp',      location:'Riyadh',    department:'HR & People Ops', employeeClass:'Full-time',  manager:'Ahmad Khalil',    email:'sara.mansoori@hqcorp.com',  mobileNumber:'+966501234567' },
  { id:2,  employeeId:'EMP-0002', name:'Khalid Jaber',     entityCode:'E002', entityName:'Regional Ltd', location:'Jeddah',    department:'Finance',          employeeClass:'Part-time',  manager:'Leila Nasser',    email:'k.jaber@regional.com',      mobileNumber:'+966502345678' },
  { id:3,  employeeId:'EMP-0003', name:'Lina Tran',        entityCode:'E001', entityName:'HQ Corp',      location:'Riyadh',    department:'IT & Systems',     employeeClass:'Contractor', manager:'Omar Farouk',     email:'l.tran@hqcorp.com',         mobileNumber:'+966503456789' },
  { id:4,  employeeId:'EMP-0004', name:'Marcus Reyes',     entityCode:'E002', entityName:'Regional Ltd', location:'Dammam',    department:'Operations',       employeeClass:'Full-time',  manager:'Leila Nasser',    email:'m.reyes@regional.com',      mobileNumber:'+966504567890' },
  { id:5,  employeeId:'EMP-0005', name:'Nour Atassi',      entityCode:'E001', entityName:'HQ Corp',      location:'Riyadh',    department:'Legal',            employeeClass:'Full-time',  manager:'Ahmad Khalil',    email:'n.atassi@hqcorp.com',       mobileNumber:'+966505678901' },
  { id:6,  employeeId:'EMP-0006', name:'James Okafor',     entityCode:'E003', entityName:'West Branch',  location:'Mecca',     department:'Sales',            employeeClass:'Full-time',  manager:'Fatima Al-Rashid',email:'j.okafor@westbranch.com',   mobileNumber:'+966506789012' },
  { id:7,  employeeId:'EMP-0007', name:'Aisha Benali',     entityCode:'E001', entityName:'HQ Corp',      location:'Riyadh',    department:'Marketing',        employeeClass:'Full-time',  manager:'Ahmad Khalil',    email:'a.benali@hqcorp.com',       mobileNumber:'+966507890123' },
  { id:8,  employeeId:'EMP-0008', name:'David Park',       entityCode:'E002', entityName:'Regional Ltd', location:'Jeddah',    department:'IT & Systems',     employeeClass:'Contractor', manager:'Omar Farouk',     email:'d.park@regional.com',       mobileNumber:'+966508901234' },
  { id:9,  employeeId:'EMP-0009', name:'Rania Mahmoud',    entityCode:'E003', entityName:'West Branch',  location:'Mecca',     department:'Finance',          employeeClass:'Full-time',  manager:'Fatima Al-Rashid',email:'r.mahmoud@westbranch.com',  mobileNumber:'+966509012345' },
  { id:10, employeeId:'EMP-0010', name:'Tom Fischer',      entityCode:'E001', entityName:'HQ Corp',      location:'Riyadh',    department:'Operations',       employeeClass:'Part-time',  manager:'Ahmad Khalil',    email:'t.fischer@hqcorp.com',      mobileNumber:'+966510123456' },
  { id:11, employeeId:'EMP-0011', name:'Yara Saleh',       entityCode:'E002', entityName:'Regional Ltd', location:'Dammam',    department:'HR & People Ops',  employeeClass:'Full-time',  manager:'Leila Nasser',    email:'y.saleh@regional.com',      mobileNumber:'+966511234567' },
  { id:12, employeeId:'EMP-0012', name:'Carlos Mendez',    entityCode:'E003', entityName:'West Branch',  location:'Mecca',     department:'Sales',            employeeClass:'Full-time',  manager:'Fatima Al-Rashid',email:'c.mendez@westbranch.com',   mobileNumber:'+966512345678' },
]

// ticketing rule
export const MOCK_TICKETING_RULES = [
  {
    id: 1,
    entity: 'Acme Corp',
    supportCategory: 'IT Support',
    subcategory: 'Hardware',
    employeeClass: 'Full-time',
    priority: 'High',
    group: 'Level 1 Support',
    agent: 'John Smith',
  },
  {
    id: 2,
    entity: 'Acme Corp',
    supportCategory: 'IT Support',
    subcategory: 'Software',
    employeeClass: 'Full-time',
    priority: 'Medium',
    group: 'Level 2 Support',
    agent: 'Sara Lee',
  },
  {
    id: 3,
    entity: 'Globex',
    supportCategory: 'HR',
    subcategory: 'Payroll',
    employeeClass: 'Contractor',
    priority: 'Low',
    group: 'HR Team',
    agent: 'Mike Johnson',
  },
  {
    id: 4,
    entity: 'Globex',
    supportCategory: 'Facilities',
    subcategory: 'Maintenance',
    employeeClass: 'Part-time',
    priority: 'Medium',
    group: 'Facilities Team',
    agent: 'Anna White',
  },
  {
    id: 5,
    entity: 'Initech',
    supportCategory: 'IT Support',
    subcategory: 'Network',
    employeeClass: 'Full-time',
    priority: 'Critical',
    group: 'Level 3 Support',
    agent: 'David Brown',
  },
  {
    id: 6,
    entity: 'Initech',
    supportCategory: 'HR',
    subcategory: 'Onboarding',
    employeeClass: 'Full-time',
    priority: 'Low',
    group: 'HR Team',
    agent: 'Linda Green',
  },
  {
    id: 7,
    entity: 'Umbrella Ltd',
    supportCategory: 'Finance',
    subcategory: 'Expenses',
    employeeClass: 'Contractor',
    priority: 'High',
    group: 'Finance Team',
    agent: 'Chris Black',
  },
  {
    id: 8,
    entity: 'Cyberdyne',
    supportCategory: 'Legal',
    subcategory: 'Compliance',
    employeeClass: 'Full-time',
    priority: 'Critical',
    group: 'Legal Team',
    agent: 'Rachel Stone',
  },
  {
    id: 9,
    entity: 'Acme Corp',
    supportCategory: 'Facilities',
    subcategory: 'Maintenance',
    employeeClass: 'Part-time',
    priority: 'Low',
    group: 'Facilities Team',
    agent: '',
  },
  {
    id: 10,
    entity: 'Globex',
    supportCategory: 'IT Support',
    subcategory: 'Software',
    employeeClass: 'Intern',
    priority: 'Medium',
    group: 'Level 1 Support',
    agent: 'Nora Hassan',
  },
]
export const ENTITY_OPTIONS         = ['Acme Corp', 'Globex', 'Initech', 'Umbrella Ltd', 'Cyberdyne']
export const CATEGORY_OPTIONS       = ['IT Support', 'HR', 'Facilities', 'Finance', 'Legal']
export const SUBCATEGORY_OPTIONS    = ['Hardware', 'Software', 'Network', 'Payroll', 'Onboarding', 'Maintenance', 'Expenses', 'Compliance']
export const EMPLOYEE_CLASS_OPTIONS = ['Full-time', 'Part-time', 'Contractor', 'Intern']
export const PRIORITY_OPTIONS       = ['Low', 'Medium', 'High', 'Critical']
export const GROUP_OPTIONS          = ['Level 1 Support', 'Level 2 Support', 'Level 3 Support', 'HR Team', 'Finance Team', 'Facilities Team', 'Legal Team']

// Default operating hours template
const DEFAULT_OPERATING_HOURS = {
  sun: { enabled: true,  start: '08:00', end: '16:00' },
  mon: { enabled: true,  start: '08:00', end: '16:00' },
  tue: { enabled: true,  start: '08:00', end: '16:00' },
  wed: { enabled: true,  start: '08:00', end: '16:00' },
  thu: { enabled: true,  start: '08:00', end: '16:00' },
  fri: { enabled: false, start: '08:00', end: '16:00' },
  sat: { enabled: false, start: '08:00', end: '16:00' },
};

// SLA Assignment Mock Data
const CALENDAR_24_7 = { sun: { enabled: true, start: '00:00', end: '23:59' }, mon: { enabled: true, start: '00:00', end: '23:59' }, tue: { enabled: true, start: '00:00', end: '23:59' }, wed: { enabled: true, start: '00:00', end: '23:59' }, thu: { enabled: true, start: '00:00', end: '23:59' }, fri: { enabled: true, start: '00:00', end: '23:59' }, sat: { enabled: true, start: '00:00', end: '23:59' } }
export const MOCK_SLA_RULES = [
  // SLA-001 — 8 rules (2 per priority: Critical, High, Medium, Low)
  { id: 1,  slaId: 'SLA-001', slaName: 'Critical Initial Review',    slaType: 'Initial Review', priority: 'Critical', responseTime: '1 Hour',   timeType: 'Calendar Time', operatingHours: { ...CALENDAR_24_7 } },
  { id: 2,  slaId: 'SLA-001', slaName: 'Critical Completion',        slaType: 'Completion Due', priority: 'Critical', responseTime: '4 Hours',  timeType: 'Calendar Time', operatingHours: { ...CALENDAR_24_7 } },
  { id: 3,  slaId: 'SLA-001', slaName: 'High Initial Review',        slaType: 'Initial Review', priority: 'High',     responseTime: '2 Hours',  timeType: 'Calendar Time', operatingHours: { ...CALENDAR_24_7 } },
  { id: 4,  slaId: 'SLA-001', slaName: 'High Completion',            slaType: 'Completion Due', priority: 'High',     responseTime: '8 Hours',  timeType: 'Calendar Time', operatingHours: { ...CALENDAR_24_7 } },
  { id: 5,  slaId: 'SLA-001', slaName: 'Medium Initial Review',      slaType: 'Initial Review', priority: 'Medium',   responseTime: '4 Hours',  timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 6,  slaId: 'SLA-001', slaName: 'Medium Completion',          slaType: 'Completion Due', priority: 'Medium',   responseTime: '16 Hours', timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 7,  slaId: 'SLA-001', slaName: 'Low Initial Review',         slaType: 'Initial Review', priority: 'Low',      responseTime: '8 Hours',  timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 8,  slaId: 'SLA-001', slaName: 'Low Completion',             slaType: 'Completion Due', priority: 'Low',      responseTime: '24 Hours', timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },

  // SLA-002 — 8 rules (2 per priority: Critical, High, Medium, Low)
  { id: 9,  slaId: 'SLA-002', slaName: 'Critical Initial Review',    slaType: 'Initial Review', priority: 'Critical', responseTime: '30 Minutes', timeType: 'Calendar Time', operatingHours: { ...CALENDAR_24_7 } },
  { id: 10, slaId: 'SLA-002', slaName: 'Critical Completion',        slaType: 'Completion Due', priority: 'Critical', responseTime: '2 Hours',  timeType: 'Calendar Time', operatingHours: { ...CALENDAR_24_7 } },
  { id: 11, slaId: 'SLA-002', slaName: 'High Initial Review',        slaType: 'Initial Review', priority: 'High',     responseTime: '1 Hour',   timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 12, slaId: 'SLA-002', slaName: 'High Completion',            slaType: 'Completion Due', priority: 'High',     responseTime: '4 Hours',  timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 13, slaId: 'SLA-002', slaName: 'Medium Initial Review',      slaType: 'Initial Review', priority: 'Medium',   responseTime: '2 Hours',  timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 14, slaId: 'SLA-002', slaName: 'Medium Completion',          slaType: 'Completion Due', priority: 'Medium',   responseTime: '8 Hours',  timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 15, slaId: 'SLA-002', slaName: 'Low Initial Review',         slaType: 'Initial Review', priority: 'Low',      responseTime: '4 Hours',  timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 16, slaId: 'SLA-002', slaName: 'Low Completion',             slaType: 'Completion Due', priority: 'Low',      responseTime: '16 Hours', timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },

  // SLA-003 — 8 rules (2 per priority: Critical, High, Medium, Low)
  { id: 17, slaId: 'SLA-003', slaName: 'Critical Initial Review',    slaType: 'Initial Review', priority: 'Critical', responseTime: '2 Hours',  timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 18, slaId: 'SLA-003', slaName: 'Critical Completion',        slaType: 'Completion Due', priority: 'Critical', responseTime: '8 Hours',  timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 19, slaId: 'SLA-003', slaName: 'High Initial Review',        slaType: 'Initial Review', priority: 'High',     responseTime: '4 Hours',  timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 20, slaId: 'SLA-003', slaName: 'High Completion',            slaType: 'Completion Due', priority: 'High',     responseTime: '12 Hours', timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 21, slaId: 'SLA-003', slaName: 'Medium Initial Review',      slaType: 'Initial Review', priority: 'Medium',   responseTime: '8 Hours',  timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 22, slaId: 'SLA-003', slaName: 'Medium Completion',          slaType: 'Completion Due', priority: 'Medium',   responseTime: '24 Hours', timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 23, slaId: 'SLA-003', slaName: 'Low Initial Review',         slaType: 'Initial Review', priority: 'Low',      responseTime: '16 Hours', timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 24, slaId: 'SLA-003', slaName: 'Low Completion',             slaType: 'Completion Due', priority: 'Low',      responseTime: '48 Hours', timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },

  // SLA-004 — 8 rules (2 per priority: Critical, High, Medium, Low)
  { id: 25, slaId: 'SLA-004', slaName: 'Critical Initial Review',    slaType: 'Initial Review', priority: 'Critical', responseTime: '1 Hour',   timeType: 'Calendar Time', operatingHours: { ...CALENDAR_24_7 } },
  { id: 26, slaId: 'SLA-004', slaName: 'Critical Completion',        slaType: 'Completion Due', priority: 'Critical', responseTime: '6 Hours',  timeType: 'Calendar Time', operatingHours: { ...CALENDAR_24_7 } },
  { id: 27, slaId: 'SLA-004', slaName: 'High Initial Review',        slaType: 'Initial Review', priority: 'High',     responseTime: '3 Hours',  timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 28, slaId: 'SLA-004', slaName: 'High Completion',            slaType: 'Completion Due', priority: 'High',     responseTime: '10 Hours', timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 29, slaId: 'SLA-004', slaName: 'Medium Initial Review',      slaType: 'Initial Review', priority: 'Medium',   responseTime: '6 Hours',  timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 30, slaId: 'SLA-004', slaName: 'Medium Completion',          slaType: 'Completion Due', priority: 'Medium',   responseTime: '20 Hours', timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 31, slaId: 'SLA-004', slaName: 'Low Initial Review',         slaType: 'Initial Review', priority: 'Low',      responseTime: '12 Hours', timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 32, slaId: 'SLA-004', slaName: 'Low Completion',             slaType: 'Completion Due', priority: 'Low',      responseTime: '36 Hours', timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },

  // SLA-005 — 8 rules (2 per priority: Critical, High, Medium, Low)
  { id: 33, slaId: 'SLA-005', slaName: 'Critical Initial Review',    slaType: 'Initial Review', priority: 'Critical', responseTime: '15 Minutes', timeType: 'Calendar Time', operatingHours: { ...CALENDAR_24_7 } },
  { id: 34, slaId: 'SLA-005', slaName: 'Critical Completion',        slaType: 'Completion Due', priority: 'Critical', responseTime: '1 Hour',   timeType: 'Calendar Time', operatingHours: { ...CALENDAR_24_7 } },
  { id: 35, slaId: 'SLA-005', slaName: 'High Initial Review',        slaType: 'Initial Review', priority: 'High',     responseTime: '30 Minutes', timeType: 'Calendar Time', operatingHours: { ...CALENDAR_24_7 } },
  { id: 36, slaId: 'SLA-005', slaName: 'High Completion',            slaType: 'Completion Due', priority: 'High',     responseTime: '3 Hours',  timeType: 'Calendar Time', operatingHours: { ...CALENDAR_24_7 } },
  { id: 37, slaId: 'SLA-005', slaName: 'Medium Initial Review',      slaType: 'Initial Review', priority: 'Medium',   responseTime: '1 Hour',   timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 38, slaId: 'SLA-005', slaName: 'Medium Completion',          slaType: 'Completion Due', priority: 'Medium',   responseTime: '6 Hours',  timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 39, slaId: 'SLA-005', slaName: 'Low Initial Review',         slaType: 'Initial Review', priority: 'Low',      responseTime: '2 Hours',  timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 40, slaId: 'SLA-005', slaName: 'Low Completion',             slaType: 'Completion Due', priority: 'Low',      responseTime: '12 Hours', timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },

  // SLA-006 — 8 rules (2 per priority: Critical, High, Medium, Low)
  { id: 41, slaId: 'SLA-006', slaName: 'Critical Initial Review',    slaType: 'Initial Review', priority: 'Critical', responseTime: '45 Minutes', timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 42, slaId: 'SLA-006', slaName: 'Critical Completion',        slaType: 'Completion Due', priority: 'Critical', responseTime: '4 Hours',  timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 43, slaId: 'SLA-006', slaName: 'High Initial Review',        slaType: 'Initial Review', priority: 'High',     responseTime: '2 Hours',  timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 44, slaId: 'SLA-006', slaName: 'High Completion',            slaType: 'Completion Due', priority: 'High',     responseTime: '8 Hours',  timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 45, slaId: 'SLA-006', slaName: 'Medium Initial Review',      slaType: 'Initial Review', priority: 'Medium',   responseTime: '4 Hours',  timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 46, slaId: 'SLA-006', slaName: 'Medium Completion',          slaType: 'Completion Due', priority: 'Medium',   responseTime: '16 Hours', timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 47, slaId: 'SLA-006', slaName: 'Low Initial Review',         slaType: 'Initial Review', priority: 'Low',      responseTime: '8 Hours',  timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 48, slaId: 'SLA-006', slaName: 'Low Completion',             slaType: 'Completion Due', priority: 'Low',      responseTime: '32 Hours', timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },

  // SLA-007 — 8 rules (2 per priority: Critical, High, Medium, Low)
  { id: 49, slaId: 'SLA-007', slaName: 'Critical Initial Review',    slaType: 'Initial Review', priority: 'Critical', responseTime: '1 Hour',   timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 50, slaId: 'SLA-007', slaName: 'Critical Completion',        slaType: 'Completion Due', priority: 'Critical', responseTime: '6 Hours',  timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 51, slaId: 'SLA-007', slaName: 'High Initial Review',        slaType: 'Initial Review', priority: 'High',     responseTime: '3 Hours',  timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 52, slaId: 'SLA-007', slaName: 'High Completion',            slaType: 'Completion Due', priority: 'High',     responseTime: '12 Hours', timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 53, slaId: 'SLA-007', slaName: 'Medium Initial Review',      slaType: 'Initial Review', priority: 'Medium',   responseTime: '6 Hours',  timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 54, slaId: 'SLA-007', slaName: 'Medium Completion',          slaType: 'Completion Due', priority: 'Medium',   responseTime: '24 Hours', timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 55, slaId: 'SLA-007', slaName: 'Low Initial Review',         slaType: 'Initial Review', priority: 'Low',      responseTime: '12 Hours', timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 56, slaId: 'SLA-007', slaName: 'Low Completion',             slaType: 'Completion Due', priority: 'Low',      responseTime: '48 Hours', timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },

  // SLA-008 — 8 rules (2 per priority: Critical, High, Medium, Low)
  { id: 57, slaId: 'SLA-008', slaName: 'Critical Initial Review',    slaType: 'Initial Review', priority: 'Critical', responseTime: '30 Minutes', timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 58, slaId: 'SLA-008', slaName: 'Critical Completion',        slaType: 'Completion Due', priority: 'Critical', responseTime: '3 Hours',  timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 59, slaId: 'SLA-008', slaName: 'High Initial Review',        slaType: 'Initial Review', priority: 'High',     responseTime: '2 Hours',  timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 60, slaId: 'SLA-008', slaName: 'High Completion',            slaType: 'Completion Due', priority: 'High',     responseTime: '8 Hours',  timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 61, slaId: 'SLA-008', slaName: 'Medium Initial Review',      slaType: 'Initial Review', priority: 'Medium',   responseTime: '4 Hours',  timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 62, slaId: 'SLA-008', slaName: 'Medium Completion',          slaType: 'Completion Due', priority: 'Medium',   responseTime: '16 Hours', timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 63, slaId: 'SLA-008', slaName: 'Low Initial Review',         slaType: 'Initial Review', priority: 'Low',      responseTime: '8 Hours',  timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
  { id: 64, slaId: 'SLA-008', slaName: 'Low Completion',             slaType: 'Completion Due', priority: 'Low',      responseTime: '24 Hours', timeType: 'Working Time',  operatingHours: { ...DEFAULT_OPERATING_HOURS } },
]

// SLA Assignment Mock Data
export const MOCK_SLA_CONFIGURATIONS = [
  // SLA-001 Assignment (Critical tickets)
  { id: 1,  slaId: 'SLA-001', entity: 'Acme Corp',     supportCategory: 'IT Support',  subcategory: 'Hardware',    employeeClass: 'Full-time' },
  { id: 2,  slaId: 'SLA-001', entity: 'Acme Corp',     supportCategory: 'IT Support',  subcategory: 'Software',    employeeClass: 'Full-time' },
  { id: 3,  slaId: 'SLA-001', entity: 'Globex',        supportCategory: 'IT Support',  subcategory: 'Network',     employeeClass: 'Full-time' },
  { id: 4,  slaId: 'SLA-001', entity: 'Initech',       supportCategory: 'Finance',     subcategory: 'Expenses',    employeeClass: 'Full-time' },
  { id: 5,  slaId: 'SLA-001', entity: 'Umbrella Ltd',  supportCategory: 'Legal',       subcategory: 'Compliance',  employeeClass: 'Full-time' },
  
  // SLA-002 Assignment (High priority)
  { id: 6,  slaId: 'SLA-002', entity: 'Acme Corp',     supportCategory: 'HR',          subcategory: 'Payroll',     employeeClass: 'Part-time' },
  { id: 7,  slaId: 'SLA-002', entity: 'Globex',        supportCategory: 'Facilities',  subcategory: 'Maintenance', employeeClass: 'Part-time' },
  { id: 8,  slaId: 'SLA-002', entity: 'Initech',       supportCategory: 'IT Support',  subcategory: 'Hardware',    employeeClass: 'Part-time' },
  { id: 9,  slaId: 'SLA-002', entity: 'Umbrella Ltd',  supportCategory: 'Finance',     subcategory: 'Expenses',    employeeClass: 'Part-time' },
  { id: 10, slaId: 'SLA-002', entity: 'Cyberdyne',     supportCategory: 'Legal',       subcategory: 'Compliance',  employeeClass: 'Part-time' },
  
  // SLA-003 Assignment (Medium priority)
  { id: 11, slaId: 'SLA-003', entity: 'Acme Corp',     supportCategory: 'IT Support',  subcategory: 'Software',    employeeClass: 'Contractor' },
  { id: 12, slaId: 'SLA-003', entity: 'Globex',        supportCategory: 'HR',          subcategory: 'Onboarding',  employeeClass: 'Contractor' },
  { id: 13, slaId: 'SLA-003', entity: 'Initech',       supportCategory: 'Facilities',  subcategory: 'Maintenance', employeeClass: 'Contractor' },
  { id: 14, slaId: 'SLA-003', entity: 'Umbrella Ltd',  supportCategory: 'IT Support',  subcategory: 'Network',     employeeClass: 'Contractor' },
  { id: 15, slaId: 'SLA-003', entity: 'Cyberdyne',     supportCategory: 'Finance',     subcategory: 'Expenses',    employeeClass: 'Contractor' },
  
  // SLA-004 Assignment (Low priority)
  { id: 16, slaId: 'SLA-004', entity: 'Acme Corp',     supportCategory: 'Legal',       subcategory: 'Compliance',  employeeClass: 'Intern' },
  { id: 17, slaId: 'SLA-004', entity: 'Globex',        supportCategory: 'IT Support',  subcategory: 'Hardware',    employeeClass: 'Intern' },
  { id: 18, slaId: 'SLA-004', entity: 'Initech',       supportCategory: 'HR',          subcategory: 'Payroll',     employeeClass: 'Intern' },
  { id: 19, slaId: 'SLA-004', entity: 'Umbrella Ltd',  supportCategory: 'Facilities',  subcategory: 'Maintenance', employeeClass: 'Intern' },
  { id: 20, slaId: 'SLA-004', entity: 'Cyberdyne',     supportCategory: 'Legal',       subcategory: 'Compliance',  employeeClass: 'Intern' },
  
  // SLA-005 Assignment (VIP tickets)
  { id: 21, slaId: 'SLA-005', entity: 'Acme Corp',     supportCategory: 'Finance',     subcategory: 'Expenses',    employeeClass: 'Full-time' },
  { id: 22, slaId: 'SLA-005', entity: 'Globex',        supportCategory: 'Legal',       subcategory: 'Compliance',  employeeClass: 'Full-time' },
  { id: 23, slaId: 'SLA-005', entity: 'Initech',       supportCategory: 'IT Support',  subcategory: 'Software',    employeeClass: 'Full-time' },
  { id: 24, slaId: 'SLA-005', entity: 'Umbrella Ltd',  supportCategory: 'HR',          subcategory: 'Onboarding',  employeeClass: 'Full-time' },
  { id: 25, slaId: 'SLA-005', entity: 'Cyberdyne',     supportCategory: 'Facilities',  subcategory: 'Maintenance', employeeClass: 'Full-time' },
  
  // SLA-006 Assignment (IT Support specific)
  { id: 26, slaId: 'SLA-006', entity: 'Acme Corp',     supportCategory: 'IT Support',  subcategory: 'Network',     employeeClass: 'Part-time' },
  { id: 27, slaId: 'SLA-006', entity: 'Globex',        supportCategory: 'IT Support',  subcategory: 'Hardware',    employeeClass: 'Part-time' },
  { id: 28, slaId: 'SLA-006', entity: 'Initech',       supportCategory: 'IT Support',  subcategory: 'Software',    employeeClass: 'Part-time' },
  { id: 29, slaId: 'SLA-006', entity: 'Umbrella Ltd',  supportCategory: 'IT Support',  subcategory: 'Hardware',    employeeClass: 'Part-time' },
  { id: 30, slaId: 'SLA-006', entity: 'Cyberdyne',     supportCategory: 'IT Support',  subcategory: 'Network',     employeeClass: 'Part-time' },
  
  // SLA-007 Assignment (Onboarding specific)
  { id: 31, slaId: 'SLA-007', entity: 'Acme Corp',     supportCategory: 'HR',          subcategory: 'Onboarding',  employeeClass: 'Contractor' },
  { id: 32, slaId: 'SLA-007', entity: 'Globex',        supportCategory: 'HR',          subcategory: 'Onboarding',  employeeClass: 'Contractor' },
  { id: 33, slaId: 'SLA-007', entity: 'Initech',       supportCategory: 'HR',          subcategory: 'Payroll',     employeeClass: 'Contractor' },
  { id: 34, slaId: 'SLA-007', entity: 'Umbrella Ltd',  supportCategory: 'HR',          subcategory: 'Onboarding',  employeeClass: 'Contractor' },
  { id: 35, slaId: 'SLA-007', entity: 'Cyberdyne',     supportCategory: 'HR',          subcategory: 'Onboarding',  employeeClass: 'Contractor' },
  
  // SLA-008 Assignment (Payroll specific)
  { id: 36, slaId: 'SLA-008', entity: 'Acme Corp',     supportCategory: 'Finance',     subcategory: 'Expenses',    employeeClass: 'Intern' },
  { id: 37, slaId: 'SLA-008', entity: 'Globex',        supportCategory: 'Finance',     subcategory: 'Expenses',    employeeClass: 'Intern' },
  { id: 38, slaId: 'SLA-008', entity: 'Initech',       supportCategory: 'Finance',     subcategory: 'Expenses',    employeeClass: 'Intern' },
  { id: 39, slaId: 'SLA-008', entity: 'Umbrella Ltd',  supportCategory: 'Finance',     subcategory: 'Expenses',    employeeClass: 'Intern' },
  { id: 40, slaId: 'SLA-008', entity: 'Cyberdyne',     supportCategory: 'Finance',     subcategory: 'Expenses',    employeeClass: 'Intern' },
  
  // SLA-009 Assignment (General inquiries)
  { id: 41, slaId: 'SLA-009', entity: 'Acme Corp',     supportCategory: 'Facilities',  subcategory: 'Maintenance', employeeClass: 'Full-time' },
  { id: 42, slaId: 'SLA-009', entity: 'Globex',        supportCategory: 'Legal',       subcategory: 'Compliance',  employeeClass: 'Full-time' },
  { id: 43, slaId: 'SLA-009', entity: 'Initech',       supportCategory: 'IT Support',  subcategory: 'Hardware',    employeeClass: 'Full-time' },
  { id: 44, slaId: 'SLA-009', entity: 'Umbrella Ltd',  supportCategory: 'HR',          subcategory: 'Payroll',     employeeClass: 'Full-time' },
  { id: 45, slaId: 'SLA-009', entity: 'Cyberdyne',     supportCategory: 'Facilities',  subcategory: 'Maintenance', employeeClass: 'Full-time' },
]

export const SLA_ID_OPTIONS = ['SLA-001', 'SLA-002', 'SLA-003', 'SLA-004', 'SLA-005', 'SLA-006', 'SLA-007', 'SLA-008', 'SLA-009']

// Notification Email — trigger points and recipients
// From org spec: rows = triggers, columns = recipients, cells = on/off
export const NOTIFICATION_TRIGGER_OPTIONS = [
  'Status',
  'Priority',
  'Escalation',
  'Assigned Agent',
  'Assigned Group',
]

export const NOTIFICATION_RECIPIENT_OPTIONS = [
  'Employee',
  'Admin',
  'Group',
  'Escalation Matrix',
  'Employee Manager',
  'Custom Email',
]

// Default email templates per trigger — {{var}} placeholders replaced at send/preview time
export const NOTIFICATION_EMAIL_TEMPLATES = {
  'Status': {
    subject: '[Ticket {{ticketId}}] Status changed to {{newStatus}}',
    body: `Hi {{employeeName}},

The status of your ticket "{{ticketTitle}}" (#{{ticketId}}) has been updated.

Previous Status : {{oldStatus}}
New Status      : {{newStatus}}
Updated By      : {{updatedBy}}
Updated At      : {{updatedAt}}

You can view the ticket details in the HR Support portal.

— HR Support Team`,
  },
  'Priority': {
    subject: '[Ticket {{ticketId}}] Priority set to {{newPriority}}',
    body: `Hi {{employeeName}},

The priority of ticket "{{ticketTitle}}" (#{{ticketId}}) has been changed.

Previous Priority : {{oldPriority}}
New Priority      : {{newPriority}}
Updated By        : {{updatedBy}}
Updated At        : {{updatedAt}}

— HR Support Team`,
  },
  'Escalation': {
    subject: '[Ticket {{ticketId}}] ESCALATED — {{ticketTitle}}',
    body: `Attention,

Ticket #{{ticketId}} has been escalated.

Title           : {{ticketTitle}}
Employee        : {{employeeName}}
Current Status  : {{newStatus}}
Current Priority: {{newPriority}}
Escalated By    : {{updatedBy}}
Escalated At    : {{updatedAt}}

Please review this ticket as soon as possible.

— HR Support Team`,
  },
  'Assigned Agent': {
    subject: '[Ticket {{ticketId}}] Assigned to {{agentName}}',
    body: `Hi {{agentName}},

You have been assigned a new ticket.

Ticket ID  : #{{ticketId}}
Title      : {{ticketTitle}}
Employee   : {{employeeName}}
Priority   : {{newPriority}}
Status     : {{newStatus}}
Assigned By: {{updatedBy}}
Assigned At: {{updatedAt}}

Please review and take action.

— HR Support Team`,
  },
  'Assigned Group': {
    subject: '[Ticket {{ticketId}}] Assigned to group {{groupName}}',
    body: `Hi {{groupName}} team,

A ticket has been assigned to your group.

Ticket ID  : #{{ticketId}}
Title      : {{ticketTitle}}
Employee   : {{employeeName}}
Priority   : {{newPriority}}
Status     : {{newStatus}}
Assigned By: {{updatedBy}}
Assigned At: {{updatedAt}}

— HR Support Team`,
  },
}

// Sample variables used by the test-email preview (kept realistic but obviously mock)
export const NOTIFICATION_TEMPLATE_SAMPLE_VARS = {
  ticketId: 'TKT-10248',
  ticketTitle: 'Payroll discrepancy — March 2026',
  employeeName: 'Ahmed Al-Rashidi',
  agentName: 'Sara Al-Mutairi',
  groupName: 'HR Payroll',
  oldStatus: 'New',
  newStatus: 'Under Process',
  oldPriority: 'Medium',
  newPriority: 'High',
  updatedBy: 'HR Admin',
  updatedAt: new Date().toLocaleString('en-GB', { hour12: false }),
}

// Default notification config — one row per trigger, recipients as booleans, customEmails array
export const MOCK_NOTIFICATION_CONFIG = [
  { id: 1, trigger: 'Status',         enabled: true,  recipients: { Employee: true,  Admin: true,  Group: false, 'Escalation Matrix': false, 'Employee Manager': false, 'Custom Email': false }, customEmails: [] },
  { id: 2, trigger: 'Priority',       enabled: true,  recipients: { Employee: false, Admin: true,  Group: true,  'Escalation Matrix': false, 'Employee Manager': false, 'Custom Email': false }, customEmails: [] },
  { id: 3, trigger: 'Escalation',     enabled: true,  recipients: { Employee: false, Admin: true,  Group: true,  'Escalation Matrix': true,  'Employee Manager': true,  'Custom Email': true  }, customEmails: ['escalations@company.com'] },
  { id: 4, trigger: 'Assigned Agent', enabled: true,  recipients: { Employee: true,  Admin: false, Group: true,  'Escalation Matrix': false, 'Employee Manager': false, 'Custom Email': false }, customEmails: [] },
  { id: 5, trigger: 'Assigned Group', enabled: false, recipients: { Employee: true,  Admin: false, Group: true,  'Escalation Matrix': false, 'Employee Manager': false, 'Custom Email': false }, customEmails: [] },
]
