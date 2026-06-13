// src/data/mockData.js — Far Away Platform
// ─── Updated: Subject-grouped assessments with teacher + time windows ───

export const INITIAL_USER = {
  name: "John Doe",
  initials: "JD",
  coins: 520,
  streak: 5,
  rank: 42,
  xp: 420,
  level: 12,
  skillAreas: ["DSA Basics", "WebDev Basics"],
};

// ─── Questions pools ───────────────────────────────────────────
const OOPS_Q = [
  { id: 'oq1', type: 'mcq', text: 'Which OOP concept allows a class to derive properties from another class?', options: ['Encapsulation', 'Inheritance', 'Polymorphism', 'Abstraction'], correct: 'Inheritance' },
  { id: 'oq2', type: 'mcq', text: 'What is the output of calling an overridden method on a subclass object via a parent reference?', options: ['Parent method runs', 'Subclass method runs', 'Compile error', 'Runtime exception'], correct: 'Subclass method runs' },
  { id: 'oq3', type: 'mcq', text: 'Which access modifier restricts visibility to the class itself only?', options: ['public', 'protected', 'private', 'default'], correct: 'private' },
];
const OOPS_Q2 = [
  { id: 'oq4', type: 'mcq', text: 'An abstract class in Java can have:', options: ['Only abstract methods', 'Only concrete methods', 'Both abstract and concrete methods', 'No methods'], correct: 'Both abstract and concrete methods' },
  { id: 'oq5', type: 'mcq', text: 'What does the "super" keyword refer to?', options: ['Current class', 'Parent class', 'Interface', 'Static context'], correct: 'Parent class' },
];
const DSA_Q = [
  { id: 'dq1', type: 'mcq', text: 'What is the time complexity to insert at the beginning of a Singly Linked List?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'], correct: 'O(1)' },
  { id: 'dq2', type: 'mcq', text: 'Which data structure uses LIFO ordering?', options: ['Queue', 'Stack', 'Linked List', 'Heap'], correct: 'Stack' },
  { id: 'dq3', type: 'mcq', text: 'In a circular linked list, the next pointer of the last node points to?', options: ['NULL', 'Head Node', 'Middle Node', 'Itself'], correct: 'Head Node' },
];
const DSA_Q2 = [
  { id: 'dq4', type: 'mcq', text: 'What is the worst-case time complexity of QuickSort?', options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'], correct: 'O(n²)' },
  { id: 'dq5', type: 'mcq', text: 'A binary search tree with n nodes has a height of at most?', options: ['log n', 'n', 'n/2', '2 log n'], correct: 'n' },
];
const WEBDEV_Q = [
  { id: 'wq1', type: 'mcq', text: 'Which CSS property defines column gap in a Grid layout?', options: ['grid-gap', 'column-gap', 'gap-col', 'column-space'], correct: 'column-gap' },
  { id: 'wq2', type: 'mcq', text: 'What is the shorthand for grid-row-start and grid-row-end?', options: ['grid-row', 'grid-span', 'row-range', 'grid-line-row'], correct: 'grid-row' },
  { id: 'wq3', type: 'code', text: 'Write a CSS rule: container with 3 columns where middle is twice as wide.', correct: 'display: grid; grid-template-columns: 1fr 2fr 1fr;' },
];
const BACKEND_Q = [
  { id: 'bq1', type: 'mcq', text: 'Which middleware signature handles errors in Express?', options: ['(req,res,error)', '(err,req,res,next)', '(req,res,next,err)', '(err,next)'], correct: '(err,req,res,next)' },
  { id: 'bq2', type: 'mcq', text: 'What does CORS middleware control?', options: ['Cross-Origin Resource Sharing', 'Database indexing', 'Route encryption', 'Websocket channels'], correct: 'Cross-Origin Resource Sharing' },
];

// ─── Subjects (class-grouped with teacher + time window) ────────
export const SUBJECTS = [
  {
    id: 'sub-oops',
    code: 'CS301',
    name: 'Object Oriented Programming',
    shortName: 'OOPs Lab',
    teacher: { name: 'Prof. Anjali Sharma', initials: 'AS', department: 'Computer Science' },
    scheduleLabel: 'Today · 12:00 PM – 2:00 PM',
    availableFrom: '12:00',
    availableTo: '14:00',
    accentColor: '#fa520f',
    icon: 'code',
    assessments: [
      {
        id: 'oops-t1',
        title: 'OOPs Test 1 — Classes & Objects',
        desc: 'Covers class declaration, object instantiation, constructors and encapsulation.',
        difficulty: 'easy',
        topic: 'OOPs',
        duration: 30,
        coinsReward: 20,
        questions: OOPS_Q,
      },
      {
        id: 'oops-t2',
        title: 'OOPs Test 2 — Inheritance & Polymorphism',
        desc: 'Single, multiple, and hierarchical inheritance with method overriding concepts.',
        difficulty: 'medium',
        topic: 'OOPs',
        duration: 40,
        coinsReward: 30,
        questions: OOPS_Q2,
      },
    ],
  },
  {
    id: 'sub-dsa',
    code: 'CS201',
    name: 'Data Structures & Algorithms',
    shortName: 'DSA Lab',
    teacher: { name: 'Prof. Rajesh Kumar', initials: 'RK', department: 'Computer Science' },
    scheduleLabel: 'Today · 3:00 PM – 5:00 PM',
    availableFrom: '15:00',
    availableTo: '17:00',
    accentColor: '#3b82f6',
    icon: 'database',
    assessments: [
      {
        id: 'dsa-t1',
        title: 'DSA Test 1 — Linked Lists',
        desc: 'Practice insert, delete and traversal on singly, doubly and circular linked lists.',
        difficulty: 'easy',
        topic: 'DSA',
        duration: 30,
        coinsReward: 20,
        questions: DSA_Q,
      },
      {
        id: 'dsa-t2',
        title: 'DSA Test 2 — Sorting & Trees',
        desc: 'QuickSort, MergeSort complexity and Binary Search Tree operations.',
        difficulty: 'medium',
        topic: 'DSA',
        duration: 45,
        coinsReward: 35,
        questions: DSA_Q2,
      },
    ],
  },
  {
    id: 'sub-webdev',
    code: 'CS401',
    name: 'Web Development',
    shortName: 'WebDev Lab',
    teacher: { name: 'Prof. Sarah Mitchell', initials: 'SM', department: 'Information Technology' },
    scheduleLabel: 'Tomorrow · 10:00 AM – 12:00 PM',
    availableFrom: '10:00',
    availableTo: '12:00',
    accentColor: '#10b981',
    icon: 'globe',
    assessments: [
      {
        id: 'webdev-t1',
        title: 'WebDev Test 1 — CSS Grid Masterclass',
        desc: 'Validate complex grid structures, template areas, and responsive layout patterns.',
        difficulty: 'medium',
        topic: 'WebDev',
        duration: 35,
        coinsReward: 25,
        questions: WEBDEV_Q,
      },
    ],
  },
  {
    id: 'sub-backend',
    code: 'CS501',
    name: 'Backend Development',
    shortName: 'Backend Lab',
    teacher: { name: 'Prof. David Menon', initials: 'DM', department: 'Computer Science' },
    scheduleLabel: 'Tomorrow · 2:00 PM – 4:00 PM',
    availableFrom: '14:00',
    availableTo: '16:00',
    accentColor: '#8b5cf6',
    icon: 'server',
    assessments: [
      {
        id: 'backend-t1',
        title: 'Backend Test 1 — Express REST Architectures',
        desc: 'Implement middlewares, router setups, error handling and CORS patterns.',
        difficulty: 'hard',
        topic: 'Backend',
        duration: 50,
        coinsReward: 50,
        questions: BACKEND_Q,
      },
    ],
  },
];

// Flattened assessments list (used by quiz engine and legacy consumers)
export const ASSESSMENTS = SUBJECTS.flatMap(s =>
  s.assessments.map(a => ({ ...a, subjectId: s.id, subjectName: s.shortName }))
);

export const INITIAL_SKILLSWAP = {
  matches: [
    { id: "peer-1", name: "Sarah Lin",    give: "React (Expert)",    take: "DSA Fundamentals",    bio: "Excels in modern hooks and Tailwind components. Needs help with graphs.", avatar: "SL", matched: false },
    { id: "peer-2", name: "Priya Patel",  give: "WebDev Styles",     take: "Backend REST Node",   bio: "Can design beautiful UI widgets. Looking to learn databases.",            avatar: "PP", matched: false },
    { id: "peer-3", name: "Michael Chen", give: "SQL Databases",     take: "React Hook Patterns", bio: "Experienced DBA looking to improve frontend architectures.",              avatar: "MC", matched: false },
  ],
  requests: [
    { id: "req-1", sender: "Alex Kim",       skill: "React — Python",   msg: "I can help with Redux setup in exchange for basic Python structures.", status: "pending"  },
    { id: "req-2", sender: "Jessica Thorne", skill: "WebDev — SQL",     msg: "Let's connect Friday evening to trade grids for aggregates.",          status: "accepted" },
  ],
};

export const INITIAL_COMPETITIONS = [
  { id: "comp-1", title: "Weekly DSA Speedrun",         desc: "Prove your speed by solving 5 sorting and searching challenges.", fee: 50, pool: 800, time: "02h 15m", participants: 154, difficulty: "hard",   status: "live",      registered: false },
  { id: "comp-2", title: "React Pixel Perfect Mockup",  desc: "Rebuild a glassmorphic login card exactly as specified. 45 min.", fee: 20, pool: 350, time: "Tomorrow", participants: 84,  difficulty: "medium", status: "upcoming",  registered: false },
  { id: "comp-3", title: "Database Schema Sprint",       desc: "Design an optimized schema for a ride-sharing model.", fee: 40, pool: 500, time: "Ended",    participants: 112, difficulty: "hard",   status: "completed", registered: false },
];

export const AVATAR_COLORS = {
  AW: "#fa520f", MC: "#3b82f6", JD: "#10b981",
  CR: "#f59e0b", DK: "#8b5cf6", SL: "#ec4899",
  PP: "#06b6d4", AK: "#fa520f", AS: "#fa520f",
  RK: "#3b82f6", SM: "#10b981", DM: "#8b5cf6",
};
