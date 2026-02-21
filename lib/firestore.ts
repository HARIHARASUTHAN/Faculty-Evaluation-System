import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    type DocumentData,
    Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"

// ─── KPI Categories with Weightage ────────────────────────────
export const KPI_CATEGORIES = [
    { id: "research-publications", name: "Research Publications", weightage: 30 },
    { id: "conferences-proceedings", name: "Conferences / Proceedings", weightage: 15 },
    { id: "fdp-workshops", name: "FDP / Workshops", weightage: 10 },
    { id: "teaching-excellence", name: "Teaching Excellence Certificates", weightage: 15 },
    { id: "patents-innovation", name: "Patents / Innovation", weightage: 15 },
    { id: "admin-contribution", name: "Administrative Contribution", weightage: 15 },
] as const

export type KPICategoryId = typeof KPI_CATEGORIES[number]["id"]

// ─── Grade Calculation ──────────────────────────────────────
export function calculateGrade(score: number): string {
    if (score >= 85) return "A"
    if (score >= 70) return "B"
    if (score >= 50) return "C"
    return "D"
}

export function gradeColor(grade: string): string {
    switch (grade) {
        case "A": return "text-accent"
        case "B": return "text-primary"
        case "C": return "text-chart-3"
        case "D": return "text-destructive"
        default: return "text-muted-foreground"
    }
}

// ─── Types (Firestore Schema) ───────────────────────────────
export interface Department {
    id: string
    departmentName: string
    hodId: string
    hodName: string
    createdAt?: unknown
}

export interface UserProfile {
    id: string
    name: string
    email: string
    role: "admin" | "hod" | "faculty"
    departmentId: string
    departmentName: string
    avatar?: string
    status: "active" | "inactive"
    createdAt?: string
}

export interface FacultyDocument {
    id: string
    facultyId: string
    facultyName: string
    departmentId: string
    departmentName: string
    category: KPICategoryId
    categoryName: string
    fileName: string
    originalName: string
    filePath: string
    fileSize: number
    description: string
    uploadedAt: string
    status: "pending" | "approved" | "rejected"
    rejectionReason?: string
    academicYear: string
}

export interface DocumentEvaluation {
    id: string
    documentId: string
    hodId: string
    hodName: string
    score: number // 1-5
    remarks: string
    evaluatedAt: string
}

export interface FinalScore {
    id: string
    facultyId: string
    facultyName: string
    departmentId: string
    departmentName: string
    academicYear: string
    categoryScores: Record<KPICategoryId, { avgScore: number; weightedScore: number; docCount: number }>
    totalScore: number
    grade: string
    submittedAt: string
    hodId: string
    hodName: string
}

export interface EvaluationCycle {
    id: string
    academicYear: string
    status: "active" | "locked" | "inactive"
    startDate: string
    endDate: string
    createdBy: string
    createdAt?: unknown
}

export interface AuditLog {
    id: string
    userId: string
    userName: string
    action: string
    details: string
    timestamp: string
}

// ─── Department CRUD ────────────────────────────────────────
export async function getDepartments(): Promise<Department[]> {
    const snapshot = await getDocs(collection(db, "departments"))
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Department))
}

export async function addDepartment(data: Omit<Department, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "departments"), {
        ...data,
        createdAt: serverTimestamp(),
    })
    return docRef.id
}

export async function updateDepartment(id: string, data: Partial<Department>): Promise<void> {
    await updateDoc(doc(db, "departments", id), data as DocumentData)
}

export async function deleteDepartment(id: string): Promise<void> {
    await deleteDoc(doc(db, "departments", id))
}

// ─── User CRUD ──────────────────────────────────────────────
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const userDoc = await getDoc(doc(db, "users", uid))
    if (userDoc.exists()) return { id: userDoc.id, ...userDoc.data() } as UserProfile
    return null
}

export async function updateUserProfile(uid: string, data: Record<string, unknown>): Promise<void> {
    await setDoc(doc(db, "users", uid), data, { merge: true })
}

export async function getAllUsers(): Promise<UserProfile[]> {
    const snapshot = await getDocs(collection(db, "users"))
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as UserProfile))
}

export async function getUsersByRole(role: string): Promise<UserProfile[]> {
    const q = query(collection(db, "users"), where("role", "==", role))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as UserProfile))
}

export async function getUsersByDepartment(departmentId: string): Promise<UserProfile[]> {
    const q = query(collection(db, "users"), where("departmentId", "==", departmentId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as UserProfile))
}

export async function getFacultyByDepartment(departmentId: string): Promise<UserProfile[]> {
    const q = query(
        collection(db, "users"),
        where("departmentId", "==", departmentId),
        where("role", "==", "faculty")
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as UserProfile))
}

export async function createUserProfile(uid: string, data: Omit<UserProfile, "id">): Promise<void> {
    await setDoc(doc(db, "users", uid), { ...data, createdAt: new Date().toISOString() })
}

export async function deleteUserProfile(uid: string): Promise<void> {
    await deleteDoc(doc(db, "users", uid))
}

// ─── Faculty Document CRUD ──────────────────────────────────
export async function getDocuments(): Promise<FacultyDocument[]> {
    const snapshot = await getDocs(collection(db, "documents"))
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FacultyDocument))
}

export async function getDocumentsByFaculty(facultyId: string): Promise<FacultyDocument[]> {
    const q = query(collection(db, "documents"), where("facultyId", "==", facultyId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FacultyDocument))
}

export async function getDocumentsByDepartment(departmentId: string): Promise<FacultyDocument[]> {
    const q = query(collection(db, "documents"), where("departmentId", "==", departmentId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FacultyDocument))
}

export async function getDocumentsByFacultyAndYear(facultyId: string, academicYear: string): Promise<FacultyDocument[]> {
    const q = query(
        collection(db, "documents"),
        where("facultyId", "==", facultyId),
        where("academicYear", "==", academicYear)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FacultyDocument))
}

export async function addDocument(data: Omit<FacultyDocument, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "documents"), data)
    return docRef.id
}

export async function updateDocument(id: string, data: Partial<FacultyDocument>): Promise<void> {
    await updateDoc(doc(db, "documents", id), data as DocumentData)
}

export async function deleteDocument(id: string): Promise<void> {
    await deleteDoc(doc(db, "documents", id))
}

// ─── Document Evaluation CRUD ───────────────────────────────
export async function getDocumentEvaluations(documentId: string): Promise<DocumentEvaluation[]> {
    const q = query(collection(db, "documentEvaluations"), where("documentId", "==", documentId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as DocumentEvaluation))
}

export async function addDocumentEvaluation(data: Omit<DocumentEvaluation, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "documentEvaluations"), data)
    return docRef.id
}

export async function getEvaluationsByHod(hodId: string): Promise<DocumentEvaluation[]> {
    const q = query(collection(db, "documentEvaluations"), where("hodId", "==", hodId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as DocumentEvaluation))
}

// ─── Final Score CRUD ───────────────────────────────────────
export async function getFinalScores(): Promise<FinalScore[]> {
    const snapshot = await getDocs(collection(db, "finalScores"))
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FinalScore))
}

export async function getFinalScoreByFaculty(facultyId: string, academicYear: string): Promise<FinalScore | null> {
    const q = query(
        collection(db, "finalScores"),
        where("facultyId", "==", facultyId),
        where("academicYear", "==", academicYear)
    )
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    const d = snapshot.docs[0]
    return { id: d.id, ...d.data() } as FinalScore
}

export async function getFinalScoresByFaculty(facultyId: string): Promise<FinalScore[]> {
    const q = query(collection(db, "finalScores"), where("facultyId", "==", facultyId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FinalScore))
}

export async function getFinalScoresByDepartment(departmentId: string): Promise<FinalScore[]> {
    const q = query(collection(db, "finalScores"), where("departmentId", "==", departmentId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FinalScore))
}

export async function addFinalScore(data: Omit<FinalScore, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "finalScores"), data)
    return docRef.id
}

export async function updateFinalScore(id: string, data: Partial<FinalScore>): Promise<void> {
    await updateDoc(doc(db, "finalScores", id), data as DocumentData)
}

// ─── Evaluation Cycle CRUD ──────────────────────────────────
export async function getEvaluationCycles(): Promise<EvaluationCycle[]> {
    const snapshot = await getDocs(collection(db, "evaluationCycles"))
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as EvaluationCycle))
}

export async function getActiveCycle(): Promise<EvaluationCycle | null> {
    const q = query(collection(db, "evaluationCycles"), where("status", "==", "active"))
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    const d = snapshot.docs[0]
    return { id: d.id, ...d.data() } as EvaluationCycle
}

export async function addEvaluationCycle(data: Omit<EvaluationCycle, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "evaluationCycles"), {
        ...data,
        createdAt: serverTimestamp(),
    })
    return docRef.id
}

export async function updateEvaluationCycle(id: string, data: Partial<EvaluationCycle>): Promise<void> {
    await updateDoc(doc(db, "evaluationCycles", id), data as DocumentData)
}

// ─── Audit Log ──────────────────────────────────────────────
export async function addAuditLog(data: Omit<AuditLog, "id">): Promise<void> {
    await addDoc(collection(db, "auditLogs"), data)
}

export async function getAuditLogs(): Promise<AuditLog[]> {
    const snapshot = await getDocs(collection(db, "auditLogs"))
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLog))
}

// ─── Dashboard Stats ────────────────────────────────────────
export async function getAdminDashboardStats() {
    const [usersSnap, deptSnap, docsSnap, scoresSnap, cyclesSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "departments")),
        getDocs(collection(db, "documents")),
        getDocs(collection(db, "finalScores")),
        getDocs(collection(db, "evaluationCycles")),
    ])

    const users = usersSnap.docs.map(d => d.data())
    const totalFaculty = users.filter(u => u.role === "faculty").length
    const totalHod = users.filter(u => u.role === "hod").length
    const totalDepts = deptSnap.size
    const totalDocs = docsSnap.size
    const pendingDocs = docsSnap.docs.filter(d => d.data().status === "pending").length
    const approvedDocs = docsSnap.docs.filter(d => d.data().status === "approved").length
    const rejectedDocs = docsSnap.docs.filter(d => d.data().status === "rejected").length

    const scores = scoresSnap.docs.map(d => d.data())
    const avgScore = scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + (s.totalScore || 0), 0) / scores.length * 10) / 10
        : 0

    const activeCycle = cyclesSnap.docs.find(d => d.data().status === "active")

    return {
        totalFaculty,
        totalHod,
        totalDepts,
        totalDocs,
        pendingDocs,
        approvedDocs,
        rejectedDocs,
        avgScore,
        activeCycleYear: activeCycle ? activeCycle.data().academicYear : "None",
    }
}

// ─── Weighted Score Calculation ─────────────────────────────
export function calculateWeightedScores(
    documents: FacultyDocument[],
    evaluations: DocumentEvaluation[]
): { categoryScores: Record<string, { avgScore: number; weightedScore: number; docCount: number }>; totalScore: number } {
    const evalMap = new Map<string, DocumentEvaluation[]>()
    evaluations.forEach(ev => {
        const arr = evalMap.get(ev.documentId) || []
        arr.push(ev)
        evalMap.set(ev.documentId, arr)
    })

    const categoryScores: Record<string, { avgScore: number; weightedScore: number; docCount: number }> = {}

    KPI_CATEGORIES.forEach(cat => {
        const categoryDocs = documents.filter(d => d.category === cat.id && d.status === "approved")
        const docScores: number[] = []
        categoryDocs.forEach(doc => {
            const docEvals = evalMap.get(doc.id)
            if (docEvals && docEvals.length > 0) {
                const avgDocScore = docEvals.reduce((s, e) => s + e.score, 0) / docEvals.length
                docScores.push(avgDocScore)
            }
        })

        const avgScore = docScores.length > 0
            ? docScores.reduce((s, v) => s + v, 0) / docScores.length
            : 0
        // Normalize 1-5 scale to 0-100, then apply weightage
        const normalizedScore = (avgScore / 5) * 100
        const weightedScore = (normalizedScore * cat.weightage) / 100

        categoryScores[cat.id] = { avgScore: Math.round(avgScore * 10) / 10, weightedScore: Math.round(weightedScore * 10) / 10, docCount: docScores.length }
    })

    const totalScore = Math.round(
        Object.values(categoryScores).reduce((sum, cs) => sum + cs.weightedScore, 0) * 10
    ) / 10

    return { categoryScores, totalScore }
}
