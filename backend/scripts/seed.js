/**
 * scripts/seed.js
 * ───────────────
 * Populates the development database with realistic sample data.
 * Includes User, Assessment, Competition, LeaderBoard, Coin, SkillSwap,
 * UserProgress, Submission, Analytics, QuestionBank, and coding problem models.
 *
 * Usage:
 *   npm run seed            (uses MONGO_URI from .env / defaults)
 *   node scripts/seed.js
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
import QuestionBank from "../models/QuestionBank.js";
import Problem from "../models/Problem.js";
import CodingSubmission from "../models/CodingSubmission.js";
import ClassroomGroup from "../models/ClassroomGroup.js";
import { assertSafeDatabaseMutation } from "./databaseSafety.js";

// ── Config ────────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/far-away";
const DEFAULT_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin1234";

const hash = (plain) => bcrypt.hashSync(plain, 12);

function redactConnectionString(uri = "") {
  return uri.replace(/\/\/([^:/@]+):([^@]+)@/, "//$1:****@");
}

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

// Helper to build assessments (both static ones and the new dynamic/adaptive ones)
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
      ],
    },
    // ─── NEW DYNAMIC / ADAPTIVE ASSESSMENTS (Phase 4) ───
    {
      title: "Weekly DSA Speedrun",
      topic: "DSA",
      difficulty: "medium",
      duration: 25,
      coinsReward: 50,
      createdBy: teacherId,
      questionConfig: {
        isDynamic: true,
        isAdaptive: true,
        count: 5,
        preventRepeat: true,
        difficultyRange: { min: 1, max: 5 },
      },
      questions: [], // Loaded dynamically from QuestionBank
    },
    {
      title: "OOPs Adaptive Mastery Test",
      topic: "OOPs",
      difficulty: "medium",
      duration: 20,
      coinsReward: 40,
      createdBy: teacherId,
      questionConfig: {
        isDynamic: true,
        isAdaptive: true,
        count: 5,
        preventRepeat: true,
        difficultyRange: { min: 1, max: 5 },
      },
      questions: [],
    },
    {
      title: "WebDev Dynamic Quiz",
      topic: "WebDev",
      difficulty: "easy",
      duration: 15,
      coinsReward: 30,
      createdBy: teacherId,
      questionConfig: {
        isDynamic: true,
        isAdaptive: true,
        count: 5,
        preventRepeat: true,
        difficultyRange: { min: 1, max: 5 },
      },
      questions: [],
    },
    {
      title: "Backend Dynamic Challenge",
      topic: "Backend",
      difficulty: "hard",
      duration: 30,
      coinsReward: 60,
      createdBy: teacherId,
      questionConfig: {
        isDynamic: true,
        isAdaptive: true,
        count: 5,
        preventRepeat: true,
        difficultyRange: { min: 1, max: 5 },
      },
      questions: [],
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
      title: "React UI Challenge",
      type: "individual",
      topic: "React",
      startDate: pastDate(1),
      endDate: futureDate(1),
      entryFee: 50,
      status: "active",
      prizePool: { rank1: 200, rank2: 100, rank3: 50 },
      createdBy: adminId,
    },
  ];
}

function buildProblems(adminId) {
  return [
    {
      title: "Sum Two Numbers",
      slug: "sum-two-numbers",
      statement: "Read two integers from standard input and print their sum.",
      constraints: ["-10^9 <= a, b <= 10^9", "Input contains exactly two integers separated by whitespace."],
      inputFormat: "Two integers: a b",
      outputFormat: "A single integer: a + b",
      difficulty: "easy",
      tags: ["math", "warmup"],
      supportedLanguages: ["javascript"],
      starterCode: [
        {
          language: "javascript",
          code: "const values = input.trim().split(/\\s+/).map(Number);\nconst [a, b] = values;\nconsole.log(a + b);",
        },
      ],
      editorial: "Split the input by whitespace, convert both values to numbers, and print their sum.",
      solutionCode: "const [a, b] = input.trim().split(/\\s+/).map(Number);\nconsole.log(a + b);",
      authorId: adminId,
      testCases: [
        { name: "Small positives", stdin: "2 3", expectedOutput: "5", isHidden: false },
        { name: "Includes negative", stdin: "-4 10", expectedOutput: "6", isHidden: false },
        { name: "Large values", stdin: "1000000000 -1", expectedOutput: "999999999", isHidden: true },
      ],
    },
    {
      title: "Balanced Parentheses",
      slug: "balanced-parentheses",
      statement: "Given a string containing only parentheses, brackets, and braces, print YES if every opening symbol is closed in the correct order; otherwise print NO.",
      constraints: ["1 <= s.length <= 100000", "s contains only (), [], and {} characters."],
      inputFormat: "A single string s.",
      outputFormat: "YES if balanced, otherwise NO.",
      difficulty: "medium",
      tags: ["stack", "strings"],
      supportedLanguages: ["javascript"],
      starterCode: [
        {
          language: "javascript",
          code: "const s = input.trim();\nconst stack = [];\nconst pairs = { ')': '(', ']': '[', '}': '{' };\nlet ok = true;\nfor (const ch of s) {\n  if (ch === '(' || ch === '[' || ch === '{') stack.push(ch);\n  else if (stack.pop() !== pairs[ch]) {\n    ok = false;\n    break;\n  }\n}\nconsole.log(ok && stack.length === 0 ? 'YES' : 'NO');",
        },
      ],
      editorial: "Use a stack. Push opening symbols, and for each closing symbol ensure it matches the most recent opening symbol.",
      solutionCode: "const s = input.trim();\nconst stack = [];\nconst pairs = { ')': '(', ']': '[', '}': '{' };\nlet ok = true;\nfor (const ch of s) {\n  if ('([{'.includes(ch)) stack.push(ch);\n  else if (stack.pop() !== pairs[ch]) { ok = false; break; }\n}\nconsole.log(ok && stack.length === 0 ? 'YES' : 'NO');",
      authorId: adminId,
      testCases: [
        { name: "Nested valid", stdin: "({[]})", expectedOutput: "YES", isHidden: false },
        { name: "Crossed invalid", stdin: "([)]", expectedOutput: "NO", isHidden: false },
        { name: "Unclosed", stdin: "(((()", expectedOutput: "NO", isHidden: true },
        { name: "Multiple groups", stdin: "{}[]()", expectedOutput: "YES", isHidden: true },
      ],
    },
  ];
}

// ── Question Bank Seed Generator (210 Questions) ─────────────────────────────────
function buildQuestionBankPool() {
  const pool = [];
  const topics = ["DSA", "OOPs", "WebDev", "Backend", "JavaScript", "React", "Python"];

  // Helper dictionary containing structured template questions for each topic
  // 6 questions per difficulty (1-5) for each of the 7 topics = 210 questions
  const data = {
    DSA: {
      1: [
        { title: "What is the time complexity of looking up an element in an array by index?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], correctAnswer: "O(1)", subtopic: "Arrays" },
        { title: "Which data structure follows the Last In First Out (LIFO) principle?", options: ["Queue", "Stack", "Tree", "Graph"], correctAnswer: "Stack", subtopic: "Stacks" },
        { title: "What is the primary characteristic of a linked list?", options: ["Contiguous memory allocation", "Sequential node links", "Direct indexing", "Logarithmic search"], correctAnswer: "Sequential node links", subtopic: "Linked Lists" },
        { title: "Which of the following is a linear data structure?", options: ["Tree", "Graph", "Queue", "Heap"], correctAnswer: "Queue", subtopic: "Queues" },
        { title: "What is the value of index of the first element in an array?", options: ["1", "-1", "0", "None of the above"], correctAnswer: "0", subtopic: "Arrays" },
        { title: "Which search algorithm checks elements one by one?", options: ["Binary Search", "Linear Search", "Depth First Search", "Breadth First Search"], correctAnswer: "Linear Search", subtopic: "Searching" },
      ],
      2: [
        { title: "What is the average time complexity of Binary Search?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], correctAnswer: "O(log n)", subtopic: "Searching" },
        { title: "Which sort has a worst-case time complexity of O(n^2)?", options: ["Merge Sort", "Quick Sort", "Heap Sort", "All of the above"], correctAnswer: "Quick Sort", subtopic: "Sorting" },
        { title: "In a Singly Linked List, how long does it take to insert a node at the head?", options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"], correctAnswer: "O(1)", subtopic: "Linked Lists" },
        { title: "What data structure is typically used to implement Breadth First Search (BFS)?", options: ["Stack", "Queue", "Priority Queue", "Tree"], correctAnswer: "Queue", subtopic: "Graphs" },
        { title: "What is the maximum number of children a binary tree node can have?", options: ["1", "2", "3", "Unlimited"], correctAnswer: "2", subtopic: "Trees" },
        { title: "Which structure uses FIFO (First In First Out)?", options: ["Stack", "Queue", "Binary Tree", "Heap"], correctAnswer: "Queue", subtopic: "Queues" },
      ],
      3: [
        { title: "Which traversal of a Binary Search Tree (BST) yields elements in sorted order?", options: ["Pre-order", "In-order", "Post-order", "Level-order"], correctAnswer: "In-order", subtopic: "Trees" },
        { title: "What is the average time complexity of insertion in a Hash Table?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], correctAnswer: "O(1)", subtopic: "Hashing" },
        { title: "What is the worst-case time complexity of Merge Sort?", options: ["O(log n)", "O(n)", "O(n log n)", "O(n^2)"], correctAnswer: "O(n log n)", subtopic: "Sorting" },
        { title: "In a circular queue, how is the full condition checked?", options: ["(rear + 1) % size === front", "rear === front", "front === rear + 1", "rear + 1 === size"], correctAnswer: "(rear + 1) % size === front", subtopic: "Queues" },
        { title: "Which algorithm finds the shortest path in a weighted graph with non-negative weights?", options: ["Kruskal's", "Prim's", "Dijkstra's", "Floyd-Warshall"], correctAnswer: "Dijkstra's", subtopic: "Graphs" },
        { title: "What is the height of a balanced binary tree with n nodes?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], correctAnswer: "O(log n)", subtopic: "Trees" },
      ],
      4: [
        { title: "Which graph representation is best for sparse graphs?", options: ["Adjacency Matrix", "Adjacency List", "Incidence Matrix", "Edge List"], correctAnswer: "Adjacency List", subtopic: "Graphs" },
        { title: "What is the optimal substructure property in Dynamic Programming?", options: ["Optimal solution contains optimal solutions of subproblems", "Problem can be divided into independent subproblems", "Greedy choice is locally optimal", "Recursion can be bypassed"], correctAnswer: "Optimal solution contains optimal solutions of subproblems", subtopic: "Dynamic Programming" },
        { title: "Which tree automatically balances itself on insertion?", options: ["AVL Tree", "Binary Search Tree", "Trie", "Huffman Tree"], correctAnswer: "AVL Tree", subtopic: "Trees" },
        { title: "What is the time complexity of building a heap from an array of size n?", options: ["O(log n)", "O(n)", "O(n log n)", "O(n^2)"], correctAnswer: "O(n)", subtopic: "Heaps" },
        { title: "Which collision resolution technique uses linked lists inside hash slots?", options: ["Open Addressing", "Linear Probing", "Chaining", "Double Hashing"], correctAnswer: "Chaining", subtopic: "Hashing" },
        { title: "What is the main advantage of a Trie data structure?", options: ["O(1) prefix lookup and auto-completion", "Very low memory consumption", "Optimal sorting", "Direct array-based access"], correctAnswer: "O(1) prefix lookup and auto-completion", subtopic: "Trees" },
      ],
      5: [
        { title: "What is the time complexity of the Floyd-Warshall algorithm?", options: ["O(V^2)", "O(V log V)", "O(V^3)", "O(E log V)"], correctAnswer: "O(V^3)", subtopic: "Graphs" },
        { title: "Which data structure is best suited for executing range minimum queries (RMQ) efficiently?", options: ["Segment Tree", "Trie", "AVL Tree", "B-Tree"], correctAnswer: "Segment Tree", subtopic: "Advanced DS" },
        { title: "What is the worst-case lookup time in a Red-Black Tree?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], correctAnswer: "O(log n)", subtopic: "Trees" },
        { title: "What is the time complexity of A* Search in the worst case?", options: ["O(b^d)", "O(V log V)", "O(E + V)", "O(1)"], correctAnswer: "O(b^d)", subtopic: "Searching" },
        { title: "Which algorithm solves the Single Source Shortest Path problem with negative weights?", options: ["Dijkstra's", "Bellman-Ford", "Floyd-Warshall", "Kruskal's"], correctAnswer: "Bellman-Ford", subtopic: "Graphs" },
        { title: "What is the space complexity of the Knapsack 0/1 dynamic programming approach?", options: ["O(N)", "O(W)", "O(N * W)", "O(2^N)"], correctAnswer: "O(N * W)", subtopic: "Dynamic Programming" },
      ]
    },
    OOPs: {
      1: [
        { title: "What is the basic runtime entity in Object Oriented Programming?", options: ["Class", "Object", "Method", "Variable"], correctAnswer: "Object", subtopic: "Objects" },
        { title: "Which keyword is commonly used to instantiate an object from a class?", options: ["create", "new", "make", "instantiate"], correctAnswer: "new", subtopic: "Classes" },
        { title: "A class definition acts as a ____________ for creating objects.", options: ["blueprint", "instance", "method", "variable"], correctAnswer: "blueprint", subtopic: "Classes" },
        { title: "What is the process of binding data and functions together into a single unit?", options: ["Abstraction", "Inheritance", "Polymorphism", "Encapsulation"], correctAnswer: "Encapsulation", subtopic: "Encapsulation" },
        { title: "Which OOP concept represents real-world entities inside code?", options: ["Polymorphism", "Data Binding", "Abstraction", "Inheritance"], correctAnswer: "Abstraction", subtopic: "Abstraction" },
        { title: "What function is automatically called when an object is created?", options: ["Destructor", "Constructor", "Initializer", "Main method"], correctAnswer: "Constructor", subtopic: "Constructors" },
      ],
      2: [
        { title: "Which access modifier allows access within the same package and subclass?", options: ["private", "public", "protected", "default"], correctAnswer: "protected", subtopic: "Access Modifiers" },
        { title: "What is the primary benefit of Inheritance?", options: ["Data Hiding", "Code Reusability", "Static Binding", "Encapsulation"], correctAnswer: "Code Reusability", subtopic: "Inheritance" },
        { title: "Which class cannot be instantiated directly?", options: ["Concrete Class", "Abstract Class", "Interface", "Both Abstract Class and Interface"], correctAnswer: "Both Abstract Class and Interface", subtopic: "Abstraction" },
        { title: "Which keyword references the current instance of a class in Java/C++?", options: ["super", "parent", "this", "self"], correctAnswer: "this", subtopic: "Classes" },
        { title: "Which access modifier keeps class members accessible only within the class itself?", options: ["private", "protected", "public", "internal"], correctAnswer: "private", subtopic: "Access Modifiers" },
        { title: "Can a constructor be overloaded?", options: ["Yes", "No", "Only in Java", "Only in C++"], correctAnswer: "Yes", subtopic: "Constructors" },
      ],
      3: [
        { title: "What is method overloading?", options: ["Multiple methods with same name but different signatures", "Redefining parent method in subclass", "Passing too many arguments", "Calling parent class constructor"], correctAnswer: "Multiple methods with same name but different signatures", subtopic: "Polymorphism" },
        { title: "What is method overriding?", options: ["Redefining a superclass method in a subclass", "Defining multiple methods with same name but different arguments", "Calling parent method dynamically", "Bypassing compilation checks"], correctAnswer: "Redefining a superclass method in a subclass", subtopic: "Polymorphism" },
        { title: "What is runtime polymorphism achieved through?", options: ["Method Overloading", "Method Overriding / Virtual Functions", "Operator Overloading", "Constructors"], correctAnswer: "Method Overriding / Virtual Functions", subtopic: "Polymorphism" },
        { title: "What is an interface in OOP?", options: ["A blueprint containing abstract methods and constants", "A user dashboard layout", "A parent class with concrete methods", "A memory manager"], correctAnswer: "A blueprint containing abstract methods and constants", subtopic: "Abstraction" },
        { title: "Which OOP principle hides internal details and exposes only essential functionality?", options: ["Abstraction", "Inheritance", "Polymorphism", "Encapsulation"], correctAnswer: "Abstraction", subtopic: "Abstraction" },
        { title: "What is the purpose of the 'super' keyword in Java?", options: ["Refers to parent class constructors, variables, or methods", "Creates a super-user session", "Increases memory allocation", "None of the above"], correctAnswer: "Refers to parent class constructors, variables, or methods", subtopic: "Inheritance" },
      ],
      4: [
        { title: "What is the Diamond Problem in multiple inheritance?", options: ["Ambiguity when a class inherits from two classes that have a common parent", "Inability to instantiate abstract classes", "Memory leak in destructors", "Slow execution of virtual methods"], correctAnswer: "Ambiguity when a class inherits from two classes that have a common parent", subtopic: "Inheritance" },
        { title: "What does the 'L' in SOLID design principles stand for?", options: ["Liskov Substitution Principle", "Layout Design Principle", "Linkage Rule", "Least Authority"], correctAnswer: "Liskov Substitution Principle", subtopic: "SOLID" },
        { title: "What is the difference between composition and inheritance?", options: ["Composition is 'has-a' relationship; inheritance is 'is-a'", "Inheritance is 'has-a' relationship; composition is 'is-a'", "They are exactly the same", "Composition is static; inheritance is dynamic"], correctAnswer: "Composition is 'has-a' relationship; inheritance is 'is-a'", subtopic: "Design Patterns" },
        { title: "What is a virtual destructor used for in C++?", options: ["Ensures derived class destructors are called on parent reference deletion", "Destroys virtual methods", "Releases static memory", "Speeds up compilation"], correctAnswer: "Ensures derived class destructors are called on parent reference deletion", subtopic: "Destructors" },
        { title: "Which design pattern ensures a class has only one instance?", options: ["Factory", "Observer", "Singleton", "Decorator"], correctAnswer: "Singleton", subtopic: "Design Patterns" },
        { title: "What is dynamic binding?", options: ["Binding method call to definition at runtime", "Binding variables dynamically at compile time", "Dynamic typing of language variables", "Linking libraries at runtime"], correctAnswer: "Binding method call to definition at runtime", subtopic: "Polymorphism" },
      ],
      5: [
        { title: "Which pattern lets objects be notified of state changes in another object?", options: ["Singleton", "Observer", "Strategy", "Adapter"], correctAnswer: "Observer", subtopic: "Design Patterns" },
        { title: "What does Dependency Inversion Principle state?", options: ["High-level modules should not depend on low-level modules; both should depend on abstractions", "Subclasses should be substitutable for superclasses", "Classes should have only one reason to change", "Interface should be split into smaller interfaces"], correctAnswer: "High-level modules should not depend on low-level modules; both should depend on abstractions", subtopic: "SOLID" },
        { title: "What is the difference between shallow copy and deep copy?", options: ["Shallow copy copies references; deep copy clones nested objects", "Deep copy copies references; shallow copy clones nested objects", "They are identical in OOP", "Shallow copy is compiled; deep copy is interpreted"], correctAnswer: "Shallow copy copies references; deep copy clones nested objects", subtopic: "Memory Management" },
        { title: "What is double dispatch in polymorphism?", options: ["Mechanism that dispatches function call based on runtime types of two objects", "Executing a function twice", "Dispatching to two separate threads", "Overloading methods in parent and child"], correctAnswer: "Mechanism that dispatches function call based on runtime types of two objects", subtopic: "Polymorphism" },
        { title: "Which design pattern defines a family of algorithms and encapsulates each one?", options: ["Strategy Pattern", "Factory Pattern", "Singleton Pattern", "Observer Pattern"], correctAnswer: "Strategy Pattern", subtopic: "Design Patterns" },
        { title: "What does Open/Closed Principle state?", options: ["Software entities should be open for extension but closed for modification", "File streams must be closed after opening", "Classes should open public variables", "None of the above"], correctAnswer: "Software entities should be open for extension but closed for modification", subtopic: "SOLID" },
      ]
    },
    WebDev: {
      1: [
        { title: "Which HTML tag is used for the largest heading?", options: ["<h6>", "<heading>", "<h1>", "<head>"], correctAnswer: "<h1>", subtopic: "HTML" },
        { title: "What does CSS stand for?", options: ["Computer Style Sheets", "Creative Style Sheets", "Cascading Style Sheets", "Colorful Style Sheets"], correctAnswer: "Cascading Style Sheets", subtopic: "CSS" },
        { title: "Which HTML element is used to insert a line break?", options: ["<break>", "<br>", "<lb>", "<line>"], correctAnswer: "<br>", subtopic: "HTML" },
        { title: "Which property is used to change the background color of an element in CSS?", options: ["color", "background-color", "bgcolor", "background-style"], correctAnswer: "background-color", subtopic: "CSS" },
        { title: "What is the correct HTML tag for inserting an image?", options: ["<image src='img.gif'>", "<img href='img.gif'>", "<img src='img.gif'>", "<img alt='img.gif'>"], correctAnswer: "<img src='img.gif'>", subtopic: "HTML" },
        { title: "How do you link an external JavaScript file in HTML?", options: ["<script href='app.js'>", "<script src='app.js'>", "<script link='app.js'>", "<link src='app.js'>"], correctAnswer: "<script src='app.js'>", subtopic: "HTML" },
      ],
      2: [
        { title: "Which CSS property controls the text size?", options: ["font-style", "text-size", "font-size", "text-style"], correctAnswer: "font-size", subtopic: "CSS" },
        { title: "What is the default value of the position property in CSS?", options: ["relative", "absolute", "static", "fixed"], correctAnswer: "static", subtopic: "CSS" },
        { title: "Which CSS display value sets up a flexible container?", options: ["block", "grid", "inline-block", "flex"], correctAnswer: "flex", subtopic: "CSS" },
        { title: "What is the HTML5 semantic element used to define the footer of a document?", options: ["<bottom>", "<footer>", "<foot>", "<section>"], correctAnswer: "<footer>", subtopic: "HTML" },
        { title: "How do you select an element with id 'demo' in CSS?", options: [".demo", "#demo", "demo", "*demo"], correctAnswer: "#demo", subtopic: "CSS" },
        { title: "Which CSS selector targets all paragraph elements inside a div?", options: ["div p", "div + p", "div > p", "div ~ p"], correctAnswer: "div p", subtopic: "CSS" },
      ],
      3: [
        { title: "What is the CSS Box Model components from inside out?", options: ["Content, Padding, Border, Margin", "Content, Border, Padding, Margin", "Padding, Content, Border, Margin", "Margin, Border, Padding, Content"], correctAnswer: "Content, Padding, Border, Margin", subtopic: "CSS" },
        { title: "Which storage mechanism holds data across browser sessions with no expiration?", options: ["sessionStorage", "cookies", "localStorage", "IndexedDB"], correctAnswer: "localStorage", subtopic: "Browser API" },
        { title: "What does the 'rem' unit in CSS scale relative to?", options: ["The parent element's font size", "The viewport width", "The root HTML element's font size", "The screen resolution"], correctAnswer: "The root HTML element's font size", subtopic: "CSS" },
        { title: "Which HTML attribute specifies that an input field must be filled out before submitting?", options: ["validate", "required", "placeholder", "needed"], correctAnswer: "required", subtopic: "HTML" },
        { title: "How do you apply a CSS grid with 3 equal columns?", options: ["grid-template-columns: 1fr 1fr 1fr", "grid-template-columns: repeat(3, 1fr)", "grid-columns: 3", "Both 1 and 2"], correctAnswer: "Both 1 and 2", subtopic: "CSS" },
        { title: "What does HTTP status code 403 represent?", options: ["Bad Request", "Forbidden", "Unauthorized", "Not Found"], correctAnswer: "Forbidden", subtopic: "HTTP" },
      ],
      4: [
        { title: "What is event delegation in frontend development?", options: ["Attaching a single event listener to a parent element to manage child events", "Delegating event processing to web workers", "Passing events from client to server", "Avoiding DOM events entirely"], correctAnswer: "Attaching a single event listener to a parent element to manage child events", subtopic: "JavaScript DOM" },
        { title: "What HTTP header controls Cross-Origin Resource Sharing (CORS)?", options: ["Access-Control-Allow-Origin", "Origin-Check-Policy", "CORS-Security-Key", "Allow-Cross-Origin"], correctAnswer: "Access-Control-Allow-Origin", subtopic: "HTTP Headers" },
        { title: "What does the CSS property 'box-sizing: border-box' accomplish?", options: ["Includes padding and border in the element's total width and height", "Excludes padding from the total width", "Draws a box border around the element", "None of the above"], correctAnswer: "Includes padding and border in the element's total width and height", subtopic: "CSS" },
        { title: "How do browser cookies differ from localStorage?", options: ["Cookies are sent automatically with HTTP requests; localStorage is client-only", "localStorage holds less data than cookies", "Cookies never expire; localStorage does", "There is no difference"], correctAnswer: "Cookies are sent automatically with HTTP requests; localStorage is client-only", subtopic: "Browser API" },
        { title: "What is the purpose of a CSS media query?", options: ["Applies styles based on viewport size, orientation, or device type", "Links media files like video and audio", "Fetches CSS styles from CDN", "None of the above"], correctAnswer: "Applies styles based on viewport size, orientation, or device type", subtopic: "CSS" },
        { title: "What does 'z-index' control in CSS layout?", options: ["Horizontal positioning", "Vertical positioning", "Stacking order of overlapping elements", "Font scaling size"], correctAnswer: "Stacking order of overlapping elements", subtopic: "CSS" },
      ],
      5: [
        { title: "What is the primary role of a Service Worker in PWAs?", options: ["Intercepting network requests and caching resources for offline usage", "Executing expensive background algorithms in multi-threaded loops", "Rendering complex canvas animations", "Handling socket.io connections"], correctAnswer: "Intercepting network requests and caching resources for offline usage", subtopic: "PWAs" },
        { title: "Which HTTP caching directive forces a browser to validate the cached asset with the origin server before serving it?", options: ["no-store", "no-cache", "must-revalidate", "max-age=0, must-revalidate"], correctAnswer: "no-cache", subtopic: "HTTP Caching" },
        { title: "What security vulnerability occurs when malicious scripts are injected into trusted websites?", options: ["SQL Injection", "Cross-Site Scripting (XSS)", "CSRF", "Man-in-the-Middle"], correctAnswer: "Cross-Site Scripting (XSS)", subtopic: "Web Security" },
        { title: "What is the purpose of Content Security Policy (CSP)?", options: ["Restricts the resources (such as JavaScript, CSS, Images) that the browser is allowed to load for a given page", "Sets access rules for cookies", "Minifies frontend assets automatically", "Encrypts incoming REST requests"], correctAnswer: "Restricts the resources (such as JavaScript, CSS, Images) that the browser is allowed to load for a given page", subtopic: "Web Security" },
        { title: "Which of the following is a key feature of HTTP/2 compared to HTTP/1.1?", options: ["Multiplexing over a single TCP connection", "Header compression (HPACK)", "Server Push capability", "All of the above"], correctAnswer: "All of the above", subtopic: "HTTP" },
        { title: "What does the 'preload' value for the rel attribute in a link element do?", options: ["Declares that the resource is necessary for the current navigation and should be fetched early", "Prerenders the next page link in the background", "Saves the stylesheet in localStorage", "None of the above"], correctAnswer: "Declares that the resource is necessary for the current navigation and should be fetched early", subtopic: "Browser API" },
      ]
    },
    Backend: {
      1: [
        { title: "Which HTTP method is typically used to retrieve data from a server?", options: ["GET", "POST", "PUT", "DELETE"], correctAnswer: "GET", subtopic: "HTTP Methods" },
        { title: "What HTTP response status code indicates a successful request?", options: ["200 OK", "301 Moved Permanently", "404 Not Found", "500 Internal Error"], correctAnswer: "200 OK", subtopic: "HTTP Codes" },
        { title: "Which database type is Mongoose built to interact with?", options: ["PostgreSQL", "MySQL", "MongoDB", "SQLite"], correctAnswer: "MongoDB", subtopic: "Databases" },
        { title: "Which port is standard for HTTP traffic?", options: ["80", "443", "8080", "3000"], correctAnswer: "80", subtopic: "Networking" },
        { title: "What does REST stand for?", options: ["Representational State Transfer", "Request Status Transmitted", "Remote Service Termination", "Responsive System Timing"], correctAnswer: "Representational State Transfer", subtopic: "REST APIs" },
        { title: "Which format is standard for exchanging data in REST APIs?", options: ["XML", "JSON", "CSV", "YAML"], correctAnswer: "JSON", subtopic: "REST APIs" },
      ],
      2: [
        { title: "Which Node.js core module handles file path operations?", options: ["fs", "path", "http", "os"], correctAnswer: "path", subtopic: "Node Core" },
        { title: "What does 'npm' stand for?", options: ["Node Package Manager", "New Project Model", "Node Project Maintainer", "Network Package Model"], correctAnswer: "Node Package Manager", subtopic: "Node Core" },
        { title: "How do you access route parameters in Express (e.g. /users/:id)?", options: ["req.body.id", "req.query.id", "req.params.id", "req.headers.id"], correctAnswer: "req.params.id", subtopic: "Express" },
        { title: "Which HTTP method is designed to update an existing resource by replacing it fully?", options: ["GET", "POST", "PUT", "PATCH"], correctAnswer: "PUT", subtopic: "HTTP Methods" },
        { title: "What is the purpose of package.json file?", options: ["Defines project metadata and list of dependencies", "Stores database credentials", "Configures routing in Express", "None of the above"], correctAnswer: "Defines project metadata and list of dependencies", subtopic: "Node Core" },
        { title: "Which HTTP status code corresponds to 'Unauthorized' access?", options: ["400", "401", "403", "404"], correctAnswer: "401", subtopic: "HTTP Codes" },
      ],
      3: [
        { title: "What is an Express middleware function?", options: ["A function that has access to request, response, and next function in the cycle", "A routing engine", "A database client connection", "A frontend rendering module"], correctAnswer: "A function that has access to request, response, and next function in the cycle", subtopic: "Express" },
        { title: "Which token part contains claims and expiration settings in a JWT?", options: ["Header", "Payload", "Signature", "Metadata"], correctAnswer: "Payload", subtopic: "Authentication" },
        { title: "What is the main difference between relational and NoSQL databases?", options: ["Relational databases use structured tables and schemas; NoSQL is schema-less/document-based", "NoSQL does not support queries", "Relational databases are always faster", "There is no difference"], correctAnswer: "Relational databases use structured tables and schemas; NoSQL is schema-less/document-based", subtopic: "Databases" },
        { title: "What does hashing a password do?", options: ["Transforms it into a one-way cryptographic string for secure storage", "Encrypts it so it can be decrypted back to plain text", "Compresses the password file size", "None of the above"], correctAnswer: "Transforms it into a one-way cryptographic string for secure storage", subtopic: "Security" },
        { title: "Which library is commonly used in Node.js to hash user passwords?", options: ["jsonwebtoken", "bcryptjs", "cors", "winston"], correctAnswer: "bcryptjs", subtopic: "Security" },
        { title: "What HTTP status code is used for 'Created'?", options: ["200", "201", "202", "204"], correctAnswer: "201", subtopic: "HTTP Codes" },
      ],
      4: [
        { title: "What is the primary benefit of creating database indexes?", options: ["Speeds up select query executions", "Increases write execution performance", "Enforces TLS encryption on databases", "Reduces storage space on disk"], correctAnswer: "Speeds up select query executions", subtopic: "Databases" },
        { title: "What is connection pooling?", options: ["Maintaining a cache of database connections that can be reused", "Pooling multiple servers into one IP", "Sharing sessions across multiple subdomains", "None of the above"], correctAnswer: "Maintaining a cache of database connections that can be reused", subtopic: "Databases" },
        { title: "How does Redis cache improve application latency?", options: ["Stores hot data in memory for sub-millisecond retrieval", "Compiles database queries ahead of time", "Distributes traffic across worker nodes", "By compressing images"], correctAnswer: "Stores hot data in memory for sub-millisecond retrieval", subtopic: "Caching" },
        { title: "What is rate limiting used for in APIs?", options: ["Controlling rate of traffic to prevent abuse and brute force attacks", "Measuring network latency in milliseconds", "Limiting the file size of HTTP uploads", "None of the above"], correctAnswer: "Controlling rate of traffic to prevent abuse and brute force attacks", subtopic: "API Design" },
        { title: "Which header enables cross-origin credential sharing (like cookies)?", options: ["Access-Control-Allow-Credentials: true", "Access-Control-Allow-Origin: *", "Origin-Cookies: allowed", "None of the above"], correctAnswer: "Access-Control-Allow-Credentials: true", subtopic: "Express" },
        { title: "What is the event-driven non-blocking I/O model of Node.js based on?", options: ["The libuv event loop", "Multithreading processes", "Child processes spawned per request", "V8 compiler only"], correctAnswer: "The libuv event loop", subtopic: "Node Core" },
      ],
      5: [
        { title: "What does the 'I' in ACID database transactions stand for?", options: ["Isolation", "Integrity", "Inconsistency", "Indexability"], correctAnswer: "Isolation", subtopic: "Databases" },
        { title: "How does horizontal scaling differ from vertical scaling?", options: ["Adding more machines to the resource pool vs adding more CPU/RAM to a single machine", "Adding CPU/RAM vs adding machines", "Scaling software layers vs database tables", "None of the above"], correctAnswer: "Adding more machines to the resource pool vs adding more CPU/RAM to a single machine", subtopic: "System Design" },
        { title: "Which mechanism facilitates pub/sub message queuing in microservices?", options: ["Redis Pub/Sub", "RabbitMQ", "Apache Kafka", "All of the above"], correctAnswer: "All of the above", subtopic: "System Design" },
        { title: "What does database sharding do?", options: ["Horizontally partitions data across multiple database instances", "Creates replicas of database tables", "Encrypts database tables", "Defragments index allocations"], correctAnswer: "Horizontally partitions data across multiple database instances", subtopic: "Databases" },
        { title: "What is the role of a reverse proxy like Nginx?", options: ["Directs client requests to appropriate backend services and handles SSL/Load Balancing", "Acts as a primary database engine", "Interprets JavaScript code", "Stores backend session variables"], correctAnswer: "Directs client requests to appropriate backend services and handles SSL/Load Balancing", subtopic: "System Design" },
        { title: "What algorithm is commonly used for distributed database consensus?", options: ["Raft", "Paxos", "Two-Phase Commit", "All of the above"], correctAnswer: "All of the above", subtopic: "System Design" },
      ]
    },
    JavaScript: {
      1: [
        { title: "What is the result of typeof null in JavaScript?", options: ["'string'", "'object'", "'undefined'", "'number'"], correctAnswer: "'object'", subtopic: "Types" },
        { title: "Which declaration has block scope?", options: ["var", "let", "const", "Both let and const"], correctAnswer: "Both let and const", subtopic: "Variables" },
        { title: "Which method adds an element to the end of an array?", options: ["push()", "pop()", "shift()", "unshift()"], correctAnswer: "push()", subtopic: "Arrays" },
        { title: "What does isNaN stand for?", options: ["Is Not a Number", "Is Number", "Internal Null Value", "Is Null and Negative"], correctAnswer: "Is Not a Number", subtopic: "Functions" },
        { title: "Which value is falsy in JavaScript?", options: ["true", "[]", "0", "1"], correctAnswer: "0", subtopic: "Types" },
        { title: "Which symbol is used for comments in JS?", options: ["//", "/*", "#", "--"], correctAnswer: "//", subtopic: "Basics" }
      ],
      2: [
        { title: "What is the output of '5' + 3 in JavaScript?", options: ["8", "'53'", "15", "NaN"], correctAnswer: "'53'", subtopic: "Operators" },
        { title: "What is the output of '5' - 3 in JavaScript?", options: ["2", "'5-3'", "NaN", "15"], correctAnswer: "2", subtopic: "Operators" },
        { title: "Which operator is used for exponentiation?", options: ["^", "**", "exp", "pow"], correctAnswer: "**", subtopic: "Operators" },
        { title: "What does Array.prototype.map return?", options: ["A new array with transformed elements", "Undefined", "The original array modified", "The sum of elements"], correctAnswer: "A new array with transformed elements", subtopic: "Arrays" },
        { title: "How do you check if an array contains a value?", options: ["has()", "includes()", "contains()", "exists()"], correctAnswer: "includes()", subtopic: "Arrays" },
        { title: "Which method joins two or more arrays?", options: ["concat()", "join()", "merge()", "append()"], correctAnswer: "concat()", subtopic: "Arrays" }
      ],
      3: [
        { title: "What is a closure in JavaScript?", options: ["A function combined with its lexical environment", "A method to close browser tabs", "A private class variable", "A compile-time block syntax"], correctAnswer: "A function combined with its lexical environment", subtopic: "Closures" },
        { title: "What is the purpose of Object.freeze()?", options: ["Prevents modifying existing properties or adding new ones", "Saves object to localStorage", "Locks the variable scope", "Clears object reference memory"], correctAnswer: "Prevents modifying existing properties or adding new ones", subtopic: "Objects" },
        { title: "What is the value of 'this' inside an arrow function?", options: ["Inherited from the enclosing lexical scope", "Global Window object", "Undefined", "The object that invoked the method"], correctAnswer: "Inherited from the enclosing lexical scope", subtopic: "Scope" },
        { title: "What does Promise.all() do?", options: ["Resolves when all promises resolve, or rejects if any reject", "Runs promises sequentially", "Rejects only if all promises reject", "None of the above"], correctAnswer: "Resolves when all promises resolve, or rejects if any reject", subtopic: "Promises" },
        { title: "What is event bubbling in JavaScript?", options: ["Event starts from target and bubbles up to ancestors", "Event propagates down from window to target", "Creating multiple DOM elements dynamically", "Releasing socket connections"], correctAnswer: "Event starts from target and bubbles up to ancestors", subtopic: "Events" },
        { title: "What is the difference between let and var?", options: ["let is block-scoped; var is function-scoped", "let can be redeclared; var cannot", "let is hoisted and initialized to undefined; var is not hoisted", "There is no difference"], correctAnswer: "let is block-scoped; var is function-scoped", subtopic: "Variables" }
      ],
      4: [
        { title: "What is the main difference between call and apply?", options: ["Apply accepts arguments as an array; call accepts them comma-separated", "Call is static; apply is dynamic", "Call binds permanently; apply binds temporarily", "Apply is faster than call"], correctAnswer: "Apply accepts arguments as an array; call accepts them comma-separated", subtopic: "Functions" },
        { title: "What is the purpose of the WeakMap object?", options: ["Holds weak references to keys, allowing garbage collection of keys", "Stores primitive key-value pairs", "Allows key lookups in O(log n) time", "Ensures keys are kept in insertion order"], correctAnswer: "Holds weak references to keys, allowing garbage collection of keys", subtopic: "Objects" },
        { title: "What is the output of Object.prototype.toString.call([])?", options: ["'[object Array]'", "'[object Object]'", "'Array'", "'[]'"], correctAnswer: "'[object Array]'", subtopic: "Types" },
        { title: "What is prototype chaining?", options: ["Mechanism where objects inherit properties from prototypes", "Linking multiple promises in a sequence", "Chaining array methods", "None of the above"], correctAnswer: "Mechanism where objects inherit properties from prototypes", subtopic: "Prototypes" },
        { title: "What does the 'new' keyword do?", options: ["Creates a blank object, sets prototype, binds 'this', returns object", "Allocates static heap segment", "Defines a class constructor", "None of the above"], correctAnswer: "Creates a blank object, sets prototype, binds 'this', returns object", subtopic: "Objects" },
        { title: "How does async/await interact with Promises?", options: ["It provides syntactic sugar for writing promise-based asynchronous code", "It runs asynchronous code synchronously in a new thread", "It bypasses the microtask queue", "None of the above"], correctAnswer: "It provides syntactic sugar for writing promise-based asynchronous code", subtopic: "Promises" }
      ],
      5: [
        { title: "What is a generator function?", options: ["A function that can yield control and resume execution later", "A function that generates random numbers", "A class factory", "An auto-compiling loop"], correctAnswer: "A function that can yield control and resume execution later", subtopic: "Generators" },
        { title: "How does the JavaScript event loop handle microtasks?", options: ["Executes all microtasks before moving to the next macrotask", "Runs them in a separate thread", "Executes them concurrently with paint updates", "Schedules them for the next frame render"], correctAnswer: "Executes all microtasks before moving to the next macrotask", subtopic: "Event Loop" },
        { title: "What is the Temporal Dead Zone (TDZ) in JavaScript?", options: ["Period from block start until variable declaration is executed", "Time taken for promise rejection timeout", "Dead memory in V8 garbage collector", "None of the above"], correctAnswer: "Period from block start until variable declaration is executed", subtopic: "Variables" },
        { title: "What is prototypal inheritance performance impact of Object.setPrototypeOf()?", options: ["It is slow and should be avoided as it affects optimization", "It speeds up lookup caching", "It has zero impact on modern JS engines", "It is resolved at compile time"], correctAnswer: "It is slow and should be avoided as it affects optimization", subtopic: "Prototypes" },
        { title: "What is the purpose of Symbol.iterator?", options: ["Defines default iterator for an object to be used in for-of loops", "Creates a unique identifier for objects", "Clears object property attributes", "Iterates over object keys only"], correctAnswer: "Defines default iterator for an object to be used in for-of loops", subtopic: "Iterators" },
        { title: "Which object allows intercepting and customizing operations on another object?", options: ["Proxy", "Reflect", "WeakMap", "Symbol"], correctAnswer: "Proxy", subtopic: "Proxy" }
      ]
    },
    React: {
      1: [
        { title: "What is React JSX?", options: ["Syntax extension for JavaScript allowing HTML-like templates", "A new file format replacing HTML", "A server side routing engine", "A CSS preprocessor"], correctAnswer: "Syntax extension for JavaScript allowing HTML-like templates", subtopic: "JSX" },
        { title: "How are properties passed into React components?", options: ["Via props", "Via state", "Via contexts", "Via references"], correctAnswer: "Via props", subtopic: "Props" },
        { title: "Which tool transpiles JSX into standard JavaScript?", options: ["Webpack", "Babel", "Vite", "ESLint"], correctAnswer: "Babel", subtopic: "JSX" },
        { title: "What must React components return?", options: ["JSX / React Elements", "HTML files", "String paths", "None of the above"], correctAnswer: "JSX / React Elements", subtopic: "Components" },
        { title: "Which function renders React components in DOM?", options: ["ReactDOM.render() / createRoot()", "React.render()", "DOM.render()", "document.write()"], correctAnswer: "ReactDOM.render() / createRoot()", subtopic: "DOM" },
        { title: "How do you specify a CSS class in JSX?", options: ["class", "className", "classList", "cssClass"], correctAnswer: "className", subtopic: "JSX" },
      ],
      2: [
        { title: "Which hook manages component-level state?", options: ["useState", "useEffect", "useContext", "useRef"], correctAnswer: "useState", subtopic: "Hooks" },
        { title: "How do you bind an event handler (e.g. click) in React?", options: ["onClick={handler}", "onclick='handler()'", "onClick='handler()'", "on-click={handler}"], correctAnswer: "onClick={handler}", subtopic: "Events" },
        { title: "Why are keys necessary in React lists?", options: ["To help React identify which items have changed, been added, or removed", "To style individual items in lists", "To bind index values permanently", "To secure list values"], correctAnswer: "To help React identify which items have changed, been added, or removed", subtopic: "Lists" },
        { title: "What is the state of a component?", options: ["An object holding information that may change over component life", "A global variable structure", "The rendering engine status", "None of the above"], correctAnswer: "An object holding information that may change over component life", subtopic: "State" },
        { title: "Which hook executes cleanup functions before component unmount?", options: ["useState", "useEffect return function", "useMemo", "useCallback"], correctAnswer: "useEffect return function", subtopic: "Hooks" },
        { title: "Can state be passed down to child components directly?", options: ["Yes, as props", "No, only via Context", "No, state is strictly private", "Only using Redux"], correctAnswer: "Yes, as props", subtopic: "Props" },
      ],
      3: [
        { title: "Which hook performs side effects in functional components?", options: ["useState", "useEffect", "useMemo", "useRef"], correctAnswer: "useEffect", subtopic: "Hooks" },
        { title: "What is the Context API used for in React?", options: ["To share state globally across components without prop drilling", "To handle database connections", "To set CSS media styles", "None of the above"], correctAnswer: "To share state globally across components without prop drilling", subtopic: "Context" },
        { title: "Which hook returns a mutable ref object whose .current property persists?", options: ["useRef", "useState", "useMemo", "useCallback"], correctAnswer: "useRef", subtopic: "Hooks" },
        { title: "What is the second argument of useEffect used for?", options: ["Dependency array determining when effect runs", "Initial state value", "Cleanup callback name", "Timeout configuration"], correctAnswer: "Dependency array determining when effect runs", subtopic: "Hooks" },
        { title: "Which hook acts as an alternative to useState for complex state logic?", options: ["useReducer", "useCallback", "useMemo", "useContext"], correctAnswer: "useReducer", subtopic: "Hooks" },
        { title: "What does React.memo do?", options: ["Memoizes functional components to prevent unnecessary re-renders", "Saves variables to sessionStorage", "Caches HTTP requests", "None of the above"], correctAnswer: "Memoizes functional components to prevent unnecessary re-renders", subtopic: "Optimization" },
      ],
      4: [
        { title: "What is the difference between useMemo and useCallback?", options: ["useMemo returns a memoized value; useCallback returns a memoized function", "useCallback returns a memoized value; useMemo returns a memoized function", "They are identical", "useMemo is compile-time; useCallback is runtime"], correctAnswer: "useMemo returns a memoized value; useCallback returns a memoized function", subtopic: "Optimization" },
        { title: "What is a custom hook in React?", options: ["A reusable JavaScript function starting with 'use' containing hook logic", "A hook supplied by third-party packages", "A styling template helper", "None of the above"], correctAnswer: "A reusable JavaScript function starting with 'use' containing hook logic", subtopic: "Custom Hooks" },
        { title: "What does the reconciliation process in React do?", options: ["Compares Virtual DOM tree to Real DOM to update changed nodes", "Resolves database merge conflicts", "Lints React JSX syntax", "Manages state transactions in Redux"], correctAnswer: "Compares Virtual DOM tree to Real DOM to update changed nodes", subtopic: "Fiber" },
        { title: "What is the purpose of React.lazy()?", options: ["Enables lazy loading of components using dynamic imports", "Delays state updates until thread becomes idle", "Defers rendering of heavy lists", "None of the above"], correctAnswer: "Enables lazy loading of components using dynamic imports", subtopic: "Optimization" },
        { title: "What hook extracts context values in functional components?", options: ["useContext", "useContextValue", "contextHook", "useReducer"], correctAnswer: "useContext", subtopic: "Context" },
        { title: "What is the main role of React Fiber?", options: ["Enables incremental rendering and concurrent scheduling of updates", "Replaces the Virtual DOM entirely", "Compiles React components directly to native binary code", "None of the above"], correctAnswer: "Enables incremental rendering and concurrent scheduling of updates", subtopic: "Fiber" },
      ],
      5: [
        { title: "What is Concurrent Mode in React?", options: ["Set of features helping React apps stay responsive by adjusting rendering flows", "Running React components on separate CPU threads", "Running multiple React apps in parallel on the same page", "None of the above"], correctAnswer: "Set of features helping React apps stay responsive by adjusting rendering flows", subtopic: "Concurrent" },
        { title: "What are React Server Components (RSC)?", options: ["Components that execute and compile exclusively on the server", "Components that run inside node clusters", "APIs returning database tables", "None of the above"], correctAnswer: "Components that execute and compile exclusively on the server", subtopic: "RSC" },
        { title: "What boundary catches JavaScript errors in child component trees?", options: ["ErrorBoundary component (componentDidCatch/getDerivedStateFromError)", "try-catch block inside render()", "Window.onerror event handler", "None of the above"], correctAnswer: "ErrorBoundary component (componentDidCatch/getDerivedStateFromError)", subtopic: "Errors" },
        { title: "What is the purpose of the useDeferredValue hook?", options: ["Defers updating a value to keep search/UI input responsive", "Caches function references across renders", "Delays loading components", "None of the above"], correctAnswer: "Defers updating a value to keep search/UI input responsive", subtopic: "Hooks" },
        { title: "Which hook handles transition updates without blocking the UI thread?", options: ["useTransition", "useCallback", "useDeferredValue", "useMemo"], correctAnswer: "useTransition", subtopic: "Hooks" },
        { title: "What pattern decouples business logic from rendering in React?", options: ["Container-Presenter / Render Props / Custom Hooks", "Redux store mapping only", "Direct DOM hooks", "None of the above"], correctAnswer: "Container-Presenter / Render Props / Custom Hooks", subtopic: "Design Patterns" },
      ]
    },
    Python: {
      1: [
        { title: "Which keyword is used to declare a function in Python?", options: ["def", "function", "func", "define"], correctAnswer: "def", subtopic: "Functions" },
        { title: "How is code blocks defined in Python?", options: ["Curly braces {}", "Parentheses ()", "Indentation", "Semicolons ;"], correctAnswer: "Indentation", subtopic: "Syntax" },
        { title: "What does print() do in Python?", options: ["Outputs text/data to console", "Prints documents on paper", "Encrypts strings", "None of the above"], correctAnswer: "Outputs text/data to console", subtopic: "Basics" },
        { title: "Which data type represents true or false?", options: ["int", "float", "bool", "str"], correctAnswer: "bool", subtopic: "Types" },
        { title: "Which of the following is an empty collection in Python?", options: ["[]", "{}", "()", "All of the above"], correctAnswer: "All of the above", subtopic: "Collections" },
        { title: "Which symbol initiates a comment in Python?", options: ["//", "/*", "#", "--"], correctAnswer: "#", subtopic: "Syntax" },
      ],
      2: [
        { title: "Which built-in collection is ordered and immutable in Python?", options: ["list", "dict", "set", "tuple"], correctAnswer: "tuple", subtopic: "Tuples" },
        { title: "How do you add an element to the end of a list in Python?", options: ["append()", "add()", "push()", "insert()"], correctAnswer: "append()", subtopic: "Lists" },
        { title: "Which loop is typically used to iterate over a list in Python?", options: ["for", "while", "do-while", "foreach"], correctAnswer: "for", subtopic: "Loops" },
        { title: "What is the result of 5 // 2 in Python?", options: ["2.5", "2", "3", "0"], correctAnswer: "2", subtopic: "Operators" },
        { title: "Which dictionary method retrieves a value without raising KeyError if key is missing?", options: ["get()", "keys()", "values()", "pop()"], correctAnswer: "get()", subtopic: "Dictionaries" },
        { title: "Which operator checks if a key exists in a dictionary?", options: ["has", "in", "contains", "exists"], correctAnswer: "in", subtopic: "Dictionaries" },
      ],
      3: [
        { title: "What is a list comprehension in Python?", options: ["Compact syntax to create lists from iterable objects", "A list that understands code", "A multidimensional list", "None of the above"], correctAnswer: "Compact syntax to create lists from iterable objects", subtopic: "List Comprehension" },
        { title: "How do you open a file securely for writing in Python?", options: ["with open('file.txt', 'w') as f:", "open('file.txt', 'write')", "f = file('file.txt')", "None of the above"], correctAnswer: "with open('file.txt', 'w') as f:", subtopic: "File IO" },
        { title: "Which block catches exceptions in Python?", options: ["try", "except", "catch", "finally"], correctAnswer: "except", subtopic: "Exceptions" },
        { title: "What does the range(5) function yield?", options: ["0, 1, 2, 3, 4", "1, 2, 3, 4, 5", "0, 1, 2, 3, 4, 5", "None of the above"], correctAnswer: "0, 1, 2, 3, 4", subtopic: "Functions" },
        { title: "Which keyword defines a lambda/anonymous function?", options: ["lambda", "def", "anon", "func"], correctAnswer: "lambda", subtopic: "Functions" },
        { title: "What does the 'zip' function do in Python?", options: ["Aggregates elements from iterables into tuples", "Compresses file sizes", "Combines strings", "None of the above"], correctAnswer: "Aggregates elements from iterables into tuples", subtopic: "Functions" },
      ],
      4: [
        { title: "What is a decorator in Python?", options: ["A function that takes another function as argument and extends its behavior", "A graphical layout template", "A class attribute", "None of the above"], correctAnswer: "A function that takes another function as argument and extends its behavior", subtopic: "Decorators" },
        { title: "What is a generator function in Python?", options: ["A function containing yield that returns an iterator", "A class constructor", "A random number helper", "None of the above"], correctAnswer: "A function containing yield that returns an iterator", subtopic: "Generators" },
        { title: "What is the difference between list slice a[::2] and a[1::2]?", options: ["a[::2] takes even indexes; a[1::2] takes odd indexes", "a[::2] takes odd indexes; a[1::2] takes even indexes", "They are identical", "None of the above"], correctAnswer: "a[::2] takes even indexes; a[1::2] takes odd indexes", subtopic: "Lists" },
        { title: "What does 'self' represent in class methods?", options: ["The specific instance of the class", "The class definition itself", "The parent class", "The global context"], correctAnswer: "The specific instance of the class", subtopic: "OOP" },
        { title: "Which module checks regular expressions in Python?", options: ["regex", "re", "match", "string"], correctAnswer: "re", subtopic: "Regex" },
        { title: "What does `__init__` do in Python classes?", options: ["Acts as a constructor to initialize object attributes", "Destroys class instances", "Compiles class code", "None of the above"], correctAnswer: "Acts as a constructor to initialize object attributes", subtopic: "OOP" },
      ],
      5: [
        { title: "What is the Global Interpreter Lock (GIL) in CPython?", options: ["Mutex preventing multiple native threads from executing Python bytecodes at once", "A file lock protecting database transactions", "A security block on standard input", "None of the above"], correctAnswer: "Mutex preventing multiple native threads from executing Python bytecodes at once", subtopic: "Concurreny" },
        { title: "What is a metaclass in Python?", options: ["A class of a class that defines how a class behaves", "A parent of abstract classes", "A compiled module template", "None of the above"], correctAnswer: "A class of a class that defines how a class behaves", subtopic: "OOP" },
        { title: "Which dunder/magic method overrides the function call behavior on an object instance?", options: ["__init__", "__call__", "__repr__", "__str__"], correctAnswer: "__call__", subtopic: "Dunder" },
        { title: "What does the multiprocessing module solve that multithreading cannot in Python due to GIL?", options: ["Bypasses GIL to achieve true parallel CPU execution using separate processes", "Reduces file system I/O latency", "Speeds up socket connections", "None of the above"], correctAnswer: "Bypasses GIL to achieve true parallel CPU execution using separate processes", subtopic: "Concurrency" },
        { title: "What is method resolution order (MRO) calculated using in Python?", options: ["C3 Linearization algorithm", "Depth First Search", "Breadth First Search", "Sequential parsing"], correctAnswer: "C3 Linearization algorithm", subtopic: "OOP" },
        { title: "Which function makes a variable locally defined inside a function available globally?", options: ["global keyword", "nonlocal keyword", "globals()", "None of the above"], correctAnswer: "global keyword", subtopic: "Syntax" },
      ]
    }
  };

  // Build the complete list of 210 questions
  for (const topic of topics) {
    const topicQuestions = data[topic];
    if (!topicQuestions) continue;

    for (let difficulty = 1; difficulty <= 5; difficulty++) {
      const questionsAtDiff = topicQuestions[difficulty];
      if (!questionsAtDiff) continue;

      questionsAtDiff.forEach((qDef, idx) => {
        pool.push({
          title: qDef.title,
          description: qDef.description || "",
          type: "mcq",
          options: qDef.options,
          correctAnswer: qDef.correctAnswer,
          topic: topic,
          subtopic: qDef.subtopic || "",
          difficulty: difficulty,
          tags: [topic.toLowerCase(), (qDef.subtopic || "").toLowerCase().replace(" ", "-")],
          points: difficulty,
          timeLimit: 30 * difficulty, // E.g., 30s to 150s limit
        });
      });
    }
  }

  return pool;
}

// ── Main Seeding Function ──────────────────────────────────────────────────────

async function seed() {
  assertSafeDatabaseMutation(MONGO_URI, {
    scriptName: "seed.js",
    allowEnv: "ALLOW_DESTRUCTIVE_SEED",
    purpose: "clear and recreate seed data",
  });

  console.log(`Connecting to ${redactConnectionString(MONGO_URI)} …`);
  await mongoose.connect(MONGO_URI);
  console.log("Connected.\n");

  // Drop managed collections
  const collections = [
    User,
    Assessment,
    Competition,
    LeaderBoard,
    Coin,
    SkillSwap,
    UserProgress,
    Submission,
    Analytics,
    QuestionBank,
    Problem,
    CodingSubmission,
    ClassroomGroup,
  ];
  for (const Model of collections) {
    await Model.deleteMany({});
  }
  console.log("Cleared existing data.\n");

  // ── Question Bank ───────────────────────────────────────────────────────────
  const questionPool = buildQuestionBankPool();
  const seededQuestions = await QuestionBank.insertMany(questionPool);
  console.log(`✓ ${seededQuestions.length} questions seeded in QuestionBank\n`);

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
  const problems = await Problem.insertMany(buildProblems(admin._id));
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
      mastery: 0.82,
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
      mastery: 0.85,
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
      mastery: 0.50,
    },
  ];
  await UserProgress.insertMany(progressRecords);
  console.log(`✓ ${progressRecords.length} user progress records created\n`);

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log("─".repeat(50));
  console.log("Seed complete. You can now start the server:");
  console.log("  npm run dev");
  console.log("─".repeat(50));

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
