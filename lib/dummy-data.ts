export type Role = "admin" | "faculty" | "evaluator"

export interface User {
  id: string
  name: string
  email: string
  role: Role
  department?: string
  avatar?: string
}

export interface Department {
  id: string
  name: string
  hodId: string
  facultyCount: number
}

export interface Faculty {
  id: string
  name: string
  email: string
  department: string
  designation: string
  joinDate: string
  status: "active" | "on-leave" | "retired"
  evaluationStatus: "pending" | "submitted" | "under-review" | "evaluated"
  overallScore?: number
}

export interface EvaluationCriteria {
  id: string
  name: string
  description: string
  weightage: number
  category: string
}

export interface Evaluation {
  id: string
  facultyId: string
  facultyName: string
  department: string
  evaluatorId: string
  evaluatorName: string
  academicYear: string
  status: "pending" | "submitted" | "under-review" | "evaluated"
  scores: Record<string, number>
  overallScore: number
  comments: string
  submittedAt?: string
}

export const users: User[] = [
  { id: "u1", name: "Dr. Rajesh Kumar", email: "admin@university.edu", role: "admin" },
  { id: "u2", name: "Dr. Priya Sharma", email: "priya@university.edu", role: "faculty", department: "Computer Science" },
  { id: "u3", name: "Dr. Anand Patel", email: "anand@university.edu", role: "evaluator", department: "Computer Science" },
  { id: "u4", name: "Prof. Meera Nair", email: "meera@university.edu", role: "faculty", department: "Electronics" },
  { id: "u5", name: "Dr. Vikram Singh", email: "vikram@university.edu", role: "evaluator", department: "Mechanical" },
]

export const departments: Department[] = [
  { id: "d1", name: "Computer Science", hodId: "u3", facultyCount: 18 },
  { id: "d2", name: "Electronics", hodId: "u5", facultyCount: 14 },
  { id: "d3", name: "Mechanical", hodId: "u5", facultyCount: 12 },
  { id: "d4", name: "Civil Engineering", hodId: "u3", facultyCount: 10 },
  { id: "d5", name: "Mathematics", hodId: "u3", facultyCount: 8 },
]

export const faculty: Faculty[] = [
  { id: "f1", name: "Dr. Priya Sharma", email: "priya@university.edu", department: "Computer Science", designation: "Associate Professor", joinDate: "2018-06-15", status: "active", evaluationStatus: "evaluated", overallScore: 87 },
  { id: "f2", name: "Prof. Meera Nair", email: "meera@university.edu", department: "Electronics", designation: "Professor", joinDate: "2015-01-10", status: "active", evaluationStatus: "under-review", overallScore: 92 },
  { id: "f3", name: "Dr. Amit Joshi", email: "amit@university.edu", department: "Computer Science", designation: "Assistant Professor", joinDate: "2020-08-01", status: "active", evaluationStatus: "submitted", overallScore: 78 },
  { id: "f4", name: "Dr. Sunita Rao", email: "sunita@university.edu", department: "Mechanical", designation: "Associate Professor", joinDate: "2017-03-22", status: "active", evaluationStatus: "pending" },
  { id: "f5", name: "Prof. Karthik Iyer", email: "karthik@university.edu", department: "Civil Engineering", designation: "Professor", joinDate: "2012-07-05", status: "active", evaluationStatus: "evaluated", overallScore: 91 },
  { id: "f6", name: "Dr. Neha Gupta", email: "neha@university.edu", department: "Mathematics", designation: "Assistant Professor", joinDate: "2021-01-12", status: "active", evaluationStatus: "pending" },
  { id: "f7", name: "Dr. Rohit Menon", email: "rohit@university.edu", department: "Electronics", designation: "Associate Professor", joinDate: "2016-11-08", status: "on-leave", evaluationStatus: "evaluated", overallScore: 84 },
  { id: "f8", name: "Prof. Lakshmi Devi", email: "lakshmi@university.edu", department: "Computer Science", designation: "Professor", joinDate: "2010-04-18", status: "active", evaluationStatus: "evaluated", overallScore: 95 },
]

export const evaluationCriteria: EvaluationCriteria[] = [
  { id: "c1", name: "Teaching Quality", description: "Quality of classroom teaching and pedagogy", weightage: 25, category: "Teaching" },
  { id: "c2", name: "Research Output", description: "Published papers, patents, and research grants", weightage: 20, category: "Research" },
  { id: "c3", name: "API Score", description: "Academic Performance Indicator", weightage: 15, category: "Academic" },
  { id: "c4", name: "Publications", description: "Journal and conference publications", weightage: 15, category: "Research" },
  { id: "c5", name: "Attendance", description: "Regularity and punctuality", weightage: 10, category: "General" },
  { id: "c6", name: "Student Feedback", description: "Feedback scores from students", weightage: 15, category: "Teaching" },
]

export const evaluations: Evaluation[] = [
  { id: "e1", facultyId: "f1", facultyName: "Dr. Priya Sharma", department: "Computer Science", evaluatorId: "u3", evaluatorName: "Dr. Anand Patel", academicYear: "2024-25", status: "evaluated", scores: { c1: 88, c2: 85, c3: 90, c4: 82, c5: 95, c6: 87 }, overallScore: 87, comments: "Excellent teaching skills with consistent research output.", submittedAt: "2025-01-15" },
  { id: "e2", facultyId: "f2", facultyName: "Prof. Meera Nair", department: "Electronics", evaluatorId: "u5", evaluatorName: "Dr. Vikram Singh", academicYear: "2024-25", status: "under-review", scores: { c1: 94, c2: 90, c3: 92, c4: 88, c5: 90, c6: 95 }, overallScore: 92, comments: "Outstanding performance across all criteria." },
  { id: "e3", facultyId: "f3", facultyName: "Dr. Amit Joshi", department: "Computer Science", evaluatorId: "u3", evaluatorName: "Dr. Anand Patel", academicYear: "2024-25", status: "submitted", scores: { c1: 75, c2: 78, c3: 80, c4: 72, c5: 85, c6: 78 }, overallScore: 78, comments: "Good potential, needs improvement in research." },
  { id: "e4", facultyId: "f5", facultyName: "Prof. Karthik Iyer", department: "Civil Engineering", evaluatorId: "u3", evaluatorName: "Dr. Anand Patel", academicYear: "2024-25", status: "evaluated", scores: { c1: 92, c2: 88, c3: 94, c4: 90, c5: 90, c6: 92 }, overallScore: 91, comments: "Exceptional faculty with great leadership.", submittedAt: "2025-01-20" },
  { id: "e5", facultyId: "f8", facultyName: "Prof. Lakshmi Devi", department: "Computer Science", evaluatorId: "u3", evaluatorName: "Dr. Anand Patel", academicYear: "2024-25", status: "evaluated", scores: { c1: 96, c2: 95, c3: 94, c4: 93, c5: 98, c6: 95 }, overallScore: 95, comments: "Best faculty in the department.", submittedAt: "2025-02-01" },
]

export const departmentStats = [
  { department: "Computer Science", avgScore: 87, facultyCount: 18, evaluated: 14 },
  { department: "Electronics", avgScore: 88, facultyCount: 14, evaluated: 11 },
  { department: "Mechanical", avgScore: 82, facultyCount: 12, evaluated: 9 },
  { department: "Civil Engineering", avgScore: 85, facultyCount: 10, evaluated: 8 },
  { department: "Mathematics", avgScore: 80, facultyCount: 8, evaluated: 5 },
]

export const yearlyTrends = [
  { year: "2020-21", avgScore: 78 },
  { year: "2021-22", avgScore: 80 },
  { year: "2022-23", avgScore: 83 },
  { year: "2023-24", avgScore: 85 },
  { year: "2024-25", avgScore: 87 },
]

// Dummy API simulation functions
export async function simulateApiCall<T>(data: T, delay = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay))
}

export async function loginUser(email: string, _password: string, role: Role): Promise<User | null> {
  const user = users.find((u) => u.email === email && u.role === role)
  return simulateApiCall(user ?? null, 800)
}

export async function getFaculty(): Promise<Faculty[]> {
  return simulateApiCall(faculty)
}

export async function getDepartments(): Promise<Department[]> {
  return simulateApiCall(departments)
}

export async function getEvaluations(): Promise<Evaluation[]> {
  return simulateApiCall(evaluations)
}

export async function getCriteria(): Promise<EvaluationCriteria[]> {
  return simulateApiCall(evaluationCriteria)
}
