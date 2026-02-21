"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { getFinalScoresByDepartment, type FinalScore } from "@/lib/firestore"
import { History } from "lucide-react"

export function EvaluationHistoryPage() {
    const { user } = useAuth()
    const [scores, setScores] = useState<FinalScore[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            if (!user?.departmentId) { setLoading(false); return }
            try {
                const data = await getFinalScoresByDepartment(user.departmentId)
                setScores(data.sort((a, b) => b.academicYear.localeCompare(a.academicYear)))
            } catch (err) { console.error(err) }
            setLoading(false)
        }
        load()
    }, [user])

    if (loading) {
        return <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-16 rounded-2xl bg-card/50 animate-pulse shimmer" />)}</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Evaluation History</h2>
                <p className="text-sm text-muted-foreground mt-1">Past evaluation results for your department</p>
            </div>

            {scores.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-muted-foreground">
                    <History className="h-14 w-14 mb-3 opacity-20" />
                    <p>No past evaluations</p>
                </div>
            ) : (
                <Card className="glass-card border-border/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-secondary/30">
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Faculty</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Year</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Grade</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Submitted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scores.map(s => (
                                    <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                                        <td className="px-5 py-3.5 text-sm font-medium text-foreground">{s.facultyName}</td>
                                        <td className="px-5 py-3.5 text-sm text-muted-foreground">{s.academicYear}</td>
                                        <td className="px-5 py-3.5">
                                            <span className="font-display font-bold text-foreground">{s.totalScore}</span>
                                            <span className="text-xs text-muted-foreground">/100</span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <Badge className={`${s.grade === "A" ? "bg-accent/15 text-accent border-accent/20" : s.grade === "B" ? "bg-primary/15 text-primary border-primary/20" : s.grade === "C" ? "bg-amber-500/15 text-amber-400 border-amber-500/20" : "bg-destructive/15 text-destructive border-destructive/20"}`}>
                                                Grade {s.grade}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-muted-foreground">{new Date(s.submittedAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    )
}
