"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import {
    getFacultyByDepartment, getDocumentsByDepartment, getEvaluationsByHod, getActiveCycle,
    calculateWeightedScores, calculateGrade, addFinalScore, addAuditLog,
    KPI_CATEGORIES, type UserProfile, type FacultyDocument, type DocumentEvaluation, type EvaluationCycle
} from "@/lib/firestore"
import { Send, Loader2, User, TrendingUp, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export function HodFinalEvaluationPage() {
    const { user } = useAuth()
    const [faculty, setFaculty] = useState<UserProfile[]>([])
    const [docs, setDocs] = useState<FacultyDocument[]>([])
    const [evals, setEvals] = useState<DocumentEvaluation[]>([])
    const [activeCycle, setActiveCycle] = useState<EvaluationCycle | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState<string | null>(null)
    const [submitted, setSubmitted] = useState<Set<string>>(new Set())

    useEffect(() => {
        async function load() {
            if (!user?.departmentId) { setLoading(false); return }
            try {
                const [f, d, e, c] = await Promise.all([
                    getFacultyByDepartment(user.departmentId),
                    getDocumentsByDepartment(user.departmentId),
                    getEvaluationsByHod(user.uid),
                    getActiveCycle(),
                ])
                setFaculty(f)
                setDocs(d)
                setEvals(e)
                setActiveCycle(c)
            } catch (err) { console.error(err) }
            setLoading(false)
        }
        load()
    }, [user])

    async function handleSubmitFinal(f: UserProfile) {
        if (!user || !activeCycle) return
        setSubmitting(f.id)
        try {
            const facultyDocs = docs.filter(d => d.facultyId === f.id && d.academicYear === activeCycle.academicYear)
            const { categoryScores, totalScore } = calculateWeightedScores(facultyDocs, evals)
            const grade = calculateGrade(totalScore)

            await addFinalScore({
                facultyId: f.id,
                facultyName: f.name,
                departmentId: user.departmentId || "",
                departmentName: user.departmentName || "",
                academicYear: activeCycle.academicYear,
                categoryScores: categoryScores as any,
                totalScore,
                grade,
                submittedAt: new Date().toISOString(),
                hodId: user.uid,
                hodName: user.name,
            })
            await addAuditLog({
                userId: user.uid, userName: user.name,
                action: "Final Evaluation Submitted",
                details: `${f.name}: Score ${totalScore}/100, Grade ${grade}`,
                timestamp: new Date().toISOString(),
            })
            toast.success(`Final evaluation submitted: ${f.name} — ${totalScore}/100 (Grade ${grade})`)
            setSubmitted(prev => new Set([...prev, f.id]))
        } catch (err) { toast.error("Failed to submit") }
        setSubmitting(null)
    }

    if (loading) {
        return <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-32 rounded-2xl bg-card/50 animate-pulse shimmer" />)}</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Final Evaluation</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Calculate and submit final scores for {activeCycle?.academicYear || "—"}
                </p>
            </div>

            {!activeCycle ? (
                <Card className="glass-card border-amber-500/20">
                    <CardContent className="p-5 text-center text-muted-foreground">
                        No active evaluation cycle. Ask the admin to activate one.
                    </CardContent>
                </Card>
            ) : faculty.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-muted-foreground">
                    <User className="h-14 w-14 mb-3 opacity-20" />
                    <p>No faculty in your department</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {faculty.map((f, i) => {
                        const facultyDocs = docs.filter(d => d.facultyId === f.id && d.academicYear === activeCycle.academicYear)
                        const { categoryScores, totalScore } = calculateWeightedScores(facultyDocs, evals)
                        const grade = calculateGrade(totalScore)
                        const isSubmitted = submitted.has(f.id)

                        return (
                            <Card key={f.id} className={`glass-card border-border/50 animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between flex-wrap gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                                <User className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-display text-lg font-bold text-foreground">{f.name}</p>
                                                <p className="text-xs text-muted-foreground">{f.email} • {facultyDocs.length} documents</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-display text-3xl font-bold text-foreground">{totalScore}<span className="text-sm text-muted-foreground">/100</span></p>
                                            <p className={`text-sm font-bold ${grade === "A" ? "text-accent" : grade === "B" ? "text-primary" : grade === "C" ? "text-amber-400" : "text-destructive"}`}>
                                                Grade {grade}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Category breakdown */}
                                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {KPI_CATEGORIES.map(cat => {
                                            const cs = categoryScores[cat.id] || { avgScore: 0, weightedScore: 0, docCount: 0 }
                                            return (
                                                <div key={cat.id} className="rounded-lg bg-secondary/30 p-2.5">
                                                    <p className="text-[10px] text-muted-foreground truncate">{cat.name}</p>
                                                    <p className="font-display text-sm font-bold text-foreground">
                                                        {cs.weightedScore}<span className="text-[10px] text-muted-foreground">/{cat.weightage}</span>
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground">{cs.docCount} doc(s), avg {cs.avgScore}/5</p>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        {isSubmitted ? (
                                            <div className="flex items-center gap-2 text-accent text-sm">
                                                <CheckCircle className="h-4 w-4" /> Submitted
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() => handleSubmitFinal(f)}
                                                disabled={submitting === f.id}
                                                className="bg-gradient-to-r from-primary to-blue-500 hover:opacity-90"
                                            >
                                                {submitting === f.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
                                                Submit Final Evaluation
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
