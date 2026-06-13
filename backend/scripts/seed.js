/**
 * scripts/seed.js
 * ───────────────
 * Populates the development database with realistic sample data.
 *
 * Usage:
 *   npm run seed            (uses MONGO_URI from .env / defaults)
 *   node scripts/seed.js
 *
 * The script drops every collection it manages, then inserts fresh records
 * so it is safe to run repeatedly.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// ── Models ────────────────────────────────────────────────────────────────────
import User from "../models/User.js";
import Assessment from "../models/Assessment.js";
import Competition from "../models/Competition.js";
import LeaderBoard from "../models/LeaderBoard.js";
import Coin from "../models/Coin.js";
import SkillSwap from "../models/SkillSwap.js";
import UserProgress from "../models/UserProgress.js";
import Submission from "../models/Submission.js";
import Analytics from "../models/Analytics.js";

// ── Config ────────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/far-away";
const DEFAULT_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin1234";

// ── Helpers ───────────────────────────────────────────────────────────────────
const hash = (plain) => bcrypt.hashSync(plain, 12);

function futureDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function pastDate(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

// ── Seed Data ─────────────────────────────────────────────────────────────────

const usersData = [
  {
    email: "admin@faraway.local",
    password: hash(DEFAULT_PASSWORD),
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    batch: "2024",
    branch: "CS",
    skillAreas: ["System Design", "DevOps"],
    coinsBalance: 1000,
    totalCoinsEarned: 1000,
  },
  {
    email: "teacher@faraway.local",
    password: hash(DEFAULT_PASSWORD),
    firstName: "Jane",
    lastName: "Doe",
    role: "teacher",
    batch: "2023",
    branch: "CS",
    skillAreas: ["Backend Development", "Databases"],
    coinsBalance: 800,
    totalCoinsEarned: 800,
  },
  {
    email: "student1@faraway.local",
    password: hash(DEFAULT_PASSWORD),
    firstName: "Alice",
    lastName: "Johnson",
    role: "student",
    batch: "2025",
    branch: "CS",
    skillAreas: ["JavaScript", "React"],
    coinsBalance: 500,
    totalCoinsEarned: 500,
  },
  {
    email: "student2@faraway.local",
    password: hash(DEFAULT_PASSWORD),
    firstName: "Bob",
    lastName: "Smith",
    role: "student",
    batch: "2025",
    branch: "IT",
    skillAreas: ["Python", "Machine Learning"],
    coinsBalance: 500,
    totalCoinsEarned: 500,
  },
  {
    email: "student3@faraway.local",
    password: hash(DEFAULT_PASSWORD),
    firstName: "Carol",
    lastName: "Williams",
    role: "student",
    batch: "2025",
    branch: "ECE",
    skillAreas: ["C++", "Embedded Systems"],
    coinsBalance: 500,
    totalCoinsEarned: 500,
  },
];

function buildAssessments(teacherId) {
  return [
    {
      title: "JavaScript Fundamentals",
      topic: "JavaScript",
      difficulty: "easy",
      duration: 15,
      coinsReward: 20,
      createdBy: teacherId,
      questions: [
        {
          type: "mcq",
          title: "What keyword declares a block-scoped variable?",
          options: ["var", "let", "const", "both let and const"],
          correctAnswer: "both let and const",
          points: 1,
        },
        {
          type: "mcq",
          title: "Which method converts JSON text to a JavaScript object?",
          options: ["JSON.parse()", "JSON.stringify()", "JSON.toObject()", "JSON.objectify()"],
          correctAnswer: "JSON.parse()",
          points: 1,
        },
        {
          type: "mcq",
          title: "What does '===' check in JavaScript?",
          options: ["Value only", "Type only", "Value and type", "Reference"],
          correctAnswer: "Value and type",
          points: 1,
        },
        {
          type: "mcq",
          title: "Which array method creates a new array with transformed elements?",
          options: ["forEach", "filter", "map", "reduce"],
          correctAnswer: "map",
          points: 1,
        },
      ],
    },
    {
      title: "React Essentials",
      topic: "React",
      difficulty: "medium",
      duration: 20,
      coinsReward: 30,
      createdBy: teacherId,
      questions: [
        {
          type: "mcq",
          title: "What hook manages state in a functional component?",
          options: ["useEffect", "useState", "useReducer", "useContext"],
          correctAnswer: "useState",
          points: 1,
        },
        {
          type: "mcq",
          title: "What does the virtual DOM improve?",
          options: ["SEO", "Rendering performance", "Security", "Network speed"],
          correctAnswer: "Rendering performance",
          points: 1,
        },
        {
          type: "mcq",
          title: "Which hook replaces lifecycle methods like componentDidMount?",
          options: ["useState", "useEffect", "useCallback", "useMemo"],
          correctAnswer: "useEffect",
          points: 1,
        },
      ],
    },
    {
      title: "Node.js & Express Deep Dive",
      topic: "Backend",
      difficulty: "hard",
      duration: 30,
      coinsReward: 50,
      createdBy: teacherId,
      questions: [
        {
          type: "mcq",
          title: "What is the default module system in Node.js (pre-ESM)?",
          options: ["AMD", "UMD", "CommonJS", "ES Modules"],
          correctAnswer: "CommonJS",
          points: 2,
        },
        {
          type: "mcq",
          title: "Which Express method registers middleware for all HTTP verbs?",
          options: ["app.get()", "app.use()", "app.all()", "app.route()"],
          correctAnswer: "app.use()",
          points: 2,
        },
        {
          type: "mcq",
          title: "What does the 'cluster' module do in Node.js?",
          options: [
            "Manages database clusters",
            "Forks worker processes to utilise multi-core CPUs",
            "Handles WebSocket connections",
            "Manages package dependencies",
          ],
          correctAnswer: "Forks worker processes to utilise multi-core CPUs",
          points: 2,
        },
      ],
    },
    {
      title: "Python Basics",
      topic: "Python",
      difficulty: "easy",
      duration: 15,
      coinsReward: 20,
      createdBy: teacherId,
      questions: [
        {
          type: "mcq",
          title: "What keyword defines a function in Python?",
          options: ["function", "func", "def", "define"],
          correctAnswer: "def",
          points: 1,
        },
        {
          type: "mcq",
          title: "Which data structure uses key-value pairs?",
          options: ["list", "tuple", "set", "dictionary"],
          correctAnswer: "dictionary",
          points: 1,
        },
        {
          type: "mcq",
          title: "How do you start a comment in Python?",
          options: ["//", "/*", "#", "--"],
          correctAnswer: "#",
          points: 1,
        },
      ],
    },
  ];
}

function buildCompetitions(adminId) {
  return [
    {
      title: "JavaScript Sprint Challenge",
      type: "individual",
      topic: "JavaScript",
      startDate: futureDate(3),
      endDate: futureDate(4),
      entryFee: 50,
      status: "upcoming",
      prizePool: { rank1: 300, rank2: 150, rank3: 75 },
      createdBy: adminId,
      rounds: [
        {
          roundName: "Speed Round",
          duration: 10,
          questions: [{ text: "What is a closure?", type: "mcq" }],
        },
      ],
    },
    {
      title: "Full-Stack Hackathon",
      type: "group",
      topic: "Backend",
      startDate: futureDate(7),
      endDate: futureDate(9),
      entryFee: 100,
      maxTeams: 10,
      status: "upcoming",
      prizePool: { rank1: 500, rank2: 250, rank3: 100 },
      createdBy: adminId,
      rounds: [
        {
          roundName: "Architecture Design",
          duration: 60,
          questions: [{ text: "Design a URL shortener", type: "design" }],
        },
        {
          roundName: "Implementation",
          duration: 120,
          questions: [{ text: "Build the service", type: "dev" }],
        },
      ],
    },
    {
      title: "React UI Challenge",
      type: "individual",
      topic: "React",
      startDate: pastDate(1),
      endDate: futureDate(1),
      entryFee: 0,
      status: "active",
      prizePool: { rank1: 200, rank2: 100, rank3: 50 },
      createdBy: adminId,
    },
  ];
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function seed() {
  console.log(`Connecting to ${MONGO_URI} …`);
  await mongoose.connect(MONGO_URI);
  console.log("Connected.\n");

  // Drop managed collections
  const collections = [User, Assessment, Competition, LeaderBoard, Coin, SkillSwap, UserProgress, Submission, Analytics];
  for (const Model of collections) {
    await Model.deleteMany({});
  }
  console.log("Cleared existing data.\n");

  // ── Users ─────────────────────────────────────────────────────────────────
  const users = await User.insertMany(usersData);
  const [admin, teacher, alice, bob, carol] = users;
  console.log(`✓ ${users.length} users created`);
  console.log(`  Admin  : ${admin.email}  /  ${DEFAULT_PASSWORD}`);
  console.log(`  Teacher: ${teacher.email}  /  ${DEFAULT_PASSWORD}`);
  console.log(`  Students: ${alice.email}, ${bob.email}, ${carol.email}  /  ${DEFAULT_PASSWORD}\n`);

  // ── Assessments ───────────────────────────────────────────────────────────
  const assessments = await Assessment.insertMany(buildAssessments(teacher._id));
  console.log(`✓ ${assessments.length} assessments created\n`);

  // ── Competitions ──────────────────────────────────────────────────────────
  const competitions = await Competition.insertMany(buildCompetitions(admin._id));
  console.log(`✓ ${competitions.length} competitions created\n`);

  // ── Leaderboard Entries ───────────────────────────────────────────────────
  const leaderboardEntries = [
    { userId: alice._id, topic: "JavaScript", score: 85, xp: 425, coins: 60, rank: 1, badge: "Expert" },
    { userId: bob._id, topic: "JavaScript", score: 72, xp: 360, coins: 40, rank: 2, badge: "Intermediate" },
    { userId: carol._id, topic: "JavaScript", score: 55, xp: 275, coins: 20, rank: 3, badge: "Beginner" },
    { userId: alice._id, topic: "React", score: 90, xp: 450, coins: 80, rank: 1, badge: "Expert" },
    { userId: bob._id, topic: "Python", score: 88, xp: 440, coins: 70, rank: 1, badge: "Expert" },
  ];
  await LeaderBoard.insertMany(leaderboardEntries);
  console.log(`✓ ${leaderboardEntries.length} leaderboard entries created\n`);

  // ── Coin Transactions ─────────────────────────────────────────────────────
  const coinTxns = [
    { userId: alice._id, type: "credit", amount: 500, balanceAfter: 500, reason: "Welcome bonus", referenceType: "manual" },
    { userId: alice._id, type: "credit", amount: 20, balanceAfter: 520, reason: "Completed: JavaScript Fundamentals", referenceType: "assessment", referenceId: assessments[0]._id },
    { userId: bob._id, type: "credit", amount: 500, balanceAfter: 500, reason: "Welcome bonus", referenceType: "manual" },
    { userId: carol._id, type: "credit", amount: 500, balanceAfter: 500, reason: "Welcome bonus", referenceType: "manual" },
  ];
  await Coin.insertMany(coinTxns);
  console.log(`✓ ${coinTxns.length} coin transactions created\n`);

  // ── SkillSwap Requests ────────────────────────────────────────────────────
  const skillSwaps = [
    {
      requester: alice._id,
      teachSkill: "React",
      learnSkill: "Python",
      message: "I can teach you React hooks and state management in exchange for Python basics!",
      status: "open",
    },
    {
      requester: bob._id,
      receiver: alice._id,
      teachSkill: "Machine Learning",
      learnSkill: "JavaScript",
      message: "Let's swap ML and JS skills!",
      status: "pending",
    },
    {
      requester: carol._id,
      teachSkill: "C++",
      learnSkill: "React",
      message: "Want to learn modern frontend development",
      status: "open",
    },
  ];
  await SkillSwap.insertMany(skillSwaps);
  console.log(`✓ ${skillSwaps.length} SkillSwap requests created\n`);

  // ── User Progress ─────────────────────────────────────────────────────────
  const progressRecords = [
    {
      userId: alice._id,
      topic: "JavaScript",
      lastAssessmentScore: 85,
      averageScore: 82,
      attemptCount: 3,
      correctAnswers: 10,
      incorrectAnswers: 2,
      currentDifficulty: "hard",
      status: "advanced",
    },
    {
      userId: bob._id,
      topic: "Python",
      lastAssessmentScore: 88,
      averageScore: 85,
      attemptCount: 2,
      correctAnswers: 5,
      incorrectAnswers: 1,
      currentDifficulty: "hard",
      status: "advanced",
    },
    {
      userId: carol._id,
      topic: "JavaScript",
      lastAssessmentScore: 55,
      averageScore: 50,
      attemptCount: 1,
      correctAnswers: 2,
      incorrectAnswers: 2,
      currentDifficulty: "medium",
      status: "intermediate",
    },
  ];
  await UserProgress.insertMany(progressRecords);
  console.log(`✓ ${progressRecords.length} user progress records created\n`);

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log("─".repeat(50));
  console.log("Seed complete.  You can now start the server:");
  console.log("  npm run dev");
  console.log("─".repeat(50));

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
