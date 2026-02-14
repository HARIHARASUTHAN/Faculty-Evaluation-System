import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import User from "./models/User.js";
import Department from "./models/Department.js";
import Criteria from "./models/Criteria.js";
import Evaluation from "./models/Evaluation.js";
import SelfEvaluation from "./models/SelfEvaluation.js";

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), ".env") });

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Department.deleteMany({});
    await Criteria.deleteMany({});
    await Evaluation.deleteMany({});
    await SelfEvaluation.deleteMany({});
    console.log("Cleared existing data");

    // Create Users
    const users = await User.create([
      { name: "Dr. Rajesh Kumar", email: "admin@university.edu", password: "admin123", role: "admin" },
      { name: "Dr. Priya Sharma", email: "priya@university.edu", password: "faculty123", role: "faculty", department: "Computer Science" },
      { name: "Dr. Anand Patel", email: "anand@university.edu", password: "evaluator123", role: "evaluator", department: "Computer Science" },
      { name: "Prof. Meera Nair", email: "meera@university.edu", password: "faculty123", role: "faculty", department: "Electronics" },
      { name: "Dr. Vikram Singh", email: "vikram@university.edu", password: "evaluator123", role: "evaluator", department: "Mechanical" },
      { name: "Dr. Amit Joshi", email: "amit@university.edu", password: "faculty123", role: "faculty", department: "Computer Science" },
      { name: "Dr. Sunita Rao", email: "sunita@university.edu", password: "faculty123", role: "faculty", department: "Mechanical" },
      { name: "Prof. Karthik Iyer", email: "karthik@university.edu", password: "faculty123", role: "faculty", department: "Civil Engineering" },
      { name: "Dr. Neha Gupta", email: "neha@university.edu", password: "faculty123", role: "faculty", department: "Mathematics" },
      { name: "Dr. Rohit Menon", email: "rohit@university.edu", password: "faculty123", role: "faculty", department: "Electronics" },
      { name: "Prof. Lakshmi Devi", email: "lakshmi@university.edu", password: "faculty123", role: "faculty", department: "Computer Science" },
    ]);
    console.log(`Created ${users.length} users`);

    // Create Departments
    const departments = await Department.create([
      { departmentName: "Computer Science", hodId: users[2]._id, facultyCount: 18 },
      { departmentName: "Electronics", hodId: users[4]._id, facultyCount: 14 },
      { departmentName: "Mechanical", hodId: users[4]._id, facultyCount: 12 },
      { departmentName: "Civil Engineering", hodId: users[2]._id, facultyCount: 10 },
      { departmentName: "Mathematics", hodId: users[2]._id, facultyCount: 8 },
    ]);
    console.log(`Created ${departments.length} departments`);

    // Create Criteria
    const criteria = await Criteria.create([
      { title: "Teaching Quality", description: "Quality of classroom teaching and pedagogy", weightage: 25, category: "Teaching" },
      { title: "Research Output", description: "Published papers, patents, and research grants", weightage: 20, category: "Research" },
      { title: "API Score", description: "Academic Performance Indicator", weightage: 15, category: "Academic" },
      { title: "Publications", description: "Journal and conference publications", weightage: 15, category: "Research" },
      { title: "Attendance", description: "Regularity and punctuality", weightage: 10, category: "General" },
      { title: "Student Feedback", description: "Feedback scores from students", weightage: 15, category: "Teaching" },
    ]);
    console.log(`Created ${criteria.length} criteria`);

    // Create Evaluations (assignments and completed evaluations)
    const priya = users[1];   // faculty
    const meera = users[3];   // faculty
    const amit = users[5];    // faculty
    const karthik = users[7]; // faculty
    const lakshmi = users[10]; // faculty
    const anand = users[2];   // evaluator
    const vikram = users[4];  // evaluator

    const evaluations = await Evaluation.create([
      {
        facultyId: priya._id,
        evaluatorId: anand._id,
        academicYear: "2024-25",
        status: "evaluated",
        scores: new Map([
          [criteria[0]._id.toString(), 88],
          [criteria[1]._id.toString(), 85],
          [criteria[2]._id.toString(), 90],
          [criteria[3]._id.toString(), 82],
          [criteria[4]._id.toString(), 95],
          [criteria[5]._id.toString(), 87],
        ]),
        finalScore: 87,
        comments: "Excellent teaching skills with consistent research output.",
        submittedAt: new Date("2025-01-15"),
      },
      {
        facultyId: meera._id,
        evaluatorId: vikram._id,
        academicYear: "2024-25",
        status: "under-review",
        scores: new Map([
          [criteria[0]._id.toString(), 94],
          [criteria[1]._id.toString(), 90],
          [criteria[2]._id.toString(), 92],
          [criteria[3]._id.toString(), 88],
          [criteria[4]._id.toString(), 90],
          [criteria[5]._id.toString(), 95],
        ]),
        finalScore: 92,
        comments: "Outstanding performance across all criteria.",
      },
      {
        facultyId: amit._id,
        evaluatorId: anand._id,
        academicYear: "2024-25",
        status: "submitted",
        scores: new Map([
          [criteria[0]._id.toString(), 75],
          [criteria[1]._id.toString(), 78],
          [criteria[2]._id.toString(), 80],
          [criteria[3]._id.toString(), 72],
          [criteria[4]._id.toString(), 85],
          [criteria[5]._id.toString(), 78],
        ]),
        finalScore: 78,
        comments: "Good potential, needs improvement in research.",
      },
      {
        facultyId: karthik._id,
        evaluatorId: anand._id,
        academicYear: "2024-25",
        status: "evaluated",
        scores: new Map([
          [criteria[0]._id.toString(), 92],
          [criteria[1]._id.toString(), 88],
          [criteria[2]._id.toString(), 94],
          [criteria[3]._id.toString(), 90],
          [criteria[4]._id.toString(), 90],
          [criteria[5]._id.toString(), 92],
        ]),
        finalScore: 91,
        comments: "Exceptional faculty with great leadership.",
        submittedAt: new Date("2025-01-20"),
      },
      {
        facultyId: lakshmi._id,
        evaluatorId: anand._id,
        academicYear: "2024-25",
        status: "evaluated",
        scores: new Map([
          [criteria[0]._id.toString(), 96],
          [criteria[1]._id.toString(), 95],
          [criteria[2]._id.toString(), 94],
          [criteria[3]._id.toString(), 93],
          [criteria[4]._id.toString(), 98],
          [criteria[5]._id.toString(), 95],
        ]),
        finalScore: 95,
        comments: "Best faculty in the department.",
        submittedAt: new Date("2025-02-01"),
      },
    ]);
    console.log(`Created ${evaluations.length} evaluations`);

    // Create Self Evaluations
    const selfEvaluations = await SelfEvaluation.create([
      {
        facultyId: priya._id,
        academicYear: "2024-25",
        answers: {
          teachingHours: 16,
          researchPapers: 3,
          conferences: 2,
          achievements: "Published in IEEE Transactions. Mentored 5 PhD students.",
        },
        status: "evaluated",
      },
      {
        facultyId: amit._id,
        academicYear: "2024-25",
        answers: {
          teachingHours: 14,
          researchPapers: 1,
          conferences: 1,
          achievements: "Completed AI/ML certification. Started research on NLP.",
        },
        status: "under_review",
      },
    ]);
    console.log(`Created ${selfEvaluations.length} self-evaluations`);

    console.log("\nSeed completed successfully!");
    console.log("\n--- Login Credentials ---");
    console.log("Admin:     admin@university.edu / admin123");
    console.log("Faculty:   priya@university.edu / faculty123");
    console.log("Evaluator: anand@university.edu / evaluator123");

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

seedDatabase();
